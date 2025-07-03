import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { userAPI } from '../services/api';
import { USER_ROLES, USER_ROLE_LABELS, USER_ROLE_COLORS } from '../utils/constants';

const UserManagement = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    mobile: '',
    role: USER_ROLES.STAFF,
  });

  const [showPassword, setShowPassword] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      showSnackbar('Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

 

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        firstName: user.firstName,
        lastName: user.lastName,
        mobile: user.mobile,
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        mobile: '',
        role: USER_ROLES.STAFF,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      mobile: '',
      role: USER_ROLES.STAFF,
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username) errors.username = t('validation.usernameRequired');
    if (!formData.firstName) errors.firstName = t('validation.firstNameRequired');
    if (!formData.mobile) errors.mobile = t('validation.mobileRequired');
    else if (!/^\d{10}$/.test(formData.mobile)) errors.mobile = t('validation.mobileFormat');
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) errors.email = t('validation.emailFormat');
    if (!editingUser && !formData.password) errors.password = t('validation.passwordRequired');
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (editingUser) {
        // Update user
        const updateData = { ...formData };
        delete updateData.password; // Remove password from update data
        await userAPI.updateUser(editingUser._id, updateData);
        showSnackbar(t('userManagement.userUpdated'));
      } else {
        // Create user
        await userAPI.createUser(formData);
        showSnackbar(t('userManagement.userCreated'));
      }
      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      showSnackbar(error.response?.data?.message || t('userManagement.errorSavingUser'), 'error');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await userAPI.toggleUserStatus(userId);
      showSnackbar(t('userManagement.statusUpdated'));
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      showSnackbar(t('userManagement.errorUpdatingStatus'), 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm(t('userManagement.confirmDelete'))) {
      try {
        await userAPI.deleteUser(userId);
        showSnackbar(t('userManagement.userDeleted'));
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showSnackbar(error.response?.data?.message || t('userManagement.errorDeletingUser'), 'error');
      }
    }
  };

  const handleChangePassword = async (userId) => {
    const newPassword = prompt(t('userManagement.enterNewPassword'));
    if (newPassword) {
      try {
        await userAPI.changeUserPassword(userId, { newPassword });
        showSnackbar(t('userManagement.passwordChanged'));
      } catch (error) {
        console.error('Error changing password:', error);
        showSnackbar(t('userManagement.errorChangingPassword'), 'error');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>{t('common.loading')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('userManagement.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          {t('userManagement.addUser')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('userManagement.table.name')}</TableCell>
              <TableCell>{t('userManagement.table.username')}</TableCell>
              <TableCell>{t('userManagement.table.email')}</TableCell>
              <TableCell>{t('userManagement.table.mobile')}</TableCell>
              <TableCell>{t('userManagement.table.role')}</TableCell>
              <TableCell>{t('userManagement.table.status')}</TableCell>
              <TableCell>{t('userManagement.table.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.firstName} {user.lastName}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.mobile}</TableCell>
                <TableCell>
                  <Chip
                    label={USER_ROLE_LABELS[user.role]}
                    color={USER_ROLE_COLORS[user.role]}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? t('userManagement.status.active') : t('userManagement.status.inactive')}
                    color={user.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title={t('userManagement.actions.edit')}>
                    <IconButton onClick={() => handleOpenDialog(user)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('userManagement.actions.changePassword')}>
                    <IconButton onClick={() => handleChangePassword(user._id)}>
                      <Lock />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={user.isActive ? t('userManagement.actions.deactivate') : t('userManagement.actions.activate')}>
                    <IconButton onClick={() => handleToggleStatus(user._id)}>
                      {user.isActive ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('userManagement.actions.delete')}>
                    <IconButton onClick={() => handleDeleteUser(user._id)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? t('userManagement.dialog.editTitle') : t('userManagement.dialog.addTitle')}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('userManagement.form.username')}
              name="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <TextField
              margin="normal"
              fullWidth
              label={t('userManagement.form.email')}
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            {!editingUser && (
              <TextField
                margin="normal"
                required
                fullWidth
                label={t('userManagement.form.password')}
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('userManagement.form.firstName')}
              name="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <TextField
              margin="normal"
              fullWidth
              label={t('userManagement.form.lastName')}
              name="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('userManagement.form.mobile')}
              name="mobile"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              error={!!formErrors.mobile}
              helperText={formErrors.mobile}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('userManagement.form.role')}</InputLabel>
              <Select
                value={formData.role}
                label={t('userManagement.form.role')}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                {Object.entries(USER_ROLES).map(([key, value]) => (
                  <MenuItem key={value} value={value}>
                    {USER_ROLE_LABELS[value]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? t('common.update') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement; 