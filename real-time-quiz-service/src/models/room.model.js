const mongoose = require('mongoose');

// 2. room Schema and Model
const roomSchema = new mongoose.Schema({
    gameId: {
        type: Number,
        required: true
    },
    quizId: {
        type: String,
        required: true
    },
    voucherTemplateId: {
        type: String,
        required: true
    },
    roomState: {
        type: String,
        required: true,
        default: "Waiting" //Waiting, Playing, Concluded
    },
    currentQuestionIndex: {
        type: Number,
        default: 0
    },
    startTime: {
        type: Date,
    }
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);

module.exports = Room
