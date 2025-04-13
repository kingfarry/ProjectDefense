import { useState, useRef, useEffect, createContext, useContext } from "react";
import { Volume2, Mic, Play, RotateCcw, User, Home, Gamepad2, Settings, Trophy } from "lucide-react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import DetailedAnalysis from "./components/DetailedAnalysis";
import CompareWords from "./components/CompareWords";
import Profile from "./components/Profile";
import AccountSettings from "./components/AccountSettings";
import Auth from "./components/Auth";
import GameSection from "./components/GameSection";
import LeaderboardPage from "./pages/LeaderboardPage";
import MinimalPairPractice from "./components/MinimalPairPractice";
import { minimalPairs } from "./feature/MinimalPair";

// Create Auth Context
interface AuthContextType {
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  authToken: null,
  setAuthToken: () => {}
});

export const useAuth = () => useContext(AuthContext);

interface DictionaryResponse {
  word: string;
  phonetic?: string;
  phonetics: Array<{
    text?: string;
    audio?: string;
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
    }>;
  }>;
}

interface UserData {
  email: string;
  username: string;
  points: number;
  lastLoginDate?: string;
  loginStreak: number;
}

interface PracticeStats {
  wordsPracticed: number;
  sessions: {score: number, date: string}[];
  lastPracticeDate: string | null;
  minimalPairsCompleted: number;
}

const POINT_VALUES = {
  PRACTICE_SESSION: 5,
  ACCURACY_BONUS: 0.1,
  WORD_PRACTICED: 2,
  GAME_PLAYED: 10,
  GAME_SCORE_MULTIPLIER: 0.5,
  DAILY_LOGIN: 20,
  STREAK_BONUS: 5,
  MINIMAL_PAIR_CORRECT: 5
};

