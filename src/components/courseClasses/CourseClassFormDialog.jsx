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
  FormHelperText,
  Typography
} from '@mui/material';
import { SemesterAPI, SubjectAPI } from '../../services/api';

const CourseClassFormDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  isSubmitting = false,
  latestSemester = null
}) => {
  const [formData, setFormData] = useState({
    semesterId: '',
    subjectId: '',
    numberOfClasses: 1
  });
  const [errors, setErrors] = useState({});
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper function to find the semester closest to current date
  const findClosestSemester = (semestersList) => {
    if (!semestersList || semestersList.length === 0) return null;
    
    const currentDate = new Date();
    
    // Find the semester closest to current date
    let closestSemester = null;
    let minDistance = Infinity;
    
    semestersList.forEach(semester => {
      const startDate = new Date(semester.startDate);
      const endDate = new Date(semester.endDate);
      
      let distance;
      
      // If current date is within the semester period
      if (currentDate >= startDate && currentDate <= endDate) {
        distance = 0; // Perfect match
      } 
      // If current date is before semester starts
      else if (currentDate < startDate) {
        distance = startDate - currentDate;
      }
      // If current date is after semester ends
      else {
        distance = currentDate - endDate;
      }
      
      if (distance < minDistance) {
        minDistance = distance;
        closestSemester = semester;
      }
    });
    
    return closestSemester;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [semestersResponse, subjectsResponse] = await Promise.all([
          SemesterAPI.getAll(),
          SubjectAPI.getAll(),
        ]);
        const semestersList = semestersResponse.data.data || [];
        setSemesters(semestersList);
        setSubjects(subjectsResponse.data.data || []);
        
        // Auto-select closest semester if no latestSemester prop provided
        if (!latestSemester) {
          const closestSemester = findClosestSemester(semestersList);
          if (closestSemester) {
            setFormData(prev => ({ ...prev, semesterId: closestSemester.id }));
            setSelectedAcademicYear(closestSemester.academicYear);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data for form:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, latestSemester]);

  useEffect(() => {
    if (open) {
      // Use provided latestSemester or find closest one
      const targetSemester = latestSemester || findClosestSemester(semesters);
      const initialSemesterId = targetSemester ? targetSemester.id : '';
      const initialAcademicYear = targetSemester ? targetSemester.academicYear : '';
      
      setFormData({
        semesterId: initialSemesterId,
        subjectId: '',
        numberOfClasses: 1
      });
      setSelectedAcademicYear(initialAcademicYear);
      setErrors({});
    }
  }, [open, latestSemester, semesters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'numberOfClasses' ? parseInt(value) || 1 : value 
    }));
    
    // Clear error for this field when user updates it
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.semesterId) {
      newErrors.semesterId = 'Vui lòng chọn kỳ học';
    }
    
    if (!formData.subjectId) {
      newErrors.subjectId = 'Vui lòng chọn học phần';
    }
    
    if (!formData.numberOfClasses || formData.numberOfClasses < 1 || formData.numberOfClasses > 10) {
      newErrors.numberOfClasses = 'Số lớp phải từ 1 đến 10';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
    }
  };

  // Generate academic year options based on semesters
  const academicYears = [...new Set(semesters.map(s => s.academicYear))].sort().reverse();

  // Filter semesters by selected academic year
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const filteredSemesters = selectedAcademicYear 
    ? semesters.filter(s => s.academicYear === selectedAcademicYear)
    : [];

  const handleAcademicYearChange = (e) => {
    setSelectedAcademicYear(e.target.value);
    setFormData(prev => ({ ...prev, semesterId: '' }));
    if (errors.semesterId) {
      setErrors(prev => ({ ...prev, semesterId: null }));
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        Thêm lớp học phần mới
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 4 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <Box sx={{ width: '100%'}}>
            <Grid container spacing={4} sx={{ width: '100%' }}>
              <Grid item xs={12} md={6} sx={{ width: { xs: '100%', md: '50%' } }}>
                <FormControl fullWidth required error={!!errors.academicYear} size="medium" sx={{ minWidth: '100%' }}>
                  <InputLabel>Năm học</InputLabel>
                  <Select
                    value={selectedAcademicYear}
                    onChange={handleAcademicYearChange}
                    label="Năm học"
                    sx={{ minHeight: 56 }}
                    disabled={loading}
                  >
                    {academicYears.map(year => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6} sx={{ width: { xs: '100%', md: '50%' } }}>
                <FormControl fullWidth required error={!!errors.semesterId} size="medium" sx={{ minWidth: '100%' }}>
                  <InputLabel>Kỳ học</InputLabel>
                  <Select
                    name="semesterId"
                    value={formData.semesterId}
                    onChange={handleChange}
                    label="Kỳ học"
                    disabled={!selectedAcademicYear || loading}
                    sx={{ minHeight: 56 }}
                  >
                    {filteredSemesters.map(semester => (
                      <MenuItem key={semester.id} value={semester.id}>
                        {semester.displayName || `${semester.termNumber}${semester.isSupplementary ? '-phụ' : ''}`}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.semesterId && <FormHelperText>{errors.semesterId}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sx={{ width: '100%' }}>
                <FormControl fullWidth required error={!!errors.subjectId} size="medium" sx={{ minWidth: '100%' }}>
                  <InputLabel>Học phần</InputLabel>
                  <Select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleChange}
                    label="Học phần"
                    sx={{ minHeight: 56 }}
                    disabled={loading}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 400
                        }
                      }
                    }}
                  >
                    {subjects.map(subject => (
                      <MenuItem key={subject.id} value={subject.id}>
                        <Box>
                          <Box sx={{ fontWeight: 500 }}>{subject.code}</Box>
                          <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                            {subject.name}
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.subjectId && <FormHelperText>{errors.subjectId}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6} sx={{ width: { xs: '100%', md: '50%' } }}>
                <TextField
                  name="numberOfClasses"
                  label="Số lớp muốn thêm"
                  type="number"
                  value={formData.numberOfClasses}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.numberOfClasses}
                  helperText={errors.numberOfClasses || 'Tối đa 10 lớp'}
                  variant="outlined"
                  size="medium"
                  inputProps={{ min: 1, max: 10 }}
                  disabled={loading}
                  sx={{ 
                    '& .MuiInputBase-root': { minHeight: 56 },
                    minWidth: '100%'
                  }}
                />
              </Grid>

              {loading && (
                <Grid item xs={12} md={6} sx={{ width: { xs: '100%', md: '50%' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', height: '56px', gap: 1 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Đang tải dữ liệu...
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 4, py: 3 }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          color="inherit"
          size="large"
          sx={{ minWidth: 100 }}
        >
          Hủy
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          size="large"
          disabled={loading || isSubmitting}
          sx={{ minWidth: 120 }}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Đang tạo...
            </>
          ) : (
            'Tạo lớp'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseClassFormDialog; 