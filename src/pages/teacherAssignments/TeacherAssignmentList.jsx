import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tooltip,
  Card,
  CardContent,
  Fab,
  Menu,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Assignment as AssignmentIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  List as ListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TeacherAssignmentAPI, TeacherAPI, DepartmentAPI, SemesterAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { canCreate, canUpdate, canDelete, canViewAllData, ROLES } from '../../utils/permissions';

// Import the components for tabs
import BulkAssignment from './BulkAssignment';

const TeacherAssignmentList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Tab state
  const [currentTab, setCurrentTab] = useState(0);
  
  // State management
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Filter state
  const [filters, setFilters] = useState({
    teacherId: '',
    semesterId: '',
    departmentId: '',
    search: '',
  });

  // Dialog state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, assignment: null });

  // Load initial data
  useEffect(() => {
    loadData();
    loadFilterOptions();
  }, []);

  // Load assignments when filters or pagination change
  useEffect(() => {
    if (currentTab === 0) { // Only load assignments for the list tab
      loadAssignments();
    }
  }, [page, rowsPerPage, filters, currentTab]);

  const loadData = async () => {
    await Promise.all([
      loadAssignments(),
      loadFilterOptions(),
    ]);
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters,
      };

      // For teachers, only show their own assignments
      if (user?.role === ROLES.TEACHER && user?.teacher?.id) {
        params.teacherId = user.teacher.id;
      }

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await TeacherAssignmentAPI.getAll(params);
      // Fix: handle nested data structure
      const assignmentsData = response.data?.data || response.data;
      // Ensure assignments is always an array
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      setTotalItems(response.data?.pagination?.totalItems || response.pagination?.totalItems || 0);
    } catch (err) {
      setError('Không thể tải danh sách phân công giáo viên');
      console.error('Error loading assignments:', err);
      // Set empty array on error
      setAssignments([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const [teachersRes, departmentsRes, semestersRes] = await Promise.all([
        TeacherAPI.getAll(),
        DepartmentAPI.getAll(),
        SemesterAPI.getAll(),
      ]);

      // Fix: axios response.data contains server response, server response has data property
      const teachersData = teachersRes.data?.data || teachersRes.data;
      const departmentsData = departmentsRes.data?.data || departmentsRes.data;
      const semestersData = semestersRes.data?.data || semestersRes.data;
      // Ensure all data is arrays
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
      setSemesters(Array.isArray(semestersData) ? semestersData : []);
      // For teachers, auto-set their own teacher ID in filters
      if (user?.role === ROLES.TEACHER && user?.teacher?.id) {
        setFilters(prev => ({
          ...prev,
          teacherId: user.teacher.id
        }));
      }
    } catch (err) {
      console.error('Error loading filter options:', err);
      // Set empty arrays on error
      setTeachers([]);
      setDepartments([]);
      setSemesters([]);
    }
  };

  const handleFilterChange = (field, value) => {
    // Teachers cannot change teacher filter
    if (field === 'teacherId' && user?.role === ROLES.TEACHER) {
      return;
    }
    
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    setPage(0); // Reset to first page when filtering
  };

  const clearFilters = () => {
    const newFilters = {
      teacherId: user?.role === ROLES.TEACHER && user?.teacher?.id ? user.teacher.id : '',
      semesterId: '',
      departmentId: '',
      search: '',
    };
    setFilters(newFilters);
    setPage(0);
  };

  const handleDeleteClick = (assignment) => {
    setDeleteDialog({ open: true, assignment });
  };

  const handleDeleteConfirm = async () => {
    try {
      await TeacherAssignmentAPI.delete(deleteDialog.assignment.id);
      setSuccess('Xóa phân công thành công');
      loadAssignments();
      setDeleteDialog({ open: false, assignment: null });
    } catch (err) {
      setError('Không thể xóa phân công');
      console.error('Error deleting assignment:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleAssignmentSuccess = () => {
    setSuccess('Phân công hoàn thành thành công');
    setCurrentTab(0); // Switch back to list tab
    loadAssignments(); // Reload the assignments list
  };

  const renderAssignmentsList = () => (
    <Box>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {user?.role === ROLES.TEACHER ? 'Tìm kiếm' : 'Bộ lọc'}
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Tìm kiếm"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Tìm kiếm..."
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            {/* Hide other filters for teachers */}
            {user?.role !== ROLES.TEACHER && (
              <>
                <Grid item xs={12} sm={6} md={2.5} width={"20%"}>
                  <FormControl fullWidth>
                    <InputLabel>Giáo viên</InputLabel>
                    <Select
                      value={filters.teacherId}
                      onChange={(e) => handleFilterChange('teacherId', e.target.value)}
                      label="Giáo viên"
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 200
                          }
                        }
                      }}
                    >
                      <MenuItem value="">Tất cả giáo viên</MenuItem>
                      {teachers.map((teacher) => (
                        <MenuItem key={teacher.id} value={teacher.id}>
                          {teacher.fullName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2.5} width={"25%"}>
                  <FormControl fullWidth>
                    <InputLabel>Khoa</InputLabel>
                    <Select
                      value={filters.departmentId}
                      onChange={(e) => handleFilterChange('departmentId', e.target.value)}
                      label="Khoa"
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
                          {dept.fullName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2.5} width={"25%"}>
                  <FormControl fullWidth>
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
              </>
            )}
          </Grid>
          {/* Hide clear filters button for teachers since they only have search */}
          {user?.role !== ROLES.TEACHER && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                startIcon={<ClearIcon />}
              >
                Xóa bộ lọc
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {/* Hide teacher column for teachers since they only see their own assignments */}
                {user?.role !== ROLES.TEACHER && <TableCell>Giáo viên</TableCell>}
                <TableCell>Lớp học phần</TableCell>
                <TableCell>Học phần</TableCell>
                <TableCell>Kỳ học</TableCell>
                <TableCell>Khoa</TableCell>
                <TableCell>Khối lượng</TableCell>
                {/* Hide action column for teachers */}
                {user?.role !== ROLES.TEACHER && <TableCell align="center">Thao tác</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={user?.role === ROLES.TEACHER ? 5 : 7} align="center">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={user?.role === ROLES.TEACHER ? 5 : 7} align="center">
                    Không tìm thấy phân công nào
                  </TableCell>
                </TableRow>
              ) : (
                assignments.map((assignment) => (
                  <TableRow key={assignment.id} hover>
                    {/* Hide teacher column for teachers */}
                    {user?.role !== ROLES.TEACHER && (
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {assignment.teacher?.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {assignment.teacher?.code}
                          </Typography>
                        </Box>
                      </TableCell>
                    )}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {assignment.courseClass?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {assignment.courseClass?.code}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {assignment.courseClass?.subject?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {assignment.courseClass?.subject?.credits} tín chỉ
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {assignment.courseClass?.semester?.academicYear}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        HK{assignment.courseClass?.semester?.termNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {assignment.teacher?.department?.shortName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {assignment.workload || assignment.courseClass?.subject?.totalPeriods || 0} tiết
                      </Typography>
                    </TableCell>
                    {/* Hide action column for teachers */}
                    {user?.role !== ROLES.TEACHER && (
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Xóa phân công">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(assignment)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {user?.role === ROLES.TEACHER ? 'Phân công của tôi' : 'Phân công giáo viên'}
        </Typography>
      </Box>

      {/* Tabs - Hide assignment tab for teachers */}
      {user?.role !== ROLES.TEACHER && (
        <Paper sx={{ mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="assignment tabs">
            <Tab 
              icon={<ListIcon />} 
              label="Danh sách phân công" 
              iconPosition="start"
            />
            <Tab 
              icon={<AssignmentIcon />} 
              label="Phân công giáo viên" 
              iconPosition="start"
            />
          </Tabs>
        </Paper>
      )}

      {/* Tab Content */}
      {(currentTab === 0 || user?.role === ROLES.TEACHER) && renderAssignmentsList()}
      {currentTab === 1 && user?.role !== ROLES.TEACHER && <BulkAssignment onSuccess={handleAssignmentSuccess} />}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, assignment: null })}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa phân công của{' '}
            <strong>{deleteDialog.assignment?.teacher?.fullName}</strong> cho{' '}
            <strong>{deleteDialog.assignment?.courseClass?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, assignment: null })}>
            Hủy
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

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

export default TeacherAssignmentList; 