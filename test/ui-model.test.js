'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { createCalculatorModel, MAX_DIGITS } = require('../src/ui-model.js');

function pressAll(model, keys) {
  for (const key of keys) {
    model.press(key);
  }
  return model.display();
}

test('model: starts at 0', () => {
  const model = createCalculatorModel();
  assert.equal(model.display(), '0');
});

test('model: digits build a number', () => {
  const model = createCalculatorModel();
  assert.equal(pressAll(model, ['1', '2', '3']), '123');
});

test('model: leading zeros are replaced', () => {
  const model = createCalculatorModel();
  assert.equal(pressAll(model, ['0', '0', '7']), '7');
});

test('model: decimal point', () => {
  const model = createCalculatorModel();
  assert.equal(pressAll(model, ['3', '.', '1', '4']), '3.14');
  assert.equal(model.press('.'), '3.14');
});

test('model: clear resets everything', () => {
  const model = createCalculatorModel();
  pressAll(model, ['9', '+', '1']);
  assert.equal(model.press('clear'), '0');
});

test('model: backspace removes last character', () => {
  const model = createCalculatorModel();
  pressAll(model, ['4', '5', '6']);
  assert.equal(model.press('backspace'), '45');
  model.press('backspace');
  assert.equal(model.press('backspace'), '0');
});

test('model: addition', () => {
  const model = createCalculatorModel();
  assert.equal(pressAll(model, ['2', '+', '3', 'equals']), '5');
});

test('model: subtraction', () => {
  const model = createCalculatorModel();
  assert.equal(pressAll(model, ['9', '-', '4', 'equals']), '5');
});

test('model: multiplication', () => {
  const model = createCalculatorModel();
  assert.equal(pressAll(model, ['6', '*', '7', 'equals']), '42');
});

test('model: division', () => {
  const model = createCalculatorModel();
  assert.equal(pressAll(model, ['8', '/', '2', 'equals']), '4');
});

test('model: chained operations respect precedence', () => {
  const model = createCalculatorModel();
  assert.equal(pressAll(model, ['2', '+', '3', '*', '4', 'equals']), '14');
});

test('model: negative number entry', () => {
  const model = createCalculatorModel();
  assert.equal(pressAll(model, ['-', '5', 'equals']), '-5');
});

test('model: digit limit is enforced', () => {
  const model = createCalculatorModel();
  const keys = Array.from({ length: MAX_DIGITS + 5 }, () => '9');
  const result = pressAll(model, keys);
  assert.equal(result.length, MAX_DIGITS);
});

test('model: division by zero surfaces an error', () => {
  const model = createCalculatorModel();
  pressAll(model, ['5', '/', '0']);
  assert.throws(() => model.press('equals'), /Division by zero/);
});

test('model: unknown key throws', () => {
  const model = createCalculatorModel();
  assert.throws(() => model.press('%'), /Unknown key/);
});

test('model: result is reused for the next operation', () => {
  const model = createCalculatorModel();
  pressAll(model, ['2', '+', '2', 'equals']);
  assert.equal(pressAll(model, ['*', '3', 'equals']), '12');
});
