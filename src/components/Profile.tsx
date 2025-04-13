import { Trophy, BarChart2, LogOut, Clock, Award, Star, Flame, Calendar } from "lucide-react";

interface UserData {
  email: string;
  username: string;
  points: number;
  lastLoginDate?: string;
  loginStreak: number;
}

interface ProfileProps {
  isAuthenticated: boolean;
  practiceStats: {
    wordsPracticed: number;
    sessions: { score: number; date: string }[];
    lastPracticeDate: string | null;
  };
  onSignOut: () => void;
  currentUser: UserData | null;
  gameHistory: { score: number; date: string }[];
  totalScore: number;
}

const Profile = ({
  isAuthenticated,
  practiceStats,
  onSignOut,
  currentUser,
  gameHistory,
  totalScore
}: ProfileProps) => {
  if (!isAuthenticated || !currentUser) return null;

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateAverageScore = () => {
    if (gameHistory.length === 0) return 0;
    const sum = gameHistory.reduce((total, game) => total + game.score, 0);
    return Math.round(sum / gameHistory.length);
  };

  const getHighestScore = () => {
    if (gameHistory.length === 0) return 0;
    return Math.max(...gameHistory.map(game => game.score));
  };

  const getRecentSessions = (count: number) => {
    return [...gameHistory]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, count);
  };

  const getAchievements = () => {
    const achievements = [];
    const totalPoints = currentUser.points;

    // Points milestones
    if (totalPoints >= 1000) achievements.push("Master Pronouncer (1000+ points)");
    else if (totalPoints >= 500) achievements.push("Advanced Speaker (500+ points)");
    else if (totalPoints >= 100) achievements.push("Intermediate Speaker (100+ points)");
    else achievements.push("Beginner (Keep going!)");

    // Streak achievements
    if (currentUser.loginStreak >= 7) achievements.push(`7-Day Streak (Current: ${currentUser.loginStreak})`);
    else if (currentUser.loginStreak >= 3) achievements.push(`3-Day Streak`);

    // Practice achievements
    if (practiceStats.wordsPracticed >= 50) achievements.push("Word Master (50+ words)");
    if (practiceStats.sessions.length >= 10) achievements.push("Dedicated Learner (10+ sessions)");

    // Game achievements
    if (gameHistory.length >= 5) achievements.push("Frequent Player (5+ games)");
    if (getHighestScore() >= 80) achievements.push("High Scorer (80+ points)");

    return achievements;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Player Profile</h2>
          <div className="mt-2">
            <p className="text-lg font-medium text-gray-700">{currentUser.username}</p>
            <p className="text-gray-600 text-sm">{currentUser.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-bold text-yellow-600">
                {currentUser.points} Points
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Practice Stats Card */}
        <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
          <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
            <BarChart2 size={20} />
            Practice Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Words Practiced</p>
              <p className="text-2xl font-bold text-indigo-600">
                {practiceStats.wordsPracticed}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Practice Sessions</p>
              <p className="text-2xl font-bold text-indigo-600">
                {practiceStats.sessions.length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Avg. Accuracy</p>
              <p className="text-2xl font-bold text-indigo-600">
                {practiceStats.sessions.length > 0 
                  ? Math.round(practiceStats.sessions.reduce((sum, session) => sum + session.score, 0) / practiceStats.sessions.length)
                  : 0}%
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Login Streak</p>
              <p className="text-2xl font-bold text-indigo-600 flex items-center gap-1">
                {currentUser.loginStreak}
                <Flame className="text-orange-500" />
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm col-span-2">
              <p className="text-sm text-gray-500">Last Practice</p>
              <p className="text-lg font-medium text-indigo-600">
                {practiceStats.lastPracticeDate ? 
                  formatDate(practiceStats.lastPracticeDate) : 'No sessions yet'}
              </p>
            </div>
          </div>
        </div>

        {/* Game Stats Card */}
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
          <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
            <Trophy size={20} />
            Game Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Total Score</p>
              <p className="text-2xl font-bold text-purple-600">{totalScore}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Games Played</p>
              <p className="text-2xl font-bold text-purple-600">
                {gameHistory.length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Average Score</p>
              <p className="text-2xl font-bold text-purple-600">
                {calculateAverageScore()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Highest Score</p>
              <p className="text-2xl font-bold text-purple-600">
                {getHighestScore()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm col-span-2">
              <p className="text-sm text-gray-500">Last Game Played</p>
              <p className="text-lg font-medium text-purple-600">
                {gameHistory.length > 0 
                  ? formatDate(gameHistory[0].date) 
                  : 'No games played yet'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-100 mb-8">
        <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
          <Star className="text-yellow-500" />
          Your Achievements
        </h3>
        <div className="flex flex-wrap gap-3">
          {getAchievements().length > 0 ? (
            getAchievements().map((achievement, index) => (
              <div 
                key={index} 
                className="bg-white px-4 py-2 rounded-full border border-yellow-200 flex items-center gap-2"
              >
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-700">{achievement}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-600">Keep practicing to unlock achievements!</p>
          )}
        </div>
      </div>

      {/* Game History Section */}
      {gameHistory.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={20} />
            Recent Game Sessions
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points Earned
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getRecentSessions(5).map((game, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(game.date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {game.score}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            game.score >= 80
                              ? "bg-green-500"
                              : game.score >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(game.score, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      +{Math.round(10 + (game.score * 0.5))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Practice History Section */}
      {practiceStats.sessions.length > 0 && (
        <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 mt-6">
          <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Recent Practice Sessions
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-indigo-200">
              <thead className="bg-indigo-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">
                    Accuracy
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-indigo-100">
                {practiceStats.sessions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((session, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-indigo-600">
                        {formatDate(session.date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-indigo-900">
                        {session.score}%
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="w-full bg-indigo-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              session.score >= 80
                                ? "bg-green-500"
                                : session.score >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${session.score}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;