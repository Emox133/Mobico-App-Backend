const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/AppError');

// TODO: Signup
// TODO: Login
// TODO: Protection 

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION
    })
};

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

    const token = signToken(newUser._id);

    res.status(201).json({
        message: 'success',
        token
    })
});

exports.login = catchAsync(async(req, res, next) => {
    // 1. Get the email and password 
    const {email, password} = req.body;

    if(!email || !password) {
        return next(new AppError('Please provide email and password.', 400));
    }

    // 2. Compare the passwords
    const user = await User.findOne({email}).select('+password');

    if(!user || !await user.comparePasswords(password, user.password)) {
        return next(new AppError('Incorect email or password'))
    }

    // 3. Send token and res
    const token = signToken(user._id);

    res.status(200).json({
        message: 'success',
        token
    })
});



