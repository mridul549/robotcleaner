const mongoose   = require('mongoose');
const User       = require('../models/user');
const Schedule   = require('../models/schedule')
const bcrypt     = require('bcrypt');
const jwt        = require('jsonwebtoken');
const Queue      = require('bull');
const Agenda = require('agenda')
const agenda = new Agenda({ 
    db: { address: process.env.MONGOOSE_CONNECTION_STRING } 
});

// agenda.on("ready", async () => {
//     console.log("Connected to Agenda");

//     agenda.define('CleaningJob', async (job) => {
//         const userId = job.attrs.data.userId;
//         console.log("scheduled cleaning");
//     });

//     await agenda.start();
// })

const mailQueue = new Queue('mailQueue', {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME
    }
})

// Already signed up Unverified users directed to otp directly
module.exports.signup = (req,res) => {
    User.find({ email: req.body.email })
    .exec()
    .then(user => {
        if(user.length>=1) {
            const verification = user[0].verification

            if(!verification){
                return res.status(409).json({
                    message: "Email already exits, complete verification."
                })
            } 

            return res.status(409).json({
                message: "User already exits, try logging in."
            })

        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err){
                    return res.status(500).json({
                        error: err
                    })
                } else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId,
                        userName: req.body.userName,
                        email: req.body.email,
                        password: hash,
                    })
                    user
                    .save()
                    .then(async result => {
                        const key = req.body.email
                        await mailQueue.add({ key })
                        return res.status(201).json({
                            action: "User created and OTP Sent",
                            message: "Please check your mailbox for the OTP verification code."
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        })
                    })
                }
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}

module.exports.login = (req,res) => {
    User.find({ email: req.body.email })
    .exec()
    .then(user => {
        if(user.length<1){
            return res.status(401).json({
                message: "Please provide a valid email address and password"
            })
        }

        const verification = user[0].verification
        if(!verification) {
            return res.status(409).json({
                message: "Email is not verified, please complete verification"
            })
        }

        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if(err) {
                return res.status(401).json({
                    error: err
                })
            } 
            if(result) {
                const token = jwt.sign({
                    email: user[0].email,
                    userid: user[0]._id,
                    username: user[0].userName
                }, process.env.TOKEN_SECRET, {
                    expiresIn: "30 days"
                })
                return res.status(200).json({
                    message: "Authentication successful",
                    token: token
                })
            }
            return res.status(401).json({
                message: "Auth failed"
            })
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}

module.exports.scheduleCleaning = (req,res) => {
    const userid = req.userData.userid
    const date = req.body.date
    const time = req.body.time
    const newDate = new Date(date)

    Schedule.find({ user: userid, 'schedules.date': newDate })
    .exec()
    .then(async schedule => {

        if(schedule.length>0) {
            // schedule for a day already exists
            return res.status(200).json({
                message: "Schedule already exists"
            })
        } else {
            // schedule for a day doesn't exist
            let timeArray = []

            for (let i = 0; i < time.length; i++) {
                const element = time[i];

                const executionDate = new Date(`${date}T${element}`)
                const jobData = {
                    userid: userid
                }
                const job = await agenda.schedule(executionDate, 'CleaningJob', jobData);
                timeArray.push({
                    time: element,
                    cronid: job.attrs._id
                })
            }

            Schedule.findOneAndUpdate({ user: userid }, {
                $push: {
                    schedules: {
                        date: newDate,
                        timings: timeArray
                    }
                }
            }, { upsert: true })
            .exec()
            .then(async result => {
                return res.status(200).json({
                    message: "Schedule Added Successfully",
                })
            })
            .catch(err => {
                console.log(err);
                return res.status(500).json({
                    error: err
                })
            })
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}

module.exports.updateCleaningSchedule = (req,res) => {
    const userid = req.userData.userid
    const date = req.body.date
    const time = req.body.time
    const newDate = new Date(date)

    Schedule.updateOne(
        { 
            user: userid, 
            'schedules.date': newDate 
        },
        {
            $set: {
                'schedules.$.timings': time
            }
        },
    )
    .exec()
    .then(result => {
        if(result.modifiedCount===0) {
            return res.status(200).json({
                message: "Schedule not found"
            })
        }
        return res.status(200).json({
            message: "Schedule updated successfully"
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}

module.exports.deleteSchedule = (req,res) => {
    const userid = req.userData.userid
    const date = req.body.date
    const newDate = new Date(date)

    Schedule.updateOne({ user: userid }, {
        $pull: {
            schedules: {
                date: newDate
            }
        }
    })
    .exec()
    .then(result => {
        if(result.modifiedCount===0){
            return res.status(404).json({
                message: "Date not found in the schedule"
            })
        }
        return res.status(200).json({
            message: "Deleted Successfully"
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            error: err
        })
    })
}