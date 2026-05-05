/**
 * Strict CI/CD Pipeline Simulator Engine
 * Uses js-yaml for real YAML parsing + strict structure validation.
 * Wrong pipeline = FAILED simulation. No fake success.
 */

import yaml from 'js-yaml';

export const JOB_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILURE: 'failure',
  SKIPPED: 'skipped'
};

export const STEP_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILURE: 'failure'
};

// ─── Known safe commands (strict whitelist) ───────────────────
const KNOWN_COMMANDS = [
  'npm install', 'npm ci', 'npm test', 'npm run test', 'npm run build', 'npm run lint',
  'npm start', 'npm run', 'npm publish',
  'yarn install', 'yarn test', 'yarn build', 'yarn lint', 'yarn start',
  'pip install', 'pip install -r', 'python -m pytest', 'python setup.py',
  'mvn clean install', 'mvn test', 'mvn package', 'mvn deploy',
  'gradle build', 'gradle test', 'gradle assemble',
  'dotnet build', 'dotnet test', 'dotnet publish', 'dotnet restore',
  'go build', 'go test', 'go mod', 'go run',
  'cargo build', 'cargo test', 'cargo run',
  'make', 'make test', 'make build', 'make install', 'make clean',
  'git checkout', 'git pull', 'git fetch', 'git clone',
  'docker build', 'docker push', 'docker pull', 'docker compose', 'docker login',
  'kubectl apply', 'kubectl rollout', 'kubectl get',
  'terraform apply', 'terraform plan', 'terraform init',
  'ansible-playbook',
  'echo', 'cat', 'ls', 'pwd', 'mkdir', 'cp', 'mv',
  'curl -o', 'wget', 'tar', 'unzip', 'chmod +x',
  'node', 'java', 'sh', 'bash',
  'pnpm install', 'pnpm test', 'pnpm build',
  'npx', 'bun install', 'bun test', 'bun build',
  'jest', 'vitest', 'mocha', 'cypress',
  'eslint', 'prettier', 'tsc',
  'webpack', 'vite build', 'rollup',
  'helm install', 'helm upgrade',
  'aws s3', 'aws cloudformation', 'aws ecr', 'aws configure', 'aws deploy', 'aws lambda', 'aws ec2',
  'az acr', 'az webapp', 'az login',
  'gcloud builds', 'gcloud deploy', 'gcloud auth',
  'checkout scm', 'checkout'
];

const DANGEROUS_COMMANDS = [
  'rm -rf /', 'del /f /s', 'format c:', 'mkfs',
  'dd if=', '> /dev/sda', ':(){:|:&};:', 'fork bomb',
  'shutdown', 'reboot', 'halt', 'poweroff',
  'chmod -R 777 /', 'chown -R', 'kill -9 1',
  'drop database', 'truncate table', 'delete from',
  'wget * | sh', 'curl * | bash'
];

const WARNING_COMMANDS = [
  'chmod 777', 'chmod -R 777', '| sh', '| bash', '| sudo',
  'force push', 'push -f', 'push --force',
  'npm publish --access public', '--unsafe-perm'
];

// ─── Detect platform from code content ───────────────────────
export const detectPlatform = (code) => {
  const c = String(code || "").toLowerCase();
  if (!c) return null;
  
  // GitHub Actions detection
  if (c.includes('on:') && (c.includes('jobs:') || c.includes('job:'))) return 'github';
  
  // Jenkins detection
  if (c.includes('pipeline {') || c.includes('node {') || c.includes('stage(')) return 'jenkins';
  
  // AWS CodePipeline detection
  if (c.includes('phases:') || c.includes('stages:')) return 'aws';
  if (c.includes('buildspec') || c.includes('version: 0.2')) return 'aws';
  
  return 'github'; // Default to github for better UX
};

// ─── STEP 1: YAML VALIDATION (js-yaml) ────────────────────────
const parseYAML = (code) => {
  try {
    const rawCode = String(code || "");
    // Pre-process: replace {{template_vars}} with placeholder strings
    const sanitized = rawCode.replace(/\{\{(\w+)\}\}/g, (_, name) => `__${name}__`);
    const parsed = yaml.load(sanitized, { schema: yaml.DEFAULT_SCHEMA });
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('YAML must produce an object');
    }
    return parsed;
  } catch (e) {
    const msg = e.message || 'Unknown YAML error';
    throw new Error(`Invalid YAML syntax: ${msg.split('\n')[0]}`);
  }
};

// ─── STEP 2: STRUCTURE VALIDATION (GitHub Actions) ────────────
const validateGitHubStructure = (parsed) => {
  if (!parsed.on) {
    throw new Error("Missing 'on' trigger — every workflow needs a trigger (on: push, on: pull_request, etc.)");
  }
  if (!parsed.jobs) {
    throw new Error("Missing 'jobs' — every workflow must define at least one job");
  }
  if (typeof parsed.jobs !== 'object' || Array.isArray(parsed.jobs)) {
    throw new Error("'jobs' must be a mapping of job IDs to job configurations");
  }

  const jobIds = Object.keys(parsed.jobs || {});
  if (jobIds?.length === 0) {
    throw new Error("'jobs' is empty — define at least one job");
  }

  for (const jobId of jobIds) {
    const job = parsed.jobs[jobId];

    if (!job['runs-on']) {
      throw new Error(`Job "${jobId}" missing 'runs-on' — specify the runner OS (e.g. runs-on: ubuntu-latest)`);
    }

    if (!Array.isArray(job.steps)) {
      throw new Error(`Job "${jobId}" steps must be an array — use "steps:" with a dash-separated list`);
    }

    if (job?.steps?.length === 0) {
      throw new Error(`Job "${jobId}" has zero steps — every job needs at least one step`);
    }

    // STEP 3: Validate each step
    validateGitHubSteps(jobId, job.steps);

    // Validate needs references
    if (job.needs) {
      const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
      for (const dep of needs) {
        if (!parsed.jobs[dep]) {
          throw new Error(`Job "${jobId}" depends on "${dep}" but that job does not exist`);
        }
      }
    }
  }
};

