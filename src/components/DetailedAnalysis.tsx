import { Info, Volume2, BookOpen, Layers, Sparkles } from "lucide-react";

interface DetailedAnalysisProps {
  word: string;
  getSyllableCount: (word: string) => number;
  getPronunciationTips: (word: string) => string[];
  phonetic?: string;
  wordDetails: any;
}

const DetailedAnalysis = ({
  word,
  getSyllableCount,
  getPronunciationTips,
  phonetic,
  wordDetails,
}: DetailedAnalysisProps) => {
  if (!word) return null;

  const syllableCount = getSyllableCount(word);
  const tips = getPronunciationTips(word);
  const firstPhonetic = wordDetails?.phonetics?.[0]?.text || phonetic;

  return (
    <div className="space-y-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl shadow-lg border border-purple-100 dark:border-gray-600 mt-6">
      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 flex items-center gap-3">
        <Sparkles size={24} className="text-pink-500" />
        <Info size={20} className="text-blue-600" />
        Detailed Analysis for "{word}"
      </h3>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pronunciation Section */}
        <div className="space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 p-5 rounded-xl border-2 border-blue-100 dark:border-gray-600 shadow-inner">
          <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 text-lg">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Volume2 size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            Pronunciation Guide
          </h4>

          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-gray-600">
              <span className="font-medium text-gray-700 dark:text-gray-300">Syllables:</span>
              <div className="flex items-center gap-3 mt-2">
                <span className="font-mono text-xl tracking-widest text-blue-800 dark:text-blue-300">
                  {word.split("").join("·")}
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  {syllableCount} syllable{syllableCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {firstPhonetic && (
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-gray-600">
                <span className="font-medium text-gray-700 dark:text-gray-300">Phonetic:</span>
                <div className="font-mono bg-blue-50 dark:bg-gray-700 p-3 rounded-lg mt-2 text-blue-800 dark:text-blue-300 text-lg">
                  /{firstPhonetic}/
                </div>
              </div>
            )}

            {tips.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-gray-600">
                <span className="font-medium text-gray-700 dark:text-gray-300">Pro Tips:</span>
                <ul className="mt-2 space-y-3">
                  {tips.map((tip: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                    >
                      <span className="p-1 bg-pink-100 dark:bg-pink-900/30 rounded-full">
                        <Sparkles size={14} className="text-pink-500 dark:text-pink-400" />
                      </span>
                      <span className="flex-1">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Word Details Section */}
        {wordDetails?.meanings && (
          <div className="space-y-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 p-5 rounded-xl border-2 border-purple-100 dark:border-gray-600 shadow-inner">
            <h4 className="font-bold text-purple-800 dark:text-purple-300 flex items-center gap-2 text-lg">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <BookOpen size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              Word Definitions
            </h4>

            <div className="space-y-5">
              {wordDetails.meanings.map((meaning: any, index: number) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-lg border border-purple-200 dark:border-gray-600">
                    <Layers size={18} className="text-purple-500 dark:text-purple-400" />
                    <span className="font-bold text-purple-700 dark:text-purple-300 capitalize">
                      {meaning.partOfSpeech}
                    </span>
                  </div>

                  <ul className="space-y-4 pl-2">
                    {meaning.definitions
                      .slice(0, 3)
                      .map((def: any, defIndex: number) => (
                        <li
                          key={defIndex}
                          className="relative bg-white dark:bg-gray-800 p-3 rounded-lg border border-purple-100 dark:border-gray-600"
                        >
                          <div className="absolute -left-2 top-4 w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-500"></div>
                          <div className="text-gray-800 dark:text-gray-200">{def.definition}</div>
                          {def.example && (
                            <div className="text-sm text-purple-600 dark:text-purple-400 italic mt-2 pl-3 border-l-2 border-purple-200 dark:border-gray-600">
                              "Example: {def.example}"
                            </div>
                          )}
                        </li>
                      ))}
                  </ul>

                  {meaning.synonyms.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-purple-200 dark:border-gray-600">
                      <span className="font-medium text-purple-700 dark:text-purple-300">
                        Synonyms:{" "}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {meaning.synonyms.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {wordDetails.sourceUrls?.length > 0 && (
              <div className="pt-2 text-sm text-purple-600 dark:text-purple-400">
                <span>Source: </span>
                <a
                  href={wordDetails.sourceUrls[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline"
                >
                  {wordDetails.sourceUrls[0]}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailedAnalysis;