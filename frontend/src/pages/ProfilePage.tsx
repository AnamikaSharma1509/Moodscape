import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Heart, Bookmark, Users, RefreshCw, Check, Edit2, LogOut, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

const AVATAR_OPTIONS = ['🍿', '👩‍💻', '✨', '🍕', '🎭', '🦁', '🚀', '🎮', '🍩', '🥑'];

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    userName,
    userAvatar,
    setUserAvatar,
    currentUser,
    isGuest,
    logout,
    moodProfile,
    favorites,
    watchlist
  } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-14 space-y-10">
      {/* User Header Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-white/10 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-500 p-1 shadow-glow-purple flex items-center justify-center">
            <span className="text-5xl">{userAvatar}</span>
          </div>
        </div>

        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                  {userName}
                </h1>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  currentUser
                    ? currentUser.is_verified
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                }`}>
                  {currentUser ? (currentUser.is_verified ? `✓ Verified (${currentUser.auth_provider === 'google' ? 'Google' : 'Email'})` : '⚠️ Unverified Account') : 'Guest Mode'}
                </span>
              </div>
              {currentUser && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {currentUser.email}
                </p>
              )}
            </div>

            {/* Auth actions */}
            <div>
              {currentUser ? (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Link
                    to="/settings"
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="px-3.5 py-2 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 justify-center sm:justify-start">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/20 text-xs font-bold"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose an avatar that fits your cinema vibe:
          </p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
            {AVATAR_OPTIONS.map((em) => (
              <button
                key={em}
                onClick={() => setUserAvatar(em)}
                className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                  userAvatar === em
                    ? 'bg-purple-600 text-white scale-110 shadow-md'
                    : 'bg-slate-100 dark:bg-white/5 hover:scale-105'
                }`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mood Archetype Card */}
      {moodProfile ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-purple-900/30 border border-purple-500/20 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Your Movie Personality
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
                "{moodProfile.profile_title}"
              </h2>
            </div>
            <button
              onClick={() => navigate('/quiz')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retake / Refresh Mood
            </button>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {moodProfile.description}
          </p>

          {/* Preference Dimension Bars */}
          {moodProfile.preference_vector && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Current Mood Vector Distribution
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(moodProfile.preference_vector)
                  .filter(([_, score]) => score > 0.25)
                  .map(([dim, score]) => (
                    <div key={dim} className="space-y-1 p-3 rounded-xl bg-white/5">
                      <div className="flex justify-between items-center font-semibold">
                        <span className="capitalize text-slate-300">{dim}</span>
                        <span className="text-purple-300 font-mono">{Math.round(score * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ width: `${Math.round(score * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 rounded-3xl glass-card border border-slate-200 dark:border-white/10 text-center space-y-4">
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
            No Mood Profile Generated Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Take our 7-question interactive mood quiz to discover your movie personality archetype!
          </p>
          <button
            onClick={() => navigate('/quiz')}
            className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Take Solo Mood Quiz
          </button>
        </div>
      )}

      {/* Stats Counter */}
      <div className="grid grid-cols-2 gap-4">
        <div
          onClick={() => navigate('/favorites')}
          className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-white/10 cursor-pointer hover:border-purple-500/40 transition-colors text-center space-y-1"
        >
          <span className="font-display font-extrabold text-3xl text-rose-500">{favorites.length}</span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Favorited Titles</span>
        </div>

        <div
          onClick={() => navigate('/watchlist')}
          className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-white/10 cursor-pointer hover:border-purple-500/40 transition-colors text-center space-y-1"
        >
          <span className="font-display font-extrabold text-3xl text-purple-500">{watchlist.length}</span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">In Watchlist</span>
        </div>
      </div>
    </div>
  );
};
