import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Users, RefreshCw, Flame, Compass, Heart, Film, ArrowRight, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MovieCard } from '../components/MovieCard';
import { MoviePoster } from '../components/MoviePoster';
import { Movie, RecommendationsData } from '../types';
import { fetchRecommendations } from '../services/api';

export const Recommendations: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { moodProfile, setMoodProfile } = useApp();

  const [data, setData] = useState<RecommendationsData | null>(() => {
    return (location.state as any)?.recommendations || null;
  });
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (!data) {
      // Fetch recommendations using current moodProfile or defaults
      fetchRecommendations(undefined, moodProfile?.preference_vector)
        .then((res) => {
          setData(res);
          if (res.profile) setMoodProfile(res.profile);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [data, moodProfile]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Preparing your personalized cinema picks...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <p className="text-slate-500">No recommendations found.</p>
        <button
          onClick={() => navigate('/quiz')}
          className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-semibold"
        >
          Take the Quiz
        </button>
      </div>
    );
  }

  const profile = data.profile || moodProfile;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* 1. DECODED MOOD PROFILE BANNER */}
      {profile && (
        <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-purple-900/40 border border-purple-500/30 shadow-2xl backdrop-blur-xl overflow-hidden space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Your Mood Today
              </div>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white">
                {profile.profile_title}
              </h1>
              <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed">
                "{profile.description}"
              </p>
            </div>

            {/* Retake & Group Bridge Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <button
                onClick={() => navigate('/quiz')}
                className="px-4 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/10 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retake Quiz
              </button>
              <button
                onClick={() => navigate('/rooms/create')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-glow-pink flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                Turn Into Group Room
              </button>
            </div>
          </div>

          {/* Friendly Vibe Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block font-medium">Primary Vibe</span>
              <span className="font-bold text-purple-300 mt-0.5 block truncate">
                {profile.primary_genres.join(', ') || 'Curated'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block font-medium">Secondary Vibe</span>
              <span className="font-bold text-pink-300 mt-0.5 block truncate">
                {profile.secondary_genres.join(', ') || 'Eclectic'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block font-medium">Pace & Energy</span>
              <span className="font-bold text-cyan-300 mt-0.5 block">
                {profile.energy_level || 'Dynamic'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block font-medium">Atmosphere</span>
              <span className="font-bold text-amber-300 mt-0.5 block truncate">
                {profile.emotional_tone || 'Immersive'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. TOP PICKS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Personalized Recommendations
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Your Top Picks Tonight
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold hidden sm:block">
            Tailored to your current vibe
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {data.top_picks.slice(0, 10).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* 3. WILDCARD FEATURE CARD */}
      {data.wildcard_pick && (
        <section className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-pink-500/10 border border-amber-500/30 overflow-hidden shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-48 rounded-2xl overflow-hidden shadow-lg border-2 border-white/10 flex-shrink-0">
              <MoviePoster
                src={data.wildcard_pick.poster_path}
                title={data.wildcard_pick.title}
                year={data.wildcard_pick.year}
                category={data.wildcard_pick.category}
                genres={data.wildcard_pick.genres}
                aspectRatioClass="h-full w-full"
              />
            </div>
            <div className="space-y-3 flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 text-xs font-bold border border-amber-500/30">
                <Flame className="w-3.5 h-3.5" />
                The Wildcard Surprise Pick
              </div>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                {data.wildcard_pick.title} ({data.wildcard_pick.year})
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                Not the obvious choice, but chosen by our model to stretch your horizons. Features rich storytelling with a {data.wildcard_pick.rating} rating.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                {data.wildcard_pick.genres.map(g => (
                  <span key={g} className="text-xs px-2.5 py-1 rounded-lg bg-white/10 font-semibold">
                    {g}
                  </span>
                ))}
                {data.wildcard_pick.streaming_providers[0] && (
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-semibold">
                    Available on {data.wildcard_pick.streaming_providers[0]}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. HOLLYWOOD PICKS */}
      {data.hollywood_picks.length > 0 && (
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
              International & Mainstream
            </span>
            <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
              Hollywood Highlights
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
            {data.hollywood_picks.slice(0, 4).map((movie) => (
              <MovieCard key={movie.id} movie={movie} showMatchScore={true} />
            ))}
          </div>
        </section>
      )}

      {/* 5. BOLLYWOOD PICKS */}
      {data.bollywood_picks.length > 0 && (
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-500">
              Indian Cinema & Desi Stories
            </span>
            <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
              Bollywood Picks
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
            {data.bollywood_picks.slice(0, 4).map((movie) => (
              <MovieCard key={movie.id} movie={movie} showMatchScore={true} />
            ))}
          </div>
        </section>
      )}

      {/* 6. VINTAGE CLASSICS */}
      {data.vintage_picks.length > 0 && (
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Timeless Cinema
            </span>
            <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
              Vintage Classics
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
            {data.vintage_picks.slice(0, 4).map((movie) => (
              <MovieCard key={movie.id} movie={movie} showMatchScore={true} />
            ))}
          </div>
        </section>
      )}

      {/* 7. HIDDEN GEMS */}
      {data.hidden_gems.length > 0 && (
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              Under-the-Radar Masterpieces
            </span>
            <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
              Hidden Gems
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
            {data.hidden_gems.slice(0, 4).map((movie) => (
              <MovieCard key={movie.id} movie={movie} showMatchScore={true} />
            ))}
          </div>
        </section>
      )}

      {/* 8. SMART BRIDGE TO GROUP MATCH */}
      <section className="rounded-3xl p-8 sm:p-12 glass-card border border-purple-500/20 text-center space-y-6 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto text-2xl">
          👥
        </div>
        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Can't Decide Alone? Ask Your Friends.
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Carry your newly generated mood profile directly into a collaborative movie room. Invite friends with a simple room code and let everyone swipe!
          </p>
        </div>
        <button
          onClick={() => navigate('/rooms/create')}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-glow-purple inline-flex items-center gap-2 transition-transform hover:scale-105"
        >
          <span>Create a Group Match with My Mood</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
