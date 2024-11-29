require('dotenv').config();
const express = require('express')
const app = express()
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

const mongoose = require('mongoose');

const port = process.env.PORT;
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI).then(() => {
    console.log("Connected to mongoDB");
}).catch((error) => {
    console.log("Fail to connect to mongoDB ", error);
})

// Middlewares
app.use(express.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// quiz router
const quizzRouter = require('./routes/quizz.router')

app.use("/", quizzRouter)
app.listen(port, function () {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;