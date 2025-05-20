import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, IconButton, Tooltip, Breadcrumbs, 
  Link as MuiLink } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useLocation } from 'react-router-dom';

// Helper function to get section name from path
const getSectionName = (path) => {
  if (path === '/' || path === '/statistics') return 'Thống kê';
  if (path.includes('degrees')) return 'Bằng cấp';
  if (path.includes('departments')) return 'Khoa/Bộ môn';
  if (path.includes('teachers')) return 'Giáo viên';
  return '';
};

const DataTable = ({ 
  title, 
  columns = [], 
  data = [], 
  onAdd, 
  onEdit, 
  onDelete,
  loading = false,
  pagination = true,
  addButtonLabel = "Thêm mới"
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const location = useLocation();

  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  useEffect(() => {
    setPage(0);
  }, [safeData.length]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Apply pagination only if needed
  const displayData = pagination 
    ? safeData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) 
    : safeData;

  const sectionName = getSectionName(location.pathname);

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxHeight: '100%',
        overflow: 'hidden'
      }}
    >
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        px={3}
        py={1.5}
        borderBottom="1px solid"
        borderColor="divider"
      >
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
        >
          <MuiLink 
            underline="hover" 
            color="inherit" 
            sx={{ 
              fontWeight: 500, 
              display: 'flex', 
              alignItems: 'center' 
            }}
          >
            Quản lý giáo viên
          </MuiLink>
          {sectionName && (
            <MuiLink 
              color="inherit" 
              sx={{ 
                fontWeight: 500, 
                display: 'flex', 
                alignItems: 'center' 
              }}
            >
              {sectionName}
            </MuiLink>
          )}
          <Typography color="text.primary" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
        </Breadcrumbs>
        {onAdd && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={onAdd}
            size="small"
          >
            {addButtonLabel}
          </Button>
        )}
      </Box>
      
      <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Table stickyHeader sx={{ minWidth: '100%' }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column.id}
                  align={column.align || 'left'}
                  width={column.width}
                  sx={{ 
                    fontWeight: 'bold',
                    backgroundColor: (theme) => theme.palette.background.paper
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              {(onEdit || onDelete) && (
                <TableCell 
                  align="right" 
                  width="100px"
                  sx={{ 
                    backgroundColor: (theme) => theme.palette.background.paper
                  }}
                >
                  Thao tác
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} align="center">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : displayData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} align="center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              displayData.map((row) => (
                <TableRow key={row.id} hover>
                  {columns.map((column) => (
                    <TableCell key={`${row.id}-${column.id}`} align={column.align || 'left'}>
                      {column.render ? column.render(row) : row[column.id]}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell align="right">
                      {onEdit && (
                        <Tooltip title="Chỉnh sửa">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => onEdit(row)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onDelete && (
                        <Tooltip title="Xóa">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => onDelete(row)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {pagination && safeData.length > 0 && (
        <TablePagination
          component="div"
          rowsPerPageOptions={[5, 10, 25, 50]}
          count={safeData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count}`
          }
          sx={{ borderTop: '1px solid', borderColor: 'divider' }}
        />
      )}
    </Paper>
  );
};

export default DataTable;
