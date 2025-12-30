// frontend/App.tsx
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import theme from './theme';
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

// POS Page (coming soon)
// import PosInvoicePage from './pages/invoices/pos/PosInvoicePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Better for user experience
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
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes - Layout is the parent */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Default redirect to dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Dashboard */}
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Customers */}
              <Route path="customers" element={<Customers />} />
              
              {/* Products */}
              <Route path="products" element={<Products />} />
              
              {/* Orders */}
              <Route path="orders" element={<Orders />} />
              
              {/* Invoice Management */}
              <Route path="invoices">
                {/* Invoice List */}
                <Route index element={<InvoiceListPage />} />
                
                {/* Create New Invoice */}
                <Route path="create" element={<CreateInvoicePage />} />
                
                {/* View Invoice Details */}
                <Route path=":id" element={<InvoiceDetailPage />} />
                
                {/* Edit Invoice */}
                <Route path=":id/edit" element={<EditInvoicePage />} />
                
                {/* POS Invoice (Coming Soon) */}
                {/* <Route path="pos" element={<PosInvoicePage />} /> */}
                
                {/* Print/Export Routes (Can add later) */}
                {/* <Route path=":id/print" element={<InvoicePrintPage />} /> */}
                {/* <Route path=":id/pdf" element={<InvoicePdfPage />} /> */}
              </Route>
              
              {/* Settings */}
              <Route path="settings" element={<Settings />} />
              
              {/* Catch-all route for 404 */}
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
                  <p style={{ marginBottom: '2rem', color: '#666' }}>
                    The page you are looking for doesn't exist or has been moved.
                  </p>
                  <a 
                    href="/dashboard" 
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#0A2463',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold'
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
              background: '#1E293B',
              color: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #334155',
              fontSize: '14px',
              fontWeight: 500,
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#FFFFFF',
              },
              style: {
                background: '#064E3B',
                borderColor: '#10B981',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
              style: {
                background: '#7F1D1D',
                borderColor: '#EF4444',
              },
            },
            loading: {
              style: {
                background: '#1E293B',
              },
            },
          }}
        />
        
        {/* React Query DevTools - Only in development */}
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