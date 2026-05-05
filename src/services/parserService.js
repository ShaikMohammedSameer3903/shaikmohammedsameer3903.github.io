// Pipeline Parser Service
// Parses YAML pipeline code into a unified pipeline model

import yaml from 'js-yaml';

export function parsePipeline(code) {
  if (!code || typeof code !== 'string') {
    return { success: false, error: 'No code provided', pipeline: null };
  }

  try {
    // Strip markdown code fences
    const cleanCode = code.replace(/^```(?:ya?ml|groovy|json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

    const parsed = yaml.load(cleanCode);

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Invalid YAML structure', pipeline: null };
    }

    // Convert to unified model
    const pipeline = {
      name: parsed.name || 'Unnamed Pipeline',
      platform: detectPlatform(parsed),
      trigger: parsed.on || null,
      jobs: []
    };

    if (parsed.jobs && typeof parsed.jobs === 'object') {
      pipeline.jobs = Object.entries(parsed.jobs).map(([id, job]) => ({
        id,
        name: id,
        runsOn: job['runs-on'] || 'ubuntu-latest',
        needs: Array.isArray(job.needs) ? job.needs : job.needs ? [job.needs] : [],
        steps: Array.isArray(job.steps) ? job.steps.map((step, idx) => ({
          id: `step-${idx}`,
          name: step.name || step.uses || step.run || `Step ${idx + 1}`,
          uses: step.uses || null,
          run: step.run || null,
          with: step.with || {},
          env: step.env || {}
        })) : [],
        environment: job.environment || null,
        condition: job.if || null
      }));
    }

    return { success: true, pipeline };
  } catch (err) {
    return { success: false, error: err.message, pipeline: null };
  }
}

function detectPlatform(parsed) {
  if (parsed.on && parsed.jobs) return 'github';
  if (parsed.pipeline || parsed.stages) return 'aws';
  if (parsed.pipeline && parsed.agent) return 'jenkins';
  return 'github';
}

export default { parsePipeline };
