const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Comment must belong to some user.']
    },
    post: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
        required: [true, 'Comment must belong to some post.']
    },
    userImage: {
        type: String,
        default: 'https://res.cloudinary.com/de8nlvwpc/image/upload/v1583605946/wpjlsyqsodiokatqqlv4.png'
    },
    nameOfUser: {
        type: String,
        default: 'Anonimus'
    },
    text: {
        type: String,
        required: [true, 'Please provide someting in your comment.']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;