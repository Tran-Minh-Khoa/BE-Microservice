const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const router = express.Router();
const db = require("../Models/index");
const User = db.user;
function generateUniqueId(email) {
  return crypto.createHash("sha256").update(email).digest("hex");
}
router.post("/", async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const id = generateUniqueId(email);

    const user = await User.findOne({ where: { email: email } });

    console.log("aaaaaaaaaaa");
    console.log(id, email, password);

    if (!user) {
      return res.status(401).send("Invalid email or password");
    }
    const token = jwt.sign({ id: user.id, email: user.email }, "secret", {
      expiresIn: "100000h",
    });

    // Gửi token về cho người dùng
    res.status(200).json({ token: token });
  } catch (error) {
    // Nếu có lỗi, trả về lỗi server
    return res.status(500).send(error.message);
  }
});

module.exports = router;
