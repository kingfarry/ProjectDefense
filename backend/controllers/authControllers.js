const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

// Helper function to create JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    
    // 1) Validate input
    if (!username) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a username'
      });
    }

    // 2) Check if username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return res.status(400).json({
        status: 'fail',
        message: 'Username is already taken'
      });
    }

    // 3) Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username },
      { new: true, runValidators: true }
    );

    // 4) Create new token with updated username
    const token = signToken(updatedUser._id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          email: updatedUser.email,
          username: updatedUser.username
        }
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if current password is correct
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Your current password is wrong'
      });
    }

    // 3) Validate new password
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password must be at least 8 characters'
      });
    }

    // 4) Update password
    user.password = newPassword;
    await user.save();

    // 5) Log user in, send new JWT
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      message: 'Password changed successfully!'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.updateEmail = async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    
    // 1) Validate email
    if (!validator.isEmail(newEmail)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid email'
      });
    }

    // 2) Check if email is already in use
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email is already in use'
      });
    }

    // 3) Verify password
    const user = await User.findById(req.user.id).select('+password');
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect password'
      });
    }

    // 4) Update email
    user.email = newEmail;
    await user.save();

    // 5) Create new token
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          email: user.email,
          username: user.username
        }
      },
      message: 'Email updated successfully!'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    
    // 1) Verify password
    const user = await User.findById(req.user.id).select('+password');
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect password'
      });
    }

    // 2) Delete user
    await User.findByIdAndDelete(req.user.id);

    res.status(204).json({
      status: 'success',
      message: 'Account deleted successfully'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};