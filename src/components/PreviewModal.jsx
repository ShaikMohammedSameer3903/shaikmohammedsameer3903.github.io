import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaCopy, 
  FaCheck, 
  FaGithub, 
  FaAws, 
  FaDocker, 
  FaCodeBranch, 
  FaCloud, 
  FaBolt,
  FaDownload,
  FaExternalLinkAlt,
  FaRocket,
  FaClipboardList,
  FaCode,
  FaQuestionCircle
} from 'react-icons/fa';

const PreviewModal = ({ template, onClose, onUseTemplate }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const getPlatformIcon = (platform) => {
    const icons = {
      github: <FaGithub className="text-2xl" />,
      aws: <FaAws className="text-2xl" />,
      jenkins: <FaCodeBranch className="text-2xl" />,
      docker: <FaDocker className="text-2xl" />,
      kubernetes: <FaCloud className="text-2xl" />,
      serverless: <FaBolt className="text-2xl" />
    };
    return icons[platform] || <FaCodeBranch className="text-2xl" />;
  };

  const getPlatformColor = (platform) => {
    const colors = {
      github: 'from-gray-700 to-gray-900',
      aws: 'from-orange-400 to-orange-600',
      jenkins: 'from-red-500 to-red-700',
      docker: 'from-blue-400 to-blue-600',
      kubernetes: 'from-blue-600 to-blue-800',
      serverless: 'from-purple-500 to-purple-700'
    };
    return colors[platform] || 'from-gray-500 to-gray-700';
  };

  const getDifficultyBadgeColor = (difficulty) => {
    const colors = {
      Beginner: 'bg-green-100 text-green-800',
      Intermediate: 'bg-yellow-100 text-yellow-800',
      Advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(template.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([template.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.id.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.yml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!template) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaRocket /> },
    { id: 'requirements', label: 'Requirements', icon: <FaClipboardList /> },
    { id: 'code', label: 'Source Code', icon: <FaCode /> }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Header */}
          <div className={`bg-gradient-to-r ${getPlatformColor(template.platform)} text-white p-8 relative overflow-hidden`}>
            <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                  {getPlatformIcon(template.platform)}
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h2 className="text-3xl font-black tracking-tight">{template.name}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getDifficultyBadgeColor(template.difficulty)}`}>
                      {template.difficulty}
                    </span>
                  </div>
                  <p className="text-blue-100 font-medium opacity-80 uppercase tracking-widest text-sm">{template.category}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-100 bg-gray-50/50 px-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-6 font-bold text-sm transition-all border-b-4 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full mr-3" />
                      About this Template
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-lg">{template.description}</p>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full mr-3" />
                      Execution Steps
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {template.stepsExplanation.map((step, index) => (
                        <div key={index} className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-black mr-4 shadow-lg shadow-blue-200">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 font-medium">{step}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                      <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4">Env Variables</h3>
                      <div className="flex flex-wrap gap-2">
                        {template.envVariables.map((envVar, index) => (
                          <span key={index} className="px-3 py-1.5 bg-white text-blue-700 text-xs font-bold rounded-lg border border-blue-200 font-mono">
                            {envVar}
                          </span>
                        ))}
                        {template.envVariables.length === 0 && <p className="text-blue-400 text-xs font-bold italic">None required</p>}
                      </div>
                    </section>

                    <section className="p-6 bg-red-50/50 rounded-3xl border border-red-100">
                      <h3 className="text-sm font-black text-red-900 uppercase tracking-widest mb-4">Required Secrets</h3>
                      <div className="flex flex-wrap gap-2">
                        {template.secrets.map((secret, index) => (
                          <span key={index} className="px-3 py-1.5 bg-white text-red-700 text-xs font-bold rounded-lg border border-red-200 font-mono">
                            {secret}
                          </span>
                        ))}
                        {template.secrets.length === 0 && <p className="text-red-400 text-xs font-bold italic">None required</p>}
                      </div>
                    </section>
                  </div>
                </motion.div>
              )}

              {activeTab === 'requirements' && (
                <motion.div
                  key="requirements"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-yellow-50/50 border border-yellow-100 p-6 rounded-3xl mb-8">
                    <h4 className="flex items-center text-yellow-800 font-black uppercase tracking-widest text-xs mb-4">
                      <FaQuestionCircle className="mr-2 text-lg" /> Prerequisites & Setup
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {template.requirements.map((requirement, index) => (
                        <div key={index} className="flex items-start p-4 bg-white rounded-2xl border border-yellow-100">
                          <div className="w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center mr-3 mt-0.5">
                            <FaCheck className="text-[10px]" />
                          </div>
                          <span className="text-gray-700 font-bold text-sm">{requirement}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                    <h4 className="text-gray-900 font-bold mb-4">Ready to deploy?</h4>
                    <ol className="space-y-4 text-gray-600 font-medium">
                      <li className="flex items-center"><span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs mr-3 font-bold">1</span> Verify all prerequisites are met.</li>
                      <li className="flex items-center"><span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs mr-3 font-bold">2</span> Copy the source code below.</li>
                      <li className="flex items-center"><span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs mr-3 font-bold">3</span> Set up required secrets in your CI/CD platform.</li>
                    </ol>
                  </div>
                </motion.div>
              )}

              {activeTab === 'code' && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-2 px-2">
                    <h4 className="text-gray-900 font-black uppercase tracking-widest text-xs">Pipeline Definition</h4>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-bold text-xs"
                      >
                        {copiedCode ? <FaCheck className="text-green-500" /> : <FaCopy />}
                        <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                      </button>
                      <button
                        onClick={handleDownloadCode}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-bold text-xs"
                      >
                        <FaDownload />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-3xl p-8 overflow-x-auto shadow-inner relative group/code">
                    <div className="absolute right-4 top-4 px-3 py-1 bg-white/5 rounded-lg text-white/40 text-[10px] font-black uppercase tracking-widest pointer-events-none">
                      {template.platform === 'github' ? 'YAML' : template.platform === 'jenkins' ? 'GROOVY' : 'CODE'}
                    </div>
                    <pre className="text-sm text-gray-300 font-mono leading-relaxed">
                      <code>{template.code}</code>
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Enhanced Footer */}
          <div className="p-8 bg-gray-50/80 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Template ID: <span className="text-gray-900 font-mono bg-white px-3 py-1 rounded-lg border border-gray-200 ml-2">{template.id}</span>
              </span>
            </div>
            <div className="flex space-x-4 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-8 py-3 bg-white text-gray-700 rounded-2xl hover:bg-gray-100 transition-all font-bold border border-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => onUseTemplate(template)}
                className="flex-1 sm:flex-none px-10 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all font-bold flex items-center justify-center space-x-2"
              >
                <FaExternalLinkAlt className="text-sm" />
                <span>Use This Template</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PreviewModal;
