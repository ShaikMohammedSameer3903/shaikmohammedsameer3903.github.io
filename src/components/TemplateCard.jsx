import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { PLATFORMS, DIFFICULTIES } from '../data/templates';
import { 
  FaGithub, 
  FaAws, 
  FaDocker, 
  FaCodeBranch, 
  FaCloud, 
  FaBolt,
  FaStar,
  FaEye,
  FaCopy,
  FaCheck,
  FaInfoCircle
} from 'react-icons/fa';

const TemplateCard = memo(({ template, onPreview, onUseTemplate }) => {
  const [copied, setCopied] = useState(false);

  const handlePreviewClick = () => {
    onPreview?.(template);
  };

  const handleUseTemplateClick = () => {
    onUseTemplate?.(template);
  };

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
      Beginner: 'bg-green-100 text-green-800 border-green-200',
      Intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Advanced: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Safe description rendering helper
  const renderDescription = () => {
    if (!template?.description) return 'No description available';
    if (typeof template.description === 'string') return template.description;
    if (typeof template.description === 'object') {
      return template.description.description || JSON.stringify(template.description);
    }
    return 'Invalid description format';
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col h-full"
    >
      {/* Visual Header */}
      <div className={`h-32 bg-gradient-to-br ${getPlatformColor(template?.platform)} p-6 relative overflow-hidden`}>
        <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
          {getPlatformIcon(template?.platform)}
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md text-white">
              {getPlatformIcon(template?.platform)}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm ${getDifficultyBadgeColor(typeof template?.difficulty === 'string' ? template.difficulty : typeof template?.level === 'string' ? template.level : 'Beginner')}`}>
              {typeof template?.difficulty === 'string' ? template.difficulty : typeof template?.level === 'string' ? template.level : 'Beginner'}
            </span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1">
        <div className="mb-4">
          <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {template?.name || 'Unnamed Template'}
          </h3>
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mt-1">
            {typeof template?.category === 'string' ? template.category : 'General'}
          </p>
        </div>

        <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
          {renderDescription()}
        </p>

        {/* Requirements Preview */}
        <div className="space-y-3 mb-6 flex-1">
          <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            <FaInfoCircle className="mr-2" /> Requirements
          </div>
          <div className="flex flex-wrap gap-2">
            {(template?.requirements || []).slice(0, 3).map((req, index) => (
              <span key={index} className="px-3 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-md border border-gray-100">
                {typeof req === 'string' ? req : (req?.name || req?.title || 'Requirement')}
              </span>
            ))}
            {(template?.requirements?.length > 3) && (
              <span className="px-2 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-md">
                +{template.requirements.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3 pt-4 border-t border-gray-50">
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePreviewClick}
              className="flex-1 px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-bold text-xs border border-gray-200"
            >
              Preview
            </button>
            <button
              onClick={handleUseTemplateClick}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all font-bold text-xs"
            >
              Use Now
            </button>
          </div>
          
          <button
            onClick={() => onUseTemplate?.(template, { aiMode: true })}
            className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-all font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-violet-100"
          >
            <FaBolt className="text-yellow-300 animate-pulse" />
            AI Smart Configure
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export default TemplateCard;
