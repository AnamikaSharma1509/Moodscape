import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Sparkles, Sliders, Check, Lock, Unlock, Globe } from 'lucide-react';
import { createRoom } from '../services/api';
import { useApp } from '../context/AppContext';

export const CreateRoom: React.FC = () => {
  const navigate = useNavigate();
  const { userName, userId, moodProfile } = useApp();

  const [roomName, setRoomName] = useState('Friday Movie Night');
  const [hostName, setHostName] = useState(userName || 'Host');
  const [movieCount, setMovieCount] = useState<number>(20);
  const [minRating, setMinRating] = useState<number>(7.0);
  const [accessType, setAccessType] = useState<string>('approval_required');
  const [maxParticipants, setMaxParticipants] = useState<number>(8);
  const [isDiscoverable, setIsDiscoverable] = useState<boolean>(true);
  const [includeMoodProfile, setIncludeMoodProfile] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !hostName.trim()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await createRoom({
        room_name: roomName.trim(),
        host_name: hostName.trim(),
        host_id: userId,
        movie_count: movieCount,
        min_rating: minRating,
        access_type: accessType,
        max_participants: maxParticipants,
        is_discoverable: isDiscoverable,
        host_preference_vector: includeMoodProfile && moodProfile ? moodProfile.preference_vector : undefined,
        host_mood_title: includeMoodProfile && moodProfile ? moodProfile.profile_title : undefined
      });

      navigate(`/rooms/${res.room_code}`);
    } catch (err: any) {
      console.error('Error creating room:', err);
      setErrorMessage(err.message || 'Failed to create room. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-14 space-y-8">
      {/* Top back */}
      <button
        onClick={() => navigate('/rooms')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Rooms
      </button>

      {/* Main Form Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-white/10 shadow-xl space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 text-xs font-bold border border-purple-500/20">
            <Users className="w-3.5 h-3.5" />
            Host Setup
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Create Your Movie Room
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure your movie session settings, deck size, and access permissions.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Room Name
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g. Friday Movie Night"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Host Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Your Display Name (Host)
            </label>
            <input
              type="text"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Access Privacy Setting */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Access & Privacy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccessType('approval_required')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  accessType === 'approval_required'
                    ? 'border-purple-500 bg-purple-500/10 shadow-glow-purple'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Approval Required</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Friends request access and you approve each one before they enter.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAccessType('public_open')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  accessType === 'public_open'
                    ? 'border-purple-500 bg-purple-500/10 shadow-glow-purple'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Unlock className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Direct Join</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Anyone with the link or code enters lobby immediately.
                </p>
              </button>
            </div>
          </div>

          {/* Max Participants & Deck Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Participant Capacity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[4, 8, 12].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setMaxParticipants(num)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                      maxParticipants === num
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {num} Max
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Movie Deck Size
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 20, 25, 30].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setMovieCount(num)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                      movieCount === num
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {num} Cards
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Quality Filter (Minimum TMDB Rating)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Any (6.0+)', val: 6.0 },
                { label: 'Good (7.0+)', val: 7.0 },
                { label: 'Great (8.0+)', val: 8.0 }
              ].map((item) => (
                <button
                  type="button"
                  key={item.val}
                  onClick={() => setMinRating(item.val)}
                  className={`py-3 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
                    minRating === item.val
                      ? 'bg-purple-600 text-white border-purple-600 shadow-glow-purple'
                      : 'border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Public Discovery Toggle */}
          <div
            onClick={() => setIsDiscoverable(!isDiscoverable)}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Discoverable Room
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Show this room on the public discovery hub so others can discover and request to join.
              </p>
            </div>
            <div
              className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                isDiscoverable
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'border-slate-400 dark:border-white/20'
              }`}
            >
              {isDiscoverable && <Check className="w-4 h-4" />}
            </div>
          </div>

          {/* Link Solo Mood Profile toggle */}
          {moodProfile && (
            <div
              onClick={() => setIncludeMoodProfile(!includeMoodProfile)}
              className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Apply My Saved Mood Profile
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Influence the candidate deck using your profile: "{moodProfile.profile_title}"
                </p>
              </div>

              <div
                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                  includeMoodProfile
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'border-slate-400 dark:border-white/20'
                }`}
              >
                {includeMoodProfile && <Check className="w-4 h-4" />}
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-glow-purple transition-all duration-200 cursor-pointer"
          >
            {isSubmitting ? 'Creating Room...' : 'Create Room & Enter Lobby'}
          </button>
        </form>
      </div>
    </div>
  );
};
