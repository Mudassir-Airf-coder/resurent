import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { TableController } from '../controllers/tableController.js';
import { MenuController } from '../controllers/menuController.js';
import { OrderController } from '../controllers/orderController.js';
import { AdminController } from '../controllers/adminController.js';
import { verifyAdminOrKitchenAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Validation result handler helper
function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Payload validation failed.',
        statusCode: 400,
        validationErrors: errors.array()
      }
    });
  }
  next();
}

/* ----------------------------------------------------
 * 1. TABLE & MENU ROUTES
 * ---------------------------------------------------- */
// GET /api/tables -> List all tables
router.get('/tables', TableController.getAllTables);

// GET /api/tables/:tableNumber -> Verify QR code & fetch status
router.get(
  '/tables/:tableNumber',
  [
    param('tableNumber').isInt({ min: 1, max: 100 }).withMessage('tableNumber must be an integer between 1 and 100')
  ],
  handleValidationErrors,
  TableController.verifyTable
);

// POST /api/tables/:tableNumber/call-service -> Table service summon
router.post(
  '/tables/:tableNumber/call-service',
  [
    param('tableNumber').isInt({ min: 1 }).withMessage('tableNumber must be a valid integer'),
    body('type').optional().isIn(['Water', 'Assistance', 'Bill', 'Cutlery', 'General']).withMessage('Invalid service type'),
    body('notes').optional().isString().trim().escape()
  ],
  handleValidationErrors,
  TableController.callService
);

// GET /api/menu -> Fetches all 5 active menu items
router.get('/menu', MenuController.getMenu);

// GET /api/menu/:id -> Fetches specific menu item
router.get(
  '/menu/:id',
  [
    param('id').isString().trim().notEmpty().withMessage('Item ID is required')
  ],
  handleValidationErrors,
  MenuController.getMenuItem
);

/* ----------------------------------------------------
 * 2. ORDER & CHECKOUT ROUTES
 * ---------------------------------------------------- */
// POST /api/orders/create-payment-intent -> Initiate Stripe payment intent
router.post(
  '/orders/create-payment-intent',
  [
    body('amount').isFloat({ min: 0.5 }).withMessage('amount must be greater than 0.50'),
    body('tableNumber').isInt({ min: 1 }).withMessage('tableNumber must be a valid positive integer'),
    body('currency').optional().isString().trim().isLength({ min: 3, max: 3 })
  ],
  handleValidationErrors,
  OrderController.createPaymentIntent
);

// POST /api/orders -> Place final order
router.post(
  '/orders',
  [
    body('tableNumber').isInt({ min: 1 }).withMessage('Valid tableNumber is required'),
    body('items').isArray({ min: 1 }).withMessage('items must be a non-empty array'),
    body('items.*.menuItemId').isString().notEmpty().withMessage('menuItemId is required for each item'),
    body('items.*.quantity').isInt({ min: 1, max: 50 }).withMessage('quantity must be between 1 and 50'),
    body('items.*.selectedCustomizations').optional().isArray(),
    body('tipPercent').optional().isFloat({ min: 0, max: 1 }).withMessage('tipPercent must be between 0 and 1'),
    body('paymentStatus').optional().isIn(['Pending', 'Paid', 'Failed', 'PayAtCounter']),
    body('paymentIntentId').optional().isString().trim(),
    body('specialInstructions').optional().isString().trim().escape()
  ],
  handleValidationErrors,
  OrderController.placeOrder
);

// GET /api/orders/status/:orderId -> Fetches live status for guest tracker
router.get(
  '/orders/status/:orderId',
  [
    param('orderId').isString().trim().notEmpty().withMessage('orderId is required')
  ],
  handleValidationErrors,
  OrderController.getOrderStatus
);

// GET /api/orders/table/:tableNumber -> Fetches all orders for a table
router.get(
  '/orders/table/:tableNumber',
  [
    param('tableNumber').isInt({ min: 1 }).withMessage('tableNumber must be a valid integer')
  ],
  handleValidationErrors,
  OrderController.getTableOrders
);

/* ----------------------------------------------------
 * 3. KITCHEN / ADMIN DASHBOARD ROUTES
 * ---------------------------------------------------- */
// POST /api/admin/login -> Staff PIN login
router.post(
  '/admin/login',
  [
    body('pin').optional().isString().trim(),
    body('role').optional().isIn(['admin', 'kitchen'])
  ],
  handleValidationErrors,
  AdminController.login
);

// GET /api/admin/orders?status=Received -> Active orders for kitchen display
router.get(
  '/admin/orders',
  [
    query('status').optional().isIn(['Received', 'Preparing', 'Ready', 'Served', 'Cancelled'])
  ],
  handleValidationErrors,
  verifyAdminOrKitchenAuth,
  AdminController.getKitchenOrders
);

// PATCH /api/admin/orders/:orderId/status -> Bump order status
router.patch(
  '/admin/orders/:orderId/status',
  [
    param('orderId').isString().trim().notEmpty().withMessage('orderId is required'),
    body('status').isIn(['Received', 'Preparing', 'Ready', 'Served', 'Cancelled']).withMessage('Valid orderStatus is required')
  ],
  handleValidationErrors,
  verifyAdminOrKitchenAuth,
  AdminController.updateOrderStatus
);

// GET /api/admin/service-calls -> Kitchen/floor attendant requests
router.get(
  '/admin/service-calls',
  verifyAdminOrKitchenAuth,
  AdminController.getServiceCalls
);

// PATCH /api/admin/service-calls/:id/status
router.patch(
  '/admin/service-calls/:id/status',
  [
    param('id').isString().trim().notEmpty(),
    body('status').isIn(['Pending', 'Acknowledged', 'Resolved']).withMessage('Valid status required')
  ],
  handleValidationErrors,
  verifyAdminOrKitchenAuth,
  AdminController.updateServiceCall
);

// GET /api/health -> System health and socket status
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    system: 'Aura Bites Culinary POS Engine',
    timestamp: new Date().toISOString(),
    version: '2.4.0'
  });
});

export default router;
