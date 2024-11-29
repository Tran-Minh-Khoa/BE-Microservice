const db = require('../models/index.model.js');
const Participation = db.participation;
const { Op, Sequelize } = require('sequelize');
const eventService = require('./event.service.js');
const axios = require('axios')
const Redis = require("ioredis");
const redis = new Redis({
  port: 6379,
  host: 'redis',
});
const generateDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
redis.subscribe('participation_channel', (err, count) => {
  if (err) {
    console.error("Failed to subscribe: %s", err.message);
  } else {
    console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
  }
});

redis.on("message", async (channel, message) => {
  if (channel === "participation_channel") {
    try {
      const participationData = JSON.parse(message); // Giả sử dữ liệu là JSON string

      const { game_id , user_id } = participationData;
      console.log("Received participation data:", participationData);
      console.log(game_id)
      
      
      try {
        // Gọi axios để thêm event cho từng game
        const response = await axios.get(`http://api-gateway:8000/game/${game_id}` ,{
          headers: {
            'Authorization': `Bearer ${process.env.authToken}` // Thêm token nếu cần
          }
        });
        const game = response.data
        console.log(game)
        if (response.status === 200) {
          console.log(`Event added to game ${game_id} successfully.`);
          const newParticipation = await this.addParticipation({event_id:game.event_id,brand_id:game.brand_id,user_id:user_id});
          console.log('Participation added successfully:', newParticipation);
        } else {
          console.log(`Failed to add event to game ${game_id}: ${response.data.message}`);
        }
      } 
      catch (error) {
        throw new Error(`Failed to add event to game ${game_id}: ${error.message}`);
        }
      // Thêm participation bằng service
      
    } catch (err) {
      console.error('Error processing participation:', err.message);
    }
  }
});
exports.addParticipation = async (participationData) => {
  try {
    // Ensure the keys in participationData match the model fields
    const newParticipation = await Participation.create({
      event_id: participationData.event_id,
      brand_id: participationData.brand_id,
      user_id: participationData.user_id,
    });
    return newParticipation;
  } catch (error) { 
    throw new Error('Failed to add participation: ' + error.message);
  }
};

exports.getParticipationByEventId = async (event_id) => {
  try {
    const participations = await Participation.findAll({ where: { event_id } });
    return participations;
  } catch (error) {
    throw new Error('Failed to retrieve participations by event ID: ' + error.message);
  }
};

exports.getParticipationByUserId = async (user_id) => {
  try {
    const participations = await Participation.findAll({ where: { user_id } });
    return participations;
  } catch (error) {
    throw new Error('Failed to retrieve participations by user ID: ' + error.message);
  }
};

exports.countParticipationsByDate = async (startDate, endDate, brand_id, event_id) => {
  try {
    const dateRange = generateDateRange(startDate, endDate);

    const whereClause = {
      brand_id: brand_id,
      created_date: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    };

    if (event_id) {
      whereClause.event_id = event_id;
    }

    // Lấy dữ liệu participation theo ngày
    const participationData = await Participation.findAll({
      where: whereClause,
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('created_date')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('user_id')), 'count']
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('created_date'))],
      order: [['date', 'ASC']]
    });

    // Tạo object map để chứa dữ liệu theo ngày
    const participationMap = participationData.reduce((acc, participation) => {
      acc[participation.dataValues.date] = participation.dataValues.count;
      return acc;
    }, {});

    // Tạo kết quả với các ngày không có participation sẽ trả về count 0
    const result = dateRange.map(date => {
      const formattedDate = date.toISOString().slice(0, 10); // Format YYYY-MM-DD
      return {
        date: formattedDate,
        count: participationMap[formattedDate] || 0 // Nếu không có participation, trả về 0
      };
    });

    return result;
  } catch (error) {
    throw new Error('Error counting participations by date: ' + error.message);
  }
};
exports.getParticipationByBrandId = async (brand_id) => {
  try {
    const events = await eventService.getEventsByBrandId(brand_id);

    const participations = [];

    for (const event of events) {
      const participation = await this.getParticipationByEventId(event.id);
      if (participation) {
        participations.push(...participation);
      }
    }
    return participations;
  } catch (error) {
    throw new Error('Failed to retrieve participations by brand ID: ' + error.message);
  }
};
