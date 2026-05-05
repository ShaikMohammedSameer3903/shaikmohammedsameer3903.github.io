const { execSync } = require('child_process');

class AdvancedSimulatorService {
  constructor() {
    this.stepMappings = {
      // GitHub Actions mappings
      'github-actions': {
        'checkout': { name: 'Source Checkout', command: 'actions/checkout@v4', delay: 2000 },
        'setup-node': { name: 'Node.js Setup', command: 'actions/setup-node@v4', delay: 3000 },
        'npm-install': { name: 'Install Dependencies', command: 'npm ci', delay: 8000 },
        'npm-build': { name: 'Build Application', command: 'npm run build', delay: 12000 },
        'npm-test': { name: 'Run Tests', command: 'npm test', delay: 6000 },
        'docker-build': { name: 'Build Docker Image', command: 'docker build', delay: 15000 },
        'docker-push': { name: 'Push to Registry', command: 'docker push', delay: 8000 },
        'deploy': { name: 'Deploy Application', command: 'deploy script', delay: 5000 }
      },
      // AWS CodePipeline mappings
      'aws-codepipeline': {
        'source': { name: 'Source Stage', command: 'CodeCommit', delay: 2000 },
        'build': { name: 'Build Stage', command: 'CodeBuild', delay: 15000 },
        'test': { name: 'Test Stage', command: 'CodeBuild', delay: 8000 },
        'approve': { name: 'Manual Approval', command: 'Manual', delay: 1000 },
        'deploy': { name: 'Deploy Stage', command: 'CloudFormation', delay: 20000 }
      },
      // Jenkins mappings
      'jenkins': {
        'scm': { name: 'SCM Checkout', command: 'git checkout', delay: 3000 },
        'build': { name: 'Build', command: 'mvn clean install', delay: 25000 },
        'test': { name: 'Test', command: 'mvn test', delay: 12000 },
        'package': { name: 'Package', command: 'mvn package', delay: 8000 },
        'deploy': { name: 'Deploy', command: 'scp deploy', delay: 6000 }
      },
      // Cloud infrastructure mappings
      'aws-infrastructure': {
        'vpc': { name: 'Initialize VPC', command: 'aws ec2 create-vpc', delay: 5000 },
        'subnet': { name: 'Configure Subnets', command: 'aws ec2 create-subnet', delay: 3000 },
        'security-group': { name: 'Setup Security Groups', command: 'aws ec2 create-security-group', delay: 2000 },
        'iam-role': { name: 'Configure IAM Role', command: 'aws iam create-role', delay: 4000 },
        'ec2-launch': { name: 'Launch EC2 Instance', command: 'aws ec2 run-instances', delay: 8000 },
        'app-deploy': { name: 'Deploy Application', command: 'ssh deploy', delay: 5000 }
      },
      'docker-infrastructure': {
        'build': { name: 'Build Docker Image', command: 'docker build', delay: 15000 },
        'push': { name: 'Push to Registry', command: 'docker push', delay: 8000 },
        'pull': { name: 'Pull Image', command: 'docker pull', delay: 3000 },
        'run': { name: 'Run Container', command: 'docker run', delay: 2000 },
        'scale': { name: 'Scale Services', command: 'docker-compose up', delay: 5000 }
      }
    };
  }

