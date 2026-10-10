import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Star, X } from 'lucide-react';
import { fetchMovies, searchMovies } from '../services/api';
import { Movie } from '../types';
import { MovieCard } from '../components/MovieCard';

const CATEGORIES = ['All', 'Hollywood', 'Bollywood', 'Vintage', 'Hidden Gem'];
const GENRES = ['All', 'Action', 'Comedy', 'Drama', 'Thriller', 'Mystery', 'Horror', 'Romance', 'Sci-Fi', 'Adventure'];
const MOODS = ['All', '😱 Scary', '😂 Funny', '❤️ Romantic', '🧠 Thought-Provoking', '🔥 Intense', '🔍 Mysterious', '🌍 Adventurous', '😭 Emotional', '🌿 Relaxing', '⚡ High Energy'];

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedMood, setSelectedMood] = useState('All');
  const [minRating, setMinRating] = useState<number>(0);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  // Search or filter effect
  useEffect(() => {
    setLoading(true);
    if (query.trim().length > 0) {
      searchMovies(query)
        .then((res) => {
          let filtered = res.results;
          if (selectedCategory !== 'All') {
            filtered = filtered.filter(m => m.category.toLowerCase() === selectedCategory.toLowerCase());
          }
          if (selectedGenre !== 'All') {
            filtered = filtered.filter(m => m.genres.some(g => g.toLowerCase() === selectedGenre.toLowerCase()));
          }
          if (minRating > 0) {
            filtered = filtered.filter(m => m.rating >= minRating);
          }
          setMovies(filtered);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      fetchMovies({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        genre: selectedGenre !== 'All' ? selectedGenre : undefined,
        mood: selectedMood !== 'All' ? selectedMood : undefined,
        min_rating: minRating > 0 ? minRating : undefined,
      })
        .then((res) => {
          setMovies(res.movies);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [query, selectedCategory, selectedGenre, selectedMood, minRating]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Search Header */}
      <div className="space-y-4 max-w-2xl">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
          Explore Cinema Catalog
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Search across 10,000+ title attributes, directors, casts, moods, and curated categories.
        </p>

        {/* Search Bar Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, director, actor, or keyword..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 shadow-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Panels */}
      <div className="space-y-4 p-5 rounded-2xl glass-card border border-slate-200 dark:border-white/10 text-xs">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-400 uppercase tracking-wider mr-2">Category:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Genre Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-white/5">
          <span className="font-bold text-slate-400 uppercase tracking-wider mr-2">Genre:</span>
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                selectedGenre === g
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Mood Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-white/5">
          <span className="font-bold text-slate-400 uppercase tracking-wider mr-2">Mood:</span>
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMood(m)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                selectedMood === m
                  ? 'bg-pink-600 text-white'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
        <span>Showing {movies.length} titles</span>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} showMatchScore={false} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-2">
          <p className="text-base text-slate-600 dark:text-slate-400 font-semibold">
            No movies matched your current filters.
          </p>
          <button
            onClick={() => {
              setQuery('');
              setSelectedCategory('All');
              setSelectedGenre('All');
              setSelectedMood('All');
            }}
            className="text-xs text-purple-500 font-bold hover:underline"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
};
