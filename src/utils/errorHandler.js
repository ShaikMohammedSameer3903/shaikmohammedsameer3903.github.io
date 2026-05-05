// Global error handler for the application

// Initialize error logging and handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
