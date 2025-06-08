//this file defines app's main layout and routing structure
import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages
const DeckManager = React.lazy(() => import('./pages/DeckManager'));
const DeckDetail = React.lazy(() => import('./pages/DeckDetail'));
const StudySession = React.lazy(() => import('./pages/StudySession'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));

function App() {
    const location = useLocation(); // Get the current route

    // Check if the current route is Login or Signup
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Render Header only if it's not an auth page */}
            {!isAuthPage && <Header />}
            <Toaster position="top-right" reverseOrder={false} />
            <main>
                <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        {/* Protected Routes */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/decks"
                            element={
                                <ProtectedRoute>
                                    <DeckManager />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/deck/:deckId"
                            element={
                                <ProtectedRoute>
                                    <DeckDetail />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/study/:deckId"
                            element={
                                <ProtectedRoute>
                                    <StudySession />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Suspense>
            </main>
        </div>
    );
}

export default App;