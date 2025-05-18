import { useState, useEffect } from 'react';
import { Typography, Box, Alert } from '@mui/material';
import DataTable from '../../components/common/DataTable';
import { TeacherAPI } from '../../services/api';

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await TeacherAPI.getAll();
      setTeachers(response.data);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
      setError('Không thể tải dữ liệu giáo viên. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const columns = [
    { id: 'code', label: 'Mã GV', width: '10%' },
    { id: 'fullName', label: 'Họ và tên', width: '20%' },
    { 
      id: 'birthDate', 
      label: 'Ngày sinh',
      width: '12%',
      render: (row) => new Date(row.birthDate).toLocaleDateString('vi-VN')
    },
    { 
      id: 'department',
      label: 'Khoa/Bộ môn',
      width: '15%',
      render: (row) => row.department?.name || 'N/A'
    },
    { 
      id: 'degree',
      label: 'Bằng cấp',
      width: '13%',
      render: (row) => row.degree?.name || 'N/A'
    },
    { 
      id: 'baseSalary', 
      label: 'Lương cơ bản',
      align: 'right',
      width: '15%',
      render: (row) => row.baseSalary.toLocaleString('vi-VN') + ' VND'
    },
    { 
      id: 'totalSalary', 
      label: 'Tổng lương',
      align: 'right',
      width: '15%',
      render: (row) => row.totalSalary.toLocaleString('vi-VN') + ' VND'
    }
  ];

  const handleAddTeacher = () => {
    // To be implemented
  };

  const handleEditTeacher = (teacher) => {
    // To be implemented
  };

  const handleDeleteTeacher = (teacher) => {
    // To be implemented
  };

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Quản lý Giáo Viên
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box mt={3}>
        <DataTable
          title="Danh sách giáo viên"
          columns={columns}
          data={teachers}
          loading={loading}
          onAdd={handleAddTeacher}
          onEdit={handleEditTeacher}
          onDelete={handleDeleteTeacher}
        />
      </Box>
    </>
  );
};

export default TeachersPage;
