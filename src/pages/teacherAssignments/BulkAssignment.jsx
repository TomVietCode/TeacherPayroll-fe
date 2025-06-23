import React, { useState, useEffect, useRef } from 'react';
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

  // Ref to prevent effect on first render
  const isFirstTeacherChange = useRef(true);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load course classes when filters change
  useEffect(() => {
    loadCourseClasses();
  }, [filters]);

  // Khi chọn giáo viên, tự động đổi khoa
  useEffect(() => {
    // Bỏ qua lần render đầu tiên
    if (isFirstTeacherChange.current) {
      isFirstTeacherChange.current = false;
      return;
    }
    if (selectedTeacher) {
      const teacher = teachers.find(t => t.id === selectedTeacher);
      if (teacher && teacher.departmentId) {
        setFilters(prev => ({
          ...prev,
          departmentId: teacher.departmentId
        }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeacher]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [teachersRes, departmentsRes, semestersRes] = await Promise.all([
        TeacherAPI.getAll(),
        DepartmentAPI.getAll(),
        SemesterAPI.getAll(),
      ]);

      // Fix: axios response.data contains server response, server response has data property
      const teachersData = teachersRes.data?.data || teachersRes.data;
      const departmentsData = departmentsRes.data?.data || departmentsRes.data;
      const semestersData = semestersRes.data?.data || semestersRes.data;

      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
      setSemesters(Array.isArray(semestersData) ? semestersData : []);
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
        // Fix: handle nested data structure
        let classes = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);

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
        // Use all classes endpoint (includes both assigned and unassigned)
        const params = {
          semesterId: filters.semesterId,
          departmentId: filters.departmentId,
        };

        // Remove empty params
        Object.keys(params).forEach(key => {
          if (!params[key]) delete params[key];
        });

        const response = await TeacherAssignmentAPI.getAllClassesForAssignment(params);
        // Fix: handle nested data structure
        let classes = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);

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
    const allClassIds = courseClasses.map(cls => cls.id);
    
    if (selectedClasses.length === allClassIds.length) {
      setSelectedClasses([]);
    } else {
      setSelectedClasses(allClassIds);
    }
  };

  const handleTeacherChange = (e) => {
    const teacherId = e.target.value;
    setSelectedTeacher(teacherId);
    // Không cần setFilters ở đây vì đã có useEffect ở trên xử lý
  };

  const handleBulkAssignment = async () => {
    try {
      setLoading(true);
      const assignmentData = {
        teacherId: selectedTeacher,
        courseClassIds: selectedClasses,
      };

      const response = await TeacherAssignmentAPI.bulkAssignment(assignmentData);
      setAssignmentResult(response.data);
      setSuccess(response.message);
      
      // Reset form
      setSelectedClasses([]);
      
      // Reload classes to reflect changes
      loadCourseClasses();
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      const errorData = err.response?.data;
      
      if (err.response?.status === 409 && errorData?.conflictClasses) {
        // Handle conflict errors with detailed information
        const conflictList = errorData.conflictClasses
          .map(cls => `• ${cls.name} (đã phân cho: ${cls.currentTeacher})`)
          .join('\n');
        
        setError(`${errorData.message}:\n\n${conflictList}\n\nVui lòng bỏ chọn các lớp đã được phân công và thử lại.`);
      } else {
        setError(errorData?.message || 'Không thể thực hiện phân công');
      }
      
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

  const getAssignmentChanges = () => {
    const selectedClassObjects = getSelectedClassesInfo();
    const newAssignments = selectedClassObjects.filter(cls => !cls.assignments || cls.assignments.length === 0);
    const reassignments = selectedClassObjects.filter(cls => cls.assignments && cls.assignments.length > 0);
    
    return {
      newAssignments,
      reassignments,
      total: selectedClassObjects.length
    };
  };

  const canExecuteAssignment = () => {
    return selectedTeacher && selectedClasses.length > 0;
  };

  const handleRefresh = () => {
    // Reset all selections and filters
    setSelectedTeacher('');
    setSelectedClasses([]);
    setFilters({
      semesterId: '',
      departmentId: '',
      search: '',
      unassignedOnly: true,
    });
    // Reload data
    loadCourseClasses();
    loadInitialData();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Phân công 
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Panel - Teacher Selection & Settings */}
        <Grid item xs={12} md={4} width={"30%"}>
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
                  onChange={handleTeacherChange}
                  label="Chọn giáo viên"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200
                      }
                    }
                  }}
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

              {selectedClasses.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Chi tiết lựa chọn:</strong>
                  </Typography>
                  {(() => {
                    const changes = getAssignmentChanges();
                    return (
                      <>
                        {changes.newAssignments.length > 0 && (
                          <Typography variant="caption" display="block" color="primary">
                            • Phân công mới: {changes.newAssignments.length} lớp
                          </Typography>
                        )}
                        {changes.reassignments.length > 0 && (
                          <Typography variant="caption" display="block" color="warning.main">
                            • Thay đổi phân công: {changes.reassignments.length} lớp
                          </Typography>
                        )}
                      </>
                    );
                  })()}
                </Box>
              )}
              
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => setConfirmDialog(true)}
                disabled={!canExecuteAssignment() || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                sx={{ mt: 2 }}
              >
                Thực hiện phân công
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Class Selection */}
        <Grid item xs={12} md={8} width={"60%"}>
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
                    startIcon={selectedClasses.length > 0 ? <ClearIcon /> : <SelectAllIcon />}
                  >
                    {selectedClasses.length > 0 ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleRefresh}
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
                <Grid item xs={12} sm={6} md={3} width={"27%"}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Kỳ học</InputLabel>
                    <Select
                      value={filters.semesterId}
                      onChange={(e) => handleFilterChange('semesterId', e.target.value)}
                      label="Kỳ học"
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 200
                          }
                        }
                      }}
                    >
                      <MenuItem value="">Tất cả kỳ học</MenuItem>
                      {semesters.map((semester) => (
                        <MenuItem key={semester.id} value={semester.id}>
                          HK{semester.termNumber}{semester.isSupplementary && "(P)"}-{semester.academicYear} 
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3} width={"25%"}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Khoa</InputLabel>
                    <Select
                      value={filters.departmentId}
                      onChange={(e) => handleFilterChange('departmentId', e.target.value)}
                      label="Khoa"
                      disabled={selectedTeacher ? true : false}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 200
                          }
                        }
                      }}
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
                  {courseClasses.map((courseClass) => {
                    const isAssigned = courseClass.assignments && courseClass.assignments.length > 0;
                    const assignedTeacher = isAssigned ? courseClass.assignments[0].teacher : null;
                    
                    return (
                      <ListItem
                        key={courseClass.id}
                        button
                        onClick={() => handleClassSelection(courseClass.id)}
                        selected={selectedClasses.includes(courseClass.id)}
                        sx={{ 
                          opacity: isAssigned ? 0.8 : 1,
                          backgroundColor: isAssigned ? 'action.hover' : 'inherit'
                        }}
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
                              {isAssigned && (
                                <Chip
                                  label={`Giảng viên: ${assignedTeacher.fullName}`}
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                Học phần: {courseClass.subject?.name} ({courseClass.subject?.credits} tín chỉ)
                              </Typography>
                              <Typography variant="caption" display="block">
                                Kỳ học: {courseClass.semester?.academicYear} - HK{courseClass.semester?.termNumber}
                              </Typography>
                              <Typography variant="caption" display="block">
                                Khoa: {courseClass.subject?.department?.shortName} | 
                                Sinh viên: {courseClass.studentCount} | 
                                Tiết: {courseClass.subject?.totalPeriods}
                                {isAssigned && ` | GV: ${assignedTeacher.code}`}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Xác nhận phân công</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Bạn sắp phân công <strong>{getSelectedTeacherInfo()?.fullName}</strong> cho{' '}
            <strong>{selectedClasses.length}</strong> lớp học:
          </Typography>
          
          {(() => {
            const changes = getAssignmentChanges();
            return (
              <>
                {changes.newAssignments.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Phân công mới ({changes.newAssignments.length} lớp):
                    </Typography>
                    <List dense sx={{ maxHeight: 200, overflow: 'auto', ml: 2 }}>
                      {changes.newAssignments.map((cls) => (
                        <ListItem key={cls.id} sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={cls.name}
                            secondary={`${cls.subject?.name} - ${cls.semester?.academicYear} Kỳ ${cls.semester?.termNumber}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {changes.reassignments.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="warning.main" gutterBottom>
                      Thay đổi phân công ({changes.reassignments.length} lớp):
                    </Typography>
                    <List dense sx={{ maxHeight: 200, overflow: 'auto', ml: 2 }}>
                      {changes.reassignments.map((cls) => (
                        <ListItem key={cls.id} sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={cls.name}
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  {cls.subject?.name} - {cls.semester?.academicYear} Kỳ {cls.semester?.termNumber}
                                </Typography>
                                <Typography variant="caption" color="warning.main" display="block">
                                  Hiện tại: {cls.assignments[0]?.teacher?.fullName} → Thay bằng: {getSelectedTeacherInfo()?.fullName}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </>
            );
          })()}

          {getAssignmentChanges().reassignments.length > 0 ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Cảnh báo:</strong> Bạn đang thay đổi phân công của {getAssignmentChanges().reassignments.length} lớp đã có giáo viên.
              </Typography>
              <Typography variant="body2">
                Các giáo viên cũ sẽ không còn phụ trách những lớp này. Hãy chắc chắn điều này là đúng.
              </Typography>
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              Hành động này sẽ tạo {selectedClasses.length} phân công giáo viên mới.
            </Alert>
          )}
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
            Đã hoàn thành phân công cho {assignmentResult?.teacherName}
          </Alert>
          
          {assignmentResult && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Tổng kết:</strong>
              </Typography>
              <Typography variant="body2" sx={{ ml: 2 }}>
                • Tổng số lớp xử lý: {assignmentResult.totalProcessed}
              </Typography>
              {assignmentResult.createdCount > 0 && (
                <Typography variant="body2" sx={{ ml: 2 }}>
                  • Phân công mới: {assignmentResult.createdCount} lớp
                </Typography>
              )}
              {assignmentResult.updatedCount > 0 && (
                <Typography variant="body2" sx={{ ml: 2 }}>
                  • Thay đổi phân công: {assignmentResult.updatedCount} lớp
                </Typography>
              )}
              
              {assignmentResult.replacedTeachers && assignmentResult.replacedTeachers.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Các thay đổi:</strong>
                  </Typography>
                  {assignmentResult.replacedTeachers.map((replacement, index) => (
                    <Typography key={index} variant="caption" display="block" sx={{ ml: 2 }}>
                      • {replacement.className}: {replacement.oldTeacher} → {assignmentResult.teacherName}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          )}
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            Bạn có thể xem các phân công trong danh sách phân công chính.
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
        autoHideDuration={8000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ whiteSpace: 'pre-line' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BulkAssignment; 