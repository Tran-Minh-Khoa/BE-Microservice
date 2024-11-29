const db = require('../models/index.model.js');
const GameType = db.game_type;

exports.createGameType = async (gameTypeData) => {
    try {
        const newGameType = await GameType.create(gameTypeData);
        return newGameType;
    } catch (error) {
        throw error;
    }
};

exports.deleteGameType = async (id) => {
    try {
        const result = await GameType.destroy({
            where: { id }
        });

        if (result === 0) {
            throw new Error(`GameType with ID ${id} not found`);
        }

        return { message: 'GameType deleted successfully' };
    } catch (error) {
        throw error;
    }
};

exports.updateGameType = async (id, updatedData) => {
    try {
        const result = await GameType.update(updatedData, {
            where: { id }
        });

        if (result[0] === 0) {
            throw new Error(`GameType with ID ${id} not found or no changes were made`);
        }

        const updatedGameType = await GameType.findByPk(id);
        return updatedGameType;
    } catch (error) {
        throw error;
    }
};

exports.getAllGameTypes = async () => {
    try {
        const gameTypes = await GameType.findAll();
        return gameTypes;
    } catch (error) {
        throw error;
    }
};

exports.getGameTypeById = async (id) => {
    try {
        const gameType = await GameType.findByPk(id);
        if (!gameType) {
            throw new Error(`GameType with ID ${id} not found`);
        }
        return gameType;
    } catch (error) {
        throw error;
    }
};