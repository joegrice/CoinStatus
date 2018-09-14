import './App.css';
import * as io from 'socket.io-client';
import * as React from 'react';
import { SocketSuffix } from './models/SocketSuffix';

// import logo from './logo.svg';

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
      this.addCurrentAggs(data);
    });
    socket.on("BTC" + SocketSuffix.UPDATE, (data: string) => {
      this.updateCurrentAgg(data);
    });
    socket.on("LTC" + SocketSuffix.UPDATE, (data: string) => {
      this.updateCurrentAgg(data);
    });
  }

  public updateCurrentAgg(message: string) {
    const split: string[] = message.split("~");
    if (this.state.currentAggs === undefined) {
      // TODO: ADD WAY TO DEAL WITH ERROR
    } else {
      const saveArr = this.state.currentAggs;
      for (const currentAgg of saveArr) {
        const loopAgg = currentAgg as CurrentAgg;
        if (loopAgg.FromCurrency === split[0]) {
          if (split[2] === "1" || split[2] === "2") {
            loopAgg.Flag = split[1];
            loopAgg.Price = Number(split[2]);
          } else {
            loopAgg.Flag = split[1];
          }
          break;
        }
      }
      this.setState({ currentAggs: saveArr });
    }
  }

  public addCurrentAggs(data: CurrentAgg[]) {
    if (data !== undefined) {
      const agg = data as CurrentAgg[];
      if (this.state.currentAggs === undefined) {
        this.setState({ currentAggs: agg });
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

  public NumberList() {
    let listItems: JSX.Element[];

    if (this.state.currentAggs !== undefined && this.state.currentAggs.length > 0) {
      listItems = this.state.currentAggs.map((agg: CurrentAgg, index) =>
        // Correct! Key should be specified inside the array.
        <div className={agg.FromCurrency} key={index}>
          <p style={{ backgroundColor: this.bgColourRender(agg.Flag) }} key={index}>
            {agg.FromCurrency} -
            {agg.ToCurrency} : $
            {agg.Price}</p>
        </div>
      );
    } else {
      listItems = new Array();
      listItems[0] = <div key={2}>Loading...</div>
    }
    return (
      <ul>
        {listItems}
      </ul>
    );
  }

  public render() {
    const x = this.NumberList();
    return (
      <div> {x} </div>
    )
  }
}

export default App;
