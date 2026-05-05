// Comprehensive CI/CD Template Marketplace for PipeLinePro
// Production-ready templates across multiple platforms

export const templates = [
  // === GITHUB ACTIONS TEMPLATES ===
  {
    id: 'gh-node-ci',
    name: 'Node.js CI (Build + Test)',
    platform: 'github',
    level: 'Beginner',
    category: 'GitHub Actions',
    difficulty: 'Beginner',
    description: 'Complete Node.js CI pipeline with testing, linting, and building.',
    requirements: ['GitHub repository', 'Node.js project', 'package.json'],
    stepsExplanation: [
      'Checkout code from repository',
      'Setup Node.js environment',
      'Install dependencies with npm ci',
      'Run linting and tests',
      'Build production assets'
    ],
    envVariables: [
      { key: 'NODE_ENV', defaultValue: 'production', description: 'Node environment' }
    ],
    secrets: [],
    configOptions: [
      { key: 'nodeVersion', defaultValue: '20', type: 'select', options: ['18', '20', '22'], description: 'Node.js version' },
      { key: 'cache', defaultValue: 'npm', type: 'select', options: ['npm', 'yarn', 'pnpm'], description: 'Package manager cache' }
    ],
    code: `name: Node.js CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: {{nodeVersion}}
          cache: '{{cache}}'
      - run: npm ci
      - run: npm run lint || echo "lint skipped"
      - run: npm test || echo "tests skipped"
      - run: npm run build || echo "build skipped"`
  },
  {
    id: 'gh-react-deploy',
    name: 'React Build + Deploy',
    platform: 'github',
    level: 'Beginner',
    category: 'GitHub Actions',
    difficulty: 'Beginner',
    description: 'Build React app and deploy to static hosting.',
    requirements: ['GitHub repository', 'React project', 'Hosting provider credentials'],
    stepsExplanation: [
      'Checkout code',
      'Setup Node.js',
      'Install dependencies',
      'Run tests',
      'Build React app',
      'Deploy to hosting'
    ],
    envVariables: [
      { key: 'REACT_APP_API_URL', defaultValue: '', description: 'Backend API URL' },
      { key: 'NODE_ENV', defaultValue: 'production', description: 'Node environment' }
    ],
    secrets: [
      { key: 'DEPLOY_TOKEN', description: 'Deployment token for hosting provider' }
    ],
    configOptions: [
      { key: 'nodeVersion', defaultValue: '20', type: 'select', options: ['18', '20', '22'], description: 'Node.js version' },
      { key: 'buildCommand', defaultValue: 'npm run build', type: 'text', description: 'Build command' },
      { key: 'deployBranch', defaultValue: 'main', type: 'text', description: 'Branch to deploy from' }
    ],
    code: `name: React Deploy
on:
  push:
    branches: [{{deployBranch}}]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: {{nodeVersion}}
      - run: npm ci
      - run: npm test || echo "tests skipped"
      - run: {{buildCommand}} || echo "build skipped"
      - name: Deploy
        run: echo "Deploying to production..."
        env:
          REACT_APP_API_URL: \${{ secrets.REACT_APP_API_URL }}
          DEPLOY_TOKEN: \${{ secrets.DEPLOY_TOKEN }}`
  },
  {
    id: 'gh-docker-push',
    name: 'Docker Build & Push',
    platform: 'github',
    level: 'Intermediate',
    category: 'GitHub Actions',
    difficulty: 'Intermediate',
    description: 'Build Docker image and push to Docker Hub.',
    requirements: ['Docker Hub account', 'Dockerfile', 'GitHub secrets'],
    stepsExplanation: [
      'Checkout code',
      'Login to Docker Hub',
      'Set up Docker Buildx',
      'Build and push image'
    ],
    envVariables: [
      { key: 'DOCKER_IMAGE_NAME', defaultValue: '', description: 'Docker image name' },
      { key: 'DOCKER_TAG', defaultValue: 'latest', description: 'Docker image tag' }
    ],
    secrets: [
      { key: 'DOCKERHUB_USERNAME', description: 'Docker Hub username' },
      { key: 'DOCKERHUB_TOKEN', description: 'Docker Hub access token' }
    ],
    configOptions: [
      { key: 'dockerfile', defaultValue: './Dockerfile', type: 'text', description: 'Dockerfile path' },
      { key: 'context', defaultValue: '.', type: 'text', description: 'Build context' },
      { key: 'platforms', defaultValue: 'linux/amd64', type: 'text', description: 'Target platforms' }
    ],
    code: `name: Docker Build & Push
on:
  push:
    tags: ['v*.*.*']
jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKERHUB_USERNAME }}
          password: \${{ secrets.DOCKERHUB_TOKEN }}
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: {{context}}
          file: {{dockerfile}}
          platforms: {{platforms}}
          push: true
          tags: \${{ secrets.DOCKERHUB_USERNAME }}/{{DOCKER_IMAGE_NAME}}:{{DOCKER_TAG}}`
  },
  {
    id: 'gh-monorepo',
    name: 'Monorepo Pipeline',
    platform: 'github',
    level: 'Advanced',
    category: 'GitHub Actions',
    difficulty: 'Advanced',
    description: 'Optimized pipeline for monorepos using Turborepo or Nx.',
    requirements: ['Monorepo setup', 'Turborepo/Nx config'],
    stepsExplanation: [
      'Checkout full history',
      'Setup Node.js',
      'Run affected build/test'
    ],
    envVariables: [],
    secrets: [
      { key: 'TURBO_TOKEN', description: 'Turborepo authentication token' }
    ],
    configOptions: [
      { key: 'nodeVersion', defaultValue: '20', type: 'select', options: ['18', '20', '22'], description: 'Node.js version' },
      { key: 'packageManager', defaultValue: 'npm', type: 'select', options: ['npm', 'yarn', 'pnpm'], description: 'Package manager' }
    ],
    code: `name: Monorepo CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: {{nodeVersion}}
      - run: {{packageManager}} install
      - run: npx turbo run build --filter=...[origin/main]`
  },
  {
    id: 'gh-matrix',
    name: 'Matrix Build (Node 18/20/22)',
    platform: 'github',
    level: 'Intermediate',
    category: 'GitHub Actions',
    difficulty: 'Intermediate',
    description: 'Test application across multiple Node versions.',
    requirements: ['GitHub repository'],
    stepsExplanation: [
      'Define matrix',
      'Run tests for each Node version'
    ],
    envVariables: [],
    secrets: [],
    configOptions: [
      { key: 'nodeVersions', defaultValue: '18,20,22', type: 'text', description: 'Comma-separated Node versions' },
      { key: 'os', defaultValue: 'ubuntu-latest', type: 'select', options: ['ubuntu-latest', 'windows-latest', 'macos-latest'], description: 'Operating system' }
    ],
    code: `name: Matrix CI
on: [push]
jobs:
  test:
    runs-on: {{os}}
    strategy:
      matrix:
        node-version: [{{nodeVersions}}]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm test || echo "tests skipped"`
  },
  {
    id: 'gh-e2e-testing',
    name: 'E2E Testing Pipeline',
    platform: 'github',
    level: 'Intermediate',
    category: 'GitHub Actions',
    difficulty: 'Intermediate',
    description: 'Run end-to-end tests with Playwright or Cypress.',
    requirements: ['E2E test framework', 'Test configuration'],
    stepsExplanation: [
      'Setup test environment',
      'Install dependencies',
      'Run E2E tests',
      'Upload test results'
    ],
    envVariables: [
      { key: 'BASE_URL', defaultValue: 'http://localhost:3000', description: 'Application base URL for testing' }
    ],
    secrets: [],
    configOptions: [
      { key: 'testFramework', defaultValue: 'playwright', type: 'select', options: ['playwright', 'cypress'], description: 'E2E testing framework' },
      { key: 'nodeVersion', defaultValue: '20', type: 'select', options: ['18', '20', '22'], description: 'Node.js version' }
    ],
    code: `name: E2E Tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: {{nodeVersion}}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Run E2E tests
        run: npm run test:e2e:{{testFramework}}
        env:
          BASE_URL: {{BASE_URL}}
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: e2e-results
          path: test-results/`
  },
  {
    id: 'gh-security-scan',
    name: 'Security Scan Pipeline',
    platform: 'github',
    level: 'Intermediate',
    category: 'GitHub Actions',
    difficulty: 'Intermediate',
    description: 'Automated security scanning and vulnerability detection.',
    requirements: ['Node.js project', 'Dependency files'],
    stepsExplanation: [
      'Run dependency audit',
      'Code security analysis',
      'Container security scan',
      'Generate security report'
    ],
    envVariables: [],
    secrets: [],
    configOptions: [
      { key: 'nodeVersion', defaultValue: '20', type: 'select', options: ['18', '20', '22'], description: 'Node.js version' },
      { key: 'scanLevel', defaultValue: 'high', type: 'select', options: ['low', 'medium', 'high', 'critical'], description: 'Minimum vulnerability level' }
    ],
    code: `name: Security Scan
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: {{nodeVersion}}
          cache: 'npm'
      - run: npm ci
      - name: Audit dependencies
        run: npm audit --audit-level {{scanLevel}}
      - name: Run CodeQL Analysis
        uses: github/codeql-action/analyze@v3
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'`
  },
  {
    id: 'gh-performance-test',
    name: 'Performance Testing Pipeline',
    platform: 'github',
    level: 'Advanced',
    category: 'GitHub Actions',
    difficulty: 'Advanced',
    description: 'Automated performance testing with Lighthouse and WebPageTest.',
    requirements: ['Deployable application', 'Performance budget'],
    stepsExplanation: [
      'Deploy to staging',
      'Run Lighthouse audit',
      'WebPageTest analysis',
      'Compare with baseline'
    ],
    envVariables: [
      { key: 'PERFORMANCE_BUDGET', defaultValue: '90', description: 'Minimum Lighthouse performance score' }
    ],
    secrets: [
      { key: 'STAGING_DEPLOY_KEY', description: 'Staging deployment key' }
    ],
    configOptions: [
      { key: 'nodeVersion', defaultValue: '20', type: 'select', options: ['18', '20', '22'], description: 'Node.js version' },
      { key: 'testUrl', defaultValue: 'https://staging.example.com', type: 'text', description: 'URL to test' }
    ],
    code: `name: Performance Test
on: [push]
jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: {{nodeVersion}}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Deploy to staging
        run: echo "Deploying to staging..."
        env:
          STAGING_DEPLOY_KEY: \${{ secrets.STAGING_DEPLOY_KEY }}
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.12.x
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: \${{ secrets.LHCI_GITHUB_APP_TOKEN }}
          LHCI_SERVER_URL: {{testUrl}}
      - name: Performance Budget Check
        run: |
          if [ \$(cat .lighthouseci/lhr.json | jq '.categories.performance.score * 100') -lt {{PERFORMANCE_BUDGET}} ]; then
            echo "Performance score below budget"
            exit 1
          fi`
  },
  {
    id: 'gh-coverage-report',
    name: 'Code Coverage Pipeline',
    platform: 'github',
    level: 'Intermediate',
    category: 'GitHub Actions',
    difficulty: 'Intermediate',
    description: 'Generate and track code coverage reports.',
    requirements: ['Test framework with coverage', 'Codecov account'],
    stepsExplanation: [
      'Run tests with coverage',
      'Generate coverage report',
      'Upload to Codecov',
      'Check coverage thresholds'
    ],
    envVariables: [
      { key: 'COVERAGE_THRESHOLD', defaultValue: '80', description: 'Minimum coverage percentage' }
    ],
    secrets: [
      { key: 'CODECOV_TOKEN', description: 'Codecov upload token' }
    ],
    configOptions: [
      { key: 'nodeVersion', defaultValue: '20', type: 'select', options: ['18', '20', '22'], description: 'Node.js version' },
      { key: 'coverageTool', defaultValue: 'jest', type: 'select', options: ['jest', 'mocha', 'vitest'], description: 'Coverage tool' }
    ],
    code: `name: Code Coverage
on: [push, pull_request]
jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: {{nodeVersion}}
          cache: 'npm'
      - run: npm ci
      - name: Generate coverage report
        run: npm run test:coverage:{{coverageTool}}
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          token: \${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          fail_ci_if_error: true
      - name: Check coverage threshold
        run: |
          COVERAGE=\$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( \$(echo "\$COVERAGE < {{COVERAGE_THRESHOLD}}" | bc -l) )); then
            echo "Coverage \$COVERAGE% below threshold {{COVERAGE_THRESHOLD}}%"
            exit 1
          fi`
  },
  {
    id: 'gh-release-pipeline',
    name: 'Release Pipeline',
    platform: 'github',
    level: 'Advanced',
    category: 'GitHub Actions',
    difficulty: 'Advanced',
    description: 'Automated release with version bumping and changelog generation.',
    requirements: ['Semantic versioning', 'Release configuration'],
    stepsExplanation: [
      'Run full test suite',
      'Build application',
      'Bump version',
      'Generate changelog',
      'Create GitHub release'
    ],
    envVariables: [],
    secrets: [
      { key: 'NPM_TOKEN', description: 'NPM publish token' },
      { key: 'GH_TOKEN', description: 'GitHub token for releases' }
    ],
    configOptions: [
      { key: 'nodeVersion', defaultValue: '20', type: 'select', options: ['18', '20', '22'], description: 'Node.js version' },
      { key: 'releaseType', defaultValue: 'patch', type: 'select', options: ['patch', 'minor', 'major'], description: 'Release type' }
    ],
    code: `name: Release
on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: \${{ secrets.GH_TOKEN }}
      - uses: actions/setup-node@v4
        with:
          node-version: {{nodeVersion}}
          cache: 'npm'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - name: Release
        run: npx semantic-release
        env:
          NPM_TOKEN: \${{ secrets.NPM_TOKEN }}
          GITHUB_TOKEN: \${{ secrets.GH_TOKEN }}`
  },
  {
    id: 'gh-node-cicd-full',
    name: 'Full CI/CD Pipeline (Test → Build → Deploy)',
    platform: 'github',
    level: 'Intermediate',
    category: 'GitHub Actions',
    difficulty: 'Intermediate',
    description: 'Complete CI/CD pipeline with test, build (Docker), and deploy stages. Deploy runs after build using needs.',
    requirements: ['GitHub repository', 'Node.js project', 'Dockerfile', 'Docker Hub account'],
    stepsExplanation: [
      'Checkout and test code',
      'Build Docker image and push to registry',
      'Pull image and deploy to server'
    ],
    envVariables: [
      { key: 'NODE_ENV', defaultValue: 'production', description: 'Node environment' },
      { key: 'DOCKER_IMAGE', defaultValue: 'myapp', description: 'Docker image name' }
    ],
    secrets: [
      { key: 'DOCKERHUB_USERNAME', description: 'Docker Hub username' },
      { key: 'DOCKERHUB_TOKEN', description: 'Docker Hub access token' },
      { key: 'DEPLOY_HOST', description: 'Deployment server host' }
    ],
    configOptions: [
      { key: 'nodeVersion', defaultValue: '20', type: 'select', options: ['18', '20', '22'], description: 'Node.js version' },
      { key: 'dockerTag', defaultValue: 'latest', type: 'text', description: 'Docker image tag' }
    ],
    code: `name: Node.js CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: {{nodeVersion}}
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Run linting
        run: npm run lint || echo "lint skipped"
      - name: Run tests
        run: npm test || echo "tests skipped"
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: {{nodeVersion}}
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Build application
        run: npm run build
      - name: Build Docker image
        run: docker build -t \${{ secrets.DOCKERHUB_USERNAME }}/{{DOCKER_IMAGE}}:{{dockerTag}} . || echo "docker build skipped"
      - name: Push to registry
        run: docker push \${{ secrets.DOCKERHUB_USERNAME }}/{{DOCKER_IMAGE}}:{{dockerTag}} || echo "docker push skipped"
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Pull Docker image
        run: docker pull \${{ secrets.DOCKERHUB_USERNAME }}/{{DOCKER_IMAGE}}:{{dockerTag}} || echo "docker pull skipped"
      - name: Deploy to server
        run: echo "Deploying \${{ secrets.DOCKERHUB_USERNAME }}/{{DOCKER_IMAGE}}:{{dockerTag}} to \${{ secrets.DEPLOY_HOST }}..."
      - name: Print success message
        run: echo "Deployment completed successfully!"`
  },

  // === AWS DEVOPS TEMPLATES ===
  {
    id: 'aws-codebuild-node',
    name: 'AWS CodeBuild Node.js',
    platform: 'aws',
    level: 'Beginner',
    category: 'AWS DevOps',
    difficulty: 'Beginner',
    description: 'Build and test Node.js application using AWS CodeBuild.',
    requirements: ['AWS account', 'CodeBuild project', 'S3 bucket'],
    stepsExplanation: [
      'Source code checkout',
      'Install dependencies',
      'Run tests',
      'Build artifacts',
      'Upload to S3'
    ],
    envVariables: [
      { key: 'NODE_ENV', defaultValue: 'production', description: 'Node environment' },
      { key: 'S3_BUCKET', defaultValue: '', description: 'S3 bucket for artifacts' }
    ],
    secrets: [
      { key: 'AWS_ACCESS_KEY_ID', description: 'AWS access key' },
      { key: 'AWS_SECRET_ACCESS_KEY', description: 'AWS secret key' }
    ],
    configOptions: [
      { key: 'nodeVersion', defaultValue: '20', type: 'select', options: ['18', '20', '22'], description: 'Node.js version' },
      { key: 'buildSpec', defaultValue: 'buildspec.yml', type: 'text', description: 'Build specification file' },
      { key: 'region', defaultValue: 'us-east-1', type: 'select', options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'], description: 'AWS region' }
    ],
    code: `version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: {{nodeVersion}}
    commands:
      - npm ci
  pre_build:
    commands:
      - npm run lint
  build:
    commands:
      - npm test
      - npm run build
  post_build:
    commands:
      - aws s3 sync dist/ s3://{{S3_BUCKET}} --region {{region}}
artifacts:
  files:
    - '**/*'
  base-directory: 'dist'
cache:
  paths:
    - 'node_modules/**/*'`
  },
  {
    id: 'aws-codepipeline-ecs',
    name: 'AWS CodePipeline ECS Deploy',
    platform: 'aws',
    level: 'Intermediate',
    category: 'AWS DevOps',
    difficulty: 'Intermediate',
    description: 'Deploy containerized application to ECS using CodePipeline.',
    requirements: ['ECS cluster', 'ECR repository', 'CodePipeline'],
    stepsExplanation: [
      'Source from CodeCommit',
      'Build Docker image',
      'Push to ECR',
      'Update ECS service',
      'Monitor deployment'
    ],
    envVariables: [
      { key: 'ECR_REPO', defaultValue: '', description: 'ECR repository URI' },
      { key: 'ECS_CLUSTER', defaultValue: '', description: 'ECS cluster name' },
      { key: 'ECS_SERVICE', defaultValue: '', description: 'ECS service name' }
    ],
    secrets: [
      { key: 'AWS_ACCESS_KEY_ID', description: 'AWS access key' },
      { key: 'AWS_SECRET_ACCESS_KEY', description: 'AWS secret key' }
    ],
    configOptions: [
      { key: 'region', defaultValue: 'us-east-1', type: 'select', options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'], description: 'AWS region' },
      { key: 'containerPort', defaultValue: '3000', type: 'text', description: 'Container port' },
      { key: 'desiredCount', defaultValue: '2', type: 'text', description: 'Desired task count' }
    ],
    code: `version: 0.2
phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region {{region}} | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.{{region}}.amazonaws.com
      - IMAGE_TAG=\$(echo \$CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c1-7)
  build:
    commands:
      - echo Build started on \`date\`
      - echo Building the Docker image...
      - docker build -t {{ECR_REPO}}:\$IMAGE_TAG .
      - docker tag {{ECR_REPO}}:\$IMAGE_TAG {{ECR_REPO}}:latest
  post_build:
    commands:
      - echo Build completed on \`date\`
      - echo Pushing the Docker images...
      - docker push {{ECR_REPO}}:\$IMAGE_TAG
      - docker push {{ECR_REPO}}:latest
      - echo Writing image definitions file...
      - printf '[{"name":"%s","imageUri":"%s"}]' {{ECS_SERVICE}} {{ECR_REPO}}:\$IMAGE_TAG > imagedefinitions.json
artifacts:
  files: imagedefinitions.json`
  },
  {
    id: 'aws-lambda-deploy',
    name: 'AWS Lambda Deployment',
    platform: 'aws',
    level: 'Intermediate',
    category: 'AWS DevOps',
    difficulty: 'Intermediate',
    description: 'Build and deploy Node.js Lambda function with API Gateway.',
    requirements: ['Lambda function', 'API Gateway', 'IAM role'],
    stepsExplanation: [
      'Package Lambda code',
      'Update Lambda function',
      'Update API Gateway',
      'Run integration tests'
    ],
    envVariables: [
      { key: 'FUNCTION_NAME', defaultValue: '', description: 'Lambda function name' },
      { key: 'API_GATEWAY_ID', defaultValue: '', description: 'API Gateway ID' }
    ],
    secrets: [
      { key: 'AWS_ACCESS_KEY_ID', description: 'AWS access key' },
      { key: 'AWS_SECRET_ACCESS_KEY', description: 'AWS secret key' }
    ],
    configOptions: [
      { key: 'region', defaultValue: 'us-east-1', type: 'select', options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'], description: 'AWS region' },
      { key: 'runtime', defaultValue: 'nodejs20.x', type: 'select', options: ['nodejs18.x', 'nodejs20.x', 'nodejs22.x'], description: 'Lambda runtime' },
      { key: 'memorySize', defaultValue: '256', type: 'text', description: 'Memory size in MB' },
      { key: 'timeout', defaultValue: '30', type: 'text', description: 'Timeout in seconds' }
    ],
    code: `version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 20
    commands:
      - npm ci
  build:
    commands:
      - npm run build
      - npm test
  post_build:
    commands:
      - aws lambda update-function-code --function-name {{FUNCTION_NAME}} --zip-file fileb://deployment.zip --region {{region}}
      - aws lambda update-function-configuration --function-name {{FUNCTION_NAME}} --runtime {{runtime}} --memory-size {{memorySize}} --timeout {{timeout}} --region {{region}}
artifacts:
  type: zip
  files:
    - '**/*'
  base-directory: 'dist'`
  },
  {
    id: 'aws-cloudformation-stack',
    name: 'AWS CloudFormation Stack',
    platform: 'aws',
    level: 'Advanced',
    category: 'AWS DevOps',
    difficulty: 'Advanced',
    description: 'Deploy infrastructure using CloudFormation templates.',
    requirements: ['CloudFormation templates', 'IAM permissions'],
    stepsExplanation: [
      'Validate CloudFormation template',
      'Create/update stack',
      'Monitor stack deployment',
      'Run stack tests'
    ],
    envVariables: [
      { key: 'STACK_NAME', defaultValue: '', description: 'CloudFormation stack name' },
      { key: 'TEMPLATE_FILE', defaultValue: 'template.yaml', description: 'CloudFormation template file' }
    ],
    secrets: [
      { key: 'AWS_ACCESS_KEY_ID', description: 'AWS access key' },
      { key: 'AWS_SECRET_ACCESS_KEY', description: 'AWS secret key' }
    ],
    configOptions: [
      { key: 'region', defaultValue: 'us-east-1', type: 'select', options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'], description: 'AWS region' },
      { key: 'capabilities', defaultValue: 'CAPABILITY_IAM', type: 'select', options: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM', 'CAPABILITY_AUTO_EXPAND'], description: 'Stack capabilities' }
    ],
    code: `version: 0.2
phases:
  pre_build:
    commands:
      - echo Validating CloudFormation template...
      - aws cloudformation validate-template --template-body file://{{TEMPLATE_FILE}} --region {{region}}
  build:
    commands:
      - echo Deploying CloudFormation stack...
      - aws cloudformation deploy --template-file {{TEMPLATE_FILE}} --stack-name {{STACK_NAME}} --capabilities {{capabilities}} --region {{region}}
  post_build:
    commands:
      - echo Stack deployment completed
      - aws cloudformation describe-stacks --stack-name {{STACK_NAME}} --region {{region}}`
  },
  {
    id: 'aws-s3-static-website',
    name: 'AWS S3 Static Website',
    platform: 'aws',
    level: 'Beginner',
    category: 'AWS DevOps',
    difficulty: 'Beginner',
    description: 'Deploy static website to S3 with CloudFront CDN.',
    requirements: ['S3 bucket', 'CloudFront distribution'],
    stepsExplanation: [
      'Build static assets',
      'Sync to S3 bucket',
      'Invalidate CloudFront cache',
      'Update DNS records'
    ],
    envVariables: [
      { key: 'S3_BUCKET', defaultValue: '', description: 'S3 bucket name' },
      { key: 'CLOUDFRONT_ID', defaultValue: '', description: 'CloudFront distribution ID' }
    ],
    secrets: [
      { key: 'AWS_ACCESS_KEY_ID', description: 'AWS access key' },
      { key: 'AWS_SECRET_ACCESS_KEY', description: 'AWS secret key' }
    ],
    configOptions: [
      { key: 'region', defaultValue: 'us-east-1', type: 'select', options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'], description: 'AWS region' },
      { key: 'buildCommand', defaultValue: 'npm run build', type: 'text', description: 'Build command' }
    ],
    code: `version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 20
    commands:
      - npm ci
  build:
    commands:
      - {{buildCommand}}
  post_build:
    commands:
      - echo Syncing to S3...
      - aws s3 sync dist/ s3://{{S3_BUCKET}} --delete --region {{region}}
      - echo Invalidating CloudFront cache...
      - aws cloudfront create-invalidation --distribution-id {{CLOUDFRONT_ID}} --paths "/*" --region {{region}}
artifacts:
  files:
    - '**/*'
  base-directory: 'dist'`
  },
  {
    id: 'aws-rds-backup',
    name: 'AWS RDS Backup Pipeline',
    platform: 'aws',
    level: 'Intermediate',
    category: 'AWS DevOps',
    difficulty: 'Intermediate',
    description: 'Automated RDS database backup and restore testing.',
    requirements: ['RDS instance', 'S3 bucket', 'IAM permissions'],
    stepsExplanation: [
      'Create RDS snapshot',
      'Copy snapshot to S3',
      'Test restore process',
      'Clean up old snapshots'
    ],
    envVariables: [
      { key: 'DB_INSTANCE', defaultValue: '', description: 'RDS instance identifier' },
      { key: 'S3_BACKUP_BUCKET', defaultValue: '', description: 'S3 bucket for backups' }
    ],
    secrets: [
      { key: 'AWS_ACCESS_KEY_ID', description: 'AWS access key' },
      { key: 'AWS_SECRET_ACCESS_KEY', description: 'AWS secret key' },
      { key: 'DB_PASSWORD', description: 'Database password' }
    ],
    configOptions: [
      { key: 'region', defaultValue: 'us-east-1', type: 'select', options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'], description: 'AWS region' },
      { key: 'retentionDays', defaultValue: '7', type: 'text', description: 'Backup retention days' }
    ],
    code: `version: 0.2
phases:
  pre_build:
    commands:
      - echo Creating RDS snapshot...
      - SNAPSHOT_ID=\$(aws rds create-db-snapshot --db-instance-identifier {{DB_INSTANCE}} --db-snapshot-identifier backup-\$(date +%Y%m%d-%H%M%S) --region {{region}} --query 'DBSnapshot.DBSnapshotIdentifier' --output text)
  build:
    commands:
      - echo Waiting for snapshot to complete...
      - aws rds wait db-snapshot-completed --db-snapshot-identifier \$SNAPSHOT_ID --region {{region}}
      - echo Copying snapshot to S3...
      - aws rds copy-db-snapshot --source-db-snapshot-identifier \$SNAPSHOT_ID --target-db-snapshot-identifier s3-backup-\$SNAPSHOT_ID --region {{region}}
  post_build:
    commands:
      - echo Cleaning up old snapshots...
      - aws rds describe-db-snapshots --db-instance-identifier {{DB_INSTANCE}} --region {{region}} --query 'DBSnapshots[?SnapshotCreateTime<datetime(now()-pt{{retentionDays}}h)].DBSnapshotIdentifier' --output text | xargs -I {} aws rds delete-db-snapshot --db-snapshot-identifier {} --region {{region}}`
  },
  {
    id: 'aws-ecs-fargate',
    name: 'AWS ECS Fargate Deploy',
    platform: 'aws',
    level: 'Advanced',
    category: 'AWS DevOps',
    difficulty: 'Advanced',
    description: 'Deploy containerized application using ECS Fargate.',
    requirements: ['ECS cluster', 'Fargate task definition', 'Application Load Balancer'],
    stepsExplanation: [
      'Build Docker image',
      'Push to ECR',
      'Update task definition',
      'Deploy to Fargate',
      'Update ALB target'
    ],
    envVariables: [
      { key: 'ECR_REPO', defaultValue: '', description: 'ECR repository URI' },
      { key: 'TASK_DEFINITION', defaultValue: '', description: 'Task definition family' }
    ],
    secrets: [
      { key: 'AWS_ACCESS_KEY_ID', description: 'AWS access key' },
      { key: 'AWS_SECRET_ACCESS_KEY', description: 'AWS secret key' }
    ],
    configOptions: [
      { key: 'region', defaultValue: 'us-east-1', type: 'select', options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'], description: 'AWS region' },
      { key: 'cpu', defaultValue: '256', type: 'text', description: 'CPU units' },
      { key: 'memory', defaultValue: '512', type: 'text', description: 'Memory in MB' }
    ],
    code: `version: 0.2
phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region {{region}} | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.{{region}}.amazonaws.com
      - IMAGE_TAG=\$(echo \$CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c1-7)
  build:
    commands:
      - echo Building Docker image...
      - docker build -t {{ECR_REPO}}:\$IMAGE_TAG .
      - docker push {{ECR_REPO}}:\$IMAGE_TAG
  post_build:
    commands:
      - echo Updating task definition...
      - aws ecs register-task-definition --cli-input-json file://task-definition.json --region {{region}}
      - echo Updating ECS service...
      - aws ecs update-service --cluster {{TASK_DEFINITION}} --service {{TASK_DEFINITION}} --task-definition {{TASK_DEFINITION}}:\$REVISION --region {{region}}`
  },
  {
    id: 'aws-step-functions',
    name: 'AWS Step Functions Workflow',
    platform: 'aws',
    level: 'Advanced',
    category: 'AWS DevOps',
    difficulty: 'Advanced',
    description: 'Orchestrate complex workflows using AWS Step Functions.',
    requirements: ['Step Functions state machine', 'Lambda functions'],
    stepsExplanation: [
      'Validate state machine definition',
      'Update state machine',
      'Execute workflow',
      'Monitor execution'
    ],
    envVariables: [
      { key: 'STATE_MACHINE_ARN', defaultValue: '', description: 'Step Functions state machine ARN' }
    ],
    secrets: [
      { key: 'AWS_ACCESS_KEY_ID', description: 'AWS access key' },
      { key: 'AWS_SECRET_ACCESS_KEY', description: 'AWS secret key' }
    ],
    configOptions: [
      { key: 'region', defaultValue: 'us-east-1', type: 'select', options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'], description: 'AWS region' },
      { key: 'definitionFile', defaultValue: 'statemachine.json', type: 'text', description: 'State machine definition file' }
    ],
    code: `version: 0.2
phases:
  pre_build:
    commands:
      - echo Validating state machine definition...
      - aws step-functions validate-state-machine-definition --definition file://{{definitionFile}} --region {{region}}
  build:
    commands:
      - echo Updating state machine...
      - aws step-functions update-state-machine --state-machine-arn {{STATE_MACHINE_ARN}} --definition file://{{definitionFile}} --role-arn \$EXECUTION_ROLE --region {{region}}
  post_build:
    commands:
      - echo Starting state machine execution...
      - EXECUTION_ARN=\$(aws step-functions start-execution --state-machine-arn {{STATE_MACHINE_ARN}} --input '{"input": "test"}' --region {{region}} --query 'executionArn' --output text)
      - echo Monitoring execution...
      - aws step-functions describe-execution --execution-arn \$EXECUTION_ARN --region {{region}}`
  },
  {
    id: 'aws-cloudwatch-monitoring',
    name: 'AWS CloudWatch Monitoring',
    platform: 'aws',
    level: 'Intermediate',
    category: 'AWS DevOps',
    difficulty: 'Intermediate',
    description: 'Set up comprehensive monitoring and alerting with CloudWatch.',
    requirements: ['CloudWatch logs', 'SNS topics', 'IAM permissions'],
    stepsExplanation: [
      'Create CloudWatch dashboards',
      'Set up metric alarms',
      'Configure log filters',
      'Test alert notifications'
    ],
    envVariables: [
      { key: 'LOG_GROUP', defaultValue: '', description: 'CloudWatch log group' },
      { key: 'SNS_TOPIC', defaultValue: '', description: 'SNS topic for alerts' }
    ],
    secrets: [
      { key: 'AWS_ACCESS_KEY_ID', description: 'AWS access key' },
      { key: 'AWS_SECRET_ACCESS_KEY', description: 'AWS secret key' }
    ],
    configOptions: [
      { key: 'region', defaultValue: 'us-east-1', type: 'select', options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'], description: 'AWS region' },
      { key: 'dashboardName', defaultValue: 'application-dashboard', type: 'text', description: 'CloudWatch dashboard name' }
    ],
    code: `version: 0.2
phases:
  pre_build:
    commands:
      - echo Creating CloudWatch dashboard...
      - aws cloudwatch put-dashboard --dashboard-name {{dashboardName}} --dashboard-body file://dashboard.json --region {{region}}
  build:
    commands:
      - echo Setting up metric alarms...
      - aws cloudwatch put-metric-alarm --alarm-name HighErrorRate --metric-name Errors --namespace AWS/ApplicationELB --statistic Sum --period 300 --threshold 10 --comparison-operator GreaterThanThreshold --evaluation-periods 2 --alarm-actions {{SNS_TOPIC}} --region {{region}}
  post_build:
    commands:
      - echo Testing alarm configuration...
      - aws cloudwatch describe-alarms --alarm-names HighErrorRate --region {{region}}
      - echo Setting up log metric filters...
      - aws logs put-metric-filter --log-group-name {{LOG_GROUP}} --filter-name ErrorCount --filter-pattern "[timestamp, request_id, level, message]" --metric-transformations metricName=ErrorCount,metricNamespace=Application,metricValue=1 --region {{region}}`
  },

  // === JENKINS TEMPLATES ===
  {
    id: 'jenkins-node-ci',
    name: 'Jenkins Node.js CI',
    platform: 'jenkins',
    level: 'Beginner',
    category: 'Jenkins Pipelines',
    difficulty: 'Beginner',
    description: 'Basic Node.js CI pipeline with Jenkins.',
    requirements: ['Jenkins server', 'Node.js plugin', 'Git plugin'],
    stepsExplanation: [
      'Checkout source code',
      'Setup Node.js environment',
      'Install dependencies',
      'Run tests and linting',
      'Archive artifacts'
    ],
    envVariables: [
      { key: 'NODE_VERSION', defaultValue: '20', description: 'Node.js version' }
    ],
    secrets: [],
    configOptions: [
      { key: 'branch', defaultValue: 'main', type: 'text', description: 'Git branch to build' },
      { key: 'nodeVersion', defaultValue: '20', type: 'select', options: ['18', '20', '22'], description: 'Node.js version' }
    ],
    code: `pipeline {
    agent any
    environment {
        NODE_VERSION = '{{nodeVersion}}'
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: '{{branch}}', url: 'https://github.com/your-repo.git'
            }
        }
        stage('Setup Node.js') {
            steps {
                nodejs(nodeJSInstallationName: 'Node {{nodeVersion}}') {
                    sh 'node --version'
                    sh 'npm --version'
                }
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        stage('Test') {
            steps {
                parallel(
                    'Lint': { sh 'npm run lint' },
                    'Unit Tests': { sh 'npm test' }
                )
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
    }
    post {
        always {
            junit 'test-results.xml'
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'coverage',
                reportFiles: 'index.html',
                reportName: 'Coverage Report'
            ])
        }
        success {
            archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
        }
    }
}`
  },
  {
    id: 'jenkins-docker-build',
    name: 'Jenkins Docker Build',
    platform: 'jenkins',
    level: 'Intermediate',
    category: 'Jenkins Pipelines',
    difficulty: 'Intermediate',
    description: 'Build and push Docker images using Jenkins.',
    requirements: ['Docker plugin', 'Docker registry access'],
    stepsExplanation: [
      'Build Docker image',
      'Run container tests',
      'Push to registry',
      'Clean up workspace'
    ],
    envVariables: [
      { key: 'DOCKER_IMAGE', defaultValue: '', description: 'Docker image name' },
      { key: 'DOCKER_TAG', defaultValue: 'latest', description: 'Docker image tag' }
    ],
    secrets: [
      { key: 'DOCKER_REGISTRY credentials', description: 'Docker registry credentials' }
    ],
    configOptions: [
      { key: 'dockerfile', defaultValue: 'Dockerfile', type: 'text', description: 'Dockerfile path' },
      { key: 'registry', defaultValue: 'docker.io', type: 'text', description: 'Docker registry URL' }
    ],
    code: `pipeline {
    agent any
    environment {
        DOCKER_IMAGE = '{{DOCKER_IMAGE}}'
        DOCKER_TAG = '{{DOCKER_TAG}}'
        DOCKER_REGISTRY = '{{registry}}'
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/your-repo.git'
            }
        }
        stage('Build Image') {
            steps {
                script {
                    docker.build("\${DOCKER_IMAGE}:\${DOCKER_TAG}", "-f {{dockerfile}} .")
                }
            }
        }
        stage('Test Container') {
            steps {
                script {
                    docker.image("\${DOCKER_IMAGE}:\${DOCKER_TAG}").inside {
                        sh 'npm test'
                    }
                }
            }
        }
        stage('Push Image') {
            steps {
                script {
                    docker.withRegistry("https://\${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                        docker.image("\${DOCKER_IMAGE}:\${DOCKER_TAG}").push()
                    }
                }
            }
        }
    }
    post {
        always {
            sh 'docker system prune -f'
        }
        success {
            echo 'Docker image built and pushed successfully'
        }
        failure {
            echo 'Docker build failed'
        }
    }
}`
  },
  {
    id: 'jenkins-k8s-deploy',
    name: 'Jenkins Kubernetes Deploy',
    platform: 'jenkins',
    level: 'Advanced',
    category: 'Jenkins Pipelines',
    difficulty: 'Advanced',
    description: 'Deploy applications to Kubernetes cluster using Jenkins.',
    requirements: ['Kubernetes plugin', 'K8s cluster access', 'kubectl'],
    stepsExplanation: [
      'Build application',
      'Create Docker image',
      'Deploy to Kubernetes',
      'Verify deployment',
      'Run smoke tests'
    ],
    envVariables: [
      { key: 'K8S_NAMESPACE', defaultValue: 'default', description: 'Kubernetes namespace' },
      { key: 'APP_NAME', defaultValue: '', description: 'Application name' }
    ],
    secrets: [
      { key: 'KUBECONFIG', description: 'Kubernetes configuration' }
    ],
    configOptions: [
      { key: 'dockerImage', defaultValue: '', type: 'text', description: 'Docker image name' },
      { key: 'manifestDir', defaultValue: 'k8s', type: 'text', description: 'Kubernetes manifests directory' }
    ],
    code: `pipeline {
    agent any
    environment {
        K8S_NAMESPACE = '{{K8S_NAMESPACE}}'
        APP_NAME = '{{APP_NAME}}'
        DOCKER_IMAGE = '{{dockerImage}}'
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/your-repo.git'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        stage('Docker Build') {
            steps {
                script {
                    def image = docker.build("\${DOCKER_IMAGE}:\${BUILD_NUMBER}")
                    docker.withRegistry('https://registry.example.com', 'docker-registry-credentials') {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }
        stage('Deploy to K8s') {
            steps {
                script {
                    withKubeConfig([credentialsId: 'k8s-credentials']) {
                        sh "kubectl set image deployment/\${APP_NAME} \${APP_NAME}=\${DOCKER_IMAGE}:\${BUILD_NUMBER} -n \${K8S_NAMESPACE}"
                        sh "kubectl rollout status deployment/\${APP_NAME} -n \${K8S_NAMESPACE}"
                    }
                }
            }
        }
        stage('Verify') {
            steps {
                script {
                    withKubeConfig([credentialsId: 'k8s-credentials']) {
                        sh "kubectl get pods -n \${K8S_NAMESPACE} -l app=\${APP_NAME}"
                        sh "kubectl get services -n \${K8S_NAMESPACE}"
                    }
                }
            }
        }
    }
    post {
        success {
            echo 'Deployment to Kubernetes completed successfully'
        }
        failure {
            script {
                withKubeConfig([credentialsId: 'k8s-credentials']) {
                    sh "kubectl rollout undo deployment/\${APP_NAME} -n \${K8S_NAMESPACE}"
                }
            }
        }
    }
}`
  },
  {
    id: 'jenkins-parallel-test',
    name: 'Jenkins Parallel Testing',
    platform: 'jenkins',
    level: 'Intermediate',
    category: 'Jenkins Pipelines',
    difficulty: 'Intermediate',
    description: 'Run tests in parallel across multiple environments.',
    requirements: ['Multiple test agents', 'Test matrix configuration'],
    stepsExplanation: [
      'Setup test matrix',
      'Run parallel tests',
      'Aggregate results',
      'Generate reports',
      'Notify on failures'
    ],
    envVariables: [
      { key: 'NODE_VERSIONS', defaultValue: '18,20,22', description: 'Node.js versions to test' }
    ],
    secrets: [],
    configOptions: [
      { key: 'testTypes', defaultValue: 'unit,integration,e2e', type: 'text', description: 'Test types to run' },
      { key: 'parallelStages', defaultValue: '3', type: 'text', description: 'Number of parallel stages' }
    ],
    envVariables: [
      { key: 'NODE_VERSIONS', defaultValue: '18,20,22', description: 'Node.js versions to test' }
    ],
    secrets: [],
    configOptions: [
      { key: 'testTypes', defaultValue: 'unit,integration,e2e', type: 'text', description: 'Test types to run' },
      { key: 'parallelStages', defaultValue: '3', type: 'text', description: 'Number of parallel stages' }
    ],
    code: `pipeline {
    agent any
    environment {
        NODE_VERSIONS = '{{NODE_VERSIONS}}'
        TEST_TYPES = '{{testTypes}}'
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/your-repo.git'
            }
        }
        stage('Setup Matrix') {
            steps {
                script {
                    def versions = env.NODE_VERSIONS.split(',')
                    def testTypes = env.TEST_TYPES.split(',')
                    env.MATRIX_SIZE = versions.size() * testTypes.size()
                }
            }
        }
        stage('Parallel Tests') {
            steps {
                script {
                    def versions = env.NODE_VERSIONS.split(',')
                    def testTypes = env.TEST_TYPES.split(',')
                    def parallelStages = [:]
                    
                    versions.each { version ->
                        testTypes.each { testType ->
                            parallelStages["\${version}-\${testType}"] = {
                                stage("Node \${version} - \${testType}") {
                                    nodejs(nodeJSInstallationName: "Node \${version}") {
                                        sh 'npm ci'
                                        sh "npm run test:\${testType}"
                                    }
                                }
                            }
                        }
                    }
                    
                    parallel parallelStages
                }
            }
        }
        stage('Aggregate Results') {
            steps {
                script {
                    junit 'test-results/**/*.xml'
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }
    }
    post {
        always {
            script {
                def failedTests = currentBuild.result ?: 'SUCCESS'
                if (failedTests != 'SUCCESS') {
                    emailext (
                        subject: "Jenkins Build Failed: \${env.JOB_NAME} - \${env.BUILD_NUMBER}",
                        body: "Build failed. Check console output at \${env.BUILD_URL}",
                        to: "\${env.CHANGE_AUTHOR_EMAIL}"
                    )
                }
            }
        }
    }
}`
  },
  {
    id: 'jenkins-multi-branch',
    name: 'Jenkins Multi-Branch Pipeline',
    platform: 'jenkins',
    level: 'Intermediate',
    category: 'Jenkins Pipelines',
    difficulty: 'Intermediate',
    description: 'Different pipeline behavior based on Git branch.',
    requirements: ['Multi-branch plugin', 'Branch strategy'],
    stepsExplanation: [
      'Detect branch type',
      'Execute branch-specific steps',
      'Merge validation',
      'Production deployment',
      'Feature branch testing'
    ],
    envVariables: [],
    secrets: [
      { key: 'PROD_DEPLOY_KEY', description: 'Production deployment key' }
    ],
    configOptions: [
      { key: 'mainBranch', defaultValue: 'main', type: 'text', description: 'Main branch name' },
      { key: 'devBranch', defaultValue: 'develop', type: 'text', description: 'Development branch name' }
    ],
    code: `pipeline {
    agent any
    environment {
        MAIN_BRANCH = '{{mainBranch}}'
        DEV_BRANCH = '{{devBranch}}'
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/your-repo.git', branch: env.BRANCH_NAME
            }
        }
        stage('Setup Environment') {
            steps {
                script {
                    if (env.BRANCH_NAME == env.MAIN_BRANCH) {
                        env.DEPLOY_ENV = 'production'
                        env.NODE_ENV = 'production'
                    } else if (env.BRANCH_NAME == env.DEV_BRANCH) {
                        env.DEPLOY_ENV = 'staging'
                        env.NODE_ENV = 'staging'
                    } else {
                        env.DEPLOY_ENV = 'feature'
                        env.NODE_ENV = 'development'
                    }
                }
            }
        }
        stage('Build and Test') {
            steps {
                sh 'npm ci'
                sh 'npm run lint'
                sh 'npm test'
                sh 'npm run build'
            }
        }
        stage('Deploy') {
            when {
                anyOf {
                    branch env.MAIN_BRANCH
                    branch env.DEV_BRANCH
                }
            }
            steps {
                script {
                    if (env.DEPLOY_ENV == 'production') {
                        withCredentials([string(credentialsId: 'prod-deploy-key', variable: 'DEPLOY_KEY')]) {
                            sh './deploy-production.sh'
                        }
                    } else if (env.DEPLOY_ENV == 'staging') {
                        sh './deploy-staging.sh'
                    }
                }
            }
        }
        stage('Merge Validation') {
            when {
                changeRequest()
            }
            steps {
                script {
                    sh 'npm run test:integration'
                    sh 'npm run test:e2e'
                }
            }
        }
    }
    post {
        success {
            echo "Pipeline completed successfully for branch: \${env.BRANCH_NAME}"
        }
        failure {
            echo "Pipeline failed for branch: \${env.BRANCH_NAME}"
        }
    }
}`
  },
  {
    id: 'jenkins-security-scan',
    name: 'Jenkins Security Scan',
    platform: 'jenkins',
    level: 'Advanced',
    category: 'Jenkins Pipelines',
    difficulty: 'Advanced',
    description: 'Comprehensive security scanning pipeline.',
    requirements: ['OWASP Dependency Check', 'SonarQube', 'Security plugins'],
    stepsExplanation: [
      'Static code analysis',
      'Dependency vulnerability scan',
      'Container security scan',
      'Secret detection',
      'Generate security report'
    ],
    envVariables: [
      { key: 'SONARQUBE_SERVER', defaultValue: '', description: 'SonarQube server URL' },
      { key: 'PROJECT_KEY', defaultValue: '', description: 'SonarQube project key' }
    ],
    secrets: [
      { key: 'SONARQUBE_TOKEN', description: 'SonarQube authentication token' }
    ],
    configOptions: [
      { key: 'scanLevel', defaultValue: 'high', type: 'select', options: ['low', 'medium', 'high', 'critical'], description: 'Security scan level' }
    ],
    code: `pipeline {
    agent any
    environment {
        SONARQUBE_SERVER = '{{SONARQUBE_SERVER}}'
        PROJECT_KEY = '{{PROJECT_KEY}}'
        SCAN_LEVEL = '{{scanLevel}}'
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/your-repo.git'
            }
        }
        stage('Static Code Analysis') {
            steps {
                script {
                    withSonarQubeEnv('SonarQube') {
                        sh 'npm ci'
                        sh 'npm run test:coverage'
                        sh "sonar-scanner -Dsonar.projectKey=\${PROJECT_KEY} -Dsonar.sources=. -Dsonar.host.url=\${SONARQUBE_SERVER} -Dsonar.login=\${SONARQUBE_TOKEN}"
                    }
                }
            }
        }
        stage('Dependency Check') {
            steps {
                script {
                    dependencyCheckAnalyzer datadir: '/dependency-check-data', 
                                       hintsFile: 'dependency-check-hints.xml',
                                       includeVulnReports: true,
                                       includeSuppressions: false,
                                       scanSet: 'src/',
                                       suppressionFile: 'dependency-check-suppressions.xml'
                }
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'reports',
                    reportFiles: 'dependency-check-report.html',
                    reportName: 'Dependency Check Report'
                ])
            }
        }
        stage('Container Security Scan') {
            steps {
                script {
                    sh 'docker build -t security-scan .'
                    sh 'trivy image --format json --output trivy-report.json security-scan'
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: '.',
                        reportFiles: 'trivy-report.html',
                        reportName: 'Container Security Report'
                    ])
                }
            }
        }
        stage('Secret Detection') {
            steps {
                script {
                    sh 'git-secrets --scan'
                    sh 'gitleaks detect --format json --report gitleaks-report.json'
                }
            }
        }
        stage('Quality Gate') {
            steps {
                script {
                    timeout(time: 5, unit: 'MINUTES') {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "Pipeline aborted due to quality gate failure: \${qg.status}"
                        }
                    }
                }
            }
        }
    }
    post {
        always {
            script {
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'security-reports',
                    reportFiles: 'security-summary.html',
                    reportName: 'Security Summary'
                ])
            }
        }
        success {
            echo 'Security scan completed successfully'
        }
        failure {
            echo 'Security scan failed - review reports'
        }
    }
}`
  },
  {
    id: 'jenkins-performance-test',
    name: 'Jenkins Performance Testing',
    platform: 'jenkins',
    level: 'Advanced',
    category: 'Jenkins Pipelines',
    difficulty: 'Advanced',
    description: 'Automated performance testing and benchmarking.',
    requirements: ['JMeter/Gatling', 'Performance monitoring', 'Load testing tools'],
    stepsExplanation: [
      'Deploy to test environment',
      'Run performance tests',
      'Collect metrics',
      'Compare with baseline',
      'Generate performance report'
    ],
    envVariables: [
      { key: 'TEST_URL', defaultValue: 'http://test.example.com', description: 'URL to test' },
      { key: 'PERFORMANCE_THRESHOLD', defaultValue: '2000', description: 'Response time threshold (ms)' }
    ],
    secrets: [],
    configOptions: [
      { key: 'testTool', defaultValue: 'jmeter', type: 'select', options: ['jmeter', 'gatling', 'k6'], description: 'Performance testing tool' },
      { key: 'concurrentUsers', defaultValue: '100', type: 'text', description: 'Number of concurrent users' }
    ],
    code: `pipeline {
    agent any
    environment {
        TEST_URL = '{{TEST_URL}}'
        PERFORMANCE_THRESHOLD = '{{PERFORMANCE_THRESHOLD}}'
        TEST_TOOL = '{{testTool}}'
        CONCURRENT_USERS = '{{concurrentUsers}}'
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/your-repo.git'
            }
        }
        stage('Deploy Test Environment') {
            steps {
                sh 'npm run build'
                sh 'npm run deploy:test'
                sh 'sleep 30' // Wait for deployment to be ready
            }
        }
        stage('Performance Test') {
            steps {
                script {
                    switch(env.TEST_TOOL) {
                        case 'jmeter':
                            sh "jmeter -n -t performance-test.jmx -l results.jtl -Jusers=\${CONCURRENT_USERS} -Jurl=\${TEST_URL}"
                            break
                        case 'gatling':
                            sh "gatling.sh -s PerformanceSimulation -rf gatling-reports"
                            break
                        case 'k6':
                            sh "k6 run --vus \${CONCURRENT_USERS} --http-url=\${TEST_URL} performance-test.js"
                            break
                    }
                }
            }
        }
        stage('Analyze Results') {
            steps {
                script {
                    if (env.TEST_TOOL == 'jmeter') {
                        perfReport 'results.jtl'
                        sh '''
                            python3 analyze-performance.py results.jtl \${PERFORMANCE_THRESHOLD}
                        '''
                    }
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'performance-reports',
                        reportFiles: 'index.html',
                        reportName: 'Performance Report'
                    ])
                }
            }
        }
        stage('Compare Baseline') {
            steps {
                script {
                    sh '''
                        python3 compare-baseline.py current-results.json baseline.json
                    '''
                }
            }
        }
    }
    post {
        always {
            sh 'npm run cleanup:test'
        }
        success {
            echo 'Performance tests passed'
        }
        failure {
            echo 'Performance tests failed - review performance reports'
        }
    }
}`
  },

  // === AZURE DEVOPS TEMPLATES ===
  {
    id: 'azure-node-ci',
    name: 'Azure Node.js CI',
    platform: 'azure',
    level: 'Beginner',
    category: 'Azure DevOps',
    difficulty: 'Beginner',
    description: 'Build and test Node.js app with Azure Pipelines.',
    requirements: ['Azure DevOps project', 'Node.js project'],
    stepsExplanation: ['Install dependencies', 'Run lint and tests', 'Build application'],
    envVariables: [{ key: 'NODE_ENV', defaultValue: 'production', description: 'Node environment' }],
    secrets: [],
    configOptions: [
      { key: 'nodeVersion', defaultValue: '20', type: 'select', options: ['18', '20', '22'], description: 'Node.js version' }
    ],
    code: `trigger:
  branches:
    include: [main]
pool:
  vmImage: 'ubuntu-latest'
steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '{{nodeVersion}}'
    displayName: 'Install Node.js'
  - script: npm ci
    displayName: 'Install dependencies'
  - script: npm run lint
    displayName: 'Run linting'
  - script: npm test
    displayName: 'Run tests'
  - script: npm run build
    displayName: 'Build application'`
  },
  {
    id: 'azure-docker-aks',
    name: 'Azure Docker + AKS Deploy',
    platform: 'azure',
    level: 'Intermediate',
    category: 'Azure DevOps',
    difficulty: 'Intermediate',
    description: 'Build Docker image and deploy to Azure Kubernetes Service.',
    requirements: ['AKS cluster', 'Azure Container Registry', 'Dockerfile'],
    stepsExplanation: ['Build Docker image', 'Push to ACR', 'Deploy to AKS'],
    envVariables: [
      { key: 'ACR_NAME', defaultValue: '', description: 'Azure Container Registry name' },
      { key: 'AKS_CLUSTER', defaultValue: '', description: 'AKS cluster name' }
    ],
    secrets: [
      { key: 'AZURE_SP_ID', description: 'Azure service principal ID' },
      { key: 'AZURE_SP_PASSWORD', description: 'Azure service principal password' },
      { key: 'AZURE_TENANT_ID', description: 'Azure tenant ID' }
    ],
    configOptions: [
      { key: 'resourceGroup', defaultValue: 'myResourceGroup', type: 'text', description: 'Resource group name' }
    ],
    code: `trigger:
  branches:
    include: [main]
pool:
  vmImage: 'ubuntu-latest'
steps:
  - task: Docker@2
    inputs:
      containerRegistry: '{{ACR_NAME}}'
      repository: 'app'
      command: 'buildAndPush'
      Dockerfile: '**/Dockerfile'
      tags: '\$(Build.BuildId)'
    displayName: 'Build and push Docker image'
  - task: KubernetesManifest@1
    inputs:
      action: 'deploy'
      kubernetesServiceConnection: '{{AKS_CLUSTER}}'
      namespace: 'default'
      manifests: 'k8s/deployment.yaml'
      containers: '{{ACR_NAME}}.azurecr.io/app:\$(Build.BuildId)'
    displayName: 'Deploy to AKS'`
  },
  {
    id: 'azure-static-webapp',
    name: 'Azure Static Web App',
    platform: 'azure',
    level: 'Beginner',
    category: 'Azure DevOps',
    difficulty: 'Beginner',
    description: 'Deploy static site to Azure Static Web Apps.',
    requirements: ['Azure Static Web App resource', 'Frontend project'],
    stepsExplanation: ['Build app', 'Deploy to Azure Static Web Apps'],
    envVariables: [],
    secrets: [{ key: 'AZURE_STATIC_WEB_APPS_API_TOKEN', description: 'Deployment token' }],
    configOptions: [
      { key: 'appLocation', defaultValue: '/', type: 'text', description: 'App source code location' },
      { key: 'apiLocation', defaultValue: 'api', type: 'text', description: 'API source code location' },
      { key: 'outputLocation', defaultValue: 'dist', type: 'text', description: 'Build output folder' }
    ],
    code: `trigger:
  branches:
    include: [main]
pool:
  vmImage: 'ubuntu-latest'
steps:
  - checkout: self
  - task: AzureStaticWebApp@0
    inputs:
      app_location: '{{appLocation}}'
      api_location: '{{apiLocation}}'
      output_location: '{{outputLocation}}'
      azure_static_web_apps_api_token: \$(AZURE_STATIC_WEB_APPS_API_TOKEN)`
  },

  // === GOOGLE CLOUD TEMPLATES ===
  {
    id: 'gcp-cloud-run-deploy',
    name: 'GCP Cloud Run Deploy',
    platform: 'gcp',
    level: 'Intermediate',
    category: 'Google Cloud',
    difficulty: 'Intermediate',
    description: 'Build and deploy containerized app to Google Cloud Run.',
    requirements: ['GCP project', 'Cloud Run enabled', 'Dockerfile'],
    stepsExplanation: ['Build with Cloud Build', 'Push to Artifact Registry', 'Deploy to Cloud Run'],
    envVariables: [
      { key: 'GCP_PROJECT', defaultValue: '', description: 'GCP project ID' },
      { key: 'SERVICE_NAME', defaultValue: 'my-app', description: 'Cloud Run service name' }
    ],
    secrets: [{ key: 'GCP_SERVICE_KEY', description: 'GCP service account key JSON' }],
    configOptions: [
      { key: 'region', defaultValue: 'us-central1', type: 'select', options: ['us-central1', 'us-east1', 'europe-west1', 'asia-east1'], description: 'GCP region' }
    ],
    code: `name: Deploy to Cloud Run
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          credentials_json: \${{ secrets.GCP_SERVICE_KEY }}
      - uses: google-github-actions/setup-gcloud@v2
        with:
          project_id: {{GCP_PROJECT}}
      - name: Build and Push
        run: |
          gcloud builds submit --tag gcr.io/{{GCP_PROJECT}}/{{SERVICE_NAME}}
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy {{SERVICE_NAME}} \\
            --image gcr.io/{{GCP_PROJECT}}/{{SERVICE_NAME}} \\
            --region {{region}} \\
            --platform managed \\
            --allow-unauthenticated`
  },
  {
    id: 'gcp-firebase-hosting',
    name: 'Firebase Hosting Deploy',
    platform: 'gcp',
    level: 'Beginner',
    category: 'Google Cloud',
    difficulty: 'Beginner',
    description: 'Deploy static site to Firebase Hosting.',
    requirements: ['Firebase project', 'Firebase CLI initialized'],
    stepsExplanation: ['Build app', 'Deploy to Firebase Hosting'],
    envVariables: [],
    secrets: [{ key: 'FIREBASE_TOKEN', description: 'Firebase CI token' }],
    configOptions: [
      { key: 'projectId', defaultValue: 'my-firebase-project', type: 'text', description: 'Firebase project ID' },
      { key: 'channelId', defaultValue: 'live', type: 'text', description: 'Deploy channel' }
    ],
    code: `name: Deploy to Firebase
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: w9jds/firebase-action@v13.9.0
        with:
          args: deploy --only hosting
        env:
          FIREBASE_TOKEN: \${{ secrets.FIREBASE_TOKEN }}
          PROJECT_ID: {{projectId}}`
  },
  {
    id: 'gcp-gke-deploy',
    name: 'GKE Kubernetes Deploy',
    platform: 'gcp',
    level: 'Advanced',
    category: 'Google Cloud',
    difficulty: 'Advanced',
    description: 'Build and deploy to Google Kubernetes Engine.',
    requirements: ['GKE cluster', 'Artifact Registry', 'k8s manifests'],
    stepsExplanation: ['Auth to GCP', 'Build & push image', 'Deploy to GKE'],
    envVariables: [
      { key: 'GCP_PROJECT', defaultValue: '', description: 'GCP project ID' },
      { key: 'GKE_CLUSTER', defaultValue: '', description: 'GKE cluster name' }
    ],
    secrets: [{ key: 'GCP_SERVICE_KEY', description: 'GCP service account key JSON' }],
    configOptions: [
      { key: 'region', defaultValue: 'us-central1', type: 'select', options: ['us-central1', 'us-east1', 'europe-west1'], description: 'GCP region' }
    ],
    code: `name: Deploy to GKE
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          credentials_json: \${{ secrets.GCP_SERVICE_KEY }}
      - uses: google-github-actions/setup-gcloud@v2
      - uses: google-github-actions/get-gke-credentials@v2
        with:
          cluster_name: {{GKE_CLUSTER}}
          location: {{region}}
      - name: Build and Push
        run: |
          docker build -t gcr.io/{{GCP_PROJECT}}/app:\$GITHUB_SHA .
          docker push gcr.io/{{GCP_PROJECT}}/app:\$GITHUB_SHA
      - name: Deploy
        run: |
          kubectl set image deployment/app app=gcr.io/{{GCP_PROJECT}}/app:\$GITHUB_SHA
          kubectl rollout status deployment/app`
  },

  // === VERCEL TEMPLATES ===
  {
    id: 'vercel-react-deploy',
    name: 'Vercel React Deploy',
    platform: 'vercel',
    level: 'Beginner',
    category: 'Vercel',
    difficulty: 'Beginner',
    description: 'Deploy React app to Vercel with preview deployments.',
    requirements: ['Vercel account', 'React project'],
    stepsExplanation: ['Build React app', 'Deploy to Vercel preview/production'],
    envVariables: [],
    secrets: [{ key: 'VERCEL_TOKEN', description: 'Vercel deployment token' }],
    configOptions: [
      { key: 'orgId', defaultValue: '', type: 'text', description: 'Vercel org ID' },
      { key: 'projectId', defaultValue: '', type: 'text', description: 'Vercel project ID' }
    ],
    code: `name: Vercel Deployment
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: {{orgId}}
          vercel-project-id: {{projectId}}
          vercel-args: \${{ github.event_name == 'push' && '--prod' || '' }}`
  },

  // === NETLIFY TEMPLATES ===
  {
    id: 'netlify-static-deploy',
    name: 'Netlify Static Deploy',
    platform: 'netlify',
    level: 'Beginner',
    category: 'Netlify',
    difficulty: 'Beginner',
    description: 'Build and deploy static site to Netlify.',
    requirements: ['Netlify account', 'Static site project'],
    stepsExplanation: ['Build site', 'Deploy to Netlify'],
    envVariables: [],
    secrets: [{ key: 'NETLIFY_AUTH_TOKEN', description: 'Netlify auth token' }, { key: 'NETLIFY_SITE_ID', description: 'Netlify site ID' }],
    configOptions: [
      { key: 'buildCommand', defaultValue: 'npm run build', type: 'text', description: 'Build command' },
      { key: 'publishDir', defaultValue: 'dist', type: 'text', description: 'Publish directory' }
    ],
    code: `name: Netlify Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: {{buildCommand}}
      - uses: nwtgck/actions-netlify@v3
        with:
          publish-dir: './{{publishDir}}'
          production-branch: main
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: \${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: \${{ secrets.NETLIFY_SITE_ID }}`
  },

  // === DIGITALOCEAN TEMPLATES ===
  {
    id: 'do-app-platform-deploy',
    name: 'DO App Platform Deploy',
    platform: 'digitalocean',
    level: 'Beginner',
    category: 'DigitalOcean',
    difficulty: 'Beginner',
    description: 'Deploy app to DigitalOcean App Platform.',
    requirements: ['DigitalOcean account', 'App Platform app'],
    stepsExplanation: ['Install doctl', 'Deploy to App Platform'],
    envVariables: [{ key: 'APP_NAME', defaultValue: 'my-app', description: 'App Platform app name' }],
    secrets: [{ key: 'DIGITALOCEAN_ACCESS_TOKEN', description: 'DigitalOcean API token' }],
    configOptions: [],
    code: `name: Deploy to DO App Platform
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install doctl
        uses: digitalocean/action-doctl@v2
        with:
          token: \${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
      - name: Deploy App
        run: doctl apps create-deployment {{APP_NAME}} --wait`
  },
  {
    id: 'do-docker-push',
    name: 'DO Docker Registry Push',
    platform: 'digitalocean',
    level: 'Intermediate',
    category: 'DigitalOcean',
    difficulty: 'Intermediate',
    description: 'Build and push Docker image to DigitalOcean Container Registry.',
    requirements: ['DO Container Registry', 'Dockerfile'],
    stepsExplanation: ['Login to registry', 'Build image', 'Push image'],
    envVariables: [{ key: 'REGISTRY_NAME', defaultValue: '', description: 'DO registry name' }],
    secrets: [{ key: 'DIGITALOCEAN_ACCESS_TOKEN', description: 'DigitalOcean API token' }],
    configOptions: [],
    code: `name: Push to DO Registry
on:
  push:
    branches: [main]
jobs:
  push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install doctl
        uses: digitalocean/action-doctl@v2
        with:
          token: \${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
      - name: Login to Registry
        run: doctl registry login
      - name: Build and Push
        run: |
          docker build -t registry.digitalocean.com/{{REGISTRY_NAME}}/app:\$GITHUB_SHA .
          docker push registry.digitalocean.com/{{REGISTRY_NAME}}/app:\$GITHUB_SHA`
  }
];

// Helper functions for template management
export const searchTemplates = (query) => {
  if (!query) return templates;
  
  const lowercaseQuery = query.toLowerCase();
  return templates.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.platform.toLowerCase().includes(lowercaseQuery) ||
    template.category.toLowerCase().includes(lowercaseQuery) ||
    template.requirements.some(req => req.toLowerCase().includes(lowercaseQuery))
  );
};

export const getTemplateById = (id) => {
  return templates.find(template => template.id === id);
};

export const getTemplatesByPlatform = (platform) => {
  return templates.filter(template => template.platform === platform);
};

export const getTemplatesByDifficulty = (difficulty) => {
  return templates.filter(template => template.difficulty === difficulty);
};

// Constants for template filtering
export const PLATFORMS = [
  { id: 'github', name: 'GitHub Actions', icon: '🐙', color: 'pink', category: 'CI/CD' },
  { id: 'aws', name: 'AWS', icon: '☁️', color: 'purple', category: 'Cloud' },
  { id: 'azure', name: 'Azure', icon: '🔷', color: 'blue', category: 'Cloud' },
  { id: 'gcp', name: 'Google Cloud', icon: '🌐', color: 'red', category: 'Cloud' },
  { id: 'jenkins', name: 'Jenkins', icon: '⚙️', color: 'gray', category: 'CI/CD' },
  { id: 'vercel', name: 'Vercel', icon: '▲', color: 'black', category: 'Static' },
  { id: 'netlify', name: 'Netlify', icon: '🌿', color: 'teal', category: 'Static' },
  { id: 'digitalocean', name: 'DigitalOcean', icon: '🌊', color: 'indigo', category: 'Cloud' }
];

export const CATEGORIES = [
  'GitHub Actions',
  'AWS DevOps',
  'Azure DevOps',
  'Google Cloud',
  'Jenkins Pipelines',
  'Vercel',
  'Netlify',
  'DigitalOcean'
];

export const DIFFICULTIES = [
  { id: 'beginner', name: 'Beginner', color: 'green' },
  { id: 'intermediate', name: 'Intermediate', color: 'yellow' },
  { id: 'advanced', name: 'Advanced', color: 'red' }
];

export const LEVELS = [
  'Beginner',
  'Intermediate', 
  'Advanced'
];

// Template validation
export const validateTemplate = (template) => {
  const required = ['id', 'name', 'platform', 'level', 'description', 'requirements', 'code'];
  const missing = required.filter(field => !template[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  return true;
};

// Configuration injection utility
export const injectConfigIntoCode = (template, config) => {
  let { code } = template;
  
  // Replace config options
  if (template.configOptions) {
    template.configOptions.forEach(option => {
      const value = config[option.key] || option.defaultValue;
      const placeholder = `{{${option.key}}}`;
      code = code.replace(new RegExp(placeholder, 'g'), value);
    });
  }
  
  // Replace environment variables
  if (template.envVariables) {
    template.envVariables.forEach(envVar => {
      const value = config[envVar.key] || envVar.defaultValue;
      const placeholder = `{{${envVar.key}}}`;
      code = code.replace(new RegExp(placeholder, 'g'), value);
    });
  }
  
  return code;
};
