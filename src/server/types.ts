export type TableStatus = 'Available' | 'Occupied' | 'Billing' | 'Inactive';

export interface Table {
  tableNumber: number;
  qrCodeHash: string;
  status: TableStatus;
  currentSessionId: string | null;
  seats?: number;
  location?: string;
  lastActiveAt?: string;
}

export interface CustomizationGroup {
  id: string;
  name: string;
  type: 'radio' | 'checkbox';
  required: boolean;
  options: {
    id: string;
    label: string;
    price: number;
    calories?: number;
  }[];
}

export interface MenuItem {
  id: string;
  dishCode: string;
  name: string;
  price: number;
  category: string;
  description: string;
  calories: string;
  badges: string[];
  imageModelUrl: string; // 3D asset URL / procedural reference
  imageUrl: string;
  isAvailable: boolean;
  customizationOptions: CustomizationGroup[];
}

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'PayAtCounter';
export type OrderStatus = 'Received' | 'Preparing' | 'Ready' | 'Served' | 'Cancelled';

export interface OrderItemCustomization {
  groupName: string;
  choice: string;
  price: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  selectedCustomizations: string[];
  unitTotal: number;
  specialNotes?: string;
}

export interface Order {
  orderId: string; // e.g., "AB-1092"
  tableNumber: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  serviceFee: number;
  tipAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentIntentId: string;
  orderStatus: OrderStatus;
  specialInstructions: string;
  createdAt: string;
  updatedAt: string;
  estimatedPrepMinutes?: number;
  kitchenStation?: string;
}

export interface ServiceCall {
  id: string;
  tableNumber: number;
  type: 'Water' | 'Assistance' | 'Bill' | 'Cutlery' | 'General';
  status: 'Pending' | 'Acknowledged' | 'Resolved';
  timestamp: string;
  notes?: string;
}
