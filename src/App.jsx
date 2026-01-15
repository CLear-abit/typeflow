import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Sample texts for typing practice
const sampleTexts = {
  beginner: [
    "The quick brown fox jumps over the lazy dog.",
    "Pack my box with five dozen liquor jugs.",
    "How vexingly quick daft zebras jump.",
  ],
  intermediate: [
    "Programming is the art of telling another human being what one wants the computer to do.",
    "The best way to predict the future is to invent it. Stay curious and keep learning.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  ],
  advanced: [
    "Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are not smart enough to debug it.",
    "The function of good software is to make the complex appear to be simple. Every great developer you know got there by solving problems they were unqualified to solve.",
  ]
};

// Rank definitions
const ranks = [
  { name: "Novice", minLevel: 1, color: "#6B7280", icon: "○" },
  { name: "Apprentice", minLevel: 5, color: "#10B981", icon: "◐" },
  { name: "Typist", minLevel: 10, color: "#3B82F6", icon: "●" },
  { name: "Swift", minLevel: 20, color: "#8B5CF6", icon: "◆" },
  { name: "Expert", minLevel: 35, color: "#F59E0B", icon: "★" },
  { name: "Master", minLevel: 50, color: "#EF4444", icon: "✦" },
  { name: "Grandmaster", minLevel: 75, color: "#EC4899", icon: "❖" },
  { name: "Legend", minLevel: 100, color: "#FFD700", icon: "✧" },
];

// Achievements
const achievementDefs = [
  { id: "first_test", name: "First Steps", desc: "Complete your first typing test", icon: "🎯", xp: 50 },
  { id: "speed_demon", name: "Speed Demon", desc: "Reach 60 WPM", icon: "⚡", xp: 100 },
  { id: "perfectionist", name: "Perfectionist", desc: "Achieve 100% accuracy", icon: "💎", xp: 150 },
  { id: "streak_3", name: "Consistent", desc: "3-day streak", icon: "🔥", xp: 75 },
  { id: "streak_7", name: "Dedicated", desc: "7-day streak", icon: "🌟", xp: 200 },
  { id: "streak_30", name: "Unstoppable", desc: "30-day streak", icon: "👑", xp: 500 },
  { id: "level_10", name: "Rising Star", desc: "Reach level 10", icon: "🚀", xp: 100 },
  { id: "tests_50", name: "Practitioner", desc: "Complete 50 tests", icon: "📚", xp: 250 },
  { id: "wpm_80", name: "Lightning", desc: "Reach 80 WPM", icon: "⚡", xp: 300 },
  { id: "wpm_100", name: "Supersonic", desc: "Reach 100 WPM", icon: "🏆", xp: 500 },
];

// Daily challenges
const dailyChallenges = [
  { id: 1, name: "Speed Run", desc: "Complete 3 tests with 50+ WPM", target: 3, type: "wpm_threshold", threshold: 50, xp: 100 },
  { id: 2, name: "Precision", desc: "Achieve 95%+ accuracy in 2 tests", target: 2, type: "accuracy_threshold", threshold: 95, xp: 80 },
  { id: 3, name: "Endurance", desc: "Type 500 characters total", target: 500, type: "characters", xp: 60 },
  { id: 4, name: "Perfect Ten", desc: "Complete a test with 0 errors", target: 1, type: "perfect", xp: 120 },
];

export default function TypingWebsite() {
  // Core state
  const [view, setView] = useState('dashboard'); // dashboard, practice, stats, achievements
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [difficulty, setDifficulty] = useState('beginner');
  
  // Stats
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // User progress
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [totalTests, setTotalTests] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestWpm, setBestWpm] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [history, setHistory] = useState([
    { date: '1', wpm: 25, accuracy: 85 },
    { date: '2', wpm: 28, accuracy: 87 },
    { date: '3', wpm: 32, accuracy: 88 },
    { date: '4', wpm: 35, accuracy: 90 },
    { date: '5', wpm: 38, accuracy: 89 },
    { date: '6', wpm: 42, accuracy: 92 },
    { date: '7', wpm: 45, accuracy: 93 },
  ]);
  
  // Daily challenge progress
  const [dailyProgress, setDailyProgress] = useState({
    testsWithWpm: 0,
    testsWithAccuracy: 0,
    totalChars: 0,
    perfectTests: 0,
  });
  
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  
  // XP required for each level
  const xpForLevel = (lvl) => Math.floor(100 * Math.pow(1.2, lvl - 1));
  const totalXpForLevel = (lvl) => {
    let total = 0;
    for (let i = 1; i < lvl; i++) total += xpForLevel(i);
    return total;
  };
  
  // Get current rank
  const getCurrentRank = () => {
    let currentRank = ranks[0];
    for (const rank of ranks) {
      if (level >= rank.minLevel) currentRank = rank;
    }
    return currentRank;
  };
  
  // Get next rank
  const getNextRank = () => {
    for (const rank of ranks) {
      if (level < rank.minLevel) return rank;
    }
    return null;
  };
  
  // Add XP and handle level up
  const addXp = (amount) => {
    let newXp = xp + amount;
    let newLevel = level;
    
    while (newXp >= xpForLevel(newLevel)) {
      newXp -= xpForLevel(newLevel);
      newLevel++;
    }
    
    setXp(newXp);
    setLevel(newLevel);
  };
  
  // Check and unlock achievements
  const checkAchievements = (newWpm, newAccuracy, newTests) => {
    const newAchievements = [...achievements];
    
    if (!achievements.includes('first_test') && newTests >= 1) {
      newAchievements.push('first_test');
      addXp(50);
    }
    if (!achievements.includes('speed_demon') && newWpm >= 60) {
      newAchievements.push('speed_demon');
      addXp(100);
    }
    if (!achievements.includes('perfectionist') && newAccuracy === 100) {
      newAchievements.push('perfectionist');
      addXp(150);
    }
    if (!achievements.includes('wpm_80') && newWpm >= 80) {
      newAchievements.push('wpm_80');
      addXp(300);
    }
    if (!achievements.includes('wpm_100') && newWpm >= 100) {
      newAchievements.push('wpm_100');
      addXp(500);
    }
    if (!achievements.includes('level_10') && level >= 10) {
      newAchievements.push('level_10');
      addXp(100);
    }
    if (!achievements.includes('tests_50') && newTests >= 50) {
      newAchievements.push('tests_50');
      addXp(250);
    }
    
    setAchievements(newAchievements);
  };
  
  // Start new test
  const startTest = () => {
    const texts = sampleTexts[difficulty];
    const randomText = texts[Math.floor(Math.random() * texts.length)];
    setText(randomText);
    setUserInput('');
    setIsTyping(false);
    setIsFinished(false);
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setTimeElapsed(0);
    setView('practice');
    setTimeout(() => inputRef.current?.focus(), 100);
  };
  
  // Handle typing input
  const handleInput = (e) => {
    const value = e.target.value;
    
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      setStartTime(Date.now());
    }
    
    setUserInput(value);
    
    // Calculate errors
    let errorCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== text[i]) errorCount++;
    }
    setErrors(errorCount);
    
    // Calculate accuracy
    const acc = value.length > 0 ? Math.round(((value.length - errorCount) / value.length) * 100) : 100;
    setAccuracy(acc);
    
    // Check if finished
    if (value.length >= text.length) {
      finishTest(acc);
    }
  };
  
  // Finish test
  const finishTest = (finalAccuracy) => {
    setIsFinished(true);
    setIsTyping(false);
    clearInterval(timerRef.current);
    
    const finalWpm = wpm;
    const newTests = totalTests + 1;
    setTotalTests(newTests);
    
    // Update best WPM
    if (finalWpm > bestWpm) setBestWpm(finalWpm);
    
    // Add to history
    setHistory(prev => [...prev, { 
      date: (prev.length + 1).toString(), 
      wpm: finalWpm, 
      accuracy: finalAccuracy 
    }]);
    
    // Calculate XP reward
    const baseXp = 20;
    const wpmBonus = Math.floor(finalWpm / 10) * 5;
    const accuracyBonus = Math.floor(finalAccuracy / 10) * 3;
    const totalXpGain = baseXp + wpmBonus + accuracyBonus;
    addXp(totalXpGain);
    
    // Update daily progress
    setDailyProgress(prev => ({
      testsWithWpm: prev.testsWithWpm + (finalWpm >= 50 ? 1 : 0),
      testsWithAccuracy: prev.testsWithAccuracy + (finalAccuracy >= 95 ? 1 : 0),
      totalChars: prev.totalChars + text.length,
      perfectTests: prev.perfectTests + (errors === 0 ? 1 : 0),
    }));
    
    // Check achievements
    checkAchievements(finalWpm, finalAccuracy, newTests);
  };
  
  // Timer effect
  useEffect(() => {
    if (isTyping && startTime) {
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setTimeElapsed(elapsed);
        
        // Calculate WPM
        const words = userInput.trim().split(/\s+/).length;
        const minutes = elapsed / 60;
        if (minutes > 0) {
          setWpm(Math.round(words / minutes));
        }
      }, 100);
    }
    
    return () => clearInterval(timerRef.current);
  }, [isTyping, startTime, userInput]);
  
  // Render text with highlights
  const renderText = () => {
    return text.split('').map((char, i) => {
      let className = 'text-zinc-500';
      if (i < userInput.length) {
        className = userInput[i] === char ? 'text-emerald-400' : 'text-red-400 bg-red-400/20';
      } else if (i === userInput.length) {
        className = 'text-white bg-amber-500/50 animate-pulse';
      }
      return <span key={i} className={className}>{char}</span>;
    });
  };
  
  const rank = getCurrentRank();
  const nextRank = getNextRank();
  const xpProgress = (xp / xpForLevel(level)) * 100;
  
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-zinc-800/50 backdrop-blur-xl bg-zinc-950/80 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-amber-400 flex items-center justify-center text-zinc-900 font-black text-lg">
                  T
                </div>
                <span className="text-xl font-bold tracking-tight">TypeFlow</span>
              </div>
              
              <nav className="flex items-center gap-1">
                {['dashboard', 'practice', 'stats', 'achievements'].map((v) => (
                  <button
                    key={v}
                    onClick={() => v === 'practice' ? startTest() : setView(v)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      view === v 
                        ? 'bg-zinc-800 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    }`}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </nav>
              
              {/* User stats mini */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <span className="text-amber-400">🔥</span>
                  <span className="font-bold">{streak}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: `${rank.color}20`, color: rank.color }}>
                    {rank.icon}
                  </div>
                  <div className="text-sm">
                    <div className="font-bold" style={{ color: rank.color }}>{rank.name}</div>
                    <div className="text-zinc-500 text-xs">Lv. {level}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Dashboard View */}
          {view === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Welcome Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Stats Card */}
                <div className="lg:col-span-2 p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800/50">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">Welcome back, Typist!</h1>
                      <p className="text-zinc-400">Keep practicing to improve your skills</p>
                    </div>
                    <button
                      onClick={startTest}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 shadow-lg shadow-emerald-500/25"
                    >
                      Start Practice →
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30">
                      <div className="text-zinc-400 text-sm mb-1">Best WPM</div>
                      <div className="text-3xl font-black text-emerald-400">{bestWpm}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30">
                      <div className="text-zinc-400 text-sm mb-1">Tests Completed</div>
                      <div className="text-3xl font-black text-amber-400">{totalTests}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30">
                      <div className="text-zinc-400 text-sm mb-1">Achievements</div>
                      <div className="text-3xl font-black text-violet-400">{achievements.length}/{achievementDefs.length}</div>
                    </div>
                  </div>
                </div>
                
                {/* Rank Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800/50">
                  <div className="text-center mb-6">
                    <div 
                      className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-4"
                      style={{ background: `${rank.color}20`, color: rank.color }}
                    >
                      {rank.icon}
                    </div>
                    <div className="text-2xl font-bold" style={{ color: rank.color }}>{rank.name}</div>
                    <div className="text-zinc-500">Level {level}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">XP Progress</span>
                      <span className="text-zinc-300">{xp} / {xpForLevel(level)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${xpProgress}%`, 
                          background: `linear-gradient(to right, ${rank.color}, ${rank.color}aa)` 
                        }}
                      />
                    </div>
                    {nextRank && (
                      <div className="text-xs text-zinc-500 text-center mt-3">
                        {nextRank.minLevel - level} levels until <span style={{ color: nextRank.color }}>{nextRank.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Daily Challenges */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800/50">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-amber-400">⚡</span> Daily Challenges
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dailyChallenges.map((challenge) => {
                    let progress = 0;
                    let current = 0;
                    if (challenge.type === 'wpm_threshold') {
                      current = dailyProgress.testsWithWpm;
                      progress = (current / challenge.target) * 100;
                    } else if (challenge.type === 'accuracy_threshold') {
                      current = dailyProgress.testsWithAccuracy;
                      progress = (current / challenge.target) * 100;
                    } else if (challenge.type === 'characters') {
                      current = dailyProgress.totalChars;
                      progress = (current / challenge.target) * 100;
                    } else if (challenge.type === 'perfect') {
                      current = dailyProgress.perfectTests;
                      progress = (current / challenge.target) * 100;
                    }
                    const isComplete = progress >= 100;
                    
                    return (
                      <div 
                        key={challenge.id} 
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          isComplete 
                            ? 'bg-emerald-500/10 border-emerald-500/30' 
                            : 'bg-zinc-800/30 border-zinc-700/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm">{challenge.name}</span>
                          <span className="text-xs text-amber-400">+{challenge.xp} XP</span>
                        </div>
                        <p className="text-xs text-zinc-400 mb-3">{challenge.desc}</p>
                        <div className="h-2 rounded-full bg-zinc-700 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isComplete ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">
                          {Math.min(current, challenge.target)} / {challenge.target}
                          {isComplete && <span className="text-emerald-400 ml-2">✓ Complete!</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Progress Chart */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800/50">
                <h2 className="text-xl font-bold mb-4">Progress Over Time</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                      <defs>
                        <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#52525b" fontSize={12} />
                      <YAxis stroke="#52525b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#18181b', 
                          border: '1px solid #3f3f46',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="wpm" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        fill="url(#wpmGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          
          {/* Practice View */}
          {view === 'practice' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              {/* Difficulty Selector */}
              <div className="flex items-center justify-center gap-2">
                {['beginner', 'intermediate', 'advanced'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => {
                      setDifficulty(diff);
                      if (!isTyping && !isFinished) startTest();
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      difficulty === diff
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-zinc-400 hover:text-white border border-transparent'
                    }`}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </div>
              
              {/* Stats Bar */}
              <div className="flex items-center justify-center gap-8 py-4">
                <div className="text-center">
                  <div className="text-4xl font-black text-emerald-400">{wpm}</div>
                  <div className="text-sm text-zinc-500">WPM</div>
                </div>
                <div className="w-px h-12 bg-zinc-800" />
                <div className="text-center">
                  <div className={`text-4xl font-black ${accuracy >= 95 ? 'text-emerald-400' : accuracy >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
                    {accuracy}%
                  </div>
                  <div className="text-sm text-zinc-500">Accuracy</div>
                </div>
                <div className="w-px h-12 bg-zinc-800" />
                <div className="text-center">
                  <div className="text-4xl font-black text-red-400">{errors}</div>
                  <div className="text-sm text-zinc-500">Errors</div>
                </div>
                <div className="w-px h-12 bg-zinc-800" />
                <div className="text-center">
                  <div className="text-4xl font-black text-zinc-300">{timeElapsed.toFixed(1)}s</div>
                  <div className="text-sm text-zinc-500">Time</div>
                </div>
              </div>
              
              {/* Typing Area */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800/50">
                <div className="text-2xl leading-relaxed font-mono mb-6 select-none">
                  {renderText()}
                </div>
                
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleInput}
                  disabled={isFinished}
                  placeholder={isFinished ? "Test complete!" : "Start typing..."}
                  className="w-full p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-lg font-mono focus:outline-none focus:border-emerald-500/50 disabled:opacity-50 transition-all"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
              
              {/* Results */}
              {isFinished && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-amber-500/10 border border-emerald-500/20 animate-fadeIn">
                  <h3 className="text-xl font-bold mb-4 text-center">Test Complete! 🎉</h3>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 rounded-xl bg-zinc-900/50">
                      <div className="text-2xl font-black text-emerald-400">{wpm}</div>
                      <div className="text-sm text-zinc-500">Final WPM</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-zinc-900/50">
                      <div className="text-2xl font-black text-amber-400">{accuracy}%</div>
                      <div className="text-sm text-zinc-500">Accuracy</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-zinc-900/50">
                      <div className="text-2xl font-black text-violet-400">+{20 + Math.floor(wpm/10)*5 + Math.floor(accuracy/10)*3}</div>
                      <div className="text-sm text-zinc-500">XP Earned</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-zinc-900/50">
                      <div className="text-2xl font-black text-zinc-300">{timeElapsed.toFixed(1)}s</div>
                      <div className="text-sm text-zinc-500">Time</div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={startTest}
                      className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition-all"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => setView('dashboard')}
                      className="px-6 py-3 rounded-xl bg-zinc-700 text-white font-bold hover:bg-zinc-600 transition-all"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Stats View */}
          {view === 'stats' && (
            <div className="space-y-6 animate-fadeIn">
              <h1 className="text-3xl font-bold">Your Statistics</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                  <div className="text-sm text-zinc-400 mb-1">Best WPM</div>
                  <div className="text-4xl font-black text-emerald-400">{bestWpm}</div>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                  <div className="text-sm text-zinc-400 mb-1">Current Streak</div>
                  <div className="text-4xl font-black text-amber-400">{streak} days</div>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20">
                  <div className="text-sm text-zinc-400 mb-1">Total Tests</div>
                  <div className="text-4xl font-black text-violet-400">{totalTests}</div>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-500/10 to-zinc-500/5 border border-zinc-500/20">
                  <div className="text-sm text-zinc-400 mb-1">Average WPM</div>
                  <div className="text-4xl font-black text-zinc-300">
                    {history.length > 0 ? Math.round(history.reduce((a, b) => a + b.wpm, 0) / history.length) : 0}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                  <h3 className="text-lg font-bold mb-4">WPM Progress</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <XAxis dataKey="date" stroke="#52525b" fontSize={12} />
                        <YAxis stroke="#52525b" fontSize={12} />
                        <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }} />
                        <Line type="monotone" dataKey="wpm" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                  <h3 className="text-lg font-bold mb-4">Accuracy Progress</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <XAxis dataKey="date" stroke="#52525b" fontSize={12} />
                        <YAxis stroke="#52525b" fontSize={12} domain={[60, 100]} />
                        <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }} />
                        <Line type="monotone" dataKey="accuracy" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              {/* Rank progression */}
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                <h3 className="text-lg font-bold mb-4">Rank Progression</h3>
                <div className="flex items-center justify-between">
                  {ranks.map((r, i) => (
                    <div key={r.name} className="flex flex-col items-center">
                      <div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-2 transition-all ${
                          level >= r.minLevel ? 'opacity-100 scale-100' : 'opacity-30 scale-90'
                        }`}
                        style={{ background: `${r.color}20`, color: r.color }}
                      >
                        {r.icon}
                      </div>
                      <span className={`text-xs font-medium ${level >= r.minLevel ? '' : 'text-zinc-600'}`} style={{ color: level >= r.minLevel ? r.color : undefined }}>
                        {r.name}
                      </span>
                      <span className="text-xs text-zinc-600">Lv.{r.minLevel}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Achievements View */}
          {view === 'achievements' && (
            <div className="space-y-6 animate-fadeIn">
              <h1 className="text-3xl font-bold">Achievements</h1>
              <p className="text-zinc-400">Unlock achievements by completing challenges and improving your skills</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievementDefs.map((achievement) => {
                  const unlocked = achievements.includes(achievement.id);
                  return (
                    <div 
                      key={achievement.id}
                      className={`p-5 rounded-2xl border transition-all duration-300 ${
                        unlocked 
                          ? 'bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/30' 
                          : 'bg-zinc-900/30 border-zinc-800/50 opacity-50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`text-4xl ${unlocked ? '' : 'grayscale'}`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold">{achievement.name}</span>
                            {unlocked && <span className="text-emerald-400 text-sm">✓</span>}
                          </div>
                          <p className="text-sm text-zinc-400 mb-2">{achievement.desc}</p>
                          <span className="text-xs text-amber-400 font-medium">+{achievement.xp} XP</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 text-center">
                <div className="text-6xl font-black text-amber-400 mb-2">
                  {achievements.length} / {achievementDefs.length}
                </div>
                <p className="text-zinc-400">Achievements Unlocked</p>
              </div>
            </div>
          )}
        </main>
      </div>
      
    </div>
  );
}
