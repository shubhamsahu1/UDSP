import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  People,
  TrendingUp,
  Notifications,
  Assignment,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const statsCards = [
    {
      title: 'Total Users',
      value: '1,234',
      icon: People,
      color: '#1976d2',
    },
    {
      title: 'Active Sessions',
      value: '89',
      icon: TrendingUp,
      color: '#2e7d32',
    },
    {
      title: 'Notifications',
      value: '12',
      icon: Notifications,
      color: '#ed6c02',
    },
    {
      title: 'Tasks',
      value: '45',
      icon: Assignment,
      color: '#9c27b0',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      text: 'New user registered: John Doe',
      time: '2 minutes ago',
    },
    {
      id: 2,
      text: 'System backup completed',
      time: '1 hour ago',
    },
    {
      id: 3,
      text: 'Password reset requested',
      time: '3 hours ago',
    },
    {
      id: 4,
      text: 'Database maintenance scheduled',
      time: '1 day ago',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('dashboard.welcome')}, {user?.firstName}!
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon sx={{ color: card.color, mr: 1, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" component="div">
                        {card.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {card.title}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        
        {/* Overview Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.overview')}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Welcome to your dashboard! Here you can monitor your application's performance,
              manage users, and view important statistics. The system is running smoothly
              with all services operational.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="success.main">
                ✓ All systems operational
              </Typography>
              <Typography variant="subtitle2" color="success.main">
                ✓ Database connection stable
              </Typography>
              <Typography variant="subtitle2" color="success.main">
                ✓ Security protocols active
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.recentActivity')}
            </Typography>
            <List>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Notifications fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.text}
                    secondary={activity.time}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 