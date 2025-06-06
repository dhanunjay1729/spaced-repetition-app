import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn'); // Clear login state
        navigate('/login'); // Redirect to login page
    };

    return (
        <header className="bg-white shadow-md p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold hover:text-blue-200 transition">
                    DSA Mastery
                </Link>
                <nav>
                    <ul className="flex space-x-6">
                        <li>
                            <Link
                                to="/"
                                className={`hover:text-blue-200 transition ${
                                    isActive('/') ? 'text-blue-200 font-semibold' : ''
                                }`}
                            >
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/decks"
                                className={`hover:text-blue-200 transition ${
                                    isActive('/decks') ? 'text-blue-200 font-semibold' : ''
                                }`}
                            >
                                Decks
                            </Link>
                        </li>
                    </ul>
                </nav>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;