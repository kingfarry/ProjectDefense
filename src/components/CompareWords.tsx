// Compare words and highlight differences
const CompareWords = ({
  original,
  spoken,
}: {
  original: string;
  spoken: string;
}) => {
  if (!original || !spoken) return null;

  const originalWords = original.toLowerCase().split(" ");
  const spokenWords = spoken.toLowerCase().split(" ");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <span className="font-medium dark:text-gray-200">Original:</span>
        <div>
          {originalWords.map((word, i) => (
            <span
              key={i}
              className={`${
                !spokenWords.includes(word) ? "text-green-600 dark:text-green-400 font-medium" : "dark:text-gray-300"
              } mr-1`}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <span className="font-medium dark:text-gray-200">You said:</span>
        <div>
          {spokenWords.map((word, i) => (
            <span
              key={i}
              className={`${
                !originalWords.includes(word) ? "text-red-600 dark:text-red-400 font-medium" : "dark:text-gray-300"
              } mr-1`}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
export default CompareWords;