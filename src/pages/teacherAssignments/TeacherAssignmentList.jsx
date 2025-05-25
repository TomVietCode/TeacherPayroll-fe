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
  Chip,
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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Assignment as AssignmentIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  List as ListIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { TeacherAssignmentAPI, TeacherAPI, DepartmentAPI, SemesterAPI } from '../../services/api';

// Import the components for tabs
import QuickAssignment from './QuickAssignment';
import BulkAssignment from './BulkAssignment';

const TeacherAssignmentList = () => {
  const navigate = useNavigate();
  
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
    status: '',
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

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await TeacherAssignmentAPI.getAll(params);
      // Ensure assignments is always an array
      setAssignments(Array.isArray(response.data) ? response.data : []);
      setTotalItems(response.pagination?.totalItems || 0);
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

      // Ensure all data is arrays
      setTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : []);
      setDepartments(Array.isArray(departmentsRes.data) ? departmentsRes.data : []);
      setSemesters(Array.isArray(semestersRes.data) ? semestersRes.data : []);
    } catch (err) {
      console.error('Error loading filter options:', err);
      // Set empty arrays on error
      setTeachers([]);
      setDepartments([]);
      setSemesters([]);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    setPage(0); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      teacherId: '',
      semesterId: '',
      departmentId: '',
      status: '',
      search: '',
    });
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Đang hoạt động';
      case 'inactive': return 'Tạm dừng';
      case 'completed': return 'Hoàn thành';
      default: return status;
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
            Bộ lọc
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Tìm kiếm"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Tìm kiếm phân công..."
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.5}>
              <FormControl fullWidth>
                <InputLabel>Giáo viên</InputLabel>
                <Select
                  value={filters.teacherId}
                  onChange={(e) => handleFilterChange('teacherId', e.target.value)}
                  label="Giáo viên"
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
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
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
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
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
            <Grid item xs={12} sm={6} md={1.5}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Trạng thái"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="active">Đang hoạt động</MenuItem>
                  <MenuItem value="inactive">Tạm dừng</MenuItem>
                  <MenuItem value="completed">Hoàn thành</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<ClearIcon />}
            >
              Xóa bộ lọc
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Giáo viên</TableCell>
                <TableCell>Lớp học phần</TableCell>
                <TableCell>Học phần</TableCell>
                <TableCell>Kỳ học</TableCell>
                <TableCell>Khoa</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày phân công</TableCell>
                <TableCell>Khối lượng</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Không tìm thấy phân công nào
                  </TableCell>
                </TableRow>
              ) : (
                assignments.map((assignment) => (
                  <TableRow key={assignment.id} hover>
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
                        Kỳ {assignment.courseClass?.semester?.termNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {assignment.teacher?.department?.shortName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(assignment.status)}
                        color={getStatusColor(assignment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(assignment.assignedDate), 'dd/MM/yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {assignment.workload || assignment.courseClass?.subject?.totalPeriods || 0} tiết
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Chỉnh sửa phân công">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/teacher-assignments/edit/${assignment.id}`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
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
          Phân công giáo viên
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/teacher-assignments/new')}
          >
            Tạo phân công mới
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="assignment tabs">
          <Tab 
            icon={<ListIcon />} 
            label="Danh sách phân công" 
            iconPosition="start"
          />
          <Tab 
            icon={<SpeedIcon />} 
            label="Phân công nhanh" 
            iconPosition="start"
          />
          <Tab 
            icon={<AssignmentIcon />} 
            label="Phân công hàng loạt" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {currentTab === 0 && renderAssignmentsList()}
      {currentTab === 1 && <QuickAssignment onSuccess={handleAssignmentSuccess} />}
      {currentTab === 2 && <BulkAssignment onSuccess={handleAssignmentSuccess} />}

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

export default TeacherAssignmentList; 