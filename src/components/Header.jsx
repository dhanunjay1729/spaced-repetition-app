import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Menu, X, Sun, Moon } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 glass-elevated border-b border-white/10 dark:border-white/5">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gradient">
          SpacedRep
        </Link>

        {/* Hamburger Button */}
        <button
          className="md:hidden text-gray-700 dark:text-gray-200"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-5">
          <Link to="/help" className="text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors font-medium">
            Help
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors font-medium">
                Dashboard
              </Link>
              <Link to="/decks" className="text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors font-medium">
                My Decks
              </Link>
              <Link to="/quiz" className="text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors font-medium">
                Quiz
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/90 hover:bg-red-600 text-white rounded-xl font-medium transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors font-medium">
                Login
              </Link>
              <Link
                to="/signup"
                className="btn-primary text-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-white/10 px-4 py-4 space-y-3 animate-slide-up">
          <Link
            to="/help"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-white/10 transition-colors"
          >
            Help
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-white/10 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/decks"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-white/10 transition-colors"
              >
                My Decks
              </Link>
              <Link
                to="/quiz"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-white/10 transition-colors"
              >
                Quiz
              </Link>

              {/* Theme toggle (mobile) */}
              <button
                onClick={() => { toggleTheme(); }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-white/10 transition-colors"
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>

              <div className="pt-2 border-t border-gray-200 dark:border-white/10">
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-white/10 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="block btn-primary text-center text-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;