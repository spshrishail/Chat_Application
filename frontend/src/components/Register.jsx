import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Link,
  InputAdornment,
  IconButton,
  Avatar,
  Alert,
} from '@mui/material';
import {
  Email,
  Lock,
  Person,
  Visibility,
  VisibilityOff,
  AddAPhoto,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: '#111111',
  borderRadius: '20px',
  border: '1px solid #333333',
  boxShadow: '0 8px 32px rgba(255, 99, 71, 0.1)',
}));

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
  '& .MuiInputAdornment-root': {
    color: '#888888',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: '#FF6347',
  border: 0,
  borderRadius: '12px',
  color: '#000000',
  height: 56,
  padding: '0 30px',
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  fontWeight: 'bold',
  fontSize: '16px',
  textTransform: 'none',
  '&:hover': {
    background: '#ff8066',
    boxShadow: '0 6px 20px rgba(255, 99, 71, 0.3)',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  cursor: 'pointer',
  backgroundColor: '#1a1a1a',
  border: '2px solid #333333',
  '&:hover': {
    borderColor: '#FF6347',
  },
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: '12px',
  backgroundColor: 'rgba(255, 99, 71, 0.1)',
  color: '#FF6347',
  '& .MuiAlert-icon': {
    color: '#FF6347',
  },
}));

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError: setFormError,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      profilePic: '',
    },
  });

  const password = watch('password');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        toast.success('Image uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    const loadingToast = toast.loading("Creating your account...");
    try {
      const formData = {
        ...data,
        profilePic: previewImage,
      };
      delete formData.confirmPassword;

      const response = await axios.post('https://chatbackend-tau.vercel.app/api/auth/register', formData);
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      toast.update(loadingToast, {
        render: "Account created successfully!",
        type: "success",
        isLoading: false,
        autoClose: 2000
      });
      login(user);
      navigate('/');
    } catch (err) {
      toast.update(loadingToast, {
        render: err.response?.data?.message || "Registration failed",
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: '#000000',
        padding: 3,
        position: 'relative',
      }}
    >
      <Container component="main" maxWidth="xs">
        <StyledPaper elevation={0}>
          <Box
            sx={{
              width: '60px',
              height: '60px',
              borderRadius: '15px',
              background: '#FF6347',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: '#000000',
                fontWeight: 'bold',
              }}
            >
              C
            </Typography>
          </Box>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 1,
              fontWeight: 700,
              color: '#ffffff',
              textAlign: 'center',
            }}
          >
            Create Account
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4, 
              color: '#888888', 
              textAlign: 'center',
              maxWidth: '280px'
            }}
          >
            Join Chatify and start connecting with others
          </Typography>

          
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%', mt: 3 }}>
            {error && (
              <StyledAlert severity="error" sx={{ mb: 2 }}>
                {error}
              </StyledAlert>
            )}

            <StyledTextField
              margin="normal"
              fullWidth
              label="Full Name"
              autoFocus
              {...register('name', {
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name should be at least 2 characters'
                }
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />

            <StyledTextField
              margin="normal"
              fullWidth
              label="Email Address"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />

            <StyledTextField
              margin="normal"
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password should be at least 6 characters'
                },
                
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#888888' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <StyledTextField
              margin="normal"
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => 
                  value === password || 'Passwords do not match'
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      sx={{ color: '#888888' }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <StyledButton
              type="submit"
              fullWidth
              size="large"
            >
              Sign up
            </StyledButton>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#888888' }}>
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: '#FF6347',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      color: '#ff8066',
                    },
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </StyledPaper>
      </Container>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </Box>
  );
};

export default Register; 
