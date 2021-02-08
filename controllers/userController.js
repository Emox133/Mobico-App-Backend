const User = require('./../models/userModel');
const Like = require('./../models/likeModel');
const Notification = require('./../models/notificationModel');
const Post = require('./../models/postModel');
const Comment = require('./../models/commentModel')
const Friends = require('./../models/friendsModel')
// const MyFriends = require('./../models/myFriendsModel')
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const signToken = require('./../utils/signToken');
const {uploadProfileImage} = require('./../utils/multer-alt');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose')

// Choose which fields are allowed to be updated
 const filteredBody = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find().select('-__v -passwordChangedAt')

    res.status(200).json({
        message: 'success',
        results: users.length,
        users
    })
})

exports.getUserData = catchAsync(async(req, res, next) => {
    const user = await User.findById(req.user._id).select('-__v');
    const likes = await Like.find({owner: req.user._id})
    const notifications = await Notification.find({recipient: req.user._id})
    const friendRequests = await Friends.find({requestSender: req.user._id})
    // const myFriends = await Friends.find({requestSender: req.user._id, accepted: true})

    if(!likes) likes = [];
    if(!notifications) notifications = [];

    res.status(200).json({
        message: 'success',
        data: {
            user,
            likes,
            notifications,
            friendRequests
            // myFriends
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

    // const token = signToken(user._id);

    res.status(200).json({
        message: 'success'
        // token
    })
});

// * Deactivate/Delete profile
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndDelete(req.user._id)
    await Post.deleteMany({ownerId: req.user._id}).select('+ownerId')
    await Like.deleteMany({owner: req.user._id})
    await Comment.deleteMany({owner: req.user._id})
    await Notification.deleteMany({owner: req.user._id})
    await Friends.deleteMany({requestSender: req.user._id})

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

    if(Object.values(req.body).length === 0 && !req.files) {
        return next(new AppError('Please provide some data to update', 400))
    }

    const allowed = filteredBody(req.body, 'firstName', 'lastName', 'email', 'bio', 'location', 'username', 'website');

    if(req.files) {
         uploadProfileImage(req, cloudinary);
         
        // Cloud
        await cloudinary.uploader.upload(req.files.joinedTemp, (err, img) => {
            allowed.userImage = img.secure_url
        })
    }  

    const updatedUser = await User.findByIdAndUpdate(req.user._id, allowed, {
        new: true,
        runValidators: true
    })

    await Post.updateMany({ownerId: req.user._id}, {userImage: updatedUser.userImage}).select('+ownerId');

    res.status(200).json({
        message: 'success',
        data: {
            updatedUser
        }
    })
});

// * Get my notifications 
exports.visitedNotifications = catchAsync(async (req, res, next) => {
    await Notification.updateMany({recipientUser: req.user._id}, {read: true})

    res.status(200).json({
        message: 'success'
    })
});

// Visit profiles route
exports.visitProfiles = catchAsync(async (req, res, next) => {
    const userId = req.params.id
    const user = await User.findById(userId)

    res.status(200).json({
        message: 'success',
        user
    })
})

// * FRIEND REQUESTS
exports.sendFriendRequest = catchAsync(async (req, res, next) => {
    const requestToSend = {
        requestSender: req.user._id,
        requestReceiver: req.params.id
        // requestSent: true
    }

    const friendRequest = await Friends.create(requestToSend)

    res.status(201).json({
        message: 'success',
        friendRequest
    })
})

exports.getMyFriendRequests = catchAsync(async (req, res, next) => {
    const friendRequests = await Friends.find({requestReceiver: req.user._id, accepted: false})

    let ids = []

    friendRequests.map(request => {
        ids.push(request.requestSender)
    })

    const senders = await User.find().select('-__v').where('_id').in(ids).exec()

    res.status(200).json({
        message: 'success',
        friendRequests,
        senders
    })
})

exports.undoFriendRequest = catchAsync(async (req, res, next) => {
    // const deletedRequest = await Friends.findOneAndDelete({requestReceiver: req.params.id})
    const deletedRequest = await Friends.findOneAndDelete({
        $or: [{requestReceiver: req.params.id}, {requestSender: req.params.id}] 
    })
    
    res.status(204).json({
        message: 'success',
        deletedRequest
    })
})

exports.friendRequestsIaccepted = catchAsync(async (req, res, next) => {
    const acceptedRequests = await Friends.find({requestReceiver: req.user._id, accepted: true})    

    res.status(200).json({
        message: 'success',
        acceptedRequests
    })
})

exports.acceptedMyFriendRequests = catchAsync(async (req, res, next) => {
    const acceptedRequests = await Friends.find({accepted: true})
    let friendsIds = []

    friendsIds.push(req.user._id)

    acceptedRequests.map(r => {
        let strReqReceiver = String(r.requestReceiver)      
        let strReqSender = String(r.requestSender)      
        let myId = String(req.user._id)

        if(strReqSender === myId) {
            friendsIds.push(r.requestReceiver)
        } else if(strReqReceiver === myId) {
            friendsIds.push(r.requestSender)
        } 
    })

    const friendsPosts = await Post.find().select('+ownerId').where('ownerId').in(friendsIds).exec()

    res.status(200).json({
        message: 'success',
        // acceptedRequests,
        friendsPosts
    })
})

exports.acceptFriendRequest = catchAsync(async (req, res, next) => {
    let query = {
        requestSender: req.params.id,
        requestReceiver: req.user._id
    }

    const acceptedRequest = await Friends.findOneAndUpdate(query, {accepted: true}, {
        new: true,
        runValidators: true
    })

    await Notification.create({
        recipient: req.params.id,
        sender: req.user.username,
        postId: req.params.id,
        type: 'friend-request'
    })

    res.status(200).json({
        message: 'success',
        acceptedRequest
    })
})


