import { db } from '../db/database.js';
import { socketService } from './socketService.js';
import { Table, ServiceCall } from '../types.js';

export class TableService {
  public static verifyTable(tableNumber: number, qrHash?: string): {
    valid: boolean;
    table: Table | null;
    message: string;
  } {
    const table = db.getTable(tableNumber);
    if (!table) {
      return {
        valid: false,
        table: null,
        message: `Table #${tableNumber} is not registered in Aura Bites POS.`
      };
    }

    if (table.status === 'Inactive') {
      return {
        valid: false,
        table,
        message: `Table #${tableNumber} is currently inactive or under maintenance.`
      };
    }

    if (qrHash && qrHash !== table.qrCodeHash) {
      return {
        valid: false,
        table,
        message: `Security token mismatch for Table #${tableNumber}. Please re-scan table QR.`
      };
    }

    return {
      valid: true,
      table,
      message: `Table #${tableNumber} verified successfully.`
    };
  }

  public static callService(tableNumber: number, type: ServiceCall['type'] = 'Assistance', notes?: string): ServiceCall {
    const table = db.getTable(tableNumber);
    if (!table) {
      const error: any = new Error(`Table #${tableNumber} does not exist.`);
      error.statusCode = 404;
      throw error;
    }

    const call = db.createServiceCall(tableNumber, type, notes);
    socketService.notifyServiceCall(call);
    return call;
  }

  public static getActiveServiceCalls(): ServiceCall[] {
    return db.getAllServiceCalls();
  }

  public static updateServiceCall(callId: string, status: ServiceCall['status']): ServiceCall | null {
    const updated = db.updateServiceCallStatus(callId, status);
    if (updated) {
      socketService.notifyServiceCall(updated);
    }
    return updated;
  }
}
