import { useState, useEffect } from 'react';
import { Box, Alert, Snackbar } from '@mui/material';
import CustomTable from '../../components/common/CustomTable';
import { SubjectAPI, DepartmentAPI } from '../../services/api';
import SubjectFormDialog from '../../components/subjects/SubjectFormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await SubjectAPI.getAll();
      setSubjects(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      setError('Không thể tải dữ liệu học phần. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await DepartmentAPI.getAll();
      setDepartments(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchDepartments();
  }, []);

  const columns = [
    { id: 'code', label: 'Mã', width: '15%' },
    { id: 'name', label: 'Tên', width: '30%' },
    { id: 'credits', label: 'Số tín chỉ', width: '10%' },
    { id: 'coefficient', label: 'Hệ số', width: '12%' },
    { id: 'totalPeriods', label: 'Số tiết', width: '10%' },
    { 
      id: 'department', 
      label: 'Khoa phụ trách', 
      width: '23%',
      render: (row) => row.department?.fullName || 'N/A'
    }
  ];

  const handleAddSubject = () => {
    setSelectedSubject(null);
    setFormOpen(true);
  };

  const handleEditSubject = (subject) => {
    setSelectedSubject(subject);
    setFormOpen(true);
  };

  const handleDeleteSubject = (subject) => {
    setSelectedSubject(subject);
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
      if (selectedSubject) {
        // Edit existing subject
        await SubjectAPI.update(selectedSubject.id, formData);
        setSnackbar({
          open: true,
          message: 'Cập nhật học phần thành công',
          severity: 'success'
        });
      } else {
        // Add new subject
        await SubjectAPI.create(formData);
        setSnackbar({
          open: true,
          message: 'Thêm học phần mới thành công',
          severity: 'success'
        });
      }
      setFormOpen(false);
      fetchSubjects();
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
    if (!selectedSubject) return;
    
    try {
      await SubjectAPI.delete(selectedSubject.id);
      fetchSubjects();
      setSnackbar({
        open: true,
        message: 'Xóa học phần thành công',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting subject:', err);
      const errorMessage = err.response?.data?.message || 'Không thể xóa học phần. Vui lòng thử lại.';
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
        data={subjects}
        loading={loading}
        onAdd={handleAddSubject}
        onEdit={handleEditSubject}
        onDelete={handleDeleteSubject}
      />

      <SubjectFormDialog 
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={selectedSubject}
        isSubmitting={isSubmitting}
        departments={departments}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        onConfirm={handleConfirmDelete}
        title="Xóa học phần"
        content={`Bạn có chắc chắn muốn xóa học phần "${selectedSubject?.name || ''}" không?`}
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

export default SubjectsPage; 