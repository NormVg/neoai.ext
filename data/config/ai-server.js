/**
 * NeoPass AI Server Configuration
 * Configure the URL of your local Express AI server
 */
const NEOPASS_AI_CONFIG = {
  // Local server URL - change this if running on different port/host
  serverUrl: 'http://localhost:3001',

  // Endpoints
  endpoints: {
    solveMCQ: '/api/solve-mcq',
    solveCode: '/api/solve-code',
    health: '/api/health'
  },

  // Request timeout in milliseconds
  timeout: 30000
};

// Export for use in content scripts
if (typeof window !== 'undefined') {
  window.NEOPASS_AI_CONFIG = NEOPASS_AI_CONFIG;
}
