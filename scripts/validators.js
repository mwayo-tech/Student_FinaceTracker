#M3: regex validation rules complete
// scripts/validators.js
// All regex validation rules for the Student Finance Tracker

export const PATTERNS = {
  // No leading/trailing spaces; collapses to single non-space boundaries
  description: /^\S(?:.*\S)?$/,

  // Positive number with up to 2 decimal places
  amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,

  // Strict ISO date YYYY-MM-DD
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,

  // Category: letters, single spaces or hyphens between words
  category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,

  // ADVANCED: back-reference — detects duplicate consecutive words e.g. "dinner dinner"
  duplicateWord: /\b(\w+)\s+\1\b/i,
};

export function validateDescription(value) {
  if (!value || value.trim() === '') return 'Description is required.';
  if (!PATTERNS.description.test(value))
    return 'Description must not have leading or trailing spaces.';
  if (PATTERNS.duplicateWord.test(value))
    return 'Description contains a repeated word (e.g. "the the").';
  if (value.length > 120) return 'Description must be 120 characters or fewer.';
  return null;
}

export function validateAmount(value) {
  if (value === '' || value === null || value === undefined)
    return 'Amount is required.';
  if (!PATTERNS.amount.test(String(value)))
    return 'Amount must be a positive number with up to 2 decimal places.';
  if (parseFloat(value) <= 0) return 'Amount must be greater than zero.';
  if (parseFloat(value) > 99999.99) return 'Amount must be under 100,000.';
  return null;
}

export function validateDate(value) {
  if (!value) return 'Date is required.';
  if (!PATTERNS.date.test(value)) return 'Date must be in YYYY-MM-DD format.';
  return null;
}

export function validateCategory(value) {
  if (!value || value.trim() === '') return 'Category is required.';
  if (!PATTERNS.category.test(value))
    return 'Category may only contain letters, spaces, or hyphens.';
  return null;
}

export function validateRecord(record) {
  return {
    description: validateDescription(record.description),
    amount:      validateAmount(record.amount),
    date:        validateDate(record.date),
    category:    validateCategory(record.category),
  };
}

export function isValidRecord(record) {
  const errors = validateRecord(record);
  return Object.values(errors).every(e => e === null);
}

// Safe regex compiler for live search
export function compileRegex(input, flags = 'i') {
  try {
    return input ? new RegExp(input, flags) : null;
  } catch {
    return null;
  }
}

// Highlight matches inside text safely
export function highlight(text, re) {
  if (!re) return escapeHtml(text);
  return escapeHtml(text).replace(re, m => `<mark>${escapeHtml(m)}</mark>`);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}