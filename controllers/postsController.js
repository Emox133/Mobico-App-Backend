const Post = require('./../models/postModel');
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
    const newPost = await Post.create(req.body)  

    res.status(201).json({
        status: 'success',
        data: {
            post: newPost
        }
    })
});


