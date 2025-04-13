import { useState, useEffect, useRef } from "react";
import { Volume2, Mic } from "lucide-react";
import MinimalPair  from "../feature/MinimalPair";

interface MinimalPairPracticeProps {
  pair: MinimalPair;
  onComplete: (isCorrect: boolean) => void;
}

export const MinimalPairPractice = ({ pair, onComplete }: MinimalPairPracticeProps) => {
  const [activeWord, setActiveWord] = useState<1 | 2>(1);
  const [userGuess, setUserGuess] = useState<1 | 2 | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognition = useRef<any>(null);

  const speak = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported");
      return false;
    }

    recognition.current = new SpeechRecognition();
    recognition.current.continuous = false;
    recognition.current.interimResults = false;
    recognition.current.lang = "en-US";

    recognition.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleRecognitionResult(transcript);
    };

    recognition.current.onerror = (event: any) => {
      console.error("Recognition error:", event.error);
      setIsListening(false);
    };

    return true;
  };

  const handleRecognitionResult = (transcript: string) => {
    setIsListening(false);
    const cleaned = transcript.toLowerCase().trim();
    const isCorrect = activeWord === 1 
      ? cleaned === pair.word1.toLowerCase()
      : cleaned === pair.word2.toLowerCase();
    
    setUserGuess(isCorrect ? activeWord : (activeWord === 1 ? 2 : 1));
    onComplete(isCorrect);
  };

  const startListening = () => {
    if (!recognition.current && !initializeSpeechRecognition()) {
      return;
    }

    setIsListening(true);
    setUserGuess(null);
    try {
      recognition.current.start();
    } catch (error) {
      console.error("Error starting recognition:", error);
      setIsListening(false);
    }
  };

  useEffect(() => {
    return () => {
      if (recognition.current) {
        recognition.current.abort();
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
      <h3 className="text-xl font-bold text-center mb-6">
        Minimal Pair: {pair.sound}
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => {
            setActiveWord(1);
            speak(pair.word1);
          }}
          className={`p-4 rounded-lg border-2 transition-colors ${
            activeWord === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="font-bold text-lg">{pair.word1}</div>
          <div className="text-sm text-gray-600">{pair.phonetic1}</div>
        </button>
        
        <button
          onClick={() => {
            setActiveWord(2);
            speak(pair.word2);
          }}
          className={`p-4 rounded-lg border-2 transition-colors ${
            activeWord === 2 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="font-bold text-lg">{pair.word2}</div>
          <div className="text-sm text-gray-600">{pair.phonetic2}</div>
        </button>
      </div>

      <div className="text-center mb-6">
        <p className="font-medium">Listen carefully to the difference</p>
        <p className="text-sm text-gray-600">
          Click on a word to hear it pronounced
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => speak(activeWord === 1 ? pair.word1 : pair.word2)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Volume2 size={18} />
          Play Again
        </button>

        <button
          onClick={startListening}
          disabled={isListening}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Mic size={18} />
          {isListening ? "Listening..." : "Try Saying It"}
        </button>
      </div>

      {userGuess && (
        <div className={`mt-6 p-4 rounded-lg ${
          userGuess === activeWord ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {userGuess === activeWord ? (
            <p>✅ Correct! You pronounced it perfectly!</p>
          ) : (
            <p>❌ Almost! Try to focus on the {pair.sound} sound.</p>
          )}
        </div>
      )}
    </div>
  );
};
export default MinimalPairPractice;