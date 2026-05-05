// Pipeline Parser Service
// Parses YAML pipeline code and provides validation utilities

import yaml from 'js-yaml';

export function validateYaml(code) {
  if (!code || typeof code !== 'string') {
    return { errors: [{ message: 'No code provided', severity: 'error' }], warnings: [] };
  }

  const errors = [];
  const warnings = [];

  try {
    const cleanCode = code.replace(/^```(?:ya?ml|groovy|json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    yaml.load(cleanCode);
  } catch (err) {
    errors.push({
      line: err.mark ? err.mark.line + 1 : 1,
      message: `YAML syntax error: ${err.reason || err.message}`,
      severity: 'error',
      field: 'syntax'
    });
  }

  // Structural checks
  if (!code.includes('on:') && !code.includes('jobs:')) {
    warnings.push({ message: 'Pipeline may be missing trigger or jobs definition', severity: 'warning' });
  }

  return { errors, warnings };
}

export function recoverYaml(code) {
  if (!code) return '# Empty pipeline\nname: CI/CD Pipeline\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Build\n        run: echo "Building..."';

  // Try to fix common YAML issues
  let fixed = code;
  // Remove tabs
  fixed = fixed.replace(/\t/g, '  ');
  // Ensure proper newline at end
  if (!fixed.endsWith('\n')) fixed += '\n';

  return fixed;
}

export function parsePipelineConfig(code, platform = 'github') {
  if (!code) return { error: 'No code provided', jobs: [] };

  try {
    const cleanCode = code.replace(/^```(?:ya?ml|groovy|json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    const parsed = yaml.load(cleanCode);

    if (!parsed || typeof parsed !== 'object') {
      return { error: 'Invalid YAML', jobs: [] };
    }

    const jobs = [];
    if (parsed.jobs && typeof parsed.jobs === 'object') {
      Object.entries(parsed.jobs).forEach(([id, job]) => {
        jobs.push({
          id,
          name: id,
          'runs-on': job['runs-on'] || 'ubuntu-latest',
          needs: Array.isArray(job.needs) ? job.needs : job.needs ? [job.needs] : [],
          steps: Array.isArray(job.steps) ? job.steps.map((s, idx) => ({
            id: `step-${idx}`,
            name: s.name || s.uses || s.run || `Step ${idx + 1}`,
            uses: s.uses || null,
            run: s.run || null,
            status: 'pending'
          })) : [],
          status: 'pending'
        });
      });
    }

    return { error: null, jobs, name: parsed.name || 'Pipeline' };
  } catch (err) {
    return { error: err.message, jobs: [] };
  }
}

export default { validateYaml, recoverYaml, parsePipelineConfig };
