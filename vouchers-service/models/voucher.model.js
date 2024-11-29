const { DataTypes, Model } = require("sequelize");

module.exports = function (sequelize) {
    const Voucher = sequelize.define(
      "voucher",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        qr: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        status: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        voucher_template_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        event_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        game_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        expire: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        hooks: {
          beforeCreate: (voucher) => {
            const expire = new Date();
            expire.setMonth(expire.getMonth() + 1);
            voucher.expire = expire;
          },
        },
      }
    );
    return Voucher;
}