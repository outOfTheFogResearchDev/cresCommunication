const {
  promises: { writeFile, readFile, stat, mkdir, readdir, unlink },
} = require('fs');
const csvWrite = require('csv-stringify');
const csvRead = require('csv-parse');
const { asyncLoop } = require('./math');

const csvFolderLocation = './server/local';
const csvTempFolderLocation = `${csvFolderLocation}/temp`;
const csvLocation = name => `${csvFolderLocation}/${name || 'data'}.csv`;
const pointOptimizeLocation = (frequency, i, j) => `${csvTempFolderLocation}/${frequency}_${i}_${j}_Optimize.csv`;

const writeCsv = async (points, location) => {
  const csv = await new Promise(resolve => csvWrite(points, (err, data) => resolve(data)));
  // if the local folder doesnt exist, make it
  try {
    await stat(csvFolderLocation);
  } catch (e) {
    await mkdir(csvFolderLocation);
  }
  try {
    await stat(csvTempFolderLocation);
  } catch (e) {
    await mkdir(csvTempFolderLocation);
  }
  await writeFile(location(), csv);
};

const readCsv = async name => {
  // check to see if that channel has a history
  let csv;
  if (name) {
    csv = await readFile(`${csvTempFolderLocation}/${name}`, 'utf8');
  } else {
    csv = await readFile(csvLocation(), 'utf8');
  }
  return new Promise(resolve => csvRead(csv, (err, data) => resolve(data)));
};

const deleteFolder = async folder => {
  const names = await readdir(folder);
  await asyncLoop(0, names.length - 1, 1, async i => {
    await unlink(`${folder}/${names[i]}`);
  });
};

const concatCsv = async () => {
  try {
    await stat(csvTempFolderLocation);
  } catch (e) {
    await mkdir(csvTempFolderLocation);
  }
  const names = await readdir(csvTempFolderLocation);
  const frequency = names[0].substring(0, names[0].indexOf('_'));
  const points = [];
  await asyncLoop(0, names.length - 1, 1, async i => {
    const point = await readCsv(names[i]);
    points.push(point[0]);
  });
  await writeCsv(points, () => csvLocation(`${frequency}_Optimize`));
  await deleteFolder(csvTempFolderLocation);
};

module.exports = {
  async storePoints(points) {
    writeCsv(points, csvLocation);
  },
  async storeOptimize(points, frequency, i, j) {
    writeCsv(points, () => pointOptimizeLocation(frequency, i, j));
  },
  concatCsv,
  async storePhaseGraph(data, frequency) {
    writeCsv(data, () => csvLocation(`${frequency}_PhaseGraph`));
  },
  getPoints: () => readCsv.catch(() => [null, null, null, null]),
  readTable: frequencyLocation =>
    new Promise(resolve => readFile(frequencyLocation, 'utf8').then(csv => csvRead(csv, (err, data) => resolve(data)))),
  writeTemp: async (points, location) => {
    try {
      await stat(`${location}/temp`);
    } catch (e) {
      await mkdir(`${location}/temp`);
    }
    const csv = await new Promise(resolve => csvWrite(points, (err, data) => resolve(data)));
    await writeFile(`${location}/temp/fixed.csv`, csv);
  },
  clearTemp: async location => {
    try {
      await stat(`${location}/temp`);
    } catch (e) {
      await mkdir(`${location}/temp`);
    }
    await deleteFolder(`${location}/temp`);
  },
};
