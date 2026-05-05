import React from 'react';
import { motion } from 'framer-motion';

const STATUS_CONFIG = {
  success: { color: 'bg-emerald-500', ring: 'ring-emerald-200', text: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Success' },
  failed: { color: 'bg-red-500', ring: 'ring-red-200', text: 'text-red-700', bg: 'bg-red-50', label: 'Failed' },
  running: { color: 'bg-blue-500', ring: 'ring-blue-200', text: 'text-blue-700', bg: 'bg-blue-50', label: 'Running' },
  pending: { color: 'bg-gray-400', ring: 'ring-gray-200', text: 'text-gray-700', bg: 'bg-gray-50', label: 'Pending' },
};

function PipelineCard({ pipeline, onDelete, onEdit, onView, index = 0 }) {
  const status = pipeline.status || 'pending';
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'github': case 'github-actions': return '🐙';
      case 'aws': case 'aws-codepipeline': case 'aws-infrastructure': return '☁️';
      case 'jenkins': return '🔧';
      case 'docker': case 'docker-infrastructure': return '🐳';
      default: return '⚙️';
    }
  };

  const getLanguageIcon = (language) => {
    switch (language) {
      case 'node': return '🟢';
      case 'javascript': return '🟡';
      case 'java': return '☕';
      case 'python': return '🐍';
      case 'react': return '⚛️';
      case 'typescript': return '🔷';
      default: return '💻';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer transition-colors hover:border-blue-200"
    >
      {/* Card Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-sm">
              {getPlatformIcon(pipeline.platform)}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 truncate">{pipeline.name}</h3>
              <p className="text-[10px] text-gray-400 capitalize">{pipeline.platform?.replace('-', ' ')}</p>
            </div>
          </div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span>{getLanguageIcon(pipeline.language)}</span>
            <span className="capitalize">{pipeline.language}</span>
          </span>
          {pipeline.jobs?.length > 0 && (
            <span>{pipeline.jobs.length} job{pipeline.jobs.length !== 1 ? 's' : ''}</span>
          )}
          {pipeline.created_at && (
            <span className="text-gray-400">{formatDate(pipeline.created_at)}</span>
          )}
        </div>

        {/* Mini Visual Workflow */}
        {pipeline.jobs?.length > 0 && (
          <div className="flex items-center gap-1 mt-3">
            {pipeline.jobs.slice(0, 5).map((job, idx) => (
              <React.Fragment key={job.id || idx}>
                <div className={`h-1.5 flex-1 rounded-full ${
                  idx < 2 ? 'bg-emerald-400' : idx < 4 ? 'bg-blue-400' : 'bg-gray-200'
                }`} />
                {idx < Math.min(pipeline.jobs.length, 5) - 1 && (
                  <svg className="w-3 h-3 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onView?.(pipeline); }}
          className="flex-1 px-2.5 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          View
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit?.(pipeline); }}
          className="flex-1 px-2.5 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(pipeline.id); }}
          className="px-2.5 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}

export default PipelineCard;
