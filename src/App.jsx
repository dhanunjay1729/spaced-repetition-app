//this file defines app's main layout and routing structure
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import DeckManager from './pages/DeckManager';
import DeckDetail from './pages/DeckDetail';
import StudySession from './pages/StudySession';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';

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
            </main>
        </div>
    );
}

export default App;