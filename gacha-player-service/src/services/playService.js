const db = require('../models/index.model');
const Playtime = db.playTime;
const Inventory = db.inventory;
const axios = require('axios');
const { Op, Sequelize } = require('sequelize');

const Redis = require("ioredis");
const redis = new Redis({
  port: 6379,
  host: 'redis',
});
// Hàm để random một item từ danh sách item
const getRandomItem = (items) => {
  const totalRatio = items.reduce((acc, item) => acc + item.ratio, 0);
  let random = Math.random() * totalRatio;

  for (let item of items) {
    if (random < item.ratio) {
      return item;
    }
    random -= item.ratio;
  }
  return null;
};

exports.getUserItems = async (game_id, user_id) => {
  try {
    const items = await Inventory.findAll({
      where: {
        game_id: game_id,
        user_id: user_id,
      },
    });

    return items;
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error; // Re-throw the error for the calling function to handle
  }
}

exports.usePlayAndAddItem = async (gameId, gameDataId, userId) => {
  try {
    // Kiểm tra và trừ lượt chơi
    const playtime = await Playtime.findOne({ where: { game_id: gameId, user_id: userId } });
    if (!playtime || playtime.play_duration <= 0) {
      throw new Error("No playtime left for this game.");
    }

    // Trừ đi 1 play_duration
    playtime.play_duration -= 1;
    await playtime.save();
    console.log(`Remaining playtime: ${playtime.play_duration}}`);

    // Lấy danh sách items dựa trên gameId
    const response = await axios.get(`http://api-gateway:8000/gacha/itemsByGame/${gameDataId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.authToken}` // Thêm trường Authorization
      }
    });
    const items = response.data.items;

    // Random ra một item
    const randomItem = getRandomItem(items);
    console.log(`Random item: ${randomItem.name}`);
    // Thêm item vào Inventory
    const newItem = await Inventory.create({
      game_id: gameId,
      user_id: userId,
      item: randomItem._id
    });

    return {
      message: "Item added to inventory!",
      item: randomItem,
      remainingPlayTime: playtime.play_duration
    };
  }
  catch (error) {
    throw new Error(`Error using play and adding item: ${error.message}`);
  }
};
exports.getOrCreatePlaytime = async (userId, gameId) => {
  try {
    // Kiểm tra xem lượt chơi của user và game này có tồn tại không
    let playtime = await Playtime.findOne({
      where: {
        [Op.and]: [{ user_id: userId }, { game_id: gameId }]
      }
    });

    // Nếu không tìm thấy, tạo mới với play_duration mặc định là 10
    if (!playtime) {
      playtime = await Playtime.create({
        user_id: userId,
        game_id: gameId,
        play_duration: 10, // Mặc định 10 lượt chơi
      });
      redis.publish("participation_channel", JSON.stringify({ game_id: gameId, user_id: userId }));

    }

    // Trả về đối tượng playtime
    return playtime;
  } catch (error) {
    throw new Error(`Error retrieving or creating playtime: ${error.message}`);
  }
};

exports.redeemPrize = async (gameId, itemSetId, userId) => {
  try {
    // Lấy tất cả item của user trong kho đồ (inventory) cho game này
    const userInventory = await Inventory.findAll({
      where: {
        game_id: gameId,
        user_id: userId
      }
    });
    if (!userInventory || userInventory.length === 0) {
      throw new Error("User has no items in this game.");
    }
    if (!userInventory || userInventory.length === 0) {
      throw new Error("User has no items in this game.");
    }

    // Lấy thông tin ItemSet theo itemSetId
    const itemSetResponse = await axios.get(`http://api-gateway:8000/gacha/itemSet/${itemSetId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.authToken}` // Thêm trường Authorization
      }
    });
    const itemSet = itemSetResponse.data;

    if (!itemSet) {
      throw new Error("ItemSet not found.");
    }
    // Lấy danh sách các item ID trong ItemSet
    const itemSetItems = itemSet.items;
    // Tạo một đối tượng để lưu số lượng các item cần thiết từ ItemSet
    const itemSetItemCount = itemSetItems.reduce((acc, itemId) => {
      acc[itemId] = (acc[itemId] || 0) + 1;
      return acc;
    }, {});

    // Tạo một đối tượng để lưu số lượng các item hiện có của user
    const userItemCount = userInventory.reduce((acc, item) => {
      acc[item.item] = (acc[item.item] || 0) + 1;
      return acc;
    }, {});
    console.log(itemSetItemCount)
    console.log(userItemCount)
    // Kiểm tra nếu user có đủ các item trong ItemSet
    for (const [itemId, count] of Object.entries(itemSetItemCount)) {
      if (!userItemCount[itemId] || userItemCount[itemId] < count) {
        throw new Error(`User does not have enough of item ${itemId} required for this ItemSet.`);
      }
    }
    // Lấy chi tiết game dựa trên gameId
    const gameResponse = await axios.get(`http://api-gateway:8000/game/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.authToken}` // Thêm trường Authorization
      }
    });
    const gameDetails = gameResponse.data;
    console.log(gameDetails)
    // Tạo voucher
    const voucherData = {
      qr: 'Generated QR Code Here', // Cần sinh QR Code nếu cần
      status: 'active',
      voucher_template_id: gameDetails.voucher_template_id, // Lấy từ game details
      brand_id: gameDetails.brand_id ? gameDetails.brand_id : 0,
      event_id: gameDetails.event_id ? gameDetails.event_id : 0,
      game_id: gameId,
      user_id: userId
    };

    const createVoucherResponse = await axios.post('http://api-gateway:8000/voucher/voucher/add', voucherData, {
      headers: {
        'Authorization': `Bearer ${process.env.authToken}`, // Thêm trường Authorization
        'Content-Type': 'application/json'
      }
    });

    const newVoucher = createVoucherResponse.data;
    // Xóa các item đã đổi từ kho đồ của user
    for (const [itemId, count] of Object.entries(itemSetItemCount)) {
      await Inventory.destroy({
        where: {
          game_id: gameId,
          user_id: userId,
          item: itemId
        },
        limit: count
      });
    }


  }
  catch (error) {
    throw new Error(`Error redeeming prize: ${error.message}`);
  }
}