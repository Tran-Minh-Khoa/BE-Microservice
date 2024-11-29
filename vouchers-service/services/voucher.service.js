const { ForeignKeyConstraintError, where, Sequelize, Op } = require('sequelize');
const { VoucherModel } = require("../db");
const { VoucherTemplateModel } = require("../db");
const QRCode = require("qrcode");
const { raw } = require('express');

exports.createVoucher = async (data) => {
    try {
        // console.log("heree");
        console.log("input data\n", data);
        const voucherTemplate = await VoucherTemplateModel.findByPk(data.voucher_template_id);
        if (voucherTemplate === null) {
            return null;
        } else console.log("found voucher template");
        // const latest_voucher = await VoucherModel.findOne({
        //     order: [['id', 'desc']]
        // })
        // const new_voucher_id = latest_voucher.dataValues.id + 1;
        // const qr = await QRCode.toDataURL(new_voucher_id);
        const Voucher = await VoucherModel.create({
            qr: data.qr,
            status: data.status,
            voucher_template_id: data.voucher_template_id,
            event_id: data.event_id,
            game_id: data.event_id,
            user_id: data.user_id
        })
        return Voucher;
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            throw new Error("Invalid voucher_template_id");
        } else {
            throw new Error("Cannot create voucher by id: " + error.message)
        }
    }
}

exports.getAllVouchers = async () => {
    try {
        const allVouchers = await VoucherModel.findAll();
        return allVouchers;
    } catch (error) {
        console.log(error);
    }
}

exports.getTotalVouchersInBrand = async (brand_id) => {
    try {
        const amount = await VoucherModel.count({
            where: {
                brand_id: brand_id
            }
        })
        console.log("total vouchers in brand: ", amount);
        return amount;
    } catch (error) {
        console.log(error);
    }
}

exports.getVouchersByEventID = async (event_id) => {
    try {
        const vouchers = await VoucherModel.findAll({
            where: {
                event_id: event_id
            }
        })
        return vouchers;
    } catch (error) {
        console.log(error);
    }
}

exports.getTotalValueVouchersByGameID = async (game_id) => {
    try {
        const totalVouchersByGameID = await VoucherModel.count({
            where: {
                game_id: game_id
            }
        })
        const voucherValue = await VoucherTemplateModel.findAll({
            attributes: ['value']
        });
        console.log("total vouchers by game id ", totalVouchersByGameID);
        console.log("voucher value ", voucherValue);
        return totalVouchersByGameID * voucherValue;
    } catch (error) {
        console.log(error);
    }
}

exports.getVouchersByGameID = async (game_id) => {
    try {
        const vouchers = VoucherModel.findAll({
            where: {
                game_id: game_id
            }
        });
        return vouchers;
    } catch (error) {
        console.log(error);
    }
}

exports.getVouchersByUserID = async (user_id) => {
    try {
        const vouchers = await VoucherModel.findAll({
            where: {
                user_id: user_id
            }
        });
        return vouchers;
    } catch (error) {
        console.error('Error fetching vouchers by user_id:', error);
        throw error;
    }
};

exports.getByID = async (id) => {
    try {
        const voucher = await VoucherModel.findOne({
            where: {
                id: id
            }
        });
        if (!voucher) {
            throw new Error("Voucher id not found");
        }
        return voucher;
    } catch (error) {
        throw new Error("Cannot get voucher by id: " + error.message)
    }
}

exports.countVoucherByBrandID = async (voucher_template_id, brand_id) => {
    try {
        const count = await VoucherModel.count({
            include: [
                {
                    model: VoucherTemplateModel,
                    where: {
                        brand_id: brand_id
                    }
                }
            ],
            where: {
                voucher_template_id: voucher_template_id
            }
        })
        return count;

    } catch (error) {
        throw new Error("Cannot count voucher by brand id: " + error.message)
    }
}

