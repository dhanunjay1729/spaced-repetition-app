# SpacedRep

SpacedRep is a modern spaced repetition learning app that combines the state-of-the-art **FSRS-6 scheduling algorithm**, live **memory retention curve visualization**, and **AI-powered quiz generation** with semantic answer grading.

## ✨ Core Features

- **FSRS-6 Scheduling Algorithm**: Upgraded from SM-2 to FSRS-6 — the same algorithm Anki adopted as its default in October 2023. FSRS achieves ~4% recall prediction error on 100M+ real reviews vs. SM-2's ~14%, and reduces daily review workload by 20–30% at the same retention rate. Tracks Stability (S), Difficulty (D), and Retrievability (R) per card with 21 learned parameters.

- **Live Forgetting Curve Visualization**: Every card shows its real-time memory decay curve using the FSRS-6 power-law formula `R(t) = (1 + factor·t/S)^(−w₂₀)`. Click any card in a deck to see its live retention %, current memory stability, FSRS state, and the predicted decay curve plotted with Recharts.

- **AI Quiz Generator with Semantic Grading**: Enter any topic to generate a mixed-format quiz (MCQ + Fill-in-the-Blank). Fill-in-blank answers are graded semantically using Gemini as an LLM-judge — accepting synonyms, paraphrases, and minor typos. "Cell division" is accepted for "mitosis" when contextually correct. Convert incorrect answers directly into FSRS-scheduled flashcard decks.

- **Honest Review Constraints**: The app tracks response time and hint usage. Using an AI hint disables the Good and Easy ratings. Taking >15 seconds disables Easy. This keeps FSRS intervals mathematically honest — preventing inflated ease factors.

- **SM-2 Backward Compatibility**: Existing cards created with SM-2 fields (interval, repetitions, easeFactor) are handled gracefully via FSRS defaults on first load.

## 🧠 Why FSRS over SM-2?

SM-2 was designed in 1987 for early computers and uses fixed heuristics that don't personalize to individual users.

FSRS-6 uses a neural-network-inspired model trained on 100M+ anonymized review logs:

| Metric | SM-2 | FSRS-6 |
|---|---|---|
| Recall prediction error (RMSE) | ~14% | **~4%** |
| Daily reviews at same retention | Baseline | **20–30% fewer** |
| "Ease hell" problem | Yes | **Eliminated** (mean-reversion) |
| Personalization | None | **Per-user** (after ~400 reviews) |

The forgetting curve formula:
```
R(t, S) = (1 + factor × t/S)^(−w₂₀)
where factor = 0.9^(−1/w₂₀) − 1, ensuring R = 90% when t = S
```

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Recharts
- **Backend & Database**: Firebase (Firestore, Authentication)
- **Serverless Functions**: Firebase Cloud Functions (Node.js)
- **AI Integration**: Google Gemini 3.6 Flash API (quiz generation, hints, OCR, semantic grading)
- **Scheduling Algorithm**: ts-fsrs (FSRS-6 — Open Spaced Repetition)

## 🚀 Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/dhanunjay1729/spaced-repetition-app.git
   cd spaced-repetition-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. **Set up Firebase**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
   Create `functions/.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📄 License

Open-source under the MIT License.
