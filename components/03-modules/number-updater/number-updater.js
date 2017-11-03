
(function() { // eslint-disable-line
  'use strict';

  class numUpdater {

    constructor(updaterEl = false, counter = 0, min = 0, max = 10000) {

      if (updaterEl.length <= 0) {
        return;
      }
      this.counter = counter;
      this.minCounter = min;
      this.maxCounter = max;
      this.elem = {
        decrement: updaterEl.querySelector('.number-updater__button--decrement'),
        counter: {
          container: updaterEl.querySelector('.number-updater__counter'),
          input: updaterEl.querySelector('.number-updater__input')
        },
        increment: updaterEl.querySelector('.number-updater__button--increment')
      };

      document.addEventListener('DOMContentLoaded', this.bindEvents());
    }

    decrease(num = 1) {
      let shouldDecrease = this.counter > this.minCounter,
          nextCounter = shouldDecrease ? this.counter - num : this.counter;
      this.counter = nextCounter;
    }

    increase(num = 1) {
      let shouldIncrease = this.counter < this.maxCounter,
          nextCounter = shouldIncrease ? this.counter + num : this.counter;
      this.counter = nextCounter;
    }

    update() {
      this.elem.counter.input.value = this.counter;
    }

    changeInputValue(changeType) {
      if (changeType == 'increase') {
        this.increase();
      }
      else if (changeType === 'decrease') {
        this.decrease();
      }
      this.update();
    }

    updateInput(e) {
      let parseValue = parseInt(e.target.value);
      if (!isNaN(parseValue)
          && parseValue >= this.minCounter
          && parseValue <= this.maxCounter) {
        this.counter = parseValue;
        this.update();
      } else {
        e.preventDefault();
        e.target.value = this.counter;
      }
    }

    startInput() {
      this.elem.counter.container.classList.add('is-input');
    }

    endInput() {
      this.elem.counter.container.classList.remove('is-input');
    }

    bindEvents() {
      this.elem.decrement.addEventListener(
        'click',
        () => this.changeInputValue('decrease')
      );
      this.elem.increment.addEventListener(
        'click',
        () => this.changeInputValue('increase')
      );
      this.elem.counter.input.addEventListener(
        'input',
        evt => this.updateInput(evt)
      );

      this.elem.counter.input.addEventListener(
        'keydown',
        evt => this.keyboardUpdate(evt)
      );

      this.elem.counter.input.addEventListener('focus', () => this.startInput());
      this.elem.counter.input.addEventListener('blur', () => this.endInput());
    }

    keyboardUpdate(event) {
      const keyData = {
        up: 'ArrowUp',
        down: 'ArrowDown'
      };
      switch (event.key) {
      case keyData.up:
        this.changeInputValue('increase');
        break;
      case keyData.down:
        this.changeInputValue('decrease');
        break;
      }
    }

  }

  const numberUpdaters = [...document.querySelectorAll('.number-updater')];
  numberUpdaters.forEach(numberUpdater => {
    new numUpdater(numberUpdater, 0, 0, 1000);
  });

}());
