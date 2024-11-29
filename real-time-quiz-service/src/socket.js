const axios = require('axios')
require("dotenv").config();

const quizHistoryService = require("./services/quizHistory.service")
const roomService = require("./services/room.service")

const EVENT_CONNECTION = "connection";
const EVENT_DISCONNECT = "disconnect";
const EVENT_JOIN_ROOM = "joinRoom";
const EVENT_LEAVE_ROOM = "leaveRoom";
const EVENT_DEBUG = "debug"; //Debug purposes
const EVENT_ERROR = "error"; //Debug purposes

//Quiz
const EVENT_SEND_ANSWER = "sendAnswer";
const EVENT_QUIZ_AUDIO = "audio";
const EVENT_SEND_QUESTION = "sendQuestion";
const EVENT_RESULT = "answerResult";
const EVENT_END_QUIZ = "endQuiz";

//Chat
const EVENT_CHAT = "chat";

var io;
var redisPublisher;
function setupSocketConnection(_io, _redisPublisher) {
    io = _io;
    redisPublisher = _redisPublisher;

    io.engine.use((req, res, next) => {
        const isHandshake = req._query.EIO && req._query.transport === "polling";
        if (isHandshake) {
            const userString = req.headers["x-user-id"];
            if (userString) {
                req.user = JSON.parse(userString);
                //console.log(req.user);
                next();
            }
        } else {
            next();
        }
    });

    io.on(EVENT_CONNECTION, (socket) => {
        const user = socket.request.user;
        console.log(`User connected to socket`);
        console.log("Number of connected sockets:", io.engine.clientsCount);

        if (!user) {
            socket.emit(EVENT_ERROR, { message: "User not authenticated" });
            socket.disconnect(true);
            return;
        }

        socket.emit(EVENT_CONNECTION, { name: user.name });

        socket.on(EVENT_JOIN_ROOM, async (gameId) => {
            try {
                socket.join(gameId);
                const roomData = await roomService.getRoomByGameId(gameId)
                const currentScore = await quizHistoryService.getTotalScore({
                    gameID: gameId,
                    userID: socket.request.id,
                })

                const date = Date.parse(roomData.startTime)
                socket.emit(EVENT_JOIN_ROOM, JSON.stringify(
                    {
                        roomState: roomData.roomState,
                        startTime: (date / 1000).toString(),
                        score: currentScore
                    }));

                redisPublisher.publish("participation_channel", JSON.stringify({ game_id: gameId, user_id: socket.request.id }));

                console.log(`User joined quiz room: ${gameId}`);
            }
            catch (err) {
                console.log(err);
            }

        });

        socket.on(EVENT_SEND_ANSWER, async (gameId, answer) => {
            try {
                const roomData = await roomService.getRoomByGameId(gameId)
                await quizHistoryService.addQuizHistory({
                    gameID: gameId,
                    userID: socket.request.user.id,
                    questionIndex: roomData.currentQuestionIndex,
                    selectedAnswer: answer
                })
            }
            catch (err) {
                console.log(`Error sending answer: ${err}`);
            }
        });

        socket.on(EVENT_LEAVE_ROOM, (room) => {
            socket.emit(EVENT_LEAVE_ROOM, {
                user: "System",
                message: `${socket.request.user.username} has left the ${room}`,
            });
            socket.leave(room);
            console.log(`User ${socket.request.user.username} left room ${room}`);
        });
        socket.on(EVENT_DISCONNECT, () => {
            //console.log("User disconnected");
        });

        socket.on(EVENT_CHAT, (room, message) => {
            try {
                io.to(room).emit(EVENT_CHAT, user.username, message);
                //console.log(`${user.email}: ${message}`)
                //callback({ status: "ok", message: "Message sent successfully" });
            } catch (error) {
                console.error("Error sending message:", error);
                //callback({ status: "error", message: "Failed to send the message", error });
            }
        });
    });
}

const startQuiz = async (room) => {
    if (room) {
        try {
            const quiz = await fetchQuizData(room.quizId)
            room.currentQuestionIndex = 0;
            room.roomState = "Playing"
            roomService.updateRoom(room);

            sendQuizIntroductionAudio(room, quiz);
        } catch (err) {
            console.log(`Start quiz failed ${room.quizId}`)
        }
    }
};

const sendQuizIntroductionAudio = async (room, quiz) => {
    io.to(room.gameId).emit(EVENT_QUIZ_AUDIO, quiz.scriptIntro.audioData);
    console.log(`Intro: ${quiz.scriptIntro.text}`);

    setTimeout(() => {
        sendQuestionToRoom(room, quiz);
    }, quiz.scriptIntro.duration * 1000 + 2);
};

const sendQuestionToRoom = async (room, quiz) => {
    if (quiz && room) {
        const question = quiz.quizzes[room.currentQuestionIndex];
        console.log(`Question: ${question.question}`)
        io.to(room.gameId).emit(EVENT_SEND_QUESTION,
            JSON.stringify({
                question: question.question,
                options: question.options,
                timeLimit: 15,
            })
        );

        await delay(1000)

        io.to(room.gameId).emit(EVENT_QUIZ_AUDIO, question.scriptQuestion.audioData);
        const duration = Math.max(question.scriptQuestion.duration, 15) + 3

        setTimeout(() => {
            sendAnswer(room, quiz);
        }, duration * 1000);
    }
};

const sendAnswer = async (room, quiz) => {
    try {
        const questionIndex = room.currentQuestionIndex;
        const question = quiz.quizzes[questionIndex];
        console.log(`Answer: ${question.correctAnswer}`)

        await calculateResult(room, quiz)
        const answerRatio = await quizHistoryService.getAnswerRatio({
            gameID: room.gameId,
            questionIndex: questionIndex,
            answers: question.options
        })

        console.log(answerRatio)


        var roster = await io.in(room.gameId).fetchSockets();

        roster.forEach(async function (client) {
            try {
                const quizHistory = await quizHistoryService.getQuizHistory({
                    gameID: room.gameId,
                    userID: client.request.user.id,
                    questionIndex: questionIndex
                });

                io.to(room.gameId).emit(
                    EVENT_SEND_ANSWER,
                    JSON.stringify({
                        question: question.text,
                        options: question.options,
                        timeLimit: 15,
                    }),
                    JSON.stringify({
                        correctAnswer: question.correctAnswer,
                        selectedAnswer: quizHistory ? quizHistory.selectedAnswer : "_NONE",
                        answerCounts: answerRatio,
                    }),
                );
            }
            catch (error) {
                console.log(error);
            }
        });

        await delay(1000)
        io.to(room.gameId).emit(EVENT_QUIZ_AUDIO, question.scriptAnswer.audioData);
        const duration = Math.max(question.scriptAnswer.duration, 10) + 3
        setTimeout(async () => {
            room.currentQuestionIndex += 1
            if (room.currentQuestionIndex < quiz.quizzes.length) {
                sendQuestionToRoom(room, quiz);
            } else {
                await concludeQuiz(room, quiz);
            }

            await roomService.updateRoom(room);
        }, duration * 1000);
    }
    catch (err) {
        console.log(err)
        console.log("Send answer failed")
    }
};

async function calculateResult(room, quiz) {
    const questionIndex = room.currentQuestionIndex;
    const question = quiz.quizzes[questionIndex];

    var roster = await io.in(room.gameId).fetchSockets();

    roster.forEach(async function (client) {
        await quizHistoryService.validateAnswer({
            gameID: room.gameId,
            userID: client.request.user.id,
            questionIndex: questionIndex,
            correctAnswer: question.correctAnswer
        })
    });
}


async function concludeQuiz(room, quiz) {
    var roster = await io.in(room.gameId).fetchSockets();
    const victoryUsers = []
    roster.forEach(async function (client) {
        const totalScore = await quizHistoryService.getTotalScore({
            gameID: room.gameId,
            userID: client.request.user.id,
        })
        if (totalScore === quiz.quizzes.length) {
            victoryUsers.push({
                id: client.request.user.id,
                email: client.request.user.username
            })
            console.log(`Game ${room.gameId}: ${client.request.user.id} won!`);
        }
    });

    const gameResult = {
        users: victoryUsers,
        gameId: room.gameId,
    }

    const voucherTemplate = await fetchVoucherTemplateData(room.voucherTemplateId)

    io.to(room.gameId).emit(EVENT_QUIZ_AUDIO, quiz.scriptOutro.audioData);
    io.to(room.gameId).emit(EVENT_END_QUIZ, JSON.stringify(victoryUsers), JSON.stringify(voucherTemplate));

    room.roomState = "Concluded"
    await roomService.updateRoom(room);
    redisPublisher.publish("real-time-quiz", JSON.stringify(gameResult));
    console.log("Quiz concluded")
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}


async function fetchQuizData(quizId) {

    try {
        const response = await axios.get(`http://api-gateway:8000/quiz/${quizId}`, {
            headers: {
                Authorization: `bearer ${process.env.AUTH_TOKEN}`
            }
        });
        return response.data;
    } catch (error) {
        throw new Error('Error fetching quiz data');
    }
}

async function fetchVoucherTemplateData(voucher_template_id) {

    try {
        const response = await axios.get(`http://api-gateway:8000/voucher/voucherTemplate/getByID?id=${voucher_template_id}`, {
            headers: {
                Authorization: `bearer ${process.env.AUTH_TOKEN}`
            }
        });
        return response.data;
    } catch (error) {
        throw new Error('Error fetching voucher data');
    }
}

module.exports = { setupSocketConnection, startQuiz };