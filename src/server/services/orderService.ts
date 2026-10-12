import { db } from '../db/database.js';
import { socketService } from './socketService.js';
import { Order, OrderItem, OrderStatus, PaymentStatus } from '../types.js';

export interface CreateOrderPayload {
  tableNumber: number;
  items: {
    menuItemId: string;
    quantity: number;
    selectedCustomizations?: string[];
    specialNotes?: string;
  }[];
  tipPercent?: number;
  paymentStatus?: PaymentStatus;
  paymentIntentId?: string;
  specialInstructions?: string;
}

export class OrderService {
  public static async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const table = db.getTable(payload.tableNumber);
    if (!table) {
      const error: any = new Error(`Table #${payload.tableNumber} does not exist.`);
      error.statusCode = 404;
      throw error;
    }

    if (table.status === 'Inactive') {
      const error: any = new Error(`Table #${payload.tableNumber} is currently inactive.`);
      error.statusCode = 400;
      throw error;
    }

    if (!payload.items || payload.items.length === 0) {
      const error: any = new Error('Order items cannot be empty.');
      error.statusCode = 400;
      throw error;
    }

    const processedItems: OrderItem[] = [];
    let subtotal = 0;

    for (const itemReq of payload.items) {
      const menuItem = db.getMenuItem(itemReq.menuItemId);
      if (!menuItem) {
        const error: any = new Error(`Menu item '${itemReq.menuItemId}' not found.`);
        error.statusCode = 404;
        throw error;
      }

      if (!menuItem.isAvailable) {
        const error: any = new Error(`Dish '${menuItem.name}' is temporarily out of stock.`);
        error.statusCode = 400;
        throw error;
      }

      const qty = Math.max(1, Math.min(20, itemReq.quantity || 1));
      let unitPrice = menuItem.price;

      // Calculate customization add-ons if selected
      const selectedCustoms = itemReq.selectedCustomizations || [];
      selectedCustoms.forEach(customLabel => {
        menuItem.customizationOptions.forEach(group => {
          group.options.forEach(opt => {
            if (customLabel.includes(opt.label) || opt.label === customLabel) {
              unitPrice += opt.price;
            }
          });
        });
      });

      const lineTotal = Number((unitPrice * qty).toFixed(2));
      subtotal += lineTotal;

      processedItems.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity: qty,
        price: menuItem.price,
        selectedCustomizations: selectedCustoms,
        unitTotal: Number(unitPrice.toFixed(2)),
        specialNotes: itemReq.specialNotes || ''
      });
    }

    subtotal = Number(subtotal.toFixed(2));
    const tax = Number((subtotal * 0.085).toFixed(2)); // 8.5% Table Tax
    const tipPercent = payload.tipPercent !== undefined ? payload.tipPercent : 0.18;
    const tipAmount = Number((subtotal * tipPercent).toFixed(2));
    const serviceFee = 0; // Complimentary express table expedite
    const totalAmount = Number((subtotal + tax + tipAmount + serviceFee).toFixed(2));

    const order = db.createOrder({
      tableNumber: payload.tableNumber,
      items: processedItems,
      subtotal,
      tax,
      serviceFee,
      tipAmount,
      totalAmount,
      paymentStatus: payload.paymentStatus || 'PayAtCounter',
      paymentIntentId: payload.paymentIntentId || '',
      orderStatus: 'Received',
      specialInstructions: payload.specialInstructions || ''
    });

    // Broadcast new order event to KDS and Table
    socketService.notifyNewOrder(order);

    return order;
  }

  public static getOrderStatus(orderId: string): Order | null {
    return db.getOrder(orderId);
  }

  public static updateOrderStatus(orderId: string, status: OrderStatus): Order {
    const validStatuses: OrderStatus[] = ['Received', 'Preparing', 'Ready', 'Served', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      const error: any = new Error(`Invalid status transition to '${status}'.`);
      error.statusCode = 400;
      throw error;
    }

    const order = db.updateOrderStatus(orderId, status);
    if (!order) {
      const error: any = new Error(`Order #${orderId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    // Broadcast status change via WebSocket
    socketService.notifyOrderStatusUpdated(order);

    return order;
  }

  public static getOrders(filterStatus?: OrderStatus): Order[] {
    return db.getAllOrders(filterStatus);
  }
}
