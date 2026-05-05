import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';
import { safeFetch } from '../utils/safeFetch';
import Sidebar from './Sidebar'
import Header from './Header'
import ControlPanel from './ControlPanel'
import CodePreview from './CodePreview'
import ActionButtons from './ActionButtons'
import Simulator from './Simulator'
import VisualPipeline from './VisualPipeline'
import { API_CONFIG } from '../config/api.js'

const API_BASE_URL = API_CONFIG.BASE_URL

const steps = [
  { id: 1, title: 'Platform', description: 'Select your target platform' },
  { id: 2, title: 'Configure', description: 'Setup language & deployment' },
  { id: 3, title: 'Generate', description: 'Review generated pipeline' },
  { id: 4, title: 'Simulate', description: 'Test pipeline execution' }
];

function Dashboard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPlatform, setSelectedPlatform] = useState('github')
  const [language, setLanguage] = useState('node')
  const [deploymentType, setDeploymentType] = useState('docker')
  const [generatedCode, setGeneratedCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Simulator states shared for visualization
  const [simStatus, setSimStatus] = useState('idle')
  const [simCurrentStage, setSimCurrentStage] = useState(null)

  // Generate pipeline code whenever selections change
  useEffect(() => {
    generatePipelineFromAPI()
  }, [selectedPlatform, language, deploymentType])

  const generatePipelineFromAPI = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await safeFetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: selectedPlatform,
          language: language,
          deployment: deploymentType
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data?.success) {
        setGeneratedCode(data?.data?.pipelineCode || '')
      } else {
        throw new Error(data?.message || 'Failed to generate pipeline')
      }
    } catch (err) {
      console.error('Error generating pipeline:', err)
      setError(err.message || 'Failed to connect to backend API')
      setGeneratedCode(getFallbackTemplate())
    } finally {
      setIsLoading(false)
    }
  }

  const getFallbackTemplate = () => {
    return `# CI/CD Pipeline Template
# Platform: ${selectedPlatform}
# Language: ${language}
# Deployment: ${deploymentType}

# Backend API unavailable - Using fallback template
# Please ensure the backend server is running on port 3001

name: CI/CD Pipeline
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Environment
      run: |
        echo "Setting up environment for ${language}"
    - name: Install Dependencies
      run: |
        echo "Installing dependencies"
    - name: Run Tests
      run: |
        echo "Running tests"
    - name: Build Application
      run: |
        echo "Building application"
    - name: Deploy
      run: |
        echo "Deploying to ${deploymentType}"`
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="flex h-screen bg-bg overflow-hidden font-inter">
      {/* Sidebar - Always visible as part of platform selection */}
      <Sidebar 
        selectedPlatform={selectedPlatform}
        onPlatformSelect={(p) => {
          setSelectedPlatform(p);
          if (currentStep === 1) nextStep();
        }}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        {/* Stepper Progress Bar */}
        <div className="bg-surface border-b border-border px-8 py-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0"></div>
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${(currentStep - 1) * 33.33}%` }}
            ></div>
            
            {steps.map((step) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center group">
                <button 
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    currentStep === step.id ? 'bg-primary text-white shadow-lg scale-110' :
                    currentStep > step.id ? 'bg-success text-white shadow-md' :
                    'bg-surface border-2 border-border text-text-muted hover:border-primary/50'
                  }`}
                >
                  {currentStep > step.id ? '✓' : step.id}
                </button>
                <div className="absolute -bottom-10 whitespace-nowrap text-center">
                  <p className={`text-xs font-bold ${currentStep === step.id ? 'text-primary' : 'text-text-secondary'}`}>
                    {step.title}
                  </p>
                  <p className="text-[10px] text-text-muted hidden md:block">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Panels */}
        <div className="flex-1 p-8 overflow-auto mt-4">
          <div className="max-w-5xl mx-auto">
            {currentStep === 1 && (
              <div className="animate-fade-in text-center py-20">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🎯</span>
                </div>
                <h2 className="text-3xl font-bold text-text mb-4">Choose Your Platform</h2>
                <p className="text-text-secondary mb-10 max-w-md mx-auto">Select a CI/CD platform from the sidebar to start building your automated pipeline.</p>
                <div className="flex justify-center gap-4">
                  <div className={`p-6 bg-surface border-2 rounded-2xl transition-all ${selectedPlatform ? 'border-primary shadow-lg' : 'border-border'}`}>
                    <span className="text-3xl block mb-2">{selectedPlatform === 'github' ? '🐙' : selectedPlatform === 'aws' ? '☁️' : '🔧'}</span>
                    <span className="font-bold">{selectedPlatform === 'github' ? 'GitHub Actions' : selectedPlatform === 'aws' ? 'AWS CodePipeline' : 'Jenkins'}</span>
                  </div>
                </div>
                {selectedPlatform && (
                  <button onClick={nextStep} className="mt-12 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2 mx-auto">
                    Continue to Configuration <span className="text-xl">→</span>
                  </button>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-fade-in space-y-6">
                <ControlPanel
                  language={language}
                  deploymentType={deploymentType}
                  onLanguageChange={setLanguage}
                  onDeploymentTypeChange={setDeploymentType}
                />
                <div className="flex justify-between items-center pt-6">
                  <button onClick={prevStep} className="px-6 py-3 text-text-secondary font-bold hover:bg-surface rounded-xl transition-all flex items-center gap-2">
                    <span className="text-xl">←</span> Back to Platform
                  </button>
                  <button onClick={nextStep} className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2">
                    Generate Pipeline Code <span className="text-xl">→</span>
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-fade-in space-y-6">
                <CodePreview 
                  platform={selectedPlatform}
                  language={language}
                  deploymentType={deploymentType}
                  generatedCode={generatedCode}
                  isLoading={isLoading}
                  error={error}
                />
                <ActionButtons generatedCode={generatedCode} />
                <div className="flex justify-between items-center pt-6">
                  <button onClick={prevStep} className="px-6 py-3 text-text-secondary font-bold hover:bg-surface rounded-xl transition-all flex items-center gap-2">
                    <span className="text-xl">←</span> Back to Config
                  </button>
                  <button onClick={nextStep} className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2">
                    Run Simulation <span className="text-xl">→</span>
                  </button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="animate-fade-in space-y-6">
                <VisualPipeline currentStep={simCurrentStage} status={simStatus} />
                <Simulator 
                  generatedCode={generatedCode}
                  setSimStatus={setSimStatus}
                  setSimCurrentStage={setSimCurrentStage}
                />
                <div className="flex justify-between items-center pt-6">
                  <button onClick={prevStep} className="px-6 py-3 text-text-secondary font-bold hover:bg-surface rounded-xl transition-all flex items-center gap-2">
                    <span className="text-xl">←</span> Back to Code
                  </button>
                  <button onClick={() => setCurrentStep(1)} className="px-8 py-3 bg-success text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2">
                    Start New Pipeline <span className="text-xl">🔄</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
