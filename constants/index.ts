import { z } from "zod";

// --- Tech Mappings ---
export const mappings: Record<string, string> = {
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  next: "nextjs",
  "vue.js": "vuejs",
  vuejs: "vuejs",
  vue: "vuejs",
  "express.js": "express",
  expressjs: "express",
  express: "express",
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  mongodb: "mongodb",
  mongo: "mongodb",
  mongoose: "mongoose",
  mysql: "mysql",
  postgresql: "postgresql",
  sqlite: "sqlite",
  firebase: "firebase",
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  azure: "azure",
  gcp: "gcp",
  digitalocean: "digitalocean",
  heroku: "heroku",
  photoshop: "photoshop",
  "adobe photoshop": "photoshop",
  html5: "html5",
  html: "html5",
  css3: "css3",
  css: "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  jquery: "jquery",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  "angular.js": "angular",
  angularjs: "angular",
  angular: "angular",
  "ember.js": "ember",
  emberjs: "ember",
  ember: "ember",
  "backbone.js": "backbone",
  backbonejs: "backbone",
  backbone: "backbone",
  nestjs: "nestjs",
  graphql: "graphql",
  "graph ql": "graphql",
  apollo: "apollo",
  webpack: "webpack",
  babel: "babel",
  "rollup.js": "rollup",
  rollupjs: "rollup",
  rollup: "rollup",
  "parcel.js": "parcel",
  parceljs: "parcel",
  npm: "npm",
  yarn: "yarn",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  figma: "figma",
  prisma: "prisma",
  redux: "redux",
  flux: "flux",
  redis: "redis",
  selenium: "selenium",
  cypress: "cypress",
  jest: "jest",
  mocha: "mocha",
  chai: "chai",
  karma: "karma",
  vuex: "vuex",
  "nuxt.js": "nuxt",
  nuxtjs: "nuxt",
  nuxt: "nuxt",
  strapi: "strapi",
  wordpress: "wordpress",
  contentful: "contentful",
  netlify: "netlify",
  vercel: "vercel",
  "aws amplify": "amplify",
};

// --- Interviewer Config ---
export interface InterviewerConfig {
  name: string;
  firstMessage: string;
  transcriber: { provider: string; model: string; language: string };
  voice: {
    provider: string;
    voiceId: string;
    stability: number;
    similarityBoost: number;
    speed: number;
    style: number;
    useSpeakerBoost: boolean;
  };
  model: {
    provider: string;
    model: string;
    messages: { role: string; content: string }[];
  };
}

// Example placeholder (uncomment if using @vapi-ai/web)
// export const interviewer: CreateAssistantDTO = { ... }

export const feedbackSchema = z.object({
  overallScore: z.number(),
  summary: z.string(),
  details: z.array(z.object({
    question: z.string(),
    userResponse: z.string(),
    correctAnswer: z.string(),
    marksAwarded: z.number(),
    feedback: z.string()
  }))
});

// --- Interview Covers ---
export const interviewCovers = [
  "adobe.png",
  "amazon.png",
  "facebook.png",
  "hostinger.png",
  "pinterest.png",
  "quora.png",
  "reddit.png",
  "skype.png",
  "spotify.png",
  "telegram.png",
  "tiktok.png",
  "yahoo.png",
];

// --- Types ---
export interface Interview {
  id: string;
  userId: string;
  role: string;
  type: string;
  techstack: string[];
  level: string;
  questions: string[];
  finalized: boolean;
  createdAt: string;
}

export interface Feedback {
  id?: string;
  createdAt: string;
  totalScore: number;
  finalAssessment: string;
  isPublic?: boolean;
}

// --- Dummy Interviews ---
export const dummyInterviews: Interview[] = [
  {
    id: "dummy-1",
    userId: "user1",
    role: "Frontend Developer",
    type: "Technical",
    techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    level: "Junior",
    questions: ["What is React?"],
    finalized: false,
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "dummy-2",
    userId: "user1",
    role: "Full Stack Developer",
    type: "Mixed",
    techstack: ["Node.js", "Express", "MongoDB", "React"],
    level: "Senior",
    questions: ["What is Node.js?"],
    finalized: false,
    createdAt: "2024-03-14T15:30:00Z",
  },
  {
    id: "dummy-3",
    userId: "user1",
    role: "Backend Engineer",
    type: "Technical",
    techstack: ["Python", "Django", "PostgreSQL", "Docker", "Redis"],
    level: "Intermediate",
    questions: ["Explain the difference between a process and a thread in Python."],
    finalized: true,
    createdAt: "2024-03-16T09:15:00Z",
  },
  {
    id: "dummy-4",
    userId: "user1",
    role: "Mobile App Developer",
    type: "Mixed",
    techstack: ["React Native", "Expo", "Firebase", "Redux"],
    level: "Junior",
    questions: ["How do you handle deep linking in React Native?"],
    finalized: false,
    createdAt: "2024-03-17T14:20:00Z",
  },
];