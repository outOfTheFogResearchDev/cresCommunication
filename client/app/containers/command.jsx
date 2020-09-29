import React, { Fragment } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  grid-area: command;
  padding: 10px 10px;
  width: 310px;
  border-color: '#000';
  border-style: double;
  justify-self: center;
  align-self: center;
`;

export default ({ command, inputChange, enterCommand, globalStat, env, phaseGraphF, graphPhaseOutput }) => (
  <Container>
    <form>
      <div style={{ fontWeight: 'bold' }}>Telnet</div>
      <label htmlFor="command">
        {'Command: '}
        <input type="text" name="command" value={command} id="command" onChange={inputChange} />
      </label>
      <button
        type="submit"
        onClick={e => {
          e.preventDefault();
          enterCommand();
        }}
      >
        Submit
      </button>
      <br />
      <button
        style={{ marginTop: '10px' }}
        type="submit"
        onClick={e => {
          e.preventDefault();
          globalStat();
        }}
      >
        Global Stat
      </button>
      {env === 'exe' ? null : (
        <Fragment>
          <br />
          <label htmlFor="phaseGraphF" style={{ marginTop: '10px' }}>
            {'Frequency: '}
            <input
              style={{ width: '40px' }}
              type="number"
              name="phaseGraphF"
              id="phaseGraphF"
              value={phaseGraphF}
              min="105"
              max="195"
              step="5"
              onChange={inputChange}
            />
            <button
              style={{ marginTop: '10px' }}
              type="submit"
              onClick={e => {
                e.preventDefault();
                graphPhaseOutput();
              }}
            >
              Graph Phase Outputs
            </button>
            <button
              style={{ marginTop: '10px', marginLeft: '3px' }}
              type="submit"
              onClick={e => {
                e.preventDefault();
                graphPhaseOutput(true);
              }}
            >
              Full
            </button>
          </label>
        </Fragment>
      )}
    </form>
  </Container>
);
