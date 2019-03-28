import React from 'react';
import styled from 'styled-components';
import ManualInput from './components/manualInput';

const Grid = styled.div`
  display: grid;
  grid-area: manual;
  grid:
    'title frequency'
    'radio radio';
  padding: 10px 10px;
  gap: 10px;
  margin-top: 10px;
  border-style: solid;
  border-color: #ddd;
  justify-self: center;
  align-self: center;
`;

const Title = styled.h3`
  grid-area: title;
  justify-self: center;
  align-self: center;
  margin-top: -5px;
`;

const Frequency = styled.form`
  grid-area: frequency;
  padding: 10px 10px;
  border-color: '#000';
  border-style: double;
  justify-self: center;
  align-self: center;
`;

const RadioContainer = styled.div`
  display: grid;
  grid-area: radio;
  grid:
    'manual firmware software'
    'manual . .';
  gap: 10px;
  padding: 10px 10px;
  border-color: '#000';
  border-style: double;
  justify-self: center;
  align-self: center;
`;

const Firmware = styled.div`
  grid-area: firmware;
  display: inline-block;
  margin-top: 10px;
  justify-self: center;
  align-self: center;
`;

const Software = styled.div`
  grid-area: software;
  display: inline-block;
  margin-top: 10px;
  justify-self: center;
  align-self: center;
`;

const Text = styled.div`
  display: inline-block;
`;

const Radio = styled.input`
  margin-left: 5px;
  transform: scale(1.25);
`;

export default ({
  inputChange,
  radioChange,
  manualFrequency,
  manualFrequencyEnter,
  manualTuningMode,
  ps1,
  ps2,
  pd,
  manualEnter,
}) => (
  <Grid>
    <Title>Cres Control</Title>
    <Frequency>
      <label htmlFor="manualFrequency">
        {'Set Frequency: '}
        <input
          style={{ width: '75px' }}
          type="number"
          name="manualFrequency"
          id="manualFrequency"
          value={manualFrequency}
          min="105"
          max="195"
          step="5"
          onChange={radioChange}
        />
      </label>
      <button
        type="submit"
        onClick={e => {
          e.preventDefault();
          manualFrequencyEnter();
        }}
      >
        Submit
      </button>
    </Frequency>
    <RadioContainer>
      <ManualInput
        inputChange={inputChange}
        radioChange={radioChange}
        manualTuningMode={manualTuningMode}
        ps1={ps1}
        ps2={ps2}
        pd={pd}
        manualEnter={manualEnter}
      />
      <Firmware>
        <Text>Firmware</Text>
        <Radio
          type="radio"
          name="manualTuningMode"
          value="firmware"
          checked={manualTuningMode === 'firmware'}
          onChange={radioChange}
        />
      </Firmware>
      <Software>
        <Text>Software</Text>
        <Radio
          type="radio"
          name="manualTuningMode"
          value="software"
          checked={manualTuningMode === 'software'}
          onChange={radioChange}
        />
      </Software>
    </RadioContainer>
  </Grid>
);
