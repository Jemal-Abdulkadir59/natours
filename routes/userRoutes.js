/*eslint-disable*/
const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');



const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Multer middleware for multi part form data : npm i multer

//Protect all routes that come after this point b/c middleware run in sequen
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe',userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// restrict all routes after this middleware
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUser)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
