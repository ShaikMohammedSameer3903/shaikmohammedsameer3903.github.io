import React from 'react';

function ValidationPanel({ validationResult, onFix }) {
  if (!validationResult) {
    return (
      <div className="p-4 bg-surface-secondary rounded-xl border border-border">
        <div className="flex items-center gap-2 text-text-muted">
          <span className="text-lg">🔍</span>
          <span className="text-sm">Ready to validate pipeline...</span>
        </div>
      </div>
    );
  }

  const { isValid = false, errors = [], warnings = [] } = validationResult || {};
  const safeErrors = Array.isArray(errors) ? errors : [];
  const safeWarnings = Array.isArray(warnings) ? warnings : [];

  return (
    <div className={`p-4 rounded-xl border ${
      isValid 
        ? 'bg-success/5 border-success/20' 
        : (safeErrors.length > 0) 
          ? 'bg-error/5 border-error/20' 
          : 'bg-warning/5 border-warning/20'
    }`}>
      {/* Status Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isValid 
            ? 'bg-success text-white' 
            : safeErrors.length > 0 
              ? 'bg-error text-white' 
              : 'bg-warning text-white'
        }`}>
          {isValid ? (
            <span className="text-lg">✔</span>
          ) : safeErrors.length > 0 ? (
            <span className="text-lg">❌</span>
          ) : (
            <span className="text-lg">⚠</span>
          )}
        </div>
        <div>
          <h3 className={`font-bold ${
            isValid 
              ? 'text-success' 
              : safeErrors.length > 0 
                ? 'text-error' 
                : 'text-warning'
          }`}>
            {isValid 
              ? 'Valid Pipeline' 
              : safeErrors.length > 0 
                ? `${safeErrors.length} Error${safeErrors.length > 1 ? 's' : ''}` 
                : `${safeWarnings.length} Warning${safeWarnings.length > 1 ? 's' : ''}`
            }
          </h3>
          <p className="text-sm text-text-secondary">
            {isValid 
              ? 'Pipeline structure is correct and ready to run'
              : safeErrors.length > 0 
                ? 'Fix critical errors before running pipeline'
                : 'Review warnings before running pipeline'
            }
          </p>
        </div>
      </div>

      {/* Errors */}
      {safeErrors.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-bold text-error mb-2">Errors:</h4>
          {safeErrors.map((error, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-error/10 rounded-lg border border-error/20">
              <span className="text-error text-sm mt-0.5">❌</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-error">{error?.message || 'Unknown error'}</p>
                <p className="text-xs text-text-muted mt-1">Line {error?.line || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {safeWarnings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-warning mb-2">Warnings:</h4>
          {safeWarnings.map((warning, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
              <span className="text-warning text-sm mt-0.5">⚠</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-warning">{warning?.message || 'Unknown warning'}</p>
                <p className="text-xs text-text-muted mt-1">Line {warning?.line || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span>{safeErrors.length} errors</span>
          <span>{safeWarnings.length} warnings</span>
        </div>
        <div className="text-xs text-text-muted">
          {isValid ? '✅ Ready to deploy' : '⚠️ Review required'}
        </div>
      </div>
    </div>
  );
}

export default ValidationPanel;
