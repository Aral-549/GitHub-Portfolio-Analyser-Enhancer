
import React, { useEffect, useState, useRef } from 'react';
import { EvaluationResult } from '../types';
import { BookOpen, Calendar, Layers, Zap, TrendingUp, Target } from 'lucide-react';

interface Props {
  result: EvaluationResult;
}

const AnimatedCount: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1500 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = null;
    let frame: number;
    const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const progress = time - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);
      const eased = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      setDisplayValue(Math.floor(eased * value));
      if (percentage < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{displayValue}</>;
};

export const ScoreCard: React.FC<Props> = ({ result }) => {
  const [offset, setOffset] = useState(534.07);

  useEffect(() => {
    const circumference = 534.07;
    const progress = (result.overallScore / 100) * circumference;
    setOffset(circumference - progress);
  }, [result.overallScore]);

  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case 'S': return { text: 'text-purple-400', border: 'border-purple-400/50', bg: 'bg-purple-400/20' };
      case 'A': return { text: 'text-green-400', border: 'border-green-400/50', bg: 'bg-green-400/20' };
      case 'B': return { text: 'text-blue-400', border: 'border-blue-400/50', bg: 'bg-blue-400/20' };
      case 'C': return { text: 'text-yellow-400', border: 'border-yellow-400/50', bg: 'bg-yellow-400/20' };
      default: return { text: 'text-red-400', border: 'border-red-400/50', bg: 'bg-red-400/20' };
    }
  };

  const style = getGradeStyle(result.grade);

  const getMetricIcon = (key: string) => {
    switch (key) {
      case 'documentation': return <BookOpen className="w-3.5 h-3.5" />;
      case 'activity': return <Calendar className="w-3.5 h-3.5" />;
      case 'organization': return <Layers className="w-3.5 h-3.5" />;
      case 'engagement': return <Zap className="w-3.5 h-3.5" />;
      case 'depth': return <TrendingUp className="w-3.5 h-3.5" />;
      case 'impact': return <Target className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  return (
    <div className="bg-[#10101a] p-6 sm:p-12 rounded-[2.5rem] sm:rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
      <div className={`absolute -top-32 -right-32 w-80 h-80 blur-[120px] opacity-30 ${style.bg} transition-all duration-1000 group-hover:scale-125`}></div>
      
      <div className="flex flex-col lg:flex-row items-center gap-10 sm:gap-16 relative z-10">
        <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex-shrink-0">
          <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(124,92,252,0.2)]" viewBox="0 0 200 200">
            <circle 
              className="text-white/[0.02]" 
              cx="100" cy="100" r="85" 
              strokeWidth="10" fill="none" stroke="currentColor"
            />
            <circle 
              className={`transition-all duration-[2000ms] cubic-bezier(0.34, 1.56, 0.64, 1) ${style.text}`}
              cx="100" cy="100" r="85" 
              strokeWidth="10" fill="none" 
              stroke="currentColor" strokeDasharray="534.07" 
              strokeDashoffset={offset} strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl sm:text-7xl font-black tracking-tighter ${style.text} leading-none`}>{result.grade}</span>
            <span className="text-slate-600 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.4em] mt-2">Hireability</span>
          </div>
        </div>

        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/5 px-4 sm:px-5 py-2 rounded-2xl mb-6">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-500 tracking-widest uppercase">Portfolio Score</span>
            <span className={`text-sm font-black ${style.text}`}>
              <AnimatedCount value={result.overallScore} />.00
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-tight lg:leading-[0.9]">
            GitHub <br className="hidden md:block" /> Portfolio Score.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-medium max-w-2xl">
            This objective score measures your readiness for the 2026 hiring market by analyzing code quality, consistency, and impact.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-white/5">
        {Object.entries(result.metrics).map(([key, value]) => (
          <div key={key} className="group/metric">
            <div className="flex items-center gap-2 mb-3 text-slate-600 group-hover/metric:text-purple-400 transition-colors">
              {getMetricIcon(key)}
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{key}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mb-3 group-hover/metric:scale-105 transition-transform">
              <AnimatedCount value={value} />%
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-1000 ease-out delay-700" 
                style={{ width: `${value}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
