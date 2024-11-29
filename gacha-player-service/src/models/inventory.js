module.exports = (sequelize, Sequelize) => {
    const Inventory = sequelize.define("inventory", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        game_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        item: {
            type: Sequelize.STRING, // Dữ liệu item được lưu dưới dạng JSON
            allowNull: false,
        },
    }, {
        tableName: 'inventory',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return Inventory;
};
