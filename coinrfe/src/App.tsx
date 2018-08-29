import './App.css';
import * as io from 'socket.io-client';
import * as React from 'react';

import logo from './logo.svg';

class App extends React.Component<{}, IPricesState> {
  constructor(props: IPricesProps) {
    super(props);
    this.state = {
      endpoint: "http://127.0.0.1:3000"
    };
  }

  public componentDidMount() {
    const socket = io(this.state.endpoint);
    socket.on("prices", (data: Price) => {
      this.setState({ prices: data });
    });
    
    socket.on("currentAgg", (data: CurrentAgg) => {
      this.setState({ currentAgg: data });
    });
  }

  public render() {
    let LTC = "";
    if (this.state.prices !== undefined) {
      LTC = "LTC: £" + this.state.prices.GBP;
    } else {
      LTC = "Price Not available."
    }
    let currentAggPrice = "";
    if (this.state.currentAgg !== undefined) {
      currentAggPrice = "LTC: £" + this.state.currentAgg.Price;
    } else {
      currentAggPrice = "Price Not available."
    }
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to CoinStatus</h1>
        </header>
        <p className="App-intro">
          {LTC}
        </p>
        <p className="currentAgg">
          {currentAggPrice}
        </p>
      </div>
    );
  }
}

export default App;
