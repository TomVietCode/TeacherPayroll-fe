import { useState, useEffect } from 'react';
import { 
  Box, 
  Alert, 
  Snackbar, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  TextField, 
  Fab,
  Chip,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Save as SaveIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { SemesterAPI, CourseClassAPI, DepartmentAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { canCreate, canUpdate, canDelete, canViewAllData, ROLES } from '../../utils/permissions';
import CourseClassFormDialog from '../../components/courseClasses/CourseClassFormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const CourseClassesPage = () => {
  const { user } = useAuth();
  const [semesters, setSemesters] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [courseClassesBySubject, setCourseClassesBySubject] = useState([]);
  const [filteredCourseClasses, setFilteredCourseClasses] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCourseClass, setSelectedCourseClass] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({}); // Track student count changes
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

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

  // Fetch semesters and departments on component mount and auto-select latest
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [semestersResponse, departmentsResponse] = await Promise.all([
          SemesterAPI.getAll(),
          DepartmentAPI.getAll()
        ]);
        
        const semestersList = semestersResponse.data.data || [];
        setSemesters(semestersList);
        setDepartments(departmentsResponse.data.data || []);
        
        // Auto-select smallest (earliest) academic year
        const academicYears = [...new Set(semestersList.map(s => s.academicYear))].sort();
        if (academicYears.length > 0) {
          const earliestYear = academicYears[0];
          setSelectedAcademicYear(earliestYear);
          
          // Find the closest semester within the earliest year
          const semestersInEarliestYear = semestersList.filter(s => s.academicYear === earliestYear);
          const closestSemester = findClosestSemester(semestersInEarliestYear);
          if (closestSemester) {
            setSelectedSemesterId(closestSemester.id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      }
    };

    fetchInitialData();
  }, []);

  // Fetch course classes when semester is selected
  useEffect(() => {
    if (selectedSemesterId) {
      fetchCourseClassesBySemester();
    } else {
      setCourseClassesBySubject([]);
      setFilteredCourseClasses([]);
      setSelectedSubject(null);
    }
  }, [selectedSemesterId]);

  // Filter course classes when filters change
  useEffect(() => {
    filterCourseClasses();
  }, [courseClassesBySubject, selectedDepartment, searchTerm]);

  const fetchCourseClassesBySemester = async () => {
    setLoading(true);
    setError(null);
    setPendingChanges({}); // Clear pending changes when fetching new data
    try {
      let response;
      // For teachers, only get classes they are assigned to
      if (user?.role === ROLES.TEACHER && user?.teacher?.id) {
        response = await CourseClassAPI.getCourseClassesByTeacherAndSemester(user.teacher.id, selectedSemesterId);
      } else {
        response = await CourseClassAPI.getBySemester(selectedSemesterId);
      }
      setCourseClassesBySubject(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch course classes:', err);
      setError('Không thể tải dữ liệu lớp học phần. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const filterCourseClasses = () => {
    let filtered = [...courseClassesBySubject];

    // Filter by department
    if (selectedDepartment) {
      filtered = filtered.filter(subjectData => 
        subjectData.subject.department?.id === selectedDepartment
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(subjectData => 
        subjectData.subject.code.toLowerCase().includes(searchLower) ||
        subjectData.subject.name.toLowerCase().includes(searchLower) ||
        subjectData.subject.department?.shortName?.toLowerCase().includes(searchLower) ||
        subjectData.subject.department?.fullName?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredCourseClasses(filtered);
  };

  // Generate academic year options based on semesters - sort from smallest to largest
  const academicYears = [...new Set(semesters.map(s => s.academicYear))].sort();

  // Filter semesters by selected academic year
  const filteredSemesters = selectedAcademicYear 
    ? semesters.filter(s => s.academicYear === selectedAcademicYear)
    : [];

  const handleAcademicYearChange = (e) => {
    setSelectedAcademicYear(e.target.value);
    setSelectedSemesterId('');
    setSelectedSubject(null);
    setCourseClassesBySubject([]);
    setFilteredCourseClasses([]);
    setPendingChanges({});
  };

  const handleSemesterChange = (e) => {
    setSelectedSemesterId(e.target.value);
    setSelectedSubject(null);
    setPendingChanges({});
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    setSelectedSubject(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedSubject(null);
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setPendingChanges({}); // Clear pending changes when switching subjects
  };

  const handleAddCourseClass = () => {
    setFormOpen(true);
  };

  // Handle student count change in batch mode
  const handleStudentCountChange = (classId, newValue) => {
    const numValue = parseInt(newValue) || 0;
    if (numValue < 0) return; // Don't allow negative numbers
    
    // Find the course class to get maxStudents
    const courseClass = courseClassesBySubject
      .flatMap(subject => subject.classes)
      .find(c => c.id === classId);
    
    if (courseClass && numValue > courseClass.maxStudents) {
      setSnackbar({
        open: true,
        message: `Số sinh viên thực tế (${numValue}) không được lớn hơn số sinh viên tối đa (${courseClass.maxStudents})`,
        severity: 'error'
      });
      return; // Don't update the value
    }
    
    setPendingChanges(prev => ({
      ...prev,
      [classId]: numValue
    }));
  };

  // Save all pending changes at once
  const handleSaveAllChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      setSnackbar({
        open: true,
        message: 'Không có thay đổi nào để lưu',
        severity: 'info'
      });
      return;
    }

    setIsSavingChanges(true);
    try {
      // Save all changes in parallel
      const updatePromises = Object.entries(pendingChanges).map(([classId, studentCount]) =>
        CourseClassAPI.update(classId, { studentCount })
      );
      
      await Promise.all(updatePromises);
      
      setSnackbar({
        open: true,
        message: `Đã cập nhật ${Object.keys(pendingChanges).length} lớp học phần`,
        severity: 'success'
      });
      
      setPendingChanges({});
      fetchCourseClassesBySemester();
    } catch (err) {
      console.error('Error saving changes:', err);
      setSnackbar({
        open: true,
        message: 'Không thể lưu thay đổi. Vui lòng thử lại.',
        severity: 'error'
      });
    } finally {
      setIsSavingChanges(false);
    }
  };

  // Discard all pending changes
  const handleDiscardChanges = () => {
    setPendingChanges({});
    setSnackbar({
      open: true,
      message: 'Đã hủy tất cả thay đổi',
      severity: 'info'
    });
  };

  const handleDeleteCourseClass = (courseClass) => {
    setSelectedCourseClass(courseClass);
    setConfirmOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await CourseClassAPI.create(formData);
      setSnackbar({
        open: true,
        message: 'Tạo lớp học phần thành công',
        severity: 'success'
      });
      setFormOpen(false);
      fetchCourseClassesBySemester();
    } catch (err) {
      console.error('Error creating course classes:', err);
      const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCourseClass) return;
    
    try {
      await CourseClassAPI.delete(selectedCourseClass.id);
      fetchCourseClassesBySemester();
      setSnackbar({
        open: true,
        message: 'Xóa lớp học phần thành công',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting course class:', err);
      const errorMessage = err.response?.data?.message || 'Không thể xóa lớp học phần. Vui lòng thử lại.';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Get current value for a class (pending change or original value)
  const getCurrentStudentCount = (courseClass) => {
    return pendingChanges[courseClass.id] !== undefined 
      ? pendingChanges[courseClass.id] 
      : courseClass.studentCount;
  };

  // Check if a class has pending changes
  const hasPendingChange = (classId) => {
    return pendingChanges[classId] !== undefined;
  };

  const hasAnyPendingChanges = Object.keys(pendingChanges).length > 0;

  return (
    <Box sx={{ height: '100%', width: '100%', p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Quản lý lớp học phần - Gộp Selection Controls và Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FilterIcon />
                Quản lý lớp học phần
              </Typography>
            </Box>
            {canCreate(user?.role) && selectedSemesterId && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddCourseClass}
                size="large"
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  minWidth: 180
                }}
              >
                Thêm lớp học phần
              </Button>
            )}
          </Box>
          
          {/* Filter and search */}
          <Grid container spacing={2} sx={{ mb: selectedSemesterId ? 3 : 0, alignItems: 'center' }}>
            <Grid item xs={12} sm={4} md={3} lg={2.5}>
              <FormControl fullWidth size="medium">
                <InputLabel>Năm học</InputLabel>
                <Select
                  value={selectedAcademicYear}
                  onChange={handleAcademicYearChange}
                  label="Năm học"
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

            <Grid item xs={12} sm={4} md={2.5} lg={2} width={'10%'}>
              <FormControl fullWidth size="medium" >
                <InputLabel>Kỳ học</InputLabel>
                <Select
                  value={selectedSemesterId}
                  onChange={handleSemesterChange}
                  label="Kỳ học"
                  disabled={!selectedAcademicYear || loading}
                >
                  {filteredSemesters.map(semester => (
                    <MenuItem key={semester.id} value={semester.id}>
                      {semester.displayName || `${semester.termNumber}${semester.isSupplementary ? '-phụ' : ''}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4} md={3} lg={2.5} width={'25%'}>
              <FormControl fullWidth size="medium">
                <InputLabel>Khoa</InputLabel>
                <Select
                  value={selectedDepartment}
                  onChange={handleDepartmentChange}
                  label="Khoa"
                  disabled={!selectedSemesterId}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200
                      }
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>Tất cả khoa</em>
                  </MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4} lg={5} width={'30%'}>
              <TextField
                fullWidth
                size="medium"
                label="Tìm kiếm học phần"
                placeholder="Mã học phần, tên học phần, khoa..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                }}
                disabled={!selectedSemesterId}
              />
            </Grid>

            <Grid item xs={12} md={12} lg={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '40px', mt: { xs: 1, md: 0 } }}>
                {loading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Đang tải dữ liệu...
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>

          
        </CardContent>
      </Card>

      {/* Subjects List */}
      {selectedSemesterId && filteredCourseClasses.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Danh sách học phần {filteredCourseClasses.length !== courseClassesBySubject.length && 
                  `(${filteredCourseClasses.length}/${courseClassesBySubject.length})`}
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              {filteredCourseClasses.map((subjectData, index) => {
                // Define colors for different subjects
                const colors = [
                  '#E3F2FD', '#FCE4EC', '#E8F5E9', '#FFF3E0', '#E0F2F1',
                  '#F3E5F5', '#FFF9C4', '#D1C4E9', '#C8E6C9', '#FFCDD2',
                  '#B2EBF2', '#F8BBD0', '#DCEDC8', '#FFE0B2', '#B3E5FC',
                  '#D7CCC8', '#FFECB3', '#CFD8DC', '#F48FB1', '#AED581'
                ];
                const backgroundColor = colors[index % colors.length];
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={subjectData.subject.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedSubject?.id === subjectData.subject.id ? 2 : 1,
                        borderColor: selectedSubject?.id === subjectData.subject.id ? 'primary.main' : 'divider',
                        backgroundColor: backgroundColor,
                        width: 150,
                        height: 130,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                      onClick={() => handleSubjectSelect(subjectData.subject)}
                    >
                      <CardContent sx={{ 
                        flexGrow: 1,
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}>
                        <div>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ 
                            fontSize: '0.875rem',
                            lineHeight: 1.1,
                            mb: 0.5
                          }}>
                            {subjectData.subject.code}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{
                            fontSize: '0.85rem',
                            lineHeight: 1.2,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            wordBreak: 'break-word'
                          }}>
                            {subjectData.subject.name}
                          </Typography>
                        </div>
                        <Typography variant="caption" sx={{ 
                          fontSize: '0.8rem',
                          color: 'text.secondary',
                          fontWeight: 500,
                        }}>
                          {subjectData.classes.length} lớp
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Course Classes Table */}
      {selectedSubject && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Danh sách lớp học phần: {selectedSubject.name}
              </Typography>
              
              {hasAnyPendingChanges && canUpdate(user?.role) && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip 
                    label={`${Object.keys(pendingChanges).length} thay đổi`} 
                    color="warning" 
                    size="small" 
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleDiscardChanges}
                    disabled={isSavingChanges}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveAllChanges}
                    disabled={isSavingChanges}
                  >
                    {isSavingChanges ? 'Đang lưu...' : 'Lưu tất cả'}
                  </Button>
                </Box>
              )}
            </Box>
            
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mã lớp</TableCell>
                    <TableCell>Tên lớp</TableCell>
                    <TableCell sx={{ minWidth: 150 }}>Số sinh viên</TableCell>
                    {/* Hide teacher column for teachers */}
                    {user?.role !== ROLES.TEACHER && <TableCell>Giảng viên</TableCell>}
                    {canDelete(user?.role) && <TableCell align="center">Thao tác</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCourseClasses
                    .find(s => s.subject.id === selectedSubject.id)
                    ?.classes.map((courseClass) => (
                      <TableRow 
                        key={courseClass.id}
                        sx={{
                          bgcolor: hasPendingChange(courseClass.id) ? 'action.hover' : 'inherit'
                        }}
                      >
                        <TableCell>{courseClass.code}</TableCell>
                        <TableCell>{courseClass.name}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {canUpdate(user?.role) ? (
                              <TextField
                                size="small"
                                type="number"
                                value={getCurrentStudentCount(courseClass)}
                                onChange={(e) => handleStudentCountChange(courseClass.id, e.target.value)}
                                inputProps={{ 
                                  min: 0,
                                  max: courseClass.maxStudents || 1000,
                                  style: { width: '60px' }
                                }}
                                variant={hasPendingChange(courseClass.id) ? "outlined" : "standard"}
                                sx={{
                                  '& .MuiInputBase-root': {
                                    bgcolor: hasPendingChange(courseClass.id) ? 'warning.light' : 'inherit',
                                  }
                                }}
                              />
                            ) : (
                              <Typography variant="body2" sx={{ minWidth: '60px', textAlign: 'center' }}>
                                {getCurrentStudentCount(courseClass)}
                              </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                              / {courseClass.maxStudents || 40}
                            </Typography>
                          </Box>
                        </TableCell>
                        {/* Hide teacher column for teachers */}
                        {user?.role !== ROLES.TEACHER && (
                          <TableCell>
                            {courseClass.teacher ? (
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {courseClass.teacher.fullName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {courseClass.teacher.code}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                Chưa phân công
                              </Typography>
                            )}
                          </TableCell>
                        )}
                        {canDelete(user?.role) && (
                          <TableCell align="center">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteCourseClass(courseClass)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Show message when no data after filtering */}
      {selectedSemesterId && courseClassesBySubject.length > 0 && filteredCourseClasses.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy học phần nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Form Dialog */}
      <CourseClassFormDialog 
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        latestSemester={findClosestSemester(semesters)}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        onConfirm={handleConfirmDelete}
        title="Xóa lớp học phần"
        content={`Bạn có chắc chắn muốn xóa lớp "${selectedCourseClass?.name}" không?`}
        confirmText="Xóa"
        severity="error"
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CourseClassesPage;   