// ─── STEP 3: STEP VALIDATION ──────────────────────────────────
const validateGitHubSteps = (jobId, steps) => {
  steps.forEach((step, index) => {
    const stepNum = index + 1;

    if (typeof step !== 'object' || step === null) {
      throw new Error(`Job "${jobId}" step ${stepNum}: must be a mapping, got ${typeof step}`);
    }

    // Every step must have 'run' or 'uses' or 'name' with 'uses'/'run'
    const hasRun = step.run !== undefined && step.run !== null;
    const hasUses = step.uses !== undefined && step.uses !== null;

    if (!hasRun && !hasUses) {
      throw new Error(`Job "${jobId}" step ${stepNum}: must have either 'run' or 'uses' — got neither`);
    }

    // STEP 4: Validate 'uses' format
    if (hasUses) {
      if (typeof step.uses !== 'string' || step.uses.trim() === '') {
        throw new Error(`Job "${jobId}" step ${stepNum}: 'uses' is empty — provide an action reference`);
      }
      validateUsesFormat(jobId, stepNum, step.uses);
    }

    // Validate 'run' content
    if (hasRun) {
      if (typeof step.run !== 'string' || step.run.trim() === '') {
        throw new Error(`Job "${jobId}" step ${stepNum}: 'run' is empty — provide a shell command`);
      }
    }
  });
};

// ─── STEP 4: ACTION VALIDATION ────────────────────────────────
const validateUsesFormat = (jobId, stepNum, uses) => {
  // Local actions (./path) are valid
  if (uses.startsWith('./')) return;

  // Docker actions (docker://image) are valid
  if (uses.startsWith('docker://')) return;

  // Standard format: owner/repo@version or owner/repo/path@version
  if (!uses.includes('@')) {
    throw new Error(`Job "${jobId}" step ${stepNum}: action "${uses}" missing version tag — use format "owner/repo@version" (e.g. actions/checkout@v4)`);
  }

  const parts = uses?.split('@') || [];
  if (parts?.length !== 2) {
    throw new Error(`Job "${jobId}" step ${stepNum}: invalid action format "${uses}" — use "owner/repo@version"`);
  }

  const repoPart = parts[0];
  const version = parts[1];

  if (!repoPart.includes('/')) {
    throw new Error(`Job "${jobId}" step ${stepNum}: action "${uses}" must be "owner/repo" format (e.g. actions/checkout)`);
  }

  if (!version || version.trim() === '') {
    throw new Error(`Job "${jobId}" step ${stepNum}: action "${uses}" has empty version after @`);
  }
};

// ─── STEP 5: COMMAND SIMULATION (strict) ──────────────────────
const simulateCommand = (cmd) => {
  const cmdStr = String(cmd || "");
  if (!cmdStr.trim()) return { result: 'failed', reason: 'Empty command' };

  const cmdLower = cmdStr.toLowerCase().trim();

  // MOCK EXTERNAL COMMANDS: docker login, docker push, aws commands
  if (cmdLower.includes('docker login')) return { result: 'success', reason: 'Simulating Docker login...', mock: true, icon: '🔐' };
  if (cmdLower.includes('docker push')) return { result: 'success', reason: 'Simulating Docker push...', mock: true, icon: '📦' };
  if (cmdLower.startsWith('aws ')) return { result: 'success', reason: `Simulating AWS operation: ${cmdStr.split(' ')[1]}...`, mock: true, icon: '☁️' };
  if (cmdLower.startsWith('gcloud ')) return { result: 'success', reason: 'Simulating GCP operation...', mock: true, icon: '☁️' };
  if (cmdLower.startsWith('az ')) return { result: 'success', reason: 'Simulating Azure operation...', mock: true, icon: '☁️' };

  // Check dangerous first
  for (const dangerous of DANGEROUS_COMMANDS) {
    if (cmdLower.includes(dangerous.toLowerCase())) {
      return { result: 'dangerous', reason: `DANGEROUS command: "${dangerous}" — execution blocked` };
    }
  }

  // Check warnings
  for (const warning of WARNING_COMMANDS) {
    if (cmdLower.includes(warning.toLowerCase())) {
      return { result: 'warning', reason: `Warning: "${warning}" detected` };
    }
  }

  // Allow common CI/CD prefixes and tools
  const ALLOWED_PREFIXES = [
    'npm', 'yarn', 'pnpm', 'bun', 'npx',
    'pip', 'python', 'py',
    'mvn', 'gradle',
    'dotnet', 'nuget',
    'go', 'cargo', 'rustc',
    'make', 'cmake',
    'docker', 'kubectl', 'helm',
    'terraform', 'ansible',
    'git', 'curl', 'wget',
    'echo', 'cat', 'ls', 'mkdir', 'cp', 'mv', 'rm',
    'chmod', 'chown',
    'tar', 'unzip', 'gzip',
    'node', 'java', 'sh', 'bash',
    'aws', 'az', 'gcloud',
    'jest', 'vitest', 'mocha', 'cypress',
    'eslint', 'prettier', 'tsc', 'webpack', 'vite', 'rollup',
    'sleep', 'env', 'export', 'source',
    'checkout', 'perfReport', 'publishHTML',
    'jmeter', 'gatling', 'k6', 'exit'
  ];

  // Check if command starts with an allowed prefix
  for (const prefix of ALLOWED_PREFIXES) {
    if (cmdLower.startsWith(prefix.toLowerCase())) {
      return { result: 'success', reason: `Recognized command: ${prefix}` };
    }
  }

  // Unknown command — FAIL in strict mode
  return { result: 'failed', reason: `Unknown/unrecognized command: "${cmdStr}" — only known CI/CD commands are allowed` };
};

// ─── Parse pipeline configuration ─────────────────────────────
export const parsePipelineConfig = (code, platform) => {
  if (!code || code.trim() === '') {
    return { jobs: [], platform, error: 'Pipeline configuration is empty' };
  }

  const detectedPlatform = platform || detectPlatform(code);
  if (!detectedPlatform) {
    return { jobs: [], platform: null, error: 'Cannot detect pipeline type. Code does not match GitHub Actions, AWS CodePipeline, or Jenkins syntax.' };
  }

  try {
    switch (detectedPlatform) {
      case 'github': return parseGitHubActions(code);
      case 'aws': return parseAWSCodePipeline(code);
      case 'jenkins': return parseJenkinsPipeline(code);
      default: return { jobs: [], platform: detectedPlatform, error: `Unsupported platform: ${detectedPlatform}` };
    }
  } catch (error) {
    return { jobs: [], platform: detectedPlatform, error: error.message };
  }
};

// ─── GitHub Actions Parser (js-yaml + strict validation) ──────
const parseGitHubActions = (code) => {
  // STEP 1: Parse YAML
  const parsed = parseYAML(code);

  // STEP 2: Validate structure
  validateGitHubStructure(parsed);

  // Convert parsed YAML into simulation jobs
  const jobs = [];
  for (const [jobId, jobData] of Object.entries(parsed.jobs)) {
    const steps = [];
    jobData.steps.forEach((step, index) => {
      const stepName = step.name || step.uses || step.run || `Step ${index + 1}`;
      const command = step.run || '';
      const usesAction = step.uses || '';

      steps.push({
        id: `step-${index}`,
        name: stepName,
        command,
        uses: usesAction,
        status: STEP_STATUS.PENDING,
        duration: 800,
        logs: []
      });
    });

    const dependsOn = jobData.needs
      ? (Array.isArray(jobData.needs) ? jobData.needs : [jobData.needs])
      : [];

    jobs.push({
      name: jobData.name || jobId,
      id: jobId,
      steps,
      dependsOn,
      'runs-on': jobData['runs-on'],
      matrix: jobData.strategy?.matrix || null,
      status: JOB_STATUS.PENDING
    });
  }

  return { jobs, platform: 'github' };
};

// ─── AWS Parser (CodePipeline + CodeBuild) ───────────────────────
const parseAWSCodePipeline = (code) => {
  const parsed = parseYAML(code);

  // Handle CodeBuild format (phases/commands)
  if (parsed.phases) {
    const jobs = [];
    const phases = parsed.phases;
    
    for (const [phaseName, phaseData] of Object.entries(phases)) {
      const steps = [];
      
      // Handle runtime-versions (install phase)
      if (phaseData['runtime-versions']) {
        for (const [runtime, version] of Object.entries(phaseData['runtime-versions'])) {
          steps.push({
            id: `step-${(steps || []).length}`,
            name: `Setup ${runtime} ${version}`,
            command: `Using ${runtime} ${version}`,
            uses: '',
            status: STEP_STATUS.PENDING,
            duration: 600,
            logs: []
          });
        }
      }
      
      // Handle commands
      if (phaseData.commands && Array.isArray(phaseData.commands)) {
        phaseData.commands.forEach((cmd, idx) => {
          steps.push({
            id: `step-${(steps || []).length}`,
            name: cmd?.length > 40 ? cmd?.substring(0, 40) + '...' : cmd,
            command: cmd,
            uses: '',
            status: STEP_STATUS.PENDING,
            duration: 800,
            logs: []
          });
        });
      }
      
      if ((steps || []).length === 0) {
        throw new Error(`AWS Phase "${phaseName}" has no commands or runtime versions`);
      }
      
      jobs.push({
        name: phaseName.charAt(0).toUpperCase() + phaseName.slice(1),
        id: phaseName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        steps,
        dependsOn: (jobs || []).length > 0 ? [(jobs || [])[ (jobs || []).length - 1 ].id] : [],
        status: JOB_STATUS.PENDING
      });
    }
    
    return { jobs, platform: 'aws' };
  }
  
  // Handle CodePipeline format (Stages/Actions)
  if (parsed.Stages || parsed.stages) {
    const stagesRaw = parsed.Stages || parsed.stages;
    if (!Array.isArray(stagesRaw) || (stagesRaw || []).length === 0) {
      throw new Error("'Stages' must be a non-empty array");
    }

    const jobs = [];
    for (let i = 0; i < (stagesRaw || []).length; i++) {
      const stage = stagesRaw[i];
      const stageName = stage.Name || stage.name || `Stage ${i + 1}`;

      if (!stage.Actions && !stage.actions) {
        throw new Error(`Stage "${stageName}" missing 'Actions' — every stage needs actions`);
      }

      const actions = stage.Actions || stage.actions;
      if (!Array.isArray(actions) || (actions || []).length === 0) {
        throw new Error(`Stage "${stageName}" has empty 'Actions' array`);
      }

      const steps = [];
      actions.forEach((action, j) => {
        const actionName = action.Name || action.name || `Action ${j + 1}`;
        const command = action.Configuration?.Command || action.configuration?.command || '';
        steps.push({
          id: `step-${j}`,
          name: actionName,
          command,
          uses: '',
          status: STEP_STATUS.PENDING,
          duration: 800,
          logs: []
        });
      });

      jobs.push({
        name: stageName,
        id: stageName.toLowerCase().replace(/\s+/g, '-'),
        steps,
        dependsOn: i > 0 ? [jobs[i - 1].id] : [],
        status: JOB_STATUS.PENDING
      });
    }

    return { jobs, platform: 'aws' };
  }

  throw new Error("AWS pipeline must have either 'phases' (CodeBuild) or 'Stages' (CodePipeline)");
};

