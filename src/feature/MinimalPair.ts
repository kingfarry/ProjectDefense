export interface MinimalPair {
    word1: string;
    word2: string;
    phonetic1: string;
    phonetic2: string;
    sound: string; // The sound being contrasted (e.g., "ɪ vs iː")
    category: string; // e.g., "vowels", "consonants"
    difficulty: number;
  }
  
  export const minimalPairs: MinimalPair[] = [
    {
      word1: "ship",
      word2: "sheep",
      phonetic1: "/ʃɪp/",
      phonetic2: "/ʃiːp/",
      sound: "ɪ vs iː",
      category: "vowels",
      difficulty: 1
    },
    {
      word1: "bit",
      word2: "beat",
      phonetic1: "/bɪt/",
      phonetic2: "/biːt/",
      sound: "ɪ vs iː",
      category: "vowels",
      difficulty: 1
    },
    {
      word1: "live",
      word2: "leave",
      phonetic1: "/lɪv/",
      phonetic2: "/liːv/",
      sound: "ɪ vs iː",
      category: "vowels",
      difficulty: 1
    },
    // Add more minimal pairs...
  ];

  export default MinimalPair;