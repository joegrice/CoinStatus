import * as http from 'http';
import * as debug from 'debug';
import socketIo = require("socket.io");
import * as ioClient from 'socket.io-client';

import App from './App';
import { Price } from './models/Price';
import { Connect } from './connection/Connect';
import { CurrentAgg } from './models/CurrentAgg';
import { FileAction } from './models/FileChange';

debug('ts-express:server');

const port = normalizePort(process.env.PORT || 3000);
App.set('port', port);

const server = http.createServer(App);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

const io = socketIo(server);

io.on("connection", socket => {
  console.log("New client connected");
  getApiAndEmit(socket);
  setInterval(() => getApiAndEmit(socket), 10000);
  socket.on("disconnect", () => console.log("Client disconnected"));

  activateStream();
});

var currentAggs: CurrentAgg[] = [];

function activateStream(): void {
  var socket = ioClient.connect('https://streamer.cryptocompare.com/');
  //Format: {SubscriptionId}~{ExchangeName}~{FromSymbol}~{ToSymbol}
  //Use SubscriptionId 0 for TRADE, 2 for CURRENT, 5 for CURRENTAGG eg use key '5~CCCAGG~BTC~USD' to get aggregated data from the CCCAGG exchange 
  //Full Volume Format: 11~{FromSymbol} eg use '11~BTC' to get the full volume of BTC against all coin pairs
  //For aggregate quote updates use CCCAGG ags market
  var subscription = ['5~CCCAGG~BTC~USD'];
  socket.emit('SubAdd', { subs: subscription });
  socket.on("m", function (message) {
    var messageType = message.substring(0, message.indexOf("~"));
    if (messageType == 5) {
      var currentAgg: CurrentAgg = dataUnpack(message);
      io.emit("currentAgg", currentAgg);
      console.log(currentAgg.FromCurrency + " - " + currentAgg.ToCurrency + " - " + currentAgg.Price + " - " + currentAgg.Flag);
    }
  });
}

function dataUnpack(message): CurrentAgg {
  var currentAgg: CurrentAgg = unpackMessage(message);
  var resAgg: CurrentAgg = currentAgg;
  var fileAction: FileAction = FileAction.UNTOUCHED;
  if (currentAggs.length === 0) {
    currentAggs.push(currentAgg);
    console.log("FILE ADDED");
    return resAgg;
  }

  var findAgg = currentAggs.find((agg: CurrentAgg) => {
    return agg.FromCurrency === currentAgg.FromCurrency;
  })

  if (findAgg !== undefined) {
    fileAction = updateCurrentAggs(findAgg, currentAgg);
    if (fileAction as FileAction === FileAction.PARTUPDATE) {
      resAgg = findAgg;
    }
  } else {
    currentAggs.push(currentAgg);
  }

  /*  for (var aggKey in currentAggs) {
      var currentAggsItem: CurrentAgg = currentAggs[aggKey];
      if (currentAggsItem.FromCurrency === currentAgg.FromCurrency) {
        fileAction = updateCurrentAggs(currentAggsItem, currentAgg);
        if (fileAction as FileAction === FileAction.PARTUPDATE) {
          resAgg = currentAggsItem;
        }
        break;
      }
    }
  

  if (fileAction as FileAction === FileAction.UNTOUCHED) {
    currentAggs.push(currentAgg);
  }*/

  return resAgg;
};

function updateCurrentAggs(currentAggsItem: CurrentAgg, currentAgg: CurrentAgg): FileAction {
  var result: FileAction = FileAction.UNTOUCHED;
  if (currentAgg.Flag === "1") {
    currentAggsItem.Flag = currentAgg.Flag;
    currentAggsItem.Price = currentAgg.Price;
    result = FileAction.FULLUPDATE;
  } else if (currentAgg.Flag === "2") {
    currentAggsItem.Flag = currentAgg.Flag;
    currentAggsItem.Price = currentAgg.Price;
    result = FileAction.FULLUPDATE;
  } else if (currentAgg.Flag === "4") {
    currentAggsItem.Flag = currentAgg.Flag;
    result = FileAction.PARTUPDATE;
  }
  return result;
}

function unpackMessage(message): CurrentAgg {
  var valuesArray = message.split("~");
  var currentAgg: CurrentAgg = new CurrentAgg();
  currentAgg.FromCurrency = valuesArray[2];
  currentAgg.ToCurrency = valuesArray[3];
  currentAgg.Flag = valuesArray[4];
  currentAgg.Price = valuesArray[5];
  return currentAgg;
}

const getApiAndEmit = async socket => {
  try {
    let query = "price?fsym=LTC&tsyms=BTC,ETH,USD,EUR,GBP";
    var apiConnect = new Connect();
    apiConnect.callApi(query).then(function (priceList: Price) {
      socket.emit("prices", priceList);
      console.log(priceList);
    });
  } catch (error) {
    console.error(`Error: ${error.code}`);
  }
};

function normalizePort(val: number | string): number | string | boolean {
  let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
  if (isNaN(port)) return val;
  else if (port >= 0) return port;
  else return false;
}

function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== 'listen') throw error;
  let bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening(): void {
  let addr = server.address();
  let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
}