const mongoose = require('mongoose')

const friendsSchema = new mongoose.Schema({
    requestSender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Request needs to have a sender.']
    },
    requestReceiver: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Request needs to have a receiver.']
    },
    accepted: {
        type: Boolean,
        default: false
    }
    // requestSent: {
    //     type: Boolean,
    //     default: false
    // }
})

friendsSchema.index({requestSender: 1, requestReceiver: 1}, {unique: true})

const Friends = mongoose.model('Friends', friendsSchema)

module.exports = Friends

//923836182633810 ME = REQUEST SENDER
//838326631627283 PERSON I'D LIKE TO ADD = REQUEST RECEIVER

// (ME + PERSON I'D LIKE TO ADD) = UNIQUE

// SO ME SENDING FRIEND REQUEST TO SOMEONE = CAN BE ACCEPTED OR REJECTED
// IF REQUEST IS ACCEPTED THEN WE SET ACTIVE TO TRUE!!!!

// ROUTE FOR THIS LOGIC ------
// GET ALL USERS WHERE I AM THE SENDER AND THE REQUEST IS ACCEPTED !!!




