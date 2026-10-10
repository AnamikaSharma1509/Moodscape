import React from 'react';
import { X, Heart, Bookmark, Star, Clock, User, Tv, Play, Sparkles, HelpCircle, ExternalLink, Video } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CompatibilityBar } from './CompatibilityBar';
import { MoviePoster } from './MoviePoster';

export const MovieDetailsModal: React.FC = () => {
  const { selectedMovie, setSelectedMovie, isFavorite, toggleFavorite, isWatchlist, toggleWatchlist, setExplanationMovie } = useApp();

  if (!selectedMovie) return null;

  const favorited = isFavorite(selectedMovie.id);
  const inWatchlist = isWatchlist(selectedMovie.id);

  const netflixUrl = 'https://www.netflix.com/';
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(selectedMovie.title + ' official movie')}`;
  const trailerSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(selectedMovie.title + ' official trailer')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#12151D] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 my-auto animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Backdrop Header */}
        <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-slate-900 flex-shrink-0">
          <img
            src={selectedMovie.backdrop_path || selectedMovie.poster_path}
            alt={selectedMovie.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#12151D] via-transparent to-black/40" />

          {/* Close button */}
          <button
            onClick={() => setSelectedMovie(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Match Score Badge Floating on Banner */}
          {selectedMovie.match_score && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600/90 text-white text-xs font-bold shadow-lg backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{selectedMovie.match_score}% Match</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-24 sm:w-32 h-36 sm:h-48 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 dark:border-white/10 -mt-16 sm:-mt-24 z-10 flex-shrink-0">
              <MoviePoster
                src={selectedMovie.poster_path}
                title={selectedMovie.title}
                year={selectedMovie.year}
                category={selectedMovie.category}
                genres={selectedMovie.genres}
                aspectRatioClass="h-full w-full"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                  {selectedMovie.category}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold text-slate-500 dark:text-slate-400">
                  {selectedMovie.year}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {selectedMovie.runtime} min
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {selectedMovie.rating.toFixed(1)} ({selectedMovie.vote_count.toLocaleString()})
                </span>
              </div>

              <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white leading-tight">
                {selectedMovie.title}
              </h2>

              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Directed by <span className="text-slate-800 dark:text-slate-200 font-semibold">{selectedMovie.director}</span>
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={() => toggleFavorite(selectedMovie)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    favorited
                      ? 'bg-rose-500 text-white shadow-glow-pink'
                      : 'border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-white' : ''}`} />
                  {favorited ? 'Favorited' : 'Favorite'}
                </button>

                <button
                  onClick={() => toggleWatchlist(selectedMovie)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    inWatchlist
                      ? 'bg-purple-600 text-white shadow-glow-purple'
                      : 'border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${inWatchlist ? 'fill-white' : ''}`} />
                  {inWatchlist ? 'In Watchlist' : 'Watchlist'}
                </button>

                <button
                  onClick={() => {
                    setExplanationMovie(selectedMovie);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Why this movie?
                </button>
              </div>
            </div>
          </div>

          {/* Genres & Mood Tags */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Mood & Themes</h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedMovie.genres.map(g => (
                <span
                  key={g}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20"
                >
                  {g}
                </span>
              ))}
              {selectedMovie.mood_tags.map(t => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Plot Overview */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Synopsis</h4>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {selectedMovie.overview}
            </p>
          </div>

          {/* Cast */}
          {selectedMovie.cast && selectedMovie.cast.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Cast</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {selectedMovie.cast.join(', ')}
              </p>
            </div>
          )}

          {/* DEDICATED "WHERE TO WATCH" SECTION */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-purple-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Where to Watch & Outbound Links
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">Official External Services</span>
            </div>

            {/* Direct External Action Buttons: Netflix, YouTube Search, Official Trailer */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              {/* Netflix Button */}
              <a
                href={netflixUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#E50914] text-white hover:bg-[#b80710] shadow-md transition-all hover:scale-105"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Open Netflix</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>

              {/* YouTube Search Button */}
              <a
                href={youtubeSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FF0000] text-white hover:bg-[#cc0000] shadow-md transition-all hover:scale-105"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Search on YouTube</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>

              {/* Watch Official Trailer Button */}
              <a
                href={trailerSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-white/20 bg-white dark:bg-[#161922] text-slate-800 dark:text-slate-100 hover:border-purple-400 shadow-sm transition-all hover:scale-105"
              >
                <Play className="w-3.5 h-3.5 text-purple-500" />
                <span>Watch Official Trailer</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            </div>

            {/* Streaming Platform Badges */}
            <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Catalog Streaming Availability (India & Global)
              </span>
              {selectedMovie.streaming_providers && selectedMovie.streaming_providers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedMovie.streaming_providers.map(p => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-[#161922] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {p}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Use the Netflix or YouTube actions above to view or stream.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
