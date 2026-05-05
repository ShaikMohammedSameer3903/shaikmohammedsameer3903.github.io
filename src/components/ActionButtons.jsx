import React from 'react'

function ActionButtons({ 
  generatedCode, 
  onSavePipeline, 
  onSaveAfterSimulation,
  isSaving, 
  onResetToDefault, 
  validationResult,
  simStatus,
  currentStep 
}) {
  const handleCopy = async () => {
    if (!generatedCode) return
    
    try {
      await navigator.clipboard.writeText(generatedCode)
      const copyButton = document.getElementById('copy-button')
      if (copyButton) {
        const originalContent = copyButton.innerHTML
        copyButton.innerHTML = '<span>✅</span><span>Copied!</span>'
        copyButton.classList.replace('bg-primary', 'bg-success')
        setTimeout(() => {
          copyButton.innerHTML = originalContent
          copyButton.classList.replace('bg-success', 'bg-primary')
        }, 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    if (!generatedCode) return
    const blob = new Blob([generatedCode], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pipeline.yml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Determine if save after simulation should be enabled
  const canSaveAfterSimulation = simStatus === 'success' || (validationResult && validationResult.isValid)
  
  // Show save after simulation button only on simulation step
  const showSaveAfterSimulation = currentStep === 4

  const isDisabled = !generatedCode || (validationResult && !validationResult.isValid)

  return (
    <div className="flex flex-col gap-4">
      {/* Main action buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          id="copy-button"
          onClick={handleCopy}
          disabled={isDisabled}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-premium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>📋</span>
          <span>Copy Code</span>
        </button>
        
        <button
          onClick={handleDownload}
          disabled={isDisabled}
          className="px-6 py-3 bg-surface-secondary text-text rounded-xl font-bold hover:bg-surface-tertiary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>💾</span>
          <span>Download</span>
        </button>
      </div>

      {/* Save Pipeline Button */}
      <button
        onClick={onSavePipeline}
        disabled={!generatedCode || isSaving || (validationResult && validationResult.errors.length > 0)}
        className="w-full px-6 py-3 bg-success text-white rounded-xl font-bold hover:shadow-premium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Saving...</span>
          </>
        ) : (
          <>
            <span>💾</span>
            <span>Save Pipeline</span>
          </>
        )}
      </button>

      {/* Save After Simulation Button (only show on simulation step) */}
      {showSaveAfterSimulation && (
        <button
          onClick={onSaveAfterSimulation}
          disabled={!canSaveAfterSimulation || isSaving}
          className="w-full px-6 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-premium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>✅</span>
              <span>Save Pipeline (After Simulation)</span>
            </>
          )}
        </button>
      )}

      {/* Reset Button */}
      <button
        onClick={onResetToDefault}
        disabled={!generatedCode}
        className="w-full px-6 py-3 bg-surface-secondary text-text rounded-xl font-bold hover:bg-surface-tertiary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span>🔄</span>
        <span>Reset to Default</span>
      </button>

      {/* Pro-tip */}
      <div className="text-center text-xs text-text-muted bg-surface-secondary rounded-lg p-3">
        💡 Pro-tip: Run simulation before saving to ensure pipeline works correctly
      </div>
    </div>
  )
}

export default ActionButtons
