import React, { useState, useEffect, useRef } from 'react';
import { Box, AppBar, Toolbar, Typography, Drawer, Avatar, TextField, List, ListItem, ListItemAvatar, ListItemText, Paper, Button, Menu, MenuItem, IconButton, ListItemIcon, Dialog, DialogContent, Divider } from '@mui/material';
import { Send as SendIcon, AccountCircle, Logout, Settings, Chat as ChatIcon, Person, Close, Favorite, FavoriteBorder, Email } from '@mui/icons-material';
import ProfileMenu from './ProfileMenu';
import axios from '../utils/axios';
import { socket, initializeSocket } from '../services/socketService';
import { useNavigate } from 'react-router-dom';
import Profile from './Profile';
import MessageInput from './MessageInput';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const DRAWER_WIDTH = 280;

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { logout, user: currentUser } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [likedMessages, setLikedMessages] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    if (currentUser?._id) {
      initializeSocket(currentUser._id);

      // Listen for new messages
      socket.on('new_message', (message) => {
        if (message.senderId._id === selectedUser._id || 
            message.senderId._id === currentUser._id) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
          
          // Show notification for incoming messages
          if (message.senderId._id === selectedUser._id) {
            toast.info(`${selectedUser.name}: ${message.content}`, {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }
        }
      });

      // Listen for message updates (likes)
      socket.on('message_updated', (updatedMessage) => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === updatedMessage._id ? updatedMessage : msg
          )
        );
      });

      return () => {
        socket.off('new_message');
        socket.off('message_updated');
      };
    }
  }, [currentUser, selectedUser]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        const filteredUsers = response.data.filter(user => user._id !== currentUser?._id);
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [currentUser?._id]);

  // Fetch messages when selecting a user
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser?._id) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`/api/messages/${selectedUser._id}`);
        setMessages(response.data);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content, image = null) => {
    try {
      if (image) {
        const response = await axios.post('/api/messages/image', {
          receiverId: selectedUser._id,
          content,
          image
        });
        socket.emit('send_message', response.data);
      } else {
        const response = await axios.post('/api/messages', {
          receiverId: selectedUser._id,
          content
        });
        socket.emit('send_message', response.data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      throw error; // Propagate error to MessageInput component
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    setProfileOpen(true);
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleLikeMessage = async (messageId) => {
    try {
      // Optimistic update
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === messageId
            ? { ...msg, isLiked: !msg.isLiked }
            : msg
        )
      );

      const response = await axios.post(`/api/messages/${messageId}/like`);
      
      // Emit socket event for real-time update
      socket.emit('message_like', {
        messageId,
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        message: response.data
      });
    } catch (error) {
      console.error('Error liking message:', error);
      toast.error('Failed to update like');
      
      // Revert optimistic update on error
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === messageId
            ? { ...msg, isLiked: !msg.isLiked }
            : msg
        )
      );
    }
  };

  const renderMessage = (message) => {
    const isCurrentUser = message.senderId._id === currentUser._id;

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    };

    return (
      <Box
        key={message._id}
        sx={{
          display: 'flex',
          justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
          mb: 3,  // Increased bottom margin to accommodate timestamp
          gap: 1,
        }}
      >
        {!isCurrentUser && (
          <Avatar
            sx={{
              width: 35,
              height: 35,
              border: '2px solid #333333',
              bgcolor: '#FF6347',
              color: '#000000',
              fontWeight: 'bold'
            }}
          >
            {message.senderId.name?.charAt(0)}
          </Avatar>
        )}

        <Box
          sx={{
            position: 'relative',
            minWidth: '80px',  // Ensure minimum width for very short messages
          }}
        >
          <Box
            sx={{
              bgcolor: isCurrentUser ? '#FF6347' : '#1a1a1a',
              color: isCurrentUser ? '#000000' : '#FFFFFF',
              p: 2,
              borderRadius: 2,
              position: 'relative',
              wordBreak: 'break-word',
            }}
            onDoubleClick={() => handleLikeMessage(message._id)}
          >
            {message.messageType === 'image' && (
              <Box 
                sx={{ 
                  mb: message.content ? 1 : 0,
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.9
                  }
                }}
                onClick={() => setSelectedImage(message.imageUrl)}
              >
                <img
                  src={message.imageUrl}
                  alt="Shared"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 300,
                    borderRadius: 8,
                    display: 'block'
                  }}
                />
              </Box>
            )}
            
            {message.content && (
              <Typography variant="body1">
                {message.content}
              </Typography>
            )}

            {message.isLiked && (
              <Box
                sx={{
                  position: 'absolute',
                  right: -10,
                  bottom: -10,
                  backgroundColor: '#FF6347',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}
              >
                <Favorite sx={{ fontSize: 14, color: '#000000' }} />
              </Box>
            )}
          </Box>

          {/* Timestamp below message */}
          <Typography
            variant="caption"
            sx={{
              color: '#888888',
              fontSize: '0.75rem',
              position: 'absolute',
              right: isCurrentUser ? 0 : 'auto',
              left: isCurrentUser ? 'auto' : 0,
              bottom: -20,
              whiteSpace: 'nowrap',
            }}
          >
            {formatTime(message.createdAt)}
          </Typography>
        </Box>

        {isCurrentUser && (
          <Avatar
            sx={{
              width: 35,
              height: 35,
              border: '2px solid #333333',
              bgcolor: '#FF6347',
              color: '#000000',
              fontWeight: 'bold'
            }}
          >
            {currentUser.name?.charAt(0)}
          </Avatar>
        )}
      </Box>
    );
  };

  // Users list with only initials
  const renderUsersList = () => (
    <List sx={{ overflow: 'auto', py: 0 }}>
      {users.map((user) => (
        <ListItem
          key={user._id}
          onClick={() => setSelectedUser(user)}
          sx={{
            cursor: 'pointer',
            transition: 'all 0.2s',
            borderBottom: '1px solid #333333',
            bgcolor: selectedUser?._id === user._id ? 'rgba(255, 99, 71, 0.1)' : 'transparent',
            '&:hover': {
              bgcolor: 'rgba(255, 99, 71, 0.1)',
            },
          }}
        >
          <ListItemAvatar>
            <Avatar 
              sx={{ 
                width: 40,
                height: 40,
                bgcolor: '#FF6347',
                border: '2px solid #333333',
                color: '#000000',
                fontWeight: 'bold'
              }}
            >
              {user.name?.charAt(0)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={user.name}
            secondary={user.email}
            primaryTypographyProps={{
              color: '#FFFFFF',
              fontWeight: selectedUser?._id === user._id ? 'medium' : 'regular'
            }}
            secondaryTypographyProps={{
              color: '#888888'
            }}
          />
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#111111' }}>
      {/* Left Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#111111',
            borderRight: '1px solid #333333',
          },
        }}
      >
        {/* Header with Text Logo */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #333333',
            bgcolor: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ChatIcon sx={{ mr: 1, fontSize: 28, color: '#FF6347' }} />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold',
                letterSpacing: 1,
                fontFamily: "'Poppins', sans-serif",
                userSelect: 'none',
                color: '#FFFFFF'
              }}
            >
              Chatify
            </Typography>
          </Box>

          <Avatar 
            onClick={handleMenuClick}
            sx={{ 
              width: 40,
              height: 40,
              bgcolor: '#FF6347',
              border: '2px solid #333333',
              color: '#000000',
              fontWeight: 'bold',
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.9
              }
            }}
          >
            {currentUser?.name?.charAt(0)}
          </Avatar>
        </Box>

        {/* Users List */}
        {renderUsersList()}
      </Drawer>

      {/* Main Chat Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedUser ? (
          <>
            <AppBar position="static" sx={{ bgcolor: '#1a1a1a', borderBottom: '1px solid #333333' }}>
              <Toolbar>
                <Avatar sx={{ 
                  mr: 2, 
                  bgcolor: '#FF6347',
                  border: '2px solid #333333'
                }}>
                  {selectedUser.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" color="#FFFFFF">{selectedUser.name}</Typography>
                  <Typography variant="body2" color="#888888">
                    {selectedUser.email}
                  </Typography>
                </Box>
              </Toolbar>
            </AppBar>

            {/* Messages Area */}
            <Box
              sx={{
                flexGrow: 1,
                p: 2,
                overflow: 'auto',
                bgcolor: '#111111',
                display: 'flex',
                flexDirection: 'column',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#1a1a1a',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#333333',
                  borderRadius: '4px',
                  '&:hover': {
                    background: '#FF6347',
                  },
                },
              }}
            >
              {messages.map((message) => renderMessage(message))}
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <MessageInput 
              selectedUser={selectedUser}
              onSendMessage={handleSendMessage}
              disabled={!selectedUser || loading}
            />
          </>
        ) : (
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#111111'
            }}
          >
            <Typography variant="h6" color="#888888">
              Select a user to start chatting
            </Typography>
          </Box>
        )}
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: '#1a1a1a',
            border: '1px solid #333333',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            mt: 1,
            minWidth: '200px',
            '& .MuiMenuItem-root': {
              color: '#FFFFFF',
              '&:hover': {
                bgcolor: 'rgba(255, 99, 71, 0.1)',
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #333333' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Person sx={{ color: '#888888', mr: 1 }} />
            <Typography sx={{ color: '#FFFFFF' }}>
              {currentUser?.name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Email sx={{ color: '#888888', mr: 1 }} />
            <Typography sx={{ 
              color: '#888888',
              fontSize: '0.9rem',
              wordBreak: 'break-all'
            }}>
              {currentUser?.email}
            </Typography>
          </Box>
        </Box>

        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <AccountCircle sx={{ color: '#FF6347' }} />
          </ListItemIcon>
          Profile
        </MenuItem>

        <Divider sx={{ borderColor: '#333333' }} />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout sx={{ color: '#FF6347' }} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Profile Dialog */}
      <Profile 
        open={profileOpen} 
        onClose={() => setProfileOpen(false)} 
      />

      {/* Image Preview Modal */}
      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth="xl"
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            position: 'relative'
          }
        }}
      >
        <IconButton
          onClick={() => setSelectedImage(null)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)'
            },
            zIndex: 1
          }}
        >
          <Close />
        </IconButton>
        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          <img
            src={selectedImage}
            alt="Full size"
            style={{
              maxHeight: '90vh',
              maxWidth: '90vw',
              objectFit: 'contain'
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Chat;