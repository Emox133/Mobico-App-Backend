const Post = require('./../models/postModel');
const Like = require('./../models/likeModel');
const User = require('./../models/userModel');
const Comment = require('./../models/commentModel');
const Notification = require('./../models/notificationModel');
const AppError = require('./../utils/AppError');
const mongoose = require('mongoose');
const catchAsync = require('./../utils/catchAsync');

//* Get all posts
exports.getAllPosts = catchAsync(async (req, res) => {
    const posts = await Post.find().select('-__v +ownerId')

    res.status(200).json({
        results: posts.length,
        message: 'success',
        data: {
            posts
        }
    })
});

// * Get one post
exports.getOnePost = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id).select('-__v +ownerId')
    const comments = await Comment.find({belongsTo: req.params.id})
    if(!post) next(new AppError('There is no post with this ID.', 404));
    if(!comments) comments = []; 

    res.status(200).json({
        message: 'success',
        data: {
            post,
            comments
        }
    })
});

// * Create a post
exports.createPost = catchAsync(async(req, res, next) => {
    let person = [req.user.firstName, req.user.lastName];
    person = person.toString();
    const owner = person.split(',').join(' '); 

    const newPost = await Post.create({
        owner,
        ownerId: req.user._id,
        userImage: req.user.userImage,
        text: req.body.text
    })

    res.status(201).json({
        message: 'success',
        data: {
            post: newPost
        }
    })
});

// * Delete Post
exports.deletePost = catchAsync(async(req, res, next) => {
    const post = await Post.findOneAndDelete({ownerId: req.user._id, _id: req.params.id})
    await Like.deleteMany({belongsTo: req.params.id})
    await Comment.deleteMany({belongsTo: req.params.id})
    await Notification.deleteMany({recipient: req.user._id})

    if(!post) return next(new AppError('You do not have permission to perform this kind of operation.', 403))

    res.status(204).json({
        message: 'success',
        data: null
    })
});

// * Like a post
exports.likePost = catchAsync(async(req, res, next) => {
    // 1. Get the currently loged in user and the post id
    const likeObj = {
        owner: req.user._id,
        ownerName: `${req.user.firstName + ' ' + req.user.lastName}`,
        belongsTo: req.params.id
    };
    
    // 2. Check if post and user still exist 
    if(!likeObj.owner) {
        return next(new AppError('User does no longer exist.', 404))
    } else if (!likeObj.belongsTo) {
        return next(new AppError('Post does no longer exist.', 404))
    }

    // 3. Create a like and send the response
    const like = await Like.create(likeObj)
    
    // 4. Update the like count in the particular post 
    const post = await Post.findOneAndUpdate({_id: req.params.id}, {$inc: {likeCount: 1}}, {
        new: true,
        runValidators: true
    }).select('+ownerId')

    //! HAD TO DO THE OPPOSITE
    if(post.owner !== likeObj.ownerName) {
        await Notification.create({
            recipient: post.ownerId,
            sender: likeObj.ownerName,
            postId: post._id,
            type: 'like'
        })
    }

    res.status(201).json({
        message: 'success',
        data: {
            like
        }
    })
});

exports.likedBy = catchAsync(async (req, res, next) => {
    // 1. Find all likes related to the particular post via id
    const likes = await Like.find({belongsTo: req.params.id}).select('+ownerName')
    if(!likes) return next(new AppError('There are no likes for this post.', 404));

    // 2. Find all users that are the same as the founded Likes owners
    let ids = [];
    likes.map(like => {
        ids.push(like.owner)
    })

    const users = await User.find().where('_id').in(ids).exec();

    // 3. Send the results back to client store and display them...
    res.status(200).json({
        mesage: 'success',
        data: {
            likes,
            users
        }
    })
});

// * Dislike a post
exports.dislikePost = catchAsync(async (req, res, next) => {
        // 1. Get the currently loged in user and the post id
        const likeObj = {
            owner: req.user._id,
            belongsTo: req.params.id
        };
            
        // 2. Check if post and user still exist 
        if(!likeObj.owner) {
            return next(new AppError('User does no longer exist.', 404))
        } else if (!likeObj.belongsTo) {
            return next(new AppError('Post does no longer exist.', 404))
        }
    
        // 3. Create a dislike and send the response
        const like = await Like.findOneAndDelete({owner: req.user._id, belongsTo: req.params.id});
        
        if(!like) {
            return next(new AppError('You cannot dislike a post that you did not liked.', 406));
        }
        
        // 4. Update the like count in the particular post 
        const post = await Post.findOneAndUpdate({_id: req.params.id }, {$inc: {likeCount: -1}}, {
            new: true,
            runValidators: true
        }).select('+ownerId')
        
        // await Notification.findOneAndDelete({recipient: post.ownerId, type: 'like'})
    
        res.status(201).json({
            message: 'success',
            data: null
        })
});

// * Comment a post
exports.commentPost = catchAsync(async (req, res, next) => {
    // 1. Create an object related to post commenting
    const newComment = {
        owner: req.user._id,
        ownerName: `${req.user.firstName + ' ' + req.user.lastName}`,
        ownerImage: req.user.userImage,
        belongsTo: req.params.id,
        text: req.body.text
    };
    
    // 2. Check if related data still exists
    if(!newComment.owner) {
        return next(new AppError('User does no longer exist.', 404))
    } else if (!newComment.belongsTo) {
        return next(new AppError('Post does no longer exist.', 404))
    } 

    const comment = await Comment.create(newComment)

    // 3. Update the coresponding post
    const post = await Post.findOneAndUpdate({_id: req.params.id}, {$inc: {commentCount: 1}}, {
        new: true,
        runValidators: true
    }).select('+ownerId')

    // let userName = `${req.user.firstName + ' ' + req.user.lastName}`;
    // console.log(post.owner === newComment.ownerName)

    //! HAD TO DO THE OPPOSITE
    if(post.owner !== newComment.ownerName) {
        await Notification.create({
            recipient: post.ownerId,
            sender: newComment.ownerName,
            postId: post._id,
            type: 'comment'
        })
    }
    
    // 4. If we get to this point , send the res
    res.status(201).json({
        message: 'success',
        data: {
            comment
        }
    })
});

exports.deleteComment = catchAsync(async (req, res, next) => {
    await Comment.findOneAndDelete({_id: req.params.commentId, owner: req.user._id})
    // , (err, res) => err ? console.log(err) : console.log(res)

    const post = await Post.findOneAndUpdate({_id: req.params.id}, {$inc: {commentCount: -1}}, {
        new: true,
        runValidators: true
    }).select('+ownerId')

    // await Notification.findOneAndDelete({recipient: post.ownerId, type: 'comment'})

    res.status(204).json({
        data: null
    })
});
