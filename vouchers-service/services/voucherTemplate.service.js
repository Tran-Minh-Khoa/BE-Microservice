const { where, Op } = require("sequelize");
const { VoucherTemplateModel } = require("../db");

exports.createVoucherTemplate = async (data) => {
    try {
        const voucherTemplate = await VoucherTemplateModel.create({
            name: data.name,
            image: data.image,
            value: data.value,
            description: data.description,
            status: data.status,
            brand_id: data.brand_id
        })
        // console.log(voucherTemplate);
        return voucherTemplate;
    } catch (error) {
        throw new Error("Cannot create voucher template: " + error.message);
    }
}

exports.getAllVoucherTemplates = async (brand_id) => {
    try {
        const allVoucherTemplates = await VoucherTemplateModel.findAll({
            attributes: {
                exclude: ['created_at', 'updated_at']
            },
            where: {
                brand_id: brand_id
            }
        });
        return allVoucherTemplates;
    } catch (error) {
        throw new Error("Cannot get voucher template: " + error.message);
    }
}

exports.getByID = async (id) => {
    try {
        const voucherTemplate = await VoucherTemplateModel.findOne({
            where: {
                id: id
            }
        })
        if (!voucherTemplate) {
            throw new Error("Voucher template id not found");
        }
        return voucherTemplate;
    } catch (error) {
        throw new Error("Cannot get voucher template by ID: " + error.message);
    }
}

exports.searchVouchers = async (page, search) => {
    try {
        const limit = 5;
        const offset = (page - 1) * limit;
        const res = await VoucherTemplateModel.findAndCountAll({
            attributes: {
                exclude: ["created_at", "updated_at"]
            },
            where: {
                name: {
                    [Op.iLike]: `%${search}%`
                }
            },
            limit: limit,
            offset: offset,
            order: [["id", "DESC"]]
        });
        return {
            totalItems: res.count,
            totalPages: Math.ceil(res.count / limit),
            currentPage: page,
            data: res.rows
        };
    } catch (error) {
        throw new Error("Cannot search voucher template: " + error.message);
    }
}