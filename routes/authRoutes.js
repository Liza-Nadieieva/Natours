const express = require('express');
const authController = require('../controllers/authController');


const router = express.Router(); //middleware


router.post('/signup', authController.signup);
router.post('/login', authController.checkLock, authController.login);
router.post('/verify2fa', authController.verify2FA);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updateMyPassword/:token', authController.protect, authController.updatePassword);


module.exports = router;


