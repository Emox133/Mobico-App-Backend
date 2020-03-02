const express = require('express');
const postsController = require('./../controllers/postsController');

const router = express.Router();

router.route('/')
.get(postsController.getAllPosts)
.post(postsController.createPost)

router.route('/:id')
.get(postsController.getOnePost)

module.exports = router;