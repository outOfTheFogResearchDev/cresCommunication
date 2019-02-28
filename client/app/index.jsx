import React, { Component, Fragment } from 'react';
import { get, post } from 'axios';

const ping = async () => {
  await post('/ping');
};

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = { response: '' };

    this.clickme = this.clickme.bind(this);
  }

  async componentDidMount() {
    setInterval(ping, 1000);
    await post('/api/connect');
    this.setState({ response: 'hi' });
  }

  async clickme() {
    const {
      data: { power },
    } = await get('/api/gen', { params: { channel: 2, dbm: 5, frequency: 150 } });
    this.setState({ response: power });
  }

  render() {
    const { response } = this.state;
    return (
      <Fragment>
        <button type="submit" onClick={this.clickme}>
          click me
        </button>
        <div>{response}</div>
      </Fragment>
    );
  }
}
