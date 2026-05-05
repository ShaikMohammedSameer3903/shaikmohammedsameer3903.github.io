// Validation Engine for pipeline models
// Validates the parsed pipeline model for structural correctness

export function validateYamlCode(code) {
  const errors = [];
  const warnings = [];

  if (!code || !code.trim()) {
    errors.push({ line: 1, message: 'Pipeline code cannot be empty', severity: 'error', field: 'code' });
    return { errors, warnings, isValid: false };
  }

  // Basic structural checks
  if (!code.includes('name:')) {
    warnings.push({ line: 1, message: 'Missing "name" field', severity: 'warning', field: 'name' });
  }
  if (!code.includes('on:') && !code.includes('on ')) {
    errors.push({ line: 1, message: 'Missing "on" trigger definition', severity: 'error', field: 'on' });
  }
  if (!code.includes('jobs:')) {
    errors.push({ line: 1, message: 'Missing "jobs" section', severity: 'error', field: 'jobs' });
  }

  return { errors, warnings, isValid: errors.length === 0 };
}

export function validatePipelineModel(pipeline) {
  const errors = [];
  const warnings = [];

  if (!pipeline) {
    errors.push({ message: 'No pipeline model provided', severity: 'error' });
    return { errors, warnings, isValid: false };
  }

  if (!pipeline.name) {
    warnings.push({ message: 'Pipeline name is missing', severity: 'warning', field: 'name' });
  }

  if (!pipeline.jobs || pipeline.jobs.length === 0) {
    errors.push({ message: 'Pipeline must have at least one job', severity: 'error', field: 'jobs' });
  } else {
    pipeline.jobs.forEach((job, idx) => {
      if (!job.runsOn && !job['runs-on']) {
        errors.push({ message: `Job "${job.name || idx}" missing "runs-on"`, severity: 'error', field: 'runs-on' });
      }
      if (!job.steps || job.steps.length === 0) {
        errors.push({ message: `Job "${job.name || idx}" has no steps`, severity: 'error', field: 'steps' });
      }
    });
  }

  return { errors, warnings, isValid: errors.length === 0 };
}

export default { validateYamlCode, validatePipelineModel };
