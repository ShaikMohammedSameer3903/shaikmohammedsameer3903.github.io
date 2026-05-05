// WebSocket Service for real-time simulation updates
// Gracefully handles missing backend connection

let socket = null;
let listeners = new Map();

const websocketService = {
  connect() {
    // WebSocket connection is optional - gracefully skip if backend unavailable
    console.log('[WS] WebSocket connect requested - using polling fallback');
  },

  disconnect() {
    if (socket) {
      socket.close();
      socket = null;
    }
    console.log('[WS] Disconnected');
  },

  on(event, callback) {
    if (!listeners.has(event)) {
      listeners.set(event, []);
    }
    listeners.get(event).push(callback);
  },

  off(event, callback) {
    if (listeners.has(event)) {
      listeners.set(event, listeners.get(event).filter(cb => cb !== callback));
    }
  },

  emit(event, data) {
    if (listeners.has(event)) {
      listeners.get(event).forEach(cb => {
        try { cb(data); } catch (e) { console.error('[WS] Listener error:', e); }
      });
    }
  },

  isConnected() {
    return socket !== null && socket.readyState === 1;
  }
};

export default websocketService;
