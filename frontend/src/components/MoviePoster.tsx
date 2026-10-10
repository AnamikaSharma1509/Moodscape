import React, { useState } from 'react';
import { Film, Clapperboard, Sparkles } from 'lucide-react';

interface MoviePosterProps {
  src?: string | null;
  title: string;
  year?: number | string;
  category?: string;
  genres?: string[];
  className?: string;
  containerClassName?: string;
  aspectRatioClass?: string;
  loading?: 'lazy' | 'eager';
}

export const MoviePoster: React.FC<MoviePosterProps> = ({
  src,
  title,
  year,
  category,
  genres = [],
  className = '',
  containerClassName = '',
  aspectRatioClass = 'aspect-[2/3]',
  loading = 'lazy'
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If no source provided, or image URL failed to load, show beautiful styled placeholder
  const showFallback = !src || hasError;

  return (
    <div
      className={`relative w-full ${aspectRatioClass} overflow-hidden bg-gradient-to-br from-slate-900 via-[#151922] to-slate-950 select-none ${containerClassName}`}
    >
      {!showFallback ? (
        <>
          <img
            src={src}
            alt={title}
            loading={loading}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            } ${className}`}
          />
          {/* Subtle placeholder while image is in transit */}
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 animate-pulse">
              <Film className="w-8 h-8 text-slate-600" />
            </div>
          )}
        </>
      ) : (
        /* Polished neutral cinema placeholder that matches MoodScape aesthetic */
        <div className="absolute inset-0 p-4 flex flex-col justify-between bg-gradient-to-b from-purple-950/40 via-slate-900/90 to-black/95 text-white border border-white/5">
          {/* Top badge */}
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-sm">
              <Clapperboard className="w-4 h-4" />
            </div>
            {year && (
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                {year}
              </span>
            )}
          </div>

          {/* Center visual accent */}
          <div className="my-auto text-center px-2 space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600/30 to-pink-500/20 border border-white/10 flex items-center justify-center">
              <Film className="w-6 h-6 text-purple-400/80" />
            </div>
            <h4 className="font-display font-extrabold text-sm sm:text-base text-white/95 leading-snug line-clamp-3">
              {title}
            </h4>
          </div>

          {/* Bottom genre / category strip */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            {category && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block truncate">
                {category}
              </span>
            )}
            {genres.length > 0 && (
              <span className="text-[10px] text-slate-400 block truncate">
                {genres.slice(0, 2).join(' • ')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
