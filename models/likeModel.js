const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Like must belong to some user.']
    },
    belongsTo: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
        required: [true, 'Like must belong to some post.']
    }
});

likeSchema.pre('post', function() {
    
});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;