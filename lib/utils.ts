import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key] || "javascript";
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
};

export const getTechLogos = async (techstack: string[] | string) => {
  const techArray = typeof techstack === "string" ? techstack.split(",").map(s => s.trim()) : techstack;
  
  if (!techArray || techArray.length === 0) return [];

  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  const coverPath = interviewCovers[randomIndex];
  return `/covers/${coverPath.startsWith("/") ? coverPath.slice(1) : coverPath}`;
};

export const extractScoreFromText = (text: string): number => {
  if (!text) return 0;

  const lowerText = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ").replace(/-/g, " ");
  
  // 1. Primary: Match digits (e.g., "85/100" or "Score: 90")
  const digitMatch = lowerText.match(/(?:final score|score|marks|assessment|index|performance)\s*[,:]?\s*(\d+)/i);
  if (digitMatch) {
    const score = parseInt(digitMatch[1]);
    return isNaN(score) ? 0 : score;
  }

  // 2. Map for number words
  const wordMap: { [key: string]: number } = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
    ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
    twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90
  };

  const words = lowerText.split(/\s+/);
  const indicators = ["score", "marks", "assessment", "index", "performance", "final"];
  
  let scoreIndex = -1;
  for (let i = 0; i < words.length; i++) {
    if (indicators.includes(words[i])) {
      scoreIndex = i;
      break;
    }
  }

  // If we found an indicator, look ahead for number words or digits
  if (scoreIndex !== -1) {
    let extracted = 0;
    for (let i = scoreIndex + 1; i < Math.min(scoreIndex + 8, words.length); i++) {
      const word = words[i];
      if (wordMap[word] !== undefined) {
        extracted += wordMap[word];
      } else if (/^\d+$/.test(word)) {
        return parseInt(word);
      } else if (word === "hundred" && extracted === 1) {
        return 100;
      } else if (word === "hundred" && extracted > 1) {
        // Handle "one hundred" or "sixty five" followed by "one hundred" (the "out of" case)
        if (extracted <= 100) return extracted;
      }
    }
    if (extracted > 0 && extracted <= 100) return extracted;
  }

  // Fallback: search for any number word 1-100
  let bestScore = 0;
  for (let i = 0; i < words.length; i++) {
      if (wordMap[words[i]] !== undefined) {
          let current = wordMap[words[i]];
          if (i + 1 < words.length && wordMap[words[i+1]] !== undefined) {
              current += wordMap[words[i+1]];
          }
          if (current > bestScore && current <= 100) bestScore = current;
      } else if (/^\d+$/.test(words[i])) {
          const val = parseInt(words[i]);
          if (val > bestScore && val <= 100) bestScore = val;
      }
  }

  return bestScore;
};
