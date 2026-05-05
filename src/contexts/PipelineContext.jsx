import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { injectConfigIntoCode } from '../data/templates';
import { pipelineService } from '../services/pipelineService';
import { parsePipeline } from '../services/parserService';
import { validateYamlCode, validatePipelineModel } from '../services/validationEngine';
import { executePipeline } from '../services/executionEngine';
import { optimizePipeline } from '../services/optimizationEngine';
import { analyzePipeline } from '../services/analysisService';

// Initial state
const initialState = {
  template: null,
  pipelineName: '',
  platform: '',
  description: '',
  envVariables: [],
  secrets: [],
  config: {},
  generatedCode: '',
  editedCode: '',
  isLoading: false,
  errors: [],
  parsedPipeline: null,
  validationResult: null,
  optimizationResult: null,
  executionResult: null,
  analysisResult: null
};

// Initial state logic with persistence
const STORAGE_KEY = 'pipeline_builder_state';
const TTL_DAYS = 7;

const getStoredState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialState;
    
    const { data, timestamp } = JSON.parse(stored);
    const now = Date.now();
    const ageInDays = (now - timestamp) / (1000 * 60 * 60 * 24);
    
    if (ageInDays > TTL_DAYS) {
      localStorage.removeItem(STORAGE_KEY);
      return initialState;
    }
    
    // Merge with safe array defaults to prevent .filter() crashes on corrupted localStorage
    const merged = { ...initialState, ...data };
    // Ensure all array fields are actually arrays
    merged.errors = Array.isArray(merged.errors) ? merged.errors : [];
    merged.envVariables = Array.isArray(merged.envVariables) ? merged.envVariables : [];
    merged.secrets = Array.isArray(merged.secrets) ? merged.secrets : [];
    return merged;
  } catch (e) {
    return initialState;
  }
};

// Action types
const ACTIONS = {
  SET_TEMPLATE: 'SET_TEMPLATE',
  SET_PIPELINE_NAME: 'SET_PIPELINE_NAME',
  SET_PLATFORM: 'SET_PLATFORM',
  SET_DESCRIPTION: 'SET_DESCRIPTION',
  SET_ENV_VARIABLES: 'SET_ENV_VARIABLES',
  SET_SECRETS: 'SET_SECRETS',
  SET_CONFIG: 'SET_CONFIG',
  SET_GENERATED_CODE: 'SET_GENERATED_CODE',
  SET_EDITED_CODE: 'SET_EDITED_CODE',
  ADD_ENV_VARIABLE: 'ADD_ENV_VARIABLE',
  UPDATE_ENV_VARIABLE: 'UPDATE_ENV_VARIABLE',
  REMOVE_ENV_VARIABLE: 'REMOVE_ENV_VARIABLE',
  ADD_SECRET: 'ADD_SECRET',
  UPDATE_SECRET: 'UPDATE_SECRET',
  REMOVE_SECRET: 'REMOVE_SECRET',
  UPDATE_CONFIG_VALUE: 'UPDATE_CONFIG_VALUE',
  RESET_STATE: 'RESET_STATE',
  SET_LOADING: 'SET_LOADING',
  SET_ERRORS: 'SET_ERRORS',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  SET_PARSED_PIPELINE: 'SET_PARSED_PIPELINE',
  SET_VALIDATION_RESULT: 'SET_VALIDATION_RESULT',
  SET_OPTIMIZATION_RESULT: 'SET_OPTIMIZATION_RESULT',
  SET_EXECUTION_RESULT: 'SET_EXECUTION_RESULT',
  SET_ANALYSIS_RESULT: 'SET_ANALYSIS_RESULT'
};

// Reducer function
const pipelineReducer = (state, action) => {
  let newState;
  switch (action.type) {
    case ACTIONS.SET_TEMPLATE:
      newState = {
        ...state,
        template: action.payload,
        platform: action.payload?.platform || state.platform,
        errors: []
      };
      break;

    case ACTIONS.SET_PIPELINE_NAME:
      newState = {
        ...state,
        pipelineName: action.payload,
        errors: state.errors.filter(error => error.field !== 'pipelineName')
      };
      break;

    case ACTIONS.SET_PLATFORM:
      newState = {
        ...state,
        platform: action.payload,
        errors: state.errors.filter(error => error.field !== 'platform')
      };
      break;

    case ACTIONS.SET_DESCRIPTION:
      newState = {
        ...state,
        description: action.payload
      };
      break;

    case ACTIONS.SET_ENV_VARIABLES:
      newState = {
        ...state,
        envVariables: action.payload
      };
      break;

    case ACTIONS.SET_SECRETS:
      newState = {
        ...state,
        secrets: action.payload
      };
      break;

    case ACTIONS.SET_CONFIG:
      newState = {
        ...state,
        config: action.payload
      };
      break;

    case ACTIONS.SET_GENERATED_CODE:
      newState = {
        ...state,
        generatedCode: action.payload
      };
      break;

    case ACTIONS.SET_EDITED_CODE:
      newState = {
        ...state,
        editedCode: action.payload
      };
      break;

    case ACTIONS.ADD_ENV_VARIABLE:
      const newEnvVar = {
        id: Date.now().toString(),
        key: '',
        value: '',
        description: '',
        enabled: true
      };
      newState = {
        ...state,
        envVariables: [...state.envVariables, newEnvVar]
      };
      break;

    case ACTIONS.UPDATE_ENV_VARIABLE:
      newState = {
        ...state,
        envVariables: state.envVariables.map(env =>
          env.id === action.payload.id
            ? { ...env, ...action.payload.updates }
            : env
        )
      };
      break;

    case ACTIONS.REMOVE_ENV_VARIABLE:
      newState = {
        ...state,
        envVariables: state.envVariables.filter(env => env.id !== action.payload)
      };
      break;

    case ACTIONS.ADD_SECRET:
      const newSecret = {
        id: Date.now().toString(),
        key: '',
        value: '',
        description: '',
        enabled: true
      };
      newState = {
        ...state,
        secrets: [...state.secrets, newSecret]
      };
      break;

    case ACTIONS.UPDATE_SECRET:
      newState = {
        ...state,
        secrets: state.secrets.map(secret =>
          secret.id === action.payload.id
            ? { ...secret, ...action.payload.updates }
            : secret
        )
      };
      break;

    case ACTIONS.REMOVE_SECRET:
      newState = {
        ...state,
        secrets: state.secrets.filter(secret => secret.id !== action.payload)
      };
      break;

    case ACTIONS.UPDATE_CONFIG_VALUE:
      newState = {
        ...state,
        config: {
          ...state.config,
          [action.payload.key]: action.payload.value
        }
      };
      break;

    case ACTIONS.RESET_STATE:
      localStorage.removeItem(STORAGE_KEY);
      return {
        ...initialState,
        platform: state.platform
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case ACTIONS.SET_ERRORS:
      newState = {
        ...state,
        errors: action.payload
      };
      break;

    case ACTIONS.CLEAR_ERRORS:
      newState = {
        ...state,
        errors: []
      };
      break;

    case ACTIONS.SET_PARSED_PIPELINE:
      newState = {
        ...state,
        parsedPipeline: action.payload
      };
      break;

    case ACTIONS.SET_VALIDATION_RESULT:
      newState = {
        ...state,
        validationResult: action.payload
      };
      break;

    case ACTIONS.SET_OPTIMIZATION_RESULT:
      newState = {
        ...state,
        optimizationResult: action.payload
      };
      break;

    case ACTIONS.SET_EXECUTION_RESULT:
      newState = {
        ...state,
        executionResult: action.payload
      };
      break;

    case ACTIONS.SET_ANALYSIS_RESULT:
      newState = {
        ...state,
        analysisResult: action.payload
      };
      break;

    default:
      return state;
  }

  // Persistence logic
  if (newState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      data: newState,
      timestamp: Date.now()
    }));
  }

  return newState || state;
};

// Create context
const PipelineContext = createContext();

// Provider component
export const PipelineProvider = ({ children }) => {
  const [state, dispatch] = useReducer(pipelineReducer, null, getStoredState);

  // Action creators
  const actions = {
    setTemplate: (template) => dispatch({ type: ACTIONS.SET_TEMPLATE, payload: template }),
    setPipelineName: (name) => dispatch({ type: ACTIONS.SET_PIPELINE_NAME, payload: name }),
    setPlatform: (platform) => dispatch({ type: ACTIONS.SET_PLATFORM, payload: platform }),
    setDescription: (description) => dispatch({ type: ACTIONS.SET_DESCRIPTION, payload: description }),
    setEnvVariables: (envVars) => dispatch({ type: ACTIONS.SET_ENV_VARIABLES, payload: envVars }),
    setSecrets: (secrets) => dispatch({ type: ACTIONS.SET_SECRETS, payload: secrets }),
    setConfig: (config) => dispatch({ type: ACTIONS.SET_CONFIG, payload: config }),
    setGeneratedCode: (code) => dispatch({ type: ACTIONS.SET_GENERATED_CODE, payload: code }),
    setEditedCode: (code) => dispatch({ type: ACTIONS.SET_EDITED_CODE, payload: code }),
    
    addEnvVariable: () => dispatch({ type: ACTIONS.ADD_ENV_VARIABLE }),
    updateEnvVariable: (id, updates) => dispatch({ type: ACTIONS.UPDATE_ENV_VARIABLE, payload: { id, updates } }),
    removeEnvVariable: (id) => dispatch({ type: ACTIONS.REMOVE_ENV_VARIABLE, payload: id }),
    
    addSecret: () => dispatch({ type: ACTIONS.ADD_SECRET }),
    updateSecret: (id, updates) => dispatch({ type: ACTIONS.UPDATE_SECRET, payload: { id, updates } }),
    removeSecret: (id) => dispatch({ type: ACTIONS.REMOVE_SECRET, payload: id }),
    
    updateConfigValue: (key, value) => dispatch({ type: ACTIONS.UPDATE_CONFIG_VALUE, payload: { key, value } }),
    
    resetState: () => dispatch({ type: ACTIONS.RESET_STATE }),
    setLoading: (loading) => dispatch({ type: ACTIONS.SET_LOADING, payload: loading }),
    setErrors: (errors) => dispatch({ type: ACTIONS.SET_ERRORS, payload: errors }),
    clearErrors: () => dispatch({ type: ACTIONS.CLEAR_ERRORS }),
    setParsedPipeline: (pipeline) => dispatch({ type: ACTIONS.SET_PARSED_PIPELINE, payload: pipeline }),
    setValidationResult: (result) => dispatch({ type: ACTIONS.SET_VALIDATION_RESULT, payload: result }),
    setOptimizationResult: (result) => dispatch({ type: ACTIONS.SET_OPTIMIZATION_RESULT, payload: result }),
    setExecutionResult: (result) => dispatch({ type: ACTIONS.SET_EXECUTION_RESULT, payload: result }),
    setAnalysisResult: (result) => dispatch({ type: ACTIONS.SET_ANALYSIS_RESULT, payload: result }),
  };

  // Load template into state
  const loadTemplate = useCallback((template) => {
    actions.setTemplate(template);
    actions.setPipelineName(template.name || '');
    actions.setPlatform(template.platform || '');
    actions.setDescription(template.description || '');
    
    // Initialize config with template defaults
    const initialConfig = {};
    if (template.configOptions) {
      template.configOptions.forEach(option => {
        initialConfig[option.key] = option.defaultValue || '';
      });
    }
    actions.setConfig(initialConfig);
    
    // Initialize environment variables
    if (template.envVariables) {
      const envVars = template.envVariables.map(env => ({
        id: Date.now().toString() + Math.random(),
        key: env.key,
        value: env.defaultValue || '',
        description: env.description || '',
        enabled: true
      }));
      actions.setEnvVariables(envVars);
    }
    
    // Initialize secrets
    if (template.secrets) {
      const secrets = template.secrets.map(secret => ({
        id: Date.now().toString() + Math.random(),
        key: secret.key,
        value: '',
        description: secret.description || '',
        enabled: true
      }));
      actions.setSecrets(secrets);
    }
    
    // Generate initial code
    if (template.code) {
      const generatedCode = injectConfigIntoCode(template, initialConfig);
      actions.setGeneratedCode(generatedCode);
      actions.setEditedCode(generatedCode);
    }
  }, []);

  // Generate pipeline code from current state
  const generatePipelineCode = useCallback(() => {
    if (!state.template) return '';
    
    // Combine all configuration values
    const allConfig = { ...state.config };
    
    // Add environment variables to config
    state.envVariables.forEach(env => {
      if (env.enabled && env.key && env.value) {
        allConfig[env.key] = env.value;
      }
    });
    
    // Add secrets to config (for preview only)
    state.secrets.forEach(secret => {
      if (secret.enabled && secret.key && secret.value) {
        allConfig[secret.key] = secret.value;
      }
    });
    
    const generatedCode = injectConfigIntoCode(state.template, allConfig);
    actions.setGeneratedCode(generatedCode);
    actions.setEditedCode(generatedCode);
    
    return generatedCode;
  }, [state.template, state.config, state.envVariables, state.secrets]);

  // Validate pipeline state
  const validatePipeline = useCallback(() => {
    const errors = [];
    
    if (!state.pipelineName || !state.pipelineName.trim()) {
      errors.push({ field: 'pipelineName', message: 'Pipeline name is required' });
    }
    
    if (!state.platform) {
      errors.push({ field: 'platform', message: 'Platform is required' });
    }
    
    if (!state.editedCode || !state.editedCode.trim()) {
      errors.push({ field: 'code', message: 'Pipeline code is required' });
    }
    
    // Validate required config options
    if (state.template?.configOptions) {
      state.template.configOptions.forEach(option => {
        if (!state.config[option.key]) {
          errors.push({ 
            field: option.key, 
            message: `${option.description || option.key} is required` 
          });
        }
      });
    }
    
    // Validate required environment variables
    if (state.template?.envVariables) {
      state.template.envVariables.forEach(env => {
        const envVar = state.envVariables.find(e => e.key === env.key);
        if (!envVar || !envVar.value) {
          errors.push({ 
            field: 'env_' + env.key, 
            message: `Environment variable ${env.key} is required` 
          });
        }
      });
    }
    
    actions.setErrors(errors);
    return errors;
  }, [state]);

  // Save pipeline
  const savePipeline = useCallback(async () => {
    const errors = validatePipeline();
    if (errors.length > 0) {
      return { success: false, errors };
    }
    
    actions.setLoading(true);
    
    try {
      // Parse environment variables
      const parsedEnvVars = state.envVariables
        .filter(env => env.enabled && env.key && env.value)
        .map(env => ({
          key: env.key,
          value: env.value,
          type: 'environment',
          description: env.description
        }));

      // Parse secrets
      const parsedSecrets = state.secrets
        .filter(secret => secret.enabled && secret.key && secret.value)
        .map(secret => ({
          key: secret.key,
          value: secret.value,
          type: 'secret',
          description: secret.description
        }));

      const pipelineData = {
        name: state.pipelineName,
        platform: state.platform,
        description: state.description,
        code: state.editedCode,
        config: state.config,
        variables: [...parsedEnvVars, ...parsedSecrets],
        templateId: state.template?.id || null,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      // Save to backend API with localStorage fallback
      const result = await pipelineService.savePipeline(pipelineData);
      
      // If we got here, it was successful (otherwise it would throw)
      return { success: true, data: result };
      
    } catch (error) {
      console.error('Error saving pipeline:', error);
      return { success: false, errors: [{ message: 'Failed to save pipeline' }] };
    } finally {
      actions.setLoading(false);
    }
  }, [state, validatePipeline]);

  // Parse pipeline code into unified model
  const parsePipelineCode = useCallback((code) => {
    if (!code) return null;
    const result = parsePipeline(code);
    if (result.success) {
      actions.setParsedPipeline(result.pipeline);
    }
    return result;
  }, []);

  // Validate pipeline code (YAML + model)
  const validatePipelineCode = useCallback((code) => {
    if (!code) return null;
    const yamlResult = validateYamlCode(code);
    let modelResult = null;
    if (yamlResult.errors.length === 0) {
      const parsed = parsePipeline(code);
      if (parsed.success) {
        modelResult = validatePipelineModel(parsed.pipeline);
      }
    }
    const merged = {
      isValid: yamlResult.errors.length === 0 && (!modelResult || modelResult.errors.length === 0),
      errors: [...yamlResult.errors, ...(modelResult?.errors || [])],
      warnings: [...yamlResult.warnings, ...(modelResult?.warnings || [])],
      summary: {
        errorCount: yamlResult.errors.length + (modelResult?.errors?.length || 0),
        warningCount: yamlResult.warnings.length + (modelResult?.warnings?.length || 0),
        totalIssues: yamlResult.errors.length + yamlResult.warnings.length + (modelResult?.errors?.length || 0) + (modelResult?.warnings?.length || 0),
      },
    };
    actions.setValidationResult(merged);
    return merged;
  }, []);

  // Execute pipeline simulation
  const executePipelineSimulation = useCallback(async (code, options = {}) => {
    if (!code) return null;
    const parsed = parsePipeline(code);
    if (!parsed.success) return null;
    const result = await executePipeline(parsed.pipeline, options);
    actions.setExecutionResult(result);
    return result;
  }, []);

  // Optimize pipeline
  const optimizePipelineCode = useCallback((code) => {
    if (!code) return null;
    const parsed = parsePipeline(code);
    if (!parsed.success) return null;
    const result = optimizePipeline(parsed.pipeline);
    actions.setOptimizationResult(result);
    return result;
  }, []);

  // Analyze pipeline performance
  const analyzePipelineCode = useCallback((code) => {
    if (!code) return null;
    const parsed = parsePipeline(code);
    if (!parsed.success) return null;
    const result = analyzePipeline(parsed.pipeline);
    actions.setAnalysisResult(result);
    return result;
  }, []);

  const value = {
    ...state,
    actions,
    loadTemplate,
    generatePipelineCode,
    validatePipeline,
    savePipeline,
    parsePipelineCode,
    validatePipelineCode,
    executePipelineSimulation,
    optimizePipelineCode,
    analyzePipelineCode
  };

  return (
    <PipelineContext.Provider value={value}>
      {children}
    </PipelineContext.Provider>
  );
};

// Hook to use the context
export const usePipeline = () => {
  const context = useContext(PipelineContext);
  if (!context) {
    throw new Error('usePipeline must be used within a PipelineProvider');
  }
  return context;
};

export default PipelineContext;
