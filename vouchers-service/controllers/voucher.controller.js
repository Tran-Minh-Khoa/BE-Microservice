const VoucherService = require("../services/voucher.service");

exports.createVoucher = async (req, res) => {
    const data = req.body
    if (!data.status) {
        return res.status(400).json({ message: "Invalid input" });
    }

    try {
        const newVoucher = await VoucherService.createVoucher(data);
        console.log(newVoucher);
        if (newVoucher) {
            res.status(201).json({
                message: "Create voucher successfully",
                newVoucher: newVoucher
            });
        } else {
            res.status(400).json({
                message: "voucher_template_id not exist"
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

exports.getAllVouchers = async (req, res) => {
    try {
        const allVouchers = await VoucherService.getAllVouchers();
        res.status(200).json(allVouchers);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

exports.getTotalVouchersInBrand = async (req, res) => {
    try {
        const totalVouchersInBrand = await VoucherService.getTotalVouchersInBrand(req.query.brand_id);
        res.status(200).json(totalVouchersInBrand);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

exports.getVouchersByEventID = async (req, res) => {
    try {
        const vouchers = await VoucherService.getVouchersByEventID(req.query.event_id);
        res.status(200).json(vouchers);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

exports.getVouchersByGameID = async (req, res) => {
    try {
        const vouchers = await VoucherService.getVouchersByGameID(req.query.game_id);
        res.status(200).json(vouchers);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

exports.getVouchersByUserID = async (req, res) => {
    const user_id = req.user.id;

    try {
        const vouchers = await VoucherService.getVouchersByUserID(user_id);

        if (!vouchers || vouchers.length === 0) {
            return res.status(404).json({ message: 'No vouchers found for this user.' });
        }

        return res.status(200).json(vouchers);
    } catch (error) {
        console.error('Error in getVouchersByUserID controller:', error);
        return res.status(500).json({ message: 'An error occurred while fetching vouchers.' });
    }
};

exports.getTotalValueVouchersByGameID = async (req, res) => {
    try {
        const totalVoucherValue = await VoucherService.getTotalValueVouchersByGameID(req.query.game_id);
        res.status(200).json(totalVoucherValue);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

exports.getByID = async (req, res) => {
    try {
        const voucher = await VoucherService.getByID(req.query.id);
        return res.status(200).json(voucher);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.countVoucherByBrandID = async (req, res) => {
    try {
        const count = await VoucherService.countVoucherByBrandID(req.query.voucher_template_id, req.query.brand_id);
        return res.status(200).json(count);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.getVouchersCountByDayWithBrandID = async (req, res) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const brand_id = req.query.brand_id;
        const vouchersCount = await VoucherService.getVouchersCountByDayWithBrandID(startDate, endDate, brand_id);
        return res.status(200).json(vouchersCount);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.getPublishedVouchersCountByEventID = async (req, res) => {
    try {
        const count = await VoucherService.getPublishedVouchersCountByEventID(req.query.event_id);
        return res.status(200).json(count);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.getTotalExpenseByEventID = async (req, res) => {
    try {
        const totalExpense = await VoucherService.getTotalExpenseByEventID(req.query.event_id);
        return res.status(200).json(totalExpense);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


exports.getPublishedVouchersCount = async (req, res) => {
    try {
        const count = await VoucherService.getPublishedVouchersCount();
        return res.status(200).json(count);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.getVouchersCountByDay = async (req, res) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const vouchersCount = await VoucherService.getVouchersCountByDay(startDate, endDate);
        return res.status(200).json(vouchersCount);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
