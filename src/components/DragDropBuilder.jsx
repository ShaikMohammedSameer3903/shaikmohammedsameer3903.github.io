import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

// DragDropBuilder - Visual pipeline builder with drag-and-drop blocks
const DragDropBuilder = ({ onSyncCode }) => {
  const [blocks, setBlocks] = useState([
    { id: 'checkout', type: 'action', label: 'Checkout', uses: 'actions/checkout@v4' },
    { id: 'setup-node', type: 'action', label: 'Setup Node.js', uses: 'actions/setup-node@v4' },
    { id: 'install', type: 'run', label: 'Install Dependencies', run: 'npm ci' },
    { id: 'test', type: 'run', label: 'Run Tests', run: 'npm test' },
    { id: 'build', type: 'run', label: 'Build', run: 'npm run build' }
  ]);

  const generateCode = useCallback((blockList) => {
    const steps = blockList.map(b => {
      if (b.type === 'action') return `      - uses: ${b.uses}`;
      return `      - name: ${b.label}\n        run: ${b.run}`;
    }).join('\n');

    const code = `name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
${steps}`;

    if (onSyncCode) onSyncCode(code);
    return code;
  }, [onSyncCode]);

  const addBlock = useCallback((type) => {
    const id = `block-${Date.now()}`;
    const newBlock = type === 'action'
      ? { id, type: 'action', label: 'Custom Action', uses: 'actions/checkout@v4' }
      : { id, type: 'run', label: 'Custom Step', run: 'echo "Hello"' };
    setBlocks(prev => [...prev, newBlock]);
    generateCode([...blocks, newBlock]);
  }, [blocks, generateCode]);

  const removeBlock = useCallback((id) => {
    const newBlocks = blocks.filter(b => b.id !== id);
    setBlocks(newBlocks);
    generateCode(newBlocks);
  }, [blocks, generateCode]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900">Visual Pipeline Builder</h3>
        <div className="flex gap-2">
          <button onClick={() => addBlock('action')} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            + Action
          </button>
          <button onClick={() => addBlock('run')} className="px-3 py-1.5 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700">
            + Run Step
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {blocks.map((block, idx) => (
          <motion.div
            key={block.id}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-3 p-3 rounded-xl border ${
              block.type === 'action'
                ? 'bg-blue-50 border-blue-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="w-6 h-6 rounded bg-white border flex items-center justify-center text-xs font-bold text-slate-500">
              {idx + 1}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-slate-800">{block.label}</p>
              <p className="text-xs text-slate-500">
                {block.type === 'action' ? `uses: ${block.uses}` : `run: ${block.run}`}
              </p>
            </div>
            <button
              onClick={() => removeBlock(block.id)}
              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-sm text-slate-500">
          {blocks.length} step{blocks.length !== 1 ? 's' : ''} in pipeline
        </p>
      </div>
    </div>
  );
};

export default DragDropBuilder;
