const userService = require('../services/userService'); // Dịch vụ xử lý User
const generateDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
exports.getNewUsersCount = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    // Gọi service để lấy số lượng user mới
    const newUserCount = await userService.countNewUsersByDay(startDate, endDate);

    return res.status(200).json({
      message: 'New user count retrieved successfully',
      count: newUserCount
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving new user count',
      error: error.message
    });
  }
};
exports.getUsersBySearchQuery = async (req, res) => {
  try {
    const { page = 1, search = '' } = req.query;

    // Chuyển đổi page thành số nguyên
    const pageNumber = parseInt(page, 10);
    if (isNaN(pageNumber) || pageNumber < 1) {
      return res.status(400).json({ message: 'Invalid page number' });
    }

    

    // Lấy danh sách user từ service
    const users = await userService.getUsersBySearchQuery(pageNumber, search);

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
