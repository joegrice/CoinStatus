import './App.css';
import * as io from 'socket.io-client';
import * as React from 'react';

// import logo from './logo.svg';

class App extends React.Component<{}, IPricesState> {

  private socket: SocketIOClient.Socket;

  constructor(props: IPricesProps) {
    super(props);
    this.state = {
      endpoint: "http://127.0.0.1:3000"
    };

    this.handleChange = this.handleChange.bind(this);
    this.addNewSub = this.addNewSub.bind(this);
  }

  public componentDidMount() {
    this.socket = io(this.state.endpoint);
    this.socket.on("currentAggs", (data: CurrentAgg[]) => {
      this.addCurrentAggs(data);
    });
    this.socket.on("newsocket", (data: string) => {
      this.socket.on(data, (app: CurrentAgg) => {
        this.updateCurrentAgg(app);
      });
    });
    this.socket.on("BTC~USD", (agg: CurrentAgg) => {
      this.updateCurrentAgg(agg);
    });
    this.socket.on("LTC~USD", (agg: CurrentAgg) => {
      this.updateCurrentAgg(agg);
    });
  }

  public updateCurrentAgg(agg: CurrentAgg) {
    if (this.state.currentAggs === undefined) {
      // TODO: ADD WAY TO DEAL WITH ERROR
    } else {
      const saveArr = this.state.currentAggs;
      for (const currentAgg of saveArr) {
        const loopAgg = currentAgg as CurrentAgg;
        if (loopAgg.FROMCURRENCY === agg.FROMCURRENCY) {
          if (agg.FLAGS === "1" || agg.FLAGS === "2") {
            loopAgg.FLAGS = agg.FLAGS;
            loopAgg.PRICE = agg.PRICE;
          } else {
            loopAgg.FLAGS = agg.FLAGS;
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
      this.setState({ currentAggs: agg });
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

  public getPercentageChange(oldNumber: number, newNumber: number): number {
    const decreaseValue: number = oldNumber - newNumber;
    return (decreaseValue / oldNumber) * 100;
  }

  public TwentyFourHourPercentageDiff(currentAgg: CurrentAgg): JSX.Element {
    let change: JSX.Element = <div>Loading...</div>;
    const changeVal: number = this.getPercentageChange(currentAgg.OPEN24HOUR, currentAgg.PRICE);
    if (changeVal > 0) {
      const fixed: string = changeVal.toFixed(2);
      change = <span style={{ backgroundColor: this.bgColourRender("1") }}>{fixed}%</span>;
    } else if (changeVal < 0) {
      const fixed: string = changeVal.toFixed(2);
      change = <span style={{ backgroundColor: this.bgColourRender("2") }}>{fixed}%</span>;
    } if (changeVal === 0) {
      const fixed: string = changeVal.toFixed(2);
      change = <span style={{ backgroundColor: this.bgColourRender("4") }}>{fixed}%</span>;
    }
    return change;
  }

  public NumberList() {
    let listItems: JSX.Element[];
    if (this.state.currentAggs !== undefined && this.state.currentAggs.length > 0) {
      listItems = this.state.currentAggs.map((agg: CurrentAgg, index) =>
        // Correct! Key should be specified inside the array.
        <tr className={agg.FROMCURRENCY} key={index}>
          <th scope="row">{index}</th>
          <td>{agg.FROMSYMBOL}</td>
          <td>{agg.TOSYMBOL}</td>
          <td><span style={{ backgroundColor: this.bgColourRender(agg.FLAGS) }}>{agg.PRICE}</span></td>
          <td>{this.TwentyFourHourPercentageDiff(agg)}</td>
        </tr>
      );
    } else {
      listItems = new Array();
      listItems[0] = <tr key={2}><td>Loading...</td></tr>;
    }
    return (
      <tbody>
        {listItems}
      </tbody>
    );
  }

  public handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({ newSub: e.currentTarget.value });
  }

  public addNewSub() {
    if (this.state.newSub !== undefined || this.state.newSub !== "") {
      this.socket.emit('newsub', this.state.newSub);
    }
  }

  public render() {
    const x = this.NumberList();
    return (
      <div>
        <div>
          <input type="text" onChange={this.handleChange} />
          <input type="button" value="Add Sub" onClick={this.addNewSub}
          />
        </div>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">From</th>
              <th scope="col">To</th>
              <th scope="col">Price</th>
              <th scope="col">24 Hr</th>
            </tr>
          </thead>

          {x}

        </table>
      </div>
    )
  }
}

export default App;