// ─── Jenkins Pipeline Parser (Groovy + strict validation) ──────
const parseJenkinsPipeline = (code) => {
  // Jenkins uses Groovy, not YAML — regex-based parsing
  if (!code.includes('pipeline') && !code.includes('stage')) {
    throw new Error("Not a valid Jenkinsfile — must contain 'pipeline' or 'stage' blocks");
  }

  const jobs = [];
  const stageRegex = /stage\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  let match;

  while ((match = stageRegex.exec(code)) !== null) {
    const stageName = match[1];
    // Extract the block after this stage
    const afterStage = code.substring(match.index + match[0].length);

    // Find steps in this stage
    const steps = [];
    const stepsMatch = afterStage.match(/steps\s*\{([\s\S]*?)\n\s*\}/);

    if (stepsMatch) {
      const stepsBlock = stepsMatch[1];

      // Parse sh commands (including in script blocks)
      const shRegex = /sh\s*['"]([^'"]+)['"]/g;
      let shMatch;
      while ((shMatch = shRegex.exec(stepsBlock)) !== null) {
        steps.push({
          id: `step-${(steps || []).length}`,
          name: shMatch[1]?.length > 40 ? shMatch[1]?.substring(0, 40) + '...' : shMatch[1],
          command: shMatch[1],
          uses: '',
          status: STEP_STATUS.PENDING,
          duration: 800,
          logs: []
        });
      }

      // Parse sh commands with ${} variables
      const shVarRegex = /sh\s*"([^"]*\$\{[^}]+\}[^"]*)"/g;
      let shVarMatch;
      while ((shVarMatch = shVarRegex.exec(stepsBlock)) !== null) {
        steps.push({
          id: `step-${(steps || []).length}`,
          name: shVarMatch[1]?.length > 40 ? shVarMatch[1]?.substring(0, 40) + '...' : shVarMatch[1],
          command: shVarMatch[1],
          uses: '',
          status: STEP_STATUS.PENDING,
          duration: 800,
          logs: []
        });
      }

      // Parse bat commands
      const batRegex = /bat\s*['"]([^'"]+)['"]/g;
      let batMatch;
      while ((batMatch = batRegex.exec(stepsBlock)) !== null) {
        steps.push({
          id: `step-${(steps || []).length}`,
          name: batMatch[1]?.length > 40 ? batMatch[1]?.substring(0, 40) + '...' : batMatch[1],
          command: batMatch[1],
          uses: '',
          status: STEP_STATUS.PENDING,
          duration: 800,
          logs: []
        });
      }

      // Parse echo commands
      const echoRegex = /echo\s*['"]([^'"]+)['"]/g;
      let echoMatch;
      while ((echoMatch = echoRegex.exec(stepsBlock)) !== null) {
        steps.push({
          id: `step-${steps.length}`,
          name: `echo: ${echoMatch[1]}`,
          command: `echo ${echoMatch[1]}`,
          uses: '',
          status: STEP_STATUS.PENDING,
          duration: 400,
          logs: []
        });
      }

      // Parse git url commands
      const gitRegex = /git\s+url:\s*['"]([^'"]+)['"]/g;
      let gitMatch;
      while ((gitMatch = gitRegex.exec(stepsBlock)) !== null) {
        steps.push({
          id: `step-${steps.length}`,
          name: 'Git Checkout',
          command: `git clone ${gitMatch[1]}`,
          uses: '',
          status: STEP_STATUS.PENDING,
          duration: 1000,
          logs: []
        });
      }

      // Parse checkout
      if (stepsBlock.includes('checkout') && !stepsBlock.includes('git url:')) {
        steps.push({
          id: `step-${steps.length}`,
          name: 'Checkout SCM',
          command: 'checkout scm',
          uses: '',
          status: STEP_STATUS.PENDING,
          duration: 1000,
          logs: []
        });
      }

      // Parse archiveArtifacts
      const archiveRegex = /archiveArtifacts\s*['"]([^'"]+)['"]/g;
      let archiveMatch;
      while ((archiveMatch = archiveRegex.exec(stepsBlock)) !== null) {
        steps.push({
          id: `step-${steps.length}`,
          name: `Archive: ${archiveMatch[1]}`,
          command: `archiveArtifacts ${archiveMatch[1]}`,
          uses: '',
          status: STEP_STATUS.PENDING,
          duration: 600,
          logs: []
        });
      }
    }

    if ((steps || []).length === 0) {
      throw new Error(`Stage "${stageName}" has no executable steps — every stage needs at least one sh/bat/echo command`);
    }

    jobs.push({
      name: stageName,
      id: stageName.toLowerCase().replace(/\s+/g, '-'),
      steps,
      dependsOn: (jobs || []).length > 0 ? [(jobs || [])[ (jobs || []).length - 1 ].id] : [],
      status: JOB_STATUS.PENDING
    });
  }

  if ((jobs || []).length === 0) {
    throw new Error("No valid stages found — ensure your Jenkinsfile has stage('name') blocks with steps");
  }

  return { jobs, platform: 'jenkins' };
};

