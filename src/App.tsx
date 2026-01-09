// src/App.tsx
import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { createAppTheme } from './theme/index';
import { useThemeStore, initializeTheme } from './stores/theme.store';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Customers from './pages/customers/Customers';
import Products from './pages/products/Products';
import Orders from './pages/orders/Orders';
import Settings from './pages/settings/Settings';

// Invoice Pages
import CreateInvoicePage from './pages/invoices/CreateInvoicePage';
import InvoiceListPage from './pages/invoices/InvoiceListPage';
import InvoiceDetailPage from './pages/invoices/InvoiceDetailPage';
import EditInvoicePage from './pages/invoices/EditInvoicePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { mode } = useThemeStore();
  const theme = createAppTheme(mode);

  // Initialize theme on app start
  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="invoices">
                <Route index element={<InvoiceListPage />} />
                <Route path="create" element={<CreateInvoicePage />} />
                <Route path=":id" element={<InvoiceDetailPage />} />
                <Route path=":id/edit" element={<EditInvoicePage />} />
              </Route>
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '70vh',
                  textAlign: 'center',
                  padding: '2rem'
                }}>
                  <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
                  <h2 style={{ marginBottom: '1rem' }}>Page Not Found</h2>
                  <p style={{ marginBottom: '2rem', color: theme.palette.text.secondary }}>
                    The page you are looking for doesn't exist or has been moved.
                  </p>
                  <a 
                    href="/dashboard" 
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: theme.palette.primary.main,
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: theme.palette.primary.dark,
                      }
                    }}
                  >
                    Go to Dashboard
                  </a>
                </div>
              } />
            </Route>
          </Routes>
        </Router>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
              borderRadius: '8px',
              border: `1px solid ${theme.palette.divider}`,
              fontSize: '14px',
              fontWeight: 500,
            },
            success: {
              iconTheme: {
                primary: theme.palette.success.main,
                secondary: theme.palette.background.paper,
              },
              style: {
                background: mode === 'dark' ? '#064E3B' : '#D1FAE5',
                borderColor: theme.palette.success.main,
              },
            },
            error: {
              iconTheme: {
                primary: theme.palette.error.main,
                secondary: theme.palette.background.paper,
              },
              style: {
                background: mode === 'dark' ? '#7F1D1D' : '#FEE2E2',
                borderColor: theme.palette.error.main,
              },
            },
            loading: {
              style: {
                background: theme.palette.background.paper,
              },
            },
          }}
        />
        
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools 
            initialIsOpen={false}
            buttonPosition="bottom-right"
          />
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;