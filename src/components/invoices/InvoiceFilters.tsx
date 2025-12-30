// frontend/components/invoices/InvoiceFilters.tsx
import React from 'react';
import {
  Box,
  Grid, // CHANGED BACK to regular Grid
  TextField,
  MenuItem,
  Button,
  Paper,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Chip,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  DateRange as DateRangeIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { InvoiceStatus, PaymentStatus } from '@/types';

interface InvoiceFiltersProps {
  filters: {
    search: string;
    status: string;
    paymentStatus: string;
    fromDate: Date | null;
    toDate: Date | null;
  };
  onFilterChange: (filters: any) => void;
  onClear: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  filters,
  onFilterChange,
  onClear,
  showFilters,
  onToggleFilters,
}) => {
  const handleChange = (field: string, value: any) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const handleDateChange = (field: 'fromDate' | 'toDate', value: Date | null) => {
    handleChange(field, value);
  };

  const handleClear = () => {
    onClear();
  };

  // Invoice status options
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: InvoiceStatus.Draft, label: 'Draft' },
    { value: InvoiceStatus.Pending, label: 'Pending' },
    { value: InvoiceStatus.Paid, label: 'Paid' },
    { value: InvoiceStatus.PartiallyPaid, label: 'Partially Paid' },
    { value: InvoiceStatus.Cancelled, label: 'Cancelled' },
  ];

  // Payment status options
  const paymentStatusOptions = [
    { value: '', label: 'All Payments' },
    { value: PaymentStatus.Unpaid, label: 'Unpaid' },
    { value: PaymentStatus.PartiallyPaid, label: 'Partially Paid' },
    { value: PaymentStatus.Paid, label: 'Paid' },
    { value: PaymentStatus.Overdue, label: 'Overdue' },
    { value: PaymentStatus.Cancelled, label: 'Cancelled' },
  ];

  // Check if any filter is active
  const isFilterActive = 
    filters.search || 
    filters.status || 
    filters.paymentStatus || 
    filters.fromDate || 
    filters.toDate;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'background.default', borderRadius: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search Input */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search invoices by number, customer, or mobile..."
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: filters.search && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => handleChange('search', '')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>

            {/* Filter Toggle Button */}
            <Grid item xs={12} md={8}>
              <Box display="flex" justifyContent="flex-end" gap={1}>
                {isFilterActive && (
                  <Chip
                    label="Filters Active"
                    color="primary"
                    size="small"
                    variant="outlined"
                    onDelete={handleClear}
                  />
                )}
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={onToggleFilters}
                  color={showFilters ? "primary" : "inherit"}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
                {isFilterActive && (
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={handleClear}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Clear All
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Advanced Filters */}
        {showFilters && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Grid container spacing={2}>
              {/* Status Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Invoice Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    label="Invoice Status"
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Payment Status Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Payment Status</InputLabel>
                  <Select
                    value={filters.paymentStatus}
                    onChange={(e) => handleChange('paymentStatus', e.target.value)}
                    label="Payment Status"
                  >
                    {paymentStatusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* From Date */}
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="From Date"
                  value={filters.fromDate}
                  onChange={(date) => handleDateChange('fromDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <DateRangeIcon />
                          </InputAdornment>
                        ),
                      },
                    },
                  }}
                />
              </Grid>

              {/* To Date */}
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="To Date"
                  value={filters.toDate}
                  onChange={(date) => handleDateChange('toDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <DateRangeIcon />
                          </InputAdornment>
                        ),
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>

            {/* Active Filters Display */}
            {isFilterActive && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                  Active filters:
                </Typography>
                {filters.status && (
                  <Chip
                    label={`Status: ${statusOptions.find(o => o.value === filters.status)?.label}`}
                    size="small"
                    onDelete={() => handleChange('status', '')}
                  />
                )}
                {filters.paymentStatus && (
                  <Chip
                    label={`Payment: ${paymentStatusOptions.find(o => o.value === filters.paymentStatus)?.label}`}
                    size="small"
                    onDelete={() => handleChange('paymentStatus', '')}
                  />
                )}
                {filters.fromDate && (
                  <Chip
                    label={`From: ${filters.fromDate.toLocaleDateString()}`}
                    size="small"
                    onDelete={() => handleChange('fromDate', null)}
                  />
                )}
                {filters.toDate && (
                  <Chip
                    label={`To: ${filters.toDate.toLocaleDateString()}`}
                    size="small"
                    onDelete={() => handleChange('toDate', null)}
                  />
                )}
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </LocalizationProvider>
  );
};

export default InvoiceFilters;