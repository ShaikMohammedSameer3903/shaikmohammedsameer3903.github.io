// YAML Pipeline Validator — Production-ready multi-platform validator
// Supports GitHub Actions, AWS CodePipeline, and Jenkins
// Uses js-yaml for safe parsing with line-based error mapping

import yaml from 'js-yaml';

// ─── Platform Constants ──────────────────────────────────────────

const PLATFORMS = {
  GITHUB_ACTIONS: 'github-actions',
  AWS_CODEPIPELINE: 'aws-codepipeline',
  JENKINS: 'jenkins',
  AUTO: 'auto',
};

// ─── Line Mapping Helper ─────────────────────────────────────────

/**
 * Build a map from YAML key paths to line numbers by scanning the raw text.
 */
function buildLineMap(code) {
  const lines = code.split('\n');
  const map = {};

  let currentJob = null;
  let currentStep = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineNumber = i + 1;

    if (!trimmed || trimmed.startsWith('#')) continue;

    const indent = line.search(/\S/);

    // Top-level keys
    if (indent === 0 && trimmed.includes(':')) {
      const key = trimmed.split(':')[0].trim();
      map[key] = lineNumber;

      if (key === 'jobs') {
        currentJob = null;
      }
    }

    // Job-level keys (indent 2)
    if (indent === 2 && trimmed.includes(':') && !trimmed.startsWith('-')) {
      const key = trimmed.split(':')[0].trim();

      // Detect job ID
      if (map['jobs'] && !currentJob) {
        currentJob = key;
        map[`jobs.${key}`] = lineNumber;
      } else if (currentJob) {
        map[`jobs.${currentJob}.${key}`] = lineNumber;
      }
    }

    // runs-on (indent 4+ under a job)
    if (indent >= 4 && trimmed.startsWith('runs-on:')) {
      if (currentJob) {
        map[`jobs.${currentJob}.runs-on`] = lineNumber;
      }
    }

    // Steps block
    if (indent >= 4 && trimmed === 'steps:') {
      currentStep = 0;
      if (currentJob) {
        map[`jobs.${currentJob}.steps`] = lineNumber;
      }
    }

    // Individual step (starts with -)
    if (indent >= 6 && trimmed.startsWith('- ')) {
      if (currentJob && currentStep !== null) {
        map[`jobs.${currentJob}.steps[${currentStep}]`] = lineNumber;
        currentStep++;
      }
    }
  }

  return map;
}

/**
 * Find the best matching line number for a given field path.
 */
function findLine(lineMap, path, fallback = 1) {
  // Direct match
  if (lineMap[path]) return lineMap[path];

  // Partial match: find the longest matching prefix
  const parts = path.split('.');
  for (let len = parts.length - 1; len > 0; len--) {
    const prefix = parts.slice(0, len).join('.');
    if (lineMap[prefix]) return lineMap[prefix];
  }

  return fallback;
}

// ─── Main Validator ───────────────────────────────────────────────

/**
 * Validate a CI/CD pipeline YAML string.
 *
 * @param {string} code - Raw YAML code
 * @param {string} platform - 'github-actions' | 'aws-codepipeline' | 'jenkins' | 'auto'
 * @returns {{ isValid: boolean, errors: Array, warnings: Array }}
 */
