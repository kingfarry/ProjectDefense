const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

const router = express.Router();

// Protect all routes after this middleware
router.use(auth.protect);

router.patch('/update-profile', authController.updateProfile);
router.patch('/change-password', authController.changePassword);
router.patch('/update-email', authController.updateEmail);
router.delete('/delete-account', authController.deleteAccount);

module.exports = router;

const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const { check } = require('express-validator');


// Protect all routes after this middleware
router.use(auth.protect);

// Update Profile (Username)
router.patch(
  '/update-profile',
  [
    check('username')
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3-30 characters')
  ],
  authController.updateProfile
);

// Change Password
router.patch(
  '/change-password',
  [
    check('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    check('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
  ],
  authController.changePassword
);

// Update Email
router.patch(
  '/update-email',
  [
    check('newEmail')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email'),
    check('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  authController.updateEmail
);

// Delete Account
router.delete(
  '/delete-account',
  [
    check('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  authController.deleteAccount
);

module.exports = router;