const mongoose = require('mongoose');

const quizHistorySchema = new mongoose.Schema({
    gameID: {
        type: String,
        required: true,
    },
    userID: {
        type: String,
        required: true
    },
    questionIndex: {
        type: Number,
        required: true
    },
    selectedAnswer: {
        type: String,
    },
    isCorrect: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const QuizHistory = mongoose.model('QuizHistory', quizHistorySchema);

module.exports = QuizHistory

