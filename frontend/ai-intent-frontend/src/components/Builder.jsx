import { useState } from 'react';
import { Sparkles, LogOut } from 'lucide-react';

export default function Builder({ onGenerate, user, onLogout }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsGenerating(true);
    onGenerate(prompt);
  };

  return (
    <div className="w-full max-w-3xl">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold mb-3">AI Intent-Based App Builder</h1>
        <p className="text-2xl text-violet-200">Ship any Database with just a prompt</p>
        <p className="text-lg text-white/70 mt-2">
          Deploy databases, APIs, and full-stack apps instantly with AI
        </p>
      </div>

      {/* Main Builder Card */}
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border border-white/20">
        <div className="mb-6">
          <p className="text-white/70 mb-2">Describe your app...</p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Create a complete hospital management system with patient registration, doctor scheduling, appointment booking, and billing"
            className="w-full h-48 bg-white/10 border border-white/30 rounded-2xl p-6 text-white placeholder:text-white/50 focus:outline-none focus:border-violet-400 resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl font-semibold text-xl flex items-center justify-center gap-3 hover:scale-105 transition disabled:opacity-70"
        >
          {isGenerating ? (
            <>Generating with AI <span className="animate-pulse">⚡</span></>
          ) : (
            <>Generate App <Sparkles className="w-6 h-6" /></>
          )}
        </button>

        {/* User Info + Logout */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/20">
          <div className="text-sm text-white/60">
            Logged in as <span className="text-white font-medium">{user?.full_name}</span>
          </div>
          
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <p className="text-center text-white/40 text-xs mt-6">
        Powered by Groq • AI Intent Platform
      </p>
    </div>
  );
}