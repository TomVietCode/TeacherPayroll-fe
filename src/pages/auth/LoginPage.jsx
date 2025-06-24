import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Lock as LockIcon
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
  const navigate = useNavigate();
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
    
    if (result.success) {
      // Redirect to profile page after successful login
      navigate('/profile', { replace: true });
    } else {
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
        background: 'linear-gradient(135deg, #223771 0%, #1e3264 100%)',
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1a2651 0%, #223771 100%)',
                color: 'white',
                p: 4,
                textAlign: 'center'
              }}
            >
              {/* Logo mới */}
              <Box
                component="img"
                src="/src/assets/logo.png"
                alt="Logo"
                sx={{
                  height: 80,
                  mb: 2,
                  filter: 'brightness(1.1)',
                  objectFit: 'contain'
                }}
              />
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 300 }}>
                Đăng nhập
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, fontWeight: 300 }}>
                Hệ thống quản lý tiền dạy Phenikaa University
              </Typography>
            </Box>

            {/* Form */}
            <Box sx={{ p: 4, bgcolor: '#f8f9fa' }}>
              {(error || loginError) && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      color: '#d32f2f'
                    }
                  }}
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
                  <FormControl 
                    fullWidth 
                    error={!!formErrors.role}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'white',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#223771',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#223771',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#223771',
                      }
                    }}
                  >
                    <InputLabel>Vai trò</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      label="Vai trò"
                      startAdornment={
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: '#6c757d' }} />
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
                    fullWidth
                    name="username"
                    label="Tên đăng nhập"
                    value={formData.username}
                    onChange={handleChange}
                    error={!!formErrors.username}
                    helperText={formErrors.username}
                    autoComplete="username"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'white',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#223771',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#223771',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#223771',
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: '#6c757d' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Password */}
                  <TextField
                    fullWidth
                    name="password"
                    label="Mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                    autoComplete="current-password"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'white',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#223771',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#223771',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#223771',
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#6c757d' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleShowPassword}
                            edge="end"
                            sx={{ color: '#6c757d' }}
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
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #223771 0%, #1e3264 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1a2651 0%, #223771 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(34, 55, 113, 0.3)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} color="inherit" />
                        <span>Đang đăng nhập...</span>
                      </Box>
                    ) : (
                      'Đăng nhập'
                    )}
                  </Button>
                </Box>
              </form>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage; 