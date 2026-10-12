import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { Order, ServiceCall } from '../types.js';

class SocketService {
  private io: SocketIOServer | null = null;

  public init(httpServer: HTTPServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH']
      },
      transports: ['websocket', 'polling']
    });

    this.io.on('connection', (socket) => {
      // Client registers for table or kds room
      socket.on('join:table', (tableNumber: number) => {
        if (tableNumber) {
          socket.join(`table:${tableNumber}`);
        }
      });

      socket.on('join:kds', () => {
        socket.join('kds_room');
      });

      socket.on('disconnect', () => {
        // Disconnected cleanly
      });
    });

    return this.io;
  }

  public getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.io has not been initialized yet.');
    }
    return this.io;
  }

  public notifyNewOrder(order: Order): void {
    if (!this.io) return;
    // Broadcast to kitchen display system
    this.io.to('kds_room').emit('order:new', order);
    // Broadcast to customer's specific table
    this.io.to(`table:${order.tableNumber}`).emit('order:new', order);
    // Also broadcast generally for multi-view dashboards
    this.io.emit('order:created', order);
  }

  public notifyOrderStatusUpdated(order: Order): void {
    if (!this.io) return;
    this.io.to('kds_room').emit('order:status_updated', order);
    this.io.to(`table:${order.tableNumber}`).emit('order:status_updated', order);
    this.io.emit('order:updated', order);
  }

  public notifyServiceCall(call: ServiceCall): void {
    if (!this.io) return;
    this.io.to('kds_room').emit('service:call', call);
    this.io.to(`table:${call.tableNumber}`).emit('service:call', call);
    this.io.emit('service:updated', call);
  }
}

export const socketService = new SocketService();
