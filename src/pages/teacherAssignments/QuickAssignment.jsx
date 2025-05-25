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
  CardActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  Tooltip,
  Switch,
  FormControlLabel,
  Slider,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Preview as PreviewIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { TeacherAssignmentAPI, TeacherAPI, DepartmentAPI, SemesterAPI } from '../../services/api';

const QuickAssignment = ({ onSuccess }) => {
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    teacherId: '',
    semesterId: '',
    departmentId: '',
    unassignedOnly: true,
    maxClasses: 10,
    notes: '',
  });

  // Preview state
  const [previewClasses, setPreviewClasses] = useState([]);
  const [assignmentResult, setAssignmentResult] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);

  const steps = [
    {
      label: 'Chọn giáo viên',
      description: 'Chọn giáo viên để phân công lớp học',
    },
    {
      label: 'Cấu hình bộ lọc',
      description: 'Thiết lập tùy chọn cho việc chọn lớp tự động',
    },
    {
      label: 'Xem trước & Xác nhận',
      description: 'Xem lại các lớp được đề xuất và xác nhận phân công',
    },
  ];

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [teachersRes, departmentsRes, semestersRes] = await Promise.all([
        TeacherAPI.getAll(),
        DepartmentAPI.getAll(),
        SemesterAPI.getAll(),
      ]);

      // Ensure all data is arrays
      setTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : []);
      setDepartments(Array.isArray(departmentsRes.data) ? departmentsRes.data : []);
      setSemesters(Array.isArray(semestersRes.data) ? semestersRes.data : []);
    } catch (err) {
      setError('Không thể tải dữ liệu ban đầu');
      console.error('Error loading data:', err);
      // Set empty arrays on error
      setTeachers([]);
      setDepartments([]);
      setSemesters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Auto-set department based on selected teacher
    if (field === 'teacherId' && value) {
      const selectedTeacher = teachers.find(t => t.id === value);
      if (selectedTeacher && !formData.departmentId) {
        setFormData(prev => ({
          ...prev,
          departmentId: selectedTeacher.departmentId,
        }));
      }
    }
  };

  const handleNext = () => {
    if (activeStep === 1) {
      // Preview classes before final step
      previewAssignment();
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData({
      teacherId: '',
      semesterId: '',
      departmentId: '',
      unassignedOnly: true,
      maxClasses: 10,
      notes: '',
    });
    setPreviewClasses([]);
    setAssignmentResult(null);
  };

  const previewAssignment = async () => {
    try {
      setLoading(true);
      const params = {
        semesterId: formData.semesterId,
        departmentId: formData.departmentId,
        unassignedOnly: formData.unassignedOnly,
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await TeacherAssignmentAPI.getUnassignedClasses(params);
      const classes = Array.isArray(response.data) ? response.data.slice(0, formData.maxClasses) : [];
      setPreviewClasses(classes);
    } catch (err) {
      setError('Không thể xem trước các lớp học');
      console.error('Error previewing classes:', err);
      setPreviewClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const executeQuickAssignment = async () => {
    try {
      setLoading(true);
      const assignmentData = {
        teacherId: formData.teacherId,
        semesterId: formData.semesterId,
        departmentId: formData.departmentId,
        unassignedOnly: formData.unassignedOnly,
        maxClasses: formData.maxClasses,
        notes: formData.notes,
      };

      const response = await TeacherAssignmentAPI.quickAssignment(assignmentData);
      setAssignmentResult(response.data);
      setSuccess(response.message);
      setActiveStep(3); // Move to success step
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          handleReset();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể thực hiện phân công nhanh');
      console.error('Error executing assignment:', err);
    } finally {
      setLoading(false);
      setConfirmDialog(false);
    }
  };

  const getSelectedTeacher = () => {
    return teachers.find(t => t.id === formData.teacherId);
  };

  const getSelectedDepartment = () => {
    return departments.find(d => d.id === formData.departmentId);
  };

  const getSelectedSemester = () => {
    return semesters.find(s => s.id === formData.semesterId);
  };

  const canProceedToNext = () => {
    switch (activeStep) {
      case 0:
        return formData.teacherId;
      case 1:
        return true; // Can always proceed from filters
      case 2:
        return previewClasses.length > 0;
      default:
        return false;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Chọn giáo viên
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Giáo viên</InputLabel>
                <Select
                  value={formData.teacherId}
                  onChange={(e) => handleFormChange('teacherId', e.target.value)}
                  label="Giáo viên"
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
              </FormControl>

              {formData.teacherId && (
                <Card variant="outlined" sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Thông tin giáo viên đã chọn
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Tên: {getSelectedTeacher()?.fullName}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Mã: {getSelectedTeacher()?.code}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Khoa: {getSelectedTeacher()?.department?.fullName}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Email: {getSelectedTeacher()?.email || 'Không có'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Cấu hình bộ lọc thông minh
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Kỳ học (Tùy chọn)</InputLabel>
                    <Select
                      value={formData.semesterId}
                      onChange={(e) => handleFormChange('semesterId', e.target.value)}
                      label="Kỳ học (Tùy chọn)"
                    >
                      <MenuItem value="">Tất cả kỳ học</MenuItem>
                      {semesters.map((semester) => (
                        <MenuItem key={semester.id} value={semester.id}>
                          {semester.academicYear} - Kỳ {semester.termNumber}
                          {semester.isSupplementary && ' (Phụ)'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Khoa</InputLabel>
                    <Select
                      value={formData.departmentId}
                      onChange={(e) => handleFormChange('departmentId', e.target.value)}
                      label="Khoa"
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.fullName} ({dept.shortName})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.unassignedOnly}
                        onChange={(e) => handleFormChange('unassignedOnly', e.target.checked)}
                      />
                    }
                    label="Chỉ phân công cho các lớp chưa có giáo viên"
                  />
                  <Typography variant="caption" display="block" color="text.secondary">
                    Khuyến nghị: Tập trung vào các lớp cần giáo viên
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography gutterBottom>
                    Số lớp tối đa: {formData.maxClasses}
                  </Typography>
                  <Slider
                    value={formData.maxClasses}
                    onChange={(e, value) => handleFormChange('maxClasses', value)}
                    min={1}
                    max={50}
                    marks={[
                      { value: 1, label: '1' },
                      { value: 10, label: '10' },
                      { value: 25, label: '25' },
                      { value: 50, label: '50' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ghi chú (Tùy chọn)"
                    multiline
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder="Thêm ghi chú cho phân công này..."
                  />
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Phân công thông minh:</strong> Hệ thống sẽ tự động tìm các lớp phù hợp 
                  dựa trên bộ lọc của bạn. Các lớp thuộc khoa của giáo viên sẽ được ưu tiên.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PreviewIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Xem trước phân công
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="primary">
                        Giáo viên
                      </Typography>
                      <Typography variant="body1">
                        {getSelectedTeacher()?.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getSelectedTeacher()?.department?.fullName}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="primary">
                        Bộ lọc đã áp dụng
                      </Typography>
                      <Typography variant="body2">
                        Khoa: {getSelectedDepartment()?.shortName || 'Khoa của giáo viên'}
                      </Typography>
                      <Typography variant="body2">
                        Kỳ học: {getSelectedSemester()?.academicYear || 'Tất cả'} 
                        {getSelectedSemester() && ` - Kỳ ${getSelectedSemester().termNumber}`}
                      </Typography>
                      <Typography variant="body2">
                        Chỉ lớp chưa phân công: {formData.unassignedOnly ? 'Có' : 'Không'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="primary">
                        Lớp tìm thấy
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {previewClasses.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tối đa: {formData.maxClasses}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : previewClasses.length > 0 ? (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Các lớp sẽ được phân công:
                  </Typography>
                  <List>
                    {previewClasses.map((courseClass, index) => (
                      <ListItem key={courseClass.id} divider>
                        <ListItemText
                          primary={courseClass.name}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                Học phần: {courseClass.subject?.name} ({courseClass.subject?.credits} tín chỉ)
                              </Typography>
                              <Typography variant="caption" display="block">
                                Kỳ học: {courseClass.semester?.academicYear} - Kỳ {courseClass.semester?.termNumber}
                              </Typography>
                              <Typography variant="caption" display="block">
                                Sinh viên: {courseClass.studentCount} | Tiết: {courseClass.subject?.totalPeriods}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label={`${index + 1}`}
                            size="small"
                            color="primary"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </>
              ) : (
                <Alert severity="warning">
                  Không tìm thấy lớp phù hợp với bộ lọc hiện tại. 
                  Hãy thử điều chỉnh tiêu chí hoặc bỏ bớt một số bộ lọc.
                </Alert>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Phân công hoàn thành thành công!
              </Typography>
              
              {assignmentResult && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Tóm tắt phân công
                  </Typography>
                  <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h4" color="success.main">
                            {assignmentResult.assignedCount}
                          </Typography>
                          <Typography variant="caption">
                            Lớp đã phân công
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body1" fontWeight="medium">
                            {assignmentResult.teacherName}
                          </Typography>
                          <Typography variant="caption">
                            Giáo viên
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {assignmentResult.assignedClasses && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Các lớp đã phân công:
                      </Typography>
                      <List dense>
                        {assignmentResult.assignedClasses.map((cls) => (
                          <ListItem key={cls.id}>
                            <ListItemText
                              primary={cls.name}
                              secondary={`${cls.subject} - ${cls.semester}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={handleReset}
                startIcon={<RefreshIcon />}
              >
                Bắt đầu phân công mới
              </Button>
            </CardActions>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          <SpeedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Phân công nhanh
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Phân công giáo viên thông minh với bộ lọc tự động
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="h6">{step.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                {renderStepContent(index)}
                
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={index === 2 ? () => setConfirmDialog(true) : handleNext}
                    disabled={!canProceedToNext() || loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                    sx={{ mr: 1 }}
                  >
                    {index === 2 ? 'Thực hiện phân công' : 'Tiếp theo'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                  >
                    Quay lại
                  </Button>
                  {index === 1 && (
                    <Button
                      onClick={previewAssignment}
                      startIcon={<PreviewIcon />}
                      disabled={loading}
                    >
                      Xem trước lớp học
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Xác nhận phân công nhanh</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Bạn có chắc chắn muốn phân công <strong>{getSelectedTeacher()?.fullName}</strong> cho{' '}
            <strong>{previewClasses.length}</strong> lớp học?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hành động này sẽ tạo {previewClasses.length} phân công giáo viên mới.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Hủy</Button>
          <Button
            onClick={executeQuickAssignment}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            Xác nhận phân công
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notifications */}
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

export default QuickAssignment; 