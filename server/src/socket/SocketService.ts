export class SocketService {

    io: SocketIO.Server;

    constructor(ioInput: SocketIO.Server) {
        this.io = ioInput;
    }

    enableSockets(): void {
        this.enableConnectionSocket();
    }

    enableConnectionSocket(): void {
        this.io.on("connection", socket => {
            console.log("New client connected");
            socket.on("disconnect", () => console.log("Client disconnected"));
        });
    }
}