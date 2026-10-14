import React, { useState } from 'react';
import { authAPI } from '../services/api';

export default function AuthView({ onLoginSuccess, onAuthSuccess, onNavigate }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password!');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      let data;
      if (isLogin) {
        data = await authAPI.login(email, password);
      } else {
        data = await authAPI.register(email, password);
      }

      // Safely trigger whichever callback prop App.jsx passed down
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(data);
      } else if (typeof onAuthSuccess === 'function') {
        onAuthSuccess(data);
      } else if (typeof onNavigate === 'function') {
        onNavigate('notes');
      } else {
        window.location.reload();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Make sure your backend server is running and you have created an account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-lg bg-[#0E2344] text-[#EAB308] flex items-center justify-center font-serif font-bold text-xl">
          S
        </div>
        <span className="font-serif text-2xl font-bold text-[#0E2344]">Study Buddy</span>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E2E8F0] w-full max-w-md">
        <h2 className="font-serif text-3xl font-bold text-[#0E2344] mb-2">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          {isLogin ? 'Sign in to your notes, tasks, and AI tutor.' : 'Register a new account to start studying.'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0E2344] text-[#0E2344]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0E2344] text-[#0E2344]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0E2344] text-white rounded-xl font-medium hover:bg-opacity-90 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Create account')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? 'New here? ' : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-[#EAB308] font-semibold hover:underline cursor-pointer"
          >
            {isLogin ? 'Create an account' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}