// // import { interviewCovers, mappings } from "@/constants";
// // import { clsx, type ClassValue } from "clsx";
// // import { twMerge } from "tailwind-merge";

// // export function cn(...inputs: ClassValue[]) {
// //   return twMerge(clsx(inputs));
// // }

// // const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

// // const normalizeTechName = (tech: string) => {
// //   const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
// //   return mappings[key as keyof typeof mappings];
// // };

// // const checkIconExists = async (url: string) => {
// //   try {
// //     const response = await fetch(url, { method: "HEAD" });
// //     return response.ok; // Returns true if the icon exists
// //   } catch {
// //     return false;
// //   }
// // };

// // export const getTechLogos = async (techArray: string[]) => {
// //   const logoURLs = techArray.map((tech) => {
// //     const normalized = normalizeTechName(tech);
// //     return {
// //       tech,
// //       url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
// //     };
// //   });

// //   const results = await Promise.all(
// //     logoURLs.map(async ({ tech, url }) => ({
// //       tech,
// //       url: (await checkIconExists(url)) ? url : "/tech.svg",
// //     }))
// //   );

// //   return results;
// // };

// // export const getRandomInterviewCover = () => {
// //   const randomIndex = Math.floor(Math.random() * interviewCovers.length);
// //   return `/covers${interviewCovers[randomIndex]}`;
// // };


// // import { interviewCovers, mappings } from "@/constants";
// // import { clsx, type ClassValue } from "clsx";
// // import { twMerge } from "tailwind-merge";

// // export function cn(...inputs: ClassValue[]) {
// //   return twMerge(clsx(inputs));
// // }

// // const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

// // export const normalizeTechName = (tech: string) => {
// //   const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
// //   return mappings[key as keyof typeof mappings] || "javascript";
// // };

// // export const checkIconExists = async (url: string) => {
// //   try {
// //     const res = await fetch(url, { method: "HEAD" });
// //     return res.ok;
// //   } catch {
// //     return false;
// //   }
// // };

// // export const getTechLogos = async (techArray: string[]) => {
// //   const logos = techArray.map((tech) => {
// //     const normalized = normalizeTechName(tech);
// //     return {
// //       tech,
// //       url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
// //     };
// //   });

// //   const results = await Promise.all(
// //     logos.map(async ({ tech, url }) => ({
// //       tech,
// //       url: (await checkIconExists(url)) ? url : "/tech.svg",
// //     }))
// //   );

// //   return results;
// // };

// // export const getRandomInterviewCover = () => {
// //   const randomIndex = Math.floor(Math.random() * interviewCovers.length);
// //   return `/covers${interviewCovers[randomIndex]}`;
// // };


// import { interviewCovers, mappings } from "@/constants";
// import { clsx, type ClassValue } from "clsx";
// import { twMerge } from "tailwind-merge";

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

// const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

// export const normalizeTechName = (tech: string) => {
//   const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
//   return mappings[key as keyof typeof mappings] || "javascript";
// };

// export const checkIconExists = async (url: string) => {
//   try {
//     const res = await fetch(url, { method: "HEAD" });
//     return res.ok;
//   } catch {
//     return false;
//   }
// };

// export const getTechLogos = async (techArray: string[]) => {
//   const logos = techArray.map((tech) => {
//     const normalized = normalizeTechName(tech);
//     return {
//       tech,
//       url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
//     };
//   });

//   const results = await Promise.all(
//     logos.map(async ({ tech, url }) => ({
//       tech,
//       url: (await checkIconExists(url)) ? url : "/tech.svg",
//     }))
//   );

//   return results;
// };

// export const getRandomInterviewCover = () => {
//   const randomIndex = Math.floor(Math.random() * interviewCovers.length);
//   return `/covers${interviewCovers[randomIndex]}`;
// };


import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

export const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings] || "javascript";
};

export const checkIconExists = async (url: string) => {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  const logos = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logos.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  const coverPath = interviewCovers[randomIndex];
  // Ensure we don't get double slashes if the constant already has one
  return `/covers${coverPath.startsWith('/') ? coverPath : '/' + coverPath}`;
};