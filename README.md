# Spaced Repetition App - AI-Enhanced Flashcard Study Tool

An intelligent flashcard study application that uses spaced repetition algorithms and AI to optimize learning efficiency. Built with modern web technologies and enhanced with OpenAI integration for smarter study experiences.

## ✨ Features

- **Spaced Repetition Algorithm**: Implements SM-2 algorithm for optimal learning intervals
- **AI-Powered Hints**: Contextual hints and explanations powered by OpenAI API
- **Image Text Extraction**: Extract text from images using AI for easy flashcard creation
- **Real-time Synchronization**: Cross-device sync with Firebase backend
- **Modern UI**: Smooth animations and responsive design with Framer Motion
- **Progress Tracking**: Visual analytics of learning progress and retention rates

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Backend**: Firebase (Authentication, Firestore, Functions)
- **AI Integration**: OpenAI API
- **Deployment**: Vercel

## 🎯 How It Works

1. **Smart Scheduling**: Uses SM-2 algorithm to schedule card reviews based on performance
2. **AI Assistance**: Get contextual hints and explanations when struggling with concepts
3. **Image Processing**: Upload images and extract text automatically for flashcard creation
4. **Progress Analytics**: Track learning efficiency and retention patterns
5. **Cross-Device Sync**: Study seamlessly across multiple devices

## 🧠 SM-2 Algorithm Explained

The SM-2 (SuperMemo 2) algorithm is a spaced repetition method that optimizes learning by scheduling reviews based on your performance:

### How it works:
1. **Initial Learning**: New cards start with short intervals (1-3 days)
2. **Performance Rating**: After each review, rate your recall difficulty (1-5 scale)
3. **Interval Calculation**: 
   - Good performance → longer intervals (exponential growth)
   - Poor performance → reset to shorter intervals
4. **Easiness Factor**: Each card has an "easiness" score that adjusts based on your performance history

### The Math Behind It:
- **Easy cards**: Next interval = Previous interval × Easiness Factor (typically 2.5+)
- **Difficult cards**: Interval resets to 1 day, easiness factor decreases
- **Optimal timing**: Reviews happen just before you're likely to forget

### Why It Works:
- **Forgetting Curve**: Leverages psychological research on memory retention
- **Personalized**: Adapts to your individual learning patterns
- **Efficient**: Maximizes retention while minimizing study time
- **Long-term Focus**: Builds permanent memory rather than cramming

This algorithm ensures you spend more time on difficult concepts while maintaining knowledge of easier material with minimal effort.

## 📱 Usage

- Create flashcard decks for different subjects
- Study with spaced repetition scheduling
- Get AI-powered hints when needed
- Extract text from images for quick card creation
- Track your learning progress over time

## 🔧 Key Features Implemented

- User authentication and profile management
- Flashcard creation and editing interface
- SM-2 spaced repetition algorithm
- Firebase real-time database integration
- OpenAI API integration for hints
- Image text extraction functionality
- Progress tracking and analytics
- Responsive design with smooth animations

## 🚀 Live Demo

Check out the live application: [Spaced Repetition App](https://spaced-repetition-app-ecru.vercel.app)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Dhanunjay Panta**
- GitHub: [@dhanunjay1729](https://github.com/dhanunjay1729)
- LinkedIn: [dhanunjaypanta](https://linkedin.com/in/dhanunjaypanta)
- Portfolio: [dhanunjay.vercel.app](https://dhanunjay.vercel.app)

---

*Built with ❤️ to make studying more efficient and effective*
