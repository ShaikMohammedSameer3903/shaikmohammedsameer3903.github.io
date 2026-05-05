import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle, AlertCircle, X, Check } from 'lucide-react';

// FixAllPanel - Shows AI fix results and allows applying them
const FixAllPanel = ({ isOpen, onClose, isFixing, result, onApplyFix }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed right-4 top-20 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm">AI Fix Results</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {isFixing ? (
          <div className="flex flex-col items-center py-8">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-slate-600 font-medium">AI is analyzing your code...</p>
          </div>
        ) : result ? (
          <div className="space-y-3">
            {/* Fixed Files */}
            {(result.fixedFiles || []).map((file, idx) => (
              <div key={idx} className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">{file.path}</span>
                  </div>
                  <button
                    onClick={() => onApplyFix && onApplyFix(file)}
                    className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700"
                  >
                    Apply
                  </button>
                </div>
                {file.changes && (
                  <p className="text-xs text-emerald-600">{file.changes}</p>
                )}
              </div>
            ))}

            {/* Errors */}
            {(result.errors || []).map((err, idx) => (
              <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-800">{err.message}</span>
                </div>
              </div>
            ))}

            {(!result.fixedFiles || result.fixedFiles.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-4">No fixes available</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">No results yet</p>
        )}
      </div>
    </motion.div>
  );
};

export default FixAllPanel;
