const { timerModel } = require('./models/timer');

class TimersManager {
  constructor() {
    this.timers = [];
    this.logs = [];
    this.time = 0; // longest timer time
  }
  add(timer, ...args) {
    timer.args = args.length ? args : [];
    for (const [key, val] of Object.entries(timerModel)) {
      if (val.required === true && !timer.hasOwnProperty(key)) {
        throw new Error('No Required Filed');
      }
      if (
        (val.type === 'array' && !Array.isArray(timer[key])) ||
        (val.type !== 'array' && typeof timer[key] !== val.type)
      ) {
        throw new Error('Wrong Type');
      }
      if (timerModel['delay'].hasOwnProperty('min') && timer[key] < val.min) {
        throw new Error(`${key} less then ${val.min}`);
      }
      if (timerModel['delay'].hasOwnProperty('max') && timer[key] > val.max) {
        throw new Error(`${key} more then ${val.max}`);
      }
    }
    if (timer.delay > this.time) {
      this.time = timer.delay;
    }
    if (this._findTimer(timer.name)) {
      throw new Error('Name already exist');
    }
    this.timers.push(timer);
    return this;
  }
  remove(timerName) {
    const { index, timer } = this._findTimer(timerName);
    const timerID = timer?.id;
    if (timerID) {
      clearTimeout(timerID);
    }
    this.timers.splice(index, 1);
  }
  _findTimer(timerName) {
    for (const [index, val] of this.timers.entries()) {
      if (val.name === timerName) {
        return { index: index, timer: val };
      }
    }
    return false;
  }
  _log(timer) {
    return (...args) => {
      let { name, job } = timer;
      let log = {};
      const callback = (...args) => {
        try {
          return job(...args);
        } catch (err) {
          log.error = {
            name: err.name,
            message: err.message,
            stack: err.stack,
          };
        }
      };
      log = {
        name: name,
        in: args,
        out: callback(...args),
        created: new Date(),
      };
      this.logs.push(log);
      return callback(...args);
    };
  }
  start() {
    for (const val of this.timers) {
      this.run(val);
    }
    console.log('After 10 seconds of starting the timers will be cleared');
    setTimeout(this.stop.bind(this), this.time + 10000);
  }
  stop() {
    for (const [index, timer] of this.timers.entries()) {
      if (timer.id) {
        clearTimeout(timer.id);
      }
    }
    this.timers = [];
  }

  pause(timerName) {
    const timer = this._findTimer(timerName)?.timer;
    if (timer.id) {
      clearTimeout(timer.id);
    } else {
      throw new Error('Timer isn`t running');
    }
  }
  resume(timerName) {
    const timer = this._findTimer(timerName);
    if (timer === false) {
      throw Error('No timer by this name');
    }
    this.run(timer.timer);
  }
  run(timer) {
    const { delay, interval, args } = timer;
    const job = this._log(timer);
    if (interval === false) {
      timer.id = args?.length
        ? setTimeout(job, delay, ...args)
        : setTimeout(job, delay);
    } else {
      timer.id = args?.length
        ? setInterval(job, delay, ...args)
        : setInterval(job, delay);
    }
    console.log(this.logs);
  }
  print() {
    return this.logs;
  }
}
const manager = new TimersManager();
const t1 = {
  name: 't1',
  interval: true,
  delay: 5000,
  job: () => {
    console.log('t1');
  },
};
const t2 = {
  name: 't2',
  delay: 1000,
  interval: false,
  job: (a, b) => a + b,
};
const t3 = {
  name: 't3',
  delay: 1000,
  interval: false,
  job: () => {
    throw new Error('We have a problem!');
  },
};
manager.add(t1).add(t2, 1, 2);
manager.add(t3, 1); // 1
manager.start();
console.log(1);
setTimeout(() => {
  manager.pause('t1');
  console.log('paused');
  console.log(manager.print());
}, 7000);
setTimeout(() => {
  manager.resume('t1');
  console.log('resumed');
}, 8000);
