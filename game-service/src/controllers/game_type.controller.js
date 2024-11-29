const gameTypeService = require('../services/game_type.service');

exports.createGameType = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        const newGameType = await gameTypeService.createGameType({ name });
        return res.status(201).json(newGameType);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.deleteGameType = async (req, res) => {
    try {
        const response = await gameTypeService.deleteGameType(req.params.id);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateGameType = async (req, res) => {
    try {
        const updatedGameType = await gameTypeService.updateGameType(req.params.id, req.body);
        res.status(200).json(updatedGameType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllGameTypes = async (req, res) => {
    try {
        const gameTypes = await gameTypeService.getAllGameTypes();
        res.status(200).json(gameTypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getGameTypeById = async (req, res) => {
    try {
        const gameType = await gameTypeService.getGameTypeById(req.params.id);
        res.status(200).json(gameType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};