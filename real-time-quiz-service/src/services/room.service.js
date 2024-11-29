const Room = require('../models/room.model'); // Import the Room model

exports.getAllRooms = async () => {
    try {
        const rooms = await Room.find(); // Find all rooms
        return rooms;
    } catch (error) {
        throw new Error('Error fetching rooms: ' + error.message);
    }
};

exports.getRoomByGameId = async (gameId) => {
    try {
        const room = await Room.findOne({ gameId: gameId });
        if (!room) {
            throw new Error('Room not found');
        }
        return room;
    } catch (error) {
        throw new Error('Error fetching room: ' + error.message);
    }
};

exports.addRoom = async (roomData) => {
    try {
        let existingRoom = await Room.findOne({ gameId: roomData.gameId });

        if (existingRoom) {
            // Update the existing room with the new data
            Object.assign(existingRoom, roomData);
            await existingRoom.save();
        } else {
            // Create a new room if no existing room was found
            const newRoom = new Room(roomData);
            await newRoom.save();
            existingRoom = newRoom;
        }

        return existingRoom;
    } catch (error) {
        throw new Error('Error adding or updating room: ' + error.message);
    }
};

exports.updateRoom = async (roomData) => {
    try {
        // Find the existing room with the specified gameId
        const existingRoom = await Room.findOne({ gameId: roomData.gameId });

        if (existingRoom) {
            // Update the existing room with the new data
            Object.assign(existingRoom, roomData);
            await existingRoom.save();
            return existingRoom;
        } else {
            throw new Error('Room with the specified gameId does not exist.');
        }
    } catch (error) {
        throw new Error('Error updating room: ' + error.message);
    }
};

