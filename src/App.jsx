// App.js
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const DeckManager = lazy(() => import('./pages/DeckManager'));
const DeckDetail = lazy(() => import('./pages/DeckDetail'));
const StudySession = lazy(() => import('./pages/StudySession'));
const Help = lazy(() => import('./pages/Help'));
const Quiz = lazy(() => import('./pages/Quiz'));

const RootRedirect = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/help" replace />;
};

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 transition-colors duration-300">
        <Header />
        <Toaster position="top-right" />
        
        <main className="pt-16">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/help" element={<Help />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/decks" element={<DeckManager />} />
                <Route path="/deck/:deckId" element={<DeckDetail />} />
                <Route path="/study/:deckId" element={<StudySession />} />
                <Route path="/quiz" element={<Quiz />} />
              </Route>
              
              {/* Default redirect (smart redirect to dash or help based on auth) */}
              <Route path="/" element={<RootRedirect />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;