  parsePipelineCode(code) {
    const steps = [];
    const lines = code.split('\n');
    let currentJob = null;
    let detectedPlatform = this.detectPlatform(code);

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Detect platform-specific patterns
      if (trimmedLine.startsWith('name:') && !currentJob) {
        currentJob = trimmedLine.split(':')[1]?.trim() || 'main';
      }
      
      if (trimmedLine.startsWith('on:')) {
        // GitHub Actions trigger
        steps.push({
          id: `trigger-${index}`,
          name: 'Pipeline Trigger',
          type: 'trigger',
          platform: detectedPlatform,
          command: 'push/trigger',
          delay: 1000
        });
      }
      
      if (trimmedLine.startsWith('uses:')) {
        const action = trimmedLine.split(':')[1]?.trim();
        const stepConfig = this.mapActionToStep(action, detectedPlatform);
        if (stepConfig) {
          steps.push({
            id: `step-${index}`,
            ...stepConfig,
            platform: detectedPlatform,
            lineNumber: index + 1
          });
        }
      }
      
      if (trimmedLine.startsWith('run:')) {
        const command = trimmedLine.substring(4).replace(/['"]/g, '');
        const stepConfig = this.mapCommandToStep(command, detectedPlatform);
        if (stepConfig) {
          steps.push({
            id: `step-${index}`,
            ...stepConfig,
            platform: detectedPlatform,
            command,
            lineNumber: index + 1
          });
        }
      }
      
      // AWS CodePipeline stages
      if (trimmedLine.startsWith('- Name:') && detectedPlatform === 'aws-codepipeline') {
        const stageName = trimmedLine.split(':')[1]?.trim();
        const stepConfig = this.stepMappings['aws-codepipeline'][stageName.toLowerCase()];
        if (stepConfig) {
          steps.push({
            id: `stage-${index}`,
            ...stepConfig,
            platform: detectedPlatform,
            lineNumber: index + 1
          });
        }
      }
    });

    // Add infrastructure steps if AWS deployment detected
    if (detectedPlatform === 'aws-infrastructure') {
      const infraSteps = [
        'vpc', 'subnet', 'security-group', 'iam-role', 'ec2-launch', 'app-deploy'
      ];
      infraSteps.forEach((step, index) => {
        const config = this.stepMappings['aws-infrastructure'][step];
        steps.push({
          id: `infra-${index}`,
          ...config,
          platform: detectedPlatform
        });
      });
    }

    return steps;
  }

  detectPlatform(code) {
    if (code.includes('on:') && code.includes('uses:')) {
      return 'github-actions';
    }
    if (code.includes('Name:') && code.includes('ActionsMode:')) {
      return 'aws-codepipeline';
    }
    if (code.includes('pipeline') || code.includes('stage')) {
      return 'jenkins';
    }
    if (code.includes('aws ec2') || code.includes('create-vpc')) {
      return 'aws-infrastructure';
    }
    if (code.includes('docker') || code.includes('container')) {
      return 'docker-infrastructure';
    }
    return 'github-actions'; // default
  }

  mapActionToStep(action, platform) {
    const mapping = this.stepMappings[platform];
    if (!mapping) return null;

    // GitHub Actions specific mappings
    if (action.includes('checkout')) return mapping['checkout'];
    if (action.includes('setup-node')) return mapping['setup-node'];
    if (action.includes('setup-python')) return mapping['setup-node']; // reuse
    if (action.includes('setup-java')) return mapping['setup-node']; // reuse

    return null;
  }

  mapCommandToStep(command, platform) {
    const mapping = this.stepMappings[platform];
    if (!mapping) return null;

    const cmd = command.toLowerCase();
    
    // Generic command mappings
    if (cmd.includes('npm install') || cmd.includes('npm ci')) return mapping['npm-install'];
    if (cmd.includes('npm run build') || cmd.includes('npm build')) return mapping['npm-build'];
    if (cmd.includes('npm test') || cmd.includes('npm run test')) return mapping['npm-test'];
    if (cmd.includes('docker build')) return mapping['docker-build'];
    if (cmd.includes('docker push')) return mapping['docker-push'];
    if (cmd.includes('docker run')) return mapping['run'];
    if (cmd.includes('mvn clean install') || cmd.includes('mvn install')) return mapping['build'];
    if (cmd.includes('mvn test')) return mapping['test'];
    if (cmd.includes('mvn package')) return mapping['package'];
    if (cmd.includes('git checkout') || cmd.includes('git clone')) return mapping['scm'];
    if (cmd.includes('deploy')) return mapping['deploy'];

    return null;
  }

  generateLogs(step, status, error = null) {
    const timestamp = new Date().toISOString();
    const logs = [];

    logs.push({
      timestamp,
      level: 'INFO',
      message: `Starting step: ${step.name}`,
      details: `Command: ${step.command}`
    });

    if (status === 'running') {
      logs.push({
        timestamp,
        level: 'INFO',
        message: `Executing ${step.command}...`,
        details: `Platform: ${step.platform}`
      });
    }

    if (status === 'success') {
      logs.push({
        timestamp,
        level: 'SUCCESS',
        message: `✅ ${step.name} completed successfully`,
        details: `Duration: ${step.delay}ms`
      });
    }

    if (status === 'failed') {
      logs.push({
        timestamp,
        level: 'ERROR',
        message: `❌ ${step.name} failed`,
        details: error || 'Unknown error occurred'
      });
    }

    return logs;
  }