// ─── Generate Realistic Logs ──────────────────────────────────
const generateStepLogs = (stepName, command, usesAction, platform) => {
  const logs = [];

  // Handle 'uses' actions
  if (usesAction && !command) {
    logs.push(`▶ Running action: ${usesAction}`);
    if (usesAction.includes('actions/checkout')) {
      logs.push('Cloning repository...');
      logs.push('Fetching origin/main');
      logs.push('✅ Repository checked out successfully');
    } else if (usesAction.includes('actions/setup-node')) {
      logs.push('Setting up Node.js environment...');
      logs.push('✅ Node.js environment configured');
    } else if (usesAction.includes('actions/setup-python')) {
      logs.push('Setting up Python environment...');
      logs.push('✅ Python environment configured');
    } else if (usesAction.includes('actions/cache')) {
      logs.push('Restoring cache...');
      logs.push('✅ Cache restored successfully');
    } else if (usesAction.includes('actions/upload-artifact')) {
      logs.push('Uploading artifacts...');
      logs.push('✅ Artifacts uploaded successfully');
    } else if (usesAction.includes('actions/download-artifact')) {
      logs.push('Downloading artifacts...');
      logs.push('✅ Artifacts downloaded successfully');
    } else {
      logs.push('Action initialized');
      logs.push('✅ Action completed successfully');
    }
    return logs;
  }

  if (!command) {
    logs.push(`Running step: ${stepName}`);
    logs.push('✅ Step completed');
    return logs;
  }

  // Simulate command
  const simResult = simulateCommand(command);
  logs.push(`$ ${command}`);

  if (simResult.result === 'dangerous') {
    logs.push(`❌ ${simResult.reason}`);
    return logs;
  }

  if (simResult.result === 'warning') {
    logs.push(`⚠️ ${simResult.reason}`);
  }

  const cmd = command.toLowerCase();

  if (cmd.includes('npm install') || cmd.includes('npm ci')) {
    logs.push('Installing dependencies from package.json...');
    logs.push(cmd.includes('ci') ? 'npm ci installing packages...' : 'npm install installing packages...');
    logs.push('added 247 packages in 3.2s');
    logs.push('✅ Dependencies installed successfully');
  } else if (cmd.includes('npm run test') || cmd.includes('npm test')) {
    logs.push('Running test suite...');
    logs.push('Test Suites: 3 passed, 3 total');
    logs.push('Tests: 18 passed, 18 total');
    logs.push('Snapshots: 0 obsolete');
    logs.push('✅ All tests passed');
  } else if (cmd.includes('npm run build') || cmd.includes('npm run lint')) {
    const action = cmd.includes('build') ? 'build' : 'lint';
    logs.push(action === 'build' ? 'Creating optimized production build...' : 'Running linter...');
    logs.push(action === 'build' ? 'Compiled successfully' : 'No lint errors found');
    logs.push(`✅ ${action.charAt(0).toUpperCase() + action.slice(1)} completed`);
  } else if (cmd.includes('yarn install') || cmd.includes('yarn test') || cmd.includes('yarn build')) {
    logs.push('Running yarn command...');
    logs.push('✅ Yarn command completed successfully');
  } else if (cmd.includes('docker build')) {
    logs.push('Building Docker image...');
    logs.push('Step 1/5 : FROM node:18-alpine');
    logs.push('Step 2/5 : WORKDIR /app');
    logs.push('Step 3/5 : COPY package*.json ./');
    logs.push('Step 4/5 : RUN npm ci');
    logs.push('Step 5/5 : COPY . .');
    logs.push('✅ Docker image built successfully');
  } else if (cmd.includes('docker push')) {
    logs.push('Pushing image to registry...');
    logs.push('✅ Image pushed successfully');
  } else if (cmd.includes('mvn')) {
    logs.push('Running Maven...');
    logs.push('[INFO] BUILD SUCCESS');
    logs.push('✅ Maven build completed');
  } else if (cmd.includes('gradle')) {
    logs.push('Running Gradle...');
    logs.push('BUILD SUCCESSFUL');
    logs.push('✅ Gradle build completed');
  } else if (cmd.includes('pip install')) {
    logs.push('Installing Python packages...');
    logs.push('Successfully installed packages');
    logs.push('✅ Python packages installed');
  } else if (cmd.includes('go build') || cmd.includes('go test')) {
    logs.push('Running Go command...');
    logs.push('✅ Go command completed');
  } else if (cmd.includes('cargo')) {
    logs.push('Running Cargo...');
    logs.push('✅ Cargo command completed');
  } else if (cmd.includes('make')) {
    logs.push('Running make...');
    logs.push('✅ Make target completed');
  } else if (cmd.includes('checkout') || cmd.includes('git clone')) {
    logs.push('Cloning repository...');
    logs.push('✅ Repository checked out');
  } else if (cmd.includes('npm ci')) {
    logs.push('Installing dependencies with npm ci...');
    logs.push('npm ci installing packages...');
    logs.push('added 247 packages in 3.2s');
    logs.push('✅ Dependencies installed successfully');
  } else if (cmd.includes('aws s3 sync')) {
    logs.push('Syncing files to S3...');
    logs.push('Upload: dist/index.html to s3://bucket/');
    logs.push('Upload: dist/assets/ to s3://bucket/assets/');
    logs.push('✅ Files synced to S3 successfully');
  } else if (cmd.includes('aws s3')) {
    logs.push('Interacting with S3...');
    logs.push('✅ S3 operation completed');
  } else if (cmd.includes('jmeter')) {
    logs.push('Starting JMeter performance test...');
    logs.push(`Running test with ${command.match(/\$\{CONCURRENT_USERS\}/)?.[0] || '100'} concurrent users`);
    logs.push('Test completed successfully');
    logs.push('✅ JMeter test finished');
  } else if (cmd.includes('gatling')) {
    logs.push('Starting Gatling load test...');
    logs.push('Generating load simulation...');
    logs.push('Gatling test completed');
    logs.push('✅ Gatling test finished');
  } else if (cmd.includes('k6')) {
    logs.push('Starting k6 performance test...');
    logs.push(`Running with ${command.match(/\$\{CONCURRENT_USERS\}/)?.[0] || '100'} virtual users`);
    logs.push('k6 test completed');
    logs.push('✅ k6 test finished');
  } else if (cmd.includes('deploy:test')) {
    logs.push('Deploying to test environment...');
    logs.push('Build artifacts deployed');
    logs.push('Waiting for deployment to stabilize...');
    logs.push('✅ Test deployment ready');
  } else if (cmd.includes('sleep')) {
    const seconds = command.match(/sleep\s*(\d+)/)?.[1] || '30';
    logs.push(`Waiting ${seconds} seconds for deployment...`);
    logs.push(`✅ Waited ${seconds} seconds`);
  } else if (cmd.includes('perfReport')) {
    logs.push('Generating performance report...');
    logs.push('Performance metrics collected');
    logs.push('✅ Report generated');
  } else if (cmd.includes('analyze-performance')) {
    logs.push('Analyzing performance results...');
    logs.push('Comparing against baseline...');
    logs.push('✅ Analysis completed');
  } else if (cmd.includes('publishHTML')) {
    logs.push('Publishing HTML report...');
    logs.push('Report uploaded to artifacts');
    logs.push('✅ Report published');
  } else if (cmd.includes('echo')) {
    const msg = command.replace(/^echo\s+/, '').replace(/['"]/g, '');
    logs.push(msg);
    logs.push('✅ Echo completed');
  } else if (cmd.includes('kubectl')) {
    logs.push('Applying Kubernetes manifests...');
    logs.push('✅ Kubernetes resources applied');
  } else if (cmd.includes('terraform')) {
    logs.push('Running Terraform...');
    logs.push('✅ Terraform completed');
  } else if (simResult.result === 'failed') {
    logs.push(`❌ ${simResult.reason}`);
  } else {
    logs.push(`Executing: ${command}`);
    logs.push('✅ Command completed');
  }

  return logs;
};

// ─── Execute Pipeline ──────────────────────────────────────────
export const executePipeline = async (config, onJobStart, onJobComplete, onStepStart, onStepComplete, onLog) => {
  const { jobs, platform } = config;

  if (!jobs || (jobs || []).length === 0) {
    return { status: 'failure', jobs: [] };
  }

  const { graph, inDegree } = createExecutionGraph(jobs);
  const queue = [];
  const completed = new Set();
  const running = new Set();
  let pipelineFailed = false;
  let failedStep = null;
  let failedJob = null;

  jobs.forEach(job => {
    if ((inDegree.get(job.id) || 0) === 0) {
      queue.push(job);
    }
  });

  const executeJob = async (job) => {
    running.add(job.id);
    onJobStart(job);
    job.status = JOB_STATUS.RUNNING;

    try {
      for (const step of job.steps) {
        if (pipelineFailed) {
          step.status = 'skipped';
          onStepComplete(job, step);
          continue;
        }

        onStepStart(job, step);
        step.status = STEP_STATUS.RUNNING;

        // STEP 5: Simulate the command
        const simResult = step.command ? simulateCommand(step.command) : { result: 'success', reason: 'Uses action' };

        // Generate realistic logs
        const stepLogs = generateStepLogs(step.name, step.command, step.uses, platform);

        // Emit logs in real-time
        for (const logMessage of stepLogs) {
          await new Promise(resolve => setTimeout(resolve, 300));
          const level = logMessage.includes('❌') ? 'ERROR'
            : logMessage.includes('⚠️') ? 'WARNING'
            : logMessage.includes('✅') ? 'SUCCESS'
            : 'INFO';
          onLog({
            timestamp: new Date().toISOString(),
            level,
            message: logMessage,
            job: job.name,
            step: step.name
          });
        }

        // STEP 6: Check result — DANGEROUS or FAILED = halt
        if (simResult.result === 'dangerous' || simResult.result === 'failed') {
          step.status = STEP_STATUS.FAILURE;
          onStepComplete(job, step);

          job.status = JOB_STATUS.FAILURE;
          onJobComplete(job);

          pipelineFailed = true;
          failedStep = step.name;
          failedJob = job.name;

          onLog({
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            message: `Pipeline execution halted: ${simResult.reason}`,
            job: job.name,
            step: step.name
          });
          return;
        }

        step.status = STEP_STATUS.SUCCESS;
        onStepComplete(job, step);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      job.status = JOB_STATUS.SUCCESS;
      onJobComplete(job);

      const dependents = graph.get(job.id) || [];
      dependents.forEach(depId => {
        const currentDegree = inDegree.get(depId) || 0;
        inDegree.set(depId, currentDegree - 1);
        if (inDegree.get(depId) === 0) {
          const dependentJob = jobs.find(j => j.id === depId);
          if (dependentJob) queue.push(dependentJob);
        }
      });

    } catch (error) {
      step.status = STEP_STATUS.FAILURE;
      job.status = JOB_STATUS.FAILURE;
      onJobComplete(job);
      pipelineFailed = true;
      failedStep = step?.name;
      failedJob = job.name;
    } finally {
      running.delete(job.id);
      completed.add(job.id);
    }
  };

  const promises = [];
  while ((queue || []).length > 0 || running.size > 0) {
    if (pipelineFailed) break;
    const availableJobs = queue.splice(0, Math.min((queue || []).length, 3));
    const jobPromises = availableJobs.map(job => executeJob(job));
    promises.push(...jobPromises);
    if (jobPromises.length > 0) await Promise.race(jobPromises);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  await Promise.all(promises);

  if (pipelineFailed) {
    jobs.forEach(job => {
      if (job.status === JOB_STATUS.PENDING) job.status = JOB_STATUS.SKIPPED;
    });
  }

  const allSteps = jobs.flatMap(j => j.steps);
  const status = pipelineFailed ? 'failed' : (jobs.every(j => j.status === JOB_STATUS.SUCCESS) ? 'success' : 'failed');

  return {
    status,
    jobs,
    steps: allSteps,
    logs: allSteps.flatMap(s => s.logs || []),
    failedStep,
    failedJob
  };
};

// ─── Create Execution Graph ────────────────────────────────────
export const createExecutionGraph = (jobs) => {
  const graph = new Map();
  const inDegree = new Map();

  jobs.forEach(job => {
    graph.set(job.id, []);
    inDegree.set(job.id, 0);
  });

  jobs.forEach(job => {
    (job.dependsOn || []).forEach(dep => {
      if (graph.has(dep)) {
        graph.get(dep).push(job.id);
        inDegree.set(job.id, (inDegree.get(job.id) || 0) + 1);
      }
    });
  });

  return { graph, inDegree };
};

// ─── Validate Pipeline (STRICT) ────────────────────────────────
export const validatePipeline = (code, platform = 'github') => {
  const warnings = [];
  const errors = [];

  if (!code || code.trim() === '') {
    errors.push('Pipeline code cannot be empty');
    return { isValid: false, warnings, errors };
  }

  const detectedPlatform = platform || detectPlatform(code);
  if (!detectedPlatform) {
    errors.push('Cannot detect pipeline type. Your code does not match GitHub Actions, AWS CodePipeline, or Jenkins syntax.');
    return { isValid: false, warnings, errors };
  }

  try {
    // STEP 1: Parse YAML (for github/aws)
    if (detectedPlatform === 'github') {
      const parsed = parseYAML(code);
      // STEP 2: Structure validation
      validateGitHubStructure(parsed);

      // STEP 5: Validate commands in steps
      for (const [jobId, jobData] of Object.entries(parsed.jobs)) {
        if (jobData && Array.isArray(jobData.steps)) {
          jobData.steps.forEach((step, index) => {
            if (step && step.run) {
              const simResult = simulateCommand(step.run);
              if (simResult.result === 'dangerous') {
                errors.push(`Job "${jobId}" step ${index + 1} "${step.name || step.run}": ${simResult.reason}`);
              } else if (simResult.result === 'failed') {
                // External commands like docker login/push and aws commands are now mocked in simulateCommand,
                // so they will return 'success' with a mock flag and NOT fail validation here.
                errors.push(`Job "${jobId}" step ${index + 1} "${step.name || step.run}": ${simResult.reason}`);
              } else if (simResult.result === 'warning') {
                warnings.push(`Job "${jobId}" step ${index + 1} "${step.name || step.run}": ${simResult.reason}`);
              }
            }
          });
        }
      }
    } else if (detectedPlatform === 'aws') {
      const parsed = parseYAML(code);
      
      // Handle CodeBuild format (phases/commands)
      if (parsed.phases) {
        const phases = parsed.phases;
        for (const [phaseName, phaseData] of Object.entries(phases)) {
          if (!phaseData.commands || !Array.isArray(phaseData.commands) || phaseData.commands.length === 0) {
            if (!phaseData['runtime-versions']) {
              errors.push(`AWS Phase "${phaseName}" has no commands or runtime versions`);
            }
          } else {
            phaseData.commands.forEach((cmd, j) => {
              const simResult = simulateCommand(cmd);
              if (simResult.result === 'dangerous') {
                errors.push(`AWS Phase "${phaseName}" command "${cmd}": ${simResult.reason}`);
              } else if (simResult.result === 'failed') {
                errors.push(`AWS Phase "${phaseName}" command "${cmd}": ${simResult.reason}`);
              } else if (simResult.result === 'warning') {
                warnings.push(`AWS Phase "${phaseName}" command "${cmd}": ${simResult.reason}`);
              }
            });
          }
        }
      }
      // Handle CodePipeline format (Stages/Actions)
      else if (parsed.Stages || parsed.stages) {
        const stages = parsed.Stages || parsed.stages;
        if (!Array.isArray(stages) || stages.length === 0) {
          errors.push("'Stages' must be a non-empty array");
        } else {
          for (let i = 0; i < stages.length; i++) {
            const stage = stages[i];
            const stageName = stage.Name || stage.name || `Stage ${i + 1}`;
            if (!stage.Actions && !stage.actions) {
              errors.push(`Stage "${stageName}" missing 'Actions'`);
            } else {
              const actions = stage.Actions || stage.actions;
              if (!Array.isArray(actions) || actions.length === 0) {
                errors.push(`Stage "${stageName}" has empty 'Actions' array`);
              }
              actions.forEach((action, j) => {
                const cmd = action.Configuration?.Command || action.configuration?.command || '';
                if (cmd) {
                  const simResult = simulateCommand(cmd);
                  if (simResult.result === 'dangerous') {
                    errors.push(`Stage "${stageName}" action "${action.Name || action.name || j + 1}": ${simResult.reason}`);
                  } else if (simResult.result === 'failed') {
                    errors.push(`Stage "${stageName}" action "${action.Name || action.name || j + 1}": ${simResult.reason}`);
                  } else if (simResult.result === 'warning') {
                    warnings.push(`Stage "${stageName}" action "${action.Name || action.name || j + 1}": ${simResult.reason}`);
                  }
                }
              });
            }
          }
        }
      } else {
        errors.push("AWS pipeline must have either 'phases' (CodeBuild) or 'Stages' (CodePipeline)");
      }
    } else if (detectedPlatform === 'jenkins') {
      if (!code.includes('pipeline') && !code.includes('stage')) {
        errors.push("Not a valid Jenkinsfile — must contain 'pipeline' or 'stage' blocks");
      } else {
        // Validate each stage has steps and commands are valid
        const stageRegex = /stage\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
        let stageMatch;
        while ((stageMatch = stageRegex.exec(code)) !== null) {
          const stageName = stageMatch[1];
          const afterStage = code.substring(stageMatch.index + stageMatch[0].length);
          const stepsMatch = afterStage.match(/steps\s*\{([\s\S]*?)\n\s*\}/);
          if (!stepsMatch) {
            errors.push(`Stage "${stageName}" has no steps block — every stage needs steps { }`);
          } else {
            const stepsBlock = stepsMatch[1];
            const shCommands = [];
            
            // Parse sh commands
            const shRegex = /sh\s*['"]([^'"]+)['"]/g;
            let shMatch;
            while ((shMatch = shRegex.exec(stepsBlock)) !== null) {
              shCommands.push(shMatch[1]);
            }
            
            // Parse sh commands with ${} variables
            const shVarRegex = /sh\s*"([^"]*\$\{[^}]+\}[^"]*)"/g;
            let shVarMatch;
            while ((shVarMatch = shVarRegex.exec(stepsBlock)) !== null) {
              shCommands.push(shVarMatch[1]);
            }
            
            // Parse bat commands
            const batRegex = /bat\s*['"]([^'"]+)['"]/g;
            let batMatch;
            while ((batMatch = batRegex.exec(stepsBlock)) !== null) {
              shCommands.push(batMatch[1]);
            }
            
            // Parse git url commands
            const gitRegex = /git\s+url:\s*['"]([^'"]+)['"]/g;
            let gitMatch;
            while ((gitMatch = gitRegex.exec(stepsBlock)) !== null) {
              shCommands.push(`git clone ${gitMatch[1]}`);
            }
            
            // Check for checkout
            if (stepsBlock.includes('checkout') && !stepsBlock.includes('git url:')) {
              shCommands.push('checkout scm');
            }
            
            if (shCommands.length === 0) {
              errors.push(`Stage "${stageName}" has no executable commands — needs sh/bat/echo/checkout/git`);
            }
            
            shCommands.forEach(cmd => {
              const simResult = simulateCommand(cmd);
              if (simResult.result === 'dangerous') {
                errors.push(`Stage "${stageName}" command "${cmd}": ${simResult.reason}`);
              } else if (simResult.result === 'failed') {
                errors.push(`Stage "${stageName}" command "${cmd}": ${simResult.reason}`);
              } else if (simResult.result === 'warning') {
                warnings.push(`Stage "${stageName}" command "${cmd}": ${simResult.reason}`);
              }
            });
          }
        }
      }
    }

    // Try full parse
    const config = parsePipelineConfig(code, detectedPlatform);
    if (config.error) {
      errors.push(config.error);
    }
  } catch (e) {
    errors.push(e.message);
  }

  return { isValid: errors.length === 0, warnings, errors };
};

// ─── Get Pipeline Summary ──────────────────────────────────────
export const getPipelineSummary = (jobs) => {
  const totalJobs = (jobs || []).length;
  const completedJobs = (jobs || []).filter(j => j.status === JOB_STATUS.SUCCESS).length;
  const failedJobs = (jobs || []).filter(j => j.status === JOB_STATUS.FAILURE).length;
  const runningJobs = (jobs || []).filter(j => j.status === JOB_STATUS.RUNNING).length;
  const pendingJobs = (jobs || []).filter(j => j.status === JOB_STATUS.PENDING).length;

  const totalSteps = (jobs || []).reduce((s, j) => s + (j.steps?.length || 0), 0);
  const completedSteps = (jobs || []).reduce((s, j) => s + (j.steps?.filter(st => st.status === STEP_STATUS.SUCCESS).length || 0), 0);

  return {
    totalJobs, completedJobs, failedJobs, runningJobs, pendingJobs,
    totalSteps, completedSteps,
    progress: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
    status: failedJobs > 0 ? 'failed' : completedJobs === totalJobs && totalJobs > 0 ? 'success' : 'running'
  };
};
