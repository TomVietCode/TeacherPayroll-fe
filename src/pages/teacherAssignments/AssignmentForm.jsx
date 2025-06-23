import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Autocomplete,
  FormHelperText,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { TeacherAssignmentAPI, TeacherAPI, CourseClassAPI } from '../../services/api';

const AssignmentForm = () => {
  const { id } = useParams(); // For editing existing assignment
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // State management
  const [teachers, setTeachers] = useState([]);
  const [courseClasses, setCourseClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    teacherId: '',
    courseClassId: '',
  });

  // Validation state
  const [errors, setErrors] = useState({});

  // Load initial data
  useEffect(() => {
    loadInitialData();
    if (isEditing) {
      loadAssignment();
    }
  }, [id]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [teachersRes, courseClassesRes] = await Promise.all([
        TeacherAPI.getAll(),
        CourseClassAPI.getAll(),
      ]);

      // Fix: axios response.data contains server response, server response has data property
      const teachersData = teachersRes.data?.data || teachersRes.data;
      const courseClassesData = courseClassesRes.data?.data || courseClassesRes.data;

      // Ensure data is always arrays
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      setCourseClasses(Array.isArray(courseClassesData) ? courseClassesData : []);
    } catch (err) {
      setError('Không thể tải dữ liệu ban đầu');
      console.error('Error loading data:', err);
      // Set empty arrays on error
      setTeachers([]);
      setCourseClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const response = await TeacherAssignmentAPI.getById(id);
      const assignment = response.data?.data || response.data;
      
      setFormData({
        teacherId: assignment.teacher.id,
        courseClassId: assignment.courseClass.id,
      });
    } catch (err) {
      setError('Không thể tải thông tin phân công');
      console.error('Error loading assignment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.teacherId) {
      newErrors.teacherId = 'Vui lòng chọn giáo viên';
    }

    if (!formData.courseClassId) {
      newErrors.courseClassId = 'Vui lòng chọn lớp học phần';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const submitData = {
        teacherId: formData.teacherId,
        courseClassId: formData.courseClassId,
      };

      if (isEditing) {
        await TeacherAssignmentAPI.update(id, submitData);
        setSuccess('Cập nhật phân công thành công');
      } else {
        await TeacherAssignmentAPI.create(submitData);
        setSuccess('Tạo phân công thành công');
      }

      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/teacher-assignments');
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Không thể ${isEditing ? 'cập nhật' : 'tạo'} phân công`;
      
      // Handle specific error cases
      if (err.response?.status === 409) {
        if (errorMessage.includes('already assigned to')) {
          setError(errorMessage);
        } else {
          setError('Lớp học phần này đã được phân công cho giáo viên khác. Vui lòng chọn lớp khác.');
        }
      } else {
        setError(errorMessage);
      }
      
      console.error('Error saving assignment:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/teacher-assignments');
  };

  const getSelectedTeacher = () => {
    return teachers.find(t => t.id === formData.teacherId);
  };

  const getSelectedCourseClass = () => {
    return courseClasses.find(c => c.id === formData.courseClassId);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleCancel} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1">
            <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {isEditing ? 'Chỉnh sửa phân công' : 'Tạo phân công mới'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {isEditing ? 'Cập nhật thông tin phân công giáo viên' : 'Tạo phân công giáo viên cho lớp học phần'}
          </Typography>
        </Box>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3} >
            {/* Form Fields */}
            <Grid item xs={12} md={8} width={"50%"}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thông tin phân công
                  </Typography>

                  <Grid container spacing={3} >
                    {/* Teacher Selection */}
                    <Grid item xs={12} width={"100%"}>
                      <FormControl fullWidth error={!!errors.teacherId}>
                        <InputLabel>Giáo viên *</InputLabel>
                        <Select
                          value={formData.teacherId}
                          onChange={(e) => handleFormChange('teacherId', e.target.value)}
                          label="Giáo viên *"
                        >
                          {teachers.map((teacher) => (
                            <MenuItem key={teacher.id} value={teacher.id}>
                              <Box>
                                <Typography variant="body1">{teacher.fullName}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {teacher.code} - {teacher.department?.shortName}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.teacherId && <FormHelperText>{errors.teacherId}</FormHelperText>}
                      </FormControl>
                    </Grid>

                    {/* Course Class Selection */}
                    <Grid item xs={12} width={"100%"}>
                      <Autocomplete
                        options={courseClasses}
                        getOptionLabel={(option) => `${option.name} (${option.code}) - ${option.subject?.name}`}
                        value={getSelectedCourseClass() || null}
                        onChange={(event, newValue) => {
                          handleFormChange('courseClassId', newValue?.id || '');
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Lớp học phần *"
                            error={!!errors.courseClassId}
                            helperText={errors.courseClassId}
                          />
                        )}
                        renderOption={(props, option) => (
                          <Box component="li" {...props} width={"100%"}>
                            <Box>
                              <Typography variant="body1">
                                {option.name} ({option.code})
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Học phần: {option.subject?.name} | 
                                Kỳ học: {option.semester?.academicYear} HK{option.semester?.termNumber} |
                                Sinh viên: {option.studentCount}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Summary Panel */}
            <Grid item xs={12} md={4} width={"40%"}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tóm tắt phân công
                  </Typography>

                  {formData.teacherId && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="primary">
                        <PersonIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 'small' }} />
                        Giáo viên
                      </Typography>
                      <Typography variant="body2">
                        {getSelectedTeacher()?.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getSelectedTeacher()?.code} - {getSelectedTeacher()?.department?.fullName}
                      </Typography>
                    </Box>
                  )}

                  {formData.courseClassId && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="primary">
                        <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 'small' }} />
                        Lớp học phần
                      </Typography>
                      <Typography variant="body2">
                        {getSelectedCourseClass()?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Mã: {getSelectedCourseClass()?.code}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Học phần: {getSelectedCourseClass()?.subject?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Tín chỉ: {getSelectedCourseClass()?.subject?.credits}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Sinh viên: {getSelectedCourseClass()?.studentCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Kỳ học: {getSelectedCourseClass()?.semester?.academicYear} HK{getSelectedCourseClass()?.semester?.termNumber}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="primary">
                      Chi tiết phân công
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Giáo viên: {getSelectedTeacher()?.fullName || 'Chưa chọn'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Lớp học phần: {getSelectedCourseClass()?.name || 'Chưa chọn'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {saving ? 'Đang lưu...' : (isEditing ? 'Cập nhật phân công' : 'Tạo phân công')}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={saving}
                  startIcon={<CancelIcon />}
                >
                  Hủy
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError('')} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success" variant="filled">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssignmentForm; 