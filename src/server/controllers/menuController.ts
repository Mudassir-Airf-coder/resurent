import { Request, Response, NextFunction } from 'express';
import { db } from '../db/database.js';

export class MenuController {
  public static async getMenu(_req: Request, res: Response, next: NextFunction) {
    try {
      const items = db.getAllMenuItems();
      return res.status(200).json({
        success: true,
        count: items.length,
        data: items
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const item = db.getMenuItem(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          error: { message: `Menu item with ID '${id}' was not found.`, statusCode: 404 }
        });
      }
      return res.status(200).json({
        success: true,
        data: item
      });
    } catch (err) {
      next(err);
    }
  }
}
