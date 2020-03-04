const User = require('./../models/userModel');
const Like = require('./../models/likeModel');
const catchAsync = require('./../utils/catchAsync');

exports.getUserData = catchAsync(async(req, res, next) => {
    const user = await User.findById(req.user._id).select('-__v');
    const likes = await Like.find({owner: req.user._id})

    if(!likes) likes = [];

    res.status(200).json({
        message: 'success',
        data: {
            user,
            likes
        }
    })
});
