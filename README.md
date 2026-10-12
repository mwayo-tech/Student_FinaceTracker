# Student Finance Tracker

A fully accessible, responsive, vanilla HTML/CSS/JS finance tracker for students.

**Live demo:**  https://mwayo-tech.github.io/Student_FinaceTracker/

---

## Features

- Add, edit, delete transactions with live validation
- Monthly budget with progress bar and ARIA live alerts
- 7-day spending trend chart (pure CSS/JS)
- Regex-powered live search with match highlighting
- Sort by date, description, category, or amount
- JSON import/export with structure validation
- Multi-currency settings (GHS, USD, EUR) with manual rates
- LocalStorage persistence — no server needed
- Dark mode via `prefers-color-scheme`
- Full keyboard navigation and screen-reader support

---

## Regex Catalog

| Pattern | Purpose | Example match |
|---|---|---|
| `/^\S(?:.*\S)?$/` | No leading/trailing spaces | `"Lunch"` ✓, `" lunch"` ✗ |
| `/^(0\|[1-9]\d*)(\.\d{1,2})?$/` | Valid positive amount | `"12.50"` ✓, `"12.999"` ✗ |
| `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$/` | ISO date | `"2025-09-28"` ✓ |
| `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | Category | `"Food"`, `"Food-Drink"` ✓ |
| `/\b(\w+)\s+\1\b/i` | **ADVANCED** back-ref duplicate word | `"dinner dinner"` ✗ |
| `/\.\d{2}\b/` | Search: amounts with cents | finds `12.50` |
| `/(coffee\|tea)/i` | Search: beverage keyword | finds `"Coffee with friends"` |

---

## Keyboard Map

| Key | Action |
|---|---|
| `Tab` | Move forward through interactive elements |
| `Shift+Tab` | Move backward |
| `Enter` / `Space` | Activate button or link |
| `Enter` on form | Submit form |
| `Escape` | Cancel inline edit |
| Arrow keys | Navigate `<select>` options |

---

## Accessibility Notes

- Semantic landmarks: `header`, `nav`, `main`, `section`, `footer`
- All inputs have bound `<label>` elements
- Errors announced via `role="alert"` on each field
- Budget status uses `aria-live="polite"` (under budget) or `"assertive"` (over budget)
- Import confirmation uses a global `role="status"` live region
- Visible `:focus-visible` outlines on all interactive elements
- `prefers-reduced-motion` disables all animations
- Color contrast ≥ 4.5:1 for all text

---

## How to Run Tests

1. Serve the project locally (e.g. `npx serve .` or VS Code Live Server)
2. Open `http://localhost:PORT/tests.html`
3. All rows should show ✓ PASS

---

## Folder Structure

```
finance-tracker/
├── index.html
├── tests.html
├── seed.json
├── README.md
├── styles/
│   └── main.css
└── scripts/
    ├── main.js
    ├── state.js
    ├── storage.js
    ├── validators.js
    └── ui/
        ├── dashboard.js
        ├── records.js
        ├── form.js
        └── settings.js
```
