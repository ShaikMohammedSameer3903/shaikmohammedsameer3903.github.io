import React from 'react';
import Logo, { FullLogo } from './Logo.jsx';

const LogoShowcase = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          PipeLinePro Logo Showcase - #bf8140 Background
        </h1>

        {/* Full Logo Display */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
            Full Logo with Background
          </h2>
          <div className="flex justify-center">
            <FullLogo className="w-full max-w-2xl" />
          </div>
        </div>

        {/* Logo Variations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
              Small Size
            </h3>
            <div className="flex justify-center">
              <Logo size="small" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
              Medium Size
            </h3>
            <div className="flex justify-center">
              <Logo size="medium" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
              Large Size
            </h3>
            <div className="flex justify-center">
              <Logo size="large" />
            </div>
          </div>
        </div>

        {/* Logo with Tagline */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-12">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
            Logo with Tagline
          </h2>
          <div className="flex justify-center">
            <Logo size="large" showTagline={true} />
          </div>
        </div>

        {/* Color Specifications */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Color Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-600 mb-2">Background</h3>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg border-2 border-gray-300"
                  style={{ backgroundColor: '#bf8140' }}
                />
                <div>
                  <p className="font-mono text-sm">#bf8140</p>
                  <p className="text-xs text-gray-500">Warm Brown</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-600 mb-2">Gradient</h3>
              <div 
                className="w-12 h-12 rounded-lg border-2 border-gray-300"
                style={{
                  background: 'linear-gradient(135deg, #bf8140 0%, #d4934f 50%, #bf8140 100%)'
                }}
              />
              <p className="font-mono text-sm mt-2">#bf8140 → #d4934f → #bf8140</p>
              <p className="text-xs text-gray-500">135° Gradient</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-600 mb-2">Text Colors</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded border border-gray-300 bg-white"></div>
                <span className="font-mono text-sm">#ffffff - Main Text</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded border border-gray-300" style={{ backgroundColor: '#f0f0f0' }}></div>
                <span className="font-mono text-sm">#f0f0f0 - "Pro" Text</span>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-12 bg-gray-800 rounded-xl p-8 text-white">
          <h2 className="text-xl font-semibold mb-4">Usage Examples</h2>
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <code className="text-sm">
                {`import Logo from './components/Logo.jsx';

// Basic usage
<Logo size="medium" />

// With tagline
<Logo size="large" showTagline={true} />

// Full logo with background
<FullLogo />`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoShowcase;
