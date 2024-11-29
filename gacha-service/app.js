var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('dotenv').config();
//config firebase
var admin = require("firebase-admin");

var serviceAccount = require("./src/config/microservice-besys-firebase-adminsdk-s8q7i-73e49d674e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket:"gs://microservice-besys.appspot.com",
});

const mongoose = require('mongoose');

const port = process.env.PORT;
const mongoURI = process.env.MONGO_URI;


var indexRouter = require('./src/routes/index');
var usersRouter = require('./src/routes/users');
var gachaRouter = require('./src/routes/gachaRoutes');
var app = express();

mongoose.connect(mongoURI).then(() => {
    console.log("Connected to mongoDB");
}).catch((error) => {
    console.log("Fail to connect to mongoDB ", error);
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', gachaRouter);
app.listen(port, function () {
    console.log(`Server is running on port ${port}`);
});
module.exports = app;
