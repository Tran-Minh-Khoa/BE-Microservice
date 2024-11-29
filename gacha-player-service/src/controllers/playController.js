const playService = require('../services/playService');



exports.getUserItems = async (req, res) => {
  const { game_id } = req.params;
  const user_id = req.user.id;

  if (!game_id) {
    return res.status(400).json({ message: "game_id is required" });
  }

  try {
    const items = await playService.getUserItems(game_id, user_id);

    if (items.length === 0) {
      return res
        .status(404)
        .json({ message: "No items found for the given game_id and user_id" });
    }

    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// API khi người chơi sử dụng 1 lượt chơi
exports.usePlayAndAddItem = async (req, res) => {
    const { gameId,gameDataId } = req.body; // Lấy gameId và userId từ body request
    const userId = req.user.id;
    try {
        const result = await playService.usePlayAndAddItem(gameId,gameDataId, userId);

        // Trả về kết quả cho client
        res.status(200).json(result);
    } catch (error) {
        console.error("Error using play and adding item:", error.message);
        res.status(500).json({ message: error.message });
    }
};
exports.getOrCreatePlaytime = async (req, res) => {
    const {  gameId } = req.params;
    const userId = req.user.id;
    try {
      // Gọi service để lấy hoặc tạo lượt chơi
      const playtime = await playService.getOrCreatePlaytime(userId, gameId);
  
      // Trả về số lượt chơi còn lại
      res.status(200).json({
        message: "Playtime retrieved successfully!",
        play_duration: playtime.play_duration,
      });
    } catch (error) {
      console.error("Error in controller:", error.message);
      res.status(500).json({
        message: "Error retrieving playtime.",
        error: error.message,
      });
    }
  };

  exports.redeemPrize = async (req, res) => {
    const { gameId, itemSetId } = req.body; // Lấy gameId, itemSetId, voucherId từ request body
    const userId = req.user.id; // Lấy userId từ JWT đã giải mã (giả sử middleware đã giải mã và gán vào req.user)
  
    try {
      // Kiểm tra các điều kiện để đổi quà (VD: user có đủ điều kiện nhận quà)
      // Điều kiện có thể bao gồm số lượt chơi, trạng thái quà, vv.
  
      // Logic đổi quà và thêm vào inventory
     
      // Giả sử có hàm để xử lý logic đổi quà và trả về kết quả
      const result = await playService.redeemPrize(gameId, itemSetId, userId);
  
      // Trả về kết quả thành công
      res.status(200).json({
        message: 'Prize redeemed successfully!',
        data: result
      });
    } catch (error) {
      console.error("Error redeeming prize:", error.message);
      res.status(500).json({
        message: "Error redeeming prize.",
        error: error.message
      });
    }
  };
  