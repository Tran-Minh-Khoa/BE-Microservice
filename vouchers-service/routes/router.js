const express = require('express');
const router = express.Router();
const VoucherController = require('../controllers/voucher.controller');
const VoucherTemplateController = require('../controllers/voucherTemplate.controller');

// VOUCHER TEMPLATE
router.post("/voucherTemplate/add", VoucherTemplateController.createVoucherTemplate);
router.get("/voucherTemplate/getAll", VoucherTemplateController.getAllVoucherTemplates);
router.get("/voucherTemplate/getByID", VoucherTemplateController.getByID);
router.get("/voucherTemplate/search", VoucherTemplateController.searchVouchers);
// router.get("/voucherTemplate/paginated")

// VOUCHER
router.post("/voucher/add", VoucherController.createVoucher);
router.get("/voucher/getAll", VoucherController.getAllVouchers);
router.get("/voucher/getTotalVouchersInBrand", VoucherController.getTotalVouchersInBrand);
router.get("/voucher/getVouchersByEventID", VoucherController.getVouchersByEventID);
router.get("/voucher/getVouchersByGameID", VoucherController.getVouchersByGameID);
router.get("/voucher/getByID", VoucherController.getByID);
router.get('/voucher/getByUserID', VoucherController.getVouchersByUserID);

// untested
router.get("/voucher/getTotalValueVouchersByGameId", VoucherController.getTotalValueVouchersByGameID);
router.get("/voucher/countVoucherByBrandID", VoucherController.countVoucherByBrandID);
router.get("/voucher/getVouchersCountByDayWithBrandID", VoucherController.getVouchersCountByDayWithBrandID);
router.get("/voucher/getPublishedVouchersCountByEventID", VoucherController.getPublishedVouchersCountByEventID);
router.get("/voucher/getTotalExpenseByEventID", VoucherController.getTotalExpenseByEventID);
router.get("/voucher/getPublishedVouchersCount", VoucherController.getPublishedVouchersCount);
router.get("/voucher/getVouchersCountByDay", VoucherController.getVouchersCountByDay);
// router.get("/voucher/getTotalVouchers")
// router.get("/voucher/getTotalVoucherValue")



module.exports = router;