const db = require('../models/index.model.js');
const Event = db.event;
const { Op, Sequelize } = require('sequelize');
const admin = require('firebase-admin');
const bucket = admin.storage().bucket();
const axios = require('axios')
const generateDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

exports.createEvent = async (eventData,gameIds, file, brandID) => {
  try {

  const newEvent = await Event.create({
        brand_id: brandID, // ID của thương hiệu, truyền từ eventData hoặc từ tham số
        poster: null, // Sẽ cập nhật sau khi upload hình ảnh
        name: eventData.name, // Tên sự kiện
        description: eventData.description, // Mô tả sự kiện
        start_time: eventData.start_time, // Thời gian bắt đầu
        end_time: eventData.end_time // Thời gian kết thúc
      });
    const imageUrl = await this.uploadImage(file, newEvent.id);
    await Event.update({ poster: imageUrl }, { where: { id: newEvent.id } });

    for (const gameId of gameIds) {
      try {
        // Gọi axios để thêm event cho từng game
        const response = await axios.post(`http://api-gateway:8000/game/addEvent/${gameId}`, {
          eventId: newEvent.id,
          brandId: brandID
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.authToken}` // Thêm token nếu cần
          }
        });

        if (response.status === 200) {
          console.log(`Event added to game ${gameId} successfully.`);
        } else {
          console.log(`Failed to add event to game ${gameId}: ${response.data.message}`);
        }
      } 
      catch (error) {
        throw new Error(`Failed to add event to game ${gameId}: ${error.message}`);
        }
    }
    return newEvent;
  } catch (error) {
    throw new Error('Failed to create event: ' + error.message);
  }
};

exports.editEvent = async (eventId, eventData, gameIds, file, brandID) => {
  try {
    // Tìm sự kiện theo ID
    let event = await Event.findByPk(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Cập nhật thông tin sự kiện
    await Event.update({
      brand_id: brandID, // Nếu có brand_id, cập nhật
      name: eventData.name,
      description: eventData.description,
      start_time: eventData.start_time,
      end_time: eventData.end_time
    }, {
      where: { id: eventId }
    });

    // Nếu có file, cập nhật poster
    if (file) {
      const imageUrl = await this.uploadImage(file, eventId);
      await Event.update({ poster: imageUrl }, { where: { id: eventId } });
    }

    // Xử lý cập nhật gameIds liên kết với event
    if (gameIds && gameIds.length > 0) {
      for (const gameId of gameIds) {
        try {
          // Gọi axios để thêm event vào từng game
          const response = await axios.post(`http://api-gateway:8000/game/addEvent/${gameId}`, {
            eventId: eventId,
            brandId: brandID
          }, {
            headers: {
              'Authorization': `Bearer ${process.env.authToken}`
            }
          });

          if (response.status === 200) {
            console.log(`Event added to game ${gameId} successfully.`);
          } else {
            console.log(`Failed to add event to game ${gameId}: ${response.data.message}`);
          }
        } catch (error) {
          throw new Error(`Failed to add event to game ${gameId}: ${error.message}`);
        }
      }
    }

    // Lấy lại sự kiện đã cập nhật
    event = await Event.findByPk(eventId);
    return event;
  } catch (error) {
    throw new Error('Failed to edit event: ' + error.message);
  }
};

exports.deleteEvent = async (id) => {
  try {
    const result = await Event.destroy({
      where: { id }
    });

    if (result === 0) {
      throw new Error(`Event with ID ${id} not found`);
    }

    return { message: 'Event deleted successfully' };
  } catch (error) {
    throw new Error('Failed to delete event: ' + error.message);
  }
};

exports.getAllEvents = async () => {
  try {
    const events = await Event.findAll();
    return events;
  } catch (error) {
    throw new Error('Failed to retrieve events: ' + error.message);
  }
};

