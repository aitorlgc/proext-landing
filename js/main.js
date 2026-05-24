/* PROEXT — Main bootstrap
 * Loads animations + components modules via separate <script> tags.
 * This file kept for legacy compatibility; orchestration happens in animations.js + components.js.
 */
(function () {
  // Legacy globals for cookie banner (kept for any inline onclick attributes still present)
  window.acceptCookies = function () {
    localStorage.setItem('cookiesAccepted', 'true');
    var b = document.getElementById('cookie-banner');
    if (b) b.classList.remove('is-open');
  };
  window.rejectCookies = function () {
    localStorage.setItem('cookiesAccepted', 'false');
    var b = document.getElementById('cookie-banner');
    if (b) b.classList.remove('is-open');
  };
})();
