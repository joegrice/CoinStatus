import * as http from 'http';
import * as debug from 'debug';
import socketIo = require("socket.io");
import * as ioClient from 'socket.io-client';

import App from './App';
import { CurrentAgg } from './models/CurrentAgg';
import { FileAction } from './models/FileChange';
import { CurrentAggFlag } from './models/CurrentAggFlag';

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
  var subscription = ['5~CCCAGG~BTC~USD', '5~CCCAGG~LTC~USD'];
  socket.emit('SubAdd', { subs: subscription });
  socket.on("m", function (message) {
    var messageType = message.substring(0, message.indexOf("~"));
    if (messageType == 5) {
      var currentAgg: CurrentAgg = dataUnpack(message);
      io.emit("currentAggs", currentAggs);
      console.log(currentAgg.FromCurrency + " - " + currentAgg.ToCurrency + " - " + currentAgg.Price + " - " + currentAgg.Flag);
    }
  });
}

function dataUnpack(message): CurrentAgg {
  var currentAgg: CurrentAgg = unpackMessage(message);
  var resAgg: CurrentAgg = currentAgg;
  if (currentAggs.length === 0) {
    currentAggs.push(currentAgg);
    console.log("FILE ADDED");
    return resAgg;
  }

  var findAgg = currentAggs.find((agg: CurrentAgg) => {
    return agg.FromCurrency === currentAgg.FromCurrency;
  })

  if (findAgg !== undefined) {
    var fileAction: FileAction = updateCurrentAggs(findAgg, currentAgg);
    if (fileAction as FileAction === FileAction.PARTUPDATE) {
      resAgg = findAgg;
    }
  } else {
    currentAggs.push(currentAgg);
  }

  return resAgg;
};

function updateCurrentAggs(currentAggsItem: CurrentAgg, currentAgg: CurrentAgg): FileAction {
  var result: FileAction = FileAction.UNTOUCHED;
  if (currentAgg.Flag as CurrentAggFlag === CurrentAggFlag.PRICEUP) {
    currentAggsItem.Flag = currentAgg.Flag;
    currentAggsItem.Price = currentAgg.Price;
    result = FileAction.FULLUPDATE;
  } else if (currentAgg.Flag as CurrentAggFlag === CurrentAggFlag.PRICEDOWN) {
    currentAggsItem.Flag = currentAgg.Flag;
    currentAggsItem.Price = currentAgg.Price;
    result = FileAction.FULLUPDATE;
  } else if (currentAgg.Flag as CurrentAggFlag === CurrentAggFlag.PRICEUNCHANGED) {
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