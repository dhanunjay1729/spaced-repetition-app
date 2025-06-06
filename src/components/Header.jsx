import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn'); // Clear login state
        navigate('/login'); // Redirect to login page
    };

    return (
        <header className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg p-4">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-3xl font-extrabold tracking-wide hover:underline">
                    Spaced Repetition
                </Link>

                {/* Navigation Links */}
                <nav className="flex gap-8 ml-[-8rem]"> {/* Moved 2 rems left */}
                    <Link
                        to="/"
                        className="text-lg font-medium hover:text-purple-300 transition"
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/decks"
                        className="text-lg font-medium hover:text-purple-300 transition"
                    >
                        Decks
                    </Link>
                </nav>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;