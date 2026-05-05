export const templates = {
  github: {
    node: {
      docker: `name: Node.js CI/CD Pipeline
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test
    - name: Run linting
      run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Build application
      run: npm run build
    - name: Build Docker image
      run: |
        docker build -t myapp:latest .
        docker tag myapp:latest myapp:latest
    - name: Push to registry
      run: |
        echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
        docker push myapp:latest
        docker push myapp:latest`,

      'aws-ec2': `name: Node.js AWS EC2 Deployment
on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test
    - name: Build application
      run: npm run build
    - name: Create deployment package
      run: |
        tar -czf app.tar.gz dist/ package.json package-lock.json
    - name: Upload to S3
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: $AWS_ACCESS_KEY_ID
        aws-secret-access-key: $AWS_SECRET_ACCESS_KEY
        aws-region: us-east-1
    - run: aws s3 cp app.tar.gz s3://my-deployment-bucket/`,

      kubernetes: `name: Node.js Kubernetes Deployment
on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: $AWS_ACCESS_KEY_ID
        aws-secret-access-key: $AWS_SECRET_ACCESS_KEY
        aws-region: us-east-1
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v2
    - name: Build, tag, and push image to Amazon ECR
      env:
        ECR_REGISTRY: $ECR_REGISTRY
        ECR_REPOSITORY: myapp
        IMAGE_TAG: latest
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG`,

      'static-hosting': `name: Node.js Static Hosting
on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test
    - name: Build static files
      run: npm run build
    - name: Deploy to Netlify
      uses: netlify/actions/cli@master
      env:
        NETLIFY_AUTH_TOKEN: $NETLIFY_AUTH_TOKEN
        NETLIFY_SITE_ID: $NETLIFY_SITE_ID
      with:
        args: deploy --prod --dir=dist`
    },
    
    java: {
      docker: `name: Java CI/CD Pipeline
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
    - name: Cache Maven packages
      uses: actions/cache@v3
      with:
        path: ~/.m2
        key: $RUNNER_OS-m2-$HASH_FILES
    - name: Run tests
      run: mvn test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
    - name: Build application
      run: mvn clean package -DskipTests
    - name: Build Docker image
      run: |
        docker build -t myapp:latest .
        docker tag myapp:latest myapp:latest`,

      'aws-ec2': `name: Java AWS EC2 Deployment
on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
    - name: Run tests
      run: mvn test
    - name: Build application
      run: mvn clean package -DskipTests
    - name: Create deployment package
      run: |
        mkdir deploy
        cp target/*.jar deploy/
        tar -czf app.tar.gz deploy/`,

      kubernetes: `name: Java Kubernetes Deployment
on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
    - name: Run tests
      run: mvn test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: $AWS_ACCESS_KEY_ID
        aws-secret-access-key: $AWS_SECRET_ACCESS_KEY
        aws-region: us-east-1
    - name: Build application
      run: mvn clean package -DskipTests
    - name: Build and push Docker image
      run: |
        docker build -t myapp:latest .
        docker push myapp:latest`,

      'static-hosting': `name: Java Static Hosting
on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
    - name: Run tests
      run: mvn test
    - name: Build static site
      run: mvn clean package site
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: $GITHUB_TOKEN
        publish_dir: ./target/site`
    },
    
    python: {
      docker: `name: Python CI/CD Pipeline
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Set up Python 3.10
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install pytest flake8
    - name: Lint with flake8
      run: |
        flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
    - name: Test with pytest
      run: pytest

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Set up Python 3.10
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    - name: Build Docker image
      run: |
        docker build -t myapp:latest .
        docker tag myapp:latest myapp:latest`,

      'aws-ec2': `name: Python AWS EC2 Deployment
on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Set up Python 3.10
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    - name: Run tests
      run: pytest
    - name: Create deployment package
      run: |
        mkdir deploy
        cp -r app/ deploy/
        cp requirements.txt deploy/
        tar -czf app.tar.gz deploy/`,

      kubernetes: `name: Python Kubernetes Deployment
on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Set up Python 3.10
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    - name: Test with pytest
      run: pytest

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: $AWS_ACCESS_KEY_ID
        aws-secret-access-key: $AWS_SECRET_ACCESS_KEY
        aws-region: us-east-1
    - name: Build and push Docker image
      run: |
        docker build -t myapp:latest .
        docker push myapp:latest`,

      'static-hosting': `name: Python Static Hosting
on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Set up Python 3.10
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install sphinx
    - name: Build documentation
      run: sphinx-build -b html docs/ docs/_build/
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: $GITHUB_TOKEN
        publish_dir: ./docs/_build`
    },
    
    react: {
      docker: `name: React CI/CD Pipeline
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test -- --coverage --watchAll=false
    - name: Run linting
      run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Build application
      run: npm run build
    - name: Build Docker image
      run: |
        docker build -t myapp:latest .
        docker tag myapp:latest myapp:latest`,

      'aws-ec2': `name: React AWS EC2 Deployment
on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test -- --coverage --watchAll=false
    - name: Build application
      run: npm run build
    - name: Create deployment package
      run: |
        mkdir deploy
        cp -r build/ deploy/
        cp package.json deploy/
        tar -czf app.tar.gz deploy/`,

      kubernetes: `name: React Kubernetes Deployment
on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test -- --coverage --watchAll=false

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: $AWS_ACCESS_KEY_ID
        aws-secret-access-key: $AWS_SECRET_ACCESS_KEY
        aws-region: us-east-1
    - name: Build application
      run: npm run build
    - name: Build and push Docker image
      run: |
        docker build -t myapp:latest .
        docker push myapp:latest`,

      'static-hosting': `name: React Static Hosting
on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test -- --coverage --watchAll=false
    - name: Build static files
      run: npm run build
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: $VERCEL_TOKEN
        vercel-org-id: $ORG_ID
        vercel-project-id: $PROJECT_ID
        vercel-args: '--prod'
        working-directory: ./build`
    }
  },
  
  aws: {
    node: {
      docker: `version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - npm ci
  pre_build:
    commands:
      - npm run lint
      - npm test
  build:
    commands:
      - npm run build
      - docker build -t myapp:latest .
      - docker tag myapp:latest myapp:latest
  post_build:
    commands:
      - echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
      - docker push myapp:latest
      - docker push myapp:latest
artifacts:
  files: '**/*'`,

      'aws-ec2': `version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - npm ci
  pre_build:
    commands:
      - npm run lint
      - npm test
  build:
    commands:
      - npm run build
      - mkdir deploy
      - cp -r dist/ deploy/
      - cp package.json deploy/
      - cp package-lock.json deploy/
  post_build:
    commands:
      - tar -czf app.tar.gz deploy/
      - aws s3 cp app.tar.gz s3://my-deployment-bucket/
artifacts:
  files: '**/*'`,

      kubernetes: `version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - npm ci
  pre_build:
    commands:
      - npm run lint
      - npm test
  build:
    commands:
      - npm run build
      - docker build -t myapp:latest .
      - docker push myapp:latest
  post_build:
    commands:
      - aws eks update-kubeconfig --name my-cluster
      - kubectl set image deployment/myapp myapp=myapp:latest
      - kubectl rollout status deployment/myapp
artifacts:
  files: '**/*'`,

      'static-hosting': `version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - npm ci
  pre_build:
    commands:
      - npm run lint
      - npm test
  build:
    commands:
      - npm run build
  post_build:
    commands:
      - aws s3 sync dist/ s3://my-static-bucket/ --delete
      - aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
artifacts:
  files: '**/*'`
    },
    
    java: {
      docker: `version: 0.2
phases:
  install:
    runtime-versions:
      java: corretto17
    commands:
      - mvn dependency:resolve
  pre_build:
    commands:
      - mvn compile
      - mvn test
  build:
    commands:
      - mvn package -DskipTests
      - docker build -t myapp:latest .
      - docker tag myapp:latest myapp:latest
  post_build:
    commands:
      - echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
      - docker push myapp:latest
      - docker push myapp:latest
artifacts:
  files: '**/*'`,

      'aws-ec2': `version: 0.2
phases:
  install:
    runtime-versions:
      java: corretto17
    commands:
      - mvn dependency:resolve
  pre_build:
    commands:
      - mvn compile
      - mvn test
  build:
    commands:
      - mvn package -DskipTests
      - mkdir deploy
      - cp target/*.jar deploy/
      - cp -r scripts/ deploy/ || true
  post_build:
    commands:
      - tar -czf app.tar.gz deploy/
      - aws s3 cp app.tar.gz s3://my-deployment-bucket/
artifacts:
  files: '**/*'`,

      kubernetes: `version: 0.2
phases:
  install:
    runtime-versions:
      java: corretto17
    commands:
      - mvn dependency:resolve
  pre_build:
    commands:
      - mvn compile
      - mvn test
  build:
    commands:
      - mvn package -DskipTests
      - docker build -t myapp:latest .
      - docker push myapp:latest
  post_build:
    commands:
      - aws eks update-kubeconfig --name my-cluster
      - kubectl set image deployment/myapp myapp=myapp:latest
      - kubectl rollout status deployment/myapp
artifacts:
  files: '**/*'`,

      'static-hosting': `version: 0.2
phases:
  install:
    runtime-versions:
      java: corretto17
    commands:
      - mvn dependency:resolve
  pre_build:
    commands:
      - mvn compile
      - mvn test
  build:
    commands:
      - mvn package site
  post_build:
    commands:
      - aws s3 sync target/site/ s3://my-static-bucket/ --delete
      - aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
artifacts:
  files: '**/*'`
    },
    
    python: {
      docker: `version: 0.2
phases:
  install:
    runtime-versions:
      python: 3.10
    commands:
      - pip install -r requirements.txt
  pre_build:
    commands:
      - flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
      - pytest
  build:
    commands:
      - docker build -t myapp:latest .
      - docker tag myapp:latest myapp:latest
  post_build:
    commands:
      - echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
      - docker push myapp:latest
      - docker push myapp:latest
artifacts:
  files: '**/*'`,

      'aws-ec2': `version: 0.2
phases:
  install:
    runtime-versions:
      python: 3.10
    commands:
      - pip install -r requirements.txt
  pre_build:
    commands:
      - flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
      - pytest
  build:
    commands:
      - mkdir deploy
      - cp -r app/ deploy/
      - cp requirements.txt deploy/
      - cp scripts/ deploy/ || true
  post_build:
    commands:
      - tar -czf app.tar.gz deploy/
      - aws s3 cp app.tar.gz s3://my-deployment-bucket/
artifacts:
  files: '**/*'`,

      kubernetes: `version: 0.2
phases:
  install:
    runtime-versions:
      python: 3.10
    commands:
      - pip install -r requirements.txt
  pre_build:
    commands:
      - flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
      - pytest
  build:
    commands:
      - docker build -t myapp:latest .
      - docker push myapp:latest
  post_build:
    commands:
      - aws eks update-kubeconfig --name my-cluster
      - kubectl set image deployment/myapp myapp=myapp:latest
      - kubectl rollout status deployment/myapp
artifacts:
  files: '**/*'`,

      'static-hosting': `version: 0.2
phases:
  install:
    runtime-versions:
      python: 3.10
    commands:
      - pip install -r requirements.txt
      - pip install sphinx
  pre_build:
    commands:
      - flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
      - pytest
  build:
    commands:
      - sphinx-build -b html docs/ docs/_build/
  post_build:
    commands:
      - aws s3 sync docs/_build/ s3://my-static-bucket/ --delete
      - aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
artifacts:
  files: '**/*'`
    },
    
    react: {
      docker: `version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - npm ci
  pre_build:
    commands:
      - npm run lint
      - npm test -- --coverage --watchAll=false
  build:
    commands:
      - npm run build
      - docker build -t myapp:latest .
      - docker tag myapp:latest myapp:latest
  post_build:
    commands:
      - echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
      - docker push myapp:latest
      - docker push myapp:latest
artifacts:
  files: '**/*'`,

      'aws-ec2': `version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - npm ci
  pre_build:
    commands:
      - npm run lint
      - npm test -- --coverage --watchAll=false
  build:
    commands:
      - npm run build
      - mkdir deploy
      - cp -r build/ deploy/
      - cp package.json deploy/
      - cp nginx.conf deploy/ || true
  post_build:
    commands:
      - tar -czf app.tar.gz deploy/
      - aws s3 cp app.tar.gz s3://my-deployment-bucket/
artifacts:
  files: '**/*'`,

      kubernetes: `version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - npm ci
  pre_build:
    commands:
      - npm run lint
      - npm test -- --coverage --watchAll=false
  build:
    commands:
      - npm run build
      - docker build -t myapp:latest .
      - docker push myapp:latest
  post_build:
    commands:
      - aws eks update-kubeconfig --name my-cluster
      - kubectl set image deployment/myapp myapp=myapp:latest
      - kubectl rollout status deployment/myapp
artifacts:
  files: '**/*'`,

      'static-hosting': `version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - npm ci
  pre_build:
    commands:
      - npm run lint
      - npm test -- --coverage --watchAll=false
  build:
    commands:
      - npm run build
  post_build:
    commands:
      - aws s3 sync build/ s3://my-static-bucket/ --delete
      - aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
artifacts:
  files: '**/*'`
    }
  },
  
  jenkins: {
    node: {
      docker: `pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-registry.com'
        DOCKER_IMAGE = 'myapp'
        DOCKER_TAG = "latest"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Node.js') {
            steps {
                sh 'node --version'
                sh 'npm --version'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
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
                    docker.build(DOCKER_IMAGE + ':' + DOCKER_TAG)
                    docker.build(DOCKER_IMAGE + ':latest')
                }
            }
        }
        
        stage('Docker Push') {
            steps {
                script {
                    withDockerRegistry([url: "https://" + DOCKER_REGISTRY, credentialsId: 'docker-creds']) {
                        docker.image(DOCKER_IMAGE + ':' + DOCKER_TAG).push()
                        docker.image(DOCKER_IMAGE + ':latest').push()
                    }
                }
            }
        }
    }
}`,

      'aws-ec2': `pipeline {
    agent any
    
    environment {
        S3_BUCKET = 'my-deployment-bucket'
        EC2_INSTANCE = 'i-1234567890abcdef0'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Node.js') {
            steps {
                sh 'node --version'
                sh 'npm --version'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Package') {
            steps {
                sh '''
                    mkdir deploy
                    cp -r dist/ deploy/
                    cp package.json deploy/
                    cp package-lock.json deploy/
                    tar -czf app.tar.gz deploy/
                '''
            }
        }
        
        stage('Upload to S3') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    s3Upload(file: 'app.tar.gz', bucket: env.S3_BUCKET)
                }
            }
        }
        
        stage('Deploy to EC2') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    sh '''
                        aws s3 cp s3:// + S3_BUCKET + /app.tar.gz .
                        aws ec2 send-command \\
                            --instance-ids + EC2_INSTANCE \\
                            --document-name "AWS-RunShellScript" \\
                            --parameters commands=["wget https://" + S3_BUCKET + ".s3.amazonaws.com/app.tar.gz", "tar -xzf app.tar.gz", "cd deploy && npm install && npm start"]
                    '''
                }
            }
        }
    }
}`,

      kubernetes: `pipeline {
    agent any
    
    environment {
        ECR_REGISTRY = '123456789012.dkr.ecr.us-east-1.amazonaws.com'
        ECR_REPO = 'myapp'
        EKS_CLUSTER = 'my-cluster'
        DOCKER_TAG = "latest"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Node.js') {
            steps {
                sh 'node --version'
                sh 'npm --version'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
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
                    docker.build(ECR_REGISTRY + '/' + ECR_REPO + ':' + DOCKER_TAG)
                }
            }
        }
        
        stage('ECR Login') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    sh 'aws ecr get-login --no-include-email | sh'
                }
            }
        }
        
        stage('Docker Push') {
            steps {
                script {
                    docker.image(ECR_REGISTRY + '/' + ECR_REPO + ':' + DOCKER_TAG).push()
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    sh '''
                        aws eks update-kubeconfig --name + EKS_CLUSTER
                        kubectl set image deployment/myapp myapp=ECR_REGISTRY + '/' + ECR_REPO + ':' + DOCKER_TAG
                        kubectl rollout status deployment/myapp
                    '''
                }
            }
        }
    }
}`,

      'static-hosting': `pipeline {
    agent any
    
    environment {
        S3_BUCKET = 'my-static-bucket'
        CLOUDFRONT_DISTRIBUTION = 'E1234567890ABCDEF'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Node.js') {
            steps {
                sh 'node --version'
                sh 'npm --version'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Deploy to S3') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    s3Upload(file: 'dist/', bucket: env.S3_BUCKET, path: '')
                }
            }
        }
        
        stage('Invalidate CloudFront') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    sh 'aws cloudfront create-invalidation --distribution-id ' + CLOUDFRONT_DISTRIBUTION + ' --paths "/*"'
                }
            }
        }
    }
}`
    },
    
    java: {
      docker: `pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-registry.com'
        DOCKER_IMAGE = 'myapp'
        DOCKER_TAG = "latest"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Java') {
            steps {
                sh 'java -version'
                sh 'mvn --version'
            }
        }
        
        stage('Dependencies') {
            steps {
                sh 'mvn dependency:resolve'
            }
        }
        
        stage('Compile') {
            steps {
                sh 'mvn compile'
            }
        }
        
        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }
        
        stage('Package') {
            steps {
                sh 'mvn package -DskipTests'
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    docker.build(DOCKER_IMAGE + ':' + DOCKER_TAG)
                    docker.build(DOCKER_IMAGE + ':latest')
                }
            }
        }
        
        stage('Docker Push') {
            steps {
                script {
                    withDockerRegistry([url: "https://" + DOCKER_REGISTRY, credentialsId: 'docker-creds']) {
                        docker.image(DOCKER_IMAGE + ':' + DOCKER_TAG).push()
                        docker.image(DOCKER_IMAGE + ':latest').push()
                    }
                }
            }
        }
    }
}`,

      'aws-ec2': `pipeline {
    agent any
    
    environment {
        S3_BUCKET = 'my-deployment-bucket'
        EC2_INSTANCE = 'i-1234567890abcdef0'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Java') {
            steps {
                sh 'java -version'
                sh 'mvn --version'
            }
        }
        
        stage('Dependencies') {
            steps {
                sh 'mvn dependency:resolve'
            }
        }
        
        stage('Compile') {
            steps {
                sh 'mvn compile'
            }
        }
        
        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }
        
        stage('Package') {
            steps {
                sh 'mvn package -DskipTests'
            }
        }
        
        stage('Package for Deployment') {
            steps {
                sh '''
                    mkdir deploy
                    cp target/*.jar deploy/
                    cp -r scripts/ deploy/ || true
                    tar -czf app.tar.gz deploy/
                '''
            }
        }
        
        stage('Upload to S3') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    s3Upload(file: 'app.tar.gz', bucket: env.S3_BUCKET)
                }
            }
        }
        
        stage('Deploy to EC2') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    sh '''
                        aws s3 cp s3:// + S3_BUCKET + /app.tar.gz .
                        aws ec2 send-command \\
                            --instance-ids + EC2_INSTANCE \\
                            --document-name "AWS-RunShellScript" \\
                            --parameters commands=["wget https://" + S3_BUCKET + ".s3.amazonaws.com/app.tar.gz", "tar -xzf app.tar.gz", "cd deploy && java -jar *.jar"]
                    '''
                }
            }
        }
    }
}`,

      kubernetes: `pipeline {
    agent any
    
    environment {
        ECR_REGISTRY = '123456789012.dkr.ecr.us-east-1.amazonaws.com'
        ECR_REPO = 'myapp'
        EKS_CLUSTER = 'my-cluster'
        DOCKER_TAG = "latest"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Java') {
            steps {
                sh 'java -version'
                sh 'mvn --version'
            }
        }
        
        stage('Dependencies') {
            steps {
                sh 'mvn dependency:resolve'
            }
        }
        
        stage('Compile') {
            steps {
                sh 'mvn compile'
            }
        }
        
        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }
        
        stage('Package') {
            steps {
                sh 'mvn package -DskipTests'
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    docker.build(ECR_REGISTRY + '/' + ECR_REPO + ':' + DOCKER_TAG)
                }
            }
        }
        
        stage('ECR Login') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    sh 'aws ecr get-login --no-include-email | sh'
                }
            }
        }
        
        stage('Docker Push') {
            steps {
                script {
                    docker.image(ECR_REGISTRY + '/' + ECR_REPO + ':' + DOCKER_TAG).push()
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    sh '''
                        aws eks update-kubeconfig --name + EKS_CLUSTER
                        kubectl set image deployment/myapp myapp=ECR_REGISTRY + '/' + ECR_REPO + ':' + DOCKER_TAG
                        kubectl rollout status deployment/myapp
                    '''
                }
            }
        }
    }
}`,

      'static-hosting': `pipeline {
    agent any
    
    environment {
        S3_BUCKET = 'my-static-bucket'
        CLOUDFRONT_DISTRIBUTION = 'E1234567890ABCDEF'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Java') {
            steps {
                sh 'java -version'
                sh 'mvn --version'
            }
        }
        
        stage('Dependencies') {
            steps {
                sh 'mvn dependency:resolve'
            }
        }
        
        stage('Compile') {
            steps {
                sh 'mvn compile'
            }
        }
        
        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }
        
        stage('Generate Site') {
            steps {
                sh 'mvn site'
            }
        }
        
        stage('Deploy to S3') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    s3Upload(file: 'target/site/', bucket: env.S3_BUCKET, path: '')
                }
            }
        }
        
        stage('Invalidate CloudFront') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    sh 'aws cloudfront create-invalidation --distribution-id ' + CLOUDFRONT_DISTRIBUTION + ' --paths "/*"'
                }
            }
        }
    }
}`
    },
    
    python: {
      docker: `pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-registry.com'
        DOCKER_IMAGE = 'myapp'
        DOCKER_TAG = "latest"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Python') {
            steps {
                sh 'python --version'
                sh 'pip --version'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'pip install -r requirements.txt'
                sh 'pip install pytest flake8'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics'
            }
        }
        
        stage('Test') {
            steps {
                sh 'pytest --junitxml=test-results.xml'
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    docker.build(DOCKER_IMAGE + ':' + DOCKER_TAG)
                    docker.build(DOCKER_IMAGE + ':latest')
                }
            }
        }
        
        stage('Docker Push') {
            steps {
                script {
                    withDockerRegistry([url: "https://" + DOCKER_REGISTRY, credentialsId: 'docker-creds']) {
                        docker.image(DOCKER_IMAGE + ':' + DOCKER_TAG).push()
                        docker.image(DOCKER_IMAGE + ':latest').push()
                    }
                }
            }
        }
    }
}`,

      'aws-ec2': `pipeline {
    agent any
    
    environment {
        S3_BUCKET = 'my-deployment-bucket'
        EC2_INSTANCE = 'i-1234567890abcdef0'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Python') {
            steps {
                sh 'python --version'
                sh 'pip --version'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'pip install -r requirements.txt'
                sh 'pip install pytest flake8'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics'
            }
        }
        
        stage('Test') {
            steps {
                sh 'pytest --junitxml=test-results.xml'
            }
        }
        
        stage('Package for Deployment') {
            steps {
                sh '''
                    mkdir deploy
                    cp -r app/ deploy/
                    cp requirements.txt deploy/
                    cp scripts/ deploy/ || true
                    tar -czf app.tar.gz deploy/
                '''
            }
        }
        
        stage('Upload to S3') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    s3Upload(file: 'app.tar.gz', bucket: env.S3_BUCKET)
                }
            }
        }
        
        stage('Deploy to EC2') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    sh '''
                        aws s3 cp s3:// + S3_BUCKET + /app.tar.gz .
                        aws ec2 send-command \\
                            --instance-ids + EC2_INSTANCE \\
                            --document-name "AWS-RunShellScript" \\
                            --parameters commands=["wget https://" + S3_BUCKET + ".s3.amazonaws.com/app.tar.gz", "tar -xzf app.tar.gz", "cd deploy && pip install -r requirements.txt && python app.py"]
                    '''
                }
            }
        }
    }
}`,

      kubernetes: `pipeline {
    agent any
    
    environment {
        ECR_REGISTRY = '123456789012.dkr.ecr.us-east-1.amazonaws.com'
        ECR_REPO = 'myapp'
        EKS_CLUSTER = 'my-cluster'
        DOCKER_TAG = "latest"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Python') {
            steps {
                sh 'python --version'
                sh 'pip --version'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'pip install -r requirements.txt'
                sh 'pip install pytest'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics'
            }
        }
        
        stage('Test') {
            steps {
                sh 'pytest --junitxml=test-results.xml'
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    docker.build(ECR_REGISTRY + '/' + ECR_REPO + ':' + DOCKER_TAG)
                }
            }
        }
        
        stage('ECR Login') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    sh 'aws ecr get-login --no-include-email | sh'
                }
            }
        }
        
        stage('Docker Push') {
            steps {
                script {
                    docker.image(ECR_REGISTRY + '/' + ECR_REPO + ':' + DOCKER_TAG).push()
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    sh '''
                        aws eks update-kubeconfig --name + EKS_CLUSTER
                        kubectl set image deployment/myapp myapp=ECR_REGISTRY + '/' + ECR_REPO + ':' + DOCKER_TAG
                        kubectl rollout status deployment/myapp
                    '''
                }
            }
        }
    }
}`,

      'static-hosting': `pipeline {
    agent any
    
    environment {
        S3_BUCKET = 'my-static-bucket'
        CLOUDFRONT_DISTRIBUTION = 'E1234567890ABCDEF'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Python') {
            steps {
                sh 'python --version'
                sh 'pip --version'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'pip install -r requirements.txt'
                sh 'pip install sphinx pytest'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics'
            }
        }
        
        stage('Test') {
            steps {
                sh 'pytest --junitxml=test-results.xml'
            }
        }
        
        stage('Generate Documentation') {
            steps {
                sh 'sphinx-build -b html docs/ docs/_build/'
            }
        }
        
        stage('Deploy to S3') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    s3Upload(file: 'docs/_build/', bucket: env.S3_BUCKET, path: '')
                }
            }
        }
        
        stage('Invalidate CloudFront') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    sh 'aws cloudfront create-invalidation --distribution-id ' + CLOUDFRONT_DISTRIBUTION + ' --paths "/*"'
                }
            }
        }
    }
}`
    },
    
    react: {
      docker: `pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-registry.com'
        DOCKER_IMAGE = 'myapp'
        DOCKER_TAG = "latest"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Node.js') {
            steps {
                sh 'node --version'
                sh 'npm --version'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test -- --coverage --watchAll=false'
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
                    docker.build(DOCKER_IMAGE + ':' + DOCKER_TAG)
                    docker.build(DOCKER_IMAGE + ':latest')
                }
            }
        }
        
        stage('Docker Push') {
            steps {
                script {
                    withDockerRegistry([url: "https://" + DOCKER_REGISTRY, credentialsId: 'docker-creds']) {
                        docker.image(DOCKER_IMAGE + ':' + DOCKER_TAG).push()
                        docker.image(DOCKER_IMAGE + ':latest').push()
                    }
                }
            }
        }
    }
}`,

      'aws-ec2': `pipeline {
    agent any
    
    environment {
        S3_BUCKET = 'my-deployment-bucket'
        EC2_INSTANCE = 'i-1234567890abcdef0'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Node.js') {
            steps {
                sh 'node --version'
                sh 'npm --version'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test -- --coverage --watchAll=false'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Package for Deployment') {
            steps {
                sh '''
                    mkdir deploy
                    cp -r build/ deploy/
                    cp package.json deploy/
                    cp nginx.conf deploy/ || true
                    tar -czf app.tar.gz deploy/
                '''
            }
        }
        
        stage('Upload to S3') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    s3Upload(file: 'app.tar.gz', bucket: env.S3_BUCKET)
                }
            }
        }
        
        stage('Deploy to EC2') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    sh '''
                        aws s3 cp s3:// + S3_BUCKET + /app.tar.gz .
                        aws ec2 send-command \\
                            --instance-ids + EC2_INSTANCE \\
                            --document-name "AWS-RunShellScript" \\
                            --parameters commands=["wget https://" + S3_BUCKET + ".s3.amazonaws.com/app.tar.gz", "tar -xzf app.tar.gz", "cd deploy && npm install && npm run serve"]
                    '''
                }
            }
        }
    }
}`,

      kubernetes: `pipeline {
    agent any
    
    environment {
        ECR_REGISTRY = '123456789012.dkr.ecr.us-east-1.amazonaws.com'
        ECR_REPO = 'myapp'
        EKS_CLUSTER = 'my-cluster'
        DOCKER_TAG = "latest"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Node.js') {
            steps {
                sh 'node --version'
                sh 'npm --version'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test -- --coverage --watchAll=false'
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
                    docker.build(ECR_REGISTRY + '/' + ECR_REPO + ':' + DOCKER_TAG)
                }
            }
        }
        
        stage('ECR Login') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    sh 'aws ecr get-login --no-include-email | sh'
                }
            }
        }
        
        stage('Docker Push') {
            steps {
                script {
                    docker.image(ECR_REGISTRY + '/' + ECR_REPO + ':' + DOCKER_TAG).push()
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    sh '''
                        aws eks update-kubeconfig --name + EKS_CLUSTER
                        kubectl set image deployment/myapp myapp=ECR_REGISTRY + '/' + ECR_REPO + ':' + DOCKER_TAG
                        kubectl rollout status deployment/myapp
                    '''
                }
            }
        }
    }
}`,

      'static-hosting': `pipeline {
    agent any
    
    environment {
        S3_BUCKET = 'my-static-bucket'
        CLOUDFRONT_DISTRIBUTION = 'E1234567890ABCDEF'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Node.js') {
            steps {
                sh 'node --version'
                sh 'npm --version'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test -- --coverage --watchAll=false'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Deploy to S3') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    s3Upload(file: 'build/', bucket: env.S3_BUCKET, path: '')
                }
            }
        }
        
        stage('Invalidate CloudFront') {
            steps {
                withAWS(credentials: 'aws-creds', region: 'us-east-1') {
                    sh 'aws cloudfront create-invalidation --distribution-id ' + CLOUDFRONT_DISTRIBUTION + ' --paths "/*"'
                }
            }
        }
    }
}`
    }
  }
}
