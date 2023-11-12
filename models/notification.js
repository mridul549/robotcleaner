const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fcm_token: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Notification', notificationSchema);