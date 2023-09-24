import { Server } from "socket.io";
import { roomHandler } from "./room";
import 'dotenv/config'

const io = new Server({
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("a user connected");
    roomHandler(socket);
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

io.listen(443)


