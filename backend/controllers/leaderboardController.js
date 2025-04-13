const UserStats = require('../models/UserStats');

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await UserStats.find()
      .sort({ points: -1 })
      .limit(50)
      .select('username points wordsPracticed gamesPlayed averageAccuracy');
    
    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

exports.updateUserStats = async (userId, statsUpdate) => {
  try {
    await UserStats.findOneAndUpdate(
      { userId },
      { 
        ...statsUpdate,
        lastUpdated: Date.now() 
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

exports.updateStats = async (req, res) => {
    try {
      const userId = req.user.id; // From auth middleware
      const { accuracy, wordsPracticed, gamesPlayed, points } = req.body;
  
      // Get current stats
      const currentStats = await UserStats.findOne({ userId }) || {
        userId,
        username: req.user.username,
        points: 0,
        wordsPracticed: 0,
        practiceSessions: 0,
        gamesPlayed: 0,
        totalAccuracy: 0
      };
  
      // Calculate new values
      const updates = {
        points: currentStats.points + (points || 0),
        wordsPracticed: currentStats.wordsPracticed + (wordsPracticed || 0),
        practiceSessions: accuracy ? currentStats.practiceSessions + 1 : currentStats.practiceSessions,
        gamesPlayed: currentStats.gamesPlayed + (gamesPlayed || 0),
        averageAccuracy: accuracy
          ? Math.round(
              (currentStats.totalAccuracy + accuracy) / 
              (currentStats.practiceSessions + 1)
            )
          : currentStats.averageAccuracy,
        totalAccuracy: currentStats.totalAccuracy + (accuracy || 0)
      };
  
      await UserStats.findOneAndUpdate(
        { userId },
        updates,
        { upsert: true, new: true }
      );
  
      res.status(200).json({ message: 'Stats updated' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating stats' });
    }
  };