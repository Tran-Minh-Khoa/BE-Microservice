
const gameStateService = require("./services/quizHistory.service")
const roomService = require("./services/room.service")
const jobMap = require("./jobmap")

function setupRedisConnection(redis) {
    redis.subscribe("room_schedule", (err, count) => {
        if (err) {
            console.error("Failed to subscribe: %s", err.message);
        } else {
            console.log(
                `Subscribed successfully! This client is currently subscribed to ${count} channels.`
            );
        }
    });

    redis.on("message", (channel, message) => {
        if (channel === "room_schedule") {
            const room = JSON.parse(message);
            console.log(room);
            scheduleQuiz(room);
        }
    });
}


async function scheduleQuiz(room) {
    try {
        room = await roomService.addRoom(room);
        jobMap.scheduleStartRoom(room);

    } catch (err) {
        console.log(err)
        console.log(`Failed to create room`);
    }


}


module.exports = { setupRedisConnection };