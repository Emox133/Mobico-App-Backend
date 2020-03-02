const express = require('express');
const postsController = require('./../controllers/postsController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/')
.get(postsController.getAllPosts)
.post(authController.protectRoutes, postsController.createPost)

router.route('/:id')
.get(postsController.getOnePost)

module.exports = router;