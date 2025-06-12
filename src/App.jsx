//this file defines app's main layout and routing structure
//it serves as the main layout and routing structure of the application.
//Suspense is used to handle lazy loading of components,
import React, { Suspense } from 'react';
// Routes and Route are used to define the application's routes,
// allowing navigation between different pages without reloading the page.
// useLocation is used to get the current route location.
import { Routes, Route, useLocation } from 'react-router-dom';
// Toaster is used to display toast notifications for user feedback.
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
// A wrapper component that protects certain routes from unauthorized access.
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages, they are only loaded when needed,
// improving performance by reducing the initial bundle size.
const DeckManager = React.lazy(() => import('./pages/DeckManager'));
const DeckDetail = React.lazy(() => import('./pages/DeckDetail'));
const StudySession = React.lazy(() => import('./pages/StudySession'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));

// The main App component that defines the layout and routing of the application.
function App() {
    const location = useLocation(); // Get the current route

    // to coditionally render the Header component based on the current route.
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Render Header only if it's not an auth page */}
            {!isAuthPage && <Header />}
            <Toaster position="top-right" reverseOrder={false} />
            <main>
                {/* Fallback content while components are loading */}
                <Suspense fallback={<LoadingSpinner />}>
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