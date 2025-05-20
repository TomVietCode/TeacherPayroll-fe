import { useState, useEffect } from 'react';
import { Box, Alert } from '@mui/material';
import CustomTable from '../../components/common/CustomTable';
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
      setDepartments(response.data.data || []);
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
    { id: 'shortName', label: 'Mã khoa', width: '20%' },
    { id: 'fullName', label: 'Tên khoa', width: '60%' },
    { 
      id: 'createdAt', 
      label: 'Ngày tạo', 
      width: '20%',
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString('vi-VN') : 'N/A'
    }
  ];

  const handleAddDepartment = () => {
    // To be implemented
  };

  const handleEditDepartment = () => {
    // To be implemented
  };

  const handleDeleteDepartment = () => {
    // To be implemented
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <CustomTable
        columns={columns}
        data={departments}
        loading={loading}
        onAdd={handleAddDepartment}
        onEdit={handleEditDepartment}
        onDelete={handleDeleteDepartment}
      />
    </Box>
  );
};

export default DepartmentsPage;
