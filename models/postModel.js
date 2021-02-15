const mongoose = require('mongoose');

const postsSchema = new mongoose.Schema({
    owner: {
        type: String,
        required: [true, 'A post has to have an owner']
    },
    ownerId: {
        type: mongoose.Schema.ObjectId,
        select: false
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
    userImage: String,
    likeCount: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    }
});

// postsSchema.virtual('comments', {
//     foreignKey: 
// })

const Post = mongoose.model('Post', postsSchema);

module.exports = Post;