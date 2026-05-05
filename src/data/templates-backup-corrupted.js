// Comprehensive CI/CD Template Marketplace for PipeLinePro
// Production-ready templates across multiple platforms

export const templates = [
  // === GITHUB ACTIONS TEMPLATES (10) ===
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
      - run: npm run lint
      - run: npm test
      - run: npm run build`
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
      - run: npm test
      - run: {{buildCommand}}
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
    secrets: ['TURBO_TOKEN'],
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
          node-version: 20
      - run: npm install
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
    code: `name: Matrix CI
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
      - run: npm install
      - run: npm test`
  },
  {
    id: 'gh-lint-test',
    name: 'Lint + Test Pipeline',
    platform: 'github',
    level: 'Beginner',
    category: 'GitHub Actions',
    difficulty: 'Beginner',
    description: 'Fast linting and unit testing for every PR.',
    requirements: ['ESLint/Jest configured'],
    stepsExplanation: [
      'Checkout',
      'Lint code',
      'Run unit tests'
    ],
    envVariables: [],
    secrets: [],
    code: `name: PR Quality
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm run lint
      - run: npm test`
  },
  {
    id: 'gh-pr-validation',
    name: 'PR Validation',
    platform: 'github',
    level: 'Intermediate',
    category: 'GitHub Actions',
    difficulty: 'Intermediate',
    description: 'Validate PR metadata and branch naming.',
    requirements: ['GitHub repository'],
    stepsExplanation: [
      'Validate PR title',
      'Check branch name conventions'
    ],
    envVariables: [],
    secrets: [],
    code: `name: PR Validation
on: [pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`
  },
  {
    id: 'gh-cron',
    name: 'Scheduled (Cron) Pipeline',
    platform: 'github',
    level: 'Intermediate',
    category: 'GitHub Actions',
    difficulty: 'Intermediate',
    description: 'Run scheduled maintenance or nightly builds.',
    requirements: ['Defined cron schedule'],
    stepsExplanation: [
      'Trigger at midnight',
      'Run audit and security scans'
    ],
    envVariables: [],
    secrets: [],
    code: `name: Nightly Audit
on:
  schedule:
    - cron: '0 0 * * *'
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit`
  },
  {
    id: 'gh-cache',
    name: 'Cache Optimization',
    platform: 'github',
    level: 'Advanced',
    category: 'GitHub Actions',
    difficulty: 'Advanced',
    description: 'Highly optimized caching for fast CI cycles.',
    requirements: ['Large dependencies'],
    stepsExplanation: [
      'Setup custom cache keys',
      'Restore/Save cache selectively'
    ],
    envVariables: [],
    secrets: [],
    code: `name: Optimized CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/cache@v3
        with:
          path: ~/.npm
          key: \${{ runner.os }}-node-\${{ hashFiles('**/package-lock.json') }}
      - run: npm install`
  },
  {
    id: 'gh-security',
    name: 'Security Scan',
    platform: 'github',
    level: 'Advanced',
    category: 'GitHub Actions',
    difficulty: 'Advanced',
    description: 'SAST and dependency vulnerability scanning.',
    requirements: ['GitHub repository'],
    stepsExplanation: [
      'Initialize CodeQL',
      'Perform security analysis'
    ],
    envVariables: [],
    secrets: [],
    code: `name: Security Scan
on: [push]
jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript
      - uses: github/codeql-action/analyze@v3`
  },

  // === AWS TEMPLATES (15) ===
  {
    id: 'aws-ec2-deploy',
    name: 'EC2 Deployment',
    platform: 'aws',
    level: 'Intermediate',
    category: 'AWS DevOps',
    difficulty: 'Intermediate',
    description: 'Deploy app to EC2 via SSH.',
    requirements: ['EC2 Instance', 'SSH Keys', 'IAM Roles'],
    stepsExplanation: [
      'Build app',
      'SCP to EC2',
      'Restart app service'
    ],
    envVariables: ['EC2_HOST'],
    secrets: ['SSH_KEY'],
    code: `name: EC2 Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm build
      - uses: appleboy/scp-action@master
        with:
          host: \${{ secrets.HOST }}
          key: \${{ secrets.KEY }}
          source: "dist/*"
          target: "/var/www/app"`
  },
  {
    id: 'aws-s3-hosting',
    name: 'S3 Static Hosting',
    platform: 'aws',
    level: 'Beginner',
    category: 'AWS DevOps',
    difficulty: 'Beginner',
    description: 'Deploy static site to S3 with CloudFront.',
    requirements: ['S3 Bucket', 'CloudFront Dist ID'],
    stepsExplanation: [
      'Build assets',
      'Sync to S3',
      'Invalidate CloudFront cache'
    ],
    envVariables: ['S3_BUCKET'],
    secrets: ['AWS_KEY', 'AWS_SECRET'],
    code: `name: S3 Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm build
      - uses: jakejarvis/s3-sync-action@master
        env:
          AWS_S3_BUCKET: \${{ secrets.S3_BUCKET }}
          SOURCE_DIR: 'dist'`
  },
  {
    id: 'aws-lambda',
    name: 'Lambda Deployment',
    platform: 'aws',
    level: 'Intermediate',
    category: 'AWS DevOps',
    difficulty: 'Intermediate',
    description: 'Deploy Serverless functions to AWS Lambda.',
    requirements: ['AWS Lambda', 'IAM permissions'],
    stepsExplanation: [
      'Package function',
      'Update Lambda code'
    ],
    envVariables: ['LAMBDA_NAME'],
    secrets: ['AWS_KEY', 'AWS_SECRET'],
    code: `name: Lambda Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: zip -r func.zip .
      - run: aws lambda update-function-code --function-name MyFunc --zip-file fileb://func.zip`
  },
  {
    id: 'aws-ecs',
    name: 'ECS Docker Deployment',
    platform: 'aws',
    level: 'Advanced',
    category: 'AWS DevOps',
    difficulty: 'Advanced',
    description: 'Deploy containerized app to Amazon ECS.',
    requirements: ['ECR Repo', 'ECS Cluster'],
    stepsExplanation: [
      'Login to ECR',
      'Build and Push image',
      'Update ECS service'
    ],
    envVariables: ['ECR_REPO'],
    secrets: ['AWS_KEY', 'AWS_SECRET'],
    code: `name: ECS Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/amazon-ecr-login@v1
      - run: |
          docker build -t $ECR_REGISTRY/$ECR_REPO:latest .
          docker push $ECR_REGISTRY/$ECR_REPO:latest`
  },
  {
    id: 'aws-eks',
    name: 'EKS Kubernetes Deployment',
    platform: 'aws',
    level: 'Advanced',
    category: 'AWS DevOps',
    difficulty: 'Advanced',
    description: 'Deploy to Amazon EKS cluster using Helm.',
    requirements: ['EKS Cluster', 'Helm charts'],
    stepsExplanation: [
      'Setup Kubeconfig',
      'Helm upgrade/install'
    ],
    envVariables: ['EKS_CLUSTER'],
    secrets: ['AWS_KEY', 'AWS_SECRET'],
    code: `name: EKS Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: aws eks update-kubeconfig --name $CLUSTER_NAME
      - run: helm upgrade --install my-app ./charts`
  },
  {
    id: 'aws-codebuild',
    name: 'CodeBuild Pipeline',
    platform: 'aws',
    level: 'Intermediate',
    category: 'AWS DevOps',
    difficulty: 'Intermediate',
    description: 'AWS native build service configuration.',
    requirements: ['AWS CodeBuild project'],
    stepsExplanation: [
      'Trigger build',
      'Run buildspec.yml'
    ],
    envVariables: [],
    secrets: [],
    code: `version: 0.2
phases:
  build:
    commands:
      - npm install
      - npm run build`
  },
  {
    id: 'aws-codedeploy',
    name: 'CodeDeploy Pipeline',
    platform: 'aws',
    level: 'Intermediate',
    category: 'AWS DevOps',
    difficulty: 'Intermediate',
    description: 'Automate deployments to EC2 or Lambda.',
    requirements: ['CodeDeploy App', 'appspec.yml'],
    stepsExplanation: [
      'Prepare revision',
      'Create deployment'
    ],
    envVariables: [],
    secrets: [],
    code: `version: 0.0
os: linux
files:
  - source: /index.html
    destination: /var/www/html/`
  },
  {
    id: 'aws-codepipeline',
    name: 'CodePipeline Multi-stage',
    platform: 'aws',
    level: 'Advanced',
    category: 'AWS DevOps',
    difficulty: 'Advanced',
    description: 'Full CI/CD orchestration with AWS native tools.',
    requirements: ['CodePipeline setup'],
    stepsExplanation: [
      'Source stage',
      'Build stage',
      'Deploy stage'
    ],
    envVariables: [],
    secrets: [],
    code: `Pipeline:
  Type: AWS::CodePipeline::Pipeline
  Properties:
    Stages:
      - Name: Source
      - Name: Build
      - Name: Deploy`
  },
  {
    id: 'aws-apigw-lambda',
    name: 'API Gateway + Lambda',
    platform: 'aws',
    level: 'Intermediate',
    category: 'AWS DevOps',
    difficulty: 'Intermediate',
    description: 'Deploy API Gateway integrated with Lambda.',
    requirements: ['AWS Account'],
    stepsExplanation: [
      'Deploy Lambda',
      'Configure API Gateway'
    ],
    envVariables: [],
    secrets: ['AWS_KEY', 'AWS_SECRET'],
    code: `name: API Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: sls deploy --stage prod`
  },
  {
    id: 'aws-rds-migration',
    name: 'RDS Migration',
    platform: 'aws',
    level: 'Advanced',
    category: 'AWS DevOps',
    difficulty: 'Advanced',
    description: 'Run database migrations against RDS.',
    requirements: ['RDS Instance', 'VPC connectivity'],
    stepsExplanation: [
      'Setup migration tool',
      'Execute migrations'
    ],
    envVariables: ['DB_HOST'],
    secrets: ['DB_PASS'],
    code: `name: DB Migrate
on: [push]
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - run: npx prisma migrate deploy`
  },
  {
    id: 'aws-cloudfront',
    name: 'CloudFront + S3',
    platform: 'aws',
    level: 'Intermediate',
    category: 'AWS DevOps',
    difficulty: 'Intermediate',
    description: 'Optimized static hosting with CDN.',
    requirements: ['S3 Bucket', 'CloudFront'],
    stepsExplanation: [
      'Sync S3',
      'Invalidate CloudFront'
    ],
    envVariables: ['DIST_ID'],
    secrets: ['AWS_KEY'],
    code: `name: CDN Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: aws s3 sync ./build s3://my-bucket
      - run: aws cloudfront create-invalidation --paths "/*"`
  },
  {
    id: 'aws-blue-green',
    name: 'Blue-Green Deployment',
    platform: 'aws',
    level: 'Advanced',
    category: 'AWS DevOps',
    difficulty: 'Advanced',
    description: 'Zero-downtime Blue-Green rollout.',
    requirements: ['ALB', 'Target Groups'],
    stepsExplanation: [
      'Deploy Green',
      'Health check',
      'Switch traffic'
    ],
    envVariables: [],
    secrets: [],
    code: `name: Blue-Green
on: [workflow_dispatch]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: # Custom swap logic`
  },
  {
    id: 'aws-canary',
    name: 'Canary Deployment',
    platform: 'aws',
    level: 'Advanced',
    category: 'AWS DevOps',
    difficulty: 'Advanced',
    description: 'Traffic-shifting Canary rollout.',
    requirements: ['App Mesh or Lambda Aliases'],
    stepsExplanation: [
      'Deploy v2',
      'Route 10% traffic',
      'Full rollout'
    ],
    envVariables: [],
    secrets: [],
    code: `name: Canary
on: [push]
jobs:
  rollout:
    runs-on: ubuntu-latest
    steps:
      - run: aws lambda update-alias --routing-config '{"AdditionalVersionWeights": {"2": 0.1}}'`
  },
  {
    id: 'aws-vpc-iam',
    name: 'VPC + IAM Infrastructure',
    platform: 'aws',
    level: 'Advanced',
    category: 'AWS DevOps',
    difficulty: 'Advanced',
    description: 'Provision networking using Terraform.',
    requirements: ['Terraform Cloud'],
    stepsExplanation: [
      'Terraform Init',
      'Terraform Apply'
    ],
    envVariables: [],
    secrets: ['AWS_KEY'],
    code: `name: Infra
on: [push]
jobs:
  tf:
    runs-on: ubuntu-latest
    steps:
      - uses: hashicorp/setup-terraform@v2
      - run: terraform apply -auto-approve`
  },
  {
    id: 'aws-full-cicd',
    name: 'Full AWS CI/CD',
    platform: 'aws',
    level: 'Advanced',
    category: 'AWS DevOps',
    difficulty: 'Advanced',
    description: 'End-to-end Infrastructure and App pipeline.',
    requirements: ['Complex setup'],
    stepsExplanation: [
      'Infra Deploy',
      'App Build',
      'App Deploy'
    ],
    envVariables: [],
    secrets: [],
    code: `name: Full Pipeline
on: [push]
jobs:
  infra:
    uses: ./.github/workflows/tf.yml
  app:
    needs: infra
    uses: ./.github/workflows/app.yml`
  },

  // === JENKINS PIPELINES (5) ===
  {
    id: 'jenkins-basic',
    name: 'Basic Jenkins Pipeline',
    platform: 'jenkins',
    level: 'Beginner',
    category: 'Jenkins Pipelines',
    difficulty: 'Beginner',
    description: 'Simple build-test-deploy Jenkinsfile.',
    requirements: ['Jenkins server'],
    stepsExplanation: [
      'Checkout',
      'Install',
      'Test',
      'Build'
    ],
    envVariables: [],
    secrets: [],
    code: `pipeline {
    agent any
    stages {
        stage('Build') { steps { sh 'npm install' } }
        stage('Test') { steps { sh 'npm test' } }
    }
}`
  },
  {
    id: 'jenkins-multi-stage',
    name: 'Multi-stage Pipeline',
    platform: 'jenkins',
    level: 'Intermediate',
    category: 'Jenkins Pipelines',
    difficulty: 'Intermediate',
    description: 'Pipeline with approval and environments.',
    requirements: ['Jenkins server'],
    stepsExplanation: [
      'Build',
      'Deploy Dev',
      'Wait Approval',
      'Deploy Prod'
    ],
    envVariables: ['ENV'],
    secrets: [],
    code: `pipeline {
    agent any
    stages {
        stage('Build') { steps { sh 'npm build' } }
        stage('Deploy Dev') { steps { sh './deploy.sh dev' } }
        stage('Approval') { input { message "Deploy?" } }
        stage('Deploy Prod') { steps { sh './deploy.sh prod' } }
    }
}`
  },
  {
    id: 'jenkins-docker',
    name: 'Dockerized Jenkins',
    platform: 'jenkins',
    level: 'Intermediate',
    category: 'Jenkins Pipelines',
    difficulty: 'Intermediate',
    description: 'Run pipeline inside Docker agent.',
    requirements: ['Docker on Jenkins'],
    stepsExplanation: [
      'Define Docker agent',
      'Run inside container'
    ],
    envVariables: [],
    secrets: [],
    code: `pipeline {
    agent { docker { image 'node:20-alpine' } }
    stages {
        stage('Test') { steps { sh 'npm test' } }
    }
}`
  },
  {
    id: 'jenkins-k8s',
    name: 'Kubernetes Jenkins',
    platform: 'jenkins',
    level: 'Advanced',
    category: 'Jenkins Pipelines',
    difficulty: 'Advanced',
    description: 'Deploy to K8s from Jenkins.',
    requirements: ['K8s Cluster', 'Jenkins secret'],
    stepsExplanation: [
      'Load Kubeconfig',
      'Kubectl apply'
    ],
    envVariables: [],
    secrets: ['KUBECONFIG'],
    code: `pipeline {
    agent any
    stages {
        stage('Deploy') {
            steps {
                withKubeConfig([credentialsId: 'k8s']) {
                    sh 'kubectl apply -f k8s/'
                }
            }
        }
    }
}`
  },
  {
    id: 'jenkins-parallel',
    name: 'Parallel Jenkins',
    platform: 'jenkins',
    level: 'Advanced',
    category: 'Jenkins Pipelines',
    difficulty: 'Advanced',
    description: 'Parallel test execution in Jenkins.',
    requirements: ['Jenkins executors'],
    stepsExplanation: [
      'Parallel Test',
      'Parallel Lint'
    ],
    envVariables: [],
    secrets: [],
    code: `pipeline {
    agent any
    stages {
        stage('Checks') {
            parallel {
                stage('Test') { steps { sh 'npm test' } }
                stage('Lint') { steps { sh 'npm run lint' } }
            }
        }
    }
}`
  }
];

