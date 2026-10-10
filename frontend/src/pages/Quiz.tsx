import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Search,
  Ghost,
  HeartHandshake,
  Zap,
  Flame,
  Glasses,
  Laugh,
  Heart,
  Compass,
  Coffee,
  Sun,
  BookOpen,
  Activity,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { fetchQuizQuestions, fetchRecommendations } from '../services/api';
import { QuizQuestion } from '../types';
import { useApp } from '../context/AppContext';

// Helper to render icon by name
const renderQuizIcon = (iconName: string) => {
  const props = { className: "w-6 h-6 text-purple-500" };
  switch (iconName) {
    case 'Search': return <Search {...props} />;
    case 'Ghost': return <Ghost {...props} />;
    case 'HeartHandshake': return <HeartHandshake {...props} />;
    case 'Zap': return <Zap {...props} />;
    case 'Flame': return <Flame {...props} />;
    case 'Glasses': return <Glasses {...props} />;
    case 'Laugh': return <Laugh {...props} />;
    case 'Heart': return <Heart {...props} />;
    case 'Compass': return <Compass {...props} />;
    case 'Coffee': return <Coffee {...props} />;
    case 'Sun': return <Sun {...props} />;
    case 'BookOpen': return <BookOpen {...props} />;
    case 'Activity': return <Activity {...props} />;
    default: return <Sparkles {...props} />;
  }
};

