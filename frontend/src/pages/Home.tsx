import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Users, Film, ArrowRight, Play, Brain, ShieldCheck, HeartHandshake, Star, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MoviePoster } from '../components/MoviePoster';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { moodProfile } = useApp();

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 overflow-hidden">
      {/* SECTION 1: HERO */}
      <section className="relative pt-8 sm:pt-16 pb-12 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-purple-600/20 via-pink-500/20 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs sm:text-sm font-semibold shadow-glow-purple animate-bounce-slow">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span>Dual-Mode AI & Collaborative Cinema Discovery</span>
          </div>

          {/* Hero Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Your Mood. Your Movie.{' '}
              <span className="text-gradient-brand">Your People.</span>
            </h1>
            <p className="text-lg sm:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Stop endless scrolling. Discover movies tuned to your exact emotional vibe, or let your group find the one film everyone agrees on.
            </p>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-md mx-auto">
            <button
              onClick={() => navigate('/quiz')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-base shadow-glow-purple hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>Find My Movie</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/rooms')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-card border border-slate-300 dark:border-white/15 text-slate-800 dark:text-white font-bold text-base hover:bg-slate-100 dark:hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5 text-pink-400" />
              <span>Watch With Friends</span>
            </button>
          </div>

          {/* Quick Demo Room Trigger */}
          <div className="pt-2">
            <button
              onClick={() => navigate('/rooms/demo')}
              className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Recruiter Demo: Experience 4-Friend Simulation Room
            </button>
          </div>

          {/* Cinematic Poster Strip Graphic */}
          <div className="pt-10 max-w-5xl mx-auto">
            <div className="relative p-2 rounded-3xl glass-card shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 p-2">
                {[
                  { title: 'Knives Out', poster: 'https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twj48Jq4.jpg', match: '96%' },
                  { title: 'The Dark Knight', poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', match: '94%' },
                  { title: 'Andhadhun', poster: 'https://image.tmdb.org/t/p/w500/w1H0lB1X0E9E8x9Tj2nZf1wM9U9.jpg', match: '93%' },
                  { title: '3 Idiots', poster: 'https://image.tmdb.org/t/p/w500/66A9MqXGZ81Ka19w4G9o7Yp9N0C.jpg', match: '91%' },
                  { title: 'Inception', poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', match: '95%' },
                  { title: 'Tumbbad', poster: 'https://image.tmdb.org/t/p/w500/qD3i8r8P7x4j0nQ1s6Y8F2g7wZ9.jpg', match: '89%' },
                ].map((item, idx) => (
                  <div key={idx} className="group relative rounded-xl overflow-hidden aspect-[2/3] shadow-md">
                    <MoviePoster
                      src={item.poster}
                      title={item.title}
                      aspectRatioClass="h-full w-full"
                      className="group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-left pointer-events-none">
                      <span className="text-[10px] font-bold text-white line-clamp-1">{item.title}</span>
                      <span className="text-[9px] font-extrabold text-purple-400">{item.match} Match</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE PROBLEM */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-white/10 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">
            The Dilemma
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white leading-tight max-w-3xl mx-auto">
            "Finding a movie shouldn't take longer than watching one."
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-4">
            <div className="p-6 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-2">
              <span className="text-2xl">⏳</span>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Solo Discovery Fatigue</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Generic recommendation feeds rely on obsolete watch history. They rarely understand how you feel right now—whether you want a cozy laugh, mind-bending twists, or an adrenaline spike.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-2">
              <span className="text-2xl">🤷‍♂️</span>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Group Decision Gridlock</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                One friend wants horror, another wants romance, another wants comedy. "You choose" turns into 40 wasted minutes of scrolling without finding a compromise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: TWO WAYS TO DISCOVER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Intelligent Solutions
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-slate-900 dark:text-white">
            Two Ways to Discover
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base max-w-xl mx-auto">
            Seamlessly integrated so your solo mood profile carries directly into group viewing rooms.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: SOLO MODE */}
          <div className="relative rounded-3xl p-8 sm:p-10 glass-card border border-purple-500/20 hover:border-purple-500/40 shadow-xl space-y-6 flex flex-col justify-between group transition-all duration-300">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 flex items-center justify-center text-3xl">
                🎭
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Mode 1 • Watch Solo
              </span>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                Match Your Mood
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                Answer seven fun, interactive questions. Our TF-IDF and Cosine Similarity machine learning engine decodes your emotional archetype and generates personalized recommendations across Hollywood, Bollywood, and Hidden Gems.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 font-semibold">
                  7-Question Quiz
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 font-semibold">
                  NLP Semantic Matching
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 font-semibold">
                  Transparent "Why This Movie?"
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/quiz')}
              className="mt-6 w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-glow-purple flex items-center justify-center gap-2 transition-colors"
            >
              <span>Take the Mood Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: GROUP MODE */}
          <div className="relative rounded-3xl p-8 sm:p-10 glass-card border border-pink-500/20 hover:border-pink-500/40 shadow-xl space-y-6 flex flex-col justify-between group transition-all duration-300">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-300 border border-pink-500/20 flex items-center justify-center text-3xl">
                👥
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                Mode 2 • Watch With Friends
              </span>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                Match Your People
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                Create a movie room with a shareable code. Everyone swipes on a smart candidate deck privately. The group consensus algorithm compares tastes in real time to reveal the winner everyone loves.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-xs px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-300 font-semibold">
                  Live Rooms & Lobby
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-300 font-semibold">
                  Tinder-Style Swiping
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-300 font-semibold">
                  Consensus & Variance Algorithm
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => navigate('/rooms/create')}
                className="flex-1 py-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm shadow-glow-pink flex items-center justify-center gap-2 transition-colors"
              >
                <span>Create a Room</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/rooms/join')}
                className="px-6 py-4 rounded-xl border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-semibold text-sm hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Join a Room
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Simple 4-Step Process
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white">
            How MoodScape Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Answer Quick Moods', desc: 'Choose between evocative, lighthearted cinema choices in 7 interactive questions.' },
            { step: '02', title: 'Profile Generation', desc: 'We classify your archetype (e.g. Curious Thrill-Seeker, Feel-Good Romantic).' },
            { step: '03', title: 'ML Semantic Match', desc: 'Hybrid TF-IDF & cosine vectors rank movies by emotional fit, not mere fame.' },
            { step: '04', title: 'Stream & Agree', desc: 'Instant streaming platform links, or invite friends to swipe collaboratively.' }
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-white/5 space-y-3 relative">
              <span className="font-mono text-3xl font-extrabold text-purple-500/30">
                {item.step}
              </span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: CAPABILITY METRICS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-purple-900/30 border border-purple-500/20 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-display font-extrabold text-3xl sm:text-5xl text-purple-400">7</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">Mood Questions</div>
            </div>
            <div>
              <div className="font-display font-extrabold text-3xl sm:text-5xl text-pink-400">5</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">Curated Categories</div>
            </div>
            <div>
              <div className="font-display font-extrabold text-3xl sm:text-5xl text-cyan-400">Live</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">Multi-User Rooms</div>
            </div>
            <div>
              <div className="font-display font-extrabold text-3xl sm:text-5xl text-emerald-400">TF-IDF</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">NLP Hybrid Engine</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: FINAL CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 dark:text-white">
          Ready to find your next movie?
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-base max-w-lg mx-auto">
          Start your personalized mood quiz now or open a room to settle movie night with friends.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => navigate('/quiz')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-base shadow-glow-purple transition-all"
          >
            Discover My Movie
          </button>
          <button
            onClick={() => navigate('/rooms')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl glass-card border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-bold text-base hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            Watch With Friends
          </button>
        </div>
      </section>
    </div>
  );
};
