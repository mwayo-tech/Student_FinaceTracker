#M5: stats dashboard, budget cap, ARIA live
// scripts/ui/dashboard.js
import { getRecords, getSettings } from '../state.js';

export function renderDashboard() {
  const records  = getRecords();
  const settings = getSettings();
  const budget   = settings.monthlyBudget || 500;
  const currency = settings.currency || 'GHS';

  const now        = new Date();
  const thisMonth  = records.filter(r => r.date.startsWith(now.toISOString().slice(0,7)));
  const total      = thisMonth.reduce((s, r) => s + parseFloat(r.amount), 0);
  const remaining  = budget - total;
  const exceeded   = remaining < 0;

  // Top category
  const catMap = {};
  thisMonth.forEach(r => { catMap[r.category] = (catMap[r.category] || 0) + parseFloat(r.amount); });
  const topCat = Object.entries(catMap).sort((a,b) => b[1]-a[1])[0];

  // Last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0,10);
    const sum = records.filter(r => r.date === key).reduce((s,r) => s + parseFloat(r.amount), 0);
    days.push({ label: key.slice(5), sum });
  }
  const maxDay = Math.max(...days.map(d => d.sum), 1);

  const liveEl = document.getElementById('budget-live');
  if (liveEl) {
    liveEl.textContent = exceeded
      ? `Over budget by ${currency} ${Math.abs(remaining).toFixed(2)}!`
      : `${currency} ${remaining.toFixed(2)} remaining this month.`;
    liveEl.setAttribute('aria-live', exceeded ? 'assertive' : 'polite');
  }

  const dash = document.getElementById('section-dashboard');
  if (!dash) return;

  dash.innerHTML = `
    <h2>Dashboard</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">${currency} ${total.toFixed(2)}</span>
        <span class="stat-label">Spent this month</span>
      </div>
      <div class="stat-card ${exceeded ? 'stat-over' : 'stat-ok'}">
        <span class="stat-value">${exceeded ? '-' : ''}${currency} ${Math.abs(remaining).toFixed(2)}</span>
        <span class="stat-label">${exceeded ? 'Over budget' : 'Remaining'}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${records.length}</span>
        <span class="stat-label">Total records</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${topCat ? topCat[0] : '—'}</span>
        <span class="stat-label">Top category</span>
      </div>
    </div>

    <div class="budget-bar-wrap" role="region" aria-label="Budget progress">
      <div class="budget-bar-labels">
        <span>Budget: ${currency} ${budget}</span>
        <span>${Math.min(Math.round((total/budget)*100),100)}% used</span>
      </div>
      <div class="budget-bar" role="progressbar" aria-valuenow="${Math.min(total,budget)}" aria-valuemin="0" aria-valuemax="${budget}">
        <div class="budget-fill ${exceeded ? 'fill-over' : ''}" style="width:${Math.min((total/budget)*100,100)}%"></div>
      </div>
    </div>

    <div id="budget-live" class="live-region" role="status" aria-live="polite">
      ${exceeded
        ? `Over budget by ${currency} ${Math.abs(remaining).toFixed(2)}!`
        : `${currency} ${remaining.toFixed(2)} remaining this month.`}
    </div>

    <h3>Last 7 Days</h3>
    <div class="chart" aria-label="Spending over the last 7 days">
      ${days.map(d => `
        <div class="chart-col">
          <div class="chart-bar-wrap">
            <div class="chart-bar" style="height:${d.sum ? Math.round((d.sum/maxDay)*100) : 2}%" title="${currency} ${d.sum.toFixed(2)}"></div>
          </div>
          <span class="chart-label">${d.label}</span>
        </div>
      `).join('')}
    </div>
  `;
}