function AppContent() {
  const { authToken, setAuthToken } = useAuth();
  const location = useLocation();
  const [word, setWord] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [userRecording, setUserRecording] = useState<string>("");
  const [phonetic, setPhonetic] = useState<string>("");
  const [wordDetails, setWordDetails] = useState<DictionaryResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'practice' | 'game' | 'profile' | 'account' | 'leaderboard' | 'minimal-pairs'>('practice');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [practiceStats, setPracticeStats] = useState<PracticeStats>({
    wordsPracticed: 0,
    sessions: [],
    lastPracticeDate: null,
    minimalPairsCompleted: 0
  });
  const [gameHistory, setGameHistory] = useState<{score: number, date: string}[]>([]);
  const [totalScore, setTotalScore] = useState(0);

  const recognition = useRef<any>(null);

  const getSentencePhonetic = async (text: string): Promise<string> => {
    if (!text) return "";
    
    try {
      const words = text.split(/\s+/).filter(word => word.length > 0);
      const phoneticPromises = words.map(async word => {
        try {
          const response = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
          );
          const data = await response.json();
          if (Array.isArray(data) && data[0]) {
            return data[0].phonetic || data[0].phonetics?.[0]?.text || word;
          }
          return word;
        } catch {
          return word;
        }
      });
      
      const phonetics = await Promise.all(phoneticPromises);
      return phonetics.join(" ");
    } catch (error) {
      console.error("Error getting sentence phonetic:", error);
      return "";
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setCurrentUser(userData);
        setIsAuthenticated(true);
        
        const savedStats = localStorage.getItem(`pronunciationData_${userData.email}`);
        if (savedStats) {
          setPracticeStats(JSON.parse(savedStats));
        }

        const savedGameHistory = localStorage.getItem(`gameHistory_${userData.email}`);
        if (savedGameHistory) {
          const history = JSON.parse(savedGameHistory);
          setGameHistory(history);
          setTotalScore(history.reduce((sum: number, game: {score: number}) => sum + game.score, 0));
        }

        const savedTotalScore = localStorage.getItem(`totalScore_${userData.email}`);
        if (savedTotalScore) {
          setTotalScore(parseInt(savedTotalScore, 10));
        }
      } catch (error) {
        console.error("Error parsing saved user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        `pronunciationData_${currentUser.email}`, 
        JSON.stringify(practiceStats)
      );
      localStorage.setItem(
        `gameHistory_${currentUser.email}`,
        JSON.stringify(gameHistory)
      );
      localStorage.setItem(
        `totalScore_${currentUser.email}`,
        totalScore.toString()
      );
    }
  }, [practiceStats, gameHistory, totalScore, currentUser]);

  const handleLogin = (email: string, username: string, token: string) => {
    setAuthToken(token);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    let loginStreak = 1;
    let pointsToAdd = POINT_VALUES.DAILY_LOGIN;

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const lastLogin = userData.lastLoginDate?.split('T')[0];
        
        if (lastLogin === today) {
          loginStreak = userData.loginStreak || 1;
          pointsToAdd = 0;
        } else if (lastLogin && isConsecutiveDay(lastLogin, today)) {
          loginStreak = (userData.loginStreak || 1) + 1;
          pointsToAdd += (loginStreak - 1) * POINT_VALUES.STREAK_BONUS;
        }
      } catch (error) {
        console.error("Error parsing saved user data:", error);
      }
    }

    const userData = { 
      email, 
      username, 
      points: (savedUser ? JSON.parse(savedUser).points : 0) + pointsToAdd,
      lastLoginDate: now.toISOString(),
      loginStreak
    };

    setCurrentUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    const savedStats = localStorage.getItem(`pronunciationData_${email}`);
    if (savedStats) {
      try {
        setPracticeStats(JSON.parse(savedStats));
      } catch (error) {
        console.error("Error parsing practice stats:", error);
      }
    } else {
      setPracticeStats({
        wordsPracticed: 0,
        sessions: [],
        lastPracticeDate: null,
        minimalPairsCompleted: 0
      });
    }

    const savedGameHistory = localStorage.getItem(`gameHistory_${email}`);
    if (savedGameHistory) {
      try {
        const history = JSON.parse(savedGameHistory);
        setGameHistory(history);
        setTotalScore(history.reduce((sum: number, game: {score: number}) => sum + game.score, 0));
      } catch (error) {
        console.error("Error parsing game history:", error);
      }
    }

    const savedTotalScore = localStorage.getItem(`totalScore_${email}`);
    if (savedTotalScore) {
      setTotalScore(parseInt(savedTotalScore, 10));
    }
  };

  function isConsecutiveDay(prevDate: string, currentDate: string): boolean {
    try {
      const prev = new Date(prevDate);
      const current = new Date(currentDate);
      const diffTime = current.getTime() - prev.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays === 1;
    } catch (error) {
      console.error("Error calculating consecutive days:", error);
      return false;
    }
  }

  const handleLogout = () => {
    if (currentUser) {
      const userData = {
        ...currentUser,
        lastLoginDate: currentUser.lastLoginDate,
        loginStreak: currentUser.loginStreak,
        points: currentUser.points
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));
    }

    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('practice');
    setAuthToken(null);
  };

  const handleUpdateProfile = async (newUsername: string): Promise<void> => {
    if (!currentUser) return;
    
    const updatedUser = {
      ...currentUser,
      username: newUsername
    };
    
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const handleUpdateEmail = async (newEmail: string, password: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      console.log("Verifying password:", password);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = {
        ...currentUser,
        email: newEmail
      };
      
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error("Error updating email:", error);
      return false;
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    console.log("Changing password from", currentPassword, "to", newPassword);
    return true;
  };

  const handleDeleteAccount = async (password: string): Promise<void> => {
    if (!currentUser) return;
    
    try {
      console.log("Verifying password:", password);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.removeItem('currentUser');
      localStorage.removeItem(`pronunciationData_${currentUser.email}`);
      localStorage.removeItem(`gameHistory_${currentUser.email}`);
      localStorage.removeItem(`totalScore_${currentUser.email}`);
      
      setIsAuthenticated(false);
      setCurrentUser(null);
      setActiveTab('practice');
      setAuthToken(null);
    } catch (error) {
      console.error("Failed to delete account:", error);
      throw error;
    }
  };

  const handleMinimalPairComplete = (isCorrect: boolean) => {
    if (isCorrect && currentUser) {
      const now = new Date();
      const pointsEarned = POINT_VALUES.MINIMAL_PAIR_CORRECT;
      
      setPracticeStats(prev => ({
        ...prev,
        minimalPairsCompleted: prev.minimalPairsCompleted + 1
      }));

      const updatedUser = {
        ...currentUser,
        points: currentUser.points + pointsEarned
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  useEffect(() => {
    const fetchWordDetails = async () => {
      if (!word) {
        setPhonetic("");
        setWordDetails(null);
        return;
      }

      if (word.includes(" ")) {
        const sentencePhonetic = await getSentencePhonetic(word);
        setPhonetic(sentencePhonetic);
        setWordDetails(null);
      } else {
        try {
          const response = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
          );
          const data = await response.json();
          if (Array.isArray(data) && data[0]) {
            setWordDetails(data[0]);
            setPhonetic(data[0].phonetic || data[0].phonetics?.[0]?.text || "");
          }
        } catch (error) {
          console.error("Error fetching word details:", error);
          setPhonetic("");
          setWordDetails(null);
        }
      }
    };

    fetchWordDetails();
  }, [word]);

  const initializeSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported in this browser");
      return;
    }

    recognition.current = new SpeechRecognition();
    recognition.current.continuous = false;
    recognition.current.interimResults = false;
    recognition.current.lang = "en-US";

    recognition.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      const confidence = event.results[0][0].confidence;
      const accuracyScore = Math.round(confidence * 100);
      
      setUserRecording(transcript);
      setScore(accuracyScore);
      setIsListening(false);
      
      updatePracticeStats(accuracyScore);
    };

    recognition.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };
  };

  const updatePracticeStats = (score: number) => {
    const now = new Date();
    const wordCount = word.split(/\s+/).filter(w => w.length > 0).length;
    
    const pointsEarned = 
      POINT_VALUES.PRACTICE_SESSION + 
      (score * POINT_VALUES.ACCURACY_BONUS) + 
      (wordCount * POINT_VALUES.WORD_PRACTICED);

    setPracticeStats(prev => ({
      ...prev,
      wordsPracticed: prev.wordsPracticed + wordCount,
      sessions: [...prev.sessions, { score, date: now.toISOString() }],
      lastPracticeDate: now.toISOString()
    }));

    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        points: currentUser.points + pointsEarned
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const speak = () => {
    if (!word) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!recognition.current) initializeSpeechRecognition();
    if (!recognition.current) {
      console.error("Speech recognition not initialized");
      return;
    }
    
    setIsListening(true);
    setScore(null);
    setUserRecording("");
    recognition.current.start();
  };

  const reset = () => {
    setWord("");
    setScore(null);
    setUserRecording("");
    setPhonetic("");
    setWordDetails(null);
    setIsListening(false);
    if (recognition.current) recognition.current.abort();
  };

  const getSyllableCount = (word: string): number => {
    word = word.toLowerCase();
    word = word.replace(/(?:[^laeiouy]|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 0;
  };

  const getPronunciationTips = (word: string): string[] => {
    const tips: string[] = [];
    const lowerWord = word.toLowerCase();

    if (lowerWord.endsWith("ed")) {
      tips.push('Words ending in "-ed" often have a "d" or "t" sound, not "ed"');
    }
    if (lowerWord.includes("th")) {
      tips.push('For "th", place your tongue between your teeth');
    }
    if (lowerWord.includes("r")) {
      tips.push('The "r" sound in English is different from many languages - curl your tongue back slightly');
    }
    if (lowerWord.includes("w")) {
      tips.push('For "w", round your lips as if saying "oo"');
    }
    if (getSyllableCount(word) > 2) {
      tips.push("Focus on word stress - typically one syllable is emphasized more than others");
    }

    return tips;
  };

  if (!isAuthenticated) {
    return <Auth onLogin={(email, username) => handleLogin(email, username, authToken || "")} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 w-full">
      {/* Header Section */}
      <div className="py-6 px-8 w-full">
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Pronunciation Coach
            </h1>
            {currentUser && (
              <p className="text-purple-700 mt-1">
                Welcome, {currentUser.username}! 
                <span className="ml-2 text-yellow-600 font-bold">Points: {currentUser.points}</span>
              </p>
            )}
          </div>
          <p className="text-gray-600 text-base">
            Improve your speaking skills with real-time feedback
          </p>
        </div>
        <hr className="mt-4 border-t-2 border-purple-200 opacity-50" />
        
        {/* Navigation Tabs */}
        <div className="flex mt-6 border-b border-purple-200">
          <Link
            to="/practice"
            onClick={() => setActiveTab('practice')}
            className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'practice' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'}`}
          >
            <Home size={18} />
            Practice
          </Link>
          <Link
            to="/minimal-pairs"
            onClick={() => setActiveTab('minimal-pairs')}
            className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'minimal-pairs' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'}`}
          >
            <Volume2 size={18} />
            Minimal Pairs
          </Link>
          <Link
            to="/game"
            onClick={() => setActiveTab('game')}
            className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'game' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'}`}
          >
            <Gamepad2 size={18} />
            Game
          </Link>
          <Link
            to="/leaderboard"
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'leaderboard' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'}`}
          >
            <Trophy size={18} />
            Leaderboard
          </Link>
          <Link
            to="/profile"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'profile' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'}`}
          >
            <User size={18} />
            Profile
          </Link>
          <Link
            to="/account"
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'account' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'}`}
          >
            <Settings size={18} />
            Account
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 space-y-4 pb-8">
        <Routes>
          <Route path="/practice" element={
            <>
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl shadow-sm p-6 w-full border border-purple-200">
                <h2 className="text-xl font-semibold text-purple-800 mb-3">Practice Pronunciation</h2>
                <p className="text-purple-700 mb-2">Type text you want to practice pronouncing:</p>
                <textarea
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  className="w-full h-32 px-4 py-3 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white bg-opacity-70"
                  placeholder="Type words or sentences to practice..."
                />
              </div>

              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl shadow-sm p-6 w-full border border-purple-200">
                <h3 className="text-lg font-medium text-purple-800 mb-1">Phonetic:</h3>
                <p className="text-purple-700 italic">
                  {phonetic || "Type to see phonetic transcription"}
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  Microsoft David - English (United States) (en-US)
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl shadow-sm p-6 w-full border border-purple-200">
                <div className="flex gap-4">
                  <button
                    onClick={speak}
                    disabled={!word}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Volume2 size={18} />
                    Listen
                  </button>

                  <button
                    onClick={startListening}
                    disabled={!word || isListening}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isListening ? <Play size={18} /> : <Mic size={18} />}
                    {isListening ? "Recording..." : "Practice"}
                  </button>

                  <button
                    onClick={reset}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-300 to-pink-300 text-purple-800 rounded-lg hover:from-purple-400 hover:to-pink-400 transition-all"
                  >
                    <RotateCcw size={18} />
                    Reset
                  </button>
                </div>
              </div>

              {userRecording && (
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl shadow-sm p-6 w-full border border-purple-200">
                  <CompareWords original={word} spoken={userRecording} />

                  {score !== null && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-purple-800 mb-2">
                        Accuracy Score: {score}%
                      </h3>
                      <div className="w-full bg-purple-200 rounded-full h-2">
                        <div
                          style={{ width: `${score}%` }}
                          className={`h-2 rounded-full ${
                            score >= 80
                              ? "bg-gradient-to-r from-green-400 to-green-500"
                              : score >= 60
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                              : "bg-gradient-to-r from-red-400 to-red-500"
                          }`}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {word && !word.includes(" ") && (
                <DetailedAnalysis
                  word={word}
                  getPronunciationTips={getPronunciationTips}
                  getSyllableCount={getSyllableCount}
                  phonetic={phonetic}
                  wordDetails={wordDetails}
                />
              )}
            </>
          } />
          
          <Route path="/minimal-pairs" element={
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-purple-800">Minimal Pairs Practice</h2>
              <p className="text-purple-700">
                Practice distinguishing between similar sounds in English
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {minimalPairs.map((pair, index) => (
                  <MinimalPairPractice
                    key={index}
                    pair={pair}
                    onComplete={handleMinimalPairComplete}
                  />
                ))}
              </div>
            </div>
          } />
          
          <Route path="/game" element={
            <GameSection 
              userName={currentUser?.username || ""}
              onGameEnd={(finalScore) => {
                const now = new Date().toISOString();
                const pointsEarned = POINT_VALUES.GAME_PLAYED + (finalScore * POINT_VALUES.GAME_SCORE_MULTIPLIER);
                
                setGameHistory(prev => [...prev, { score: finalScore, date: now }]);
                setTotalScore(prev => prev + finalScore);
                
                if (currentUser) {
                  const updatedUser = {
                    ...currentUser,
                    points: currentUser.points + pointsEarned
                  };
                  setCurrentUser(updatedUser);
                  localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                  
                  localStorage.setItem(
                    `gameHistory_${currentUser.email}`,
                    JSON.stringify([...gameHistory, { score: finalScore, date: now }])
                  );
                  localStorage.setItem(
                    `totalScore_${currentUser.email}`,
                    (totalScore + finalScore).toString()
                  );
                }
              }}
              gameHistory={gameHistory}
              totalScore={totalScore}
            />
          } />
          
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          
          <Route path="/profile" element={
            <Profile 
              isAuthenticated={isAuthenticated}
              practiceStats={practiceStats}
              currentUser={currentUser}
              gameHistory={gameHistory}
              totalScore={totalScore}
              onSignOut={handleLogout}
            />
          } />
          
          <Route path="/account" element={
            <AccountSettings
              currentUser={currentUser}
              onSignOut={handleLogout}
              onUpdateProfile={handleUpdateProfile}
              onUpdateEmail={handleUpdateEmail}
              onChangePassword={handleChangePassword}
              onDeleteAccount={handleDeleteAccount}
            />
          } />
          
          <Route path="*" element={<Navigate to="/practice" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  const [authToken, setAuthToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ authToken, setAuthToken }}>
      <Router>
        <AppContent />
      </Router>
    </AuthContext.Provider>
  );
}

export default App;