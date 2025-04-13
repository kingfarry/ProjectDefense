import { useState, useEffect, useCallback } from "react";
import { Trophy, Clock, Check, X } from "lucide-react";
import PronunciationChecker from "./PronunciationChecker";
import { languagesQuestions } from "../questions";
import { useAuth } from "../context/AuthContext";

interface Exercise {
  word: string;
  type: 'word' | 'phrase';
  category: string;
  difficulty: number;
  context: string;
}

interface GameSectionProps {
  userName: string;
  onGameEnd: (score: number) => void;
  gameHistory: { score: number; date: string }[];
  totalScore: number;
}

export const GameSection = ({ 
  userName, 
  onGameEnd,
  gameHistory,
  totalScore,
}: GameSectionProps) => {
  const { token: authToken } = useAuth();
  const [gameState, setGameState] = useState({
    score: 0,
    questionsAnswered: 0,
    timeLeft: 60,
    isGameActive: false,
  });

  const [shuffledExercises, setShuffledExercises] = useState<Exercise[]>([]);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = useCallback((array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  const updateGameStats = async (finalScore: number) => {
    try {
      await fetch('/api/leaderboard/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          gamesPlayed: 1,
          points: finalScore
        })
      });
    } catch (error) {
      console.error('Failed to update game stats:', error);
    }
  };

  // Initialize and shuffle exercises on component mount
  useEffect(() => {
    const englishExercises = languagesQuestions.find(lang => lang.code === "en-US")?.exercises || [];
    setShuffledExercises(shuffleArray([...englishExercises]));
  }, [shuffleArray]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState.isGameActive && gameState.timeLeft > 0) {
      timer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    } else if (gameState.timeLeft === 0 && gameState.isGameActive) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [gameState.isGameActive, gameState.timeLeft]);

  const startGame = () => {
    // Reshuffle exercises each time game starts
    const englishExercises = languagesQuestions.find(lang => lang.code === "en-US")?.exercises || [];
    setShuffledExercises(shuffleArray([...englishExercises]));
    
    setGameState({
      score: 0,
      questionsAnswered: 0,
      timeLeft: 60,
      isGameActive: true,
    });
  };

  const endGame = () => {
    setGameState(prev => ({ ...prev, isGameActive: false }));
    updateGameStats(gameState.score);
    onGameEnd(gameState.score);
  };

  const handlePronunciationResult = (accuracy: number) => {
    if (accuracy > 80) {
      const points = Math.floor(accuracy / 10);
      setGameState(prev => ({
        ...prev,
        score: prev.score + points,
        questionsAnswered: prev.questionsAnswered + 1,
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        questionsAnswered: prev.questionsAnswered + 1,
      }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {!gameState.isGameActive ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Pronunciation Challenge
          </h2>
          {userName && (
            <p className="text-gray-600 mb-2">
              Ready, {userName}? Test your pronunciation skills in 60 seconds!
            </p>
          )}
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              Earn points for each correct pronunciation (80%+ accuracy).
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <div className="bg-indigo-50 px-4 py-2 rounded-lg">
                <p className="text-indigo-600 font-medium">
                  Total Score: <span className="font-bold">{totalScore}</span>
                </p>
              </div>
              <div className="bg-purple-50 px-4 py-2 rounded-lg">
                <p className="text-purple-600 font-medium">
                  Games Played: <span className="font-bold">{gameHistory.length}</span>
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={startGame}
            className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Start Game
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg">
                <Trophy className="text-yellow-500" />
                <span className="font-semibold">Score: {gameState.score}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                <Clock className="text-gray-500" />
                <span className="font-semibold">Time: {gameState.timeLeft}s</span>
              </div>
            </div>
            <button
              onClick={endGame}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              End Game
            </button>
          </div>

          <PronunciationChecker 
            onScoreUpdate={handlePronunciationResult}
            showGameUI={false}
            isGameMode={true}
            shuffledExercises={shuffledExercises}
          />

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Correct: {Math.floor(gameState.score / 10)}</span>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-red-600">
                <X className="w-5 h-5" />
                <span className="font-semibold">Incorrect: {gameState.questionsAnswered - Math.floor(gameState.score / 10)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameSection;