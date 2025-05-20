import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Grid,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import { DegreeAPI, DepartmentAPI } from '../../services/api';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import viLocale from 'date-fns/locale/vi';

const TeacherFormDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData = null,
  isSubmitting = false
}) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({
    code: '',
    fullName: '',
    dateOfBirth: null,
    phone: '',
    email: '',
    departmentId: '',
    degreeId: '',
  });
  const [errors, setErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoGenerateCode, setAutoGenerateCode] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [deptsResponse, degreesResponse] = await Promise.all([
          DepartmentAPI.getAll(),
          DegreeAPI.getAll(),
        ]);
        setDepartments(deptsResponse.data.data || []);
        setDegrees(degreesResponse.data.data || []);
      } catch (error) {
        console.error('Failed to fetch data for form:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        fullName: initialData.fullName || '',
        dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth) : null,
        phone: initialData.phone || '',
        email: initialData.email || '',
        departmentId: initialData.departmentId || '',
        degreeId: initialData.degreeId || '',
      });
      setAutoGenerateCode(false);
    } else {
      // Reset form for new teacher
      setFormData({
        code: '',
        fullName: '',
        dateOfBirth: null,
        phone: '',
        email: '',
        departmentId: '',
        degreeId: '',
      });
      setAutoGenerateCode(true);
    }
    setErrors({});
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user updates it
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, dateOfBirth: date }));
    if (errors.dateOfBirth) {
      setErrors(prev => ({ ...prev, dateOfBirth: null }));
    }
  };

  const handleAutoGenerateToggle = (e) => {
    const checked = e.target.checked;
    setAutoGenerateCode(checked);
    
    // Clear code field if auto-generate is turned on
    if (checked) {
      setFormData(prev => ({ ...prev, code: '' }));
      if (errors.code) {
        setErrors(prev => ({ ...prev, code: null }));
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!autoGenerateCode && !formData.code.trim()) {
      newErrors.code = 'Vui lòng nhập mã giáo viên';
    }
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Vui lòng chọn ngày sinh';
    } else {
      const today = new Date();
      if (formData.dateOfBirth > today) {
        newErrors.dateOfBirth = 'Ngày sinh không thể là ngày trong tương lai';
      }
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (formData.phone && !/^\d*$/.test(formData.phone)) {
      newErrors.phone = 'Điện thoại chỉ được chứa số';
    }
    
    if (!formData.departmentId) {
      newErrors.departmentId = 'Vui lòng chọn khoa';
    }
    
    if (!formData.degreeId) {
      newErrors.degreeId = 'Vui lòng chọn bằng cấp';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      // If using auto-generate, don't send code in the payload
      const submissionData = {
        ...formData,
        // Convert date to ISO string for API
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString() : null
      };
      
      // If auto-generating code for new teacher, remove code from payload
      if (autoGenerateCode && !isEditMode) {
        delete submissionData.code;
      }
      
      onSubmit(submissionData);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        {isEditMode ? 'Chỉnh sửa giáo viên' : 'Thêm giáo viên mới'}
      </DialogTitle>
      
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <Grid container spacing={2} py={1}>
            <Grid item xs={12}>
              <Box mb={1} display="flex" alignItems="center">
                <Typography variant="body2" mr={2}>
                  Mã giáo viên:
                </Typography>
                {!isEditMode && (
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={autoGenerateCode} 
                        onChange={handleAutoGenerateToggle}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">Tự động tạo mã</Typography>}
                  />
                )}
              </Box>
              <TextField
                name="code"
                label="Mã giáo viên"
                value={formData.code}
                onChange={handleChange}
                fullWidth
                disabled={isEditMode || autoGenerateCode}
                error={!!errors.code}
                helperText={errors.code}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="fullName"
                label="Họ và tên"
                value={formData.fullName}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.fullName}
                helperText={errors.fullName}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                <DatePicker
                  label="Ngày sinh"
                  value={formData.dateOfBirth}
                  onChange={handleDateChange}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.dateOfBirth,
                      helperText: errors.dateOfBirth,
                      size: "small"
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Điện thoại"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                error={!!errors.phone}
                helperText={errors.phone}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                error={!!errors.email}
                helperText={errors.email}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.departmentId} size="small">
                <InputLabel id="department-select-label">Khoa</InputLabel>
                <Select
                  labelId="department-select-label"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  label="Khoa"
                >
                  {departments.map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.fullName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.departmentId && <FormHelperText>{errors.departmentId}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.degreeId} size="small">
                <InputLabel id="degree-select-label">Bằng cấp</InputLabel>
                <Select
                  labelId="degree-select-label"
                  name="degreeId"
                  value={formData.degreeId}
                  onChange={handleChange}
                  label="Bằng cấp"
                >
                  {degrees.map(degree => (
                    <MenuItem key={degree.id} value={degree.id}>
                      {degree.fullName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.degreeId && <FormHelperText>{errors.degreeId}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Hủy
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Đang lưu...
            </>
          ) : (
            isEditMode ? 'Cập nhật' : 'Thêm mới'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeacherFormDialog; 