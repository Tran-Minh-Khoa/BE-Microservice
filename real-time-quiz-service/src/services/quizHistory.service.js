const QuizHistory = require('../models/quizHistory.model');

exports.addQuizHistory = async ({ gameID, userID, questionIndex, selectedAnswer }) => {
    try {
        // Check if the quiz history entry already exists
        const existingHistory = await QuizHistory.findOne({ gameID, userID, questionIndex, selectedAnswer });

        if (existingHistory) {
            throw new Error('Quiz history entry already exists');
        }

        const newHistory = new QuizHistory({
            gameID,
            userID,
            questionIndex,
            selectedAnswer,
            isCorrect: false
        });

        await newHistory.save();
        return newHistory;
    } catch (error) {
        throw new Error('Error adding quiz history: ' + error.message);
    }
};

exports.getQuizHistory = async ({ gameID, userID, questionIndex }) => {
    try {
        // Find the specific quiz history record based on gameID, userID, and questionIndex
        const quizHistory = await QuizHistory.findOne({
            gameID,
            userID,
            questionIndex
        });

        return quizHistory;
    } catch (error) {
        throw new Error('Error retrieving quiz history: ' + error.message);
    }
};

exports.validateAnswer = async ({ gameID, userID, questionIndex, correctAnswer }) => {
    try {
        // Find the quiz history entry based on the provided identifiers
        let quizHistory = await QuizHistory.findOne({ gameID, userID, questionIndex });

        if (!quizHistory) {
            // If no entry exists, create a new one with selectedAnswer as NULL and isCorrect as false
            quizHistory = new QuizHistory({
                gameID,
                userID,
                questionIndex,
                selectedAnswer: "_NONE", // Default to null if creating a new record
                isCorrect: false // Default to false if creating a new record
            });
        }

        quizHistory.isCorrect = (quizHistory.selectedAnswer === correctAnswer);

        // Save the updated or newly created history entry
        await quizHistory.save();

        return quizHistory;
    } catch (error) {
        throw new Error('Error validating answer: ' + error.message);
    }
};

exports.getTotalScore = async ({ gameID, userID }) => {
    try {
        // Count the number of quiz history entries where isCorrect is true
        const totalScore = await QuizHistory.countDocuments({
            gameID,
            userID,
            isCorrect: true
        });

        return totalScore;
    } catch (error) {
        throw new Error('Error retrieving total score: ' + error.message);
    }
};

exports.getAnswerRatio = async ({ gameID, questionIndex, answers }) => {
    try {
        // Create an array to hold the count of correct answers for each answer option
        const answerCounts = new Array(answers.length).fill(0);

        // Fetch all quiz history records for the given gameID and questionIndex
        const quizHistories = await QuizHistory.find({ gameID, questionIndex });

        // Count the number of correct answers for each answer option
        quizHistories.forEach(record => {
            if (answers.includes(record.selectedAnswer)) {
                const answerIndex = answers.indexOf(record.selectedAnswer);
                if (answerIndex !== -1) {
                    answerCounts[answerIndex]++;
                }
            }
        });

        return answerCounts;
    } catch (error) {
        throw new Error('Error retrieving answer ratio: ' + error.message);
    }
};