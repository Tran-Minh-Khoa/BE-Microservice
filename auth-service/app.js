var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const passport = require("passport");
var admin = require("firebase-admin");

var serviceAccount = require("./src/config/microservice-besys-firebase-adminsdk-s8q7i-73e49d674e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket:"gs://microservice-besys.appspot.com",
});
var indexRouter = require("./src/routes/index");
var usersRouter = require("./src/routes/users");
var loginRouter = require("./src/routes/login.router");
var registerRouter = require("./src/routes/register.router");
require("dotenv").config();
const db = require("./src/Models/index");
// Retry logic
const maxRetries = 5; // Số lần thử lại tối đa
const retryDelay = 5000; // Thời gian delay giữa các lần thử lại (5 giây)

async function syncDatabase(retries) {
  try {
    await db.sequelize.sync();
    console.log("Database synced");
  } catch (err) {
    if (retries > 0) {
      console.error(
        `Failed to sync database. Retrying in ${retryDelay / 1000} seconds...`
      );
      setTimeout(() => syncDatabase(retries - 1), retryDelay);
    } else {
      console.error(
        "Failed to sync database after multiple attempts:",
        err.message
      );
      process.exit(1); // Kết thúc ứng dụng nếu không thể kết nối
    }
  }
}

// Bắt đầu quá trình đồng bộ hóa cơ sở dữ liệu
syncDatabase(maxRetries);

var app = express();
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
//passport config
app.use(passport.initialize());
require("./src/config/passport");

const jwtAuthMiddleware = passport.authenticate("jwt", { session: false });
app.use("/", indexRouter);
app.use("/users",jwtAuthMiddleware,usersRouter);
app.use("/login", loginRouter);
app.use("/register", registerRouter);

var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});
module.exports = app;
