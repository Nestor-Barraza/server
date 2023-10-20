import { Socket } from "socket.io";
import jsonwebtoken from 'jsonwebtoken'
import { JWT_SECRET } from "../constants";


const rooms: Record<string, Record<string, IUser>> = {
  'venezuela': {},
  'colombia': {},
  'ecuador': {}
};
type Roles = "driver" | "admin"

interface IUser {
  peerId: string;
  userName: string;
  role: Roles
}

interface IRoomParams {
  roomId: string;
  peerId: string;
}

interface IJoinRoomParams extends IRoomParams {
  userName: string;
  token: string;
}

interface TokenPayload {
  uid: string
  email: string
  role: Roles
  country?: string
  iat: number
  exp: number
}

export const roomHandler = (socket: Socket) => {
  const sendError = (message: string) => {
    socket.emit("error", { message })
  }

  const checkToken = (token: string): false | TokenPayload => {
    try {
      const payload = jsonwebtoken.verify(token, JWT_SECRET) as TokenPayload
      return payload
    } catch(error) {
      console.log(error)
      return false
    }
  }

  const createRoom = ({ token } : { token: string }) => {

    const payload = checkToken(token)

    if (!payload) {
      return sendError('token is required or is invalid')
    }

    socket.emit("room-created", { roomId: payload.country || Object.keys(rooms)[0] });
    console.log("user created the room");
  };

  const joinRoom = async ({ roomId, peerId, userName, token }: IJoinRoomParams) => {
    if (!Object.keys(rooms).includes(roomId.toLowerCase())) {
      return sendError(`room ${roomId} not found on rooms [${Object.keys(rooms).join()}]`)
    }

    const payload = checkToken(token)

    if (!payload) {
      return sendError('token is required or is invalid')
    }

    if (!rooms[roomId]) rooms[roomId] = {};
    console.log("user joined the room", roomId, peerId, userName);
    rooms[roomId][peerId] = { peerId, userName, role: payload.role };
    socket.join(roomId);
    console.log({token, payload})
    socket.to(roomId).emit("user-joined", { peerId, userName: payload.email, role: payload.role });
    if (payload.role === "admin") {
      socket.to(roomId).emit("emit-streaming");
    }
    socket.emit("get-users", {
      roomId,
      participants: rooms[roomId],
    });

    socket.on("disconnect", () => {
      console.log("user left the room", peerId);
      leaveRoom({ roomId, peerId });
    });
  };

  const leaveRoom = ({ peerId, roomId }: IRoomParams) => {
    // rooms[roomId] = rooms[roomId]?.filter((id) => id !== peerId);
    socket.to(roomId).emit("user-disconnected", peerId);
  };

  socket.on("create-room", createRoom);
  socket.on("join-room", joinRoom);

};
