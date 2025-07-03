import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service here
    // console.error(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          px={2}
          textAlign="center"
        >
          <Typography variant="h3" color="error" gutterBottom>
            Oops! Something went wrong.
          </Typography>
          <Typography variant="body1" mb={3}>
            An unexpected error occurred. Please try refreshing the page.<br />
            If the problem persists, contact support.
          </Typography>
          <Button variant="contained" color="primary" onClick={this.handleReload}>
            Reload Page
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 