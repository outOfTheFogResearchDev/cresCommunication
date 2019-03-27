import React, { Component, Fragment } from 'react';
import { get, post } from 'axios';
import Local from './containers/local';

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
      data: { response },
    } = await get('/api/optimizeFrequency', {
      params: { frequency, ampLow, ampHigh, phaseLow, phaseHigh, usingTable },
    });
    this.setState({ response });
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
      data: { response },
    } = await get(`/api/gen_points/${name}`, {
      params: { freqLow, freqHigh, ampLow, ampHigh, phaseLow, phaseHigh, pointsQuantity, type: 'fine' },
    });
    this.setState({ response });
  }

  async genSig() {
    const { mokuF: frequency, mokuA: amplitude, mokuP: phase } = this.state;
    const {
      data: { point },
    } = await get('/api/gen', { params: { frequency, amplitude, phase } });
    this.setState({ response: point });
  }

  async inputChange({ target: { name, value } }) {
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
          <Local
            mokuF={mokuF}
            inputChange={this.inputChange}
            mokuA={mokuA}
            mokuP={mokuP}
            genSig={this.genSig}
            sweepLF={sweepLF}
            sweepHF={sweepHF}
            sweepLA={sweepLA}
            sweepHA={sweepHA}
            sweepLP={sweepLP}
            sweepHP={sweepHP}
            sweepPQ={sweepPQ}
            sweep={this.sweep}
            optimizeFrequency={this.optimizeFrequency}
            optimizeF={optimizeF}
            optimizeWithT={optimizeWithT}
            optimizeAL={optimizeAL}
            optimizeAH={optimizeAH}
            optimizePL={optimizePL}
            optimizePH={optimizePH}
          />
        )}
        <p>{response}</p>
      </Fragment>
    );
  }
}
