(function () {
  if (localStorage.getItem('is_admin') !== '1') return;
  const link = document.querySelector('a[href*="stats.html"]');
  if (!link) return;
  link.textContent = 'ADMIN PANEL';
  link.href = '/frontend/HTML/admin.html';
  link.style.color = 'var(--error, #e81132)';
})();