exports.getEventById = async (id) => {
  try {
    const event = await Event.findByPk(id);
    if (!event) {
      throw new Error(`Event with ID ${id} not found`);
    }
    return event;
  } catch (error) {
    throw new Error('Failed to retrieve event: ' + error.message);
  }
};
exports.getEventsByBrandId = async (brandId) => {
  try {
    const events = await Event.findAll({
      where: { brand_id: brandId }
    });
    return events;
  } catch (error) {
    throw new Error('Failed to retrieve events by brand ID: ' + error.message);
  }
};
exports.getEventsBySearchQuery = async (page, search, brandID) => {
  try {
    // Đặt số lượng sự kiện trên một trang
    const limit = 8;
    // Tính toán offset dựa trên số trang
    const offset = (page - 1) * limit;
    console.log(page);
    console.log(search);
    // Tạo điều kiện tìm kiếm
    const whereClause = {
      name: {
        [Op.iLike]: `%${search}%` // Tìm kiếm không phân biệt chữ hoa chữ thường
      }
    };

    if (brandID) {
      whereClause.brand_id = brandID;
    }

    // Lấy danh sách sự kiện với phân trang và tìm kiếm
    const events = await Event.findAndCountAll({
      where: whereClause,
      limit: limit,
      offset: offset,
      order: [['id', 'ASC']] // Sắp xếp theo thời gian bắt đầu sự kiện
    });

    return {
      totalItems: events.count,
      totalPages: Math.ceil(events.count / limit),
      currentPage: page,
      data: events.rows
  };
  } catch (error) {
    throw new Error('Failed to retrieve events: ' + error.message);
  }
};
exports.getHighlightedEvents = async () => {
  return await Event.findAll({
    limit: 15,
    order: [['id', 'DESC']],
  });
};
exports.uploadImage = (file, id) => {
  return new Promise((resolve, reject) => {
    try {
      const filepath = `images/${file.fieldname}` + '/' + `${id}_${file.originalname}`;
      const blob = bucket.file(filepath);
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: file.mimetype,
        },
      });

      blobStream.on('error', err => {
        console.error(err);
        reject('Error uploading file.');
      });

      blobStream.on('finish', () => {
        blob.getSignedUrl({
          action: 'read',
          expires: '12-12-2024'
        }, (err, signedUrl) => {
          if (err) {
            console.error('Error getting signed URL:', err);
            reject('Error getting file URL.');
          }
          console.log('File uploaded successfully.');
          resolve(signedUrl);
        });
      });

      blobStream.end(file.buffer);
    } catch (error) {
      console.error(error);
      reject('Error during file upload.');
    }
  });
};
exports.getActiveEventsCount = async () => {
  try {
    const currentTime = new Date();

    // Đếm tổng số event đang diễn ra
    const activeEventsCount = await Event.count({
      where: {
        start_time: {
          [Op.lte]: currentTime
        },
        end_time: {
          [Op.gte]: currentTime
        }
      }
    });

    return activeEventsCount;
  } catch (error) {
    throw new Error('Error retrieving active events count: ' + error.message);
  }
};
exports.getEventsCountByDay = async (startDate, endDate) => {
  try {
    // Lấy danh sách các ngày trong khoảng thời gian
    const dateRange = generateDateRange(startDate, endDate);

    // Lấy số lượng sự kiện nhóm theo ngày
    const eventsCount = await Event.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('created_at')), 'created_date'], // Lấy ngày tạo
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'event_count'] // Đếm số lượng event
      ],
      where: {
        created_at: {
          [Op.between]: [new Date(startDate), new Date(endDate)] // Điều kiện lọc giữa startDate và endDate
        }
      },
      group: [Sequelize.fn('DATE', Sequelize.col('created_at'))], // Nhóm theo ngày
      order: [[Sequelize.fn('DATE', Sequelize.col('created_at')), 'ASC']] // Sắp xếp theo ngày tăng dần
    });

    // Chuyển kết quả thành object để dễ tìm kiếm
    const eventsMap = eventsCount.reduce((acc, event) => {
      acc[event.dataValues.created_date] = event.dataValues.event_count;
      return acc;
    }, {});

    // Tạo danh sách kết quả, bao gồm những ngày không có sự kiện
    const result = dateRange.map(date => {
      const formattedDate = date.toISOString().slice(0, 10); // Format YYYY-MM-DD
      return {
        created_date: formattedDate,
        event_count: eventsMap[formattedDate] || 0 // Nếu không có event, trả về 0
      };
    });

    return result;
  } catch (error) {
    throw new Error('Error retrieving event count by day: ' + error.message);
  }
};
