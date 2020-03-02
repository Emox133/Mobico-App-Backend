const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name.'],
        validate: [validator.isAlpha, 'Name can only contain letters.']
    },
    lastName: {
        type: String,
        required: [true, 'Please tell us your last name.'],
        validate: [validator.isAlpha, 'Last name can only contain letters.']
    },
    userName: {
        type: String,
        unique: true,
        required: [true, 'Please choose a username.'],
        unique: true,
        validate: [validator.isAlphanumeric, 'Username can only contain letters and numbers.']
    },
    email: {
        type: String,
        unique: true,
        validate: [validator.isEmail, 'Please provide a valid email.']
    },
    password: {
        type: String,
        minlength: 5,
        maxlength: 12,
        required: [true, 'Please provide a password.'],
        select: false
    },
    confirmPassword: {
        type: String,
        // required: [true, 'Please confirm your password'],
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: 'Passwords are not the same.'
        }
    },
    notifications: Array,
    userImage: String,
    bio: String,
    location: {
        type: String,
        required: [true, 'Please provide your location.']
    },
    website: String
})

userSchema.pre('save', async function(next) {
    // 1. Check if the password is actually modified
    if(!this.isModified('password')) return next();
    
    // 2. Hash the password with the cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // 3. Remove confirm password before the doc is saved
    this.confirmPassword = undefined;
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User