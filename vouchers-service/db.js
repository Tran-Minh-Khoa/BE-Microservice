const { Sequelize } = require("sequelize");
const voucherTemplateModel = require("./models/voucherTemplate.model");
const voucherModel = require("./models/voucher.model");

const sequelize = new Sequelize("voucher-db", "postgres", "example", {
  host: "voucher-db",
  dialect: "postgres",
  //   port: 5434,
  pool: {
    max: 5, // Số lượng kết nối tối đa
    min: 0, // Số lượng kết nối tối thiểu
    acquire: 30000, // Thời gian tối đa để lấy kết nối (ms)
    idle: 10000, // Thời gian tối đa giữ kết nối rảnh (ms)
  },
});

const VoucherTemplateModel = voucherTemplateModel(sequelize);
const VoucherModel = voucherModel(sequelize);

VoucherTemplateModel.hasMany(VoucherModel, {
  foreignKey: "voucher_template_id",
});
VoucherModel.belongsTo(VoucherTemplateModel, {
  foreignKey: "voucher_template_id",
});

const connectToDB = async () => {
  let isConnected = false;
  let retryCount = 0;
  const maxRetries = 5; // Số lần thử lại tối đa

  while (!isConnected && retryCount < maxRetries) {
    try {
      await sequelize.authenticate();
      console.log("Connected to db");
      await sequelize.sync({ alter: true });
      console.log("Table created successfully");
      isConnected = true;
    } catch (error) {
      retryCount++;
      console.log(
        `Cannot connect to db, retrying (${retryCount}/${maxRetries})...\n`,
        error
      );
      // Đợi 5 giây trước khi thử lại
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  if (!isConnected) {
    console.log(`Failed to connect to db after ${maxRetries} attempts`);
  }
};

module.exports = { connectToDB, VoucherTemplateModel, VoucherModel };
