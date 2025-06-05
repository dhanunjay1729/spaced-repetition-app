import React from 'react';
//the link component from react-router-dom is used to create 
// links that navigate to different routes in the app without
// reloading the page, providing a smooth single-page application experience.
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();
    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <header className="bg-blue-600 text-white p-4 shadow-lg">
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
            </div>
        </header>
    );
};

export default Header;