var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
//config firebase
var admin = require("firebase-admin");

var serviceAccount = require("./src/config/microservice-besys-firebase-adminsdk-s8q7i-73e49d674e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://microservice-besys.appspot.com",
});

const db = require("./src/models/index.model");

const gameRoutes = require("./src/routes/game.routes");
const gameTypeRoutes = require("./src/routes/game_type.routes");


var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
const extractUserFromHeader = require('./src/middleware/auth');
const syncDatabaseWithRetry = async (retries = 5, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await db.sequelize.sync();
      console.log("Synced db.");
      return;
    } catch (err) {
      if (attempt === retries) {
        console.error("Failed to sync db after several attempts: " + err.message);
        throw err;
      } else {
        console.warn(`Sync attempt ${attempt} failed. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }
};

syncDatabaseWithRetry().catch(err => {
  console.error("Failed to sync database: " + err.message);
});

app.use("/",extractUserFromHeader, gameRoutes);
app.use("/gametype", gameTypeRoutes);

var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});
module.exports = app;
