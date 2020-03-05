const User = require('./../models/userModel');
const Like = require('./../models/likeModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const signToken = require('./../utils/signToken');

 // 1. Choose which fields are allowed to be updated
 const filteredBody = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj
};

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

// * Deactivate/Delete profile
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndDelete(req.user._id)

    res.status(204).json({
        message: 'success',
        data: null
    })
});

// * Update profile
exports.updateProfile = catchAsync(async(req, res, next) => {
    if(req.body.password || req.body.confirmPassword) {
        return next(new AppError('This route is not for password changes.\n If you want to change your password, please use /updateMyPassword route'), 403);
    } 

    const allowed = filteredBody(req.body, 'firstName', 'lastName', 'email', 'bio', 'location', 'username', 'website');

    const updatedUser = await User.findByIdAndUpdate(req.user._id, allowed, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        message: 'success',
        data: {
            updatedUser
        }
    })
});