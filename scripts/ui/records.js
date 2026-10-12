// scripts/ui/records.js
import { getRecords, getSettings, deleteRecord, updateRecord } from '../state.js';
import { compileRegex, highlight, validateRecord } from '../validators.js';

let sortKey   = 'date';
let sortDir   = -1;
let searchRaw = '';

export function renderRecords() {
  const section = document.getElementById('section-records');
  if (!section) return;

  const records  = getRecords();
  const settings = getSettings();
  const currency = settings.currency || 'GHS';

  section.innerHTML = `
    <h2>Transactions</h2>
    <div class="records-toolbar">
      <div class="search-wrap">
        <label for="search-input" class="sr-only">Search (regex)</label>
        <input id="search-input" type="search" placeholder="Search or regex…" value="${escAttr(searchRaw)}" aria-label="Search transactions using regex">
        <span id="search-status" class="search-status" role="status" aria-live="polite"></span>
      </div>
      <label class="toggle-wrap">
        <input type="checkbox" id="case-toggle"> Case-sensitive
      </label>
    </div>

    <div class="table-wrap" role="region" aria-label="Transactions table" tabindex="0">
      <table id="records-table">
        <thead>
          <tr>
            <th><button class="sort-btn" data-key="date" aria-label="Sort by date">Date <span class="sort-icon" data-key="date"></span></button></th>
            <th><button class="sort-btn" data-key="description" aria-label="Sort by description">Description <span class="sort-icon" data-key="description"></span></button></th>
            <th><button class="sort-btn" data-key="category" aria-label="Sort by category">Category <span class="sort-icon" data-key="category"></span></button></th>
            <th><button class="sort-btn" data-key="amount" aria-label="Sort by amount">Amount <span class="sort-icon" data-key="amount"></span></button></th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="records-body"></tbody>
      </table>
    </div>
    <p id="records-count" class="records-count" role="status" aria-live="polite"></p>
    <div class="import-export-bar">
      <button id="btn-export">Export JSON</button>
      <label class="file-label" tabindex="0">Import JSON <input type="file" id="btn-import" accept=".json" class="sr-only"></label>
    </div>
  `;

  refreshTable(currency);
  bindRecordEvents(currency);
}

function refreshTable(currency) {
  const records  = getRecords();
  const settings = getSettings();
  const cur      = currency || settings.currency || 'GHS';
  const caseSens = document.getElementById('case-toggle')?.checked;
  const flags    = caseSens ? '' : 'i';
  const re       = compileRegex(searchRaw, flags);
  const statusEl = document.getElementById('search-status');

  if (searchRaw && !re && statusEl) {
    statusEl.textContent = 'Invalid regex pattern.';
    statusEl.classList.add('error');
  } else if (statusEl) {
    statusEl.textContent = '';
    statusEl.classList.remove('error');
  }

  let filtered = re
    ? records.filter(r => re.test(r.description) || re.test(r.category))
    : [...records];

  filtered.sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey];
    if (sortKey === 'amount') { av = parseFloat(av); bv = parseFloat(bv); }
    if (av < bv) return -1 * sortDir;
    if (av > bv) return  1 * sortDir;
    return 0;
  });

  const tbody = document.getElementById('records-body');
  const countEl = document.getElementById('records-count');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-row">No records found. Add one!</td></tr>`;
  } else {
    tbody.innerHTML = filtered.map(r => `
      <tr data-id="${r.id}">
        <td data-label="Date">${escHtml(r.date)}</td>
        <td data-label="Description">${highlight(r.description, re)}</td>
        <td data-label="Category"><span class="tag">${highlight(r.category, re)}</span></td>
        <td data-label="Amount">${cur} ${parseFloat(r.amount).toFixed(2)}</td>
        <td data-label="Actions" class="actions-cell">
          <button class="btn-edit" data-id="${r.id}" aria-label="Edit ${escAttr(r.description)}">Edit</button>
          <button class="btn-delete" data-id="${r.id}" aria-label="Delete ${escAttr(r.description)}">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  if (countEl) countEl.textContent = `Showing ${filtered.length} of ${records.length} records.`;

  // Update sort icons
  document.querySelectorAll('.sort-icon').forEach(el => {
    el.textContent = el.dataset.key === sortKey ? (sortDir === 1 ? ' ↑' : ' ↓') : '';
  });
}

function bindRecordEvents(currency) {
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (sortKey === btn.dataset.key) sortDir *= -1;
      else { sortKey = btn.dataset.key; sortDir = 1; }
      refreshTable(currency);
    });
  });

  document.getElementById('search-input')?.addEventListener('input', e => {
    searchRaw = e.target.value;
    refreshTable(currency);
  });

  document.getElementById('case-toggle')?.addEventListener('change', () => refreshTable(currency));

  document.getElementById('records-body')?.addEventListener('click', e => {
    const id = e.target.dataset.id;
    if (!id) return;
    if (e.target.classList.contains('btn-delete')) {
      if (confirm('Delete this record?')) { deleteRecord(id); renderRecords(); }
    }
    if (e.target.classList.contains('btn-edit')) {
      openInlineEdit(id, currency);
    }
  });

  document.getElementById('btn-export')?.addEventListener('click', () => {
    import('../storage.js').then(m => m.exportJSON(getRecords()));
  });

  document.getElementById('btn-import')?.addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { importJSON } = await import('../storage.js');
      const { addRecord, generateId } = await import('../state.js');
      const imported = await importJSON(file);
      imported.forEach(r => {
        r.id = generateId();
        r.createdAt = r.createdAt || new Date().toISOString();
        r.updatedAt = new Date().toISOString();
        addRecord(r);
      });
      renderRecords();
      announce(`Imported ${imported.length} records.`);
    } catch (err) {
      alert(`Import failed: ${err}`);
    }
  });
}

function openInlineEdit(id, currency) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (!row) return;
  const records  = getRecords();
  const settings = getSettings();
  const r        = records.find(x => x.id === id);
  if (!r) return;
  const cats = settings.categories || ['Food','Books','Transport','Entertainment','Fees','Other'];

  row.innerHTML = `
    <td><input class="edit-field" name="date" type="date" value="${r.date}" aria-label="Date"></td>
    <td><input class="edit-field" name="description" type="text" value="${escAttr(r.description)}" aria-label="Description"></td>
    <td>
      <select class="edit-field" name="category" aria-label="Category">
        ${cats.map(c => `<option ${c===r.category?'selected':''}>${c}</option>`).join('')}
      </select>
    </td>
    <td><input class="edit-field" name="amount" type="number" step="0.01" min="0.01" value="${r.amount}" aria-label="Amount"></td>
    <td class="actions-cell">
      <button class="btn-save-edit" data-id="${id}">Save</button>
      <button class="btn-cancel-edit">Cancel</button>
    </td>
  `;

  row.querySelector('.btn-cancel-edit').addEventListener('click', renderRecords);
  row.querySelector('.btn-save-edit').addEventListener('click', () => {
    const fields = row.querySelectorAll('.edit-field');
    const changes = {};
    fields.forEach(f => { changes[f.name] = f.value; });
    const errors = validateRecord({ ...r, ...changes });
    const firstError = Object.values(errors).find(Boolean);
    if (firstError) { alert(firstError); return; }
    updateRecord(id, changes);
    renderRecords();
  });
}

function announce(msg) {
  const el = document.getElementById('live-announce');
  if (el) { el.textContent = ''; setTimeout(() => { el.textContent = msg; }, 50); }
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function escAttr(str) {
  return String(str).replace(/"/g,'&quot;');
}