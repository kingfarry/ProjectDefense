import Leaderboard from '../components/Leaderboard';

const LeaderboardPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Pronunciation Leaderboard</h1>
      <Leaderboard />
    </div>
  );
};

export default LeaderboardPage;