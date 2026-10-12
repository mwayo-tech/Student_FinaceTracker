// scripts/ui/settings.js
import { getSettings, updateSettings } from '../state.js';

export function renderSettings() {
  const section  = document.getElementById('section-settings');
  if (!section) return;
  const s = getSettings();

  section.innerHTML = `
    <h2>Settings</h2>

    <form id="settings-form" aria-label="App settings" novalidate>
      <fieldset>
        <legend>Currency</legend>
        <div class="form-row form-row-2">
          <div class="field-wrap">
            <label for="s-currency">Base currency</label>
            <select id="s-currency" name="currency">
              ${['GHS','USD','EUR'].map(c => `<option ${c===s.currency?'selected':''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="field-wrap">
            <label for="s-budget">Monthly budget</label>
            <input id="s-budget" name="monthlyBudget" type="number" min="1" step="1" value="${s.monthlyBudget}">
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Exchange Rates (manual)</legend>
        <p class="hint">Set rates relative to GHS.</p>
        <div class="form-row form-row-2">
          <div class="field-wrap">
            <label for="s-usd">1 USD =</label>
            <input id="s-usd" name="rateUSD" type="number" step="0.001" min="0.001" value="${s.rates?.USD ?? 0.067}"> GHS
          </div>
          <div class="field-wrap">
            <label for="s-eur">1 EUR =</label>
            <input id="s-eur" name="rateEUR" type="number" step="0.001" min="0.001" value="${s.rates?.EUR ?? 0.061}"> GHS
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Categories</legend>
        <p class="hint">Comma-separated list.</p>
        <div class="field-wrap">
          <label for="s-cats" class="sr-only">Categories</label>
          <input id="s-cats" name="categories" type="text" value="${(s.categories||[]).join(', ')}">
        </div>
      </fieldset>

      <div class="form-actions">
        <button type="submit" class="btn-primary">Save Settings</button>
      </div>
      <div id="settings-msg" role="status" aria-live="polite" class="form-success"></div>
    </form>
  `;

  document.getElementById('settings-form').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const cats = fd.get('categories').split(',').map(c => c.trim()).filter(Boolean);
    updateSettings({
      currency:      fd.get('currency'),
      monthlyBudget: parseFloat(fd.get('monthlyBudget')) || 500,
      categories:    cats.length ? cats : ['Food','Books','Transport','Entertainment','Fees','Other'],
      rates: {
        GHS: 1,
        USD: parseFloat(fd.get('rateUSD')) || 0.067,
        EUR: parseFloat(fd.get('rateEUR')) || 0.061,
      },
    });
    const msg = document.getElementById('settings-msg');
    if (msg) { msg.textContent = 'Settings saved!'; setTimeout(()=>{ msg.textContent=''; },3000); }
  });
}