const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const router = express.Router();
const db = require("../Models/index");
const User = db.user;
const Brand = db.brand;
var admin = require("firebase-admin");

function generateUniqueId(email) {
  return crypto.createHash("sha256").update(email).digest("hex");
}
function convertPhoneNumber(phoneNumber) {
  if (phoneNumber.startsWith('+84')) {
    return '0' + phoneNumber.slice(3); // Bỏ +84 và thêm số 0
  }
  return phoneNumber; // Trả về số điện thoại nếu không bắt đầu bằng +84
}
router.post("/user", async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;
    const phone = req.body.phone;

    const id = generateUniqueId(email);

    const user = await User.findOne({ where: { id: id } });
    if (user) {
      return res.status(400).send("This email has already been registered");
    } else {
      //   const newUser = new User();
      //   newUser.id = id;
      //   newUser.name = name;
      //   newUser.email = email;
      //   newUser.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
      //   const token = crypto.randomBytes(20).toString("hex");
      //   newUser.emailVerificationToken = token;
      //   newUser.emailVerificationExpires = Date.now() + 3600000;

      //   const savedUser = await newUser.save();
      // await EmailService({ customerMail: email, href: `http://localhost:3000/register/verify/${token}`, subject: "TCG-Trading Card Games - Email Verification" });

      const newUser = await User.create({
        id: id,
        email: email,
        name: name,
        username: username,
        phone: phone,
        role: "user",
        status: "isActive",
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
      });

      return res.status(200).send(`Register success ${newUser}`);
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
});
router.post("/brand", async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;
    const phone = req.body.phone;
    const domain = req.body.domain;
    const address = req.body.address;
    const longitude = req.body.longitude;
    const latitude = req.body.latitude;
    const id = generateUniqueId(email);

    const user = await User.findOne({ where: { id: id } });
    if (user) {
      return res.status(400).send("This email has already been registered");
    } else {
      //   const newUser = new User();
      //   newUser.id = id;
      //   newUser.name = name;
      //   newUser.email = email;
      //   newUser.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
      //   const token = crypto.randomBytes(20).toString("hex");
      //   newUser.emailVerificationToken = token;
      //   newUser.emailVerificationExpires = Date.now() + 3600000;

      //   const savedUser = await newUser.save();
      // await EmailService({ customerMail: email, href: `http://localhost:3000/register/verify/${token}`, subject: "TCG-Trading Card Games - Email Verification" });

      const newUser = await User.create({
        id: id,
        email: email,
        name: name,
        username: username,
        phone: phone,
        role: "brand",
        status: "isActive",
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
      });

      const newBrand = await Brand.create({
        user_id: id,
        name: name,
        domain: domain,
        address: address,
        longitude: longitude,
        latitude: latitude,
      });
        

      return res.status(200).send(`Register success ${newUser}`);
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
});
router.post('/verify-phone', async (req, res) => {
  const { uid, phoneNumber } = req.body;

  try {
    // Kiểm tra và xác thực UID từ Firebase
    const userRecord = await admin.auth().getUser(uid);

    if (userRecord.phoneNumber !== phoneNumber) {
      return res.status(400).json({ message: 'Phone number does not match' });
    }
    const userPhone = convertPhoneNumber(phoneNumber);
    // Thực hiện cập nhật user bằng Sequelize
    const result = await User.update(
      {
        status:"Active",
      },
      {
        where: {
          phone: userPhone, // Chỉ điều kiện phoneNumber
        }
      }
    );
    if (result[0] == 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Phone number verified and updated in database' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying phone number' });
  }
});


module.exports = router;
