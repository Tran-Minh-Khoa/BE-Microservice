const gameService = require('../services/game.service');


exports.createGame = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Bad Request' });
      return
    }

    const gameData = req.body;
    const file = req.file;
    let brandID = null
    if(req.user.role == "brand")
      {
        brandID = req.user.id
      }
    const newGame = await gameService.createGame(gameData, file,brandID);

    res.status(201).json(newGame);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateGame = async (req, res) => {
  try {
    const id = req.params.id;
    const gameData = req.body;
    const file = req.file;
   
    const newGame = await gameService.updateGame(id,gameData, file);
    res.status(201).json(newGame);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.deleteGame = async (req, res) => {
  try {
    const response = await gameService.deleteGame(req.params.id);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getAllGames = async (req, res) => {
  try {
    const games = await gameService.getAllGames();
    res.status(200).json(games);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getGameById = async (req, res) => {
  try {
    const game = await gameService.getGameById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.status(200).json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.searchGames = async (req, res) => {
  try {
    const { page = 1, search = '' } = req.query;

    let brandID = null
    if(req.user.role == "brand")
      {
        brandID = req.user.id
      }
    const games = await gameService.searchGames(page, search, brandID);

    return res.json({ games });
  } catch (error) {
    console.error('Failed to retrieve games:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getGamesByEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const games = await gameService.getGamesByEventId(eventId);

    if (!games.length) {
      return res.status(404).json({ message: 'No games found for this event' });
    }

    return res.status(200).json(games);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving games', error: error.message });
  }
};
exports.getHighlightedGames = async (req, res) => {
  try {
    const highlightedGames = await gameService.getHighlightedGames();
    res.json({ data: highlightedGames });
  } catch (error) {
    console.error('Failed to fetch highlighted games:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.getGamesByBrandId = async (req, res) => {
  try {
    const brandId = req.user.id;
    const games = await gameService.getGamesByBrandId(brandId);
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
exports.addEventToGame = async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const { eventId,brandId } = req.body;

    // Gọi service để xử lý thêm event cho game
    const result = await gameService.addEventToGame(gameId, eventId, brandId);

    if (result.error) {
      return res.status(result.statusCode).json({ message: result.error });
    }

    return res.status(result.statusCode).json({ message: result.message, game: result.game });
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error', error: error.message });
  }
};

exports.getGamesWithoutEventAndNotStarted = async (req, res) => {
  try {
    // Gọi service để lấy danh sách game chưa thuộc event nào và chưa bắt đầu
    let brandID = null
    if(req.user.role == "brand")
      {
        brandID = req.user.id
      }
    const result = await gameService.getGamesWithoutEventAndNotStarted(brandID);

    if (result.error) {
      return res.status(result.statusCode).json({ message: result.error });
    }

    return res.status(result.statusCode).json({ message: result.message, games: result.games });
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error', error: error.message });
  }
};
exports.getActiveGamesCount = async (req, res) => {
  try {
    // Gọi service để lấy tổng số lượng game đang diễn ra
    const activeGamesCount = await gameService.getActiveGamesCount();

    return res.status(200).json({
      message: 'Active games count retrieved successfully',
      activeGamesCount
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving active games count',
      error: error.message
    });
  }
};
exports.getGamesCountByDay = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    // Gọi service để lấy dữ liệu thống kê
    const gamesCountByDay = await gameService.getGamesCountByDay(startDate, endDate);

    return res.status(200).json({
      message: 'Game count by day retrieved successfully',
      gamesCountByDay
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving game count by day',
      error: error.message
    });
  }
};