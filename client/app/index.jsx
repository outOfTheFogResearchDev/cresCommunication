import React, { Component, Fragment } from 'react';
import { get, post } from 'axios';

const ping = async () => {
  await post('/ping');
};

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      response: [],
      env: null,
      command: '',
      mokuF: 150,
      mokuA: 0,
      mokuP: 0,
      sweepLF: 100,
      sweepHF: 200,
      sweepLA: -10,
      sweepHA: 10,
      sweepLP: -180,
      sweepHP: 180,
      sweepPQ: 150,
      optimizeF: 150,
      optimizeAL: -10,
      optimizeAH: 10,
      optimizePL: -180,
      optimizePH: 180,
      optimizeWithT: 150,
    };

    this.optimizeFrequency = this.optimizeFrequency.bind(this);
    this.command = this.command.bind(this);
    this.sweep = this.sweep.bind(this);
    this.genSig = this.genSig.bind(this);
    this.inputChange = this.inputChange.bind(this);
  }

  async componentDidMount() {
    setInterval(ping, 1000);
    const {
      data: { env },
    } = await get('/env');
    const that = this;
    this.setState({ env }, async () => {
      await post('/api/connect');
      that.setState({ response: ['hi'] });
    });
  }

  async command() {
    const { command } = this.state;
    const {
      data: { response },
    } = await get('/api/command', { params: { command } });
    this.setState({ response });
  }

  async optimizeFrequency() {
    const {
      optimizeF: frequency,
      optimizeAL: ampLow,
      optimizeAH: ampHigh,
      optimizePL: phaseLow,
      optimizePH: phaseHigh,
      optimizeWithT: usingTable,
    } = this.state;
    const {
      data: { points },
    } = await get('/api/optimizeFrequency', {
      params: { frequency, ampLow, ampHigh, phaseLow, phaseHigh, usingTable },
    });
    this.setState({ response: points });
  }

  async sweep(name) {
    const {
      sweepLF: freqLow,
      sweepHF: freqHigh,
      sweepLA: ampLow,
      sweepHA: ampHigh,
      sweepLP: phaseLow,
      sweepHP: phaseHigh,
      sweepPQ: pointsQuantity,
    } = this.state;
    const {
      data: { points },
    } = await get(`/api/gen_points/${name}`, {
      params: { freqLow, freqHigh, ampLow, ampHigh, phaseLow, phaseHigh, pointsQuantity, type: 'fine' },
    });
    this.setState({ response: points });
  }

  async genSig() {
    const { mokuF: frequency, mokuA: amplitude, mokuP: phase } = this.state;
    const {
      data: { point },
    } = await get('/api/gen', { params: { frequency, amplitude, phase } });
    this.setState({ response: [point] });
  }

  async inputChange({ target: { value, name } }) {
    this.setState({ [name]: value });
  }

  render() {
    const {
      response,
      env,
      command,
      mokuF,
      mokuA,
      mokuP,
      sweepLF,
      sweepHF,
      sweepLA,
      sweepHA,
      sweepLP,
      sweepHP,
      sweepPQ,
      optimizeF,
      optimizeAL,
      optimizeAH,
      optimizePL,
      optimizePH,
      optimizeWithT,
    } = this.state;
    return !env ? null : (
      <Fragment>
        <form>
          <label htmlFor="command">
            {'Command: '}
            <input type="text" name="command" value={command} id="command" onChange={this.inputChange} />
          </label>
          <button
            type="submit"
            onClick={e => {
              e.preventDefault();
              this.command();
            }}
          >
            Submit
          </button>
        </form>
        {env === 'exe' ? null : (
          <Fragment>
            {' '}
            <form style={{ marginTop: '20px' }}>
              <div style={{ fontWeight: 'bold' }}>Moku Signal Generation</div>
              <label htmlFor="mokuF">
                {'Frequency: '}
                <input
                  type="number"
                  name="mokuF"
                  id="mokuF"
                  value={mokuF}
                  min="100"
                  max="200"
                  step="0.1"
                  onChange={this.inputChange}
                />
              </label>
              <label htmlFor="mokuA">
                {' Amplitude: '}
                <input
                  type="number"
                  name="mokuA"
                  id="mokuA"
                  value={mokuA}
                  min="-10"
                  max="10"
                  step="0.1"
                  onChange={this.inputChange}
                />
              </label>
              <label htmlFor="mokuP">
                {' Phase: '}
                <input
                  type="number"
                  name="mokuP"
                  id="mokuP"
                  value={mokuP}
                  min="-180"
                  max="180"
                  step="0.1"
                  onChange={this.inputChange}
                />
              </label>
              <button
                type="submit"
                style={{ marginLeft: '5px' }}
                onClick={e => {
                  e.preventDefault();
                  this.genSig();
                }}
              >
                Gen Sig
              </button>
            </form>
            <form style={{ marginTop: '20px' }}>
              <div style={{ fontWeight: 'bold' }}>Sweep</div>
              <label htmlFor="sweepLF">
                {'Frequency: from '}
                <input
                  style={{ marginLeft: '1px', width: '75px' }}
                  type="number"
                  name="sweepLF"
                  id="sweepLF"
                  value={sweepLF}
                  min="100"
                  max="200"
                  step="0.1"
                  onChange={this.inputChange}
                />
              </label>
              <label htmlFor="sweepHF">
                {' to '}
                <input
                  style={{ width: '75px' }}
                  type="number"
                  name="sweepHF"
                  id="sweepHF"
                  value={sweepHF}
                  min="100"
                  max="200"
                  step="0.1"
                  onChange={this.inputChange}
                />
              </label>
              <br />
              <label htmlFor="sweepLA">
                {'Amplitude: from '}
                <input
                  style={{ width: '75px' }}
                  type="number"
                  name="sweepLA"
                  id="sweepLA"
                  value={sweepLA}
                  min="-10"
                  max="10"
                  step="0.1"
                  onChange={this.inputChange}
                />
              </label>
              <label htmlFor="sweepHA">
                {' to '}
                <input
                  style={{ width: '75px' }}
                  type="number"
                  name="sweepHA"
                  id="sweepHA"
                  value={sweepHA}
                  min="-10"
                  max="10"
                  step="0.1"
                  onChange={this.inputChange}
                />
              </label>
              <br />
              <label htmlFor="sweepLP">
                {'Phase: from '}
                <input
                  style={{ marginLeft: '31px', width: '75px' }}
                  type="number"
                  name="sweepLP"
                  id="sweepLP"
                  value={sweepLP}
                  min="-180"
                  max="180"
                  step="0.1"
                  onChange={this.inputChange}
                />
              </label>
              <label htmlFor="sweepHP">
                {' to '}
                <input
                  style={{ width: '75px' }}
                  type="number"
                  name="sweepHP"
                  id="sweepHP"
                  value={sweepHP}
                  min="-180"
                  max="180"
                  step="0.1"
                  onChange={this.inputChange}
                />
              </label>
              <br />
              <label htmlFor="sweepPQ">
                {'Points: '}
                <input
                  style={{ width: '75px' }}
                  type="number"
                  name="sweepPQ"
                  id="sweepPQ"
                  value={sweepPQ}
                  min="0"
                  max="1000"
                  step="1"
                  onChange={this.inputChange}
                />
              </label>
              <br />
              <button
                style={{ marginLeft: '25px', marginTop: '5px' }}
                type="submit"
                onClick={e => {
                  e.preventDefault();
                  this.sweep('auto');
                }}
              >
                Sweep Firmware
              </button>
              <button
                style={{ marginLeft: '10px' }}
                type="submit"
                onClick={e => {
                  e.preventDefault();
                  this.sweep('table');
                }}
              >
                Sweep Software
              </button>
            </form>
            <form style={{ marginTop: '20px' }}>
              <div style={{ fontWeight: 'bold' }}>Optimize Frequency</div>
              <button
                style={{ marginTop: '5px' }}
                type="submit"
                onClick={e => {
                  e.preventDefault();
                  this.optimizeFrequency();
                }}
              >
                {'Optimize'}
              </button>
              <label htmlFor="optimizeF">
                {' Frequency: '}
                <input
                  type="number"
                  style={{ width: '75px' }}
                  name="optimizeF"
                  value={optimizeF}
                  id="optimizeF"
                  min="100"
                  max="200"
                  step="5"
                  onChange={this.inputChange}
                />
              </label>
              <label htmlFor="optimizeWithT">
                {' with Table: '}
                <input
                  type="number"
                  style={{ width: '75px' }}
                  name="optimizeWithT"
                  value={optimizeWithT}
                  id="optimizeWithT"
                  min="100"
                  max="200"
                  step="5"
                  onChange={this.inputChange}
                />
              </label>
              <br />
              <label htmlFor="optimizeAL">
                {'Amplitude: from '}
                <input
                  style={{ marginTop: '5px', width: '75px' }}
                  type="number"
                  name="optimizeAL"
                  id="optimizeAL"
                  value={optimizeAL}
                  min="-10"
                  max="10"
                  step="0.1"
                  onChange={this.inputChange}
                />
              </label>
              <label htmlFor="optimizeAH">
                {' to '}
                <input
                  style={{ width: '75px' }}
                  type="number"
                  name="optimizeAH"
                  id="optimizeAH"
                  value={optimizeAH}
                  min="-10"
                  max="10"
                  step="0.1"
                  onChange={this.inputChange}
                />
              </label>
              <br />
              <label htmlFor="optimizePL">
                {'Phase: from '}
                <input
                  style={{ marginLeft: '31px', width: '75px' }}
                  type="number"
                  name="optimizePL"
                  id="optimizePL"
                  value={optimizePL}
                  min="-180"
                  max="180"
                  step="0.1"
                  onChange={this.inputChange}
                />
              </label>
              <label htmlFor="optimizePH">
                {' to '}
                <input
                  style={{ width: '75px' }}
                  type="number"
                  name="optimizePH"
                  id="optimizePH"
                  value={optimizePH}
                  min="-180"
                  max="180"
                  step="0.1"
                  onChange={this.inputChange}
                />
              </label>
            </form>
          </Fragment>
        )}
        <p>{response}</p>
      </Fragment>
    );
  }
}
