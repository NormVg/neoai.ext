(function() {
  var el = document.getElementById('neoai-token-container');
  if (el) {
    window.__NEOAI_AUTH_TOKEN__ = el.getAttribute('data-token') || '';
    window.__NEOAI_LOGGED_IN__ = el.getAttribute('data-logged-in') === 'true';
    // Keep container for storage.onChanged updates
  }
})();
