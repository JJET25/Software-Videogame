// colorblind.js — Floating accessibility panel for colorblind correction on all website pages.
// Shows four buttons (OFF / Protanopia / Deuteranopia / Tritanopia); the active one is highlighted.
// Preference persists in localStorage under the key "cbMode".
(function () {
  const MODES  = ['off', 'protanopia', 'deuteranopia', 'tritanopia'];
  const LABELS = ['OFF', 'Protanopia', 'Deuteranopia', 'Tritanopia'];

  // SVG feColorMatrix correction values (Vienot 1995 / Color Oracle)
  const MATRICES = {
    protanopia:   '0.567 0.433 0     0 0  0.558 0.442 0     0 0  0     0.242 0.758 0 0  0 0 0 1 0',
    deuteranopia: '0.625 0.375 0     0 0  0.7   0.3   0     0 0  0     0.3   0.7   0 0  0 0 0 1 0',
    tritanopia:   '0.95  0.05  0     0 0  0     0.433 0.567 0 0  0     0.475 0.525 0 0  0 0 0 1 0',
  };

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
    document.body.appendChild(svg);
  }

  function injectStyles() {
    if (document.getElementById('cb-styles')) return;
    const s = document.createElement('style');
    s.id = 'cb-styles';
    s.textContent = `
      #cb-panel {
        position: fixed;
        bottom: 1.2rem;
        left: 1.2rem;
        z-index: 9999;
        background: rgba(13,5,32,0.90);
        border: 1px solid rgba(150,80,220,0.40);
        border-radius: 12px;
        padding: 0.5rem 0.6rem 0.45rem;
        backdrop-filter: blur(10px);
        user-select: none;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        min-width: 0;
      }
      #cb-panel-title {
        font-size: 0.62rem;
        color: #866ea7;
        font-family: inherit, sans-serif;
        letter-spacing: 0.05em;
        padding-left: 0.1rem;
      }
      #cb-btns {
        display: flex;
        gap: 0.3rem;
      }
      .cb-btn {
        padding: 0.3rem 0.5rem;
        border-radius: 7px;
        border: 1px solid rgba(150,80,220,0.30);
        background: rgba(30,10,60,0.60);
        color: #7a62a0;
        font-size: 0.65rem;
        font-family: inherit, sans-serif;
        cursor: pointer;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
        white-space: nowrap;
        line-height: 1;
      }
      .cb-btn:hover {
        background: rgba(80,48,160,0.55);
        color: #d0b8ff;
        border-color: rgba(180,100,255,0.55);
      }
      .cb-btn[data-active="true"] {
        background: rgba(80,48,160,0.85);
        color: #ffffff;
        border-color: rgba(180,120,255,0.80);
      }
      .cb-btn[data-mode="off"][data-active="true"] {
        background: rgba(30,10,60,0.80);
        color: #a090cc;
        border-color: rgba(120,70,200,0.55);
      }
    `;
    document.head.appendChild(s);
  }

  function applyMode(mode) {
    const valid = MODES.includes(mode) ? mode : 'off';
    document.body.style.filter = valid !== 'off' ? `url(#cb-${valid})` : '';
    localStorage.setItem('cbMode', valid);
    window.colorblindMode = valid;
    updatePanel(valid);
  }

  function updatePanel(mode) {
    document.querySelectorAll('.cb-btn').forEach(btn => {
      btn.dataset.active = String(btn.dataset.mode === mode);
    });
  }

  function createPanel() {
    if (document.getElementById('cb-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'cb-panel';
    panel.setAttribute('role', 'group');
    panel.setAttribute('aria-label', 'Modo de accesibilidad para daltonismo');

    const title = document.createElement('span');
    title.id = 'cb-panel-title';
    title.textContent = '👁 Daltonismo';

    const row = document.createElement('div');
    row.id = 'cb-btns';

    MODES.forEach((mode, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cb-btn';
      btn.dataset.mode = mode;
      btn.dataset.active = 'false';
      btn.textContent = LABELS[i];
      btn.setAttribute('aria-label', mode === 'off' ? 'Desactivar modo daltonismo' : `Modo ${LABELS[i]}`);
      btn.addEventListener('click', () => applyMode(mode));
      row.appendChild(btn);
    });

    panel.appendChild(title);
    panel.appendChild(row);
    document.body.appendChild(panel);
  }

  function init() {
    injectFilters();
    injectStyles();
    createPanel();
    applyMode(localStorage.getItem('cbMode') || 'off');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
