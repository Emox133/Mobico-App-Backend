const User = require('./../models/userModel');
const Like = require('./../models/likeModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const signToken = require('./../utils/signToken');

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

// * Update password
exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('+password')

    if(!await user.comparePasswords(req.body.currentPassword, user.password)) {
        return next(new AppError('Your current password is incorect.', 401))
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save()

    const token = signToken(user._id);

    res.status(200).json({
        message: 'success',
        token
    })
});