export const PLATFORMS = [
  { value: 'github', label: 'GitHub Actions', icon: '🐙' },
  { value: 'aws', label: 'AWS DevOps', icon: '☁️' },
  { value: 'jenkins', label: 'Jenkins', icon: '🔧' },
  { value: 'docker', label: 'Docker', icon: '🐳' },
  { value: 'kubernetes', label: 'Kubernetes', icon: '☸️' },
  { value: 'serverless', label: 'Serverless', icon: '⚡' }
];

export const CATEGORIES = [
  { value: 'GitHub Actions', label: 'GitHub Actions' },
  { value: 'AWS DevOps', label: 'AWS DevOps' },
  { value: 'Jenkins Pipelines', label: 'Jenkins Pipelines' },
  { value: 'Docker & Containers', label: 'Docker & Containers' },
  { value: 'Kubernetes', label: 'Kubernetes' },
  { value: 'Serverless', label: 'Serverless' }
];

export const DIFFICULTIES = [
  { value: 'Beginner', label: 'Beginner', color: 'green' },
  { value: 'Intermediate', label: 'Intermediate', color: 'yellow' },
  { value: 'Advanced', label: 'Advanced', color: 'red' }
];

export const getTemplatesByPlatform = (platform) => templates.filter(t => t.platform === platform);
export const getTemplatesByCategory = (category) => templates.filter(t => t.category === category);
export const getTemplatesByDifficulty = (diff) => templates.filter(t => t.difficulty === diff);
export const getTemplateById = (id) => templates.find(t => t.id === id);
export const searchTemplates = (query) => {
  const q = query.toLowerCase();
  return templates.filter(t => 
    t.name.toLowerCase().includes(q) || 
    t.description.toLowerCase().includes(q)
  );
};
