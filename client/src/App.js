import React, { Component } from "react";
import socketIOClient from "socket.io-client";

class App extends Component {
  constructor() {
    super();
    this.state = {
      response: false,
      endpoint: "http://127.0.0.1:30000"
    };
  }
  componentDidMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.on("prices", data => this.setState({ response: data }));
  }
  render() {
    const response = "£" + this.state.response['GBP'];
    return (
      <div style={{ textAlign: "center" }}>
        {response
          ? <p>
            LTC: {response}
            </p>
          : <p>Loading...</p>}
      </div>
    );
  }
}
export default App;