const { spawn } = require('child_process');
const axios = require('axios');
const { setFrequency } = require('./global');

let moku;
let actions = 0;
const pythonPort = axios.create({ baseURL: 'http://127.0.0.1:5000' });

module.exports = {
  connected: false,
  connect() {
    return new Promise(resolve => {
      moku = spawn('python.exe', [`${__dirname}/python/mokuConnection.py`]);
      moku.stdout.on('data', data => {
        if (!this.connected) {
          this.connected = true;
          actions = 0;
          resolve(data);
        }
      });
    });
  },
  genPhase: args => pythonPort('/gen', { params: args }),
  async setPoint(frequency, power, degrees) {
    if (actions >= 150) {
      await this.gracefulShutdown();
      await this.connect();
    }
    setFrequency(frequency);
    await this.genPhase({ channel: 1, frequency, power: power > 0 ? power : 0, degrees: degrees > 0 ? degrees : 0 });
    await this.genPhase({
      channel: 2,
      frequency,
      power: power < 0 ? -1 * power : 0,
      degrees: degrees < 0 ? -1 * degrees : 0,
    });
    actions += 1;
  },
  async gracefulShutdown() {
    if (!moku) return;
    await pythonPort('/shutdown');
    await new Promise(resolve => {
      moku.on('close', resolve);
      moku.kill();
    });
    this.connected = false;
    moku = null;
    actions = 0;
  },
};
