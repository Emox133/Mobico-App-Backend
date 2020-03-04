const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please tell us your name.'],
        validate: [validator.isAlpha, 'Name can only contain letters.']
    },
    lastName: {
        type: String,
        required: [true, 'Please tell us your last name.'],
        validate: [validator.isAlpha, 'Last name can only contain letters.']
    },
    username: {
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
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: 'Passwords are not the same.'
        }
    },
    notifications: [
        {
            type: mongoose.Schema.ObjectId,
        }
    ],
    userImage: String,
    bio: String,
    location: {
        type: String,
        required: [true, 'Please provide your location.']
    },
    website: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpiresIn: Date
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

userSchema.pre('save', function(next) {
    if(!this.isModified || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

//? Compare Passwords
userSchema.methods.comparePasswords = async function(upwd, candidatePassword) {
    return await bcrypt.compare(upwd, candidatePassword)
};

//? Changed Password
userSchema.methods.changedPassword = function(jwtTimestamp) {
    if(this.passwordChangedAt) {
        const newTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        // return true
        return jwtTimestamp < newTimestamp
    }

    // Default
    return false
};

//? Create password reset token
userSchema.methods.createPasswordResetToken = function() {
    const plainToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(plainToken).digest('hex');
    this.passwordResetTokenExpiresIn = Date.now() + 10 * 60 * 1000;

    return plainToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User