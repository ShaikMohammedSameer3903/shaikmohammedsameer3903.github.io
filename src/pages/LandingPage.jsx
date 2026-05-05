import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowRight, Play, CheckCircle2, Bot, Zap, Shield, GitBranch, 
  Rocket, Terminal, Code, Cpu, Globe, Lock, Sparkles, Layers, 
  Activity, Clock, ChevronRight, Star, Users, MessageSquare,
  Facebook, Twitter, Github, Linkedin, Mail
} from 'lucide-react';

// Terminal Animation Component
const TerminalAnimation = () => {
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);

  const terminalLines = [
    { text: '$ pipelinepro init --platform aws', color: 'text-green-400', delay: 0 },
    { text: '⠋ Detecting project type...', color: 'text-blue-400', delay: 800 },
    { text: '✓ Node.js project detected', color: 'text-emerald-400', delay: 1600 },
    { text: '⠋ Generating CI/CD pipeline...', color: 'text-blue-400', delay: 2400 },
    { text: '✓ Pipeline generated: .github/workflows/deploy.yml', color: 'text-emerald-400', delay: 3200 },
    { text: '⠋ Running simulation...', color: 'text-blue-400', delay: 4000 },
    { text: '✓ Build stage passed (12s)', color: 'text-emerald-400', delay: 4800 },
    { text: '✓ Test stage passed (8s)', color: 'text-emerald-400', delay: 5400 },
    { text: '✓ Deploy stage passed (24s)', color: 'text-emerald-400', delay: 6000 },
    { text: '🚀 Pipeline ready for production!', color: 'text-amber-400', delay: 6800 },
  ];

  useEffect(() => {
    const timers = terminalLines.map((line, i) =>
      setTimeout(() => {
        setLines(prev => [...prev, line]);
        setCurrentLine(i);
      }, line.delay)
    );
    const resetTimer = setTimeout(() => {
      setLines([]);
      setCurrentLine(0);
    }, 9000);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(resetTimer);
    };
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto bg-[#0d1117] rounded-2xl border border-white/10 shadow-2xl shadow-blue-500/10 overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-white/5">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
          <Terminal size={10} />
          pipeline-pro-terminal
        </div>
      </div>
      {/* Terminal Body */}
      <div className="p-4 h-64 font-mono text-[13px] leading-relaxed overflow-hidden">
        <AnimatePresence>
          {lines.map((line, i) => (
            <motion.div
              key={`${i}-${line.text}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${line.color} mb-1`}
            >
              {line.text}
            </motion.div>
          ))}
        </AnimatePresence>
        {currentLine < terminalLines.length - 1 && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="inline-block w-2 h-4 bg-green-400 ml-1"
          />
        )}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const features = [
    { 
      icon: Layers, 
      title: 'Visual Builder', 
      desc: 'Design complex multi-stage pipelines with our intuitive drag-and-drop interface.', 
      color: 'from-blue-500 to-indigo-600' 
    },
    { 
      icon: Bot, 
      title: 'AI Smart Fix', 
      desc: 'Let AI analyze your failed builds and suggest one-click fixes for broken pipelines.', 
      color: 'from-purple-500 to-violet-600' 
    },
    { 
      icon: Shield, 
      title: 'Safe Simulation', 
      desc: 'Test your CI/CD logic in a sandbox before pushing to production servers.', 
      color: 'from-emerald-500 to-teal-600' 
    },
    { 
      icon: Rocket, 
      title: 'Instant Deploy', 
      desc: 'Direct integrations with AWS, GCP, Azure, and DigitalOcean for zero-touch delivery.', 
      color: 'from-orange-500 to-rose-500' 
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Lead DevOps @ FinTech",
      content: "PipelinePro cut our deployment setup time by 80%. The AI fix feature is a lifesaver during 2 AM incidents.",
      avatar: "SC"
    },
    {
      name: "Marcus Thorne",
      role: "CTO @ SaaSly",
      content: "The visual builder makes it so easy for our junior devs to contribute to CI/CD without breaking things.",
      avatar: "MT"
    },
    {
      name: "Elena Rodriguez",
      role: "Senior Architect",
      content: "Best-in-class YAML generation. It actually follows security best practices out of the box.",
      avatar: "ER"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-inter">
      {/* 🧭 Sticky Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100 h-16 sm:h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Rocket size={18} className="sm:size-5" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Pipeline<span className="text-blue-600">Pro</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-lg"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 sm:px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Join Free
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 🚀 Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] sm:text-xs font-black uppercase tracking-widest text-blue-600 mb-6 sm:mb-8"
            >
              <Sparkles size={12} /> Version 2.0 is live
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-7xl md:text-9xl font-black tracking-tight leading-[1.05] mb-6 text-slate-900"
            >
              CI/CD made <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">human-friendly.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg sm:text-2xl text-slate-500 max-w-3xl leading-relaxed mb-12"
            >
              Stop wrestling with complex YAML. Build, simulate, and fix your CI/CD pipelines with <span className="text-slate-900 font-bold">production-grade AI</span> in one unified workspace.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <button 
                onClick={() => user ? navigate('/pipeline-builder') : navigate('/register')}
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group"
              >
                {user ? 'Open Builder' : 'Start Building Now'} 
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/templates')}
                className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-black text-lg hover:border-slate-200 transition-all"
              >
                Browse Templates
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative mx-auto max-w-5xl"
          >
            <div className="rounded-3xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden bg-white">
              <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                </div>
                <div className="mx-auto text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Live Pipeline Simulation
                </div>
              </div>
              <div className="p-4 sm:p-8 bg-slate-900">
                <TerminalAnimation />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 📦 Features Grid */}
      <section id="features" className="py-24 bg-slate-50 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-blue-600 text-sm font-black uppercase tracking-[0.3em] mb-4">Core Platform</h2>
            <p className="text-3xl sm:text-5xl font-black text-slate-900">Built for the modern DevOps cycle.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:border-blue-100 transition-all duration-500 group"
              >
                <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-100 group-hover:rotate-6 transition-transform`}>
                  <f.icon size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed text-base">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🛣️ How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="text-blue-600 text-sm font-black uppercase tracking-[0.3em] mb-4">Workflow</h2>
              <p className="text-3xl sm:text-5xl font-black text-slate-900 mb-8 leading-tight">From prototype to <br /> production in 3 steps.</p>
              
              <div className="space-y-10">
                {[
                  { title: 'Define Architecture', desc: 'Select your tech stack and deployment target. Our AI suggests the optimal pipeline structure.', icon: Layers },
                  { title: 'Validate Locally', desc: 'Run a sandbox simulation of your entire workflow without wasting build minutes on the cloud.', icon: Shield },
                  { title: 'Push and Ship', desc: 'Export your YAML or connect your Git repo for automated zero-downtime deployments.', icon: Rocket },
                ].map((step, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 mb-2">{step.title}</h4>
                      <p className="text-slate-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600/5 rounded-[3rem] -rotate-3" />
              <div className="relative bg-white p-6 sm:p-10 rounded-[3rem] border border-slate-100 shadow-2xl">
                <div className="space-y-4">
                  {[
                    { label: 'Security Scan', status: 'success', time: '1.2s' },
                    { label: 'Unit Tests', status: 'success', time: '4.5s' },
                    { label: 'Docker Build', status: 'running', time: '12.8s' },
                    { label: 'Cloud Deploy', status: 'pending', time: '--' },
                  ].map((job, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          job.status === 'success' ? 'bg-emerald-500' : 
                          job.status === 'running' ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'
                        }`} />
                        <span className="font-bold text-slate-700">{job.label}</span>
                      </div>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{job.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 💬 Testimonials */}
      <section className="py-24 bg-slate-900 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-blue-400 text-sm font-black uppercase tracking-[0.3em] mb-4">Feedback</h2>
            <p className="text-3xl sm:text-5xl font-black text-white">Loved by DevOps engineers.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-8 bg-slate-800/50 border border-slate-700 rounded-[2rem]">
                <div className="flex gap-1 text-amber-400 mb-6">
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                </div>
                <p className="text-slate-300 mb-8 leading-relaxed italic">"{t.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white font-bold">{t.name}</div>
                    <div className="text-slate-500 text-xs font-medium">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🏁 Footer */}
      <footer className="bg-white border-t border-slate-100 pt-20 pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                  <Rocket size={16} />
                </div>
                <span className="text-lg font-bold text-slate-900">PipelinePro</span>
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed mb-6">
                The developer's choice for modern, visual, and AI-powered CI/CD automation.
              </p>
              <div className="flex gap-4">
                <Twitter className="text-slate-400 hover:text-blue-500 cursor-pointer transition-colors" size={20} />
                <Github className="text-slate-400 hover:text-slate-900 cursor-pointer transition-colors" size={20} />
                <Linkedin className="text-slate-400 hover:text-blue-700 cursor-pointer transition-colors" size={20} />
              </div>
            </div>
            
            <div>
              <h5 className="font-black text-slate-900 uppercase tracking-widest text-[11px] mb-6">Product</h5>
              <ul className="space-y-4 text-sm font-semibold text-slate-500">
                <li className="hover:text-blue-600 cursor-pointer">Features</li>
                <li className="hover:text-blue-600 cursor-pointer">AI Fix</li>
                <li className="hover:text-blue-600 cursor-pointer">Templates</li>
                <li className="hover:text-blue-600 cursor-pointer">Pricing</li>
              </ul>
            </div>

            <div>
              <h5 className="font-black text-slate-900 uppercase tracking-widest text-[11px] mb-6">Resources</h5>
              <ul className="space-y-4 text-sm font-semibold text-slate-500">
                <li className="hover:text-blue-600 cursor-pointer">Documentation</li>
                <li className="hover:text-blue-600 cursor-pointer">API Ref</li>
                <li className="hover:text-blue-600 cursor-pointer">Guides</li>
                <li className="hover:text-blue-600 cursor-pointer">Community</li>
              </ul>
            </div>

            <div>
              <h5 className="font-black text-slate-900 uppercase tracking-widest text-[11px] mb-6">Legal</h5>
              <ul className="space-y-4 text-sm font-semibold text-slate-500">
                <li className="hover:text-blue-600 cursor-pointer">Privacy</li>
                <li className="hover:text-blue-600 cursor-pointer">Terms</li>
                <li className="hover:text-blue-600 cursor-pointer">Security</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-xs font-medium"> 2026 PipelinePro. All rights reserved.</p>
            <div className="flex gap-6 text-xs font-bold text-slate-400">
              <span className="hover:text-slate-600 cursor-pointer transition-colors uppercase tracking-widest">Status: Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
