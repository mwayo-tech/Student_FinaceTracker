// scripts/main.js
import { init, subscribe } from './state.js';
import { renderDashboard }  from './ui/dashboard.js';
import { renderRecords }    from './ui/records.js';
import { renderForm }       from './ui/form.js';
import { renderSettings }   from './ui/settings.js';

const sections = ['dashboard','records','add','settings','about'];

function showSection(id) {
  sections.forEach(s => {
    const el = document.getElementById(`section-${s}`);
    if (el) el.hidden = (s !== id);
  });
  document.querySelectorAll('.nav-link').forEach(a => {
    a.setAttribute('aria-current', a.dataset.section === id ? 'page' : 'false');
  });
  if (id === 'dashboard') renderDashboard();
  if (id === 'records')   renderRecords();
  if (id === 'add')       renderForm();
  if (id === 'settings')  renderSettings();
}

function initNav() {
  document.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      showSection(a.dataset.section);
      history.pushState({}, '', `#${a.dataset.section}`);
    });
  });
}

function routeFromHash() {
  const hash = location.hash.replace('#', '') || 'dashboard';
  const id   = sections.includes(hash) ? hash : 'dashboard';
  showSection(id);
}

document.addEventListener('DOMContentLoaded', () => {
  init();
  initNav();
  routeFromHash();
  window.addEventListener('popstate', routeFromHash);
  subscribe(() => {
    const active = location.hash.replace('#', '') || 'dashboard';
    if (active === 'dashboard') renderDashboard();
    if (active === 'records')   renderRecords();
  });
});