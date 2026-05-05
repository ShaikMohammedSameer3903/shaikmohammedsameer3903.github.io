// Global Events System for cross-component communication

class GlobalEventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    // Return unsubscribe function
    return () => {
      const list = this.listeners.get(event);
      if (list) {
        this.listeners.set(event, list.filter(cb => cb !== callback));
      }
    };
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.set(event, this.listeners.get(event).filter(cb => cb !== callback));
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try { cb(data); } catch (e) { console.error('[Events] Listener error:', e); }
      });
    }
  }

  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export const EVENTS = {
  PIPELINE_SAVED: 'pipeline:saved',
  PIPELINE_DELETED: 'pipeline:deleted',
  PIPELINE_UPDATED: 'pipeline:updated',
  SIMULATION_START: 'simulation:start',
  SIMULATION_COMPLETE: 'simulation:complete',
  AUTH_CHANGE: 'auth:change',
  NOTIFICATION: 'notification'
};

const globalEvents = new GlobalEventEmitter();
export { globalEvents };
export default globalEvents;
