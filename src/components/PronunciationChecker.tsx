import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, RefreshCw, Trophy, BarChart2, Gauge } from 'lucide-react';
import { languagesQuestions } from '../questions';
import { useAuth } from '../context/AuthContext';

interface Exercise {
  word: string;
  type: 'word' | 'phrase';
  category: string;
  difficulty: number;
  context: string;
}

interface Language {
  code: string;
  name: string;
  exercises: Exercise[];
}

interface PronunciationCheckerProps {
  onScoreUpdate?: (score: number) => void;
  showGameUI?: boolean;
  isGameMode?: boolean;
  shuffledExercises?: Exercise[];
}

const PronunciationChecker: React.FC<PronunciationCheckerProps> = ({
  onScoreUpdate,
  showGameUI = true,
  isGameMode = false,
  shuffledExercises = []
}) => {
  const { token } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languagesQuestions[0]);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [result, setResult] = useState<{
    spokenWord: string;
    accuracy: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightedLetters, setHighlightedLetters] = useState<
    Array<{
      position: number;
      expected: string;
      spoken: string;
    }>
  >([]);
  const [currentDifficulty, setCurrentDifficulty] = useState<number>(1);
  const recognitionRef = useRef<any>(null);
  const successCountRef = useRef(0);

  const updatePracticeStats = async (accuracy: number) => {
    if (!currentExercise || !token) return;
    
    try {
      const wordsPracticed = currentExercise.word.split(/\s+/).length || 1;
      
      const response = await fetch('/api/leaderboard/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          accuracy,
          wordsPracticed
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update stats');
      }
    } catch (error) {
      console.error('Error updating practice stats:', error);
    }
  };

  // Initialize current exercise
  useEffect(() => {
    if (!selectedLanguage) return;
    
    const exercises = isGameMode 
      ? shuffledExercises.length > 0 
        ? shuffledExercises 
        : [...selectedLanguage.exercises]
      : selectedLanguage.exercises.filter(ex => ex.difficulty === currentDifficulty);
    
    if (exercises.length > 0) {
      setCurrentExercise(exercises[0]);
    } else {
      setCurrentExercise(selectedLanguage.exercises[0] || null);
    }
  }, [selectedLanguage, currentDifficulty, isGameMode, shuffledExercises]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onerror = (event: any) => {
      setError(event.error);
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Set language for speech recognition
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLanguage.code;
    }
  }, [selectedLanguage]);

  const analyzePronunciation = (target: string, spoken: string) => {
    const targetLower = target.toLowerCase();
    const spokenLower = spoken.toLowerCase();
    const incorrectLetters: {
      position: number;
      expected: string;
      spoken: string;
    }[] = [];
    const minLength = Math.min(targetLower.length, spokenLower.length);

    for (let i = 0; i < minLength; i++) {
      if (targetLower[i] !== spokenLower[i]) {
        incorrectLetters.push({
          position: i,
          expected: target[i],
          spoken: spoken[i] || '?',
        });
      }
    }

    if (targetLower.length > spokenLower.length) {
      for (let i = spokenLower.length; i < targetLower.length; i++) {
        incorrectLetters.push({
          position: i,
          expected: target[i],
          spoken: '?',
        });
      }
    }

    const accuracy = calculateAccuracy(targetLower, spokenLower);
    return { accuracy, incorrectLetters, spokenWord: spoken };
  };

  const calculateAccuracy = (target: string, spoken: string) => {
    const distance = levenshteinDistance(target, spoken);
    const maxLength = Math.max(target.length, spoken.length);
    return Math.round(((maxLength - distance) / maxLength) * 100);
  };

  const levenshteinDistance = (a: string, b: string) => {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] =
          b.charAt(i - 1) === a.charAt(j - 1)
            ? matrix[i - 1][j - 1]
            : Math.min(
                matrix[i - 1][j - 1] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j] + 1
              );
      }
    }
    return matrix[b.length][a.length];
  };

  const adjustDifficulty = (accuracy: number) => {
    if (isGameMode) return;

    if (accuracy >= 85) {
      successCountRef.current += 1;
      if (successCountRef.current >= 2 && currentDifficulty < 5) {
        setCurrentDifficulty(prev => Math.min(prev + 1, 5));
        successCountRef.current = 0;
      }
    } else {
      successCountRef.current = 0;
      if (currentDifficulty > 1) {
        setCurrentDifficulty(prev => Math.max(prev - 1, 1));
      }
    }
  };

  const checkPronunciation = () => {
    if (!currentExercise || !recognitionRef.current) return;

    setError(null);
    setIsListening(true);
    setHighlightedLetters([]);

    recognitionRef.current.onresult = (event: any) => {
      const spokenWord = event.results[0][0].transcript.trim();
      const analysis = analyzePronunciation(currentExercise.word, spokenWord);

      setResult({
        spokenWord: analysis.spokenWord,
        accuracy: analysis.accuracy,
      });

      setHighlightedLetters(analysis.incorrectLetters);
      setIsListening(false);

      if (analysis.accuracy > 80) {
        setStreak(prev => prev + 1);
        updatePracticeStats(analysis.accuracy);
        setTotalScore(prev => prev + analysis.accuracy);
        if (onScoreUpdate) {
          onScoreUpdate(analysis.accuracy);
        }
      } else {
        setStreak(0);
      }

      adjustDifficulty(analysis.accuracy);
    };

    recognitionRef.current.start();
  };

  const handleReset = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setResult(null);
    setError(null);
    setHighlightedLetters([]);
    setIsListening(false);
  };

  const nextExercise = () => {
    if (!selectedLanguage) return;

    const availableExercises = isGameMode
      ? shuffledExercises.length > 0 
        ? shuffledExercises 
        : [...selectedLanguage.exercises]
      : selectedLanguage.exercises.filter(ex => ex.difficulty === currentDifficulty);

    if (availableExercises.length === 0) {
      setCurrentExercise(null);
      return;
    }

    const currentIndex = currentExercise 
      ? availableExercises.findIndex(ex => ex.word === currentExercise.word)
      : -1;

    const nextIndex = (currentIndex + 1) % availableExercises.length;
    const nextExercise = availableExercises[nextIndex];

    setCurrentExercise(nextExercise);
    handleReset();
  };

  return (
    <div className="max-w-4xl mx-auto pb-8 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {showGameUI && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">Streak: {streak}</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-green-500" />
                <span className="font-semibold">Score: {totalScore}</span>
              </div>
              {!isGameMode && (
                <div className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">
                    Level: {currentDifficulty}/5
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {languagesQuestions.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedLanguage.code === lang.code
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <h3 className="font-semibold text-lg">{lang.name}</h3>
            </button>
          ))}
        </div>

        {currentExercise && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Practice{' '}
                  {currentExercise.type === 'phrase' ? 'Phrase' : 'Word'}
                </h3>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                  {currentExercise.word}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">Category</span>
                <p className="font-medium text-gray-700">
                  {currentExercise.category}
                </p>
                <span className="text-sm text-gray-500 mt-2 block">
                  Difficulty
                </span>
                <p className="font-medium text-gray-700">
                  {currentExercise.difficulty}/5
                </p>
              </div>
            </div>
            <p className="text-gray-600 italic">"{currentExercise.context}"</p>
          </div>
        )}

        <div className="flex gap-4 mb-8">
          <button
            onClick={checkPronunciation}
            disabled={isListening}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold text-white transition-all ${
              isListening ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5" />
                Listening...
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Start Speaking
              </>
            )}
          </button>
          <button
            onClick={nextExercise}
            className="flex items-center gap-2 py-3 px-6 rounded-lg font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Next {currentExercise?.type === 'phrase' ? 'Phrase' : 'Word'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">You said:</p>
                <p className="text-lg font-medium">{result.spokenWord}</p>
              </div>
              <div>
                <p className="text-gray-600">Accuracy:</p>
                <p
                  className={`text-lg font-medium ${
                    result.accuracy > 80 ? 'text-green-600' : 'text-orange-600'
                  }`}
                >
                  {result.accuracy}%
                </p>
              </div>
            </div>

            {highlightedLetters.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">
                  Pronunciation Details:
                </h4>
                <ul className="space-y-2">
                  {highlightedLetters.map((item, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      Position {item.position + 1}: Expected{' '}
                      <span className="font-medium text-indigo-600">
                        {item.expected}
                      </span>
                      , heard{' '}
                      <span className="font-medium text-red-600">
                        {item.spoken}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PronunciationChecker;