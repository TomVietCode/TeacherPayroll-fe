import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  Cancel as CancelIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const ROLE_LABELS = {
  'ADMIN': 'Quản trị viên hệ thống',
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

const ProfilePage = () => {
  const { user, getCurrentUser } = useAuth();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handlePasswordChange = (field) => (event) => {
    setPasswordData({
      ...passwordData,
      [field]: event.target.value
    });
    setPasswordError('');
  };

  const toggleShowPassword = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Mật khẩu mới không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setPasswordLoading(true);
      await api.patch('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        setChangePasswordOpen(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getAvatarName = (username) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Thông tin cá nhân
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Main Profile Info - Left Column */}
        <Grid item xs={12} md={7}>
          <Card elevation={2}>
            <CardContent sx={{ p: 4 }}>
              {/* Header Section */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: 'primary.main',
                    fontSize: '2.5rem',
                    mr: { xs: 0, sm: 4 },
                    mb: { xs: 2, sm: 0 }
                  }}
                >
                  {getAvatarName(user?.username)}
                </Avatar>
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography variant="h4" component="h2" gutterBottom>
                    {user?.teacher?.fullName || user?.username}
                  </Typography>
                  <Chip
                    label={ROLE_LABELS[user?.role] || user?.role}
                    color={ROLE_COLORS[user?.role] || 'default'}
                    icon={<PersonIcon />}
                    size="large"
                    sx={{ mb: 1 }}
                  />
                  {user?.teacher && (
                    <Typography variant="h6" color="text.secondary">
                      Mã giáo viên: {user.teacher.code}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ mb: 4 }} />

              {/* Account Information */}
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                <PersonIcon sx={{ mr: 1 }} />
                Thông tin tài khoản
              </Typography>

              <Box sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">Tên đăng nhập:</Typography>
                  <Typography variant="body1" fontWeight="medium">{user?.username}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">Vai trò:</Typography>
                  <Typography variant="body1" fontWeight="medium">{ROLE_LABELS[user?.role] || user?.role}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                  <Typography variant="body2" color="text.secondary">Cập nhật lần cuối:</Typography>
                  <Typography variant="body1" fontWeight="medium">{formatDate(user?.updatedAt)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Teacher Info & Actions */}
        <Grid item xs={12} md={5}>
          {/* Teacher Information Card - Only show if user is a teacher */}
          {user?.role === 'TEACHER' && user?.teacher && (
            <Card elevation={2} sx={{ mb: 2, px: 4}}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                  <SchoolIcon sx={{ mr: 1 }} />
                  Thông tin giáo viên
                </Typography>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider'}}>
                    <Typography variant="body2" color="text.secondary">Mã giáo viên:</Typography>
                    <Typography variant="body1" fontWeight="medium">{user.teacher.code}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">Bằng cấp:</Typography>
                    <Typography variant="body1" fontWeight="medium">{user.teacher.degree?.fullName || 'Chưa cập nhật'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">Ngày sinh:</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {user.teacher.dateOfBirth ? new Date(user.teacher.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">Số điện thoại:</Typography>
                    <Typography variant="body1" fontWeight="medium">{user.teacher.phone || 'Chưa cập nhật'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">Email:</Typography>
                    <Typography variant="body1" fontWeight="medium">{user.teacher.email || 'Chưa cập nhật'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body2" color="text.secondary">Khoa:</Typography>
                    <Typography variant="body1" fontWeight="medium">{user.teacher.department?.fullName || 'Chưa cập nhật'}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Actions Card */}
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                Hành động
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<SecurityIcon />}
                  onClick={() => setChangePasswordOpen(true)}
                  fullWidth
                >
                  Đổi mật khẩu
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog 
        open={changePasswordOpen} 
        onClose={() => setChangePasswordOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <SecurityIcon sx={{ mr: 1 }} />
          Đổi mật khẩu
        </DialogTitle>
        <DialogContent>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}
          
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Đổi mật khẩu thành công!
            </Alert>
          )}

          <TextField
            fullWidth
            type={showPasswords.current ? 'text' : 'password'}
            label="Mật khẩu hiện tại"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange('currentPassword')}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword('current')}
                    edge="end"
                  >
                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <TextField
            fullWidth
            type={showPasswords.new ? 'text' : 'password'}
            label="Mật khẩu mới"
            value={passwordData.newPassword}
            onChange={handlePasswordChange('newPassword')}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword('new')}
                    edge="end"
                  >
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <TextField
            fullWidth
            type={showPasswords.confirm ? 'text' : 'password'}
            label="Xác nhận mật khẩu mới"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange('confirmPassword')}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword('confirm')}
                    edge="end"
                  >
                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setChangePasswordOpen(false);
              setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
              });
              setPasswordError('');
            }}
            startIcon={<CancelIcon />}
            disabled={passwordLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            startIcon={<SaveIcon />}
            loading={passwordLoading}
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage; 