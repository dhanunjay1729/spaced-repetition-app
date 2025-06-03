import React from 'react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">DSA Mastery</h1>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <a href="#" className="hover:text-blue-200 transition">Decks</a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-200 transition">Study</a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-200 transition">Progress</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;