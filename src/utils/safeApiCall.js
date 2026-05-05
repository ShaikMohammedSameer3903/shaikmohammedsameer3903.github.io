// Safe API Call Utility
// Wraps API calls with error normalization and simulation data normalization

export async function safeApiCall(apiFn) {
  try {
    const result = await apiFn();
    return result || { success: false, error: 'No response' };
  } catch (err) {
    return {
      success: false,
      error: err?.message || 'Unknown error',
      data: null
    };
  }
}

export function normalizeSimulation(data) {
  if (!data) {
    return { steps: [], logs: [], jobs: [], status: 'failed' };
  }

  return {
    steps: Array.isArray(data.steps) ? data.steps : [],
    logs: Array.isArray(data.logs) ? data.logs : [],
    jobs: Array.isArray(data.jobs) ? data.jobs : [],
    status: data.status || 'failed',
    simulationId: data.simulationId || data.id || null
  };
}

export default { safeApiCall, normalizeSimulation };
