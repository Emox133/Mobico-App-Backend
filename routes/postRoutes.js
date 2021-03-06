const express = require('express');
const postsController = require('./../controllers/postsController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/')
.get(postsController.getAllPosts)
.post(authController.protectRoutes, postsController.createPost)

router.route('/:id')
.get(postsController.getOnePost)
.delete(authController.protectRoutes, postsController.deletePost)

router.route('/:id/like')
.get(authController.protectRoutes, postsController.likedBy)
.post(authController.protectRoutes, postsController.likePost)
router.route('/:id/dislike')
.post(authController.protectRoutes, postsController.dislikePost)

router.route('/:id/comment')
.post(authController.protectRoutes, postsController.commentPost)

router.route('/:id/comment/:commentId')
.delete(authController.protectRoutes, postsController.deleteComment)

module.exports = router;