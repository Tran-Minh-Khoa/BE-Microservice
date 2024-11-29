const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const multer = require("multer");
const multerStorage = multer.memoryStorage();

const multerUpload = multer({ storage: multerStorage });
router.post('/', multerUpload.single("poster"), eventController.createEvent);
router.put('/:eventId', multerUpload.single("poster"), eventController.editEvent);
router.delete('/:id', eventController.deleteEvent);
router.get('/all', eventController.getAllEvents);
router.get('/search', eventController.getEventsBySearchQuery);
router.get('/highlighted', eventController.getHighlightedEvents);
router.get('/by-brand-id/', eventController.getEventsByBrandId);
router.get('/active-events-count', eventController.getActiveEventsCount);
router.get('/events-count-by-day', eventController.getEventsCountByDay);
router.get('/:id', eventController.getEventById);

module.exports = router;
