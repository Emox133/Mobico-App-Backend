const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.getUserData = catchAsync(async(req, res, next) => {
    const user = await User.findById(req.user._id).select('-__v');

    res.status(200).json({
        message: 'success',
        data: {
            user
        }
    })
});