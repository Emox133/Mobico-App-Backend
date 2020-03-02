const mongoose = require('mongoose');

const postsSchema = new mongoose.Schema({
    owner: {
        type: String,
        required: [true, 'A post has to have an owner']
    },
    text: {
        type: String,
        minlength: [2, 'Post needs to be at least 2 characters long'],
        required: [true, 'Please provide something in your post!']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likeCount: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    }
});

const Post = mongoose.model('Post', postsSchema);

module.exports = Post;