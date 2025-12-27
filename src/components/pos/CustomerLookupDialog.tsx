import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

interface CustomerLookupDialogProps {
  open: boolean;
  onClose: () => void;
  onLookup: (mobile: string) => void;
}

const CustomerLookupDialog: React.FC<CustomerLookupDialogProps> = ({
  open,
  onClose,
  onLookup,
}) => {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async () => {
    if (!mobile.trim()) {
      setError('Please enter a UAE mobile number');
      return;
    }

    // Validate UAE mobile number (start with 05, 10 digits total)
    const uaeMobileRegex = /^(05)\d{8}$/;
    if (!uaeMobileRegex.test(mobile)) {
      setError('Please enter a valid UAE mobile number (05XXXXXXXX)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      onLookup(mobile);
      onClose();
    } catch (err) {
      setError('Error looking up customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="span" fontWeight={600}>
            Lookup Customer
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          Enter customer UAE mobile number to find existing customer.
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="UAE Mobile Number"
              placeholder="05XXXXXXXX"
              value={mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setMobile(value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              disabled={loading}
              error={!!error}
              helperText={error}
              InputProps={{
                startAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      +971
                    </Typography>
                  </Box>
                ),
              }}
            />
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            • Enter customer's 10-digit UAE mobile number (starts with 05)
            <br />
            • Example: 05XXXXXXXX
            <br />
            • If customer exists, their details will be loaded
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleLookup}
          disabled={loading || !mobile.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
        >
          {loading ? 'Searching...' : 'Lookup Customer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerLookupDialog;