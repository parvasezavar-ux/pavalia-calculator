'use strict';

/**
 * Keypad input model. Converts button presses into a display string.
 * Kept free of DOM access so the interaction logic is unit testable.
 *
 * Wrapped in an IIFE so its top-level names cannot collide with other
 * classic <script> files that share the same global scope.
 */
(function () {
  const CalculatorCore =
    typeof module !== 'undefined' && module.exports
      ? require('./calculator.js')
      : window.CalculatorCore;

  const MAX_DIGITS = 12;

  function createCalculatorModel() {
    let current = '0';
    let expression = '';
    let justEvaluated = false;

    const isOperatorChar = (ch) => CalculatorCore.OPERATORS.includes(ch);

    function display() {
      return expression ? expression + current : current;
    }

    function reset() {
      current = '0';
      expression = '';
      justEvaluated = false;
    }

    function inputDigit(digit) {
      if (justEvaluated) {
        reset();
      }
      const digitCount = current.replace(/[^0-9]/g, '').length;
      if (digitCount >= MAX_DIGITS && !current.startsWith('-')) {
        return display();
      }
      if (current === '0') {
        current = digit;
      } else if (current === '-0') {
        current = '-' + digit;
      } else {
        current += digit;
      }
      return display();
    }

    function inputDot() {
      if (justEvaluated) {
        reset();
      }
      if (!current.includes('.')) {
        current += '.';
      }
      return display();
    }

    function inputOperator(operator) {
      if (!isOperatorChar(operator)) {
        throw new SyntaxError(`Unknown operator: ${operator}`);
      }
      justEvaluated = false;
      if (current === '0' && expression === '' && operator === '-') {
        current = '-0';
        return display();
      }
      expression += current + operator;
      current = '0';
      return display();
    }

    function evaluate() {
      if (!expression) {
        return display();
      }
      const value = CalculatorCore.evaluateExpression(expression + current);
      current = String(value);
      expression = '';
      justEvaluated = true;
      return display();
    }

    function backspace() {
      if (justEvaluated) {
        reset();
        return display();
      }
      if (current.length > 1) {
        current = current.slice(0, -1);
      } else {
        current = '0';
      }
      return display();
    }

    function press(value) {
      if (value === 'clear') {
        reset();
        return display();
      }
      if (value === 'equals') {
        return evaluate();
      }
      if (value === 'backspace') {
        return backspace();
      }
      if (value === '.') {
        return inputDot();
      }
      if (isOperatorChar(value)) {
        return inputOperator(value);
      }
      if (/^[0-9]$/.test(value)) {
        return inputDigit(value);
      }
      throw new SyntaxError(`Unknown key: ${value}`);
    }

    return {
      press,
      display,
      reset,
      getState: () => ({ current, expression, justEvaluated }),
    };
  }

  const api = { createCalculatorModel, MAX_DIGITS };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof window !== 'undefined') {
    window.CalculatorModel = api;
  }
})();
