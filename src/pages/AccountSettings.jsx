import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';
import { supabase } from '../services/supabaseClient';
import { pipelineService } from '../services/pipelineService';

const AccountSettings = () => {
  const { user, signOut } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [name, setName] = useState(user?.user_metadata?.name || user?.email?.split('@')[0] || '');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalPipelines: 0,
    totalDeployments: 0,
    activePipelines: 0,
    recentActivity: []
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [showKeyForm, setShowKeyForm] = useState(false);

  useEffect(() => {
    if (activeTab === 'api') {
      fetchApiKeys();
    } else if (activeTab === 'stats') {
      fetchAnalytics();
    }
  }, [activeTab]);

  // Sync name state when user metadata changes
  useEffect(() => {
    if (user?.user_metadata?.name !== name) {
      setName(user?.user_metadata?.name || '');
    }
  }, [user?.user_metadata?.name, name]);

  const fetchApiKeys = async () => {
    setIsLoading(true);
    try {
      const res = await pipelineService.getApiKeys();
      if (res.success) {
        setApiKeys(res.data || []);
      } else {
        throw new Error(res.error || 'Failed to fetch API keys');
      }
    } catch (err) {
      addToast('Failed to fetch API keys: ' + (err?.message || 'Unknown error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await pipelineService.getAnalytics();
      if (res.success) {
        setAnalytics(res.data || { totalPipelines: 0, totalDeployments: 0, activePipelines: 0, recentActivity: [] });
      } else {
        throw new Error(res.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      addToast('Failed to fetch analytics: ' + (err?.message || 'Unknown error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { name: name }
      });
      if (updateError) throw updateError;
      
      // Also update via our custom profile API to ensure consistency
      await pipelineService.updateProfile({ name });
      
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewApiKey = async () => {
    if (!newKeyName.trim()) {
      addToast('Please enter a name for the key', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = await pipelineService.generateApiKey(newKeyName.trim());
      if (res.success) {
        setApiKeys(prev => [res.data, ...prev]);
        addToast('New API key generated!', 'success');
        setNewKeyName('');
        setShowKeyForm(false);
      }
    } catch (err) {
      addToast('Failed to generate API key', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      addToast('Password updated successfully!', 'success');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      addToast('Failed to update password: ' + (err?.message || 'Unknown error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyApiKey = (key) => {
    navigator.clipboard.writeText(key);
    addToast('API Key copied to clipboard', 'success');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔐' },
    { id: 'api', label: 'API Keys', icon: '🔑' },
    { id: 'ai', label: 'AI Assistant', icon: '🤖' },
    { id: 'stats', label: 'Usage Stats', icon: '📊' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-md border border-slate-100">
              <h3 className="text-xl font-black text-slate-800 mb-8 tracking-tight">Public Profile</h3>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pb-8 border-b border-slate-50">
                  <div className="relative">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-lg" alt="Avatar" />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl sm:text-4xl shadow-inner text-blue-600 font-black">
                        {user?.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="font-bold text-slate-800">Profile Avatar</p>
                    <p className="text-sm text-slate-400">JPG, GIF or PNG. Max size 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={name || ''}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#bf8140]/20 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      value={user?.email || ''} 
                      disabled
                      className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-medium text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-200"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'security':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-md border border-slate-100">
              <h3 className="text-xl font-black text-slate-800 mb-8 tracking-tight">Security Settings</h3>
              <div className="space-y-8">
                <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <p className="font-bold text-slate-800">Password</p>
                      <p className="text-sm text-slate-400">Update your account password</p>
                    </div>
                    <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">{showPasswordForm ? 'Cancel' : 'Change Password'}</button>
                  </div>
                  {showPasswordForm && (
                    <div className="mt-4 space-y-4 pt-4 border-t border-slate-200">
                      <input type="password" placeholder="New password (min 6 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" />
                      <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" />
                      <button onClick={handleChangePassword} disabled={isLoading} className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50">{isLoading ? 'Updating...' : 'Update Password'}</button>
                    </div>
                  )}
                </div>
                
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-400">Secure your account with 2FA</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-300 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50">
                  <h4 className="text-red-500 font-bold mb-4">Danger Zone</h4>
                  <button className="px-8 py-4 border-2 border-red-100 text-red-500 rounded-2xl font-bold hover:bg-red-50 transition-all">Delete Account</button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'api':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-md border border-slate-100">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">API Management</h3>
                  <p className="text-sm text-slate-400">Use these keys to authenticate with our CLI and API.</p>
                </div>
                <button 
                  onClick={() => setShowKeyForm(!showKeyForm)}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
                >
                  {showKeyForm ? 'Cancel' : '+ Generate New Key'}
                </button>
              </div>

              {showKeyForm && (
                <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-blue-600">Key Name</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input type="text" placeholder="e.g., Production CLI Key" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} className="flex-1 px-4 py-3 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" />
                    <button onClick={generateNewApiKey} disabled={isLoading} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50">{isLoading ? 'Generating...' : 'Generate'}</button>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {apiKeys.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No API keys generated yet.</p>
                  </div>
                ) : (
                  apiKeys.map((key) => (
                    <div key={key.id} className="relative">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">{key.name || 'API Key'}</label>
                      <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        <div className="flex-1 px-4 py-3 bg-slate-900 rounded-xl font-mono text-blue-400 text-sm overflow-hidden flex items-center border border-slate-800">
                          <span className="truncate">{key.key}</span>
                        </div>
                        <button 
                          onClick={() => copyApiKey(key.key)}
                          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm hover:bg-slate-50 transition-all shadow-sm font-bold"
                          title="Copy to clipboard"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ))
                )}

                <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100">
                  <div className="flex gap-4">
                    <span className="text-2xl" role="img" aria-label="warning">⚠️</span>
                    <p className="text-sm text-amber-800 font-medium leading-relaxed">
                      Keep your API keys secret. Anyone with access to this key can manage your pipelines. Never commit keys to version control.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'ai':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-md border border-slate-100">
              <h3 className="text-xl font-black text-slate-800 mb-8 tracking-tight">AI Configuration</h3>
              
              <div className="space-y-8">
                {/* AI Model Toggle */}
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800">AI Assistant Features</p>
                    <p className="text-sm text-slate-400">Enable or disable AI generation and debugging</p>
                  </div>
                  <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>

                {/* Model Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">AI Engine Provider</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-white border-2 border-blue-500 rounded-2xl flex items-center gap-4 cursor-pointer shadow-sm">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl">🌐</div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">OpenRouter</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black">Llama 3 / Mistral</p>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 border-2 border-transparent rounded-2xl flex items-center gap-4 cursor-pointer hover:border-slate-200 transition-all">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl">🤗</div>
                      <div>
                        <p className="font-bold text-slate-600 text-sm">HuggingFace</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black">Mistral 7B / StarCoder</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                  <div className="flex gap-4">
                    <span className="text-2xl">🤖</span>
                    <p className="text-sm text-blue-800 font-medium leading-relaxed">
                      Your AI interactions are processed securely on the backend. API keys are managed by the administrator and are never exposed to the frontend.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'stats':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Pipelines', value: analytics.totalPipelines, icon: '📦', color: 'bg-blue-50 text-blue-600' },
                { label: 'Simulations Run', value: analytics.totalDeployments, icon: '🎮', color: 'bg-purple-50 text-purple-600' },
                { label: 'Active Pipelines', value: analytics.activePipelines, icon: '✅', color: 'bg-emerald-50 text-emerald-600' }
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${stat.color}`}>{stat.icon}</div>
                    <span className="font-bold text-slate-600 text-sm">{stat.label}</span>
                  </div>
                  <p className="text-3xl font-black text-slate-800">{isLoading ? '...' : stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
              {isLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
                </div>
              ) : analytics.recentActivity.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">No recent activity yet. Create a pipeline to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.recentActivity.map((act, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm">🚀</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-700 text-sm truncate">{act.name}</p>
                        <p className="text-xs text-slate-400">{act.status} &middot; {new Date(act.updated_at || act.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 text-sm sm:text-base font-medium">Manage your profile, security, and API keys.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="w-full lg:w-56 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide -mx-1 px-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-100 shadow-sm'}
                `}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-0 pb-20">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
