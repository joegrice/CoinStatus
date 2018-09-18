import { CurrentAggStreamService } from "../stream/CurrentAggStreamService";
import * as ioClient from 'socket.io-client';

export class SocketService {

    stream: CurrentAggStreamService

    constructor(ioInput: SocketIO.Server, streamInput: CurrentAggStreamService) {
        this.stream = streamInput;

        this.enableConnectionSocket(ioInput);
    }

    enableConnectionSocket(io: SocketIO.Server): void {
        io.on("connection", (socket: SocketIO.Server) => {
            this.enableSockets(socket);
            this.stream.sendCurrentAggs();
            console.log("New client connected");
        });
    }

    enableSockets(io: SocketIO.Server): void {
        this.enableDisconnectionSocket(io);
        this.enableAddNewSubSocket(io);
    }

    enableAddNewSubSocket(io: SocketIO.Server): void {
        io.on("newsub", message =>  {
            this.stream.addNewSub(message);
        });
    }    

    enableDisconnectionSocket(io: SocketIO.Server): void {
        io.on("disconnect", socket => {
            console.log("Client disconnected");
        });
    }
}