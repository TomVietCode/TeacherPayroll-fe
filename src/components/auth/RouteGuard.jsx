import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { canAccessPage } from '../../utils/permissions';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Lock as LockIcon, Home as HomeIcon } from '@mui/icons-material';

const RouteGuard = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user can access current page
  if (!canAccessPage(user?.role, location.pathname)) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          p: 3
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            maxWidth: 500,
            width: '100%'
          }}
        >
          <LockIcon
            sx={{
              fontSize: 80,
              color: 'error.main',
              mb: 3
            }}
          />
          <Typography variant="h4" gutterBottom color="error">
            Truy cập bị từ chối
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Vai trò hiện tại: <strong>{user?.role || 'Không xác định'}</strong>
          </Typography>
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/profile', { replace: true })}
            size="large"
          >
            Quay về trang cá nhân
          </Button>
        </Paper>
      </Box>
    );
  }

  // User has access, render the protected component
  return children;
};

export default RouteGuard; 