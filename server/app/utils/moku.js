const { spawn } = require('child_process');
const axios = require('axios');
const telnet = require('./telnet');

let moku;
const pythonPort = axios.create({ baseURL: 'http://127.0.0.1:5000' });

module.exports = {
  connected: false,
  connect() {
    return new Promise(resolve => {
      moku = spawn('python.exe', [`${__dirname}/python/mokuConnection.py`]);
      moku.stdout.on('data', data => {
        if (!this.connected) {
          this.connected = true;
          resolve(data);
        }
      });
    });
  },
  genPhase: args => pythonPort('/gen', { params: args }),
  async setPoint(frequency, power, degrees) {
    let code = Math.floor((frequency - 102.5) / 5);
    if (code < 0) code = 0;
    if (code > 18) code = 18;
    await telnet.write(`SetFreq ${code}`);
    await this.genPhase({ channel: 1, frequency, power: power > 0 ? power : 0, degrees: degrees > 0 ? degrees : 0 });
    await this.genPhase({
      channel: 2,
      frequency,
      power: power < 0 ? -1 * power : 0,
      degrees: degrees < 0 ? -1 * degrees : 0,
    });
  },

  async gracefulShutdown() {
    await pythonPort('/shutdown');
    this.connected = false;
    moku.kill();
    moku = null;
  },
};
