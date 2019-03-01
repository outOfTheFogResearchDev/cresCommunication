const { spawn } = require('child_process');
const axios = require('axios');

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
  async gracefulShutdown() {
    await pythonPort('/shutdown');
    this.connected = false;
    moku.kill();
    moku = null;
  },
};
