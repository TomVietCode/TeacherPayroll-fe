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
import { format } from 'date-fns';
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
    assignedDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'active',
    workload: '',
    notes: '',
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

      // Ensure data is always arrays
      setTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : []);
      setCourseClasses(Array.isArray(courseClassesRes.data) ? courseClassesRes.data : []);
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
      const assignment = response.data;
      
      setFormData({
        teacherId: assignment.teacherId,
        courseClassId: assignment.courseClassId,
        assignedDate: format(new Date(assignment.assignedDate), 'yyyy-MM-dd'),
        status: assignment.status,
        workload: assignment.workload?.toString() || '',
        notes: assignment.notes || '',
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

    if (!formData.assignedDate) {
      newErrors.assignedDate = 'Vui lòng chọn ngày phân công';
    } else {
      const assignedDate = new Date(formData.assignedDate);
      if (assignedDate > new Date()) {
        newErrors.assignedDate = 'Ngày phân công không thể trong tương lai';
      }
    }

    if (formData.workload && (isNaN(formData.workload) || parseFloat(formData.workload) < 0)) {
      newErrors.workload = 'Khối lượng công việc phải là số dương';
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
        assignedDate: formData.assignedDate,
        status: formData.status,
        workload: formData.workload ? parseFloat(formData.workload) : undefined,
        notes: formData.notes || undefined,
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
      setError(err.response?.data?.message || `Không thể ${isEditing ? 'cập nhật' : 'tạo'} phân công`);
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
          <Grid container spacing={3}>
            {/* Form Fields */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thông tin phân công
                  </Typography>

                  <Grid container spacing={3}>
                    {/* Teacher Selection */}
                    <Grid item xs={12}>
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
                    <Grid item xs={12}>
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
                          <Box component="li" {...props}>
                            <Box>
                              <Typography variant="body1">
                                {option.name} ({option.code})
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Học phần: {option.subject?.name} | 
                                Kỳ học: {option.semester?.academicYear} Kỳ {option.semester?.termNumber} |
                                Sinh viên: {option.studentCount}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      />
                    </Grid>

                    {/* Assignment Date */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Ngày phân công *"
                        type="date"
                        value={formData.assignedDate}
                        onChange={(e) => handleFormChange('assignedDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.assignedDate}
                        helperText={errors.assignedDate}
                      />
                    </Grid>

                    {/* Status */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                          value={formData.status}
                          onChange={(e) => handleFormChange('status', e.target.value)}
                          label="Trạng thái"
                        >
                          <MenuItem value="active">Đang hoạt động</MenuItem>
                          <MenuItem value="inactive">Tạm dừng</MenuItem>
                          <MenuItem value="completed">Hoàn thành</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Workload */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Khối lượng công việc (Tùy chọn)"
                        type="number"
                        value={formData.workload}
                        onChange={(e) => handleFormChange('workload', e.target.value)}
                        placeholder="Số tiết"
                        error={!!errors.workload}
                        helperText={errors.workload || 'Để trống để sử dụng mặc định từ học phần'}
                        inputProps={{ min: 0, step: 0.5 }}
                      />
                    </Grid>

                    {/* Notes */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Ghi chú (Tùy chọn)"
                        multiline
                        rows={4}
                        value={formData.notes}
                        onChange={(e) => handleFormChange('notes', e.target.value)}
                        placeholder="Thêm ghi chú cho phân công này..."
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Summary Panel */}
            <Grid item xs={12} md={4}>
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
                        Kỳ học: {getSelectedCourseClass()?.semester?.academicYear} Kỳ {getSelectedCourseClass()?.semester?.termNumber}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="primary">
                      Chi tiết phân công
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Ngày: {formData.assignedDate ? format(new Date(formData.assignedDate), 'dd/MM/yyyy') : 'Chưa đặt'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Trạng thái: {formData.status === 'active' ? 'Đang hoạt động' : formData.status === 'inactive' ? 'Tạm dừng' : 'Hoàn thành'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Khối lượng: {formData.workload || 'Mặc định'} tiết
                    </Typography>
                  </Box>

                  {formData.notes && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="primary">
                        Ghi chú
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formData.notes}
                      </Typography>
                    </Box>
                  )}
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
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssignmentForm; 