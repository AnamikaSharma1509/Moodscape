import React from 'react';
import { X, Sparkles, Film, Heart, CheckCircle2, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MoviePoster } from './MoviePoster';

export const WhyThisMovieModal: React.FC = () => {
  const { explanationMovie, setExplanationMovie } = useApp();

  if (!explanationMovie) return null;

  const exp = explanationMovie.explanation || {
    explanation_text: 'Strongly matches your mood preference profile and storytelling taste.'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 dark:border-white/10 text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => setExplanationMovie(null)}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-200/50 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-purple-600 dark:text-purple-400">
              Personalized Cinema Match
            </span>
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              Why This Fits Your Mood
            </h3>
          </div>
        </div>

        {/* Movie Info Snippet with Robust MoviePoster */}
        <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 mb-6">
          <div className="w-14 h-20 rounded-xl overflow-hidden shadow-md flex-shrink-0">
            <MoviePoster
              src={explanationMovie.poster_path}
              title={explanationMovie.title}
              year={explanationMovie.year}
              category={explanationMovie.category}
              genres={explanationMovie.genres}
              aspectRatioClass="h-full w-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-base text-slate-900 dark:text-white truncate">
              {explanationMovie.title} ({explanationMovie.year})
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {explanationMovie.genres.join(' • ')}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                Top Recommendation
              </span>
              <span className="text-xs text-slate-400">⭐ {explanationMovie.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Natural Language Mood Fit Explanation */}
        <div className="mb-6 p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-900/20 border border-purple-500/15 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Mood Alignment
          </span>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
            "{exp.explanation_text}"
          </p>
        </div>

        {/* Friendly Cinematic Vibe Highlights (Replaces technical formulas/TF-IDF) */}
        <div className="space-y-2.5 mb-6 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Story & Atmosphere
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Matches your current tone
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-500" />
              Genre Alignment
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {explanationMovie.genres.slice(0, 2).join(' & ')}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-pink-500" />
              Mood Tags
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {explanationMovie.mood_tags.slice(0, 2).join(', ')}
            </span>
          </div>
        </div>

        {/* Bottom Close Button */}
        <button
          onClick={() => setExplanationMovie(null)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-glow-purple transition-transform hover:scale-[1.01] cursor-pointer"
        >
          Explore Movies
        </button>
      </div>
    </div>
  );
};
