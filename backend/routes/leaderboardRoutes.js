const express = require('express');
const leaderboardController = require('../controllers/leaderboardController');
const authMiddleware = require('../middleware/auth');
<Route path="/leaderboard" element={<LeaderboardPage />} />

router.post('/update', authMiddleware, leaderboardController.updateStats);

const router = express.Router();

router.get('/', leaderboardController.getLeaderboard);

module.exports = router;