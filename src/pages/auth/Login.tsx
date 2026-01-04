import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Lock } from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/api/auth.api';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('Admin@2024');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { username, password });
      
      const response = await authApi.login({ username, password });
      
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        const { token, refreshToken, user } = response.data;
        
        console.log('Login successful:', { token, refreshToken, user });
        
        login(user, token, refreshToken);
        
        toast.success(response.message || 'Login successful');
        
        navigate('/dashboard');
      } else {
        const errorMsg = response.message || 'Login failed';
        console.error('Login failed:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Login catch error:', error);
      
      const errorMessage = error.message || 'An error occurred during login';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default', // FIXED: Changed from #f5f5f5 to theme color
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 2,
          bgcolor: 'background.paper', // FIXED: Added background color
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Lock sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            SynaptriX SIMS
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to your account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
            disabled={isLoading}
            autoComplete="username"
            autoFocus
          />
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            disabled={isLoading}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ mt: 3, py: 1.5 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Default credentials:
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Username: <strong>superadmin</strong>
          </Typography>
          <br />
          <Typography variant="caption" color="text.secondary">
            Password: <strong>Admin@2024</strong>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}