import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const ROLES = [
  { value: 'ADMIN', label: 'Quản trị viên hệ thống' },
  { value: 'FACULTY_MANAGER', label: 'Quản lý khoa' },
  { value: 'ACCOUNTANT', label: 'Kế toán' },
  { value: 'TEACHER', label: 'Giáo viên' }
];

const LoginPage = () => {
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'ADMIN' // Mặc định là Admin theo yêu cầu
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [loginError, setLoginError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear login error
    if (loginError) {
      setLoginError('');
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Vui lòng nhập tên đăng nhập';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Vui lòng nhập mật khẩu';
    }
    
    if (!formData.role) {
      errors.role = 'Vui lòng chọn vai trò';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setFormErrors({});
    setLoginError('');
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Attempt login
    const result = await login(formData);
    
    if (!result.success) {
      setLoginError(result.error);
    }
  };

  const getRoleDisplayName = (roleValue) => {
    const role = ROLES.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={10}
          sx={{
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                color: 'white',
                p: 4,
                textAlign: 'center'
              }}
            >
              <SchoolIcon sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                Đăng nhập
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Hệ thống quản lý tiền dạy Phenikaa University
              </Typography>
            </Box>

            {/* Form */}
            <Box sx={{ p: 4 }}>
              {(error || loginError) && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 3 }}
                  onClose={() => {
                    setLoginError('');
                  }}
                >
                  {loginError || error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Role Selection */}
                  <FormControl fullWidth error={!!formErrors.role}>
                    <InputLabel>Vai trò</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      label="Vai trò"
                      startAdornment={
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      }
                    >
                      {ROLES.map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          {role.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.role && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {formErrors.role}
                      </Typography>
                    )}
                  </FormControl>

                  {/* Username */}
                  <TextField
                    name="username"
                    label="Tên đăng nhập"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    error={!!formErrors.username}
                    helperText={formErrors.username}
                    fullWidth
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Password */}
                  <TextField
                    name="password"
                    label="Mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleShowPassword}
                            edge="end"
                            tabIndex={-1}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                        Đang đăng nhập...
                      </>
                    ) : (
                      'Đăng nhập'
                    )}
                  </Button>
                </Box>
              </form>

              {/* Info */}
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Đang đăng nhập với vai trò: <strong>{getRoleDisplayName(formData.role)}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Liên hệ quản trị viên nếu bạn gặp vấn đề đăng nhập
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage; 