const { templates } = require('../data/templates.js');

function generatePipeline(platform, language, deployment) {
  try {
    // Check if the platform exists
    if (!templates[platform]) {
      return getFallbackTemplate(platform, language, deployment);
    }

    // Check if the language exists for the platform
    if (!templates[platform][language]) {
      return getFallbackTemplate(platform, language, deployment);
    }

    // Check if the deployment type exists for the platform/language combination
    if (!templates[platform][language][deployment]) {
      return getFallbackTemplate(platform, language, deployment);
    }

    // Return the matching template
    return templates[platform][language][deployment];
  } catch (error) {
    console.error('Error generating pipeline:', error);
    return getFallbackTemplate(platform, language, deployment);
  }
}

function getFallbackTemplate(platform, language, deployment) {
  return `# CI/CD Pipeline Template
# Platform: ${platform}
# Language: ${language}
# Deployment: ${deployment}

# Template not found for this combination.
# Here's a basic template you can customize:

name: CI/CD Pipeline
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Environment
      run: |
        echo "Setting up environment for ${language}"
    - name: Install Dependencies
      run: |
        echo "Installing dependencies"
    - name: Run Tests
      run: |
        echo "Running tests"
    - name: Build Application
      run: |
        echo "Building application"
    - name: Deploy
      run: |
        echo "Deploying to ${deployment}"`;
}

function getAllTemplates() {
  return templates;
}

function getAvailablePlatforms() {
  return Object.keys(templates);
}

function getAvailableLanguages(platform) {
  if (!templates[platform]) {
    return [];
  }
  return Object.keys(templates[platform]);
}

function getAvailableDeployments(platform, language) {
  if (!templates[platform] || !templates[platform][language]) {
    return [];
  }
  return Object.keys(templates[platform][language]);
}

module.exports = {
  generatePipeline,
  getAllTemplates,
  getAvailablePlatforms,
  getAvailableLanguages,
  getAvailableDeployments,
  getFallbackTemplate
};
