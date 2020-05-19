const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Comment must belong to some user.']
    },
    belongsTo: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
        required: [true, 'Comment must belong to some post.']
    },
    ownerImage: {
        type: String,
        default: 'https://res.cloudinary.com/de8nlvwpc/image/upload/v1583605946/wpjlsyqsodiokatqqlv4.png'
    },
    ownerName: {
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