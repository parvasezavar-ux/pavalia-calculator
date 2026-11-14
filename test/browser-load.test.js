'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SRC = path.join(__dirname, '..', 'src');

/**
 * Load the browser scripts the way index.html does: as classic scripts that
 * share one global scope. This catches collisions that per-module CommonJS
 * loading hides (for example two files declaring the same top-level const).
 */
function loadLikeBrowser(files) {
  const context = { window: {}, console };
  context.window.window = context.window;
  vm.createContext(context);
  for (const file of files) {
    const code = fs.readFileSync(path.join(SRC, file), 'utf8');
    vm.runInContext(code, context, { filename: file });
  }
  return context.window;
}

test('browser load: calculator.js and ui-model.js share scope without clashing', () => {
  const sharedWindow = loadLikeBrowser(['calculator.js', 'ui-model.js']);
  assert.equal(typeof sharedWindow.CalculatorCore, 'object');
  assert.equal(typeof sharedWindow.CalculatorModel, 'object');
  assert.equal(typeof sharedWindow.CalculatorModel.createCalculatorModel, 'function');
});

test('browser load: keypad model computes through the exposed core', () => {
  const sharedWindow = loadLikeBrowser(['calculator.js', 'ui-model.js']);
  const model = sharedWindow.CalculatorModel.createCalculatorModel();
  for (const key of ['2', '+', '3', '*', '4', 'equals']) {
    model.press(key);
  }
  assert.equal(model.display(), '14');
});

test('index.html: loads every script the page depends on', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(scripts, [
    'src/calculator.js',
    'src/ui-model.js',
    'src/app.js',
  ]);
});
