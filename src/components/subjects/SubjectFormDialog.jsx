import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Grid,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';

const SubjectFormDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData = null,
  isSubmitting = false,
  departments = []
}) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({
    name: '',
    credits: '',
    coefficient: '',
    totalPeriods: '',
    departmentId: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        credits: initialData.credits || '',
        coefficient: initialData.coefficient || '',
        totalPeriods: initialData.totalPeriods || '',
        departmentId: initialData.departmentId || ''
      });
    } else {
      // Reset form for new subject
      setFormData({
        name: '',
        credits: '',
        coefficient: '',
        totalPeriods: '',
        departmentId: ''
      });
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

  const validate = () => {
    const newErrors = {};
    const allowedPeriods = [30, 45, 60, 90, 135];
    
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên học phần';
    }
    
    if (!formData.credits || formData.credits <= 0) {
      newErrors.credits = 'Số tín chỉ phải là số dương';
    }
    
    if (!formData.coefficient || formData.coefficient <= 0) {
      newErrors.coefficient = 'Hệ số học phần phải là số dương';
    }
    
    if (!formData.totalPeriods || !allowedPeriods.includes(Number(formData.totalPeriods))) {
      newErrors.totalPeriods = 'Vui lòng chọn số tiết';
    }
    
    if (!formData.departmentId) {
      newErrors.departmentId = 'Vui lòng chọn khoa';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const submitData = {
        ...formData,
        credits: parseInt(formData.credits),
        coefficient: parseFloat(formData.coefficient),
        totalPeriods: parseInt(formData.totalPeriods)
      };
      onSubmit(submitData);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        {isEditMode ? 'Chỉnh sửa học phần' : 'Thêm học phần mới'}
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3 }}>
        <Box sx={{ width: '100%'}}>
          <Grid container spacing={3}>
            <Grid item xs={12} width={'100%'}>
              <TextField
                name="name"
                label="Tên học phần"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name}
                variant="outlined"
                size="medium"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="credits"
                label="Số tín chỉ"
                type="number"
                value={formData.credits}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.credits}
                helperText={errors.credits}
                variant="outlined"
                size="medium"
                inputProps={{ min: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="coefficient"
                label="Hệ số học phần"
                type="number"
                value={formData.coefficient}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.coefficient}
                helperText={errors.coefficient}
                variant="outlined"
                size="medium"
                inputProps={{ min: 0.1, step: 0.1 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} width={'20%'}>
              <FormControl fullWidth required error={!!errors.totalPeriods}>
                <InputLabel>Số tiết</InputLabel>
                <Select
                  name="totalPeriods"
                  value={formData.totalPeriods}
                  onChange={handleChange}
                  label="Số tiết"
                >
                  <MenuItem value={30}>30</MenuItem>
                  <MenuItem value={45}>45</MenuItem>
                  <MenuItem value={60}>60 </MenuItem>
                  <MenuItem value={90}>90 </MenuItem>
                  <MenuItem value={135}>135 </MenuItem>
                </Select>
                {errors.totalPeriods && (
                  <FormHelperText>{errors.totalPeriods}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} width={'20%'}>
              <FormControl fullWidth required error={!!errors.departmentId}>
                <InputLabel>Khoa phụ trách</InputLabel>
                <Select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  label="Khoa phụ trách"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200
                      }
                    }
                  }}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.fullName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.departmentId && (
                  <FormHelperText>{errors.departmentId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Hủy
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={isSubmitting}
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

export default SubjectFormDialog; 