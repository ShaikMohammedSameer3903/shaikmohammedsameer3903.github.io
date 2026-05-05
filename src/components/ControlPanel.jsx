import React, { useMemo } from 'react'

// Multi-cloud deployment types per provider
const DEPLOYMENT_MAP = {
  aws: [
    { value: 'ec2', label: 'EC2 / VM', icon: '🖥️' },
    { value: 'lambda', label: 'Lambda (Serverless)', icon: '⚡' },
    { value: 'ecs', label: 'ECS / Fargate', icon: '📦' },
    { value: 's3-static', label: 'S3 Static Hosting', icon: '🌐' },
    { value: 'eks', label: 'EKS (K8s)', icon: '☸️' },
  ],
  azure: [
    { value: 'vm', label: 'Azure VM', icon: '🖥️' },
    { value: 'functions', label: 'Azure Functions', icon: '⚡' },
    { value: 'aks', label: 'AKS (K8s)', icon: '☸️' },
    { value: 'app-service', label: 'App Service', icon: '📱' },
    { value: 'static-web', label: 'Static Web Apps', icon: '🌐' },
  ],
  gcp: [
    { value: 'compute', label: 'Compute Engine', icon: '🖥️' },
    { value: 'cloud-run', label: 'Cloud Run', icon: '🚀' },
    { value: 'cloud-functions', label: 'Cloud Functions', icon: '⚡' },
    { value: 'gke', label: 'GKE (K8s)', icon: '☸️' },
    { value: 'firebase', label: 'Firebase Hosting', icon: '🔥' },
  ],
  github: [
    { value: 'docker', label: 'Docker', icon: '�' },
    { value: 'kubernetes', label: 'Kubernetes', icon: '☸️' },
    { value: 'vm-ssh', label: 'VM (SSH)', icon: '🖥️' },
    { value: 'serverless', label: 'Serverless', icon: '⚡' },
    { value: 'static-pages', label: 'GitHub Pages', icon: '🌐' },
  ],
  jenkins: [
    { value: 'docker', label: 'Docker', icon: '🐳' },
    { value: 'kubernetes', label: 'Kubernetes', icon: '☸️' },
    { value: 'ssh-deploy', label: 'SSH Deploy', icon: '🖥️' },
    { value: 'custom-script', label: 'Custom Script', icon: '📜' },
  ],
  vercel: [
    { value: 'static', label: 'Static Hosting', icon: '🌐' },
    { value: 'serverless', label: 'Serverless Functions', icon: '⚡' },
    { value: 'edge', label: 'Edge Functions', icon: '🚀' },
  ],
  netlify: [
    { value: 'static', label: 'Static Hosting', icon: '🌐' },
    { value: 'functions', label: 'Netlify Functions', icon: '⚡' },
    { value: 'edge', label: 'Edge Functions', icon: '🚀' },
  ],
  digitalocean: [
    { value: 'app-platform', label: 'App Platform', icon: '📱' },
    { value: 'droplet', label: 'Droplet (VM)', icon: '🖥️' },
    { value: 'doks', label: 'DOKS (K8s)', icon: '☸️' },
    { value: 'functions', label: 'Functions', icon: '⚡' },
  ],
}

// Smart recommendation logic
const LANGUAGE_RECOMMENDATIONS = {
  react: { platforms: ['vercel', 'netlify'], deployment: 'static', note: 'Best for frontend apps' },
  node: { platforms: ['aws', 'digitalocean'], deployment: 'docker', note: 'Best for backend services' },
  python: { platforms: ['aws', 'gcp'], deployment: 'lambda', note: 'Best for ML/API services' },
  java: { platforms: ['aws', 'azure'], deployment: 'ecs', note: 'Best for enterprise apps' },
  go: { platforms: ['gcp', 'aws'], deployment: 'cloud-run', note: 'Best for microservices' },
}

const languages = [
  { value: 'node', label: 'Node.js', icon: '🟢' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'react', label: 'React', icon: '⚛️' },
  { value: 'go', label: 'Go', icon: '🔵' },
  { value: 'docker', label: 'Dockerfile', icon: '🐳' },
]

function ControlPanel({ 
  selectedPlatform,
  selectedLanguage, 
  selectedDeployment, 
  onLanguageChange, 
  onDeploymentChange,
  onGenerate,
  isLoading 
}) {
  // Get deployment options based on selected platform
  const deploymentOptions = useMemo(() => {
    return DEPLOYMENT_MAP[selectedPlatform] || DEPLOYMENT_MAP.github
  }, [selectedPlatform])

  // Get smart recommendation
  const recommendation = useMemo(() => {
    return LANGUAGE_RECOMMENDATIONS[selectedLanguage]
  }, [selectedLanguage])

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#bf8140] rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white text-lg">⚙️</span>
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800">Pipeline Configuration</h2>
          <p className="text-xs text-slate-500 font-medium">Define your architecture stack</p>
        </div>
      </div>

      {/* Smart Recommendation Banner */}
      {recommendation && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
          <span className="text-lg">💡</span>
          <div>
            <p className="text-xs font-bold text-blue-800">Recommended: {recommendation.platforms.join(' or ')}</p>
            <p className="text-[10px] text-blue-600">{recommendation.note}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Programming Language */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
            Language / Framework
          </label>
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#bf8140]/20 focus:border-[#bf8140] transition-all appearance-none cursor-pointer hover:bg-slate-100"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.icon} {lang.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Deployment Type - Dynamic based on platform */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
            Deployment Target
            <span className="text-[9px] text-slate-300 ml-2 normal-case tracking-normal">({selectedPlatform?.toUpperCase()})</span>
          </label>
          <div className="relative">
            <select
              value={selectedDeployment}
              onChange={(e) => onDeploymentChange(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#bf8140]/20 focus:border-[#bf8140] transition-all appearance-none cursor-pointer hover:bg-slate-100"
            >
              {deploymentOptions.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Generate Button */}
      <div className="mt-8">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full py-4 bg-[#bf8140] text-white rounded-2xl font-black hover:bg-[#a6713a] transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-[#bf8140]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Architecting Pipeline...</span>
            </>
          ) : (
            <>
              <span>🚀 Generate CI/CD Pipeline</span>
            </>
          )}
        </button>
      </div>

      {/* Configuration Summary */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stack Summary</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 border border-slate-200">
                {languages.find(l => l.value === selectedLanguage)?.icon} {languages.find(l => l.value === selectedLanguage)?.label}
              </span>
              <span className="text-slate-300">→</span>
              <span className="bg-orange-50 px-3 py-1.5 rounded-lg text-xs font-bold text-orange-700 border border-orange-200">
                {deploymentOptions.find(d => d.value === selectedDeployment)?.icon} {deploymentOptions.find(d => d.value === selectedDeployment)?.label}
              </span>
              <span className="text-slate-300">→</span>
              <span className="bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 border border-blue-200">
                {selectedPlatform?.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ControlPanel
