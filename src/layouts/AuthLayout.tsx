import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

export default function AuthLayout() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Outlet />
    </Box>
  );
}