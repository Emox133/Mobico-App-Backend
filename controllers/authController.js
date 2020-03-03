const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/AppError');
const {promisify} = require('util');

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION
    })
};

exports.protectRoutes = catchAsync(async(req, res, next) => {
    // 1. Get the token
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
        return next(new AppError('Invalid token', 401));
    }

    // 2. Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    const currentUser = await User.findById(decoded.id);

    // 3. Check if user is not deleted in meantime
    if(!currentUser) {
        return next(new AppError('Owner of this token does no longer exist.', 401));
    }

    // 4. Check if user changed password in meantime
    if(currentUser.changedPassword(decoded.iat)) {
        return next(new AppError('Password was recently changed, please log in again'));
    }

    // Assing currently authenticated user to req.obj and send it further through "stack"
    req.user = currentUser

    next();
});

//* Signup
exports.signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create({
        firstName: req.body.firstName,
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
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        message: 'success',
        token
    })
});

//* Login
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



