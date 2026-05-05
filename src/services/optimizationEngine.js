// Optimization Engine for pipeline improvement suggestions

export function optimizePipeline(pipeline) {
  if (!pipeline || !pipeline.jobs) {
    return { optimized: false, suggestions: [], pipeline };
  }

  const suggestions = [];

  // Check for parallelization opportunities
  if (pipeline.jobs.length > 1) {
    const independentJobs = pipeline.jobs.filter(j => !j.needs || j.needs.length === 0);
    if (independentJobs.length > 1) {
      suggestions.push({
        type: 'parallelization',
        message: `${independentJobs.length} jobs can run in parallel`,
        impact: 'high',
        estimatedSaving: `${independentJobs.length * 30}s`
      });
    }
  }

  // Check for caching opportunities
  pipeline.jobs.forEach(job => {
    const hasNpmInstall = (job.steps || []).some(s =>
      s.run?.includes('npm install') || s.run?.includes('npm ci')
    );
    if (hasNpmInstall) {
      suggestions.push({
        type: 'caching',
        message: `Add npm caching to job "${job.name}"`,
        impact: 'medium',
        estimatedSaving: '30-60s per run'
      });
    }
  });

  return {
    optimized: suggestions.length > 0,
    suggestions,
    pipeline,
    estimatedTimeSaving: suggestions.reduce((sum, s) => sum + (parseInt(s.estimatedSaving) || 0), 0) + 's'
  };
}

export default { optimizePipeline };
