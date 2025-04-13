const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./utils/errorHandler');

const app = express();

const leaderboardRoutes = require('./routes/leaderboardRoutes');

// 1) Middlewares
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Add after other middleware
app.use('/api/leaderboard', leaderboardRoutes);

// 2) Routes
app.use('/api', authRoutes);

// 3) Error handling middleware
app.use(errorHandler);

module.exports = app;