import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  AccountCircle,
  Settings,
  Logout,
  Lock,
  People,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { USER_ROLES } from '../../utils/constants';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [langAnchorEl, setLangAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setLangAnchorEl(null);
  };

  const handleLangMenu = (event) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleChangeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLangAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const handleChangePassword = () => {
    handleClose();
    navigate('/change-password');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleUserManagement = () => {
    handleClose();
    navigate('/user-management');
  };

  const open = Boolean(anchorEl);

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, borderRadius: 0 }}>
      <Toolbar>
        
        <Typography variant="h6"  sx={{ flexGrow: 1, ml: 4 }}>
          {t('app.name')}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
         
          
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls={open ? 'menu-appbar' : undefined}
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={open}
            onClose={handleClose}
          >
            <MenuItem onClick={handleProfile}>
              <AccountCircle sx={{ mr: 1 }} />
             {user?.firstName} {user?.lastName}
            </MenuItem>
            
            <MenuItem disabled>
              <Settings sx={{ mr: 1 }} />
              {t('menu.role')}: {user?.role}
            </MenuItem>
            
            <Divider />
            
            {user?.role === USER_ROLES.ADMIN && (
              <MenuItem onClick={handleUserManagement}>
                <People sx={{ mr: 1 }} />
                User Management
              </MenuItem>
            )}
            
            <MenuItem onClick={handleChangePassword}>
              <Lock sx={{ mr: 1 }} />
              {t('menu.changePassword')}
            </MenuItem>
            
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              {t('menu.logout')}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLangMenu}>
              <span role="img" aria-label="language" style={{ marginRight: 8 }}>🌐</span>
              {t('menu.changeLanguage')}
            </MenuItem>
          </Menu>
          <Menu
            id="lang-menu"
            anchorEl={langAnchorEl}
            open={Boolean(langAnchorEl)}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => handleChangeLanguage('en')} selected={i18n.language === 'en'}>
              <ListItemIcon>🇺🇸</ListItemIcon>
              <ListItemText>English</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleChangeLanguage('es')} selected={i18n.language === 'es'}>
              <ListItemIcon>🇪🇸</ListItemIcon>
              <ListItemText>Español</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 