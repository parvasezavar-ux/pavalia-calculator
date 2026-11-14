# Pavalia Calculator

A small, dependency-free web calculator supporting addition, subtraction,
multiplication and division.

## Run it

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 12000
# then open http://localhost:12000/
```

## Tests

Uses the Node.js built-in test runner (`node:test`). No external packages,
no network access.

```bash
npm test        # or: node --test
```

## Layout

| Path | Purpose |
| --- | --- |
| `index.html` | Keypad markup |
| `styles.css` | Presentation |
| `src/calculator.js` | Pure arithmetic + expression evaluation |
| `src/ui-model.js` | Keypad input model (no DOM) |
| `src/app.js` | DOM wiring for clicks and keyboard |
| `test/` | `node:test` suites |
