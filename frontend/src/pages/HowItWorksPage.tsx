import React from 'react';
import { Sparkles, Users, Heart, Film, ArrowRight, CheckCircle2, ShieldCheck, Compass, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: '01',
      title: 'Answer the Mood Questionnaire',
      description: 'Take our fast 7-question interactive movie questionnaire to capture your immediate emotional vibe—from lighthearted laughs to edge-of-your-seat suspense.',
      icon: Sparkles,
      color: 'from-purple-600 to-indigo-600',
      badge: 'Step 1 • Mood Capture'
    },
    {
      number: '02',
      title: 'Receive Personalized Recommendations',
      description: 'Our intelligent engine instantly decodes your mood into a personalized cinematic profile with tailored recommendations matching your exact feeling tonight.',
      icon: Film,
      color: 'from-indigo-600 to-pink-600',
      badge: 'Step 2 • Smart Discovery'
    },
    {
      number: '03',
      title: 'Save Movies or Explore Details',
      description: 'Browse original posters, plot synopses, cast, and ratings. Bookmark must-watch titles to your personal collection, or launch them directly on Netflix and YouTube.',
      icon: Heart,
      color: 'from-pink-600 to-rose-600',
      badge: 'Step 3 • Personal Library'
    },
    {
      number: '04',
      title: 'Create or Join a Movie-Night Room',
      description: 'Watching with friends or family? Start a group room in one click and share your room code or link. Hosts maintain full privacy with access request controls.',
      icon: Users,
      color: 'from-rose-600 to-amber-600',
      badge: 'Step 4 • Social Connection'
    },
    {
      number: '05',
      title: 'Swipe, Vote & Discover Group Consensus',
      description: 'Everyone swipes privately on their own device. When all votes are locked in, our fair consensus engine reveals the winning movie everyone agrees on—no more endless arguing.',
      icon: CheckCircle2,
      color: 'from-amber-600 to-emerald-600',
      badge: 'Step 5 • The Perfect Match'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 text-xs font-bold border border-purple-500/20">
          <Compass className="w-3.5 h-3.5" />
          The MoodScape Experience
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 dark:text-white">
          How MoodScape Works
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          Say goodbye to endless scrolling and movie-night debates. MoodScape makes discovering what to watch fast, intuitive, and fun for you and your friends.
        </p>
      </div>

      {/* 5-Step Clear Consumer Workflow */}
      <div className="space-y-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-start md:items-center gap-6"
            >
              {/* Step Visual Badge */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${step.color} p-0.5 shadow-lg flex items-center justify-center text-white`}>
                  <Icon className="w-7 h-7" />
                </div>
                <span className="font-mono font-extrabold text-2xl text-purple-600 dark:text-purple-400 md:hidden">
                  {step.number}
                </span>
              </div>

              {/* Step Content */}
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="hidden md:inline-block font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                    {step.badge}
                  </span>
                  <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="hidden md:block font-mono font-extrabold text-3xl text-slate-300 dark:text-white/20 flex-shrink-0 pl-4">
                {step.number}
              </div>
            </div>
          );
        })}
      </div>

      {/* Behind the Scenes Clean Explanation */}
      <section className="glass-card rounded-3xl p-6 sm:p-10 border border-purple-500/20 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Fair & Private Recommendation Technology
            </span>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
              Behind the Scenes Intelligence
            </h2>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          MoodScape works behind the scenes to ensure every recommendation is genuinely relevant. In solo mode, it balances emotional tones, storytelling pace, and genres to find movies tailored to your instant mood. In group rooms, our consensus algorithm protects every friend's taste—ensuring no single person is forced to watch a film they dislike while discovering the perfect shared movie.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 space-y-1 border border-slate-200 dark:border-white/5">
            <h4 className="font-bold text-slate-900 dark:text-white">Private Blind Voting</h4>
            <p className="text-slate-500 dark:text-slate-400">
              Your votes stay secret until everyone is finished, removing peer pressure.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 space-y-1 border border-slate-200 dark:border-white/5">
            <h4 className="font-bold text-slate-900 dark:text-white">Minority Protection</h4>
            <p className="text-slate-500 dark:text-slate-400">
              Guarantees a comfortable baseline so everyone in the room enjoys the movie.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 space-y-1 border border-slate-200 dark:border-white/5">
            <h4 className="font-bold text-slate-900 dark:text-white">Personal Library</h4>
            <p className="text-slate-500 dark:text-slate-400">
              Star your favorite movies at any time to save them to your account.
            </p>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={() => navigate('/quiz')}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-glow-purple flex items-center justify-center gap-2 transition-transform hover:scale-105 cursor-pointer"
        >
          <span>Take the Mood Quiz</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => navigate('/rooms/create')}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-900 dark:text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Users className="w-4 h-4 text-purple-500" />
          <span>Create a Group Room</span>
        </button>
      </div>
    </div>
  );
};
