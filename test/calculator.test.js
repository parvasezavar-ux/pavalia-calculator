'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  applyOperator,
  calculate,
  normalize,
  tokenize,
  evaluateExpression,
  isOperator,
} = require('../src/calculator.js');

test('applyOperator: addition', () => {
  assert.equal(applyOperator(2, 3, '+'), 5);
  assert.equal(applyOperator(-4, 4, '+'), 0);
  assert.equal(applyOperator(1.5, 2.25, '+'), 3.75);
});

test('applyOperator: subtraction', () => {
  assert.equal(applyOperator(10, 4, '-'), 6);
  assert.equal(applyOperator(3, 7, '-'), -4);
  assert.equal(applyOperator(0, 0, '-'), 0);
});

test('applyOperator: multiplication', () => {
  assert.equal(applyOperator(6, 7, '*'), 42);
  assert.equal(applyOperator(-3, 5, '*'), -15);
  assert.equal(applyOperator(0.5, 8, '*'), 4);
});

test('applyOperator: division', () => {
  assert.equal(applyOperator(20, 5, '/'), 4);
  assert.equal(applyOperator(7, 2, '/'), 3.5);
  assert.equal(applyOperator(-9, 3, '/'), -3);
});

test('applyOperator: division by zero throws', () => {
  assert.throws(() => applyOperator(1, 0, '/'), RangeError);
  assert.throws(() => applyOperator(0, 0, '/'), /Division by zero/);
});

test('applyOperator: unknown operator throws', () => {
  assert.throws(() => applyOperator(1, 2, '%'), SyntaxError);
});

test('applyOperator: non-numeric operands throw', () => {
  assert.throws(() => applyOperator('1', 2, '+'), TypeError);
  assert.throws(() => applyOperator(Number.NaN, 2, '+'), TypeError);
});

test('normalize: removes floating point noise', () => {
  assert.equal(normalize(0.1 + 0.2), 0.3);
  assert.equal(normalize(1 / 3), 0.333333333333);
  assert.equal(normalize(Infinity), Infinity);
});

test('isOperator: recognises the four supported operators', () => {
  for (const op of ['+', '-', '*', '/']) {
    assert.equal(isOperator(op), true);
  }
  assert.equal(isOperator('%'), false);
  assert.equal(isOperator('5'), false);
});

test('tokenize: splits expressions and rejects bad input', () => {
  assert.deepEqual(tokenize('12 + 3*4'), ['12', '+', '3', '*', '4']);
  assert.deepEqual(tokenize('1.5/0.5'), ['1.5', '/', '0.5']);
  assert.throws(() => tokenize(''), /Empty expression/);
  assert.throws(() => tokenize('1 $ 2'), /Invalid expression/);
});

test('evaluateExpression: operator precedence', () => {
  assert.equal(evaluateExpression('2 + 3 * 4'), 14);
  assert.equal(evaluateExpression('10 - 2 * 3'), 4);
  assert.equal(evaluateExpression('20 / 4 + 1'), 6);
});

test('evaluateExpression: left associativity', () => {
  assert.equal(evaluateExpression('100 / 5 / 2'), 10);
  assert.equal(evaluateExpression('10 - 3 - 2'), 5);
});

test('evaluateExpression: parentheses-free chains', () => {
  assert.equal(evaluateExpression('1 + 2 + 3 + 4'), 10);
  assert.equal(evaluateExpression('2 * 3 * 4'), 24);
});

test('evaluateExpression: floating point results are normalised', () => {
  assert.equal(evaluateExpression('0.1 + 0.2'), 0.3);
  assert.equal(evaluateExpression('1 / 3 * 3'), 1);
});

test('evaluateExpression: error cases', () => {
  assert.throws(() => evaluateExpression('1 / 0'), /Division by zero/);
  assert.throws(() => evaluateExpression('1 +'), /ends with an operator/);
  assert.throws(() => evaluateExpression('* 2'), /Invalid number/);
});

test('calculate: two-operand convenience helper', () => {
  assert.equal(calculate(6, 3, '+'), 9);
  assert.equal(calculate(6, 3, '-'), 3);
  assert.equal(calculate(6, 3, '*'), 18);
  assert.equal(calculate(6, 3, '/'), 2);
  assert.equal(calculate('8', '2', '/'), 4);
});
