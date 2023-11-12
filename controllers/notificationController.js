const fb = require('../config/firebase')
const Notification = require('../models/notification')
const { getMessaging } = require('firebase-admin/messaging')

module.exports.sendNotification = async (userid, date, time) => {
    Notification.find({ user: userid })
    .exec()
    .then(result => {
        if(result.lenght>0){
            const fcm_token = result[0].fcm_token

            const message = {
                notification: {
                    title: "Robot cleaning commencing...",
                    body: `Scheduled cleaning on ${date} at ${time} has started`
                },
                token: fcm_token
            }

            getMessaging()
            .send(message)
            .then(result => {
                console.log(`Message sent successfully to ${userid}`);
            })
            .catch(err => {
                console.log(err);
            })
        } 
    })
    .catch(err => {
        console.log("Notification not sent!");
    })
}
