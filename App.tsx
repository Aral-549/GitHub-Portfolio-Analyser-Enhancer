
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Github, AlertCircle, Sparkles, Rocket, ChevronRight, 
  Target, ShieldCheck, Trophy, TrendingUp, BookOpen, Layers, 
  Zap, Share2, MapPin, Calendar, ExternalLink
} from 'lucide-react';
import { LoadingState, GitHubUser, GitHubRepo, EvaluationResult } from './types';
import { fetchGitHubData } from './services/githubService';
import { analyzePortfolio } from './services/geminiService';
import { ScoreCard } from './components/ScoreCard';
import { StatsOverview } from './components/StatsOverview';

const formatCompactNumber = (number: number) => {
  if (number < 1000) return number.toString();
  return Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(number);
};

const AnimatedNumber: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1500 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = null;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);
      const easedPercentage = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      const current = Math.floor(easedPercentage * value);
      setDisplayValue(current);
      if (percentage < 1) animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{value > 9999 ? formatCompactNumber(displayValue) : displayValue.toLocaleString()}</>;
};

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    let username = input.trim();
    if (username.includes('github.com/')) {
      const parts = username.replace(/\/$/, '').split('/');
      username = parts[parts.length - 1];
    }

    setStatus(LoadingState.FETCHING_GITHUB);
    setError(null);
    setEvaluation(null);

    try {
      const { user, repos: githubRepos } = await fetchGitHubData(username);
      setUserData(user);
      setRepos(githubRepos);
      
      setStatus(LoadingState.ANALYZING_AI);
      const aiResult = await analyzePortfolio(user, githubRepos);
      setEvaluation(aiResult);
      setStatus(LoadingState.SUCCESS);
    } catch (err: any) {
      setError(err.message || 'Audit failed. Verify your username.');
      setStatus(LoadingState.ERROR);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'documentation': return <BookOpen className="w-3 h-3" />;
      case 'activity': return <Calendar className="w-3 h-3" />;
      case 'organization': return <Layers className="w-3 h-3" />;
      case 'engagement': return <Zap className="w-3 h-3" />;
      case 'depth': return <TrendingUp className="w-3 h-3" />;
      case 'impact': return <Target className="w-3 h-3" />;
      default: return <Sparkles className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#06060b] text-[#e4e4ed] relative overflow-hidden font-inter selection:bg-purple-500/30">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-50"></div>

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-250px] left-[-150px] w-[700px] h-[700px] rounded-full bg-purple-600/10 blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-150px] right-[-150px] w-[600px] h-[600px] rounded-full bg-pink-600/10 blur-[140px] animate-pulse delay-1000"></div>
      </div>

      <nav className="relative z-10 border-b border-white/5 bg-[#10101a]/50 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2.5 rounded-2xl shadow-[0_0_20px_rgba(124,92,252,0.3)] group-hover:scale-110 transition-transform">
              <Github className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col -gap-1">
              <h1 className="text-2xl font-black tracking-tighter text-white leading-none">GITRECRUITER</h1>
              <span className="text-[10px] font-bold text-purple-400 tracking-[0.4em] uppercase">Portfolio Analyzer</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-24">
        <section className={`text-center transition-all duration-1000 ${evaluation ? 'mb-16 opacity-100' : 'mb-32 mt-12'}`}>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
            The Recruiters'<br/>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Portfolio Grader.</span>
          </h2>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Turn your repositories into recruiter-ready proof. Get objective feedback and specific action items to stand out.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-[#161624] border border-white/10 rounded-3xl p-2 sm:p-2 sm:pr-4 shadow-2xl backdrop-blur-3xl overflow-hidden">
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors w-6 h-6 sm:w-7 sm:h-7" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="github.com/profile"
                  className="w-full bg-transparent py-4 sm:py-6 pl-16 pr-6 text-white focus:outline-none text-base sm:text-xl"
                />
              </div>
              <button
                disabled={status === LoadingState.FETCHING_GITHUB || status === LoadingState.ANALYZING_AI}
                className="bg-white text-black hover:bg-slate-200 disabled:opacity-50 font-black py-4 px-6 sm:px-10 rounded-2xl transition-all shadow-xl hover:scale-[1.02] active:scale-95 text-xs sm:text-sm uppercase tracking-widest whitespace-nowrap mt-2 sm:mt-0 mx-2 mb-2 sm:mx-0 sm:mb-0"
              >
                {status === LoadingState.FETCHING_GITHUB || status === LoadingState.ANALYZING_AI ? 'Analysing...' : 'Analyse Profile'}
              </button>
            </div>
          </form>
        </section>

        {(status === LoadingState.FETCHING_GITHUB || status === LoadingState.ANALYZING_AI) && (
          <div className="max-w-xl mx-auto flex flex-col items-center py-20 animate-in fade-in duration-500">
            <div className="w-full h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-progress"></div>
            </div>
            <p className="text-white font-black uppercase text-[10px] tracking-[0.5em] animate-pulse">
              {status === LoadingState.FETCHING_GITHUB ? 'Fetching public data...' : 'Calculating Portfolio Score...'}
            </p>
          </div>
        )}

        {status === LoadingState.ERROR && (
          <div className="max-w-xl mx-auto bg-red-500/5 border border-red-500/20 p-8 rounded-[2rem] flex items-start gap-6 animate-in slide-in-from-top-4 duration-500 backdrop-blur-xl">
            <div className="bg-red-500/10 p-3 rounded-2xl">
              <AlertCircle className="text-red-500 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-black uppercase text-xs tracking-widest mb-2">Analysis Failed</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {status === LoadingState.SUCCESS && evaluation && userData && (
          <div className="space-y-12">
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <ScoreCard result={evaluation} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-12">
                <div className="bg-[#10101a] rounded-[2.5rem] border border-white/5 p-6 sm:p-10 relative overflow-hidden group hover:border-white/10 transition-colors animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-500 via-pink-500 to-cyan-500"></div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-500/10 p-2.5 rounded-xl">
                        <Sparkles className="text-purple-400 w-5 h-5" />
                      </div>
                      <h3 className="text-white font-black uppercase text-[10px] tracking-[0.3em]">Recruiter Insights</h3>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 text-xl leading-[1.6] font-medium mb-10 italic">
                    "{evaluation.summary}"
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-500/5 rounded-3xl p-6 border border-green-500/10 hover:bg-green-500/[0.08] transition-colors">
                      <h4 className="text-green-400 font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Trophy className="w-3.5 h-3.5" /> Key Strengths
                      </h4>
                      <div className="space-y-3">
                        {evaluation.strengths.map((s, i) => (
                          <div key={i} className="text-slate-400 text-sm font-medium flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500/40"></div>
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-red-500/5 rounded-3xl p-6 border border-red-500/10 hover:bg-red-500/[0.08] transition-colors">
                      <h4 className="text-red-400 font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5" /> Red Flags
                      </h4>
                      <div className="space-y-3">
                        {evaluation.weaknesses.map((w, i) => (
                          <div key={i} className="text-slate-400 text-sm font-medium flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500/40"></div>
                            {w}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                  <StatsOverview repos={repos} />
                </div>
                
                <div className="bg-[#10101a] rounded-[2.5rem] border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                  <div className="p-6 sm:p-10 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-cyan-500/10 p-2.5 rounded-xl">
                        <Rocket className="text-cyan-400 w-5 h-5" />
                      </div>
                      <h3 className="font-black text-white uppercase text-[10px] tracking-[0.3em]">Actionable Roadmap</h3>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-white/5">
                    {evaluation.recommendations.map((rec, i) => (
                      <div key={i} className="p-6 sm:p-10 group hover:bg-white/[0.02] transition-all">
                        <div className="flex items-start gap-4 sm:gap-8 mb-8">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0 text-base font-black text-slate-500 group-hover:border-purple-500/50 group-hover:text-purple-400 transition-colors">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3">
                              <span className={`text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-1 rounded-lg uppercase tracking-widest border shadow-xl ${
                                rec.priority === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                rec.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              }`}>
                                {rec.priority} PRIORITY
                              </span>
                              <div className="bg-green-500/10 text-green-400 text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-1 rounded-lg border border-green-500/20 uppercase tracking-widest">
                                +{rec.overallGain} PTS SCORE GAIN
                              </div>
                            </div>
                            <h4 className="text-white text-xl sm:text-2xl font-black mb-3 group-hover:text-purple-300 transition-colors tracking-tight leading-tight break-words">{rec.title}</h4>
                            <p className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed max-w-2xl">{rec.action}</p>
                          </div>
                        </div>

                        <div className="ml-0 sm:ml-20 bg-white/[0.03] border border-white/5 rounded-3xl p-4 sm:p-6 overflow-hidden">
                           <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                              <TrendingUp className="w-3 h-3" /> Impact on Dimensions
                           </h5>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {rec.categoryImpacts.map((impact, idx) => {
                                const currentScore = evaluation.metrics[impact.category] || 0;
                                const potentialScore = Math.min(100, currentScore + impact.gain);
                                return (
                                  <div key={idx} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                                        {getCategoryIcon(impact.category)}
                                        {impact.category}
                                      </div>
                                      <span className="text-[10px] font-black text-green-400">+{impact.gain}</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full relative overflow-hidden">
                                      <div className="absolute inset-0 bg-white/10" style={{ width: `${currentScore}%` }}></div>
                                      <div className="absolute h-full bg-green-500/60" style={{ left: `${currentScore}%`, width: `${impact.gain}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-[9px] font-bold text-slate-600">
                                      <span>Current: {currentScore}</span>
                                      <span className="text-slate-400">Target: {potentialScore}</span>
                                    </div>
                                  </div>
                                );
                              })}
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-10">
                <div className="bg-[#10101a] p-6 sm:p-12 rounded-[2.5rem] border border-white/5 text-center shadow-2xl sticky top-28 backdrop-blur-3xl group transition-all hover:border-white/10 overflow-hidden">
                  <div className="relative inline-block mb-10">
                    <div className="absolute -inset-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <img 
                      src={userData.avatar_url} 
                      alt={userData.login} 
                      className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full mx-auto border-4 border-white/5 shadow-2xl" 
                    />
                    <div className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 sm:w-7 sm:h-7 rounded-full border-4 border-[#10101a] shadow-lg animate-pulse"></div>
                  </div>
                  
                  <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tighter mb-2 break-words leading-tight px-4">
                    {userData.name || userData.login}
                  </h4>
                  <div className="flex items-center justify-center gap-2 text-slate-500 text-[10px] sm:text-xs font-bold mb-8 uppercase tracking-widest">
                    <MapPin className="w-3 h-3 text-purple-400" /> {userData.location || 'Remote'}
                  </div>
                  
                  <p className="text-slate-400 text-sm mb-10 leading-relaxed px-4 font-medium break-words">
                    {userData.bio || 'Building the future of software, one commit at a time.'}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-10 px-2">
                    <div className="bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-all flex flex-col items-center justify-center min-w-0">
                      <div className="text-slate-500 text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] mb-1 leading-none whitespace-nowrap">Impact</div>
                      <div className="text-white text-xl sm:text-2xl font-black leading-none my-1">
                        <AnimatedNumber value={userData.followers} />
                      </div>
                      <div className="text-[7px] sm:text-[8px] font-bold text-slate-600 uppercase tracking-widest">Followers</div>
                    </div>
                    <div className="bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-all flex flex-col items-center justify-center min-w-0">
                      <div className="text-slate-500 text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] mb-1 leading-none whitespace-nowrap">Output</div>
                      <div className="text-white text-xl sm:text-2xl font-black leading-none my-1">
                        <AnimatedNumber value={userData.public_repos} />
                      </div>
                      <div className="text-[7px] sm:text-[8px] font-bold text-slate-600 uppercase tracking-widest">Repos</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 px-4">
                    <a 
                      href={userData.html_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-4 sm:py-5 bg-white text-black rounded-2xl font-black text-xs transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.1)] uppercase tracking-widest"
                    >
                      <Github className="w-4 h-4" /> View on GitHub
                    </a>
                    <button 
                      onClick={() => window.location.reload()}
                      className="flex items-center justify-center gap-3 w-full py-4 sm:py-5 bg-white/5 hover:bg-white/10 rounded-2xl text-white font-black text-xs transition-all border border-white/5 uppercase tracking-widest"
                    >
                      <Share2 className="w-4 h-4" /> Share Results
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 text-center py-20 border-t border-white/5 mt-20 bg-[#06060b]">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Built for <strong>UnsaidTalks Hackathon 2026</strong>. <br className="hidden md:block" />
            Empowering students to build recruiter-ready portfolios.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
