// colorblind.js — Injects a colorblind-mode button into the page header (next to the user area).
// Opens a dropdown to pick Normal / Protanopia / Deuteranopia / Tritanopia.
// Clicking the active type toggles it off. Preference persists in localStorage ("cbMode").
(function () {
  const MODES  = ['off', 'protanopia', 'deuteranopia', 'tritanopia'];
  const LABELS = ['Normal', 'Protanopia', 'Deuteranopia', 'Tritanopia'];

  const MATRICES = {
    protanopia:   '0.567 0.433 0     0 0  0.558 0.442 0     0 0  0     0.242 0.758 0 0  0 0 0 1 0',
    deuteranopia: '0.625 0.375 0     0 0  0.7   0.3   0     0 0  0     0.3   0.7   0 0  0 0 0 1 0',
    tritanopia:   '0.95  0.05  0     0 0  0     0.433 0.567 0 0  0     0.475 0.525 0 0  0 0 0 1 0',
  };

  // ── SVG filters ──────────────────────────────────────────────────────────

  function injectFilters() {
    if (document.getElementById('cb-svg')) return;
    const ns  = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.id = 'cb-svg';
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';

    const defs = document.createElementNS(ns, 'defs');
    for (const [id, values] of Object.entries(MATRICES)) {
      const f = document.createElementNS(ns, 'filter');
      f.id = `cb-${id}`;
      f.setAttribute('x', '0'); f.setAttribute('y', '0');
      f.setAttribute('width', '100%'); f.setAttribute('height', '100%');
      f.setAttribute('color-interpolation-filters', 'linearRGB');
      const mat = document.createElementNS(ns, 'feColorMatrix');
      mat.setAttribute('type', 'matrix');
      mat.setAttribute('values', values);
      f.appendChild(mat);
      defs.appendChild(f);
    }
    svg.appendChild(defs);
    document.body.insertBefore(svg, document.body.firstChild);
  }

  // ── Core logic ────────────────────────────────────────────────────────────

  function applyMode(mode) {
    const valid = MODES.includes(mode) ? mode : 'off';
    document.body.style.filter = valid !== 'off' ? `url(#cb-${valid})` : '';
    localStorage.setItem('cbMode', valid);
    window.colorblindMode = valid;
    updateHeaderButton(valid);
  }

  function updateHeaderButton(mode) {
    const btn = document.getElementById('cbBtn');
    if (!btn) return;

    const isOn = mode !== 'off';
    btn.dataset.active = String(isOn);
    btn.title = isOn
      ? `Daltonismo: ${LABELS[MODES.indexOf(mode)]} (clic para cambiar)`
      : 'Activar modo daltonismo';
    btn.setAttribute('aria-label', btn.title);

    document.querySelectorAll('.cb-option').forEach(opt => {
      opt.dataset.active = String(opt.dataset.mode === mode);
    });
  }

  // ── Header button ─────────────────────────────────────────────────────────

  const EYE_SVG = `<svg width="20" height="13" viewBox="0 0 20 13" fill="currentColor" aria-hidden="true">
    <path d="M10 0C5.5 0 1.8 2.5 0 6.5 1.8 10.5 5.5 13 10 13s8.2-2.5 10-6.5C18.2 2.5 14.5 0 10 0z" opacity="0.55"/>
    <circle cx="10" cy="6.5" r="3.2"/>
  </svg>`;

  function injectHeaderButton() {
    if (document.getElementById('cbHeaderArea')) return;
    const header = document.querySelector('header');
    if (!header) return;

    const area = document.createElement('div');
    area.id = 'cbHeaderArea';
    area.className = 'cb-header-area';
    area.innerHTML = `
      <button class="cb-header-btn" id="cbBtn" type="button" aria-label="Activar modo daltonismo" title="Activar modo daltonismo">
        ${EYE_SVG}
      </button>
      <div class="cb-dropdown" id="cbDropdown" role="menu">
        <p class="cb-dropdown-title">Daltonismo</p>
        ${MODES.map((m, i) => `<button class="cb-option" data-mode="${m}" role="menuitem">${LABELS[i]}</button>`).join('')}
      </div>
    `;

    // Insert before #signupUser so it sits to the left of the user area
    const anchor = header.querySelector('#signupUser') || header.querySelector('.signup_user');
    if (anchor) {
      header.insertBefore(area, anchor);
    } else {
      header.appendChild(area);
    }

    bindHeaderEvents();
  }

  function bindHeaderEvents() {
    const btn      = document.getElementById('cbBtn');
    const dropdown = document.getElementById('cbDropdown');
    if (!btn || !dropdown) return;

    // Toggle dropdown open/close
    btn.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    // Option click: toggle off if already active, otherwise activate
    dropdown.querySelectorAll('.cb-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const isActive = opt.dataset.mode === (window.colorblindMode || 'off');
        const next = (isActive && opt.dataset.mode !== 'off') ? 'off' : opt.dataset.mode;
        applyMode(next);
        dropdown.classList.remove('open');
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => dropdown.classList.remove('open'));
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  function init() {
    injectFilters();
    injectHeaderButton();
    applyMode(localStorage.getItem('cbMode') || 'off');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
