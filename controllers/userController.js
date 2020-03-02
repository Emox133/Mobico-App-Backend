const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

// TODO: Signup
// TODO: Login
// TODO: Protection 

exports.signup = catchAsync(async(req, res, next) => {
    const newUser = {
        name: req.body.name,
        lastName: req.body.lastName,
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        notifications: [],
        userImage: req.body.userImage,
        bio: req.body.bio,
        location: req.body.location,
        website: req.body.website
    };

    await User.create(newUser)

    res.status(201).json({
        message: 'success',
        data: {
            newUser
        }
    })
});