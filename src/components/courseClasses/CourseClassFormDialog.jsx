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
  Typography,
  Autocomplete
} from '@mui/material';
import { SemesterAPI, SubjectAPI, DepartmentAPI } from '../../services/api';

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
    numberOfClasses: 1,
    maxStudents: ''
  });
  const [errors, setErrors] = useState({});
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [filteredSubjects, setFilteredSubjects] = useState([]);
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
        const [semestersResponse, subjectsResponse, departmentsResponse] = await Promise.all([
          SemesterAPI.getAll(),
          SubjectAPI.getAll(),
          DepartmentAPI.getAll(),
        ]);
        const semestersList = semestersResponse.data.data || [];
        const subjectsList = subjectsResponse.data.data || [];
        const departmentsList = departmentsResponse.data.data || [];
        
        setSemesters(semestersList);
        setSubjects(subjectsList);
        setDepartments(departmentsList);
        setFilteredSubjects(subjectsList); // Initialize filtered subjects
        
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

  // Filter subjects when department changes
  useEffect(() => {
    if (selectedDepartment) {
      const filtered = subjects.filter(subject => subject.department?.id === selectedDepartment);
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects(subjects);
    }
    // Reset selected subject when department changes
    setFormData(prev => ({ ...prev, subjectId: '' }));
  }, [selectedDepartment, subjects]);

  useEffect(() => {
    if (open) {
      // Use provided latestSemester or find closest one
      const targetSemester = latestSemester || findClosestSemester(semesters);
      const initialSemesterId = targetSemester ? targetSemester.id : '';
      const initialAcademicYear = targetSemester ? targetSemester.academicYear : '';
      
      setFormData({
        semesterId: initialSemesterId,
        subjectId: '',
        numberOfClasses: 1,
        maxStudents: ''
      });
      setSelectedAcademicYear(initialAcademicYear);
      setSelectedDepartment('');
      setErrors({});
    }
  }, [open, latestSemester, semesters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === 'numberOfClasses') {
      processedValue = parseInt(value) || 1;
    } else if (name === 'maxStudents') {
      processedValue = value === '' ? '' : (parseInt(value) || '');
    }
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: processedValue
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
    
    if (!selectedDepartment) {
      newErrors.departmentId = 'Vui lòng chọn khoa';
    }
    
    if (!formData.subjectId) {
      newErrors.subjectId = 'Vui lòng chọn học phần';
    }
    
    if (!formData.numberOfClasses || formData.numberOfClasses < 1 || formData.numberOfClasses > 10) {
      newErrors.numberOfClasses = 'Số lớp phải từ 1 đến 10';
    }
    
    if (!formData.maxStudents || typeof formData.maxStudents === 'string' && formData.maxStudents === '' || formData.maxStudents < 1 || formData.maxStudents > 1000) {
      newErrors.maxStudents = 'Số sinh viên tối đa phải từ 1 đến 1000';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
    }
  };

  // Generate academic year options from semesters - sort from smallest to largest
  const academicYears = [...new Set(semesters.map(s => s.academicYear))].sort();

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
      maxWidth="md" 
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
              <Grid item xs={12} md={6} width={'30%'}>
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

              <Grid item xs={12} md={6} width={'30%'}>
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
              
              <Grid item xs={12} md={6} width={'45%'}>
                <FormControl fullWidth required error={!!errors.departmentId} size="medium" sx={{ minWidth: '100%' }}>
                  <InputLabel>Khoa</InputLabel>
                  <Select
                    value={selectedDepartment}
                    onChange={(e) => {
                      setSelectedDepartment(e.target.value);
                      if (errors.departmentId) {
                        setErrors(prev => ({ ...prev, departmentId: null }));
                      }
                    }}
                    label="Khoa"
                    sx={{ minHeight: 56 }}
                    disabled={loading}
                  >
                    <MenuItem value="">
                      <em>Chọn khoa trước</em>
                    </MenuItem>
                    {departments.map(dept => (
                      <MenuItem key={dept.id} value={dept.id}>
                        <Box>
                          <Typography>
                            {dept.fullName}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.departmentId && <FormHelperText>{errors.departmentId}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6} width={'45%'}>
                <Autocomplete
                  value={filteredSubjects.find(subject => subject.id === formData.subjectId) || null}
                  onChange={(event, newValue) => {
                    setFormData(prev => ({ ...prev, subjectId: newValue ? newValue.id : '' }));
                    // Clear error for this field when user updates it
                    if (errors.subjectId) {
                      setErrors(prev => ({ ...prev, subjectId: null }));
                    }
                  }}
                  options={filteredSubjects}
                  getOptionLabel={(option) => `${option.name}(${option.code})`}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1.5 }}>
                      <Box sx={{ width: '100%', py: 0.5}}>
                        <Typography variant="body2" sx={{ fontWeight: 400, color: 'text.primary'}}>
                          {option.name} ({option.code})
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Học phần *"
                      placeholder={selectedDepartment ? "Tìm kiếm học phần..." : "Vui lòng chọn khoa trước"}
                      variant="outlined"
                      fullWidth
                      error={!!errors.subjectId}
                      helperText={errors.subjectId || (selectedDepartment ? `${filteredSubjects.length} học phần có sẵn` : 'Chọn khoa để hiển thị học phần')}
                      sx={{ 
                        '& .MuiInputBase-root': { minHeight: 56 },
                        minWidth: '100%'
                      }}
                    />
                  )}
                  disabled={loading || !selectedDepartment}
                  filterOptions={(options, { inputValue }) => {
                    const filterValue = inputValue.toLowerCase();
                    return options.filter(option =>
                      option.code.toLowerCase().includes(filterValue) ||
                      option.name.toLowerCase().includes(filterValue)
                    );
                  }}
                  ListboxProps={{
                    style: {
                      maxHeight: 400
                    }
                  }}
                  size="medium"
                  sx={{ minWidth: '100%' }}
                  noOptionsText={selectedDepartment ? "Không tìm thấy học phần" : "Vui lòng chọn khoa trước"}
                />
              </Grid>
              
              <Grid item xs={12} md={6} width={'30%'}>
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

              <Grid item xs={12} md={6} sx={{ width: { xs: '100%', md: '50%' } }}>
                <TextField
                  name="maxStudents"
                  label="Số sinh viên tối đa"
                  type="number"
                  value={formData.maxStudents}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.maxStudents}
                  helperText={errors.maxStudents || 'Tối đa 1000 sinh viên'}
                  variant="outlined"
                  size="medium"
                  inputProps={{ min: 1, max: 1000 }}
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