const mongoose = require('mongoose');
const AppError = require('./../utils/AppError')

const likeSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Like must belong to some user.'],
        unique: true,
        sparse: true
    },
    belongsTo: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
        required: [true, 'Like must belong to some post.']
    }
});

likeSchema.pre('save', function (next) {
    Like.find({owner : this.owner, belongsTo: this.belongsTo}, function (err, docs) {
        if (!docs.length){
            next();
        }else{                
            next(new AppError('You already liked this post. 💥', 400));
        }
    });
}) ;

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;