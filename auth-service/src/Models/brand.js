module.exports = (sequelize, Sequelize) => {
    const Brand = sequelize.define(
      "Brand",
      { 
        user_id: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        domain: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: true,
        },
        address: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        latitude: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        longitude: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
      },
      {
        tableName: "brands",
        timestamps: true,
        createdAt: "created_at", // Đổi tên trường createdAt
        updatedAt: "last_update", // Đổi tên trường updatedAt
      }
    );
  
    return Brand;
  };
  