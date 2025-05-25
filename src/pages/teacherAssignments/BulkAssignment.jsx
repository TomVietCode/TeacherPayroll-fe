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
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  Divider,
  Tooltip,
  FormControlLabel,
  Switch,
  Badge,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  SelectAll as SelectAllIcon,
  Clear as ClearIcon,
  Send as SendIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { TeacherAssignmentAPI, TeacherAPI, CourseClassAPI, DepartmentAPI, SemesterAPI } from '../../services/api';

const BulkAssignment = ({ onSuccess }) => {
  // State management
  const [teachers, setTeachers] = useState([]);
  const [courseClasses, setCourseClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [assignmentDate, setAssignmentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');

  // Filter state
  const [filters, setFilters] = useState({
    semesterId: '',
    departmentId: '',
    search: '',
    unassignedOnly: true,
  });

  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load course classes when filters change
  useEffect(() => {
    loadCourseClasses();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [teachersRes, departmentsRes, semestersRes] = await Promise.all([
        TeacherAPI.getAll(),
        DepartmentAPI.getAll(),
        SemesterAPI.getAll(),
      ]);

      setTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : []);
      setDepartments(Array.isArray(departmentsRes.data) ? departmentsRes.data : []);
      setSemesters(Array.isArray(semestersRes.data) ? semestersRes.data : []);
    } catch (err) {
      setError('Không thể tải dữ liệu ban đầu');
      console.error('Error loading data:', err);
      setTeachers([]);
      setDepartments([]);
      setSemesters([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseClasses = async () => {
    try {
      setLoading(true);
      
      if (filters.unassignedOnly) {
        // Use the unassigned classes endpoint
        const params = {
          semesterId: filters.semesterId,
          departmentId: filters.departmentId,
        };
        
        // Remove empty params
        Object.keys(params).forEach(key => {
          if (!params[key]) delete params[key];
        });

        const response = await TeacherAssignmentAPI.getUnassignedClasses(params);
        let classes = Array.isArray(response.data) ? response.data : [];

        // Apply search filter on frontend
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          classes = classes.filter(cls => 
            cls.name.toLowerCase().includes(searchLower) ||
            cls.code.toLowerCase().includes(searchLower) ||
            cls.subject?.name.toLowerCase().includes(searchLower)
          );
        }

        setCourseClasses(classes);
      } else {
        // Use regular course classes endpoint
        const params = {
          semesterId: filters.semesterId,
          search: filters.search,
        };

        // Remove empty params
        Object.keys(params).forEach(key => {
          if (!params[key]) delete params[key];
        });

        const response = await CourseClassAPI.getAll(params);
        let classes = Array.isArray(response.data) ? response.data : [];

        // Apply department filter on frontend if needed
        if (filters.departmentId) {
          classes = classes.filter(cls => 
            cls.subject?.departmentId === filters.departmentId
          );
        }

        setCourseClasses(classes);
      }
    } catch (err) {
      setError('Không thể tải danh sách lớp học');
      console.error('Error loading course classes:', err);
      setCourseClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    setSelectedClasses([]); // Clear selections when filters change
  };

  const handleClassSelection = (classId) => {
    setSelectedClasses(prev => {
      if (prev.includes(classId)) {
        return prev.filter(id => id !== classId);
      } else {
        return [...prev, classId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedClasses.length === courseClasses.length) {
      setSelectedClasses([]);
    } else {
      setSelectedClasses(courseClasses.map(cls => cls.id));
    }
  };

  const handleBulkAssignment = async () => {
    try {
      setLoading(true);
      const assignmentData = {
        teacherId: selectedTeacher,
        courseClassIds: selectedClasses,
        assignedDate: assignmentDate,
        notes: notes,
      };

      const response = await TeacherAssignmentAPI.bulkAssignment(assignmentData);
      setAssignmentResult(response.data);
      setSuccess(response.message);
      
      // Reset form
      setSelectedClasses([]);
      setNotes('');
      
      // Reload classes to reflect changes
      loadCourseClasses();
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể thực hiện phân công hàng loạt');
      console.error('Error executing bulk assignment:', err);
    } finally {
      setLoading(false);
      setConfirmDialog(false);
    }
  };

  const getSelectedTeacherInfo = () => {
    return teachers.find(t => t.id === selectedTeacher);
  };

  const getSelectedClassesInfo = () => {
    return courseClasses.filter(cls => selectedClasses.includes(cls.id));
  };

  const canExecuteAssignment = () => {
    return selectedTeacher && selectedClasses.length > 0;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Phân công hàng loạt
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Phân công một giáo viên cho nhiều lớp được chọn
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Panel - Teacher Selection & Settings */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Chọn giáo viên
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Chọn giáo viên</InputLabel>
                <Select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  label="Chọn giáo viên"
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

              {selectedTeacher && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Giáo viên đã chọn
                    </Typography>
                    <Typography variant="body2">
                      {getSelectedTeacherInfo()?.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getSelectedTeacherInfo()?.department?.fullName}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              <TextField
                fullWidth
                label="Ngày phân công"
                type="date"
                value={assignmentDate}
                onChange={(e) => setAssignmentDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Ghi chú (Tùy chọn)"
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Thêm ghi chú cho phân công này..."
              />
            </CardContent>
          </Card>

          {/* Assignment Summary */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tóm tắt phân công
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h3" color="primary">
                    {selectedClasses.length}
                  </Typography>
                  <Typography variant="caption">
                    Lớp đã chọn
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h3" color="success.main">
                    {courseClasses.length}
                  </Typography>
                  <Typography variant="caption">
                    Lớp có sẵn
                  </Typography>
                </Grid>
              </Grid>
              
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => setConfirmDialog(true)}
                disabled={!canExecuteAssignment() || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                sx={{ mt: 2 }}
              >
                Thực hiện phân công hàng loạt
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Class Selection */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Chọn lớp học
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleSelectAll}
                    startIcon={selectedClasses.length === courseClasses.length ? <ClearIcon /> : <SelectAllIcon />}
                  >
                    {selectedClasses.length === courseClasses.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={loadCourseClasses}
                    startIcon={<RefreshIcon />}
                    disabled={loading}
                  >
                    Làm mới
                  </Button>
                </Box>
              </Box>

              {/* Filters */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Tìm kiếm"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Tìm kiếm lớp học..."
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Kỳ học</InputLabel>
                    <Select
                      value={filters.semesterId}
                      onChange={(e) => handleFilterChange('semesterId', e.target.value)}
                      label="Kỳ học"
                    >
                      <MenuItem value="">Tất cả kỳ học</MenuItem>
                      {semesters.map((semester) => (
                        <MenuItem key={semester.id} value={semester.id}>
                          {semester.academicYear} - Kỳ {semester.termNumber}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Khoa</InputLabel>
                    <Select
                      value={filters.departmentId}
                      onChange={(e) => handleFilterChange('departmentId', e.target.value)}
                      label="Khoa"
                    >
                      <MenuItem value="">Tất cả khoa</MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.shortName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.unassignedOnly}
                        onChange={(e) => handleFilterChange('unassignedOnly', e.target.checked)}
                        size="small"
                      />
                    }
                    label="Chỉ lớp chưa phân công"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ mb: 2 }} />

              {/* Class List */}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : courseClasses.length === 0 ? (
                <Alert severity="info">
                  Không tìm thấy lớp học nào với bộ lọc hiện tại. Hãy thử điều chỉnh tiêu chí tìm kiếm.
                </Alert>
              ) : (
                <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                  {courseClasses.map((courseClass) => (
                    <ListItem
                      key={courseClass.id}
                      button
                      onClick={() => handleClassSelection(courseClass.id)}
                      selected={selectedClasses.includes(courseClass.id)}
                    >
                      <ListItemIcon>
                        <Checkbox
                          checked={selectedClasses.includes(courseClass.id)}
                          onChange={() => handleClassSelection(courseClass.id)}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {courseClass.name}
                            </Typography>
                            <Chip
                              label={courseClass.code}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              Học phần: {courseClass.subject?.name} ({courseClass.subject?.credits} tín chỉ)
                            </Typography>
                            <Typography variant="caption" display="block">
                              Kỳ học: {courseClass.semester?.academicYear} - Kỳ {courseClass.semester?.termNumber}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Khoa: {courseClass.subject?.department?.shortName} | 
                              Sinh viên: {courseClass.studentCount} | 
                              Tiết: {courseClass.subject?.totalPeriods}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Xác nhận phân công hàng loạt</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Bạn sắp phân công <strong>{getSelectedTeacherInfo()?.fullName}</strong> cho{' '}
            <strong>{selectedClasses.length}</strong> lớp học:
          </Typography>
          
          <List dense sx={{ maxHeight: 300, overflow: 'auto', mt: 2 }}>
            {getSelectedClassesInfo().map((cls) => (
              <ListItem key={cls.id}>
                <ListItemText
                  primary={cls.name}
                  secondary={`${cls.subject?.name} - ${cls.semester?.academicYear} Kỳ ${cls.semester?.termNumber}`}
                />
              </ListItem>
            ))}
          </List>

          <Alert severity="warning" sx={{ mt: 2 }}>
            Hành động này sẽ tạo {selectedClasses.length} phân công giáo viên mới. 
            Hãy chắc chắn điều này là đúng trước khi tiếp tục.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Hủy</Button>
          <Button
            onClick={handleBulkAssignment}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            Xác nhận phân công
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={!!assignmentResult} onClose={() => setAssignmentResult(null)}>
        <DialogTitle>Phân công hoàn thành</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Đã phân công thành công {assignmentResult?.assignedCount} lớp cho {assignmentResult?.teacherName}
          </Alert>
          <Typography variant="body2">
            Phân công hàng loạt đã được hoàn thành thành công. Bạn có thể xem các phân công 
            trong danh sách phân công chính.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignmentResult(null)} variant="contained">
            Đóng
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

export default BulkAssignment; 