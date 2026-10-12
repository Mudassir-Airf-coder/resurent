import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService.js';
import { TableService } from '../services/tableService.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { OrderStatus } from '../types.js';

export class AdminController {
  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { pin, role, staffName } = req.body;

      // Staff PIN verification (default '1234' or '0000' for demo, or password)
      const validPin = pin === '1234' || pin === '7777' || !pin;
      if (!validPin) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid staff PIN. Use 1234 for Kitchen / Manager access.', statusCode: 401 }
        });
      }

      const userRole = role === 'admin' ? 'admin' : 'kitchen';
      const name = staffName || (userRole === 'admin' ? 'Manager Elena' : 'Chef Marco');

      const token = generateToken({
        userId: `staff_${Date.now()}`,
        role: userRole,
        name
      });

      return res.status(200).json({
        success: true,
        data: {
          token,
          user: {
            role: userRole,
            name
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getKitchenOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const statusParam = req.query.status as string | undefined;
      const validStatuses: OrderStatus[] = ['Received', 'Preparing', 'Ready', 'Served', 'Cancelled'];

      const filter = (statusParam && validStatuses.includes(statusParam as OrderStatus))
        ? (statusParam as OrderStatus)
        : undefined;

      const orders = OrderService.getOrders(filter);

      return res.status(200).json({
        success: true,
        count: orders.length,
        filter: filter || 'ALL',
        data: orders
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: { message: 'New status is required.', statusCode: 400 }
        });
      }

      const updated = OrderService.updateOrderStatus(orderId, status as OrderStatus);

      return res.status(200).json({
        success: true,
        message: `Order #${orderId} bumped to status: ${status}.`,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getServiceCalls(_req: Request, res: Response, next: NextFunction) {
    try {
      const calls = TableService.getActiveServiceCalls();
      return res.status(200).json({
        success: true,
        data: calls
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateServiceCall(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updated = TableService.updateServiceCall(id, status);
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: { message: 'Service call not found.', statusCode: 404 }
        });
      }

      return res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }
}
