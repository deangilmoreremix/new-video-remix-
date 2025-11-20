import React, { useState, useEffect } from 'react';
import { VideoEditor } from './components/VideoEditor';
import { User } from './types';
import { geminiService } from './services/geminiService';
import { authService } from './services/authService';
import * as Icons from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [hasKey, setHasKey] = useState(false);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    checkKey();
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Check if demo mode flag is set in localStorage
    const demoFlag = localStorage.getItem('lumina_demo_mode');
    if (demoFlag === 'true') {
      setIsDemoMode(true);
    }
  }, []);

  const checkKey = async () => {
    const valid = await geminiService.checkApiKey();
    setHasKey(valid);
  };

  const handleKeySelect = async () => {
    try {
      await geminiService.openKeySelection();
      setTimeout(checkKey, 1000);
    } catch (e) {
      console.error('Failed to select key', e);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      let loggedInUser;
      if (authMode === 'login') {
        loggedInUser = authService.login(email, password);
      } else {
        loggedInUser = authService.signup(email, password, name);
      }
      setUser(loggedInUser);
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const handleDemoMode = () => {
    setIsDemoMode(true);
    localStorage.setItem('lumina_demo_mode', 'true');
    setShowAuthModal(false);
  };

  const exitDemoMode = () => {
    setIsDemoMode(false);
    localStorage.removeItem('lumina_demo_mode');
  };

  // Show auth modal if not logged in and not in demo mode
  const showWelcomeScreen = !user && !isDemoMode;

  return (
    <div className="min-h-screen flex flex-col font-sans text-white bg-[#050505]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Icons.Cpu className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Lumina<span className="font-light text-brand-500">.ai</span>
          </h1>
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/30">
            AI Video Editor
          </span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={handleKeySelect}
            className={`text-xs font-medium px-3 py-1 rounded-full border ${
              hasKey ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-gray-700 text-gray-400 bg-gray-800'
            }`}
          >
            {hasKey ? 'API Key Active' : 'Connect Google AI'}
          </button>

          {isDemoMode ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/30">
                Demo Mode - All Features Unlocked
              </span>
              <button onClick={exitDemoMode} className="text-xs text-gray-400 hover:text-white">
                Exit Demo
              </button>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
              <div className="text-right">
                <p className="text-sm font-bold text-white">{user.name}</p>
                <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-400">
                  Logout
                </button>
              </div>
              <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold">
                {user.name.charAt(0)}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-5 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Log In
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6">
        {showWelcomeScreen ? (
          <div className="h-full flex items-center justify-center">
            <div className="max-w-2xl text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-brand-500/30">
                <Icons.Film className="text-white w-10 h-10" />
              </div>
              <h2 className="text-5xl font-bold">AI-Powered Video Editor</h2>
              <p className="text-gray-400 text-xl">
                All-in-one creative suite with AI video generation, image editing, voice synthesis, and more
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-8 py-4 bg-brand-600 hover:bg-brand-500 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-brand-500/25"
                >
                  Get Started
                </button>
                <button
                  onClick={handleDemoMode}
                  className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-lg transition-colors flex items-center gap-2"
                >
                  <Icons.Play className="w-5 h-5" />
                  Try Demo
                </button>
              </div>
              <div className="pt-8 border-t border-gray-800 mt-8">
                <p className="text-sm text-gray-500 mb-4">Powered by Google's Gemini AI</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <span className="text-xs px-3 py-1.5 bg-gray-900 rounded-full text-gray-400">Video Generation</span>
                  <span className="text-xs px-3 py-1.5 bg-gray-900 rounded-full text-gray-400">Image Editing</span>
                  <span className="text-xs px-3 py-1.5 bg-gray-900 rounded-full text-gray-400">Background Removal</span>
                  <span className="text-xs px-3 py-1.5 bg-gray-900 rounded-full text-gray-400">Text-to-Speech</span>
                  <span className="text-xs px-3 py-1.5 bg-gray-900 rounded-full text-gray-400">AI Enhancement</span>
                  <span className="text-xs px-3 py-1.5 bg-gray-900 rounded-full text-gray-400">Timeline Editor</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[calc(100vh-8rem)]">
            <VideoEditor user={user} isDemoMode={isDemoMode} />
          </div>
        )}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-gray-400">Access your AI creative suite</p>
            </div>

            {authError && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-500 rounded-lg font-bold mt-2"
              >
                {authMode === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setAuthError('');
                }}
                className="text-sm text-gray-400 hover:text-white underline"
              >
                {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
              </button>
              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={handleDemoMode}
                  className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Icons.Play className="w-4 h-4" />
                  Try Demo Mode (No Login Required)
                </button>
                <p className="text-xs text-gray-500 mt-2">Full access to all features for testing</p>
              </div>
            </div>
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <Icons.X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
