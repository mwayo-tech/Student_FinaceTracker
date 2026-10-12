// scripts/state.js
import { loadRecords, saveRecords, loadSettings, saveSettings } from './storage.js';

let records  = [];
let settings = {};
let listeners = [];

export function init() {
  records  = loadRecords();
  settings = loadSettings();
}

export function getRecords()  { return [...records]; }
export function getSettings() { return { ...settings }; }

export function addRecord(record) {
  records.push(record);
  saveRecords(records);
  notify();
}

export function updateRecord(id, changes) {
  records = records.map(r =>
    r.id === id ? { ...r, ...changes, updatedAt: new Date().toISOString() } : r
  );
  saveRecords(records);
  notify();
}

export function deleteRecord(id) {
  records = records.filter(r => r.id !== id);
  saveRecords(records);
  notify();
}

export function updateSettings(changes) {
  settings = { ...settings, ...changes };
  saveSettings(settings);
  notify();
}

export function subscribe(fn) { listeners.push(fn); }
function notify() { listeners.forEach(fn => fn()); }

export function generateId() {
  const max = records.reduce((m, r) => {
    const n = parseInt(r.id.replace('txn_', ''), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `txn_${String(max + 1).padStart(4, '0')}`;
}