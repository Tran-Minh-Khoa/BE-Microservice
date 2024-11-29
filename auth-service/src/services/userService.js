const { Op , Sequelize } = require('sequelize');
const db = require("../Models/index");
const User = db.user;
const generateDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

exports.countNewUsersByDay = async (startDate, endDate) => {
  try {
    // Tạo danh sách các ngày trong khoảng thời gian
    const dateRange = generateDateRange(startDate, endDate);

    // Lấy số lượng người dùng mới nhóm theo ngày
    const usersCount = await User.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('created_at')), 'created_date'], // Lấy ngày tạo
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'user_count'] // Đếm số lượng user
      ],
      where: {
        role: 'user', // Chỉ tính người dùng có role 'user'
        created_at: {
          [Op.between]: [new Date(startDate), new Date(endDate)] // Điều kiện lọc thời gian
        }
      },
      group: [Sequelize.fn('DATE', Sequelize.col('created_at'))], // Nhóm theo ngày
      order: [[Sequelize.fn('DATE', Sequelize.col('created_at')), 'ASC']] // Sắp xếp theo ngày tăng dần
    });

    // Tạo object để tra cứu số lượng user theo ngày
    const usersMap = usersCount.reduce((acc, user) => {
      acc[user.dataValues.created_date] = user.dataValues.user_count;
      return acc;
    }, {});

    // Tạo danh sách kết quả với những ngày không có người dùng mới sẽ trả về 0
    const result = dateRange.map(date => {
      const formattedDate = date.toISOString().slice(0, 10); // Format YYYY-MM-DD
      return {
        created_date: formattedDate,
        user_count: usersMap[formattedDate] || 0 // Nếu không có user, trả về 0
      };
    });

    return result;
  } catch (error) {
    throw new Error('Failed to count new users by day: ' + error.message);
  }
};
exports.getUsersBySearchQuery = async (page, search) => {
  try {
    const limit = 8; // Giới hạn số lượng người dùng trên một trang
    const offset = (page - 1) * limit;

    // Điều kiện tìm kiếm (name, email, hoặc username)
    const whereClause = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } }
      ]
    };

    

    // Tìm người dùng với phân trang và điều kiện tìm kiếm
    const users = await User.findAndCountAll({
      where: whereClause,
      limit: limit,
      offset: offset,
      order: [['id', 'ASC']]
    });

    // Trả về dữ liệu và phân trang
    return {
      totalItems: users.count,
      totalPages: Math.ceil(users.count / limit),
      currentPage: page,
      data: users.rows
    };
  } catch (error) {
    throw new Error('Failed to retrieve users: ' + error.message);
  }
};
