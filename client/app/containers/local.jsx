import React from 'react';
import styled from 'styled-components';

const Grid = styled.div`
  display: grid;
  grid-area: local;
  grid:
    'signal sweep'
    'signal optimize';
  padding: 10px 10px;
  width: 550px;
  margin-top: 10px;
  gap: 10px;
  border-style: solid;
  border-color: #ddd;
  justify-self: center;
  align-self: center;
`;

const SignalGen = styled.form`
  grid-area: signal;
  padding: 10px 10px;
  border-color: '#000';
  border-style: double;
  justify-self: center;
  align-self: center;
`;

const Sweep = styled.form`
  grid-area: sweep;
  padding: 10px 10px;
  border-color: '#000';
  border-style: double;
  justify-self: center;
  align-self: center;
`;

const Optimize = styled.form`
  grid-area: optimize;
  padding: 10px 10px;
  border-color: '#000';
  border-style: double;
  justify-self: center;
  align-self: center;
`;

export default ({
  mokuF,
  inputChange,
  mokuA,
  mokuP,
  genSig,
  sweepLF,
  sweepHF,
  sweepLA,
  sweepHA,
  sweepLP,
  sweepHP,
  sweepPQ,
  sweep,
  optimizeFrequency,
  optimizeF,
  optimizeWithT,
  optimizeAL,
  optimizeAH,
  optimizePL,
  optimizePH,
}) => (
  <Grid>
    <SignalGen>
      <div style={{ fontWeight: 'bold' }}>Moku Signal Generation</div>
      <label htmlFor="mokuF">
        {'Frequency: '}
        <input
          style={{ marginLeft: '1px', width: '75px' }}
          type="number"
          name="mokuF"
          id="mokuF"
          value={mokuF}
          min="100"
          max="200"
          step="0.1"
          onChange={inputChange}
        />
      </label>
      <br />
      <label htmlFor="mokuA">
        {' Amplitude: '}
        <input
          style={{ width: '75px' }}
          type="number"
          name="mokuA"
          id="mokuA"
          value={mokuA}
          min="-10"
          max="10"
          step="0.1"
          onChange={inputChange}
        />
      </label>
      <br />
      <label htmlFor="mokuP">
        {' Phase: '}
        <input
          style={{ marginLeft: '32px', width: '75px' }}
          type="number"
          name="mokuP"
          id="mokuP"
          value={mokuP}
          min="-180"
          max="180"
          step="0.1"
          onChange={inputChange}
        />
      </label>
      <br />
      <button
        type="submit"
        style={{ marginTop: '5px', marginLeft: '45px' }}
        onClick={e => {
          e.preventDefault();
          genSig();
        }}
      >
        Gen Signal
      </button>
    </SignalGen>
    <Sweep>
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
          onChange={inputChange}
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
          onChange={inputChange}
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
          onChange={inputChange}
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
          onChange={inputChange}
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
          onChange={inputChange}
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
          onChange={inputChange}
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
          onChange={inputChange}
        />
      </label>
      <br />
      <button
        style={{ marginLeft: '25px', marginTop: '5px' }}
        type="submit"
        onClick={e => {
          e.preventDefault();
          sweep('auto');
        }}
      >
        Sweep Firmware
      </button>
      <button
        style={{ marginLeft: '10px' }}
        type="submit"
        onClick={e => {
          e.preventDefault();
          sweep('table');
        }}
      >
        Sweep Software
      </button>
    </Sweep>
    <Optimize>
      <div style={{ fontWeight: 'bold' }}>Optimize Frequency</div>
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
          onChange={inputChange}
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
          onChange={inputChange}
        />
      </label>
      <br />
      <label htmlFor="optimizeAL">
        {'Amplitude: from '}
        <input
          style={{ marginLeft: '1px', marginTop: '5px', width: '75px' }}
          type="number"
          name="optimizeAL"
          id="optimizeAL"
          value={optimizeAL}
          min="-10"
          max="10"
          step="0.1"
          onChange={inputChange}
        />
      </label>
      <label htmlFor="optimizeAH">
        {' to '}
        <input
          style={{ marginLeft: '-1px', width: '75px' }}
          type="number"
          name="optimizeAH"
          id="optimizeAH"
          value={optimizeAH}
          min="-10"
          max="10"
          step="0.1"
          onChange={inputChange}
        />
      </label>
      <br />
      <label htmlFor="optimizePL">
        {'Phase: from '}
        <input
          style={{ marginLeft: '32px', width: '75px' }}
          type="number"
          name="optimizePL"
          id="optimizePL"
          value={optimizePL}
          min="-180"
          max="180"
          step="0.1"
          onChange={inputChange}
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
          onChange={inputChange}
        />
      </label>
      <br />
      <button
        style={{ marginLeft: '8px', marginTop: '5px' }}
        type="submit"
        onClick={e => {
          e.preventDefault();
          optimizeFrequency('firmware');
        }}
      >
        {'Optimize With Firmware'}
      </button>
      <button
        style={{ marginLeft: '10px' }}
        type="submit"
        onClick={e => {
          e.preventDefault();
          optimizeFrequency();
        }}
      >
        {'Optimize With Table'}
      </button>
    </Optimize>
  </Grid>
);
