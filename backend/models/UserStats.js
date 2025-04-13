const mongoose = require('mongoose');

// In your UserStats model:
const userStatsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    points: { type: Number, default: 0 },
    averageAccuracy: { type: Number, default: 0 },
    wordsPracticed: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  });
  
module.exports = mongoose.model('UserStats', userStatsSchema);