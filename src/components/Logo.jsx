import React from 'react';
import logoImage from `${import.meta.env.BASE_URL}logo.png`;

// Enhanced PipeLinePro Logo with #bf8140 background
const Logo = ({ size = 'medium', showTagline = false, className = '' }) => {
  const sizeClasses = {
    small: 'w-10 h-10 text-sm',
    medium: 'w-14 h-14 text-lg', 
    large: 'w-20 h-20 text-xl'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-2xl'
  };

  const taglineSizes = {
    small: 'text-xs',
    medium: 'text-xs', 
    large: 'text-sm'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon with Pipeline Design */}
      <div 
        className={`${sizeClasses[size]} rounded-xl flex items-center justify-center shadow-premium border-2 border-white/20 transition-all duration-300 hover:scale-105 overflow-hidden`}
        style={{
          background: 'linear-gradient(135deg, #bf8140 0%, #d4934f 50%, #bf8140 100%)',
          boxShadow: '0 4px 15px rgba(191, 129, 64, 0.3), 0 2px 8px rgba(191, 129, 64, 0.2)'
        }}
      >
        <img 
          src={logoImage} 
          alt="PipeLinePro Logo" 
          className="w-full h-full object-contain p-1"
          style={{ filter: 'none' }}
          onError={(e) => {
            // Fallback to text if image fails
            e.target.style.display = 'none';
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'flex';
            }
          }}
        />
        <div 
          className="w-full h-full flex items-center justify-center text-white font-bold"
          style={{ display: 'none' }}
        >
          <span className={`${size === 'small' ? 'text-lg' : size === 'medium' ? 'text-2xl' : 'text-3xl'}`}>
            PL
          </span>
        </div>
      </div>

      {/* Logo Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h1 className={`${textSizes[size]} font-extrabold tracking-tight`} style={{ color: '#391f00' }}>
            PipeLine<span style={{ color: '#bf8140', fontWeight: '900' }}>Pro</span>
          </h1>
          {size !== 'small' && (
            <span 
              className="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-widest border"
              style={{ 
                backgroundColor: 'rgba(191, 129, 64, 0.1)', 
                color: '#391f00',
                borderColor: 'rgba(191, 129, 64, 0.3)'
              }}
            >
              SaaS
            </span>
          )}
        </div>
        
        {showTagline && (
          <p 
            className={`${taglineSizes[size]} font-medium uppercase tracking-tighter`}
            style={{ color: '#6b4423' }}
          >
            Build. Automate. Deploy.
          </p>
        )}
      </div>
    </div>
  );
};

// Full Logo Component with Background
export const FullLogo = ({ className = '' }) => {
  return (
    <div 
      className={`relative rounded-2xl p-8 flex items-center justify-center ${className}`}
      style={{
        background: 'linear-gradient(135deg, #bf8140 0%, #d4934f 50%, #c88a3f 100%)',
        boxShadow: '0 20px 40px rgba(191, 129, 64, 0.4), 0 10px 20px rgba(191, 129, 64, 0.3)'
      }}
    >
      {/* Subtle Glow Effect */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-50"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)'
        }}
      />
      
      {/* Logo Content */}
      <div className="relative z-10 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
            {/* Enhanced Logo Icon */}
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center border-3 border-white/30 overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
              }}
            >
              <img 
                src={logoImage} 
                alt="PipeLinePro Logo" 
                className="w-full h-full object-contain p-1"
                style={{ filter: 'none' }}
                onError={(e) => {
                  // Fallback to text if image fails
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'flex';
                  }
                }}
              />
              <div 
                className="w-full h-full flex items-center justify-center text-white font-bold text-3xl"
                style={{ display: 'none' }}
              >
                PL
              </div>
            </div>
        </div>

        {/* Logo Text */}
        <div className="mb-3">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: '#391f00' }}>
            PipeLine<span style={{ color: '#bf8140', fontWeight: '900' }}>Pro</span>
          </h1>
          <div className="flex items-center justify-center gap-3">
            <span 
              className="px-3 py-1 text-xs font-bold rounded-full uppercase tracking-widest border"
              style={{ 
                backgroundColor: 'rgba(191, 129, 64, 0.1)', 
                color: '#391f00',
                borderColor: 'rgba(191, 129, 64, 0.3)'
              }}
            >
              SaaS
            </span>
            
            {/* Platform Icons */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 0v24h24v-24h-24zm6.951 17.516l1.436-8.398h2.223l-1.439 8.398h-2.22zm4.543-8.398l-.352 2.058h2.223l.352-2.058h-2.223zm2.566 0l-.352 2.058h2.223l.352-2.058h-2.223zm2.566 0l-.352 2.058h2.223l.352-2.058h-2.223z"/>
                </svg>
              </div>
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.913 1.213l-1.427 1.427c-.78-.39-1.66-.613-2.585-.613-3.311 0-6 2.689-6 6 0 .925.223 1.805.613 2.585l-1.427 1.427c-.724-1.165-1.186-2.514-1.186-4.012 0-4.418 3.582-8 8-8 1.498 0 2.847.462 4.012 1.186zm1.414 1.414l1.427 1.427c.724 1.165 1.186 2.514 1.186 4.012 0 4.418-3.582 8-8 8-1.498 0-2.847-.462-4.012-1.186l1.427-1.427c.78.39 1.66.613 2.585.613 3.311 0 6-2.689 6-6 0-.925-.223-1.805-.613-2.585z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-lg font-medium uppercase tracking-wider" style={{ color: '#6b4423' }}>
          Build. Automate. Deploy.
        </p>
      </div>
    </div>
  );
};

export default Logo;
