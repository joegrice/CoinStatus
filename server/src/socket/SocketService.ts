import { CurrentAggStreamService } from "../stream/CurrentAggStreamService";

export class SocketService {

    io: SocketIO.Server;
    stream: CurrentAggStreamService

    constructor(ioInput: SocketIO.Server, streamInput: CurrentAggStreamService) {
        this.io = ioInput;
        this.stream = streamInput;
    }

    enableSockets(): void {
        this.enableConnectionSocket();
        this.enableDisconnectionSocket();
    }

    enableConnectionSocket(): void {
        this.io.on("connection", socket => {
            console.log("New client connected");
            this.stream.sendCurrentAggs();
        });
    }

    enableDisconnectionSocket(): void {
        this.io.on("disconnect", socket => {
            console.log("Client disconnected");
        });
    }
}