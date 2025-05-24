import { useState, useEffect } from 'react';
import { Box, Alert, Snackbar } from '@mui/material';
import CustomTable from '../../components/common/CustomTable';
import { SemesterAPI } from '../../services/api';
import SemesterFormDialog from '../../components/semesters/SemesterFormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const SemestersPage = () => {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchSemesters = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await SemesterAPI.getAll();
      setSemesters(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch semesters:', err);
      setError('Không thể tải dữ liệu kỳ học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const columns = [
    { 
      id: 'displayName', 
      label: 'Tên kỳ', 
      width: '20%',
      render: (row) => row.displayName || `${row.termNumber}${row.isSupplementary ? '-Phụ' : ''}`
    },
    { id: 'academicYear', label: 'Năm học', width: '20%' },
    { 
      id: 'startDate', 
      label: 'Ngày bắt đầu', 
      width: '20%',
      render: (row) => row.startDate ? new Date(row.startDate).toLocaleDateString('vi-VN') : 'N/A'
    },
    { 
      id: 'endDate', 
      label: 'Ngày kết thúc', 
      width: '20%',
      render: (row) => row.endDate ? new Date(row.endDate).toLocaleDateString('vi-VN') : 'N/A'
    },

  ];

  const handleAddSemester = () => {
    setSelectedSemester(null);
    setFormOpen(true);
  };

  const handleEditSemester = (semester) => {
    setSelectedSemester(semester);
    setFormOpen(true);
  };

  const handleDeleteSemester = (semester) => {
    setSelectedSemester(semester);
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
      if (selectedSemester) {
        // Edit existing semester
        await SemesterAPI.update(selectedSemester.id, formData);
        setSnackbar({
          open: true,
          message: 'Cập nhật kỳ học thành công',
          severity: 'success'
        });
      } else {
        // Add new semester
        await SemesterAPI.create(formData);
        setSnackbar({
          open: true,
          message: 'Thêm kỳ học mới thành công',
          severity: 'success'
        });
      }
      setFormOpen(false);
      fetchSemesters();
    } catch (err) {
      console.error('Error submitting form:', err);
      const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
      setSnackbar({
        open: true,
        message: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage,
        severity: 'error'
      }); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSemester) return;
    
    try {
      await SemesterAPI.delete(selectedSemester.id);
      fetchSemesters();
      setSnackbar({
        open: true,
        message: 'Xóa kỳ học thành công',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting semester:', err);
      const errorMessage = err.response?.data?.message || 'Không thể xóa kỳ học. Vui lòng thử lại.';
      setSnackbar({
        open: true,
        message: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage,
        severity: 'error'
      });
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <CustomTable
        columns={columns}
        data={semesters}
        loading={loading}
        onAdd={handleAddSemester}
        onEdit={handleEditSemester}
        onDelete={handleDeleteSemester}
      />

      <SemesterFormDialog 
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={selectedSemester}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        onConfirm={handleConfirmDelete}
        title="Xóa kỳ học"
        content={`Bạn có chắc chắn muốn xóa kỳ học "${selectedSemester?.displayName || (selectedSemester ? `${selectedSemester.termNumber}${selectedSemester.isSupplementary ? '-Phụ' : ''}` : '')} - ${selectedSemester?.academicYear || ''}" không?`}
        confirmText="Xóa"
        severity="error"
      />

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

export default SemestersPage; 