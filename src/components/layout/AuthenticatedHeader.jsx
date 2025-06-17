import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  ExitToApp as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLE_LABELS = {
  'ADMIN': 'Quản trị viên',
  'FACULTY_MANAGER': 'Quản lý khoa',
  'ACCOUNTANT': 'Kế toán',
  'TEACHER': 'Giáo viên'
};

const ROLE_COLORS = {
  'ADMIN': 'error',
  'FACULTY_MANAGER': 'warning',
  'ACCOUNTANT': 'info',
  'TEACHER': 'success'
};

const AuthenticatedHeader = ({ onMenuToggle, contentWidth, contentMargin }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };

  const getUserDisplayName = () => {
    if (user?.teacher?.fullName) {
      return user.teacher.fullName;
    }
    return user?.username || 'Người dùng';
  };

  const getUserInfo = () => {
    if (user?.teacher) {
      return `${user.teacher.code} - ${user.teacher.department?.shortName || ''}`;
    }
    return user?.username || '';
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{
        width: contentWidth,
        ml: contentMargin,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: (theme) => theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          edge="start"
          onClick={onMenuToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Phần mềm tính tiền dạy cho giáo viên
        </Typography>

        {/* User info and logout */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Chip 
              label={ROLE_LABELS[user?.role] || user?.role} 
              color={ROLE_COLORS[user?.role] || 'default'}
              size="small"
              variant="outlined"
              sx={{ 
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
            />
          </Box>
          
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
              <PersonIcon />
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
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: { mt: 1, minWidth: 200 }
            }}
          >
            {/* User info */}
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {getUserDisplayName()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getUserInfo()}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip 
                  label={ROLE_LABELS[user?.role] || user?.role} 
                  color={ROLE_COLORS[user?.role] || 'default'}
                  size="small"
                />
              </Box>
            </Box>
            
            <Divider />
            
            {/* Profile item */}
            <MenuItem onClick={() => {
              handleMenuClose();
              navigate('/profile');
            }}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText>Thông tin cá nhân</ListItemText>
            </MenuItem>
            
            <Divider />
            
            {/* Logout */}
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Đăng xuất</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AuthenticatedHeader; 