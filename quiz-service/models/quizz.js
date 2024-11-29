const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StriptSchema = new Schema({
    text: {
        type: String,
        required: true,
    },
    audioData: {
        type: String,
    },
    duration: {
        type: Number,
        default: 0
    }
});

const QuizSchema = new Schema({
    question:
    {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer:
    {
        type: String,
        require: true
    },
    scriptPreQuestion: {
        type: StriptSchema,
        required: true,
    },
    scriptQuestion: {
        type: StriptSchema,
        required: true,
    },
    scriptAnswer: {
        type: StriptSchema,
        required: true,
    },
});

const QuizListSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    scriptIntro: {
        type: StriptSchema,
        required: true,
    },
    scriptOutro: {
        type: StriptSchema,
        required: true,
    },
    quizzes: [QuizSchema], // Danh sách các quiz
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Tạo model cho QuizList
const QuizList = mongoose.model("QuizList", QuizListSchema);

module.exports = QuizList;