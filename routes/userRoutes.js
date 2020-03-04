const express = require('express');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

const router = express.Router();

router.route('/signup')
.post(authController.signup)

router.route('/login')
.post(authController.login)

router.route('/forgotPassword')
.post(authController.forgotPassword)
router.route('/resetPassword/:token')
.post(authController.resetPassword)

router.route('/me')
.get(authController.protectRoutes, userController.getUserData)

module.exports = router;