import { Server } from 'http';
import express from 'express';
import io from 'socket.io';

export class SocketServer {
  public static readonly PORT = 3000;
  public static readonly SERVER_URL = `http://localhost:${SocketServer.PORT}`;
  public readonly http = new Server(express());
  // public readonly socket = io(this.http); io
  // public readonly socket = io['Server']()
  public readonly server = this.http.listen(SocketServer.PORT);
}
