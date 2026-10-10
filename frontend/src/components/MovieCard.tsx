import React from 'react';
import { Heart, Star, Eye, HelpCircle, Play, Video, ExternalLink } from 'lucide-react';
import { Movie } from '../types';
import { useApp } from '../context/AppContext';
import { MoviePoster } from './MoviePoster';

interface Props {
  movie: Movie;
  showMatchScore?: boolean;
}

export const MovieCard: React.FC<Props> = ({ movie, showMatchScore = false }) => {
  const { setSelectedMovie, setExplanationMovie, toggleFavorite, isFavorite } = useApp();

  const favorited = isFavorite(movie.id);

  const netflixUrl = `https://www.netflix.com/search?q=${encodeURIComponent(movie.title)}`;
  const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer')}`;

  // Friendly natural-language reason
  const moodReason = movie.explanation?.explanation_text || movie.overview;

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-white dark:bg-[#151821] border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between">
      {/* Top Media Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <MoviePoster
          src={movie.poster_path}
          title={movie.title}
          year={movie.year}
          category={movie.category}
          genres={movie.genres}
          className="group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
          <div className="px-2.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold backdrop-blur-md">
            {movie.category || movie.genres[0]}
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-[11px] font-bold">
            <Star className="w-3 h-3 fill-amber-300" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Floating Quick Action Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3.5 flex flex-col justify-end gap-2">
          {/* Natural language reason */}
          <div className="space-y-1">
            <p className="text-[11px] text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1">
              ✨ Why it fits:
            </p>
            <p className="text-white text-xs line-clamp-3 leading-relaxed">
              {moodReason}
            </p>
          </div>

          {/* Quick Actions Row */}
          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMovie(movie);
              }}
              className="flex-1 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md transition-colors cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              Details
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(movie);
              }}
              title={favorited ? 'Saved in your favorites' : 'Save movie'}
              aria-label={favorited ? 'Saved in your favorites' : 'Save movie'}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                favorited
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${favorited ? 'fill-white' : ''}`} />
            </button>

            {/* Netflix Outbound Link */}
            <a
              href={netflixUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Search on Netflix"
              className="p-2 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white shadow-md transition-transform hover:scale-105"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
            </a>

            {/* YouTube Trailer Outbound Link */}
            <a
              href={trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Watch Trailer on YouTube"
              className="p-2 rounded-xl bg-[#FF0000] hover:bg-[#cc0000] text-white shadow-md transition-transform hover:scale-105"
            >
              <Video className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Card Body Info */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span>{movie.year}</span>
            <span className="truncate max-w-[120px]">{movie.genres.slice(0, 2).join(', ')}</span>
          </div>

          <h3
            onClick={() => setSelectedMovie(movie)}
            className="font-display font-bold text-sm text-slate-900 dark:text-white line-clamp-1 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors"
          >
            {movie.title}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-snug">
            {movie.overview}
          </p>
        </div>

        {/* Card Footer Actions Strip */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-1 text-[11px]">
          <button
            onClick={() => setSelectedMovie(movie)}
            className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            View Details
          </button>

          <button
            onClick={() => toggleFavorite(movie)}
            className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
              favorited
                ? 'text-amber-500 font-bold'
                : 'text-slate-400 hover:text-amber-500'
            }`}
          >
            <Star className={`w-3 h-3 ${favorited ? 'fill-current text-amber-500' : ''}`} />
            <span>{favorited ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
