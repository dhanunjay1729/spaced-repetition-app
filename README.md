# Spaced Repetition App

A web application for efficient flashcard study built with React, Vite and Firebase. It implements the SM-2 spaced-repetition algorithm and integrates with OpenAI to generate hints and process user queries.

## Features

- **User authentication** with Firebase
- **Deck and card management** with Firestore persistence
- **Study sessions** scheduled using the SM-2 algorithm
- **AI assistant** for hints, adaptive responses and image text extraction
- **Responsive UI** styled with Tailwind CSS and framer-motion

## Getting Started

### Prerequisites

- Node.js 18 or later
- A Firebase project with Firestore enabled
- An OpenAI API key

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd spaced-repetition-app
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root with the following variables
   ```
   VITE_FIREBASE_API_KEY=your-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   VITE_OPENAI_API_KEY=your-openai-key
   # Optional: specify a model
   VITE_OPENAI_MODEL=gpt-4o
   ```
4. Start the development server
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173` by default.

### Available Scripts

- `npm run dev` – start a local dev server
- `npm run build` – build for production
- `npm run preview` – preview the production build
- `npm run lint` – run ESLint

## Project Structure

- `src/` – React components, pages and utilities
- `src/utils/spacedRepetition.js` – SM-2 algorithm implementation
- `src/utils/aiService.js` – OpenAI integration
- `functions/` – Firebase Cloud Functions

## Deployment

Run `npm run build` to generate the `build` directory. Deploy it to Firebase Hosting or another static hosting provider.

---
