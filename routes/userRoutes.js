const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');


const router = express.Router(); //middleware

router.use(authController.protect); //will protect all routers 

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateCurrentUser);
router.delete('/deleteMe', userController.deleteCurrentUser);

router.use(authController.restrictTo('admin'));

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
