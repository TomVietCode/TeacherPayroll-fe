// ProtectedRoute đã không cần thiết vì logic auth đã xử lý ở App level
// Nhưng giữ lại để không phải sửa tất cả routes
const ProtectedRoute = ({ children }) => {
  return children;
};
 
export default ProtectedRoute; 