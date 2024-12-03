const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');


const router = express.Router(); //middleware

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/verify2fa', authController.verify2FA);


router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch('/updateMyPassword/:token', authController.protect, authController.updatePassword);

router.patch('/updateMe', authController.protect, userController.updateCurrentUser);
router.delete('/deleteMe', authController.protect, userController.deleteCurrentUser);


router
	.route('/')
	.get(userController.getAllUsers)
	.post(userController.createUser);
router
	.route('/:id')
	.get(userController.getUser)
	.patch(userController.updateUser)
	.delete(userController.deleteUser);
	

module.exports = router;
