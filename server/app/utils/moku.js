const { spawn } = require('child_process');
const axios = require('axios');

let moku;
const pythonPort = axios.create({ baseURL: 'http://127.0.0.1:5000' });

module.exports = {
  connect: () =>
    new Promise(resolve => {
      moku = spawn('python.exe', [`${__dirname}/python/mokuConnection.py`]);
      let first = true;
      moku.stdout.on('data', data => {
        if (first) {
          first = false;
          resolve(data);
        }
      });
    }),
  genPhase: args => pythonPort('/gen', { params: args }),
  gracefulShutdown: async () => {
    await pythonPort('/shutdown');
    moku.kill();
    moku = null;
  },
};
