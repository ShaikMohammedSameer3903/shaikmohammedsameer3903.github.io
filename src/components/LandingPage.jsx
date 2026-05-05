import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg font-inter overflow-x-hidden">
      {/* Sticky Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white text-sm font-bold">⚡</span>
            </div>
            <span className="text-text font-bold text-xl tracking-tight">PipeLine<span className="text-primary">Pro</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Features</a>
            <a href="#workflow" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Workflow</a>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl pointer-events-none">
          <div className="absolute top-20 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-8 border border-primary/20 animate-fade-in">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">New: Interactive Simulator 2.0</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-text mb-6 leading-tight animate-slide-up">
            Build, Test & Visualize <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-pulse-slow">
              CI/CD Pipelines
            </span> in Seconds
          </h1>
          
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-slide-up delay-100">
            The professional DevOps workspace to generate production-ready configurations, 
            run step-by-step simulations, and visualize your automation flow instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in delay-200">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-10 py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Launch Dashboard <span className="text-xl">→</span>
            </button>
            <button
              onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 bg-white text-text font-bold rounded-xl border border-border hover:bg-surface-secondary transition-all duration-300"
            >
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="py-10 border-y border-border bg-surface/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-text">20+</p>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Templates</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-text">3</p>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Platforms</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-text">100%</p>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Visualized</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-text">Instant</p>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Generation</p>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-base font-bold text-primary uppercase tracking-widest mb-4">Powerful Features</h2>
            <h3 className="text-4xl font-extrabold text-text">Everything for DevOps Teams</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 bg-surface rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">⚡</span>
              </div>
              <h4 className="text-xl font-bold text-text mb-3">Intelligent Generator</h4>
              <p className="text-text-secondary text-sm leading-relaxed">
                Production-ready YAML and Groovy scripts generated from best practices for Node.js, Java, and Python.
              </p>
            </div>

            <div className="group p-8 bg-surface rounded-2xl border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/5">
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🛤️</span>
              </div>
              <h4 className="text-xl font-bold text-text mb-3">Visual Flow Engine</h4>
              <p className="text-text-secondary text-sm leading-relaxed">
                See your pipeline stages as an interactive diagram. Understand dependencies and execution flow visually.
              </p>
            </div>

            <div className="group p-8 bg-surface rounded-2xl border border-border hover:border-success/50 transition-all duration-300 hover:shadow-2xl hover:shadow-success/5">
              <div className="w-14 h-14 bg-success/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🧪</span>
              </div>
              <h4 className="text-xl font-bold text-text mb-3">Real-time Simulator</h4>
              <p className="text-text-secondary text-sm leading-relaxed">
                Run your pipeline in a simulated environment. View logs, track progress, and catch errors before deployment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24 px-6 bg-surface-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-border overflow-hidden p-2 md:p-4 scale-95 md:scale-100 transition-transform hover:scale-[1.01] duration-500">
             <div className="rounded-2xl overflow-hidden border border-border">
                {/* Mock Browser UI */}
                <div className="bg-surface border-b border-border p-4 flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-error"></div>
                    <div className="w-3 h-3 rounded-full bg-warning"></div>
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                  </div>
                  <div className="bg-surface-secondary rounded-md flex-1 py-1 px-4 text-xs text-text-muted font-mono flex items-center gap-2">
                    <span className="text-success">🔒</span> pipeline-pro.io/dashboard
                  </div>
                </div>
                <div className="aspect-video bg-bg relative flex flex-col items-center justify-center p-8">
                  <div className="w-full max-w-4xl bg-surface rounded-xl shadow-lg p-6 border border-border">
                    <div className="flex gap-4 mb-6">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-2 rounded-full flex-1 ${i <= 3 ? 'bg-primary' : 'bg-border'}`}></div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="col-span-2 space-y-4">
                        <div className="h-4 bg-surface-secondary rounded w-1/3"></div>
                        <div className="h-32 bg-gray-900 rounded-lg"></div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-4 bg-surface-secondary rounded w-1/2"></div>
                        <div className="h-32 bg-surface-secondary rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-primary/5 flex items-center justify-center backdrop-blur-[1px]">
                     <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all animate-bounce"
                     >
                        <span className="text-3xl ml-1">▶</span>
                     </button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-text text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-20">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-white text-sm font-bold">⚡</span>
                </div>
                <span className="text-white font-bold text-xl tracking-tight">PipeLine<span className="text-primary">Pro</span></span>
              </div>
              <p className="text-text-muted max-w-xs text-sm">
                Streamlining automation for modern engineering teams. Build better, deploy faster.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
              <div>
                <h5 className="font-bold mb-6 text-sm uppercase tracking-widest text-primary">Product</h5>
                <ul className="space-y-4 text-sm text-text-muted">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Simulator</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold mb-6 text-sm uppercase tracking-widest text-primary">Resources</h5>
                <ul className="space-y-4 text-sm text-text-muted">
                  <li><a href="#" className="hover:text-white transition-colors">Docs</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Guide</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-10 border-t border-white/10 text-center flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-text-muted">© 2026 PipeLinePro. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-text-muted">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
