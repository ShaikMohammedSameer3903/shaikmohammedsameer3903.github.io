import React, { useEffect, useRef } from 'react'

function CodePreview({ platform, language, deploymentType, generatedCode, isLoading, error }) {
  const animationContainer = useRef(null)

  useEffect(() => {
    // Simple animation for empty state
    if (animationContainer.current) {
      // You can add a Lottie animation here if needed
    }
  }, [])

  const getPlaceholderText = () => {
    return `# Generated pipeline will appear here...
# Platform: ${platform}
# Language: ${language}
# Deployment: ${deploymentType}

# DevOps Platform with API Integration
# Pipeline generation logic is implemented!

# Example structure:
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Environment
        run: |
          echo "Setting up ${language} environment..."
          echo "Preparing for ${deploymentType} deployment..."
      - name: Build Application
        run: |
          echo "Building application..."
          echo "Running tests..."
          echo "Creating artifacts..."`
  }

  const codeToDisplay = generatedCode || getPlaceholderText()
  const lineCount = codeToDisplay.split('\n').length
  const estimatedSize = Math.round(codeToDisplay.length / 100) / 10 + 'KB'

  return (
    <div className="bg-surface rounded-xl shadow-devops p-6 border border-border animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">📝</span>
          </div>
          <h2 className="text-lg font-semibold text-text">Generated Pipeline</h2>
        </div>
        <div className="flex items-center gap-2 bg-surface-secondary px-3 py-1.5 rounded-lg border border-border">
          <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
          <span className="text-xs font-medium text-text">Live</span>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-error">⚠️</span>
            <div>
              <p className="text-sm font-medium text-text">Connection Error</p>
              <p className="text-xs text-text-secondary">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Dark Terminal-style Code Preview */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-2 mb-3 text-xs text-gray-400 font-mono">
          <span className="text-accent">$</span>
          <span>cat pipeline.yml</span>
        </div>
        
        {/* Code Display */}
        <div className="relative">
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-300 bg-gray-800 rounded-lg p-4 border border-gray-600">
            {codeToDisplay}
          </pre>
          
          {/* Loading Animation Container */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 rounded-lg">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2">
                  <div className="w-full h-full border-2 border-primary rounded-full animate-spin border-t-transparent"></div>
                </div>
                <p className="text-gray-300 text-sm font-medium">Generating...</p>
                <p className="text-gray-500 text-xs">Connecting to API</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4 text-text-secondary">
          <div className="flex items-center gap-1">
            <span>📄</span>
            <span>{lineCount} lines</span>
          </div>
          <div className="flex items-center gap-1">
            <span>💾</span>
            <span>{estimatedSize}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-surface-secondary px-2 py-1 rounded border border-border">
          <span className="text-success font-medium">Ready</span>
        </div>
      </div>
    </div>
  )
}

export default CodePreview
