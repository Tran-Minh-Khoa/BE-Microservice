require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const Redis = require("ioredis");

const mongoose = require('mongoose');

const { setupSocketConnection } = require("./src/socket")
const { setupRedisConnection } = require("./src/redis")

var indexRouter = require("./src/routes/index");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/", indexRouter);

const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI).then(() => {
  console.log("Connected to mongoDB");
}).catch((error) => {
  console.log("Fail to connect to mongoDB ", error);
})

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["authorization"],
    credentials: true,
  },
});

const publisher = new Redis({
  port: 6379,
  host: "redis",
});

const subscriber = new Redis({
  port: 6379,
  host: "redis",
});


setupRedisConnection(subscriber);
setupSocketConnection(io, publisher);

var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});
module.exports = server;
