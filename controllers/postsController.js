const Post = require('./../models/postModel');
const Like = require('./../models/likeModel');
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

    if(!post) {
        next(new AppError('There is no post with this ID.', 404));
    }

    res.status(200).json({
        message: 'success',
        data: {
            post
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
        text: req.body.text
    })

    res.status(201).json({
        message: 'success',
        data: {
            post: newPost
        }
    })
});

// * Like a post
exports.likePost = catchAsync(async(req, res, next) => {
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

    // 3. Create a like and send the response
    const like = await Like.create(likeObj)

    // 4. Update the like count in the particular post 
    const post = await Post.findOneAndUpdate({_id: likeObj.belongsTo}, {$inc: {likeCount: 1}}, {
        new: true,
        runValidators: true
    });

    res.status(201).json({
        message: 'success',
        data: {
            like,
            post    
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
        // const like = await Like.findOneAndDelete({owner: likeObj.owner})
        const like = await Like.findOneAndDelete({owner: req.user._id, belongsTo: req.params.id});

        if(!like) {
            return next(new AppError('You cannot dislike a post that you did not liked.', 403));
        }
        
        // 4. Update the like count in the particular post 
        const post = await Post.findOneAndUpdate({_id: req.params.id, }, {$inc: {likeCount: -1}}, {
            new: true,
            runValidators: true
        });
    
        res.status(201).json({
            message: 'success',
            data: {
                like,
                post    
            }
        })
});

