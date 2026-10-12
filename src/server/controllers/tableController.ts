import { Request, Response, NextFunction } from 'express';
import { TableService } from '../services/tableService.js';
import { db } from '../db/database.js';

export class TableController {
  public static async verifyTable(req: Request, res: Response, next: NextFunction) {
    try {
      const tableNumber = parseInt(req.params.tableNumber, 10);
      if (isNaN(tableNumber)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid table number format. Must be an integer.', statusCode: 400 }
        });
      }

      const qrHash = req.query.token as string | undefined;
      const result = TableService.verifyTable(tableNumber, qrHash);

      if (!result.valid) {
        return res.status(result.table ? 403 : 404).json({
          success: false,
          error: { message: result.message, statusCode: result.table ? 403 : 404 }
        });
      }

      const activeOrders = db.getOrdersForTable(tableNumber);

      return res.status(200).json({
        success: true,
        data: {
          table: result.table,
          activeOrders,
          verifiedAt: new Date().toISOString()
        }
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getAllTables(_req: Request, res: Response, next: NextFunction) {
    try {
      const tables = db.getAllTables();
      return res.status(200).json({
        success: true,
        data: tables
      });
    } catch (err) {
      next(err);
    }
  }

  public static async callService(req: Request, res: Response, next: NextFunction) {
    try {
      const tableNumber = parseInt(req.params.tableNumber, 10);
      const { type, notes } = req.body;

      if (isNaN(tableNumber)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid table number.', statusCode: 400 }
        });
      }

      const call = TableService.callService(tableNumber, type || 'Assistance', notes);
      return res.status(201).json({
        success: true,
        data: call,
        message: `Service request for Table #${tableNumber} alerted to floor manager.`
      });
    } catch (err) {
      next(err);
    }
  }
}
