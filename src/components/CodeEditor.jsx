import React, { useState, useEffect, useCallback, forwardRef, useRef } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import * as yamlParser from 'yaml';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import debounce from 'lodash/debounce';

const CodeEditor = forwardRef(({ 
  value = '', 
  onChange, 
  language = 'yaml',
  readOnly = false,
  height = '500px',
  isDarkMode = true,
  onSuggestionAccept
}, ref) => {
  const monaco = useMonaco();
  const [error, setError] = useState(null);
  const [editorInstance, setEditorInstance] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const decorationIds = useRef([]);

  // Mock AI Suggestion Call
  const fetchSuggestion = useCallback(async (code) => {
    setIsSuggesting(true);
    // In real app, this would be an API call to OpenAI/Claude
    // For demo/simulated DevOps IDE feel, we suggest common next YAML steps
    await new Promise(r => setTimeout(r, 600)); 
    
    let suggestedText = "";
    if (code.includes('steps:') && !code.includes('actions/checkout')) {
      suggestedText = "\n      - uses: actions/checkout@v4";
    } else if (code.includes('run: npm install') && !code.includes('npm test')) {
      suggestedText = "\n      - name: Run Tests\n        run: npm test";
    } else if (code.includes('jobs:') && !code.includes('build:')) {
      suggestedText = "\n  build:\n    runs-on: ubuntu-latest\n    steps:";
    }

    setIsSuggesting(false);
    return suggestedText;
  }, []);

  const debouncedSuggest = useCallback(
    debounce(async (code) => {
      if (!code || readOnly) return;
      const text = await fetchSuggestion(code);
      if (text) setSuggestion(text);
    }, 500),
    [fetchSuggestion, readOnly]
  );

  useEffect(() => {
    if (value && !readOnly) {
      debouncedSuggest(value);
    }
  }, [value, debouncedSuggest, readOnly]);

  // Handle Tab for suggestion
  useEffect(() => {
    if (!editorInstance || !suggestion) return;

    const disposable = editorInstance.onKeyDown((e) => {
      if (e.keyCode === 2 && suggestion) { // Tab key
        e.preventDefault();
        e.stopPropagation();
        
        const position = editorInstance.getPosition();
        editorInstance.executeEdits('ai-suggestion', [
          {
            range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
            text: suggestion,
            forceMoveMarkers: true
          }
        ]);
        setSuggestion(null);
        onSuggestionAccept?.(editorInstance.getValue());
      }
    });

    return () => disposable.dispose();
  }, [editorInstance, suggestion, monaco, onSuggestionAccept]);

  // Render ghost text decoration
  useEffect(() => {
    if (!editorInstance || !monaco) return;

    if (suggestion) {
      const position = editorInstance.getPosition();
      const newDecorations = editorInstance.deltaDecorations(decorationIds.current, [
        {
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          options: {
            after: {
              content: suggestion,
              inlineClassName: 'monaco-ghost-text'
            }
          }
        }
      ]);
      decorationIds.current = newDecorations;
    } else {
      decorationIds.current = editorInstance.deltaDecorations(decorationIds.current, []);
    }
  }, [suggestion, editorInstance, monaco]);

  // YAML Validation Engine
  const validateYaml = useCallback((content) => {
    if (!content || (language !== 'yaml' && language !== 'yml')) {
      setError(null);
      return;
    }
    try {
      yamlParser.parse(content);
      setError(null);
      if (monaco && editorInstance) {
        const model = editorInstance.getModel();
        if (model) monaco.editor.setModelMarkers(model, 'yaml', []);
      }
    } catch (err) {
      const line = err.linePos?.[0]?.line || 1;
      const message = err.message || 'YAML Syntax Error';
      setError({ line, message });
      if (monaco && editorInstance) {
        const model = editorInstance.getModel();
        if (model) {
          monaco.editor.setModelMarkers(model, 'yaml', [
            {
              startLineNumber: line,
              endLineNumber: line,
              startColumn: 1,
              endColumn: 1000,
              message: message,
              severity: 8,
            }
          ]);
        }
      }
    }
  }, [monaco, editorInstance, language]);

  useEffect(() => {
    validateYaml(value);
  }, [value, validateYaml]);

  const handleEditorDidMount = (editor, monaco) => {
    setEditorInstance(editor);
    validateYaml(value);
  };

  const handleEditorChange = (newValue) => {
    onChange?.(newValue || '');
  };

  const theme = isDarkMode ? 'vs-dark' : 'light';
  const bgEditor = isDarkMode ? 'bg-slate-950' : 'bg-white';

  return (
    <div className={`flex flex-col w-full h-full min-h-0 ${bgEditor} overflow-hidden`}>
      <div className="relative flex-1 overflow-hidden" style={{ height }}>
        <Editor
          height="100%"
          language={language}
          theme={theme}
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            lineHeight: 21,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            readOnly: readOnly,
            lineNumbers: 'on',
            glyphMargin: true,
            folding: true,
            minimap: { enabled: true, side: 'right', renderCharacters: false },
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              useShadows: false,
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            renderValidationDecorations: 'on'
          }}
        />

        {/* Inline Error/AI Overlay */}
        <AnimatePresence>
          {isSuggesting && (
             <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-3 right-3 z-10"
            >
              <div className="flex items-center gap-2 px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md backdrop-blur-sm">
                <Sparkles size={12} className="animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider">AI Thinking...</span>
              </div>
            </motion.div>
          )}
          {suggestion && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-12 left-3 z-10"
            >
              <div className="flex items-center gap-2 px-2 py-1 bg-slate-800/90 text-slate-300 border border-slate-700 rounded-md shadow-xl backdrop-blur-sm">
                <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-700 rounded border border-slate-600 font-sans">TAB</kbd>
                <span className="text-[10px] font-medium">Accept AI Suggestion</span>
              </div>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-3 left-3 right-3 z-10"
            >
              <div className={`backdrop-blur-md p-2.5 rounded-lg flex items-start gap-2 shadow-lg ${
                isDarkMode
                  ? 'bg-red-900/80 text-red-200 border border-red-700/50'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">Line {error.line}</p>
                  <p className="text-xs font-medium truncate">{error.message}</p>
                </div>
              </div>
            </motion.div>
          )}
          {!error && value && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-3 right-3 pointer-events-none"
            >
              <div className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 ${
                isDarkMode
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}>
                <CheckCircle2 size={12} />
                <span className="text-[10px] font-semibold">Valid</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default CodeEditor;
