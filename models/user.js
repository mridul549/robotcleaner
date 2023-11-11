const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    },
    password: {
        type: String,
        required: true
    },
    verification: {
        type: Boolean,
        default: false
    },
    schedules: [
        {
            date: {
                type: Date,
            },
            frequency: {
                type: Number,
                enum: [0, 1, 2], 
                default: 0,
            },
            timings: [
                {
                    time: {
                        type: String, 
                    }
                }
            ]
        }
    ]
}, {
    timestamps: true
})

module.exports = mongoose.model('User', userSchema);