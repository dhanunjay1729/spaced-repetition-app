//this file defines app's main layout and routing structure
import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
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