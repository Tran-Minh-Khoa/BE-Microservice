module.exports = (sequelize, Sequelize) => {
    const Game = sequelize.define("game", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        brand_id: {
            type: Sequelize.STRING
        },
        event_id: {
            type: Sequelize.INTEGER
        },
        poster: {
            type: Sequelize.STRING
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        game_type_id: {
            type: Sequelize.INTEGER
        },
        game_data_id: {
            type: Sequelize.STRING
        },
        tradable: {
            type: Sequelize.BOOLEAN
        },
        description: {
            type: Sequelize.STRING
        },
        amount: {
            type: Sequelize.INTEGER
        },
        voucher_template_id: {
            type: Sequelize.INTEGER
        },
        start_time: {
            type: Sequelize.DATE
        },
        end_time: {
            type: Sequelize.DATE
        }
    }, {
        tableName: 'game',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Game;
};
