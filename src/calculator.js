'use strict';

/**
 * Pure calculator logic. No DOM access, so it runs both in Node (for tests)
 * and in the browser (exposed as the CalculatorCore global).
 *
 * Wrapped in an IIFE because classic <script> tags share a single global
 * scope; without it, top-level `const` names would clash between source files.
 */
(function () {
  const OPERATORS = ['+', '-', '*', '/'];

  function isOperator(token) {
    return OPERATORS.includes(token);
  }

  /** Apply a single binary operation. Throws on a bad operator or divide by zero. */
  function applyOperator(a, b, operator) {
    if (
      typeof a !== 'number' ||
      typeof b !== 'number' ||
      Number.isNaN(a) ||
      Number.isNaN(b)
    ) {
      throw new TypeError('Operands must be valid numbers');
    }
    switch (operator) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        if (b === 0) {
          throw new RangeError('Division by zero');
        }
        return a / b;
      default:
        throw new SyntaxError(`Unknown operator: ${operator}`);
    }
  }

  /** Strip floating point noise, e.g. 0.1 + 0.2 -> 0.3. */
  function normalize(value) {
    if (!Number.isFinite(value)) {
      return value;
    }
    return Number.parseFloat(value.toPrecision(12));
  }

  /** Split an infix expression such as "12 + 3 * 4" into tokens. */
  function tokenize(expression) {
    const cleaned = String(expression).replace(/\s+/g, '');
    if (cleaned === '') {
      throw new SyntaxError('Empty expression');
    }
    const tokens = cleaned.match(/(\d+\.?\d*|\.\d+|[+\-*/])/g);
    if (!tokens || tokens.join('') !== cleaned) {
      throw new SyntaxError(`Invalid expression: ${expression}`);
    }
    return tokens;
  }

  /** Evaluate a token list using standard operator precedence (shunting-yard). */
  function evaluateTokens(tokens) {
    if (!Array.isArray(tokens) || tokens.length === 0) {
      throw new SyntaxError('Empty expression');
    }

    const values = [];
    const operators = [];
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };

    const reduceTop = () => {
      const operator = operators.pop();
      const b = values.pop();
      const a = values.pop();
      values.push(applyOperator(a, b, operator));
    };

    let expectValue = true;
    for (const raw of tokens) {
      if (expectValue) {
        const value = Number(raw);
        if (Number.isNaN(value)) {
          throw new SyntaxError(`Invalid number: ${raw}`);
        }
        values.push(value);
        expectValue = false;
      } else {
        if (!isOperator(raw)) {
          throw new SyntaxError(`Expected operator, got: ${raw}`);
        }
        while (
          operators.length &&
          precedence[operators[operators.length - 1]] >= precedence[raw]
        ) {
          reduceTop();
        }
        operators.push(raw);
        expectValue = true;
      }
    }

    if (expectValue) {
      throw new SyntaxError('Expression ends with an operator');
    }

    while (operators.length) {
      reduceTop();
    }

    return normalize(values.pop());
  }

  /** Evaluate an infix expression string. */
  function evaluateExpression(expression) {
    return evaluateTokens(tokenize(expression));
  }

  /** Convenience helper for two-operand calculations. */
  function calculate(a, b, operator) {
    return normalize(applyOperator(Number(a), Number(b), operator));
  }

  const api = {
    OPERATORS,
    isOperator,
    applyOperator,
    normalize,
    tokenize,
    evaluateTokens,
    evaluateExpression,
    calculate,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof window !== 'undefined') {
    window.CalculatorCore = api;
  }
})();
