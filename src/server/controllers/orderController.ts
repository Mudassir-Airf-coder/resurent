import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService.js';
import { stripeService } from '../services/stripeService.js';
import { db } from '../db/database.js';

export class OrderController {
  public static async createPaymentIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount, tableNumber, currency, metadata } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Valid amount greater than zero is required for payment intent.', statusCode: 400 }
        });
      }

      const amountInCents = Math.round(Number(amount) * 100);
      const paymentIntent = await stripeService.createPaymentIntent({
        amountInCents,
        currency: currency || 'usd',
        tableNumber: Number(tableNumber) || 7,
        description: `AURA BITES - Table #${tableNumber || 7} Order`,
        metadata
      });

      return res.status(200).json({
        success: true,
        data: paymentIntent
      });
    } catch (err) {
      next(err);
    }
  }

  public static async placeOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableNumber, items, tipPercent, paymentStatus, paymentIntentId, specialInstructions } = req.body;

      if (!tableNumber || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'tableNumber and a non-empty items array are required.', statusCode: 400 }
        });
      }

      const order = await OrderService.createOrder({
        tableNumber: Number(tableNumber),
        items,
        tipPercent: tipPercent !== undefined ? Number(tipPercent) : 0.18,
        paymentStatus: paymentStatus || 'PayAtCounter',
        paymentIntentId: paymentIntentId || '',
        specialInstructions: specialInstructions || ''
      });

      return res.status(201).json({
        success: true,
        message: `Order #${order.orderId} placed successfully for Table #${order.tableNumber}.`,
        data: order
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const order = OrderService.getOrderStatus(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: { message: `Order #${orderId} was not found.`, statusCode: 404 }
        });
      }

      return res.status(200).json({
        success: true,
        data: order
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getTableOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const tableNumber = parseInt(req.params.tableNumber, 10);
      if (isNaN(tableNumber)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid table number format.', statusCode: 400 }
        });
      }

      const orders = db.getOrdersForTable(tableNumber);
      return res.status(200).json({
        success: true,
        data: orders
      });
    } catch (err) {
      next(err);
    }
  }
}
