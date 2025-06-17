import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment
} from '@mui/material';
import { SemesterAPI } from '../../services/api';

function HourlyRateFormDialog({ open, onClose, onSubmit, initialData = null, loading = false }) {
  const [formData, setFormData] = useState({
    academicYear: '',
    ratePerHour: ''
  });
  const [errors, setErrors] = useState({});
  const [academicYears, setAcademicYears] = useState([]);

  useEffect(() => {
    if (open) {
      fetchAcademicYears();
      if (initialData) {
        setFormData({
          academicYear: initialData.academicYear || '',
          ratePerHour: initialData.ratePerHour || ''
        });
      } else {
        setFormData({
          academicYear: '',
          ratePerHour: ''
        });
      }
      setErrors({});
    }
  }, [open, initialData]);

  const fetchAcademicYears = async () => {
    try {
      const response = await SemesterAPI.getAll();
      const uniqueYears = [...new Set(response.data.data.map(s => s.academicYear))].sort();
      setAcademicYears(uniqueYears);
    } catch (error) {
      console.error('Failed to fetch academic years:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.academicYear) {
      newErrors.academicYear = 'Vui lòng chọn năm học';
    }

    if (!formData.ratePerHour) {
      newErrors.ratePerHour = 'Vui lòng nhập số tiền theo tiết';
    } else {
      const rate = parseFloat(formData.ratePerHour);
      if (isNaN(rate) || rate <= 0) {
        newErrors.ratePerHour = 'Số tiền phải là số dương';
      } else if (rate < 1000) {
        newErrors.ratePerHour = 'Số tiền phải ít nhất 1,000 VNĐ';
      } else if (rate > 1000000) {
        newErrors.ratePerHour = 'Số tiền không được quá 1,000,000 VNĐ';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const submitData = {
        ...formData,
        ratePerHour: parseFloat(formData.ratePerHour)
      };
      onSubmit(submitData);
    }
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? 'Chỉnh sửa định mức tiền theo tiết' : 'Thêm định mức tiền theo tiết'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} width={"30%"}>
            <FormControl fullWidth required error={!!errors.academicYear}>
              <InputLabel>Năm học</InputLabel>
              <Select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                label="Năm học"
                disabled={!!initialData || loading}
              >
                {academicYears.map(year => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
              {errors.academicYear && <FormHelperText>{errors.academicYear}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="ratePerHour"
              label="Số tiền theo tiết"
              type="number"
              value={formData.ratePerHour}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.ratePerHour}
              helperText={errors.ratePerHour || 'Nhập số tiền VNĐ cho một tiết giảng dạy'}
              variant="outlined"
              InputProps={{
                endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                inputProps: { min: 1000, max: 1000000, step: 1000 }
              }}
            />
            {formData.ratePerHour && !errors.ratePerHour && (
              <div style={{ marginTop: '8px', fontSize: '0.875rem', color: '#666' }}>
                Định dạng: {formatNumber(formData.ratePerHour)} VNĐ
              </div>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default HourlyRateFormDialog; 