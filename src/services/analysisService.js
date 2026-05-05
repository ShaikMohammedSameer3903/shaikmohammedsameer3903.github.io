// Analysis Service for pipeline performance analysis

export function analyzePipeline(pipeline) {
  if (!pipeline || !pipeline.jobs) {
    return { score: 0, metrics: {}, recommendations: [] };
  }

  const totalJobs = pipeline.jobs.length;
  const totalSteps = pipeline.jobs.reduce((sum, j) => sum + (j.steps?.length || 0), 0);

  const metrics = {
    totalJobs,
    totalSteps,
    hasCaching: false,
    hasParallelJobs: totalJobs > 1,
    hasArtifacts: false,
    hasSecrets: false,
    complexity: totalSteps > 10 ? 'high' : totalSteps > 5 ? 'medium' : 'low'
  };

  // Calculate score (0-100)
  let score = 50;
  if (metrics.hasParallelJobs) score += 10;
  if (totalJobs > 0 && totalSteps > 0) score += 10;
  if (totalSteps <= 10) score += 10;
  score = Math.min(100, score);

  const recommendations = [];
  if (!metrics.hasCaching) {
    recommendations.push({ type: 'performance', message: 'Add dependency caching to speed up builds', priority: 'high' });
  }
  if (totalSteps > 15) {
    recommendations.push({ type: 'complexity', message: 'Consider splitting into multiple workflows', priority: 'medium' });
  }

  return { score, metrics, recommendations, pipeline };
}

export default { analyzePipeline };
