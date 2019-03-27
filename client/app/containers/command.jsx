import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 10px 10px;
  width: 310px;
  border-color: '#000';
  border-style: double;
  justify-self: center;
  align-self: center;
`;

export default ({ command, inputChange, enterCommand }) => (
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
    </form>
  </Container>
);
