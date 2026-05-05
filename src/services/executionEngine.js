// Execution Engine for pipeline simulation
// Simulates pipeline execution with realistic timing and status updates

export async function executePipeline(pipeline, options = {}) {
  if (!pipeline || !pipeline.jobs || pipeline.jobs.length === 0) {
    return { success: false, status: 'failed', error: 'No jobs to execute', jobs: [], logs: [] };
  }

  const logs = [];
  const jobResults = [];
  let allSuccess = true;

  for (const job of pipeline.jobs) {
    logs.push({ timestamp: new Date().toISOString(), level: 'INFO', message: `Starting job: ${job.name}` });

    const stepResults = [];
    for (const step of (job.steps || [])) {
      const success = Math.random() > 0.1; // 90% success rate for simulation
      stepResults.push({
        ...step,
        status: success ? 'success' : 'failed',
        duration: Math.floor(800 + Math.random() * 4000)
      });

      if (!success) {
        allSuccess = false;
        logs.push({ timestamp: new Date().toISOString(), level: 'ERROR', message: `Step failed: ${step.name}` });
        break;
      }
      logs.push({ timestamp: new Date().toISOString(), level: 'INFO', message: `Step completed: ${step.name}` });
    }

    jobResults.push({
      ...job,
      steps: stepResults,
      status: allSuccess ? 'success' : 'failed'
    });

    if (!allSuccess) break;
  }

  return {
    success: allSuccess,
    status: allSuccess ? 'success' : 'failed',
    jobs: jobResults,
    logs,
    totalDuration: jobResults.reduce((sum, j) => sum + (j.steps || []).reduce((s, step) => s + (step.duration || 0), 0), 0)
  };
}

export default { executePipeline };
