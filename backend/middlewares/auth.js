const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserStats = require('../models/UserStats');

// Authentication middleware
exports.protect = async (req, res, next) => {
  try {
    // 1) Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.'
      });
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 4) Grant access to protected route
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: 'Invalid token. Please log in again.'
    });
  }
};

// User registration with leaderboard initialization
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1) Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already in use'
      });
    }

    // 2) Create new user
    const newUser = await User.create({
      username,
      email,
      password // Note: Password should be hashed in the User model pre-save hook
    });

    // 3) Create initial leaderboard stats
    await UserStats.create({
      userId: newUser._id,
      username: newUser.username,
      points: 0,
      averageAccuracy: 0,
      wordsPracticed: 0,
      gamesPlayed: 0,
      totalAccuracy: 0,
      practiceSessions: 0
    });

    // 4) Generate JWT token
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 5) Send response
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email
        }
      }
    });

  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message || 'Registration failed'
    });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    // 2) Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    // 3) If everything ok, send token to client
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      }
    });

  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message || 'Login failed'
    });
  }
};