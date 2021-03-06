const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/AppError');
const {promisify} = require('util');
const Email = require('./../utils/nodemailer');
const crypto = require('crypto');
const signToken = require('./../utils/signToken')

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
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        notifications: [],
        userImage: req.body.userImage,
        bio: req.body.bio,
        location: req.body.location,
        website: req.body.website
    });

    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();

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
        return next(new AppError('Incorect email or password', 400))
    }

    // 3. Send token and res
    const token = signToken(user._id);

    res.status(200).json({
        message: 'success',
        token
    })
});

// * Forgot password route
exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1. Get the user coresponding to the inputed email
    const user = await User.findOne({email: req.body.email})

    if(!user) return next(new AppError('There is no user with this email adress.', 404));

    // 2. Generate a reset token
    const resetToken = user.createPasswordResetToken();

    await user.save({validateBeforeSave: false});

    // 3. Send an email to the user
    try{
        const resetURL = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            message: 'token sent to email!',
        })

    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpiresIn = undefined;
        await user.save({validateBeforeSave: false})

        return next(new AppError('There was an error sending the email. Please try again later.', 500))
    }
});

// * Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
    const encryptedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: encryptedToken,
        passwordResetTokenExpiresIn: {$gt: Date.now()}
    });

    if(!user) {
        return next(new AppError('Token is invalid or it is expired.', 400));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresIn = undefined;

    await user.save();

    const token = signToken(user._id);

    res.status(200).json({
        message: 'success',
        token
    })
});