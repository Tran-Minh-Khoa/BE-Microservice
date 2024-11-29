module.exports = (sequelize, Sequelize) => {
    const Participation = sequelize.define("participation", {
        event_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'event',
                key: 'id'
            }
        },
        brand_id: {
            type: Sequelize.STRING,
            allowNull: false
        },
        user_id: {
            type: Sequelize.STRING,
            allowNull: false
        },
        created_date: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'participation',
        timestamps: false
    });

    return Participation;
};
