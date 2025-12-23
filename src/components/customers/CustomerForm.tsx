import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useForm, Controller } from 'react-hook-form';
import { UAEUtils } from '@/utils/uae.utils';
import { CreateCustomerDto, UpdateCustomerDto } from '@/types';

interface CustomerFormProps {
  initialData?: CreateCustomerDto | UpdateCustomerDto;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

const defaultValues: CreateCustomerDto = {
  customerCode: '',
  fullName: '',
  email: '', // Empty string for optional
  mobile: '',
  address: '',
  city: '',
  state: '',
  country: 'United Arab Emirates',
  postalCode: '',
  dateOfBirth: undefined,
  gender: '',
  occupation: '',
  company: '',
  taxNumber: '',
  creditLimit: 0,
  notes: '',
};

export default function CustomerForm({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
}: CustomerFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
    clearErrors,
  } = useForm<CreateCustomerDto>({
    defaultValues: initialData || defaultValues,
  });

  const [mobileError, setMobileError] = useState('');
  const [mobileValid, setMobileValid] = useState(false);
  const mobileValue = watch('mobile');

  // Format mobile number for display
  useEffect(() => {
    if (mobileValue) {
      const formatted = UAEUtils.formatPhoneNumber(mobileValue);
      if (formatted !== mobileValue) {
        setValue('mobile', formatted);
      }
      
      const isValid = UAEUtils.isValidUaePhone(formatted);
      setMobileValid(isValid);
      
      if (formatted && !isValid) {
        setMobileError('Invalid UAE mobile number. Format: +971XXXXXXXXX');
      } else {
        setMobileError('');
        clearErrors('mobile');
      }
    }
  }, [mobileValue, setValue, clearErrors]);

	const handleFormSubmit = async (data: CreateCustomerDto) => {
	  // Validate mobile number
	  if (!UAEUtils.isValidUaePhone(data.mobile)) {
		setError('mobile', { message: 'Please enter a valid UAE mobile number' });
		return;
	  }

	  // Validate TRN if provided
	  if (data.taxNumber && !UAEUtils.validateTRN(data.taxNumber)) {
		setError('taxNumber', { message: 'Invalid UAE TRN. Must be 15 digits starting with 1' });
		return;
	  }
	  
	// Ensure all required fields have values (even if empty strings for optional ones)
	  const submitData: CreateCustomerDto = {
		...data,
		email: data.email || '', // Convert undefined to empty string
		address: data.address || '',
		city: data.city || '',
		state: data.state || '',
		country: data.country || 'United Arab Emirates',
		postalCode: data.postalCode || '',
	  };
    await onSubmit(data);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Basic Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Controller
                name="customerCode"
                control={control}
                rules={{ required: 'Customer code is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Customer Code *"
                    error={!!errors.customerCode}
                    helperText={errors.customerCode?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="fullName"
                control={control}
                rules={{ required: 'Full name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Full Name *"
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="mobile"
                control={control}
                rules={{ 
                  required: 'Mobile number is required',
                  pattern: {
                    value: /^\+971[0-9]{9}$/,
                    message: 'Invalid UAE mobile format. Use +971XXXXXXXXX',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Mobile Number *"
                    error={!!errors.mobile || !!mobileError}
                    helperText={errors.mobile?.message || mobileError || 'Format: +971XXXXXXXXX'}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          🇦🇪 +971
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              {mobileValid && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  ✓ Valid UAE mobile number
                </Alert>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                rules={{ 
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="taxNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Tax Registration Number (TRN)"
                    placeholder="15-digit UAE TRN"
                    error={!!errors.taxNumber}
                    helperText={errors.taxNumber?.message || 'Optional - 15 digits starting with 1'}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="creditLimit"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Credit Limit (AED)"
                    type="number"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">AED</InputAdornment>
                      ),
                    }}
                    disabled={isLoading}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Personal Details
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Date of Birth"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date?.toISOString())}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.dateOfBirth,
                        helperText: errors.dateOfBirth?.message,
                      },
                    }}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      {...field}
                      label="Gender"
                      disabled={isLoading}
                    >
                      <MenuItem value="">Not specified</MenuItem>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="occupation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Occupation"
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="company"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Company"
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Address Details
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Address"
                    multiline
                    rows={2}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>City *</InputLabel>
                    <Select
                      {...field}
                      label="City *"
                      required
                      disabled={isLoading}
                    >
                      <MenuItem value="">Select City</MenuItem>
                      {UAEUtils.getUAECities().map((city) => (
                        <MenuItem key={city.value} value={city.label}>
                          {city.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Emirate *</InputLabel>
                    <Select
                      {...field}
                      label="Emirate *"
                      required
                      disabled={isLoading}
                    >
                      <MenuItem value="">Select Emirate</MenuItem>
                      {UAEUtils.getUAEStates().map((state) => (
                        <MenuItem key={state.value} value={state.label}>
                          {state.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="postalCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Postal Code"
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Country"
                    value="United Arab Emirates"
                    disabled
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Additional Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    placeholder="Any additional notes about this customer..."
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{ minWidth: 120 }}
          >
            {isLoading ? 'Saving...' : isEdit ? 'Update Customer' : 'Create Customer'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}