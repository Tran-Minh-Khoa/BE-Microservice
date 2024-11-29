module.exports = (sequelize, Sequelize) => {
    const Playtime = sequelize.define("playtime", {
        game_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        play_duration: { // Đổi tên cột thành playDuration
            type: Sequelize.INTEGER,
            defaultValue: 10, // mặc định là 10
        },
    }, {
        tableName: 'playtime',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return Playtime;
};
