import { useState, useEffect } from 'react';
import { Box, Alert, Snackbar } from '@mui/material';
import CustomTable from '../../components/common/CustomTable';
import { DegreeAPI } from '../../services/api';
import DegreeFormDialog from '../../components/degrees/DegreeFormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const DegreesPage = () => {
  const [degrees, setDegrees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchDegrees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await DegreeAPI.getAll();
      setDegrees(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch degrees:', err);
      setError('Không thể tải dữ liệu bằng cấp. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDegrees();
  }, []);

  const columns = [
    { id: 'shortName', label: 'Tên viết tắt', width: '15%' },
    { id: 'fullName', label: 'Tên bằng cấp', width: '50%' },
    { 
      id: 'coefficient', 
      label: 'Hệ số', 
      width: '15%',
      render: (row) => row.coefficient ? row.coefficient.toFixed(1) : '1.0'
    },
    { 
      id: 'createdAt', 
      label: 'Ngày tạo', 
      width: '20%',
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString('vi-VN') : 'N/A'
    }
  ];

  const handleAddDegree = () => {
    setSelectedDegree(null);
    setFormOpen(true);
  };

  const handleEditDegree = (degree) => {
    setSelectedDegree(degree);
    setFormOpen(true);
  };

  const handleDeleteDegree = (degree) => {
    setSelectedDegree(degree);
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
      if (selectedDegree) {
        // Edit existing degree
        await DegreeAPI.update(selectedDegree.id, formData);
        setSnackbar({
          open: true,
          message: 'Cập nhật bằng cấp thành công',
          severity: 'success'
        });
      } else {
        // Add new degree
        await DegreeAPI.create(formData);
        setSnackbar({
          open: true,
          message: 'Thêm bằng cấp mới thành công',
          severity: 'success'
        });
      }
      setFormOpen(false);
      fetchDegrees();
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
    if (!selectedDegree) return;
    
    try {
      await DegreeAPI.delete(selectedDegree.id);
      fetchDegrees();
      setSnackbar({
        open: true,
        message: 'Xóa bằng cấp thành công',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting degree:', err);
      const errorMessage = err.response?.data?.message || 'Không thể xóa bằng cấp. Vui lòng thử lại.';
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
        data={degrees}
        loading={loading}
        onAdd={handleAddDegree}
        onEdit={handleEditDegree}
        onDelete={handleDeleteDegree}
      />

      <DegreeFormDialog 
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={selectedDegree}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        onConfirm={handleConfirmDelete}
        title="Xóa bằng cấp"
        content={`Bạn có chắc chắn muốn xóa bằng cấp "${selectedDegree?.fullName || ''}" không?`}
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

export default DegreesPage;
