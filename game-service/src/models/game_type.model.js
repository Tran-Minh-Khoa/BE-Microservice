module.exports = (sequelize, Sequelize) => {
    const GameType = sequelize.define("game_type", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
    }, {
        tableName: 'game_type',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return GameType;
};