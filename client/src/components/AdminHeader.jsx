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
  Button,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function AdminHeader({ currentUser, onTabChange, tabValue, onProfileClick, onLogout }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleTabClick = (index) => {
    onTabChange(index);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', value: 0, icon: <DashboardIcon /> },
    { label: 'Users', value: 1, icon: <PeopleIcon /> },
    { label: 'Programs', value: 2, icon: <SchoolIcon /> },
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton 
              selected={tabValue === item.value}
              onClick={() => handleTabClick(item.value)}
              sx={{
                borderRadius: 1,
                mx: 1,
                my: 0.5,
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  boxShadow: '0 4px 8px rgba(25, 118, 210, 0.2)',
                  transform: 'translateX(4px)',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    transform: 'translateX(8px)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'inherit',
                    transform: 'scale(1.1)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  transform: 'translateX(4px)',
                },
                '& .MuiListItemIcon-root': {
                  transition: 'transform 0.2s ease',
                  color: tabValue === item.value ? 'primary.main' : 'text.secondary',
                },
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: tabValue === item.value ? 600 : 400,
                  transition: 'font-weight 0.2s ease',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          height: { xs: '56px', sm: '64px' },
          zIndex: theme.zIndex.drawer + 1,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }
        }}
      >
        <Toolbar sx={{ 
          height: '100%',
          px: { xs: 2, sm: 3 }
        }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2,
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'rotate(90deg)',
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              fontWeight: 700,
              color: 'primary.main',
              mr: 4,
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: 'linear-gradient(45deg, #1976d2 30%, #64b5f6 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                letterSpacing: '0.15em',
                background: 'linear-gradient(45deg, #64b5f6 30%, #1976d2 90%)',
                WebkitBackgroundClip: 'text',
              }
            }}
          >
            TRAC
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton
            onClick={onProfileClick}
            sx={{
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
              ml: 2,
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: '100%', 
                height: '100%',
                bgcolor: 'primary.main',
                fontSize: { xs: '1rem', sm: '1.25rem' },
                transition: 'all 0.2s ease',
                border: '2px solid transparent',
                '&:hover': {
                  border: '2px solid',
                  borderColor: 'primary.light',
                  boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)',
                }
              }}
            >
              {currentUser?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            mt: { xs: '56px', sm: '64px' },
            height: { xs: 'calc(100% - 56px)', sm: 'calc(100% - 64px)' },
            transition: 'width 0.3s ease, box-shadow 0.3s ease',
            boxShadow: '2px 0 10px rgba(0,0,0,0.05)',
            '&:hover': {
              boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
            }
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default AdminHeader; 