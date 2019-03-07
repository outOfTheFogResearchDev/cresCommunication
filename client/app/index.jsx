import React, { Component, Fragment } from 'react';
import { get, post } from 'axios';

const ping = async () => {
  await post('/ping');
};

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = { response: [] };

    this.clickme = this.clickme.bind(this);
  }

  async componentDidMount() {
    setInterval(ping, 1000);
    await post('/api/connect');
    this.setState({ response: 'hi' });
  }

  async clickme() {
    const {
      data: { points },
    } = await get('/api/gen_points', { params: { freqLow: 100, freqHigh: 200, pointsQuantity: 100 } });
    this.setState({ response: points });
  }

  render() {
    const { response } = this.state;
    return (
      <Fragment>
        <button type="submit" onClick={this.clickme}>
          click me
        </button>
        {response.map(point => (
          <div>{point}</div>
        ))}
      </Fragment>
    );
  }
}
