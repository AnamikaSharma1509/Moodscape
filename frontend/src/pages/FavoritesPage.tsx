import React, { useState } from 'react';
import { Heart, Bookmark, Film, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MovieCard } from '../components/MovieCard';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { favorites, watchlist } = useApp();
  const [activeTab, setActiveTab] = useState<'favorites' | 'watchlist'>('favorites');

  const displayedMovies = activeTab === 'favorites' ? favorites : watchlist;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8">
      {/* Page Title */}
      <div className="space-y-3">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
          Saved Cinema Collection
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your personal bookmarks, favorited titles, and watchlists saved across sessions.
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'favorites'
                ? 'bg-rose-500 text-white shadow-glow-pink'
                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${activeTab === 'favorites' ? 'fill-white' : ''}`} />
            <span>My Favorites ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'watchlist'
                ? 'bg-purple-600 text-white shadow-glow-purple'
                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${activeTab === 'watchlist' ? 'fill-white' : ''}`} />
            <span>My Watchlist ({watchlist.length})</span>
          </button>
        </div>
      </div>

      {/* Grid or Empty State */}
      {displayedMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {displayedMovies.map((m) => (
            <MovieCard key={m.id} movie={m} showMatchScore={false} />
          ))}
        </div>
      ) : (
        <div className="p-12 sm:p-16 rounded-3xl glass-card border border-slate-200 dark:border-white/10 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto text-2xl">
            {activeTab === 'favorites' ? '❤️' : '📑'}
          </div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
            {activeTab === 'favorites' ? 'No Favorites Saved Yet' : 'Your Watchlist is Empty'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {activeTab === 'favorites'
              ? 'Heart movies during your solo recommendations or browsing to save them here.'
              : 'Add films you want to watch soon to your personal queue.'}
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs inline-flex items-center gap-1.5"
          >
            <span>Explore Movies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
