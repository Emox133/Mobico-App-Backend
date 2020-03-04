const express = require('express');
const postsController = require('./../controllers/postsController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/')
.get(postsController.getAllPosts)
.post(authController.protectRoutes, postsController.createPost)

router.route('/:id')
.get(postsController.getOnePost)

router.route('/:id/like')
.post(authController.protectRoutes, postsController.likePost)
router.route('/:id/dislike')
.post(authController.protectRoutes, postsController.dislikePost)

router.route('/:id/comment')
.post(authController.protectRoutes, postsController.commentPost)

module.exports = router;