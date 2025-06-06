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
            navigate('/dashboard'); // Redirect to dashboard
        } catch (err) {
            setError('Invalid email or password.');
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-md">
            <h1 className="text-2xl font-bold mb-6">Login</h1>
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Login
                </button>
            </form>
            <p className="text-gray-500 mt-4">
                Don't have an account?{' '}
                <button
                    onClick={() => navigate('/signup')}
                    className="text-blue-600 hover:underline"
                >
                    Sign up
                </button>
            </p>
        </div>
    );
};

export default Login;