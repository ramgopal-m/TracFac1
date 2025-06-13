import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Message as MessageIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

function FacultyHeader({ currentUser, onTabChange, tabValue, onProfileClick, onLogout }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [imageCache, setImageCache] = useState({});

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleTabClick = (index) => {
    onTabChange(index);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const getImagePath = (path, isFaculty = false) => {
    if (!path) return null;
    
    if (imageCache[path]) {
      return imageCache[path];
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
      const fullPath = path;
      setImageCache(prev => ({ ...prev, [path]: fullPath }));
      return fullPath;
    }

    if (isFaculty) {
      const cleanPath = path.replace(/^\/+/, '');
      const fullPath = `http://localhost:5000/${cleanPath}`;
      setImageCache(prev => ({ ...prev, [path]: fullPath }));
      return fullPath;
    }

    const cleanPath = path.replace(/^\/+/, '');
    const fullPath = `http://localhost:5000/${cleanPath}`;
    setImageCache(prev => ({ ...prev, [path]: fullPath }));
    return fullPath;
  };

  const preloadImage = (path, isFaculty = false) => {
    if (!path) return;
    const img = new Image();
    img.src = getImagePath(path, isFaculty);
  };

  useEffect(() => {
    if (currentUser?.profile) {
      preloadImage(currentUser.profile.profilePic, true);
    }
  }, [currentUser]);

  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            selected={tabValue === 0}
            onClick={() => handleTabClick(0)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
                '& .MuiListItemIcon-root': {
                  color: 'inherit',
                },
              },
            }}
          >
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText 
              primary="My Profile"
              primaryTypographyProps={{
                fontWeight: tabValue === 0 ? 600 : 400
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            selected={tabValue === 1}
            onClick={() => handleTabClick(1)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
                '& .MuiListItemIcon-root': {
                  color: 'inherit',
                },
              },
            }}
          >
            <ListItemIcon>
              <SchoolIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Assigned Programs"
              primaryTypographyProps={{
                fontWeight: tabValue === 1 ? 600 : 400
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            selected={tabValue === 2}
            onClick={() => handleTabClick(2)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
                '& .MuiListItemIcon-root': {
                  color: 'inherit',
                },
              },
            }}
          >
            <ListItemIcon>
              <MessageIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Messages"
              primaryTypographyProps={{
                fontWeight: tabValue === 2 ? 600 : 400
              }}
            />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton 
            onClick={onLogout}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Faculty Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={onProfileClick}
              sx={{ 
                p: 0,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <Avatar
                src={getImagePath(currentUser?.profile?.profilePic, true)}
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: 'primary.main',
                  border: '1px solid',
                  borderColor: 'divider',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-avatar.png';
                }}
              >
                {currentUser?.name?.charAt(0)}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 250,
            borderRight: '1px solid',
            borderColor: 'divider'
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default FacultyHeader; 