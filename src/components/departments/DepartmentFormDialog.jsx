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
  CircularProgress
} from '@mui/material';

const DepartmentFormDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData = null,
  isSubmitting = false
}) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({
    fullName: '',
    shortName: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || '',
        shortName: initialData.shortName || '',
        description: initialData.description || ''
      });
    } else {
      // Reset form for new department
      setFormData({
        fullName: '',
        shortName: '',
        description: ''
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
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập tên khoa';
    }
    
    if (!formData.shortName.trim()) {
      newErrors.shortName = 'Vui lòng nhập tên viết tắt';
    } else if (formData.shortName.length > 50) {
      newErrors.shortName = 'Tên viết tắt không được vượt quá 50 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
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
        {isEditMode ? 'Chỉnh sửa khoa' : 'Thêm khoa mới'}
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3 }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} width="50%">
              <TextField
                name="fullName"
                label="Tên đầy đủ"
                value={formData.fullName}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.fullName}
                helperText={errors.fullName}
                variant="outlined"
                size="medium"
              />
            </Grid>
            
            <Grid item xs={12} width="30%">
              <TextField
                name="shortName"
                label="Tên viết tắt"
                value={formData.shortName}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.shortName}
                helperText={errors.shortName}
                variant="outlined"
                size="medium"
              />
            </Grid>
            
            <Grid item xs={12} width="100%">
              <TextField
                name="description"
                label="Mô tả"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                size="medium"
              />
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

export default DepartmentFormDialog; 