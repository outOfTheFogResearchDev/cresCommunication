import React, { Component } from 'react';
import { get, post } from 'axios';
import styled from 'styled-components';
import Local from './containers/local';
import Command from './containers/command';
import CresControl from './containers/cresControl';

const Container = styled.div`
  display: grid;
  margin: 15px 5px;
  height: 600px;
  gap: 10px;
`;

const ResponseContainer = styled.div`
  grid-area: response;
  font-size: 150%;
`;

const Response = styled.pre`
  border: 1px solid black;
  padding: 10px 10px;
`;

const ping = async () => {
  await post('/ping');
};

const isNumeric = num => +num === +num; // eslint-disable-line no-self-compare

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      response: [],
      env: null,
      manualFrequency: 150,
      manualTuningMode: 'firmware',
      ps1: 0,
      ps2: 0,
      pd: 0,
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

    [
      'manualFrequencyEnter',
      'manualEnter',
      'optimizeFrequency',
      'enterCommand',
      'globalStat',
      'sweep',
      'genSig',
      'inputChange',
      'radioChange',
    ].forEach(funcName => {
      this[funcName] = this[funcName].bind(this);
    });
  }

  async componentDidMount() {
    setInterval(ping, 1000);
    const {
      data: { env },
    } = await get('/env');
    const that = this;
    this.setState({ env }, async () => {
      await post('/api/connect');
      that.setState({ response: 'Connected' });
    });
  }

  async manualFrequencyEnter() {
    const { manualFrequency } = this.state;
    await post('/api/manual_frequency', { manualFrequency });
    this.setState({ response: 'Frequency Code Entered' });
  }

  async manualEnter() {
    const { ps1, ps2, pd } = this.state;
    await post('/api/manual_codes', { ps1, ps2, pd });
    this.setState({ response: 'Codes Entered' });
  }

  async enterCommand() {
    const { command } = this.state;
    const {
      data: { response },
    } = await get('/api/command', { params: { command } });
    this.setState({ response });
  }

  async globalStat() {
    const {
      data: { response },
    } = await get('/api/command', { params: { command: 'GlobalStat' } });
    this.setState({ response });
  }

  async optimizeFrequency(type) {
    const {
      optimizeF: frequency,
      optimizeAL: ampLow,
      optimizeAH: ampHigh,
      optimizePL: phaseLow,
      optimizePH: phaseHigh,
      optimizeWithT,
    } = this.state;
    await post('/api/optimizeFrequency', {
      frequency,
      ampLow,
      ampHigh,
      phaseLow,
      phaseHigh,
      usingTable: type || optimizeWithT,
    });
    this.setState({ response: 'Frequency Optimized' });
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
    await post(`/api/gen_points/${name}`, {
      freqLow,
      freqHigh,
      ampLow,
      ampHigh,
      phaseLow,
      phaseHigh,
      pointsQuantity,
      type: 'fine',
    });
    this.setState({ response: 'Sweep Complete' });
  }

  async genSig() {
    const { mokuF: frequency, mokuA: amplitude, mokuP: phase } = this.state;
    const {
      data: { point },
    } = await get('/api/gen', { params: { frequency, amplitude, phase } });
    this.setState({ response: point });
  }

  inputChange({ target: { name, value } }) {
    this.setState({ [name]: isNumeric(value) ? +value : value });
  }

  async radioChange({ target: { name, value } }) {
    if (value === 'software') await post('/api/software');
    else if (value === 'firmware') await post('/api/firmware');
    else if (value === 'manual') await post('/api/stop_polling');
    this.inputChange({ target: { name, value } });
  }

  render() {
    const {
      response,
      env,
      manualFrequency,
      manualTuningMode,
      ps1,
      ps2,
      pd,
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
      <Container
        style={{
          grid: `'manual command' '${env === 'exe' ? 'manual' : 'local'} response'`,
        }}
      >
        <CresControl
          inputChange={this.inputChange}
          radioChange={this.radioChange}
          manualFrequency={manualFrequency}
          manualFrequencyEnter={this.manualFrequencyEnter}
          manualTuningMode={manualTuningMode}
          ps1={ps1}
          ps2={ps2}
          pd={pd}
          manualEnter={this.manualEnter}
        />
        <Command
          command={command}
          inputChange={this.inputChange}
          enterCommand={this.enterCommand}
          globalStat={this.globalStat}
        />
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
        <ResponseContainer>
          <Response>{response}</Response>
        </ResponseContainer>
      </Container>
    );
  }
}
