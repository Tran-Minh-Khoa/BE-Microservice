var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const passport = require("passport");
var cors = require("cors");

require("dotenv").config();
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var authRouter = require("./routes/auth.router");
var app = express();
var httpProxy = require("express-http-proxy");
const { createProxyMiddleware, fixRequestBody } = require("http-proxy-middleware");
const checkRole = require("./config/checkRole");
const { error } = require("console");
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//passport config
require("./config/passport");


const jwtAuthMiddleware = (req, res, next) => {
  console.log("aaaaaaaaaaa")
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      // Xử lý lỗi phát sinh từ quá trình xác thực
      console.log("bbbbbbbbbbb")
      console.error(err);
      return next(err);  // Nếu có lỗi nghiêm trọng thì ngắt luôn
    }

    if (!user) {
      // Nếu không tìm thấy user, có thể vẫn tiếp tục
      // Hoặc tùy ý gửi thông báo xác thực thất bại nếu cần
      console.log("Unauthorized or no JWT token found");
      return next();  // Tiếp tục mà không bảo vệ
    }

    // Nếu xác thực thành công, thêm user vào request và tiếp tục
    req.user = user;
    next();
  })(req, res, next);
};

const services = [
  {
    route: "/auth",
    target: "http://auth-service:5000/",
    requireAuth: false,
  },
  {
    route: "/event",
    target: "http://event-service:3010/",
    requireAuth: true,
  },
  {
    route: "/voucher",
    target: "http://voucher-service:3020/",
    requireAuth: true,
  },
  {
    route: "/game",
    target: "http://game-service:3030/",
    requireAuth: true,
  },
  {
    route: "/quiz",
    target: "http://quiz-service:3040/",
    requireAuth: true,
  },

  {
    route: "/gacha",
    target: "http://gacha-service:3050/",
    requireAuth: true,
  },
  {
    route: "/gacha-player",
    target: "http://gacha-player-service:3060/",
    requireAuth: true,
  },
];


services.forEach(({ route, target, requireAuth }) => {
  // Proxy options
  const proxyOptions = {
    target,
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq, req, res) => {
        // console.log(`Proxying request to: ${target}`);
        // console.log(`Request URL: ${req.url}`);
        // console.log(`Request headers:`, req.headers);

        if (requireAuth && req.user) {
          const userString = JSON.stringify(req.user);
          proxyReq.setHeader('x-user-info', userString);
        }

        fixRequestBody(proxyReq, req, res);
      },
    },
  };

  if (requireAuth) {
    app.use(route, jwtAuthMiddleware, createProxyMiddleware(proxyOptions));
  } else {
    app.use(route, createProxyMiddleware(proxyOptions));
  }
});


const RealTimeQuizServiceProxy = createProxyMiddleware({
  target: "http://real-time-quiz-service:6000/socket.io",
  changeOrigin: true,
  ws: true,
  on: {
    proxyReq: (proxyReq, req, res) => {
      // Chuyển thông tin người dùng từ req sang proxy request
      //console.log(req.user);
      if (req.user) {
        proxyReq.user = req.user;
        const userString = JSON.stringify(req.user); // Chuyển đổi đối tượng thành chuỗi JSON

        proxyReq.setHeader("x-user-id", userString); // Ví dụ: truyền thông tin người dùng qua header
      }
    },
  },
});
// app.use('/', indexRouter);
app.get('/check-auth-', jwtAuthMiddleware, (req, res) => {
  res.send('You are authenticated');
});

app.get('/check-auth-admin', jwtAuthMiddleware, checkRole(['admin']), (req, res) => {
  res.send('Hello Admin!');
});

app.get('/check-auth-brand', jwtAuthMiddleware, checkRole(['brand']), (req, res) => {
  res.send('Hello Brand!');
});

app.get('/check-auth-user', jwtAuthMiddleware, checkRole(['user']), (req, res) => {
  res.send('Hello User!');
});
app.use("/users", jwtAuthMiddleware, usersRouter);
app.use("/socket", jwtAuthMiddleware, RealTimeQuizServiceProxy);

var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});
module.exports = app;
