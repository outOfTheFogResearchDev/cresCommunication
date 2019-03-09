import React, { Component, Fragment } from 'react';
import { get, post } from 'axios';

const ping = async () => {
  await post('/ping');
};

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = { response: [], frequency: 100, amplitude: 0, phase: 0 };

    this.clickme = this.clickme.bind(this);
    this.genPhase = this.genPhase.bind(this);
    this.inputChange = this.inputChange.bind(this);
  }

  async componentDidMount() {
    setInterval(ping, 1000);
    await post('/api/connect');
    this.setState({ response: ['hi'] });
  }

  async clickme() {
    const {
      data: { points },
    } = await get('/api/optimizeFrequency', { params: { frequency: 150, pointNumber: 100 } });
    this.setState({ response: points });
  }

  async genPhase() {
    const { frequency, amplitude, phase } = this.state;
    const {
      data: { point },
    } = await get('/api/gen', { params: { frequency, amplitude, phase } });
    this.setState({ response: [point] });
  }

  async inputChange({ target: { value, name } }) {
    this.setState({ [name]: value });
  }

  render() {
    const { response, frequency, amplitude, phase } = this.state;
    return (
      <Fragment>
        <input type="number" name="frequency" value={frequency} min="100" max="200" onChange={this.inputChange} />
        <input type="number" name="amplitude" value={amplitude} min="-10" max="10" onChange={this.inputChange} />
        <input type="number" name="phase" value={phase} min="-180" max="180" onChange={this.inputChange} />
        <button type="submit" onClick={this.genPhase}>
          Gen Phase
        </button>
        <button type="submit" onClick={this.clickme}>
          click me
        </button>
        {response.map(point => (
          <div>{`freq: ${point[0]}    amp: ${point[1]}     phase: ${point[2]}     rejection: ${
            point[3]
          }     corrected rejection: ${point[4]}`}</div>
        ))}
      </Fragment>
    );
  }
}
