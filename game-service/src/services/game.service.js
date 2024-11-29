const db = require('../models/index.model.js');
const Redis = require("ioredis");
const Game = db.game
const { Op, Sequelize } = require('sequelize');

const redis = new Redis({
  port: 6379,
  host: 'redis',
});
const admin = require('firebase-admin');
const bucket = admin.storage().bucket();
const generateDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
exports.createGame = async (gameData, file, brandID) => {
  try {

    const newGame = await Game.create({
      brand_id: brandID,             // ID của thương hiệu
      event_id: gameData.event_id ? gameData.event_id : null,             // ID của sự kiện liên kết
      poster: null,                 // URL hình ảnh đại diện cho game
      name: gameData.name,                     // Tên của game
      game_type_id: gameData.game_type_id,     // ID loại game
      game_data_id: gameData.game_data_id,     // ID dữ liệu game
      tradable: gameData.tradable,             // Game có thể trao đổi hay không (boolean)
      description: gameData.description,       // Mô tả chi tiết game
      amount: gameData.amount,                 // Số lượng vật phẩm/voucher trong game
      voucher_template_id: gameData.voucher_template_id, // ID template voucher
      start_time: gameData.start_time,         // Thời gian bắt đầu game
      end_time: gameData.end_time              // Thời gian kết thúc game
    });
    const imageUrl = await this.uploadImage(file, newGame.id);

    await Game.update({ poster: imageUrl }, { where: { id: newGame.id } });
    if (newGame.game_type_id === 1) {
      const roomData = {
        gameId: newGame.id,
        quizId: newGame.game_data_id,
        voucherTemplateId: newGame.voucher_template_id,
        startTime: gameData.start_time
      }

      redis.publish("room_schedule", JSON.stringify(roomData));
    }

    return newGame;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to create game');
  }
};

exports.updateGame = async (gameId, updatedData, file) => {
  try {
    if(file) {
      const imageUrl = await this.uploadImage(file, gameId);
      updatedData.poster = imageUrl;
    }
    // Lấy game hiện tại để kiểm tra tồn tại
    const existingGame = await Game.findByPk(gameId);
    console.log(existingGame)
    if (!existingGame) {
      throw new Error(`Game with ID ${gameId} not found`);
    }

     // Cập nhật các thuộc tính nếu có trong updatedData
     existingGame.name = updatedData.name || existingGame.name;
    //  existingGame.game_type_id = updatedData.game_type_id || existingGame.game_type_id;
    //  existingGame.game_data_id = updatedData.game_data_id || existingGame.game_data_id;
    //  existingGame.event_id = updatedData.event_id
     existingGame.tradable = updatedData.tradable !== undefined ? updatedData.tradable : existingGame.tradable;
     existingGame.description = updatedData.description || existingGame.description;
     existingGame.amount = updatedData.amount || existingGame.amount;
     existingGame.voucher_template_id = updatedData.voucher_template_id || existingGame.voucher_template_id;
     existingGame.start_time = updatedData.start_time || existingGame.start_time;
     existingGame.end_time = updatedData.end_time || existingGame.end_time;
     existingGame.poster = updatedData.poster || existingGame.poster;
 
     // Lưu lại những thay đổi
     await existingGame.save();
    return existingGame;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to update game');
  }
};

exports.deleteGame = async (id) => {
  try {
    const result = await Game.destroy({
      where: { id }
    });

    if (result === 0) {
      throw new Error(`Game with ID ${id} not found`);
    }

    return { message: 'Game deleted successfully' };
  } catch (error) {
    console.error(error);
    throw new Error('Failed to delete game');
  }
};

exports.getAllGames = async () => {
  try {
    const games = await Game.findAll();
    return games;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to get games');
  }
};

exports.getGameById = async (id) => {
  try {
    const game = await Game.findByPk(id);
    return game;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to get game');
  }
};
exports.searchGames = async (page, search, brandID) => {
  const whereClause = {
    name: {
      [Op.iLike]: `%${search}%`
    }
  };

  if (brandID) {
    whereClause.brand_id = brandID;
  }

  const limit = 8;
  const offset = (page - 1) * limit;

  const games = await Game.findAndCountAll({
    where: whereClause,
    limit: limit,
    offset: offset,
    order: [['id', 'DESC']]
  });

  return {
    totalItems: games.count,
    totalPages: Math.ceil(games.count / limit),
    currentPage: page,
    data: games.rows
  };
};


exports.getGamesByEventId = async (eventId) => {
  try {
    const games = await Game.findAll({
      where: { event_id: eventId },
    });
    return games;
  } catch (error) {
    throw new Error('Error fetching games: ' + error.message);
  }
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
exports.getHighlightedGames = async () => {
  return await Game.findAll({
    limit: 15,
    order: [['id', 'DESC']],
  });
};
exports.getGamesByBrandId = async (brandId) => {
  try {
    const games = await Game.findAll({
      where: { brand_id: brandId },
    });
    return games;
  } catch (error) {
    throw new Error('Error fetching games: ' + error.message);
  }
}
exports.addEventToGame = async (gameId, eventId, brandID) => {
  try {
    // Tìm game theo gameId
    const game = await Game.findByPk(gameId);

    if (!game) {
      return { error: 'Game not found', statusCode: 404 };
    }

    // Cập nhật eventId cho game
    game.event_id = eventId;
    game.brand_id = brandID;
    await game.save();

    return { message: 'Event added to game successfully', game, statusCode: 200 };
  } catch (error) {
    return { error: error.message, statusCode: 500 };
  }
};

exports.getGamesWithoutEventAndNotStarted = async (brandId) => {
  try {
    // Tìm các game có event_id là NULL và start_time lớn hơn thời gian hiện tại
    const upcomingGames = await Game.findAll({
      where: {
        brand_id: brandId,
        event_id: {
          [Op.is]: null
        },
        start_time: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!upcomingGames || upcomingGames.length === 0) {
      return { error: 'No upcoming games without event found', statusCode: 404 };
    }

    return { message: 'Upcoming games without event found', games: upcomingGames, statusCode: 200 };
  } catch (error) {
    return { error: error.message, statusCode: 500 };
  }
};
exports.getActiveGamesCount = async () => {
  try {
    const currentTime = new Date();

    // Đếm tổng số game đang diễn ra
    const activeGamesCount = await Game.count({
      where: {
        start_time: {
          [Op.lte]: currentTime
        },
        end_time: {
          [Op.gte]: currentTime
        }
      }
    });

    return activeGamesCount;
  } catch (error) {
    throw new Error('Error retrieving active games count: ' + error.message);
  }
};
exports.getGamesCountByDay = async (startDate, endDate) => {
  try {
    // Lấy danh sách các ngày trong khoảng thời gian
    const dateRange = generateDateRange(startDate, endDate);

    // Lấy số lượng game nhóm theo ngày
    const gamesCount = await Game.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('created_at')), 'created_date'], // Lấy ngày tạo
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'game_count'] // Đếm số lượng game
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
    const gamesMap = gamesCount.reduce((acc, game) => {
      acc[game.dataValues.created_date] = game.dataValues.game_count;
      return acc;
    }, {});

    // Tạo danh sách kết quả, bao gồm những ngày không có game
    const result = dateRange.map(date => {
      const formattedDate = date.toISOString().slice(0, 10); // Format YYYY-MM-DD
      return {
        created_date: formattedDate,
        game_count: gamesMap[formattedDate] || 0 // Nếu không có game, trả về 0
      };
    });

    return result;
  } catch (error) {
    throw new Error('Failed to retrieve game count by day: ' + error.message);
  }
};