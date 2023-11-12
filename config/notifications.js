const Agenda = require('agenda')
const agenda = new Agenda({ 
    db: { address: process.env.MONGOOSE_CONNECTION_STRING } 
});

agenda.on("ready", async () => {
    console.log("Connected to Agenda");

    agenda.define('CleaningJob', async (job) => {
        const userId = job.attrs.data.userid;
        console.log("scheduled cleaning");
    });

    await agenda.start();
})