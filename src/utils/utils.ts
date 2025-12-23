import toast from 'react-hot-toast';

export const ApiUtils = {
  handleError: (error: any) => {
    console.error('API Error:', error);
    
    // Check for network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return;
    }

    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err: string) => toast.error(err));
        } else {
          toast.error(data.message || 'Bad request. Please check your input.');
        }
        break;
      case 401:
        toast.error('Session expired. Please login again.');
        // You might want to redirect to login here
        break;
      case 403:
        toast.error('You do not have permission to perform this action.');
        break;
      case 404:
        toast.error('Resource not found.');
        break;
      case 409:
        toast.error('Conflict: ' + (data.message || 'Resource already exists.'));
        break;
      case 422:
        if (data.errors) {
          Object.values(data.errors).forEach((err: any) => {
            if (Array.isArray(err)) {
              err.forEach((e: string) => toast.error(e));
            } else {
              toast.error(err);
            }
          });
        } else {
          toast.error(data.message || 'Validation failed.');
        }
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        toast.error(data?.message || 'An unexpected error occurred.');
    }
  },

  formatQueryParams: (params: Record<string, any>): Record<string, any> => {
    const formatted: Record<string, any> = {};
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      
      // Remove undefined and null values
      if (value !== undefined && value !== null && value !== '') {
        formatted[key] = value;
      }
    });
    
    return formatted;
  },

  getErrorMessage: (error: any): string => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }
};