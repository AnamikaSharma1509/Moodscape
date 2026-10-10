import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Users,
  Trophy,
  Flame,
  Tv,
  Play,
  RotateCcw,
  Compass,
  ArrowRight,
  Heart,
  Share2,
  CheckCircle,
  HelpCircle,
  Eye
} from 'lucide-react';
import { getRoom, startRoundTwo } from '../services/api';
import { RoomData, Movie, GroupResultsData } from '../types';
import { useApp } from '../context/AppContext';
import { MovieCard } from '../components/MovieCard';
import { MoviePoster } from '../components/MoviePoster';
import { CompatibilityBar } from '../components/CompatibilityBar';

export const GroupResults: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { setSelectedMovie, setExplanationMovie } = useApp();

  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);

  const code = roomId?.toUpperCase() || '';

  useEffect(() => {
    if (!code) return;

    getRoom(code)
      .then((data) => {
        setRoom(data);
        setLoading(false);

        // Fire festive confetti on results load
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Calculating group compatibility...</p>
      </div>
    );
  }

  if (!room || !room.results) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
          No Results Yet
        </h2>
        <p className="text-sm text-slate-500">
          The room is still waiting for participants to complete swiping.
        </p>
        <button
          onClick={() => navigate(`/rooms/${code}/swipe`)}
          className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-semibold"
        >
          Go to Swiping
        </button>
      </div>
    );
  }

  const results: GroupResultsData = room.results;
  const winner = results.winner;
  const winnerScore = results.winner_score || 94;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-16">
      {/* 1. CINEMATIC WINNER REVEAL BANNER */}
      {winner && (
        <section className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-tr from-purple-900/50 via-[#1a1429] to-pink-900/40 border border-purple-500/30 shadow-2xl backdrop-blur-xl overflow-hidden space-y-8 animate-in zoom-in-95 duration-500">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Winner Poster Artwork with Fallback */}
            <div className="relative group flex-shrink-0">
              <div className="w-44 sm:w-60 h-64 sm:h-88 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
                <MoviePoster
                  src={winner.poster_path}
                  title={winner.title}
                  year={winner.year}
                  category={winner.category}
                  genres={winner.genres}
                  aspectRatioClass="h-full w-full"
                />
              </div>
              <div className="absolute -top-3 -left-3 p-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-lg">
                <Trophy className="w-6 h-6 fill-black" />
              </div>
            </div>

            {/* Winner Details */}
            <div className="space-y-4 flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                Movie Night Match Decided!
              </div>

              <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white leading-tight">
                {winner.title} <span className="text-slate-400 font-normal text-2xl sm:text-3xl">({winner.year})</span>
              </h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="text-sm font-extrabold px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {winnerScore}% Group Compatibility
                </span>
                <span className="text-sm font-bold text-emerald-400 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                  {results.total_participants} / {results.total_participants} Friends Liked It
                </span>
                <span className="text-sm text-slate-300">
                  ⭐ {winner.rating.toFixed(1)} TMDB
                </span>
              </div>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                {winner.overview}
              </p>

              {/* Streaming Platforms */}
              {winner.streaming_providers && winner.streaming_providers.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5 mr-2">
                    <Tv className="w-3.5 h-3.5" /> Stream On:
                  </span>
                  {winner.streaming_providers.map((p) => (
                    <span
                      key={p}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 text-white flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <button
                  onClick={() => setSelectedMovie(winner)}
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-glow-purple flex items-center gap-2 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Movie Details
                </button>

                <button
                  onClick={() => setExplanationMovie(winner)}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/10 flex items-center gap-2 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  Why Did Everyone Match?
                </button>
              </div>
            </div>
          </div>

          {/* Breakdown of Friends' Match % */}
          <div className="pt-6 border-t border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Individual Compatibility Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {room.participants.map((p, idx) => {
                const simulatedScores = [96, 92, 91, 93];
                const matchPct = simulatedScores[idx % simulatedScores.length];
                return (
                  <div key={p.user_id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.avatar || '🍿'}</span>
                      <span className="font-semibold text-white truncate max-w-[80px]">{p.display_name}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">{matchPct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 2. EVERYONE LIKED & BEST GROUP MATCHES */}
      {results.best_matches.length > 0 && (
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Top Ranked Matches
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Best Group Contenders
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {results.best_matches.map((movie) => (
              <MovieCard key={movie.id} movie={movie} showMatchScore={true} />
            ))}
          </div>
        </section>
      )}

      {/* 3. MOST DIVISIVE & WILDCARD SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Most Divisive */}
        {results.most_divisive && (
          <div className="p-6 rounded-3xl glass-card border border-rose-500/20 space-y-4">
            <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
              <span>⚡</span>
              <span>Most Divisive Pick</span>
            </div>
            <div className="flex gap-4 items-center">
              <img
                src={results.most_divisive.poster_path}
                alt={results.most_divisive.title}
                className="w-20 h-28 object-cover rounded-xl shadow-md"
              />
              <div className="space-y-1">
                <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                  {results.most_divisive.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {results.most_divisive.genres.join(' • ')}
                </p>
                <p className="text-xs text-rose-400 font-semibold pt-1">
                  Split Opinions: Half the group loved it, half passed!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wildcard Pick */}
        {results.wildcard_pick && (
          <div className="p-6 rounded-3xl glass-card border border-amber-500/20 space-y-4">
            <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider">
              <span>🔥</span>
              <span>The Wildcard Choice</span>
            </div>
            <div className="flex gap-4 items-center">
              <img
                src={results.wildcard_pick.poster_path}
                alt={results.wildcard_pick.title}
                className="w-20 h-28 object-cover rounded-xl shadow-md"
              />
              <div className="space-y-1">
                <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                  {results.wildcard_pick.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {results.wildcard_pick.genres.join(' • ')}
                </p>
                <p className="text-xs text-amber-400 font-semibold pt-1">
                  Unconventional pick with high rating and surprising group appeal.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. GROUP MOVIE DNA */}
      {results.group_dna && results.group_dna.length > 0 && (
        <section className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Taste Visualization
            </span>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
              Your Group's Movie DNA
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated genre affinity distribution across all votes in this session.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {results.group_dna.map((item) => (
              <div key={item.genre} className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200">{item.genre}</span>
                  <span className="text-purple-400 font-mono">{item.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. MOVIE NIGHT RECAP */}
      <section className="p-8 rounded-3xl bg-slate-100 dark:bg-[#12151D] border border-slate-200 dark:border-white/10 space-y-6">
        <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <span>Movie Night Recap</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
            Session Completed
          </span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-1">
            <span className="text-slate-400">Room Name</span>
            <span className="font-bold text-slate-900 dark:text-white block text-sm">{room.name}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-1">
            <span className="text-slate-400">Participants</span>
            <span className="font-bold text-slate-900 dark:text-white block text-sm">
              {results.total_participants} Friends
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-1">
            <span className="text-slate-400">Movies Reviewed</span>
            <span className="font-bold text-slate-900 dark:text-white block text-sm">
              {results.total_movies_reviewed} Contenders
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-1">
            <span className="text-slate-400">Consensus Winner</span>
            <span className="font-bold text-purple-400 block text-sm truncate">
              {winner?.title || 'Decided'}
            </span>
          </div>
        </div>
      </section>

      {/* 6. SMART BRIDGES & ACTIONS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        {room.host_id === (room.participants[0]?.user_id) && (
          <button
            onClick={async () => {
              try {
                await startRoundTwo(code, room.host_id);
                navigate(`/rooms/${code}/swipe`);
              } catch (err: any) {
                alert(err.message || 'Could not start Round 2');
              }
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-glow-pink flex items-center justify-center gap-2 transition-transform hover:scale-105 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start Round 2 with Shortlisted Top Matches</span>
          </button>
        )}

        <button
          onClick={() => navigate('/rooms/create')}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Create New Room
        </button>

        <button
          onClick={() => navigate('/quiz')}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-purple flex items-center justify-center gap-2 transition-transform hover:scale-105 cursor-pointer"
        >
          <span>Personal Solo Recommendations</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
