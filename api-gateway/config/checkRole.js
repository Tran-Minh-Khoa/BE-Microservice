// checkRole.js

const checkRole = (roles) => (req, res, next) => {
    const userRole = req.user.role; // Lấy role của user từ token JWT đã giải mã
  
    if (roles.includes(userRole)) {
      return next(); // Nếu user có role hợp lệ, cho phép tiếp tục
    }
  
    // Nếu không có quyền, trả về lỗi
    return res.status(403).json({ message: 'Access denied. You do not have the required role.' });
  };
  
  module.exports = checkRole;
  