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
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import viLocale from 'date-fns/locale/vi';

const SemesterFormDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData = null,
  isSubmitting = false
}) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({
    termNumber: 1,
    isSupplementary: false,
    academicYear: '',
    startDate: null,
    endDate: null
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        termNumber: initialData.termNumber || 1,
        isSupplementary: initialData.isSupplementary || false,
        academicYear: initialData.academicYear || '',
        startDate: initialData.startDate ? new Date(initialData.startDate) : null,
        endDate: initialData.endDate ? new Date(initialData.endDate) : null
      });
    } else {
      // Reset form for new semester
      setFormData({
        termNumber: 1,
        isSupplementary: false,
        academicYear: '',
        startDate: null,
        endDate: null
      });
    }
    setErrors({});
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : (name === 'termNumber' ? parseInt(value) : value) 
    }));
    
    // Clear error for this field when user updates it
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleStartDateChange = (date) => {
    setFormData(prev => ({ ...prev, startDate: date }));
    if (errors.startDate) {
      setErrors(prev => ({ ...prev, startDate: null }));
    }
  };

  const handleEndDateChange = (date) => {
    setFormData(prev => ({ ...prev, endDate: date }));
    if (errors.endDate) {
      setErrors(prev => ({ ...prev, endDate: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.termNumber || formData.termNumber < 1 || formData.termNumber > 3) {
      newErrors.termNumber = 'Số kỳ phải từ 1 đến 3';
    }
    
    if (!formData.academicYear.trim()) {
      newErrors.academicYear = 'Vui lòng nhập năm học';
    } else if (!/^\d{4}-\d{4}$/.test(formData.academicYear)) {
      newErrors.academicYear = 'Năm học phải có định dạng YYYY-YYYY';
    } else {
      const [startYear, endYear] = formData.academicYear.split('-').map(Number);
      const currentYear = new Date().getFullYear();
      
      if (startYear < currentYear) {
        newErrors.academicYear = 'Năm bắt đầu không được ở quá khứ';
      } else if (endYear !== startYear + 1) {
        newErrors.academicYear = 'Năm kết thúc phải lớn hơn năm bắt đầu 1 năm';
      }
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'Vui lòng chọn ngày kết thúc';
    }
    
    // Check if end date is at least 60 days after start date
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffInMs = end.getTime() - start.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
      
      if (diffInDays < 60) {
        newErrors.endDate = 'Ngày kết thúc phải cách ngày bắt đầu ít nhất 2 tháng';
      }
    }
    
    // Simplified check: dates should be within the academic year (general year range)
    if (formData.academicYear && formData.startDate && formData.endDate && /^\d{4}-\d{4}$/.test(formData.academicYear)) {
      const [startYear, endYear] = formData.academicYear.split('-').map(Number);
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (start.getFullYear() < startYear || start.getFullYear() > endYear) {
        newErrors.startDate = 'Ngày bắt đầu phải trong khoảng năm học';
      }
      
      if (end.getFullYear() < startYear || end.getFullYear() > endYear) {
        newErrors.endDate = 'Ngày kết thúc phải trong khoảng năm học';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      // Convert dates to ISO strings for API
      const submissionData = {
        ...formData,
        startDate: formData.startDate ? formData.startDate.toISOString() : null,
        endDate: formData.endDate ? formData.endDate.toISOString() : null
      };
      onSubmit(submissionData);
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
        {isEditMode ? 'Chỉnh sửa kỳ học' : 'Thêm kỳ học mới'}
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3 }}>
        <Box sx={{ width: '100%'}}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} width={'25%'}>
              <FormControl fullWidth error={!!errors.termNumber}>
                <InputLabel>Kỳ học</InputLabel>
                <Select
                  name="termNumber"
                  value={formData.termNumber}
                  onChange={handleChange}
                  label="Kỳ học"
                >
                  <MenuItem value={1}>Kỳ 1</MenuItem>
                  <MenuItem value={2}>Kỳ 2</MenuItem>
                  <MenuItem value={3}>Kỳ 3</MenuItem>
                </Select>
                {errors.termNumber && <FormHelperText>{errors.termNumber}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} width={'25%'}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', pt: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isSupplementary"
                      checked={formData.isSupplementary}
                      onChange={handleChange}
                    />
                  }
                  label="Kỳ phụ"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="academicYear"
                label="Năm học"
                value={formData.academicYear}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.academicYear}
                helperText={errors.academicYear || 'VD: 2024-2025'}
                variant="outlined"
                size="medium"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                <DatePicker
                  label="Ngày bắt đầu"
                  value={formData.startDate}
                  onChange={handleStartDateChange}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.startDate,
                      helperText: errors.startDate,
                      size: "medium"
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                <DatePicker
                  label="Ngày kết thúc"
                  value={formData.endDate}
                  onChange={handleEndDateChange}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.endDate,
                      helperText: errors.endDate,
                      size: "medium"
                    }
                  }}
                />
              </LocalizationProvider>
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

export default SemesterFormDialog; 