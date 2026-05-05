const simulatePipeline = async (pipelineCode) => {
  // Detect platform and create appropriate steps
  const platform = detectPlatform(pipelineCode);
  const steps = createPlatformSteps(platform, pipelineCode);

  const logs = [];
  let finalStatus = 'success';
  let currentStep = 0;

  // Add initial log
  logs.push({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message: `🚀 Starting ${platform} pipeline simulation...`,
    step: 'Initialization',
    platform: platform
  });

  // Validate pipeline structure
  const validation = validatePipelineStructure(pipelineCode, platform);
  if (!validation.isValid) {
    logs.push({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message: '❌ Pipeline validation failed',
      step: 'Validation',
      details: validation.error
    });
    finalStatus = 'failed';
  }

  // Simulate each step
  for (const step of steps) {
    if (finalStatus === 'failed') break;
    
    currentStep++;
    
    // Add step start log
    logs.push({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: `▶️  Starting: ${step.name}...`,
      step: step.name,
      details: step.description || ''
    });

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, step.duration));

    // Calculate failure probability based on step and platform
    const failureChance = calculateFailureChance(step, platform);
    const shouldFail = Math.random() < failureChance;
    
    if (shouldFail) {
      finalStatus = 'failed';
      logs.push({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message: `❌ Failed: ${step.name} - ${step.failureReason || 'Simulation error occurred'}`,
        step: step.name,
        details: step.failureDetails || 'This simulates a real deployment failure'
      });
      
      logs.push({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message: '🛑 Pipeline execution failed',
        step: 'Pipeline Failed',
        details: `Failed at step: ${step.name}`
      });
      
      break;
    } else {
      // Add step success log
      logs.push({
        timestamp: new Date().toISOString(),
        level: 'SUCCESS',
        message: `✅ Completed: ${step.name}`,
        step: step.name,
        details: `Duration: ${step.duration}ms`
      });
    }
  }

  // Add final logs
  if (finalStatus === 'success') {
    logs.push({
      timestamp: new Date().toISOString(),
      level: 'SUCCESS',
      message: '🎉 All steps completed successfully!',
      step: 'Pipeline Complete',
      details: `${platform} deployment completed`
    });

    logs.push({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: '📊 Pipeline execution summary:',
      step: 'Summary'
    });

    logs.push({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: `   • Platform: ${platform}`,
      step: 'Summary'
    });

    logs.push({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: `   • Total steps: ${currentStep}`,
      step: 'Summary'
    });

    logs.push({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: `   • Execution time: ${steps.reduce((acc, step) => acc + step.duration, 0)}ms`,
      step: 'Summary'
    });
  }

  return {
    logs,
    status: finalStatus,
    duration: steps.reduce((acc, step) => acc + step.duration, 0),
    stepsCompleted: currentStep,
    totalSteps: steps.length,
    platform: platform,
    steps: steps.map((step, index) => ({
      ...step,
      status: index < currentStep ? 'success' : (finalStatus === 'failed' && index === currentStep - 1 ? 'failed' : 'pending')
    }))
  };
};

const detectPlatform = (code) => {
  if (code.includes('aws ec2') || code.includes('create-vpc') || code.includes('CloudFormation')) {
    return 'aws-infrastructure';
  }
  if (code.includes('docker') || code.includes('container') || code.includes('docker-compose')) {
    return 'docker-infrastructure';
  }
  if (code.includes('on:') && code.includes('uses:')) {
    return 'github-actions';
  }
  return 'generic-cicd';
};

const createPlatformSteps = (platform, code) => {
  switch (platform) {
    case 'aws-infrastructure':
      return [
        { 
          name: 'Initialize VPC', 
          duration: 3000, 
          description: 'Creating Virtual Private Cloud',
          failureReason: 'VPC creation failed',
          failureDetails: 'Insufficient permissions or invalid CIDR block'
        },
        { 
          name: 'Configure Networking', 
          duration: 2500, 
          description: 'Setting up subnets and routing',
          failureReason: 'Network configuration failed',
          failureDetails: 'Subnet overlap or routing table issues'
        },
        { 
          name: 'Setup Security Groups', 
          duration: 2000, 
          description: 'Configuring firewall rules',
          failureReason: 'Security group creation failed',
          failureDetails: 'Invalid security group rules'
        },
        { 
          name: 'Configure IAM Roles', 
          duration: 3500, 
          description: 'Setting up access permissions',
          failureReason: 'IAM role creation failed',
          failureDetails: 'Insufficient IAM permissions'
        },
        { 
          name: 'Launch EC2 Instance', 
          duration: 6000, 
          description: 'Provisioning cloud server',
          failureReason: 'EC2 launch failed',
          failureDetails: 'Instance type unavailable or quota exceeded'
        },
        { 
          name: 'Deploy Application', 
          duration: 4000, 
          description: 'Deploying application to server',
          failureReason: 'Application deployment failed',
          failureDetails: 'Connection timeout or deployment script error'
        }
      ];
    
    case 'docker-infrastructure':
      return [
        { 
          name: 'Build Docker Image', 
          duration: 8000, 
          description: 'Building container image',
          failureReason: 'Docker build failed',
          failureDetails: 'Dockerfile syntax error or build context issues'
        },
        { 
          name: 'Push to Registry', 
          duration: 4000, 
          description: 'Uploading image to container registry',
          failureReason: 'Push failed',
          failureDetails: 'Registry authentication failed or network error'
        },
        { 
          name: 'Pull Image', 
          duration: 2000, 
          description: 'Downloading image on target server',
          failureReason: 'Pull failed',
          failureDetails: 'Image not found or access denied'
        },
        { 
          name: 'Run Container', 
          duration: 3000, 
          description: 'Starting container instance',
          failureReason: 'Container start failed',
          failureDetails: 'Port conflict or resource constraints'
        },
        { 
          name: 'Scale Services', 
          duration: 5000, 
          description: 'Scaling to multiple instances',
          failureReason: 'Scaling failed',
          failureDetails: 'Load balancer configuration error'
        }
      ];
    
    case 'github-actions':
      return [
        { 
          name: 'Source Checkout', 
          duration: 2000, 
          description: 'Checking out source code',
          failureReason: 'Checkout failed',
          failureDetails: 'Repository access denied or branch not found'
        },
        { 
          name: 'Setup Environment', 
          duration: 3000, 
          description: 'Setting up build environment',
          failureReason: 'Environment setup failed',
          failureDetails: 'Missing dependencies or configuration error'
        },
        { 
          name: 'Install Dependencies', 
          duration: 8000, 
          description: 'Installing project dependencies',
          failureReason: 'Installation failed',
          failureDetails: 'Package installation errors or network issues'
        },
        { 
          name: 'Run Tests', 
          duration: 6000, 
          description: 'Executing test suite',
          failureReason: 'Tests failed',
          failureDetails: 'Test assertions failed or timeout'
        },
        { 
          name: 'Build Application', 
          duration: 10000, 
          description: 'Building application artifacts',
          failureReason: 'Build failed',
          failureDetails: 'Compilation errors or build script issues'
        },
        { 
          name: 'Deploy Application', 
          duration: 5000, 
          description: 'Deploying to target environment',
          failureReason: 'Deployment failed',
          failureDetails: 'Target environment unavailable or configuration error'
        }
      ];
    
    default:
      return [
        { name: 'Source Checkout', duration: 2000, description: 'Checking out source code' },
        { name: 'Install Dependencies', duration: 5000, description: 'Installing dependencies' },
        { name: 'Run Tests', duration: 3000, description: 'Running tests' },
        { name: 'Build Application', duration: 4000, description: 'Building application' },
        { name: 'Deploy Application', duration: 6000, description: 'Deploying application' }
      ];
  }
};

const validatePipelineStructure = (code, platform) => {
  // Basic validation checks
  if (!code || code.trim().length === 0) {
    return { isValid: false, error: 'Pipeline code is empty' };
  }

  // Platform-specific validation
  switch (platform) {
    case 'aws-infrastructure':
      if (!code.includes('aws') && !code.includes('VPC')) {
        return { isValid: false, error: 'AWS infrastructure commands not found' };
      }
      break;
    
    case 'docker-infrastructure':
      if (!code.includes('docker')) {
        return { isValid: false, error: 'Docker commands not found' };
      }
      break;
    
    case 'github-actions':
      if (!code.includes('on:') || !code.includes('jobs:')) {
        return { isValid: false, error: 'GitHub Actions structure not found' };
      }
      break;
  }

  return { isValid: true };
};

const calculateFailureChance = (step, platform) => {
  // Base failure rates by platform
  const baseRates = {
    'aws-infrastructure': 0.15,
    'docker-infrastructure': 0.12,
    'github-actions': 0.10,
    'generic-cicd': 0.08
  };

  let baseRate = baseRates[platform] || 0.10;

  // Adjust based on step complexity and criticality
  if (step.name.includes('Deploy') || step.name.includes('Launch')) {
    baseRate += 0.10; // Higher risk for deployment steps
  }
  
  if (step.name.includes('Build') || step.name.includes('Test')) {
    baseRate += 0.05; // Medium risk for build/test steps
  }

  return Math.min(baseRate, 0.35); // Cap at 35% max failure rate
};

const quickSimulate = (pipelineCode) => {
  const lines = pipelineCode.split('\n').length;
  const platform = detectPlatform(pipelineCode);
  const estimatedDuration = lines * 50; // 50ms per line
  
  return {
    logs: [
      {
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: '🚀 Quick simulation completed',
        step: 'Quick Sim',
        platform: platform
      },
      {
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: `📊 Platform detected: ${platform}`,
        step: 'Analysis'
      },
      {
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: `📊 Pipeline has ${lines} lines`,
        step: 'Analysis'
      },
      {
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: `⏱️  Estimated execution time: ${estimatedDuration}ms`,
        step: 'Analysis'
      }
    ],
    status: 'success',
    duration: estimatedDuration,
    stepsCompleted: 5,
    totalSteps: 5,
    platform: platform,
    steps: []
  };
};

module.exports = {
  simulatePipeline,
  quickSimulate,
  detectPlatform,
  createPlatformSteps
};