// exports.getVouchersCountByDayWithBrandID = async (startDate, endDate, brand_id) => {
//     try {
//         const vouchersCount = await VoucherModel.findAll({
//             attributes: [
//                 [Sequelize.fn("DATE", Sequelize.col('created_at')), "created_date"],
//                 [Sequelize.fn("COUNT", Sequelize.col("voucher.id")), "voucher_count"]
//             ],
//             include: [
//                 {
//                     model: VoucherTemplateModel,
//                     attributes: [],
//                     where: {
//                         brand_id: brand_id,
//                     }
//                 }
//             ],
//             where: {
//                 created_at: {
//                     [Op.between]: [startDate, endDate]
//                 },
//             },
//             group: [
//                 Sequelize.fn("DATE", Sequelize.col("created_at")),
//             ],
//             order: [[Sequelize.fn("DATE", Sequelize.col("created_at")), "ASC"]]
//         })
//         return vouchersCount;
//     } catch (error) {
//         throw new Error("Cannot count voucher in month by event id: " + error.message)
//     }
// }
const generateDateRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
  
    while (currentDate <= new Date(endDate)) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dates;
  };
  
  exports.getVouchersCountByDayWithBrandID = async (startDate, endDate, brand_id) => {
    try {
      const dateRange = generateDateRange(startDate, endDate);
  
      const vouchersData = await VoucherModel.findAll({
        attributes: [
          [Sequelize.fn("DATE", Sequelize.col('created_at')), "created_date"],
          [Sequelize.fn("COUNT", Sequelize.col("voucher.id")), "voucher_count"]
        ],
        include: [
          {
            model: VoucherTemplateModel,
            attributes: [],
            where: {
              brand_id: brand_id,
            }
          }
        ],
        where: {
          created_at: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        },
        group: [Sequelize.fn("DATE", Sequelize.col("created_at"))],
        order: [[Sequelize.fn("DATE", Sequelize.col("created_at")), "ASC"]]
      });
  
      // Tạo object map để chứa dữ liệu voucher theo ngày
      const vouchersMap = vouchersData.reduce((acc, voucher) => {
        acc[voucher.dataValues.created_date] = voucher.dataValues.voucher_count;
        return acc;
      }, {});
  
      // Tạo kết quả với các ngày không có voucher sẽ trả về voucher_count = 0
      const result = dateRange.map(date => {
        const formattedDate = date.toISOString().slice(0, 10); // Format YYYY-MM-DD
        return {
          date: formattedDate,
          voucher_count: vouchersMap[formattedDate] || 0 // Nếu không có voucher, trả về 0
        };
      });
  
      return result;
    } catch (error) {
      throw new Error('Error counting vouchers by day: ' + error.message);
    }
  };
  

exports.getPublishedVouchersCountByEventID = async (event_id) => {
    try {
        const count = await VoucherModel.count({
            where: {
                event_id: event_id
            }
        })
        return count;
    } catch (error) {
        throw new Error("Cannot get published voucher count by event id: " + error.message)
    }
}


exports.getTotalExpenseByEventID = async (event_id) => {
    try {
        const results = await VoucherModel.findAll({
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.col('voucher.id')), 'voucher_count'],
                [Sequelize.col('vouchertemplate.value'), 'voucher_template_value']
            ],
            include: [
                {
                    model: VoucherTemplateModel,
                    attributes: [],
                }
            ],
            where: {
                event_id: event_id
            },
            group: ['voucher.voucher_template_id', 'vouchertemplate.value'],
            raw: true,
        });
        const totalExpense = results.reduce((sum, row) => {
            console.log(row);
            const voucherCount = parseFloat(row.voucher_count);
            const value = parseFloat(row.voucher_template_value);
            return sum + (voucherCount * value);
        }, 0);
        return totalExpense;
    } catch (error) {
        throw new Error("Cannot get total expense by event id: " + error.message)
    }
}

exports.getPublishedVouchersCount = async () => {
    try {
        const count = await VoucherModel.count();
        return count;
    } catch (error) {
        throw new Error("Cannot get published voucher count: " + error.message)
    }
}

// exports.getVouchersCountByDay = async (startDate, endDate) => {
//     try {
//         const vouchersCount = await VoucherModel.findAll({
//             attributes: [
//                 [Sequelize.fn("DATE", Sequelize.col('created_at')), "created_date"],
//                 [Sequelize.fn("COUNT", Sequelize.col("id")), "voucher_count"]
//             ],
//             where: {
//                 created_at: {
//                     [Op.between]: [startDate, endDate]
//                 },
//             },
//             group: [
//                 Sequelize.fn("DATE", Sequelize.col("created_at")),
//             ],
//             order: [[Sequelize.fn("DATE", Sequelize.col("created_at")), "ASC"]]
//         })
//         return vouchersCount;
//     } catch (error) {
//         throw new Error("Cannot get voucher count by day: " + error.message)
//     }
// }

exports.getVouchersCountByDay = async (startDate, endDate) => {
    try {
      const dateRange = generateDateRange(startDate, endDate);
  
      const vouchersData = await VoucherModel.findAll({
        attributes: [
          [Sequelize.fn("DATE", Sequelize.col('created_at')), "created_date"],
          [Sequelize.fn("COUNT", Sequelize.col("id")), "voucher_count"]
        ],
        where: {
          created_at: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        },
        group: [Sequelize.fn("DATE", Sequelize.col("created_at"))],
        order: [[Sequelize.fn("DATE", Sequelize.col("created_at")), "ASC"]]
      });
  
      // Tạo object map để chứa dữ liệu voucher theo ngày
      const vouchersMap = vouchersData.reduce((acc, voucher) => {
        acc[voucher.dataValues.created_date] = voucher.dataValues.voucher_count;
        return acc;
      }, {});
  
      // Tạo kết quả với các ngày không có voucher sẽ trả về voucher_count = 0
      const result = dateRange.map(date => {
        const formattedDate = date.toISOString().slice(0, 10); // Format YYYY-MM-DD
        return {
          date: formattedDate,
          voucher_count: vouchersMap[formattedDate] || 0 // Nếu không có voucher, trả về 0
        };
      });
  
      return result;
    } catch (error) {
      throw new Error('Cannot get voucher count by day: ' + error.message);
    }
  };

