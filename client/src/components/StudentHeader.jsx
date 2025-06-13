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
} from '@mui/icons-material';

function StudentHeader({ currentUser, onTabChange, tabValue, onProfileClick }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
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

  const getImagePath = (path) => {
    if (!path) return null;
    
    if (imageCache[path]) {
      return imageCache[path];
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
      const fullPath = path;
      setImageCache(prev => ({ ...prev, [path]: fullPath }));
      return fullPath;
    }

    const cleanPath = path.replace(/^\/+/, '');
    const fullPath = `http://localhost:5000/${cleanPath}`;
    setImageCache(prev => ({ ...prev, [path]: fullPath }));
    return fullPath;
  };

  const preloadImage = (path) => {
    if (!path) return;
    const img = new Image();
    img.src = getImagePath(path);
  };

  useEffect(() => {
    if (currentUser?.profile?.profilePic) {
      preloadImage(currentUser.profile.profilePic);
    }
  }, [currentUser]);

  const drawer = (
    <Box sx={{ width: 240 }}>
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            selected={tabValue === 0}
            onClick={() => handleTabClick(0)}
            sx={{
              py: 2,
              px: 3,
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
              py: 2,
              px: 3,
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
              primary="My Programs"
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
              py: 2,
              px: 3,
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
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: theme.zIndex.drawer + 1
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
              color: 'text.primary',
              fontWeight: 600
            }}
          >
            Student Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={onProfileClick}
              sx={{ 
                p: 0,
                '&:hover': {
                  backgroundColor: 'transparent'
                }
              }}
            >
              <Avatar
                src={getImagePath(currentUser?.profile?.profilePic)}
                alt={currentUser?.name}
                sx={{ 
                  width: 40, 
                  height: 40,
                  bgcolor: 'primary.main',
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
            width: 240,
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

export default StudentHeader; 