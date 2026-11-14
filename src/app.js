'use strict';

/* DOM wiring. The testable logic lives in calculator.js and ui-model.js. */
(function () {
  const display = document.getElementById('display');
  const model = window.CalculatorModel.createCalculatorModel();

  function render() {
    display.textContent = model.display();
  }

  document.querySelector('.keys').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) {
      return;
    }
    const value = button.dataset.value ?? button.dataset.action;
    if (value === undefined) {
      return;
    }
    try {
      model.press(value);
    } catch (error) {
      display.textContent = error.message;
      model.reset();
      return;
    }
    render();
  });

  document.addEventListener('keydown', (event) => {
    const map = {
      Enter: 'equals',
      '=': 'equals',
      Escape: 'clear',
      Backspace: 'backspace',
      Delete: 'clear',
      x: '*',
      X: '*',
    };
    const value = map[event.key] ?? event.key;
    const isHandled =
      value === 'equals' ||
      value === 'clear' ||
      value === 'backspace' ||
      /^[0-9.]$/.test(value) ||
      window.CalculatorCore.isOperator(value);
    if (isHandled) {
      event.preventDefault();
      model.press(value);
      render();
    }
  });

  render();
})();
