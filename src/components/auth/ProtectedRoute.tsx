import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { CircularProgress, Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { authApi } from '@/api/auth.api';
import toast from 'react-hot-toast';

export default function ProtectedRoute() {
  const { isAuthenticated, user, login, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const validateToken = async () => {
    console.log('ProtectedRoute: Starting token validation');
    console.log('Auth store state:', { isAuthenticated, user });
    console.log('LocalStorage token:', localStorage.getItem('accessToken'));
    
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.log('ProtectedRoute: No token found');
        logout();
        setLoading(false);
        return;
      }

      console.log('ProtectedRoute: Validating token with API');
      const response = await authApi.getCurrentUser();
      console.log('ProtectedRoute: API response:', response);
      
      if (response.success && response.data) {
        console.log('ProtectedRoute: Token valid, user:', response.data);
        if (!user) {
          login(response.data, token, localStorage.getItem('refreshToken') || '');
        }
      } else {
        console.log('ProtectedRoute: Token invalid');
        logout();
        toast.error('Session expired. Please login again.');
      }
    } catch (error: any) {
      console.error('ProtectedRoute: Error:', error);
      if (error.response?.status === 401) {
        logout();
        toast.error('Session expired. Please login again.');
      }
    } finally {
      setLoading(false);
      console.log('ProtectedRoute: Validation complete');
    }
  };

  validateToken();
}, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}