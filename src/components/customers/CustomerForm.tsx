import React from 'react';
import {
  Box,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { UAEUtils } from '@/utils/uae.utils';
import type { CustomerDto, CreateCustomerDto, UpdateCustomerDto } from '@/types';

interface CustomerFormProps {
  initialData?: CustomerDto | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
}) => {
  const [formData, setFormData] = React.useState<CreateCustomerDto | UpdateCustomerDto>({
    customerCode: initialData?.customerCode || '', // Will be auto-generated or disabled
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    mobile: initialData?.mobile || '',
    address: initialData?.address || '',
    emirate: initialData?.city || '', // Changed from city to emirate
    state: initialData?.state || '',
    country: initialData?.country || 'United Arab Emirates',
    postalCode: initialData?.postalCode || '',
    dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : null,
    gender: initialData?.gender || '',
    occupation: initialData?.occupation || '',
    company: initialData?.company || '',
    taxNumber: initialData?.taxNumber || '',
    creditLimit: initialData?.creditLimit || 0,
    notes: initialData?.notes || '',
  });

  const [mobileError, setMobileError] = React.useState<string>('');
  const [trnError, setTrnError] = React.useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time validation for mobile number
    if (name === 'mobile') {
      if (value && !UAEUtils.isValidUaeMobile(value)) {
        setMobileError('Invalid UAE mobile number. Format: +9715XXXXXXXX');
      } else {
        setMobileError('');
      }
    }

    // Real-time validation for TRN
    if (name === 'taxNumber' && value) {
      if (!UAEUtils.isValidTrn(value)) {
        setTrnError('Invalid UAE TRN. Must be 15 digits.');
      } else {
        setTrnError('');
      }
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, dateOfBirth: date }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate mobile number
    if (formData.mobile && !UAEUtils.isValidUaeMobile(formData.mobile)) {
      setMobileError('Invalid UAE mobile number');
      return;
    }

    // Validate TRN if provided
    if (formData.taxNumber && !UAEUtils.isValidTrn(formData.taxNumber)) {
      setTrnError('Invalid UAE TRN');
      return;
    }

    // Format mobile number for backend
    const formattedData = {
      ...formData,
      mobile: formData.mobile ? UAEUtils.formatMobileForApi(formData.mobile) : '',
	  // Send Emirate as City for now (temporary fix)
	  city: formData.emirate, // Map emirate to city
	  // Send a dummy code that backend will replace
	  customerCode: isEdit ? formData.customerCode : "TEMP-CODE",
      // Remove customerCode for create (backend will generate it)
      ...(!isEdit && { customerCode: undefined }),
      // For update, don't send customerCode at all
      ...(isEdit && { customerCode: undefined }),
    };

    onSubmit(formattedData);
  };

  // UAE Emirates list
  const emirates = [
    'Abu Dhabi',
    'Dubai',
    'Sharjah',
    'Ajman',
    'Umm Al Quwain',
    'Ras Al Khaimah',
    'Fujairah'
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form id="customer-form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Customer Code - Only show for edit, not for create */}
          {isEdit && initialData?.customerCode && (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Customer Code"
                name="customerCode"
                value={initialData.customerCode}
                disabled
                helperText="Customer code is auto-generated and cannot be changed"
              />
            </Grid>
          )}

          {/* Full Name - Required */}
          <Grid size={{ xs: 12, md: isEdit ? 6 : 12 }}>
            <TextField
              fullWidth
              label="Full Name "
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </Grid>

          {/* Mobile - Required with UAE validation */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Mobile Number "
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              disabled={isLoading}
              error={!!mobileError}
              helperText={mobileError || "UAE format: +9715XXXXXXXX"}
              placeholder="+9715XXXXXXXX"
            />
          </Grid>

          {/* Emirates (Replaced City) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={isLoading}>
              <InputLabel>Emirate *</InputLabel>
              <Select
                name="emirate"
                value={formData.emirate}
                onChange={handleSelectChange}
                label="Emirate *"
                required
              >
                <MenuItem value="">
                  <em>Select Emirate</em>
                </MenuItem>
                {emirates.map((emirate) => (
                  <MenuItem key={emirate} value={emirate}>
                    {emirate}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select the UAE emirate</FormHelperText>
            </FormControl>
          </Grid>

          {/* Email - Optional */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Grid>

          {/* TRN with validation */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Tax Registration Number (TRN)"
              name="taxNumber"
              value={formData.taxNumber}
              onChange={handleChange}
              disabled={isLoading}
              error={!!trnError}
              helperText={trnError || "UAE TRN: 15 digits"}
              placeholder="123456789012345"
              inputProps={{ maxLength: 15 }}
            />
          </Grid>

          {/* Company */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Grid>

          {/* Occupation */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Grid>

          {/* Credit Limit */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Credit Limit (AED)"
              name="creditLimit"
              type="number"
              value={formData.creditLimit}
              onChange={handleChange}
              disabled={isLoading}
              InputProps={{ inputProps: { min: 0, step: 100 } }}
            />
          </Grid>

          {/* Gender */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl component="fieldset">
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Gender
              </Typography>
              <RadioGroup
                row
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <FormControlLabel value="Male" control={<Radio />} label="Male" disabled={isLoading} />
                <FormControlLabel value="Female" control={<Radio />} label="Female" disabled={isLoading} />
                <FormControlLabel value="Other" control={<Radio />} label="Other" disabled={isLoading} />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Date of Birth */}
          <Grid size={{ xs: 12, md: 6 }}>
            <DatePicker
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChange={handleDateChange}
              disabled={isLoading}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </Grid>

          {/* Country (Fixed as UAE) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Country"
              name="country"
              value="United Arab Emirates"
              disabled
              helperText="System default: United Arab Emirates"
            />
          </Grid>

          {/* Area/State within Emirate */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Area / District"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={isLoading}
              helperText="Specific area within the emirate"
            />
          </Grid>

          {/* Postal Code */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Postal Code"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Grid>

          {/* Address */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={isLoading}
              multiline
              rows={2}
            />
          </Grid>

          {/* Notes */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              disabled={isLoading}
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </form>
    </LocalizationProvider>
  );
};

export default CustomerForm;