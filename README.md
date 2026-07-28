<div align="center">
  <img src="https://img.shields.io/badge/Status-Live-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Version-2.0-blue?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/Stack-React%20%7C%20Tailwind%20%7C%20Firebase-informational?style=for-the-badge" alt="Tech Stack" />

  <br />
  <br />

  <h1 align="center">🧠 SpacedRep</h1>

  <p align="center">
    <strong>An elite-level, AI-native spaced repetition study platform.</strong><br />
    Generate entire flashcard decks from a single topic using Gemini 3.6 Flash, memorize them with a mathematically optimal SM-2 algorithm, and track your mastery through a stunning glassmorphism interface.
  </p>

  <br />
  
  [**🚀 View Live Demo**](https://spaced-repetition-app-ecru.vercel.app) •
  [**🐛 Report Bug**](https://github.com/dhanunjay1729/spaced-repetition-app/issues) •
  [**✨ Request Feature**](https://github.com/dhanunjay1729/spaced-repetition-app/issues)

</div>

---

## ✨ Features (The 2026 Shift)

### 🤖 Generative AI Quiz Pipeline
Never write a flashcard manually again. 
- **Topic to Quiz:** Enter a topic (e.g., "React Hooks") and select a difficulty.
- **Mixed Formats:** The AI generates a structured quiz combining **Multiple Choice** and **Fill-in-the-Blanks**.
- **Instant Curation:** Grade yourself instantly, toggle which questions you want to keep, and save them directly as a new Flashcard deck in one click.

### 📈 Honest SM-2 Algorithm
We implemented the scientifically backed **SuperMemo-2 (SM-2)** algorithm, but with a twist to prevent cheating:
- **Time Penalties:** If you take longer than 15 seconds to flip a card, the "Easy" rating is automatically disabled.
- **Hint Penalties:** Using an AI-generated hint dynamically disables both "Good" and "Easy" ratings, forcing an honest review cycle and preventing false mastery.

### 🎨 Premium Glassmorphism Design
Built with a modern, enterprise-grade styling approach:
- **Dark Mode Native:** Deep surface colors with vibrant indigo and emerald accents.
- **Glassmorphism:** Elegant, frosted-glass cards (`backdrop-blur`) that float over ambient gradients.
- **Micro-Interactions:** Smooth Framer-style CSS transitions for card flips, page loads, and active button states.

---

## 🛠️ Architecture & Tech Stack

This application is built on the **"Enterprise Stack"** for maximum scalability and real-time performance.

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | High-performance client with fast Hot Module Replacement. |
| **Styling** | Tailwind CSS | Custom design system utilizing CSS variables and glassmorphism utilities. |
| **Backend & DB** | Firebase (Firestore) | Real-time NoSQL database syncing your study progress across all devices. |
| **Auth** | Firebase Auth | Secure email/password authentication. |
| **Serverless** | Google Cloud Functions | Secure backend endpoints for handling AI prompt injection and schema formatting. |
| **AI Model** | Gemini 3.6 Flash | Blazing fast LLM used for structured JSON quiz generation and contextual hints. |
| **Hosting** | Vercel | Global Edge Network delivery. |

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed on your machine.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dhanunjay1729/spaced-repetition-app.git
   cd spaced-repetition-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase Environment Variables**
   Create a `.env` file in the root directory and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

---

## 🧠 The Math Behind the Mastery (SM-2)

When you review a card, you rate your recall on a scale of 0 to 5. The app then calculates your next review interval using the SM-2 formula:

1. **Easiness Factor (EF):** `EF' = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))`
2. **Interval (I):** 
   - `I(1) = 1`
   - `I(2) = 6`
   - `I(n) = I(n-1) * EF` (for `n > 2`)

By integrating **Time-to-Answer** and **Hint Usage** directly into the quality rating bounds, SpacedRep ensures your Easiness Factor is a true reflection of your cognitive retention.

---

## 👨‍💻 Author

**Dhanunjay Panta**
- GitHub: [@dhanunjay1729](https://github.com/dhanunjay1729)
- LinkedIn: [dhanunjaypanta](https://linkedin.com/in/dhanunjaypanta)
- Portfolio: [dhanunjay.vercel.app](https://dhanunjay.vercel.app)

---

<div align="center">
  <i>Built with ❤️ to make studying mathematically optimal and visually stunning.</i>
</div>
