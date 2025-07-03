import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const { t } = useTranslation();
  const { changePassword, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const errors = {};
    if (!formData.currentPassword) errors.currentPassword = t('validation.required');
    if (!formData.newPassword) errors.newPassword = t('validation.required');
    else if (formData.newPassword.length < 6) errors.newPassword = t('validation.minLength', { min: 6 });
    if (!formData.confirmPassword) errors.confirmPassword = t('validation.required');
    else if (formData.newPassword !== formData.confirmPassword) errors.confirmPassword = t('validation.passwordMatch');
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setSuccess(false);
    try {
      const result = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      if (result.success) {
        setSuccess(true);
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" gutterBottom>
            {t('user.changePassword')}
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{t('user.passwordChanged')}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="currentPassword"
              label={t('user.currentPassword')}
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              error={!!formErrors.currentPassword}
              helperText={formErrors.currentPassword}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label={t('user.newPassword')}
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              error={!!formErrors.newPassword}
              helperText={formErrors.newPassword}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label={t('auth.confirmPassword')}
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? t('loading') : t('user.changePassword')}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ChangePassword; 