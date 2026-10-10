import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  KeyRound,
  Sparkles,
  Flame,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Compass,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';
import { getDemoRoom, fetchDiscoverableRooms } from '../services/api';
import { DiscoverableRoom } from '../types';

export const RoomsHub: React.FC = () => {
  const navigate = useNavigate();
  const [discoverableRooms, setDiscoverableRooms] = useState<DiscoverableRoom[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  const loadRooms = () => {
    setIsLoadingRooms(true);
    fetchDiscoverableRooms()
      .then((rooms) => {
        setDiscoverableRooms(rooms);
        setIsLoadingRooms(false);
      })
      .catch((err) => {
        console.warn('Failed to load discoverable rooms:', err);
        setIsLoadingRooms(false);
      });
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleLaunchDemo = async () => {
    try {
      const demo = await getDemoRoom();
      navigate(`/rooms/${demo.code}/results`);
    } catch (err) {
      console.error(err);
      navigate('/rooms/MOOD-DEMO/results');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-300 text-xs font-bold border border-pink-500/20">
          <Users className="w-4 h-4" />
          Collaborative Social Movie Night
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 dark:text-white leading-tight">
          Watch With Friends. <span className="text-gradient-brand">Zero Arguments.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          Create a private room, invite friends, swipe independently, and let our group compatibility algorithm settle what everyone actually agrees on.
        </p>
      </div>

      {/* Main Choice Cards: Create vs Join */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create Room Card */}
        <div className="p-8 sm:p-10 rounded-3xl glass-card border border-purple-500/20 hover:border-purple-500/40 shadow-xl flex flex-col justify-between space-y-6 group transition-all duration-300">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 flex items-center justify-center">
              <Plus className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Host a Session
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Create a Movie Room
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Configure session preferences, choose movie pool size and privacy. You’ll receive a unique code and shareable URL for your friends.
            </p>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Customizable candidate deck size (10-20 movies)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Access approval controls to protect your private group
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Blind voting with consensus results and Round 2 playoffs
              </li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/rooms/create')}
            className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-glow-purple flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Create New Room</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Join Room Card */}
        <div className="p-8 sm:p-10 rounded-3xl glass-card border border-pink-500/20 hover:border-pink-500/40 shadow-xl flex flex-col justify-between space-y-6 group transition-all duration-300">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-300 border border-pink-500/20 flex items-center justify-center">
              <KeyRound className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
              Enter Code
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Join a Friend's Room
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Have an invitation code or link from a friend? Enter the code to request access and jump straight into the lobby.
            </p>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-pink-400" />
                Join via clickable link or 4-character room code
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-pink-400" />
                Real-time presence and host authorization
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-pink-400" />
                Works smoothly on phone touchscreens and laptops
              </li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/rooms/join')}
            className="w-full py-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm shadow-glow-pink flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Enter Room Code</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DISCOVER ACTIVE PUBLIC ROOMS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold">
              <Compass className="w-3.5 h-3.5" />
              Live Rooms
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Discoverable Movie Rooms
            </h2>
          </div>
          <button
            onClick={loadRooms}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500"
            title="Refresh rooms"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingRooms ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {discoverableRooms.length === 0 ? (
          <div className="p-8 rounded-3xl glass-card border border-slate-200 dark:border-white/10 text-center space-y-3">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No public rooms currently active</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Be the first to host a movie night! Create a room and invite your friends.
            </p>
            <button
              onClick={() => navigate('/rooms/create')}
              className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
            >
              Host a Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {discoverableRooms.map((room) => (
              <div
                key={room.code}
                className="p-6 rounded-3xl glass-card border border-slate-200 dark:border-white/10 shadow-lg flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400 tracking-wider">
                      {room.code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                      {room.access_type === 'public_open' ? (
                        <>
                          <Unlock className="w-3 h-3 text-emerald-400" /> Open Join
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 text-amber-400" /> Approval Required
                        </>
                      )}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white leading-tight">
                      {room.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Hosted by <span className="font-semibold text-slate-700 dark:text-slate-300">{room.host_name}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      {room.participant_count} / {room.max_participants} players
                    </span>
                    <span>•</span>
                    <span>{room.movie_count} Movies</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/rooms/join?code=${room.code}`)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>{room.access_type === 'public_open' ? 'Join Lobby' : 'Request to Join'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recruiter / Quick Demo Feature Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-pink-500/10 border border-amber-500/30 overflow-hidden shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold border border-amber-500/30">
            <Flame className="w-3.5 h-3.5" />
            Interview & Demo Mode
          </div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
            Want to see how 4 friends match in real time?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
            Launch our simulated room with 4 distinct personas (Anamika, Shreya, Rahul, Priya), pre-populated mood vectors, simulated swipe votes, and live consensus calculation.
          </p>
        </div>

        <button
          onClick={handleLaunchDemo}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs sm:text-sm shadow-lg flex-shrink-0 flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Launch 4-Person Demo
        </button>
      </div>
    </div>
  );
};
