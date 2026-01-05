import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        © 2026 SynaptriX SIMS. All rights reserved.
      </Typography>
      <Box sx={{ mt: 1 }}>
        <Link
          href="#"
          variant="body2"
          color="text.secondary"
          sx={{ mr: 2 }}
        >
          Privacy Policy
        </Link>
        <Link
          href="#"
          variant="body2"
          color="text.secondary"
          sx={{ mr: 2 }}
        >
          Terms of Service
        </Link>
        <Link
          href="#"
          variant="body2"
          color="text.secondary"
        >
          Support
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;