const mongoose   = require('mongoose');
const User       = require('../models/user');
const Schedule   = require('../models/schedule')
const bcrypt     = require('bcrypt');
const jwt        = require('jsonwebtoken');
const Queue      = require('bull');

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

const handleCleaningSchedule = (req, res, isUpdate = false) => {
    const userid = req.userData.userid;
    const date = req.body.date;
    const time = req.body.time;
    const newDate = new Date(date);

    if (time.length === 0) {
        return res.status(400).json({
            message: "Time array should not be empty",
        });
    }

    if (time.length > 2) {
        return res.status(400).json({
            message: "You can set at max two frequencies for a day",
        });
    }

    for (let i = 0; i < time.length; i++) {
        const element = time[i];
        const isValid = /^([01]\d|2[0-3]):([0-5]\d)$/.test(element);

        if (!isValid) {
            return res.status(400).json({
                message: "Invalid time format. Please provide time(s) in HH:MM format.",
            });
        }
    }

    const query = { user: userid, 'schedules.date': newDate };
    const update = isUpdate
        ? { $set: { 'schedules.$.timings': time } }
        : {
              $addToSet: {
                  schedules: { date: newDate, timings: time },
              },
          };

    Schedule.findOneAndUpdate(query, update, { upsert: true, new: true })
        .exec()
        .then((result) => {
            if (isUpdate && result.modifiedCount === 0) {
                return res.status(200).json({
                    message: "Schedule not found",
                });
            } else {
                const successMessage = isUpdate
                    ? "Schedule updated successfully"
                    : "Schedule Added";
                return res.status(200).json({
                    message: successMessage,
                    schedule: result,
                });
            }
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({
                error: err,
            });
        });
};

module.exports.scheduleCleaning = (req, res) => {
    handleCleaningSchedule(req, res, false);
};

module.exports.updateCleaningSchedule = (req, res) => {
    handleCleaningSchedule(req, res, true);
};
