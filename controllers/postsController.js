const Post = require('./../models/postModel');
const Like = require('./../models/likeModel');
const User = require('./../models/userModel');
const Comment = require('./../models/commentModel');
const Notification = require('./../models/notificationModel');
const AppError = require('./../utils/AppError');
const catchAsync = require('./../utils/catchAsync');

//* Get all posts
exports.getAllPosts = catchAsync(async (req, res) => {
    const posts = await Post.find().select('-__v')

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
    const post = await Post.findById(req.params.id).select('-__v')
    const comments = await Comment.find({post: req.params.id}).select('-__v')
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
    let user = [req.user.firstName, req.user.lastName].toString().split`,`.join` `

    const newPost = await Post.create({
        user,
        userId: req.user._id,
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
    const post = await Post.findOneAndDelete({userId: req.user._id, _id: req.params.id})
    await Like.deleteMany({belongsTo: req.params.id})
    await Comment.deleteMany({post: req.params.id})
    await Notification.deleteMany({recipient: req.user._id})

    if(!post) return next(new AppError('You do not have permission to perform this kind of operation.', 403))

    res.status(204).json({
        message: 'success'
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
    }).select('+userId')

    //! HAD TO DO THE OPPOSITE // CHANGE LATTER
    if(post.user !== likeObj.ownerName) {
        await Notification.create({
            recipient: post.userId,
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
        await Post.findOneAndUpdate({_id: req.params.id }, {$inc: {likeCount: -1}}, {
            new: true,
            runValidators: true
        }).select('+ownerId')
            
        res.status(201).json({
            message: 'success'
        })
});

// * Comment a post
exports.commentPost = catchAsync(async (req, res, next) => {
    // 1. Create an object related to post commenting
    const newComment = {
        user: req.user._id,
        nameOfUser: `${req.user.firstName + ' ' + req.user.lastName}`,
        userImage: req.user.userImage,
        post: req.params.id,
        text: req.body.text
    };
    
    // 2. Check if related data still exists
    if(!newComment.user) {
        return next(new AppError('User does no longer exist.', 404))
    } else if (!newComment.post) {
        return next(new AppError('Post does no longer exist.', 404))
    } 

    const comment = await Comment.create(newComment)

    // 3. Update the coresponding post
    const post = await Post.findOneAndUpdate({_id: req.params.id}, {$inc: {commentCount: 1}}, {
        new: true,
        runValidators: true
    }).select('+userId')

    //! HAD TO DO THE OPPOSITE // CHANGE LATTER
    if(post.user !== newComment.nameOfUser) {
        await Notification.create({
            recipient: post.userId,
            sender: newComment.nameOfUser,
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
    await Comment.findOneAndDelete({_id: req.params.commentId, user: req.user._id})

    await Post.findOneAndUpdate({_id: req.params.id}, {$inc: {commentCount: -1}}, {
        new: true,
        runValidators: true
    }).select('+ownerId')

    res.status(204).json({
        message: 'success'
    })
});
