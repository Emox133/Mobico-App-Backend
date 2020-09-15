const mongoose = require('mongoose')

const myFriends = new mongoose.Schema({
    profile: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    friends: {
        type: Array
    }
})

const MyFriends = mongoose.model('MyFriends', myFriends)

module.exports = MyFriends