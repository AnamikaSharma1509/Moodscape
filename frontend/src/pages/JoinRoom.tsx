import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, KeyRound, User, ArrowRight, Clock, CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import { getRoom, joinRoom, requestRoomAccess } from '../services/api';
import { useApp } from '../context/AppContext';
import { RoomData } from '../types';

const AVATAR_OPTIONS = ['🍿', '👩‍💻', '✨', '🍕', '🎭', '🦁', '🚀', '🎮', '🍩', '🥑'];

export const JoinRoom: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userName, userAvatar, userId, moodProfile } = useApp();

  const queryCode = searchParams.get('code') || '';
  const [code, setCode] = useState(queryCode.toUpperCase());
  const [displayName, setDisplayName] = useState(userName || '');
  const [avatar, setAvatar] = useState(userAvatar || '🍿');
  const [resolvedRoom, setResolvedRoom] = useState<RoomData | null>(null);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If code in query param, resolve room details immediately
  useEffect(() => {
    if (code.trim()) {
      sessionStorage.setItem('moodscape_pending_room', code.trim().toUpperCase());
      getRoom(code.trim().toUpperCase(), userId)
        .then((room) => {
          setResolvedRoom(room);
          // Check if already participant
          if (room.participants.some(p => p.user_id === userId)) {
            navigate(`/rooms/${room.code}`);
          }
          // Check if user already has a pending request
          const myPending = room.access_requests?.some(r => r.user_id === userId && r.status === 'PENDING');
          if (myPending) {
            setIsPendingApproval(true);
          }
        })
        .catch(() => {
          // ignore until user submits
        });
    }
  }, [code, userId, navigate]);

  // Poll room status if waiting for host approval
  useEffect(() => {
    if (!isPendingApproval || !code) return;

    const interval = setInterval(async () => {
      try {
        const room = await getRoom(code, userId);
        const isApproved = room.participants.some(p => p.user_id === userId);
        if (isApproved) {
          clearInterval(interval);
          navigate(`/rooms/${code}`);
        }
      } catch (err) {
        console.warn('Poll approval error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isPendingApproval, code, userId, navigate]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !displayName.trim()) return;

    setErrorMsg('');
    setIsSubmitting(true);
    const formattedCode = code.trim().toUpperCase();

    try {
      // 1. Resolve room
      const room = await getRoom(formattedCode, userId);
      setResolvedRoom(room);

      // Check if already a participant
      if (room.participants.some(p => p.user_id === userId)) {
        navigate(`/rooms/${formattedCode}`);
        return;
      }

      // Check capacity
      if (room.participants.length >= room.max_participants) {
        setErrorMsg('This room is already at maximum capacity.');
        setIsSubmitting(false);
        return;
      }

      // 2. If room requires approval, submit access request
      if (room.access_type === 'approval_required') {
        const reqRes = await requestRoomAccess(formattedCode, {
          user_id: userId,
          display_name: displayName,
          avatar,
          preference_vector: moodProfile ? moodProfile.preference_vector : undefined,
          mood_title: moodProfile ? moodProfile.profile_title : undefined
        });

        if (reqRes.status === 'JOINED') {
          navigate(`/rooms/${formattedCode}`);
        } else {
          setIsPendingApproval(true);
        }
      } else {
        // Direct join
        await joinRoom(formattedCode, {
          display_name: displayName,
          user_id: userId,
          avatar,
          preference_vector: moodProfile ? moodProfile.preference_vector : undefined,
          mood_title: moodProfile ? moodProfile.profile_title : undefined
        });
        navigate(`/rooms/${formattedCode}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Room code not found or expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // State: Waiting for Host Approval Screen
  if (isPendingApproval) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg">
          <Clock className="w-8 h-8 animate-spin" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
            Request Sent
          </span>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
            Waiting for Host Approval
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Your request to join <span className="font-semibold text-slate-800 dark:text-slate-200">"{resolvedRoom?.name || code}"</span> has been delivered to the host. You will automatically be taken into the lobby once approved!
          </p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-white/10 text-xs text-slate-400 space-y-1">
          <p className="font-mono font-bold text-purple-400">{code}</p>
          <p>Host: {resolvedRoom?.host_name || 'Host'}</p>
        </div>

        <button
          onClick={() => navigate('/rooms')}
          className="text-xs font-semibold text-slate-400 hover:text-slate-200"
        >
          Cancel and return to rooms
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-16 space-y-8">
      <button
        onClick={() => navigate('/rooms')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Rooms
      </button>

      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-white/10 shadow-xl space-y-6">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-300 border border-pink-500/20 flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
            Join Movie Room
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter the room code shared by your friend to jump into the collaborative movie deck.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs text-center font-semibold flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-5">
          {/* Room Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Room Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. MOOD-7K9X"
              required
              className="w-full px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-center text-lg font-mono font-bold tracking-widest uppercase focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Your Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Rahul"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Avatar Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Choose Avatar
            </label>
            <div className="flex flex-wrap gap-2 justify-center">
              {AVATAR_OPTIONS.map((em) => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setAvatar(em)}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                    avatar === em
                      ? 'bg-pink-500/20 border-2 border-pink-500 scale-110 shadow-glow-pink'
                      : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:scale-105'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm shadow-glow-pink flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Verifying Room...' : 'Enter or Request Access'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
