const VoucherTemplateService = require("../services/voucherTemplate.service");

exports.createVoucherTemplate = async (req, res) => {
    const data = req.body;
    const brandID = req.user.id
    data.brand_id = brandID
    if (!data.name || !data.value || !data.description || !data.status) {
        return res.status(400).json({ message: "invalid input" });
    }
    try {
        const voucherTemplate = await VoucherTemplateService.createVoucherTemplate(data);
        // console.log(voucherTemplate);
        return res.status(201).json({
            message: "Create voucher template successfully",
            data: voucherTemplate
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

exports.getAllVoucherTemplates = async (req, res) => {
    try {
        const allVoucherTemplates = await VoucherTemplateService.getAllVoucherTemplates(req.query.brand_id);
        return res.status(200).json(allVoucherTemplates);
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

exports.getByID = async (req, res) => {
    try {
        const voucherTemplate = await VoucherTemplateService.getByID(req.query.id);
        return res.status(200).json(voucherTemplate);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.searchVouchers = async (req, res) => {
    try {
        const page = req.query.page;
        const search = req.query.search;
        const voucherTemplates = await VoucherTemplateService.searchVouchers(page, search);
        return res.status(200).json(voucherTemplates);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}