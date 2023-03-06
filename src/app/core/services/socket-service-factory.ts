import { SocketService } from './socket.service';

export const socketServiceFactory = () => {
  const socketService = new SocketService();
  socketService.initializeWebSocketConnection().then((connected) => {
    console.log('Stomp factory connected: ', connected);
  });
  return socketService;
};
