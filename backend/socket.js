import { Server } from 'socket.io';

export default class Socket {
    static io = null;

    static initSocket(server) {
        this.io = new Server(server, {
            cors: {
                origin: "*",
                methods: "*",
            },
        });
    }

    static getIO() {
        if (this.io == null) {
            throw new Error('Socket not initialized');
        }
        return this.io;
    }
}