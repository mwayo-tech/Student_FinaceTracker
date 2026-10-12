#M6: localStorage, import/export, settings
// scripts/storage.js
const RECORDS_KEY = 'sft:records';
const SETTINGS_KEY = 'sft:settings';

export function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveRecords(records) {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null') || defaultSettings();
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function defaultSettings() {
  return {
    currency: 'GHS',
    monthlyBudget: 500,
    categories: ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'],
    rates: { USD: 0.067, EUR: 0.061, GHS: 1 },
  };
}

// JSON export
export function exportJSON(records) {
  const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finance-tracker-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// JSON import with validation
export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data)) throw new Error('File must contain a JSON array.');
        const valid = data.filter(r =>
          r.id && r.description && r.amount !== undefined && r.date && r.category
        );
        if (valid.length === 0) throw new Error('No valid records found in file.');
        resolve(valid);
      } catch (err) {
        reject(err.message);
      }
    };
    reader.onerror = () => reject('Could not read file.');
    reader.readAsText(file);
  });
}