var express = require('express');
var router = express.Router();
const db = require("../Models/index");
const User = db.user;
const userController = require('../controller/userController');

/* GET users listing. */
router.get('/detail', async (req, res, next) => {
  const id = req.user.id;
  const user = await User.findOne({ where: { id: id } });

  if (!user) {
    return res.status(401).send("user not found");
  }
  res.status(200).send(user);
});
router.get('/search', userController.getUsersBySearchQuery);

router.get('/detail/:id', async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findOne({ where: { id: id } });

  if (!user) {
    return res.status(401).send("user not found");
  }
  res.status(200).send(user);
});
// Update user by id
router.put('/edit/:id', async (req, res) => {
  const userId = req.params.id; // Lấy id từ URL
  const { name, email, username, role, phone, status } = req.body; // Dữ liệu cập nhật

  try {
    // Tìm user theo ID và cập nhật các trường tương ứng
    const [updated] = await User.update(
      { name, email, username, role, phone, status },
      {
        where: { id: userId }, // Điều kiện tìm kiếm theo user ID
      }
    );

    // Kiểm tra xem user có được cập nhật không
    if (updated) {
      const updatedUser = await User.findOne({ where: { id: userId } });
      return res.status(200).json({ user: updatedUser });
    }

    // Nếu không tìm thấy user
    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.put('/toggleUser/:id', async (req, res) => {
  const userId = req.params.id; // Lấy id từ URL

  try {
    const updatedUser = await User.findOne({ where: { id: userId } });
    if(!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    updatedUser.status = updatedUser.status === 'active' ? 'inactive' : 'active';
    updated =await updatedUser.save();
    // Kiểm tra xem user có được cập nhật không
    if (updated) {
      return res.status(200).json({ user: updated });
    }

    // Nếu không tìm thấy user
    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.get('/brands', async (req, res, next) => {
 try {
  const users = await User.findAll({ where: { role: "brand" } });
  res.status(200).send(users);
 }
 catch (error) {
  res.status(500).json({ message: error.message });
 }
});
router.get('/active-user', async (req, res, next) => {
  try {
   const users = await User.findAll({ where: { role: "user", status: "active" } });
   res.status(200).send(users);
  }
  catch (error) {
   res.status(500).json({ message: error.message });
  }
 });
router.get('/new-users-count', userController.getNewUsersCount);

module.exports = router;