export function validatePipeline(code, platform = 'auto') {
  const errors = [];
  const warnings = [];

  // ─── 1. Global Rules ────────────────────────────────────────

  if (!code || !code.trim()) {
    errors.push({ line: 1, message: 'Pipeline code cannot be empty', severity: 'error', field: 'code' });
    return { isValid: false, errors, warnings };
  }

  // Strip markdown code fences (```yaml ... ```) that AI models often wrap around output
  let cleanCode = code.replace(/^```(?:ya?ml|groovy|json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

  // Detect platform if auto
  const detectedPlatform = platform === 'auto' ? detectPlatform(cleanCode) : platform;

  // ─── 2. YAML Syntax Validation (js-yaml) ─────────────────────

  let parsed = null;
  let lineMap = {};

  try {
    lineMap = buildLineMap(cleanCode);
    parsed = yaml.load(cleanCode, {
      json: true,
      onWarning: (warning) => {
        if (warning && warning.mark) {
          warnings.push({
            line: warning.mark.line + 1,
            message: `YAML warning: ${warning.message}`,
            severity: 'warning',
            field: 'syntax',
          });
        }
      },
    });
  } catch (err) {
    if (err.mark) {
      errors.push({
        line: err.mark.line + 1,
        column: err.mark.column + 1,
        message: `YAML syntax error: ${err.reason || err.message}`,
        severity: 'error',
        field: 'syntax',
        suggestion: 'Check for incorrect indentation, missing colons, or invalid characters',
      });
    } else {
      errors.push({
        line: 1,
        message: `YAML parse error: ${err.message}`,
        severity: 'error',
        field: 'syntax',
      });
    }
    return { isValid: false, errors, warnings };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    errors.push({ line: 1, message: 'Pipeline must be a YAML mapping', severity: 'error', field: 'structure' });
    return { isValid: false, errors, warnings };
  }

  // ─── 3. Indentation Check ────────────────────────────────────

  const lines = code.split('\n');
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    if (line.includes('\t')) {
      errors.push({
        line: lineNumber,
        message: 'Tabs are not allowed in YAML — use spaces',
        severity: 'error',
        field: 'indentation',
        suggestion: 'Replace tabs with 2-space indentation',
      });
    }
    if (line.match(/^\s+/)) {
      const spaces = line.match(/^\s+/)[0].length;
      if (spaces % 2 !== 0) {
        warnings.push({
          line: lineNumber,
          message: 'Inconsistent indentation: use 2-space increments',
          severity: 'warning',
          field: 'indentation',
        });
      }
    }
  });

  // ─── 4. Platform-Specific Validation ─────────────────────────

  switch (detectedPlatform) {
    case PLATFORMS.GITHUB_ACTIONS:
      validateGitHubActions(parsed, lineMap, errors, warnings);
      break;
    case PLATFORMS.AWS_CODEPIPELINE:
      validateAWSCodePipeline(parsed, lineMap, errors, warnings);
      break;
    case PLATFORMS.JENKINS:
      validateJenkins(code, parsed, lineMap, errors, warnings);
      break;
    default:
      validateGitHubActions(parsed, lineMap, errors, warnings);
  }

  // ─── 5. Security Checks ──────────────────────────────────────

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (/(password|secret|token|api[_-]?key)\s*[:=]\s*['"][^'"]{4,}['"]/i.test(trimmed)) {
      errors.push({
        line: index + 1,
        message: 'Possible hardcoded secret detected',
        severity: 'error',
        field: 'security',
        suggestion: 'Use ${{ secrets.NAME }} for GitHub Actions or environment variables',
      });
    }
  });

  return { isValid: errors.length === 0, errors, warnings };
}

// ─── Platform Detection ──────────────────────────────────────────

function detectPlatform(code) {
  if (code.includes('on:') && (code.includes('uses:') || code.includes('jobs:'))) {
    return PLATFORMS.GITHUB_ACTIONS;
  }
  if (code.includes('Name:') && code.includes('ActionsMode:')) {
    return PLATFORMS.AWS_CODEPIPELINE;
  }
  if (code.includes('pipeline') && code.includes('agent') && (code.includes('stage') || code.includes('stages'))) {
    return PLATFORMS.JENKINS;
  }
  if (code.includes('on:') && code.includes('jobs:')) {
    return PLATFORMS.GITHUB_ACTIONS;
  }
  return PLATFORMS.GITHUB_ACTIONS;
}

// ─── GitHub Actions Validation ────────────────────────────────────

function validateGitHubActions(parsed, lineMap, errors, warnings) {
  // Required top-level fields
  if (!parsed.name) {
    errors.push({
      line: findLine(lineMap, 'name'),
      message: 'Missing required "name" field',
      severity: 'error',
      field: 'name',
      suggestion: 'Add "name: Your Pipeline Name" at the top',
    });
  }

  if (!parsed.on) {
    errors.push({
      line: findLine(lineMap, 'on'),
      message: 'Missing required "on" trigger definition',
      severity: 'error',
      field: 'on',
      suggestion: 'Add "on: push" or "on: pull_request"',
    });
  }

  if (!parsed.jobs) {
    errors.push({
      line: findLine(lineMap, 'jobs'),
      message: 'Missing required "jobs" field',
      severity: 'error',
      field: 'jobs',
      suggestion: 'Add a "jobs:" section with at least one job',
    });
    return;
  }

  if (typeof parsed.jobs !== 'object') {
    errors.push({
      line: findLine(lineMap, 'jobs'),
      message: '"jobs" must be a mapping',
      severity: 'error',
      field: 'jobs',
    });
    return;
  }

  // Validate each job
  const jobIds = Object.keys(parsed.jobs);

  jobIds.forEach(jobId => {
    const job = parsed.jobs[jobId];
    const jobPath = `jobs.${jobId}`;

    if (!job['runs-on']) {
      errors.push({
        line: findLine(lineMap, `${jobPath}.runs-on`),
        message: `Job "${jobId}" is missing "runs-on"`,
        severity: 'error',
        field: 'runs-on',
        suggestion: 'Add "runs-on: ubuntu-latest"',
      });
    }

    if (!job.steps) {
      errors.push({
        line: findLine(lineMap, `${jobPath}.steps`),
        message: `Job "${jobId}" has no "steps"`,
        severity: 'error',
        field: 'steps',
        suggestion: 'Add a "steps:" array with at least one step',
      });
      return;
    }

    if (!Array.isArray(job.steps) || job.steps.length === 0) {
      errors.push({
        line: findLine(lineMap, `${jobPath}.steps`),
        message: `Job "${jobId}" has empty steps`,
        severity: 'error',
        field: 'steps',
      });
      return;
    }

    // Validate each step
    job.steps.forEach((step, idx) => {
      const stepPath = `${jobPath}.steps[${idx}]`;
      const stepLine = findLine(lineMap, stepPath);

      if (!step.uses && !step.run) {
        errors.push({
          line: stepLine,
          message: `Step ${idx + 1} in job "${jobId}" has no "uses" or "run"`,
          severity: 'error',
          field: 'step',
          suggestion: 'Add either "uses:" or "run:" to this step',
        });
      }

      if (!step.name) {
        warnings.push({
          line: stepLine,
          message: `Step ${idx + 1} in job "${jobId}" has no "name"`,
          severity: 'warning',
          field: 'name',
          suggestion: 'Add "name:" for better readability in the UI',
        });
      }

      // Invalid keys check
      const validStepKeys = ['id', 'name', 'uses', 'run', 'with', 'env', 'if', 'timeout-minutes', 'continue-on-error', 'working-directory', 'shell'];
      Object.keys(step).forEach(key => {
        if (!validStepKeys.includes(key)) {
          warnings.push({
            line: stepLine,
            message: `Unknown key "${key}" in step ${idx + 1}`,
            severity: 'warning',
            field: key,
          });
        }
      });
    });

    // Check for checkout step
    const hasCheckout = job.steps.some(s => s.uses?.includes('checkout'));
    if (!hasCheckout && job.steps.length > 0) {
      warnings.push({
        line: findLine(lineMap, `${jobPath}.steps`),
        message: `Job "${jobId}" is missing "actions/checkout" step`,
        severity: 'warning',
        field: 'checkout',
        suggestion: 'Add "- uses: actions/checkout@v4" as the first step',
      });
    }

    // Validate dependsOn references
    if (job.needs) {
      const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
      needs.forEach(dep => {
        if (!jobIds.includes(dep)) {
          errors.push({
            line: findLine(lineMap, `${jobPath}.needs`),
            message: `Job "${jobId}" depends on "${dep}" which does not exist`,
            severity: 'error',
            field: 'needs',
            suggestion: `Available jobs: ${jobIds.join(', ')}`,
          });
        }
      });
    }
  });

  // Circular dependency detection
  detectCircularDeps(parsed.jobs, lineMap, errors);
}

// ─── AWS CodePipeline Validation ──────────────────────────────────

function validateAWSCodePipeline(parsed, lineMap, errors, warnings) {
  if (!parsed.pipeline) {
    errors.push({
      line: 1,
      message: 'Missing required "pipeline" field',
      severity: 'error',
      field: 'pipeline',
      suggestion: 'Wrap configuration in a "pipeline:" block',
    });
  }

  const pipeline = parsed.pipeline || parsed;

  if (!pipeline.stages && !parsed.stages) {
    errors.push({
      line: 1,
      message: 'Missing required "stages" field',
      severity: 'error',
      field: 'stages',
      suggestion: 'Add "stages:" with at least Source and Deploy stages',
    });
  }

  const stages = pipeline.stages || parsed.stages || [];

  if (!Array.isArray(stages) || stages.length === 0) {
    errors.push({
      line: 1,
      message: '"stages" must be a non-empty array',
      severity: 'error',
      field: 'stages',
    });
  } else {
    stages.forEach((stage, idx) => {
      if (!stage.name && !stage.Name) {
        errors.push({
          line: 1,
          message: `Stage ${idx + 1} is missing a name`,
          severity: 'error',
          field: 'name',
        });
      }

      const actions = stage.actions || stage.Actions || [];
      if (actions.length === 0) {
        warnings.push({
          line: 1,
          message: `Stage "${stage.name || stage.Name || idx}" has no actions`,
          severity: 'warning',
          field: 'actions',
        });
      }
    });

    if (stages.length < 2) {
      warnings.push({
        line: 1,
        message: 'AWS CodePipeline typically requires at least Source and Deploy stages',
        severity: 'warning',
        field: 'stages',
      });
    }
  }
}

// ─── Jenkins Validation ──────────────────────────────────────────

function validateJenkins(code, parsed, lineMap, errors, warnings) {
  // Jenkins pipelines are typically Groovy, not pure YAML.
  // We do text-based validation since js-yaml can't parse Groovy.

  if (!code.includes('pipeline')) {
    errors.push({
      line: 1,
      message: 'Missing "pipeline" block',
      severity: 'error',
      field: 'pipeline',
      suggestion: 'Wrap your Jenkinsfile in "pipeline { ... }"',
    });
  }

  if (!code.includes('stages') && !code.includes('stage')) {
    errors.push({
      line: 1,
      message: 'Missing "stages" block',
      severity: 'error',
      field: 'stages',
      suggestion: 'Add "stages { stage(...) { ... } }"',
    });
  }

  if (!code.includes('agent')) {
    warnings.push({
      line: 1,
      message: 'Missing "agent" declaration',
      severity: 'warning',
      field: 'agent',
      suggestion: 'Add "agent any" or "agent { docker ... }"',
    });
  }

  // Count stages
  const stageMatches = code.match(/stage\s*\(\s*['"][^'"]+['"]\s*\)/g) || [];
  if (stageMatches.length === 0) {
    errors.push({
      line: 1,
      message: 'No stages defined in Jenkins pipeline',
      severity: 'error',
      field: 'stages',
    });
  }

  // Check for steps inside stages
  const lines = code.split('\n');
  let inStage = false;
  let currentStageName = '';
  let hasSteps = false;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const lineNumber = index + 1;

    const stageMatch = trimmed.match(/^stage\s*\(\s*['"](.+?)['"]\s*\)/);
    if (stageMatch) {
      if (inStage && !hasSteps) {
        warnings.push({
          line: lineNumber - 2,
          message: `Stage "${currentStageName}" has no steps`,
          severity: 'warning',
          field: 'steps',
        });
      }
      inStage = true;
      currentStageName = stageMatch[1];
      hasSteps = false;
    }

    if (inStage && (trimmed.startsWith('sh ') || trimmed.startsWith('bat ') || trimmed.startsWith('echo ') || trimmed.startsWith('steps'))) {
      hasSteps = true;
    }
  });

  if (inStage && !hasSteps) {
    warnings.push({
      line: 1,
      message: `Stage "${currentStageName}" has no steps`,
      severity: 'warning',
      field: 'steps',
    });
  }
}

// ─── Circular Dependency Detection ────────────────────────────────

function detectCircularDeps(jobs, lineMap, errors) {
  if (!jobs) return;

  const jobIds = Object.keys(jobs);
  const visited = new Set();
  const recursionStack = new Set();

  function hasCycle(jobId) {
    visited.add(jobId);
    recursionStack.add(jobId);

    const job = jobs[jobId];
    if (job) {
      const needs = Array.isArray(job.needs) ? job.needs : job.needs ? [job.needs] : [];
      for (const dep of needs) {
        if (!visited.has(dep)) {
          if (hasCycle(dep)) return true;
        } else if (recursionStack.has(dep)) {
          return true;
        }
      }
    }

    recursionStack.delete(jobId);
    return false;
  }

  for (const jobId of jobIds) {
    if (!visited.has(jobId)) {
      if (hasCycle(jobId)) {
        errors.push({
          line: findLine(lineMap, `jobs.${jobId}.needs`),
          message: 'Circular dependency detected in job graph',
          severity: 'error',
          field: 'needs',
          suggestion: 'Remove circular references between jobs',
        });
        break;
      }
    }
  }
}

// ─── Extended API ────────────────────────────────────────────────

/**
 * Full debug validation: YAML syntax + structural validation.
 */
export function debugPipeline(code) {
  return validatePipeline(code, 'auto');
}

// ─── Monaco Integration ──────────────────────────────────────────

export function getSeverity(type) {
  switch (type) {
    case 'error': return 8;
    case 'warning': return 4;
    case 'info': return 2;
    default: return 1;
  }
}

export function createMonacoMarkers(validationResult, editor) {
  const markers = [];

  (validationResult.errors || []).forEach(error => {
    markers.push({
      severity: 8,
      message: error.message + (error.suggestion ? ` — ${error.suggestion}` : ''),
      startLineNumber: error.line || 1,
      startColumn: error.column || 1,
      endLineNumber: error.line || 1,
      endColumn: 1000,
    });
  });

  (validationResult.warnings || []).forEach(warning => {
    markers.push({
      severity: 4,
      message: warning.message + (warning.suggestion ? ` — ${warning.suggestion}` : ''),
      startLineNumber: warning.line || 1,
      startColumn: 1,
      endLineNumber: warning.line || 1,
      endColumn: 1000,
    });
  });

  return markers;
}
