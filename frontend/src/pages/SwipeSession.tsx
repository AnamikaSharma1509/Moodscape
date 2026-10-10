import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, AnimatePresence, Variants } from 'framer-motion';
import { X, Heart, Star, Sparkles, Clock, CheckCircle2, Tv, Users, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { getRoom, submitVote } from '../services/api';
import { RoomData, Movie, VoteType } from '../types';
import { useApp } from '../context/AppContext';
import { MoviePoster } from '../components/MoviePoster';

export const SwipeSession: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { userId, toggleFavorite, isFavorite } = useApp();

  const [room, setRoom] = useState<RoomData | null>(null);
  const [deck, setDeck] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votedCount, setVotedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastVoteFeedback, setLastVoteFeedback] = useState<string | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);

  const code = roomId?.toUpperCase() || '';

  // Polling room data
  useEffect(() => {
    if (!code) return;

    let isMounted = true;

    const fetchState = async () => {
      try {
        const data = await getRoom(code, userId);
        if (!isMounted) return;
        setRoom(data);

        if (data.deck && data.deck.length > 0) {
          // If deck is new or round updated
          if (deck.length === 0 || data.deck.length !== deck.length || data.deck[0]?.id !== deck[0]?.id) {
            setDeck(data.deck);
            const votedIds = Object.keys(data.my_votes || {}).map(Number);
            setVotedCount(votedIds.length);
            setCurrentIndex(votedIds.length);
          } else {
            // Guard against resetting currentIndex backwards if user swiped ahead optimistically
            const serverVotedCount = Object.keys(data.my_votes || {}).length;
            if (serverVotedCount > currentIndex) {
              setCurrentIndex(serverVotedCount);
              setVotedCount(serverVotedCount);
            }
          }
        }

        if (data.status === 'RESULTS') {
          navigate(`/rooms/${code}/results`);
        }
        setLoading(false);
      } catch (err) {
        console.warn('Swipe fetch error:', err);
        setLoading(false);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [code, userId, deck, currentIndex, navigate]);

  // Motion drag values
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacityNope = useTransform(x, [-120, -30], [1, 0]);
  const opacityLike = useTransform(x, [30, 120], [0, 1]);

  const currentMovie = deck[currentIndex];

  const handleVote = async (voteType: VoteType) => {
    if (!currentMovie || !code || isSubmittingVote) return;

    const direction: 'left' | 'right' = voteType === 'DISLIKE' ? 'left' : 'right';
    setExitDirection(direction);
    setIsSubmittingVote(true);
    setVoteError(null);

    // Feedback pill
    setLastVoteFeedback(voteType === 'SUPERLIKE' ? '⭐ SUPER LIKED!' : voteType === 'LIKE' ? '❤️ LIKED!' : '❌ PASSED');
    setTimeout(() => setLastVoteFeedback(null), 1200);

    const votedMovieId = currentMovie.id;

    // Advance card optimistically so single click smoothly slides card away without lag
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    setVotedCount(prev => prev + 1);

    // Reset motion x for next card
    x.set(0);

    // Submit to server asynchronously
    submitVote(code, userId, votedMovieId, voteType)
      .then(updated => {
        setRoom(updated);
        if (updated.status === 'RESULTS') {
          navigate(`/rooms/${code}/results`);
        }
      })
      .catch(err => {
        console.error('Vote submission error:', err);
        setVoteError('Failed to record your vote. Please check your connection.');
      })
      .finally(() => {
        setTimeout(() => {
          setIsSubmittingVote(false);
          setExitDirection(null);
        }, 250);
      });
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentIndex >= deck.length || isSubmittingVote) return;
      if (e.key === 'ArrowLeft') {
        handleVote('DISLIKE');
      } else if (e.key === 'ArrowRight') {
        handleVote('LIKE');
      } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (currentMovie) {
          const wasFav = isFavorite(currentMovie.id);
          toggleFavorite(currentMovie);
          setLastVoteFeedback(!wasFav ? '⭐ SAVED TO FAVORITES!' : 'REMOVED FROM FAVORITES');
          setTimeout(() => setLastVoteFeedback(null), 1200);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, deck.length, isSubmittingVote, currentMovie, isFavorite, toggleFavorite]);


  const isFinishedVoting = deck.length > 0 && currentIndex >= deck.length;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading movie swipe deck...</p>
      </div>
    );
  }

  // Waiting Room state if user finished their votes but others are still swiping
  if (isFinishedVoting) {
    const participants = room?.participants || [];
    const votingProgress = room?.voting_progress || {};
    const finishedCount = Object.values(votingProgress).filter(p => p.has_finished).length;

    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-8 animate-in fade-in duration-300">
        <div className="relative mx-auto w-20 h-20">
          <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-glow-purple flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            You've Finished Swiping!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your votes are locked in privately. Waiting for other friends in the room to finish.
          </p>
        </div>

        {/* Live Group Progress */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-4 text-left">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Group Progress</span>
            <span className="text-purple-400 font-mono">
              {finishedCount} / {participants.length} finished
            </span>
          </div>

          <div className="space-y-3">
            {participants.map((p) => {
              const pProg = votingProgress[p.user_id];
              const isDone = pProg?.has_finished || false;
              return (
                <div key={p.user_id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{p.avatar || '🍿'}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {p.display_name} {p.user_id === userId ? '(You)' : ''}
                    </span>
                  </div>
                  <div>
                    {isDone ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                        ✓ Finished
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-medium animate-pulse">
                        Swiping ({pProg?.voted_count || 0}/{deck.length})...
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => navigate(`/rooms/${code}/results`)}
          className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold cursor-pointer"
        >
          View live results (or waiting for sync)
        </button>
      </div>
    );
  }

  const cardVariants: Variants = {
    enter: { scale: 0.95, opacity: 0, y: 15 },
    center: { scale: 1, opacity: 1, y: 0, x: 0, rotate: 0 },
    exit: (dir: 'left' | 'right' | null) => ({
      x: dir === 'left' ? -600 : dir === 'right' ? 600 : 0,
      opacity: 0,
      rotate: dir === 'left' ? -22 : dir === 'right' ? 22 : 0,
      transition: { duration: 0.28, ease: 'easeOut' as const }
    })
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 sm:py-8 space-y-6 select-none">
      {/* Top Navigation & Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <button
            onClick={() => navigate(`/rooms/${code}`)}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Lobby
          </button>

          <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
            Movie {currentIndex + 1} of {deck.length} {room?.round && room.round > 1 ? `(Round ${room.round})` : ''}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 transition-all duration-300"
            style={{ width: `${Math.round(((currentIndex) / Math.max(1, deck.length)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Vote Error Alert */}
      {voteError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{voteError}</span>
          </div>
          <button
            onClick={() => handleVote('LIKE')}
            className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Fixed Height Feedback Slot - Zero Layout Shift / No Vertical Bounce */}
      <div className="h-8 flex items-center justify-center">
        {lastVoteFeedback ? (
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-white dark:bg-white/10 shadow-lg text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 animate-pulse">
            {lastVoteFeedback}
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 font-medium">
            Swipe right or tap Like • Swipe left or tap Pass
          </span>
        )}
      </div>

      {/* SWIPE CARD DECK CONTAINER */}
      <div className="relative aspect-[3/4.2] w-full max-w-sm mx-auto">
        <AnimatePresence custom={exitDirection}>
          {currentMovie && (
            <motion.div
              key={currentMovie.id}
              custom={exitDirection}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ x, rotate }}
              drag={isSubmittingVote ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100) {
                  handleVote('LIKE');
                } else if (info.offset.x < -100) {
                  handleVote('DISLIKE');
                }
              }}
              className="absolute inset-0 rounded-3xl overflow-hidden glass-card border border-white/20 dark:border-white/10 shadow-2xl cursor-grab active:cursor-grabbing bg-slate-900"
            >
              {/* Movie Poster Artwork with Reliable Fallback */}
              <div className="absolute inset-0 pointer-events-none">
                <MoviePoster
                  src={currentMovie.poster_path}
                  title={currentMovie.title}
                  year={currentMovie.year}
                  category={currentMovie.category}
                  genres={currentMovie.genres}
                  aspectRatioClass="h-full w-full"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Gradient Backdrop */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />

              {/* SWIPE STAMP OVERLAYS */}
              <motion.div
                style={{ opacity: opacityLike }}
                className="absolute top-8 left-8 border-4 border-emerald-400 text-emerald-400 font-extrabold text-3xl px-4 py-1.5 rounded-xl uppercase tracking-wider rotate-[-15deg] pointer-events-none drop-shadow-lg"
              >
                LIKE
              </motion.div>

              <motion.div
                style={{ opacity: opacityNope }}
                className="absolute top-8 right-8 border-4 border-rose-500 text-rose-500 font-extrabold text-3xl px-4 py-1.5 rounded-xl uppercase tracking-wider rotate-[15deg] pointer-events-none drop-shadow-lg"
              >
                NOPE
              </motion.div>

              {/* Match Score Floating Badge */}
              {currentMovie.match_score && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-purple-600/90 text-white text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{currentMovie.match_score}% Group Fit</span>
                </div>
              )}

              {/* Movie Info at Bottom */}
              <div className="absolute bottom-0 inset-x-0 p-5 space-y-2 text-white">
                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                  <span>{currentMovie.year}</span>
                  <span>•</span>
                  <span className="font-semibold text-purple-300">{currentMovie.genres.join(' · ')}</span>
                  <span>•</span>
                  <span className="text-amber-300 font-bold">⭐ {currentMovie.rating.toFixed(1)}</span>
                </div>

                <h3 className="font-display font-bold text-2xl text-white leading-tight">
                  {currentMovie.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {currentMovie.overview}
                </p>

                {/* Mood Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentMovie.mood_tags.map(t => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md text-white font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SWIPE CONTROLS BUTTONS */}
      <div className="flex items-center justify-center gap-5 pt-2">
        {/* Pass Button */}
        <button
          onClick={() => handleVote('DISLIKE')}
          disabled={isSubmittingVote}
          className="w-14 h-14 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-rose-500 hover:text-white text-rose-500 border border-slate-200 dark:border-white/10 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-40"
          aria-label="Pass / Reject"
          title="Arrow Left"
        >
          <X className="w-7 h-7" />
        </button>

        {/* Independent Personal Saved/Favorites Star Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!currentMovie) return;
            const wasFav = isFavorite(currentMovie.id);
            toggleFavorite(currentMovie);
            setLastVoteFeedback(!wasFav ? '⭐ SAVED TO FAVORITES!' : 'REMOVED FROM FAVORITES');
            setTimeout(() => setLastVoteFeedback(null), 1200);
          }}
          className={`w-12 h-12 rounded-full border shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
            isFavorite(currentMovie.id)
              ? 'bg-amber-500 text-white border-amber-400 shadow-amber-500/30'
              : 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-slate-300 hover:text-amber-500 hover:bg-amber-500/20 border-slate-200 dark:border-white/10'
          }`}
          aria-label={isFavorite(currentMovie.id) ? "Remove from Saved Movies" : "Save to Favorites"}
          title={isFavorite(currentMovie.id) ? "Saved in your favorites" : "Save to personal favorites"}
        >
          <Star className={`w-5 h-5 ${isFavorite(currentMovie.id) ? 'fill-white text-white' : 'stroke-current'}`} />
        </button>

        {/* Like Button */}
        <button
          onClick={() => handleVote('LIKE')}
          disabled={isSubmittingVote}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-glow-purple flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-40"
          aria-label="Like"
          title="Arrow Right"
        >
          <Heart className="w-7 h-7 fill-white" />
        </button>
      </div>

      {/* Keyboard Helper */}
      <div className="text-center text-[11px] text-slate-400 font-medium">
        Use keyboard: <span className="font-bold text-slate-300">← Pass</span> • <span className="font-bold text-slate-300">S / Space Save to Favorites</span> • <span className="font-bold text-slate-300">Like →</span>
      </div>
    </div>
  );
};
