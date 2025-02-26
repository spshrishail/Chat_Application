import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  TextField,
  Button,
  Avatar,
  IconButton,
  Typography,
  styled,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Close,
  Edit,
  Person,
  Email,
  Lock,
  SaveAlt
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import { toast } from 'react-toastify';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: '#111111',
    borderRadius: '20px',
    border: '1px solid #333333',
    boxShadow: '0 8px 32px rgba(255, 99, 71, 0.1)',
    minWidth: '400px',
    maxWidth: '500px',
    margin: '20px',
    color: '#FFFFFF'
  }
}));

const StyledTextField = styled(TextField)({
  marginBottom: '16px',
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
  '& .MuiInputAdornment-root': {
    color: '#888888',
  }
});

const StyledButton = styled(Button)({
  backgroundColor: '#FF6347',
  color: '#000000',
  borderRadius: '12px',
  padding: '10px 24px',
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    backgroundColor: '#ff4c2b',
  },
});

const Profile = ({ open, onClose }) => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToUpdate = {
        name: formData.name,
        email: formData.email
      };

      if (showPasswordFields && formData.currentPassword && formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('New passwords do not match');
          return;
        }
        dataToUpdate.currentPassword = formData.currentPassword;
        dataToUpdate.newPassword = formData.newPassword;
      }

      const response = await axios.put('/api/users/profile', dataToUpdate);
      setUser(response.data);
      toast.success('Profile updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledDialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: '#111111',
          maxHeight: '90vh',
          overflowY: 'auto'
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        borderBottom: '1px solid #333333',
        bgcolor: '#1a1a1a',
        position: 'sticky',
        top: 0,
        zIndex: 1
      }}>
        <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
          Edit Profile
        </Typography>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            color: '#888888', 
            '&:hover': { 
              color: '#FF6347' 
            } 
          }}
        >
          <Close />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: '#111111' }}>
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2.5
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mb: 3
          }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: '#FF6347',
                color: '#000000',
                fontSize: '2rem',
                fontWeight: 'bold',
                border: '3px solid #333333'
              }}
            >
              {formData.name.charAt(0)}
            </Avatar>
          </Box>

          <StyledTextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            InputProps={{
              startAdornment: <Person sx={{ mr: 1, color: '#888888' }} />
            }}
          />

          <StyledTextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
            type="email"
            InputProps={{
              startAdornment: <Email sx={{ mr: 1, color: '#888888' }} />
            }}
          />

          <Divider sx={{ 
            borderColor: '#333333', 
            my: 2
          }} />

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            mb: 1
          }}>
            <Typography color="#FFFFFF">Change Password</Typography>
            <IconButton 
              onClick={() => setShowPasswordFields(!showPasswordFields)}
              sx={{ 
                color: showPasswordFields ? '#FF6347' : '#888888',
                '&:hover': { color: '#FF6347' }
              }}
            >
              <Edit />
            </IconButton>
          </Box>

          {showPasswordFields && (
            <>
              <StyledTextField
                label="Current Password"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: '#888888' }} />
                }}
              />

              <StyledTextField
                label="New Password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: '#888888' }} />
                }}
              />

              <StyledTextField
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: '#888888' }} />
                }}
              />
            </>
          )}

          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'flex-end', 
            mt: 3
          }}>
            <Button
              onClick={onClose}
              sx={{
                color: '#888888',
                '&:hover': {
                  color: '#FF6347',
                  bgcolor: 'rgba(255, 99, 71, 0.1)',
                },
              }}
            >
              Cancel
            </Button>
            <StyledButton
              type="submit"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveAlt />}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </StyledButton>
          </Box>
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};

export default Profile; 