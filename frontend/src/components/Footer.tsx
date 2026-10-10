import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Heart, Sparkles, ShieldCheck, Compass } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#07090D] transition-colors py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-slate-200 dark:border-white/5">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-glow-purple">
                <div className="w-full h-full bg-[#0B0D13] rounded-[10px] flex items-center justify-center">
                  <Film className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
                MOOD<span className="text-gradient-brand">SCAPE</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              "Your Mood. Your Movie. Your People." The intelligent dual-mode cinema platform combining mood-based movie discovery with real-time group preference matching.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                Personalized Mood Discovery
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Private Group Voting
              </span>
            </div>
          </div>

          {/* Discovery Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Discovery Modes
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/quiz" className="text-slate-600 dark:text-slate-400 hover:text-purple-500 transition-colors">
                  🎭 7-Question Solo Quiz
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="text-slate-600 dark:text-slate-400 hover:text-purple-500 transition-colors">
                  👥 Group Movie Rooms
                </Link>
              </li>
              <li>
                <Link to="/rooms/demo" className="text-slate-600 dark:text-slate-400 hover:text-purple-500 transition-colors">
                  ⚡ Recruiter Demo Room
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-slate-600 dark:text-slate-400 hover:text-purple-500 transition-colors">
                  🔍 Search & Browse Catalog
                </Link>
              </li>
            </ul>
          </div>

          {/* MoodScape Experience Links (Replaces Engineering category) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Experience
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/how-it-works" className="hover:text-purple-500 transition-colors font-semibold text-purple-600 dark:text-purple-400">
                  ⚡ How It Works
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-purple-500 transition-colors">
                  ❤️ Saved Movies & Watchlist
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-purple-500 transition-colors">
                  👤 Personal Profile
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-purple-500 transition-colors">
                  ⚙️ Account & Appearance Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} MoodScape Platform. Designed & Built for cinematic connection.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built for cinematic discovery</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
