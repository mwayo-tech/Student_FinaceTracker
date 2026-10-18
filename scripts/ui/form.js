// scripts/ui/form.js
import { addRecord, generateId, getSettings } from '../state.js';
import { validateDescription, validateAmount, validateDate, validateCategory } from '../validators.js';

export function renderForm() {
  const section  = document.getElementById('section-add');
  if (!section) return;
  const settings = getSettings();
  const cats     = settings.categories || ['Food','Books','Transport','Entertainment','Fees','Other'];

  section.innerHTML = `
    <h2>Add Transaction</h2>
    <form id="add-form" novalidate aria-label="Add new transaction">
      <div class="form-row">
        <div class="field-wrap">
          <label for="f-description">Description</label>
          <input id="f-description" name="description" type="text" maxlength="120"
                 autocomplete="off" aria-required="true" aria-describedby="err-description">
          <span id="err-description" class="field-error" role="alert"></span>
        </div>
      </div>

      <div class="form-row form-row-2">
        <div class="field-wrap">
          <label for="f-amount">Amount (${settings.currency || 'GHS'})</label>
          <input id="f-amount" name="amount" type="number" min="0.01" step="0.01"
                 aria-required="true" aria-describedby="err-amount">
          <span id="err-amount" class="field-error" role="alert"></span>
        </div>
        <div class="field-wrap">
          <label for="f-date">Date</label>
          <input id="f-date" name="date" type="date" aria-required="true"
                 aria-describedby="err-date" value="${new Date().toISOString().slice(0,10)}">
          <span id="err-date" class="field-error" role="alert"></span>
        </div>
      </div>

      <div class="form-row">
        <div class="field-wrap">
          <label for="f-category">Category</label>
          <select id="f-category" name="category" aria-required="true" aria-describedby="err-category">
            ${cats.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
          <span id="err-category" class="field-error" role="alert"></span>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary">Save Transaction</button>
        <button type="reset" class="btn-secondary">Clear</button>
      </div>

      <div id="form-success" class="form-success" role="status" aria-live="polite"></div>
    </form>
  `;

  const form = document.getElementById('add-form');

  // Real time validation on blur
  form.querySelector('#f-description').addEventListener('blur', e => {
    showError('description', validateDescription(e.target.value));
  });
  form.querySelector('#f-amount').addEventListener('blur', e => {
    showError('amount', validateAmount(e.target.value));
  });
  form.querySelector('#f-date').addEventListener('blur', e => {
    showError('date', validateDate(e.target.value));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const errors = {
      description: validateDescription(data.description),
      amount:      validateAmount(data.amount),
      date:        validateDate(data.date),
      category:    validateCategory(data.category),
    };

    let firstInvalid = null;
    Object.entries(errors).forEach(([field, msg]) => {
      showError(field, msg);
      if (msg && !firstInvalid) firstInvalid = document.getElementById(`f-${field}`);
    });

    if (firstInvalid) { firstInvalid.focus(); return; }

    const now = new Date().toISOString();
    addRecord({
      id:          generateId(),
      description: data.description.trim(),
      amount:      parseFloat(data.amount),
      category:    data.category,
      date:        data.date,
      createdAt:   now,
      updatedAt:   now,
    });

    form.reset();
    form.querySelector('#f-date').value = new Date().toISOString().slice(0,10);
    const successEl = document.getElementById('form-success');
    if (successEl) {
      successEl.textContent = 'Transaction saved!';
      setTimeout(() => { successEl.textContent = ''; }, 3000);
    }
    form.querySelector('#f-description').focus();
  });
}

function showError(field, msg) {
  const el = document.getElementById(`err-${field}`);
  const input = document.getElementById(`f-${field}`);
  if (el) el.textContent = msg || '';
  if (input) {
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    input.classList.toggle('input-error', !!msg);
  }
}