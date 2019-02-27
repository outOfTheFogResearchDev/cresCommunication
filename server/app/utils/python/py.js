const { spawn } = require('child_process');

module.exports = file => (...args) =>
  new Promise((resolve, reject) => {
    let response;
    let error;

    const scriptExecution = spawn('python.exe', [`${__dirname}/${file}.py`, ...args]);

    scriptExecution.stdout.on('data', data => {
      response = String.fromCharCode.apply(null, data);
    });

    scriptExecution.stderr.on('data', data => {
      error = String.fromCharCode.apply(null, data);
    });

    scriptExecution.on('exit', () => (error ? reject(error) : resolve(response)));
  });