  calculateSuccessRate(steps) {
    // Base success rate: 85-90%
    const baseRate = 0.85 + Math.random() * 0.05;
    
    // Adjust based on step complexity
    const complexityPenalty = steps.length * 0.02;
    
    // Check for critical steps
    const hasCriticalSteps = steps.some(step => 
      step.name.includes('Deploy') || 
      step.name.includes('Build') ||
      step.name.includes('Test')
    );
    
    const criticalPenalty = hasCriticalSteps ? 0.05 : 0;
    
    return Math.max(0.5, Math.min(0.95, baseRate - complexityPenalty - criticalPenalty));
  }

  async simulatePipeline(code, onProgress = null) {
    try {
      // Parse pipeline code
      const steps = this.parsePipelineCode(code);
      
      if (steps.length === 0) {
        return {
          success: false,
          error: 'No valid steps detected in pipeline code',
          steps: [],
          logs: [{
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            message: 'Pipeline parsing failed',
            details: 'Unable to detect any executable steps'
          }],
          status: 'failed'
        };
      }

      // Calculate success probability
      const successRate = this.calculateSuccessRate(steps);
      const willSucceed = Math.random() < successRate;

      const executedSteps = [];
      const allLogs = [];
      let currentStatus = 'running';

      // Execute steps sequentially
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        // Update progress
        if (onProgress) {
          onProgress({
            step: step.name,
            progress: (i / steps.length) * 100,
            status: 'running'
          });
        }

        // Generate running logs
        const runningLogs = this.generateLogs(step, 'running');
        allLogs.push(...runningLogs);

        // Add delay to simulate real execution time
        await new Promise(resolve => setTimeout(resolve, step.delay));

        // Determine step outcome
        let stepStatus = 'success';
        let stepError = null;

        if (!willSucceed && i === steps.length - 1) {
          // Fail at the last step for dramatic effect
          stepStatus = 'failed';
          stepError = 'Execution timeout or resource constraint';
          currentStatus = 'failed';
        } else if (Math.random() < 0.1) {
          // 10% chance of random failure
          stepStatus = 'failed';
          stepError = 'Unexpected error during execution';
          currentStatus = 'failed';
        }

        // Generate completion logs
        const completionLogs = this.generateLogs(step, stepStatus, stepError);
        allLogs.push(...completionLogs);

        executedSteps.push({
          ...step,
          status: stepStatus,
          duration: step.delay,
          logs: completionLogs
        });

        // Stop execution on failure
        if (stepStatus === 'failed') {
          break;
        }
      }

      // Final status
      if (currentStatus === 'running') {
        currentStatus = willSucceed ? 'success' : 'failed';
      }

      // Generate summary logs
      allLogs.push({
        timestamp: new Date().toISOString(),
        level: currentStatus === 'success' ? 'SUCCESS' : 'ERROR',
        message: currentStatus === 'success' 
          ? '🎉 Pipeline execution completed successfully!' 
          : '💥 Pipeline execution failed',
        details: `Steps executed: ${executedSteps.length}/${steps.length}`
      });

      return {
        success: currentStatus === 'success',
        steps: executedSteps,
        logs: allLogs,
        status: currentStatus,
        metadata: {
          totalSteps: steps.length,
          executedSteps: executedSteps.length,
          duration: steps.reduce((sum, step) => sum + step.delay, 0),
          successRate: successRate,
          platform: this.detectPlatform(code)
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        steps: [],
        logs: [{
          timestamp: new Date().toISOString(),
          level: 'ERROR',
          message: 'Simulation engine error',
          details: error.message
        }],
        status: 'failed'
      };
    }
  }

  // Method to get step-by-step execution plan
  getExecutionPlan(code) {
    const steps = this.parsePipelineCode(code);
    return {
      steps: steps.map(step => ({
        id: step.id,
        name: step.name,
        type: step.type || 'command',
        command: step.command,
        platform: step.platform,
        estimatedDuration: step.delay,
        dependencies: this.getStepDependencies(step, steps)
      })),
      totalEstimatedDuration: steps.reduce((sum, step) => sum + step.delay, 0),
      platform: this.detectPlatform(code)
    };
  }

  getStepDependencies(step, allSteps) {
    // Simple dependency logic
    const deps = [];
    const currentIndex = allSteps.indexOf(step);
    
    // Previous steps are dependencies
    for (let i = 0; i < currentIndex; i++) {
      deps.push(allSteps[i].id);
    }
    
    return deps;
  }
}

module.exports = new AdvancedSimulatorService();
