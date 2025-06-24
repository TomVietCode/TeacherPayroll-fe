import { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Tooltip, Pagination } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const CustomTable = ({ 
  columns = [], 
  data = [], 
  onAdd, 
  onEdit, 
  onDelete,
  loading = false,
  pagination = true,
  addButtonLabel = "Thêm mới",
  rowsPerPageOptions = 10,
  showPaginationAlways = false
}) => {
  const [page, setPage] = useState(1);
  const rowsPerPage = rowsPerPageOptions;

  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];
  useEffect(() => {
    setPage(1);
  }, [safeData.length]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Apply pagination only if needed
  const displayData = pagination 
    ? safeData.slice((page - 1) * rowsPerPage, (page - 1) * rowsPerPage + rowsPerPage) 
    : safeData;

  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        backgroundColor: 'background.paper'
      }}
    >
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          p: 1.5
        }}
      >
        {onAdd && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={onAdd}
            size="medium"
            sx={{ px: 2 }}
          >
            {addButtonLabel}
          </Button>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 0, minHeight: 0 }}>
        <Box 
          component="table" 
          sx={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            minWidth: '100%'
          }}
        >
          <Box component="thead" sx={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <Box 
              component="tr" 
              sx={{ 
                backgroundColor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              {columns.map((column) => (
                <Box 
                  component="th" 
                  key={column.id}
                  sx={{ 
                    p: 1.5, 
                    textAlign: column.align || 'left',
                    width: column.width,
                    fontWeight: 'bold',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {column.label}
                </Box>
              ))}
              {(onEdit || onDelete) && (
                <Box 
                  component="th" 
                  sx={{ 
                    p: 1.5, 
                    textAlign: 'center',
                    width: '120px',
                    fontWeight: 'bold',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  Thao tác
                </Box>
              )}
            </Box>
          </Box>
          <Box component="tbody">
            {loading ? (
              <Box component="tr">
                <Box 
                  component="td" 
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography>Đang tải dữ liệu...</Typography>
                </Box>
              </Box>
            ) : displayData.length === 0 ? (
              <Box component="tr">
                <Box 
                  component="td" 
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography>Không có dữ liệu</Typography>
                </Box>
              </Box>
            ) : (
              displayData.map((row) => (
                <Box 
                  component="tr" 
                  key={row.id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'action.hover' 
                    },
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {columns.map((column) => (
                    <Box 
                      component="td" 
                      key={`${row.id}-${column.id}`}
                      sx={{ 
                        p: 1.5, 
                        textAlign: column.align || 'left',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {column.render ? column.render(row) : row[column.id]}
                    </Box>
                  ))}
                  {(onEdit || onDelete) && (
                    <Box 
                      component="td" 
                      sx={{ 
                        p: 1, 
                        textAlign: 'center',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        {onEdit && (
                          <Tooltip title="Chỉnh sửa">
                            <IconButton 
                              size="small" 
                              color="primary" 
                              onClick={() => onEdit(row)}
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
                      </Box>
                    </Box>
                  )}
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Box>
      {pagination && (showPaginationAlways || safeData.length > rowsPerPage) && (
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.default',
            minHeight: '64px',
            flexShrink: 0
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {safeData.length > 0 ? (
              `Hiển thị ${Math.min((page - 1) * rowsPerPage + 1, safeData.length)} - ${Math.min(page * rowsPerPage, safeData.length)} của ${safeData.length} bản ghi`
            ) : (
              'Không có dữ liệu'
            )}
          </Typography>
          <Pagination 
            count={Math.ceil(safeData.length / rowsPerPage)}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            size="small"
          />
        </Box>
      )}
    </Box>
  );
};

export default CustomTable; 