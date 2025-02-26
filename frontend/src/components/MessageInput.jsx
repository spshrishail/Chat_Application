import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Button,
  CircularProgress,
  Popover,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Send as SendIcon,
  Image as ImageIcon,
  EmojiEmotions as EmojiIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import EmojiPicker from 'emoji-picker-react';
import axios from '../utils/axios';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';

// Configure axios for larger files
axios.defaults.timeout = 30000; // 30 seconds timeout

// Simple emoji list
const emojis = [
  '😊', '😂', '🥰', '😍', '😒', '😭', '😩', '🥺',
  '😤', '😡', '🤔', '🤗', '😴', '😷', '🤧', '🤮',
  '👍', '👎', '👋', '🙌', '👏', '🤝', '🙏', '💪',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍'
];

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: '#ffffff',
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    '& fieldset': {
      borderColor: '#333333',
    },
    '&:hover fieldset': {
      borderColor: '#FF6347',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FF6347',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#888888',
    '&.Mui-focused': {
      color: '#FF6347',
    },
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: '#FF6347',
  '&:hover': {
    backgroundColor: 'rgba(255, 99, 71, 0.1)',
  },
  '&.Mui-disabled': {
    color: '#666666',
  },
}));

const MessageInput = ({ selectedUser, onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef();
  const [cursorPosition, setCursorPosition] = useState(0);
  const textFieldRef = useRef();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if ((!message.trim() && !selectedImage) || loading) return;

    setLoading(true);
    try {
      if (selectedImage) {
        // Convert image to base64
        const reader = new FileReader();
        reader.readAsDataURL(selectedImage);
        reader.onload = async () => {
          try {
            await onSendMessage(message.trim(), reader.result);
            setMessage('');
            setSelectedImage(null);
            setPreviewUrl(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image. Please try again.');
          } finally {
            setLoading(false);
          }
        };
        reader.onerror = () => {
          console.error('Error reading file');
          toast.error('Error reading file. Please try again.');
          setLoading(false);
        };
      } else {
        await onSendMessage(message.trim());
        setMessage('');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      setSelectedImage(file);
      toast.success('Image selected');
    }
  };

  const handleEmojiClick = (emojiObject) => {
    const cursor = textFieldRef.current.selectionStart;
    const text = message.slice(0, cursor) + emojiObject.emoji + message.slice(cursor);
    setMessage(text);
    setCursorPosition(cursor + emojiObject.emoji.length);
  };

  // Update cursor position after emoji is inserted
  React.useEffect(() => {
    const textField = textFieldRef.current;
    if (textField) {
      textField.selectionEnd = cursorPosition;
    }
  }, [cursorPosition]);

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
      {/* Image Preview */}
      {previewUrl && (
        <Box
          sx={{
            position: 'relative',
            mb: 2,
            width: 'fit-content'
          }}
        >
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              maxWidth: '200px',
              maxHeight: '200px',
              borderRadius: '8px'
            }}
          />
          <IconButton
            size="small"
            onClick={clearImage}
            sx={{
              position: 'absolute',
              top: -10,
              right: -10,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'error.light' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Message Input Form */}
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'flex-end'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageSelect}
          id="image-input"
        />

        <label htmlFor="image-input">
          <StyledIconButton
            component="span"
            disabled={loading}
          >
            <ImageIcon />
          </StyledIconButton>
        </label>

        <Tooltip title="Add emoji">
          <IconButton
            onClick={(e) => setEmojiAnchorEl(e.currentTarget)}
            disabled={loading}
            color="primary"
          >
            <EmojiIcon />
          </IconButton>
        </Tooltip>

        <StyledTextField
          fullWidth
          multiline
          maxRows={4}
          size="small"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
          inputRef={textFieldRef}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {selectedImage && (
                  <Box
                    sx={{
                      bgcolor: 'rgba(255, 99, 71, 0.1)',
                      color: '#FF6347',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                    }}
                  >
                    Image selected
                  </Box>
                )}
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          type="submit"
          disabled={loading || (!message.trim() && !selectedImage)}
          sx={{
            borderRadius: 2,
            minWidth: 54,
            height: 40
          }}
        >
          {loading ? <CircularProgress size={24} /> : <SendIcon />}
        </Button>

        <Popover
          open={Boolean(emojiAnchorEl)}
          anchorEl={emojiAnchorEl}
          onClose={() => setEmojiAnchorEl(null)}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          sx={{
            '& .EmojiPickerReact': {
              '--epr-bg-color': '#fff',
              '--epr-category-label-bg-color': '#f8f9fa',
              '--epr-hover-bg-color': '#f1f3f4',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }
          }}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            searchDisabled
            skinTonesDisabled
            width={320}
            height={400}
          />
        </Popover>
      </Box>
    </Box>
  );
};

export default MessageInput; 