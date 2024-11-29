const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

console.log(dbConfig)

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.playTime = require("./playtime.js")(sequelize, Sequelize);
db.inventory = require("./inventory.js")(sequelize, Sequelize);

module.exports = db;