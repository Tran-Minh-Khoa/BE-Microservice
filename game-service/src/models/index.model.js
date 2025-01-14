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

db.game_type = require("./game_type.model.js")(sequelize, Sequelize);
db.game = require("./game.model.js")(sequelize, Sequelize);

module.exports = db;