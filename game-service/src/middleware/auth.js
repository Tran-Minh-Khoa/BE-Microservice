function extractUserFromHeader(req, res, next) {
    // Kiểm tra xem header 'x-user-info' có tồn tại không
    const userHeader = req.headers['x-user-info'];
  
    if (userHeader) {
      try {
        // Chuyển chuỗi JSON trong header thành đối tượng và gán vào req.user
        req.user = JSON.parse(userHeader);
      } catch (error) {
        // Nếu có lỗi khi parse JSON, trả về lỗi
        return res.status(400).json({ message: "Invalid user information format" });
      }
    } else {
      // Nếu không có header, gán req.user là null hoặc xử lý tùy ý
      req.user = null;
    }
  
    // Chuyển sang middleware tiếp theo hoặc xử lý tiếp theo
    next();
  }
  
  module.exports = extractUserFromHeader;
  