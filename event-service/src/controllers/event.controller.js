const eventService = require('../services/event.service');

exports.createEvent = async (req, res) => {
  try {
    const { gameIds, ...eventData } = req.body;
    const gameIdArray = JSON.parse(gameIds)
    const file = req.file;
    let brandID = null;
    if(req.user.role == "brand")
    {
      brandID = req.user.id
    }
    const newEvent = await eventService.createEvent(eventData, gameIdArray, file, brandID);
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.editEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId
    const { gameIds, ...eventData } = req.body; // Lấy dữ liệu event mới và gameIds
    const gameIdArray = JSON.parse(gameIds)
    const file = req.file; // Lấy file ảnh nếu có
    let brandID = null;

    // Nếu user có role là brand, gán brandID từ user
    if (req.user.role == "brand") {
      brandID = req.user.id;
    }

    // Gọi service để thực hiện chỉnh sửa sự kiện
    const updatedEvent = await eventService.editEvent(eventId, eventData, gameIdArray, file, brandID);
    res.status(200).json(updatedEvent); // Trả về dữ liệu event sau khi chỉnh sửa
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteEvent = async (req, res) => {
  try {
    const response = await eventService.deleteEvent(req.params.id);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    console.log(req.user);
    const events = await eventService.getAllEvents();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getEventsByBrandId = async (req, res) => {
  try {
    const brandId = req.user.id;
    const events = await eventService.getEventsByBrandId(brandId);
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getEventsBySearchQuery = async (req, res) => {
  try {
    const { page = 1, search = '' } = req.query;
    console.log(page);
    console.log(search);
    // Chuyển đổi page thành số nguyên
    const pageNumber = parseInt(page, 10);

    if (isNaN(pageNumber) || pageNumber < 1) {
      return res.status(400).json({ message: 'Invalid page number' });
    }

    let brandID = null;
    if(req.user.role == "brand")
    {
      brandID = req.user.id
    }
    // Lấy danh sách sự kiện từ service
    const events = await eventService.getEventsBySearchQuery(pageNumber, search, brandID);

    return res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
exports.getHighlightedEvents = async (req, res) => {
  try {
    const highlightedEvents = await eventService.getHighlightedEvents();
    res.json({ data: highlightedEvents });
  } catch (error) {
    console.error('Failed to fetch highlighted events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.getActiveEventsCount = async (req, res) => {
  try {
    // Gọi service để lấy tổng số lượng event đang diễn ra
    const activeEventsCount = await eventService.getActiveEventsCount();

    return res.status(200).json({
      message: 'Active events count retrieved successfully',
      activeEventsCount
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving active events count',
      error: error.message
    });
  }
};
exports.getEventsCountByDay = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    // Gọi service để lấy dữ liệu thống kê
    const eventsCountByDay = await eventService.getEventsCountByDay(startDate, endDate);

    return res.status(200).json({
      message: 'Event count by day retrieved successfully',
      eventsCountByDay
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving event count by day',
      error: error.message
    });
  }
};