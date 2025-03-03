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
  Alert,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
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

const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: '12px',
  backgroundColor: 'rgba(255, 99, 71, 0.1)',
  color: '#FF6347',
  '& .MuiAlert-icon': {
    color: '#FF6347',
  },
}));

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    const loadingToast = toast.loading("Signing in...");
    try {
      console.log("Attempting to log in with:", data);
      if (!data.email || !data.password) {
        throw new Error("Email and password are required");
      }

      const response = await axios.post('http://localhost:8080/api/auth/login', data);
      
      if (!response.data || !response.data.token || !response.data.user) {
        throw new Error("Invalid response from server");
      }
      
      const { token, user } = response.data;
      
      setError('');
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      toast.update(loadingToast, {
        render: "Signed in successfully!",
        type: "success",
        isLoading: false,
        autoClose: 2000
      });
      
      if (typeof login === 'function') {
        login(user);
      } else {
        console.error('Login function is not available');
        throw new Error('Authentication error');
      }
      
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.message || err.message || "Login failed. Please try again.";
      
      toast.update(loadingToast, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
      setError(errorMessage);
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
            Welcome Back
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
            Sign in to continue to Chatify
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
              label="Email Address"
              autoFocus
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

            <StyledButton
              type="submit"
              fullWidth
              size="large"
            >
              Sign in
            </StyledButton>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#888888' }}>
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: '#FF6347',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      color: '#ff8066',
                    },
                  }}
                >
                  Sign up
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

export default Login; 
