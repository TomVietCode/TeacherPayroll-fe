import { useState, useEffect } from 'react';
import { Typography, Box, Alert } from '@mui/material';
import DataTable from '../../components/common/DataTable';
import { DepartmentAPI } from '../../services/api';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await DepartmentAPI.getAll();
      setDepartments(response.data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
      setError('Không thể tải dữ liệu khoa/bộ môn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const columns = [
    { id: 'code', label: 'Mã khoa', width: '15%' },
    { id: 'name', label: 'Tên khoa/bộ môn', width: '60%' },
    { 
      id: 'createdAt', 
      label: 'Ngày tạo', 
      width: '25%',
      render: (row) => new Date(row.createdAt).toLocaleDateString('vi-VN')
    }
  ];

  const handleAddDepartment = () => {
    // To be implemented
  };

  const handleEditDepartment = (department) => {
    // To be implemented
  };

  const handleDeleteDepartment = (department) => {
    // To be implemented
  };

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Quản lý Khoa/Bộ Môn
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box mt={3}>
        <DataTable
          title="Danh sách khoa/bộ môn"
          columns={columns}
          data={departments}
          loading={loading}
          onAdd={handleAddDepartment}
          onEdit={handleEditDepartment}
          onDelete={handleDeleteDepartment}
        />
      </Box>
    </>
  );
};

export default DepartmentsPage;
