import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Lightbulb, Code, MessageSquare, Bot, User, Copy, Check } from 'lucide-react';
import { safeApiRequest } from '../utils/safeFetch';
import { API_CONFIG } from '../config/api';

const AIChatPanel = ({ currentCode, onApplyCode, platform = 'github', isDarkMode = true }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `Hi! I'm your AI pipeline assistant. I can help you:\n• Fix YAML errors\n• Add new steps\n• Optimize your pipeline\n• Explain best practices\n\nJust ask me anything about your ${platform} pipeline!`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await safeApiRequest(API_CONFIG.ENDPOINTS.AI_PROCESS, {
        method: 'POST',
        body: JSON.stringify({
          type: 'chat',
          message: userMessage.content,
          code: currentCode || '',
          platform
        })
      });

      let assistantContent;
      if (response.success && response.data?.content) {
        assistantContent = response.data.content;
      } else {
        // Fallback response
        assistantContent = generateFallbackResponse(userMessage.content, currentCode, platform);
      }

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, currentCode, platform]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleCopy = useCallback((text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const handleApplyCode = useCallback((content) => {
    // Extract YAML code from markdown fences
    const codeMatch = content.match(/```(?:ya?ml)?\s*\n([\s\S]*?)\n```/);
    const code = codeMatch ? codeMatch[1].trim() : null;
    if (code && onApplyCode) {
      onApplyCode(code);
    }
  }, [onApplyCode]);

  const hasCodeBlock = (content) => /```(?:ya?ml)?\s*\n/.test(content);

  const bgBase = isDarkMode ? 'bg-slate-900' : 'bg-white';
  const bgMsg = isDarkMode ? 'bg-slate-800' : 'bg-slate-50';
  const textBase = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const borderClr = isDarkMode ? 'border-slate-700' : 'border-slate-200';

  return (
    <div className={`flex flex-col h-full ${bgBase}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${borderClr}`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${textBase}`}>AI Assistant</h3>
            <p className={`text-[10px] ${textMuted}`}>{platform} pipeline expert</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-500 to-pink-600'
              }`}>
                {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
              </div>
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block rounded-xl px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : `${bgMsg} ${textBase}`
                }`}>
                  <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                </div>
                {msg.role === 'assistant' && hasCodeBlock(msg.content) && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleApplyCode(msg.content)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Code className="w-3 h-3" /> Apply
                    </button>
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-600 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedId === msg.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className={`${bgMsg} rounded-xl px-4 py-3`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className={`px-4 py-2 border-t ${borderClr}`}>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { label: 'Fix errors', icon: Lightbulb, prompt: 'Fix any errors in my pipeline YAML' },
            { label: 'Add caching', icon: Code, prompt: 'Add caching to my pipeline for faster builds' },
            { label: 'Best practices', icon: MessageSquare, prompt: 'What are the best practices for this pipeline?' }
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => { setInput(action.prompt); inputRef.current?.focus(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 ${bgMsg} ${textMuted} rounded-lg text-xs font-medium hover:opacity-80 transition-opacity shrink-0 border ${borderClr}`}
            >
              <action.icon className="w-3 h-3" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className={`px-4 py-3 border-t ${borderClr}`}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your pipeline..."
            className={`flex-1 px-4 py-2.5 ${bgMsg} border ${borderClr} rounded-xl text-sm ${textBase} placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

function generateFallbackResponse(userMessage, code, platform) {
  const msg = userMessage.toLowerCase();

  if (msg.includes('fix') || msg.includes('error')) {
    return `I'd be happy to help fix your pipeline! Here are some common issues to check:\n\n1. **Missing \`on:\` trigger** - Every workflow needs a trigger\n2. **Missing \`runs-on:\`** - Each job needs a runner\n3. **Invalid indentation** - YAML requires consistent 2-space indentation\n4. **Missing \`steps:\`** - Jobs must have at least one step\n\nPaste your YAML and I'll identify specific issues.`;
  }

  if (msg.includes('cache') || msg.includes('caching')) {
    const cacheSnippet = `\`\`\`yaml\n- uses: actions/cache@v3\n  with:\n    path: |\n      ~/.npm\n      node_modules\n    key: \${{ runner.os }}-npm-\${{ hashFiles('**/package-lock.json') }}\n    restore-keys: |\n      \${{ runner.os }}-npm-\n\`\`\`\nAdd this step before your install step to cache dependencies.`;
    return `Here's how to add caching to your pipeline:\n\n${cacheSnippet}`;
  }

  if (msg.includes('best practice') || msg.includes('recommend')) {
    return `Here are best practices for ${platform} pipelines:\n\n1. **Use \`npm ci\`** instead of \`npm install\` for reproducible builds\n2. **Cache dependencies** to speed up builds\n3. **Use matrix builds** to test across multiple versions\n4. **Pin action versions** with SHA hashes for security\n5. **Use \`concurrency\`** to cancel redundant runs\n6. **Set timeout-minutes** to prevent hung jobs`;
  }

  return `I understand you're asking about "${userMessage}". While I'm currently in offline mode, I can still help with:\n\n- **Fixing YAML errors** in your pipeline\n- **Adding caching** for faster builds\n- **Suggesting best practices** for ${platform}\n- **Explaining pipeline concepts**\n\nPlease try one of these topics, or try again when the AI service is available.`;
}

export default AIChatPanel;
