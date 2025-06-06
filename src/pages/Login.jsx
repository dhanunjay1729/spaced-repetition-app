import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            localStorage.setItem('isLoggedIn', true); // Save login state
            navigate('/'); // Redirect to dashboard
        } catch (err) {
            setError('Invalid email or password.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900">
            {/* Branding Section */}
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-white">Spaced Repetition App</h1>
                <p className="text-gray-300 mt-2">Master your learning with smart repetition techniques</p>
            </div>

            {/* Login Form */}
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Login</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:opacity-90 transition"
                    >
                        Login
                    </button>
                </form>
                <p className="text-gray-500 mt-6 text-center">
                    Don't have an account?{' '}
                    <button
                        onClick={() => navigate('/signup')}
                        className="text-gray-800 font-medium hover:underline"
                    >
                        Sign up
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;