import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { userAPI } from '../services/api';

const Profile = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    mobile: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getProfile();
      setFormData({
        firstName: res.data.user.firstName || '',
        lastName: res.data.user.lastName || '',
        username: res.data.user.username || '',
        email: res.data.user.email || '',
        mobile: res.data.user.mobile || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName) errors.firstName = t('validation.required');
    if (!formData.lastName) errors.lastName = t('validation.required');
    if (!formData.username) errors.username = t('validation.required');
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('validation.email');
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await userAPI.updateProfile(formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" gutterBottom>
            {t('user.profile')}
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{t('user.profileUpdated')}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="firstName"
              label={t('user.firstName')}
              value={formData.firstName}
              onChange={handleChange}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="lastName"
              label={t('user.lastName')}
              value={formData.lastName}
              onChange={handleChange}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="username"
              label={t('user.username')}
              value={formData.username}
              onChange={handleChange}
              error={!!formErrors.username}
              helperText={formErrors.username}
              disabled
            />
            <TextField
              margin="normal"
              fullWidth
              name="email"
              label={t('auth.email')}
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="mobile"
              label={t('user.mobile')}
              value={formData.mobile}
              onChange={handleChange}
              error={!!formErrors.mobile}
              helperText={formErrors.mobile}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? t('loading') : t('user.updateProfile')}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile; 