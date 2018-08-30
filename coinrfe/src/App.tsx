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
    socket.on("currentAggs", (data: CurrentAgg[]) => {
      this.populateCurrentAggs(data);
    });
  }

  public populateCurrentAggs(data: CurrentAgg[]) {
    if (data !== undefined) {
      for (const currentAgg of data) {
        const agg = currentAgg as CurrentAgg;
        if (agg.FromCurrency === "LTC") {
          this.setState({ LTC: agg });
        } else if (agg.FromCurrency === "BTC") {
          this.setState({ BTC: agg });
        }
      }
    }
  }

  public bgColourRender(flag: string): string {
    switch (flag) {
      case "1":
        return "#00cc00";
      case "2":
        return "#ff4d4d";
      case "4":
        return "#ff9900";
      default:
        return "transparent";
    }
  }

  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to CoinStatus</h1>
        </header>
        <div className="LTC-CurrentAGG">
          <p style={{ backgroundColor: (this.state.LTC !== undefined) ? this.bgColourRender(this.state.LTC.Flag) : "transparent" }}>
            {(this.state.LTC !== undefined) ? this.state.LTC.FromCurrency : "LOADING"} -
          {(this.state.LTC !== undefined) ? this.state.LTC.ToCurrency : "LOADING"} : $
          {(this.state.LTC !== undefined) ? this.state.LTC.Price : "LOADING"}</p>
        </div>
        <div className="BTC-CurrentAGG">
          <p style={{ backgroundColor: (this.state.BTC !== undefined) ? this.bgColourRender(this.state.BTC.Flag) : "transparent" }}>
            {(this.state.BTC !== undefined) ? this.state.BTC.FromCurrency : "LOADING"} -
          {(this.state.BTC !== undefined) ? this.state.BTC.ToCurrency : "LOADING"} : $
          {(this.state.BTC !== undefined) ? this.state.BTC.Price : "LOADING"}</p>
        </div>
      </div>
    );
  }
}

export default App;
