import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/Routes';
import ErrorBoundary from './components/ErrorBoundary';


const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App; 