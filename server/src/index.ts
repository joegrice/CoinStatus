import * as http from 'http';
import * as debug from 'debug';
import socketIo = require("socket.io");

import App from './App';
import { Price } from './models/Price';
import { Connect } from './connection/Connect';

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
});

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