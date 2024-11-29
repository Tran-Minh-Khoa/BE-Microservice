const socket = require("./socket")

const cron = require("node-cron");
const moment = require("moment");

const jobMap = new Map();

function scheduleStartRoom(room) {
    //const startTime = moment().add(30, 'seconds');
    const startTime = moment(room.startTime);
    const cronTime = `${startTime.seconds()} ${startTime.minutes()} ${startTime.hours()} ${startTime.date()} ${startTime.month() + 1
        }  *`;
    const now = Date.now()

    if (startTime.isAfter(now)) {
        if (jobMap.has(room._id)) {
            const existingJob = jobMap.get(room._id);
            existingJob.stop();
            console.log(`Stopped existing job for room ${room.id}`);
        }

        const job = cron.schedule(cronTime, () => {
            console.log(`Start room ${room._id}`)
            socket.startQuiz(room);
        });

        console.log(`Schedule for ${room._id} at ${startTime}`);
        jobMap.set(room._id, job);
    }
}


module.exports = { jobMap, scheduleStartRoom }