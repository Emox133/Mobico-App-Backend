const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
        required: [true, 'Notification must belong to someone.']
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        type: String,
        required: [true, 'Notification needs to be created by someone.']
    },
    postId: {
        type: String,
        required: [true, 'Notification must belong to something.']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    },
    type: String
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification