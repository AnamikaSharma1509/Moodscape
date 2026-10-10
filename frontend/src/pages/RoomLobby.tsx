import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Copy,
  Share2,
  Users,
  Check,
  Play,
  Crown,
  Clock,
  Sparkles,
  UserCheck,
  UserX,
  AlertCircle,
  Share
} from 'lucide-react';
import { getRoom, toggleReady, startRoom, approveRoomAccess, denyRoomAccess } from '../services/api';
import { RoomData } from '../types';
import { useApp } from '../context/AppContext';

export const RoomLobby: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { userId } = useApp();

  const [room, setRoom] = useState<RoomData | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const code = roomId?.toUpperCase() || '';

  // Poll room state every 1.5 seconds to sync members, pending requests, and start triggers
  useEffect(() => {
    if (!code) return;

    let isMounted = true;

    const poll = async () => {
      try {
        const data = await getRoom(code, userId);
        if (!isMounted) return;
        setRoom(data);
        setLoading(false);

        const isParticipant = data.participants.some(p => p.user_id === userId);
        if (!isParticipant) {
          navigate(`/rooms/join?code=${code}`);
          return;
        }

        // If session started, route to swipe
        if (data.status === 'VOTING') {
          navigate(`/rooms/${code}/swipe`);
        } else if (data.status === 'RESULTS') {
          navigate(`/rooms/${code}/results`);
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn('Lobby fetch error:', err);
        setLoading(false);
      }
    };

    poll();
    const interval = setInterval(poll, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [code, userId, navigate]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const inviteUrl = `${window.location.origin}/rooms/join?code=${code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const roomTitle = room?.name ? `"${room.name}"` : 'Movie Night';
    const text = `🍿 Join our MoodScape movie room: ${roomTitle}!\n\nRoom Code: ${code}\nLink: ${inviteUrl}\n\nSwipe movies together, find matches, and decide what to watch tonight!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `MoodScape Movie Room: ${room?.name || code}`,
          text: `Join my MoodScape movie session! Open this link:`,
          url: inviteUrl
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleToggleReady = async () => {
    if (!code) return;
    try {
      const updated = await toggleReady(code, userId);
      setRoom(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartSession = async () => {
    if (!code || !room) return;
    try {
      const updated = await startRoom(code, room.host_id);
      setRoom(updated);
      navigate(`/rooms/${code}/swipe`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to start session. Ensure you are the room host.');
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!room) return;
    try {
      const updated = await approveRoomAccess(code, room.host_id, requestId);
      setRoom(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to approve request');
    }
  };

  const handleDeny = async (requestId: string) => {
    if (!room) return;
    try {
      const updated = await denyRoomAccess(code, room.host_id, requestId);
      setRoom(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to deny request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Connecting to room lobby...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Room Not Found</h2>
        <p className="text-sm text-slate-500">The room code {code} could not be found or has expired.</p>
        <button
          onClick={() => navigate('/rooms')}
          className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-semibold"
        >
          Back to Rooms
        </button>
      </div>
    );
  }

  const isHost = room.host_id === userId || room.participants[0]?.user_id === userId;
  const myParticipant = room.participants.find(p => p.user_id === userId);
  const readyCount = room.participants.filter(p => p.is_ready).length;
  const pendingRequests = room.access_requests?.filter(r => r.status === 'PENDING') || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Lobby Hero Box */}
      <div className="relative rounded-3xl p-6 sm:p-10 glass-card border border-purple-500/20 shadow-2xl text-center space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 text-xs font-bold border border-purple-500/20">
            <Users className="w-3.5 h-3.5" />
            Lobby • {room.participants.length} / {room.max_participants || 8} Participants
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
            {room.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Hosted by <span className="font-bold text-slate-800 dark:text-slate-200">{room.host_name || 'Host'}</span>
          </p>
        </div>

        {/* Big Room Code & Share Controls Box */}
        <div className="max-w-xl mx-auto p-4 sm:p-5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Shareable Room Code
            </span>
            <span className="font-mono font-extrabold text-2xl sm:text-3xl tracking-widest text-purple-600 dark:text-purple-300">
              {room.code}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? 'Copied Code' : 'Copy Code'}
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy direct invite link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              {copiedLink ? 'Link Copied!' : 'Copy Link'}
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Share on WhatsApp"
            >
              WhatsApp
            </button>

            <button
              onClick={handleNativeShare}
              className="p-2 rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Share Invitation"
            >
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Clock className="w-4 h-4 text-purple-400 animate-spin" />
          <span>{readyCount} of {room.participants.length} members ready</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* PENDING ACCESS REQUESTS SECTION FOR HOST */}
      {isHost && pendingRequests.length > 0 && (
        <div className="p-6 rounded-3xl glass-card border border-amber-500/30 bg-amber-500/5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Pending Access Requests ({pendingRequests.length})
              </h2>
            </div>
            <span className="text-[11px] text-amber-500 font-semibold">Action Required</span>
          </div>

          <div className="space-y-2.5">
            {pendingRequests.map((req) => (
              <div
                key={req.request_id}
                className="p-3.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{req.avatar || '🍿'}</span>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                      {req.display_name}
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      {req.mood_title || 'Requesting entry'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(req.request_id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleDeny(req.request_id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-rose-500/20 text-slate-700 dark:text-slate-300 hover:text-rose-400 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Participants Grid */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <span>In the Room</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-bold">
            {room.participants.length}
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {room.participants.map((p, idx) => (
            <div
              key={p.user_id || idx}
              className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 shadow-sm hover:border-purple-500/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  {p.avatar || '🍿'}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {p.display_name} {p.user_id === userId ? '(You)' : ''}
                    </h3>
                    {p.is_host && (
                      <span title="Room Host">
                        <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 block line-clamp-1">
                    {p.mood_title || 'Movie Fan'}
                  </span>
                </div>
              </div>

              <div>
                {p.is_ready ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ready
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-white/10 text-slate-500 text-xs font-semibold">
                    Waiting
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Host / Ready Controls Bar */}
      <div className="p-6 rounded-3xl glass-card border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {isHost ? 'You are the Host' : 'Waiting for Host to start'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isHost
              ? 'When your friends are ready, press Start Swiping Session to generate candidate movie deck.'
              : 'Mark yourself ready and wait for the host to launch the swiping session.'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isHost && (
            <button
              onClick={handleToggleReady}
              className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                myParticipant?.is_ready
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white hover:bg-slate-300'
              }`}
            >
              {myParticipant?.is_ready ? '✓ I am Ready' : 'Mark as Ready'}
            </button>
          )}

          {isHost && (
            <button
              onClick={handleStartSession}
              className="flex-1 sm:flex-initial px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-glow-purple flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Swiping Session</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