export const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const { moodProfile, saveDailyMoodState, refreshDailyMood } = useApp();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B'>>({});
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState('Analyzing your movie mood...');
  const [showRetakeConfirm, setShowRetakeConfirm] = useState(false);

  // Cancellation and timer ref to prevent memory leaks and duplicate triggers
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    fetchQuizQuestions()
      .then(data => {
        if (!isMounted) return;
        setQuestions(data);
        setIsLoadingQuestions(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Quiz fetch questions error:', err);
        setIsLoadingQuestions(false);
      });

    return () => {
      isMounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const totalQuestions = questions.length || 7;
  const currentQ = questions[currentIndex];
  const currentAnswer = currentQ ? selectedAnswers[currentQ.id] : undefined;

  // Single Authoritative selection handler: strictly records answer and NEVER auto-advances
  const handleSelectOption = (optionId: 'A' | 'B') => {
    if (!currentQ || isSubmitting) return;
    setValidationMessage(null);
    setErrorState(null);

    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionId
    }));
  };

  // Explicit user-triggered forward navigation
  const handleNext = () => {
    if (!currentAnswer) {
      setValidationMessage('Please select one of the two options before proceeding.');
      return;
    }

    setValidationMessage(null);
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleFinalSubmit();
    }
  };

  // Explicit user-triggered backward navigation
  const handleBack = () => {
    if (currentIndex > 0) {
      setValidationMessage(null);
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Validate that all 7 answers exist
  const validateAllAnswers = (): boolean => {
    for (let i = 0; i < totalQuestions; i++) {
      const q = questions[i];
      const qId = q ? q.id : `q${i + 1}`;
      if (!selectedAnswers[qId]) {
        setCurrentIndex(i);
        setValidationMessage(`Question ${i + 1} has not been answered yet.`);
        return false;
      }
    }
    return true;
  };

  // Final submission on explicit user button click
  const handleFinalSubmit = async () => {
    if (!validateAllAnswers()) return;

    setIsSubmitting(true);
    setErrorState(null);
    setLoadingText('Analyzing your movie mood...');

    // Controlled progressive status text
    timeoutRef.current = setTimeout(() => {
      setLoadingText('Finding movies that match your preferences...');
      timeoutRef.current = setTimeout(() => {
        setLoadingText('Preparing your personalized recommendations...');
      }, 1000);
    }, 900);

    try {
      const recs = await fetchRecommendations(selectedAnswers);
      if (recs.profile) {
        await saveDailyMoodState(selectedAnswers, recs.profile, recs.profile.preference_vector);
      }
      navigate('/recommendations', { state: { recommendations: recs } });
    } catch (err: any) {
      console.error('Quiz recommendation failure:', err);
      setIsSubmitting(false);
      setErrorState(err.message || 'We could not generate your recommendations. Please check your connection and retry.');
    }
  };

  // Reset confirmation handler
  const handleConfirmReset = () => {
    refreshDailyMood();
    setSelectedAnswers({});
    setCurrentIndex(0);
    setShowRetakeConfirm(false);
  };

  if (isLoadingQuestions) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading questionnaire...</p>
      </div>
    );
  }

  // Active Daily Mood Dialog Banner
  if (moodProfile && Object.keys(selectedAnswers).length === 0 && !showRetakeConfirm) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-8 animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-glow-purple mx-auto flex items-center justify-center text-3xl">
          🎬
        </div>
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Daily Mood Active
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            You've decoded your mood today: "{moodProfile.profile_title}"
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Your daily cinematic vibe is saved. Would you like to view your matching movies, or take a fresh quiz to refresh your mood?
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => navigate('/recommendations')}
            className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-glow-purple transition-all"
          >
            View Recommendations
          </button>
          <button
            onClick={() => setShowRetakeConfirm(true)}
            className="px-6 py-3.5 rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh My Mood
          </button>
        </div>
      </div>
    );
  }

  // Submission Loading State
  if (isSubmitting) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6 text-center max-w-md mx-auto px-4 animate-in fade-in duration-300">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-0.5 shadow-glow-purple animate-pulse">
            <div className="w-full h-full bg-[#0B0D13] rounded-[22px] flex items-center justify-center text-3xl">
              🎬
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-purple-600 text-white animate-spin">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            Decoding Your Cinematic Mood
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse font-medium">
            {loadingText}
          </p>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  const progressPercentage = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Top Header & Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit Quiz
          </button>
          <span className="text-purple-600 dark:text-purple-400 font-bold font-mono">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Error alert with retry button if submission previously failed */}
      {errorState && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorState}</span>
          </div>
          <button
            onClick={handleFinalSubmit}
            className="px-4 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Submission
          </button>
        </div>
      )}

      {/* Question Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-white/10 shadow-xl space-y-8 text-center animate-in fade-in duration-300">
        <div className="space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Mood Pulse #{currentIndex + 1}
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white leading-tight">
            {currentQ.question}
          </h2>
        </div>

        {/* The Two Choice Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left">
          {currentQ.options.map((opt) => {
            const isSelected = currentAnswer === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`group relative p-6 sm:p-7 rounded-2xl cursor-pointer border-2 transition-all duration-200 flex flex-col justify-between space-y-4 select-none ${
                  isSelected
                    ? 'bg-purple-500/10 border-purple-600 dark:border-purple-400 shadow-glow-purple scale-[1.02]'
                    : 'bg-slate-50/80 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-purple-500/40 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                {/* Header with Icon and Select Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                    {renderQuizIcon(opt.icon)}
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-slate-300 dark:border-white/20'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>

                {/* Option Text */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Option {opt.id}
                  </span>
                  <p className="font-display font-semibold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                    {opt.text}
                  </p>
                </div>

                {/* Mood Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {opt.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-[10px] px-2.5 py-0.5 rounded-md font-semibold transition-colors ${
                        isSelected
                          ? 'bg-purple-600/20 text-purple-700 dark:text-purple-300'
                          : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Validation hint if not selected */}
        {validationMessage ? (
          <p className="text-xs text-rose-500 dark:text-rose-400 font-semibold animate-pulse">
            {validationMessage}
          </p>
        ) : !currentAnswer ? (
          <p className="text-xs text-slate-400">
            Select one of the two options above, then click Next
          </p>
        ) : null}

        {/* Navigation Controls: Back / Next */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentIndex === 0}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${
              currentIndex === 0
                ? 'opacity-30 cursor-not-allowed text-slate-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!currentAnswer}
            className={`px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-200 ${
              currentAnswer
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-glow-purple scale-100 cursor-pointer'
                : 'bg-slate-300 dark:bg-white/10 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>{currentIndex === totalQuestions - 1 ? 'Find My Movies' : 'Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Retake Confirmation Modal */}
      {showRetakeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161922] p-6 rounded-3xl max-w-sm w-full space-y-4 border border-slate-200 dark:border-white/10 shadow-2xl text-center">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Refresh Today's Mood?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This will reset your current answers and let you answer all 7 questions again to decode a fresh mood profile.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowRetakeConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Keep Current
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold"
              >
                Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
