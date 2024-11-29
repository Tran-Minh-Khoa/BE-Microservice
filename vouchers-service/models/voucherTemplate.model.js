const { DataTypes } = require("sequelize");
module.exports = function (sequelize) {
    const VoucherTemplate = sequelize.define(
        'vouchertemplate',
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            image: {
                type: DataTypes.STRING,
                allowNull: true
            },
            value: {
                type: DataTypes.REAL,
                allowNull: false
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false
            },
            brand_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );
    return VoucherTemplate;
}