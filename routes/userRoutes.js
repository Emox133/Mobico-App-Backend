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

router.route('/:id')
.get(authController.protectRoutes, userController.visitProfiles)

router.route('/updateMyPassword')
.patch(authController.protectRoutes, userController.updatePassword)
router.route('/updateMe')
.patch(authController.protectRoutes, userController.updateProfile)

router.route('/deleteMe')
.delete(authController.protectRoutes, userController.deleteMe)

router.route('/notifications')
.patch(authController.protectRoutes, userController.visitedNotifications)

module.exports = router;