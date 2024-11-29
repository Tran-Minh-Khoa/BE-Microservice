const participationService = require('../services/participation.service');

exports.addParticipation = async (req, res) => {
  try {
    const participationData = req.body;
    const newParticipation = await participationService.addParticipation(participationData);
    res.status(201).json(newParticipation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getParticipationByEventId = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const participations = await participationService.getParticipationByEventId(eventId);
    res.status(200).json(participations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getParticipationByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const participations = await participationService.getParticipationByUserId(userId);
    res.status(200).json(participations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getParticipationCountByDate  = async (req, res) => {
  try {
        const { startDate, endDate, eventID } = req.query;
        const brandID = req.user.id;
        if (!startDate || !endDate || !brandID) {
            return res.status(400).json({ message: 'Missing required query parameters: startDate, endDate, brandID' });
        }

        const data = await participationService.countParticipationsByDate(startDate, endDate, brandID, eventID);
        
        return res.json({ data });
    } catch (error) {
        console.error('Error fetching participation count by date:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getParticipationByBrandId = async (req, res) => {
  try {
    const brandId = req.user.id;
    const participations = await participationService.getParticipationByBrandId(brandId);
    res.status(200).json(participations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}