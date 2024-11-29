const express = require('express');
const router = express.Router();
const participationController = require('../controllers/participation.controller');

router.post('/', participationController.addParticipation);
router.get('/event/:eventId', participationController.getParticipationByEventId);
router.get('/user/:userId', participationController.getParticipationByUserId);
router.get('/count-by-date', participationController.getParticipationCountByDate);
router.get('/by-brand-id', participationController.getParticipationByBrandId);
module.exports = router;
