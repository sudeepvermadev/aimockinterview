# PrepEdge 

> **Master Your Interviews with AI-Powered Precision.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-v9-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Integration-635BFF?style=for-the-badge&logo=stripe)](https://stripe.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🌟 Introduction

**PrepEdge** is a high-fidelity, AI-driven mock interview platform designed to bridge the gap between preparation and performance. Whether you're a student, a job seeker, or a professional looking to sharpen your communication skills, PrepEdge provides a realistic, low-pressure environment to practice, receive instant feedback, and iterate until you're ready for the real thing.

Built with **Next.js 15**, **Firebase**, and **Google Gemini AI**, PrepEdge delivers a premium user experience characterized by sleek glassmorphic UI, real-time analytics, and seamless AI interactions.

---

## 📺 Demo Videos

<details>
  <summary><b>🌐 Full Platform Walkthrough (Features & Analytics)</b></summary>
  <br/>



  <!-- DRAG AND DROP FULL WALKTHROUGH VIDEO HERE -->
  <p><i>A complete tour of PrepEdge, covering authentication, dashboard analytics, coin management, and the feedback system.</i></p>
</details>

<br/>

<details>
  <summary><b>🤖 AI Interview Experience (Live Session)</b></summary>
  <br/>

  <!-- DRAG AND DROP INTERVIEW EXPERIENCE VIDEO HERE -->
  <p><i>A deep dive into the real-time AI voice interaction, showing the low-latency conversation with AI Coach Alex.</i></p>
</details>

---

---

## ✨ Key Features

### 🤖 AI-Powered Mock Interviews
- **Role-Based Templates**: Choose from curated industry roles (SDE, PM, Data Science, etc.) or create a custom interview.
- **Dynamic Question Generation**: Powered by **Google Gemini**, the AI adapts its questions based on your role and previous responses.
- **Voice-First Experience**: High-quality voice interaction with **Vapi AI** to simulate real-world conversations.

### 📊 Performance Analytics
- **Growth Trajectory**: Visualize your score improvement over time with interactive **Recharts**.
- **Skill Breakdown**: Radar charts identify your core strengths and areas for improvement (Technical, Communication, Confidence).
- **Comprehensive History**: Review every session, complete with transcripts and AI feedback.

### 💼 Professional Tools
- **PDF & Excel Exports**: Generate high-fidelity reports of your performance to share or keep for your records.
- **Interview Scheduling**: Integrated calendar system with notifications to keep your prep on track.
- **Global Leaderboard**: See how you stack up against other ambitious users.

### 💳 Premium Experience
- **Secure Authentication**: Powered by **Firebase Auth** with support for Email/Password and Google sign-ins.
- **Subscription Model**: Integrated with **Stripe** for tiered access to premium AI features.
- **Personalized Profile**: Customizable avatars and streak tracking to keep you motivated.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/), [React 19](https://reactjs.org/), [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/)
- **Backend-as-a-Service**: [Firebase](https://firebase.google.com/) (Firestore, Auth, Storage)
- **AI/LLM**: [Google Gemini AI](https://deepmind.google/technologies/gemini/), [Vapi AI](https://vapi.ai/)
- **Charts**: [Recharts](https://recharts.org/)
- **Payments**: [Stripe](https://stripe.com/)
- **Email Delivery**: [Resend](https://resend.com/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm / yarn / pnpm / bun
- A Firebase Project
- API Keys for Google Gemini, Vapi AI, Stripe, and Resend

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/PrepEdge.git
   cd PrepEdge/my-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   # Firebase Config
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # AI Keys
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
   VAPI_PUBLIC_KEY=your_vapi_key
   VAPI_PRIVATE_KEY=your_vapi_private_key

   # Stripe
   STRIPE_SECRET_KEY=your_stripe_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_pub_key

   # Email
   RESEND_API_KEY=your_resend_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3010](http://localhost:3010)** to see the app in action!

### Testing
PrepEdge uses **Jest** and **React Testing Library** for automated testing.

*   **Run All Tests**: `npm test`
*   **Watch Mode**: `npm run test:watch`

Tests are located in the `__tests__/` directory and cover critical logic like AI score extraction and utility functions.

---

## 📂 Project Structure


```text
my-app/
├── app/                  # App Router components & API routes
├── components/           # Reusable UI components
├── constants/            # Configuration & static data
├── contexts/             # React Contexts (Theme, Auth, etc.)
├── firebase/             # Firebase configuration & initialization
├── lib/                  # Utility functions & shared actions
├── public/               # Static assets (logos, images)
└── types/                # TypeScript type definitions
```

---

## 🧠 Technical Deep Dive

### 1. Dual-AI Architecture
PrepEdge leverages two distinct AI systems to provide a seamless experience:
*   **Vapi.ai (Voice Engine)**: Manages the WebRTC connection, handle-offs, and speech-to-text/text-to-speech. This ensures sub-second latency for a natural conversation.
*   **Google Gemini (Analysis Engine)**: Processes the finalized transcript to perform "Technical Benchmarking"—comparing user answers against industry-standard "Ideal Answers."

### 2. Intelligent Score Extraction
One of the core challenges was parsing numeric scores from conversational AI output. We implemented a **multi-stage regex parser** in `lib/utils.ts` that:
1.  Identifies score patterns (e.g., `85/100`, `Score: 90`).
2.  Handles edge cases like ranges (`70-100`) by prioritizing the numerator.
3.  Falls back to natural language processing for word-based scores (e.g., "Eighty-Five").

### 3. Real-time Synchronization
The system uses **Firebase Firestore** for real-time state management, allowing the "Live Pro Tips" and "Voice Indicators" to react instantly as the AI processes the candidate's speech.

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">Made with ❤️ for Ambitious Career Seekers</p>
