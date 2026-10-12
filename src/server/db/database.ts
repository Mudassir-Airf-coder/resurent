import { Table, MenuItem, Order, ServiceCall, OrderStatus, PaymentStatus } from '../types.js';

class RestaurantDatabase {
  private tables: Map<number, Table> = new Map();
  private menuItems: Map<string, MenuItem> = new Map();
  private orders: Map<string, Order> = new Map();
  private serviceCalls: Map<string, ServiceCall> = new Map();
  private orderCounter: number = 1092;

  constructor() {
    this.seedTables();
    this.seedMenu();
    this.seedOrders();
  }

  private seedTables() {
    const tableConfigs = [
      { num: 1, seats: 2, location: 'Window Bay A' },
      { num: 2, seats: 2, location: 'Window Bay B' },
      { num: 3, seats: 4, location: 'Dining Salon Center' },
      { num: 4, seats: 4, location: 'Dining Salon Center' },
      { num: 5, seats: 6, location: 'Garden Terrace' },
      { num: 6, seats: 6, location: 'Garden Terrace' },
      { num: 7, seats: 4, location: 'Mezzanine Booth' }, // Primary demonstration table
      { num: 8, seats: 2, location: 'Mezzanine Booth' },
      { num: 9, seats: 8, location: 'Private Wine Alcove' },
      { num: 10, seats: 4, location: 'Courtyard Patio' },
      { num: 11, seats: 4, location: 'Courtyard Patio' },
      { num: 12, seats: 2, location: 'Chef Counter' }
    ];

    tableConfigs.forEach(t => {
      this.tables.set(t.num, {
        tableNumber: t.num,
        qrCodeHash: `aura_qr_tbl_${String(t.num).padStart(2, '0')}_token_${(t.num * 8831).toString(16)}`,
        status: t.num === 7 ? 'Occupied' : t.num === 3 ? 'Occupied' : 'Available',
        currentSessionId: t.num === 7 ? 'session_tbl_07_active' : t.num === 3 ? 'session_tbl_03_active' : null,
        seats: t.seats,
        location: t.location,
        lastActiveAt: new Date().toISOString()
      });
    });
  }

  private seedMenu() {
    const items: MenuItem[] = [
      {
        id: 'item_01',
        dishCode: '#3D-01',
        name: 'The Signature Truffle Double',
        price: 16.99,
        category: 'Burgers & Sliders',
        description: 'Dual smashed prime Angus beef, aged white cheddar blanket, hand-foraged black truffle aioli, griddled artisanal brioche.',
        calories: '780 kcal',
        badges: ['100% Angus Beef', 'Black Truffle', '780 kcal'],
        imageModelUrl: '/assets/models/truffle_double.gltf',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_yl5HBrAmp3pP9RAIXI9lrFga_lwsqUEtcG-TVzudBiPlxovINvnkAXlTVGZIkzP7jFhCXYBKLTSLye007pF1efslv54G4xDFzNZ3Jx4Hqm9mL9ZEJa3HQtxSm0BYj2DlTGZTyPHUOUzOw82J9f5LTNlsKq3_YjoteP0M8u7xgKKoabYrV5hY9k5mlumOgPpxsaZ5ejnH4c-mV4kS30kQRnoRxtlfIrAupss86aUTJAJA7QBrED5-oQ',
        isAvailable: true,
        customizationOptions: [
          {
            id: 'heat_level',
            name: 'Heat Intensity',
            type: 'radio',
            required: true,
            options: [
              { id: 'mild', label: 'Mild', price: 0 },
              { id: 'medium', label: 'Medium 🔥', price: 0 },
              { id: 'blazing', label: 'Blazing 🔥🔥', price: 0 }
            ]
          },
          {
            id: 'addons',
            name: 'Artisanal Add-ons',
            type: 'checkbox',
            required: false,
            options: [
              { id: 'extra_cheddar', label: 'Extra Aged White Cheddar', price: 1.50 },
              { id: 'turkey_bacon', label: 'Crispy Turkey Bacon Strips', price: 2.00 },
              { id: 'truffle_aioli', label: 'Double Black Truffle Aioli', price: 2.00 }
            ]
          }
        ]
      },
      {
        id: 'item_02',
        dishCode: '#3D-02',
        name: 'Crispy Nashville Hot Bird',
        price: 14.50,
        category: 'Crispy Poultry',
        description: 'Buttermilk marinated fried chicken thigh dipped in fiery cayenne oil, house pickled cucumber chips, crisp purple slaw on seeded brioche.',
        calories: '690 kcal',
        badges: ['Spiced Crisp Chicken', 'Purple Slaw', '690 kcal'],
        imageModelUrl: '/assets/models/nashville_hot_bird.gltf',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdlcpADyuJgekNa-L1wXSqN-UxCzYR6RwrlPRSWa6jJOzto__mkHFRJ6vD-fbvKY7c0BgY9muq5H_5qJu6VB5ucAjGdQDV0crH7rEcFaakAl9V2w2izVK-U-5pLBDfP6v8IyO7B7Ini9GA1NujNO34W2tCRS_um8cp1JVrHRL94wjJyb6NORqASIE2qRP1cM0eujQUQ-_bXz_jHHUiI4JI6Bq6EGLSa5QcicXShJZ1b3A8TQnF6ykHew',
        isAvailable: true,
        customizationOptions: [
          {
            id: 'heat_level',
            name: 'Heat Intensity',
            type: 'radio',
            required: true,
            options: [
              { id: 'mild', label: 'Southern Mild', price: 0 },
              { id: 'medium', label: 'Nashville Hot 🔥', price: 0 },
              { id: 'blazing', label: 'Reaper Blaze 🔥🔥🔥', price: 0.50 }
            ]
          },
          {
            id: 'addons',
            name: 'Artisanal Add-ons',
            type: 'checkbox',
            required: false,
            options: [
              { id: 'extra_slaw', label: 'Extra Purple Slaw', price: 1.00 },
              { id: 'thick_pickles', label: 'Double Kosher Pickles', price: 0.75 }
            ]
          }
        ]
      },
      {
        id: 'item_03',
        dishCode: '#3D-03',
        name: 'Smokey Loaded Truffle Fries',
        price: 9.99,
        category: 'Sides & Sharables',
        description: 'Hand-cut crispy Russet potatoes, triple-melted sharp cheddar lake, chopped maple turkey bacon, fresh chive dust & truffle mist.',
        calories: '520 kcal',
        badges: ['Russet Crinkle Cut', 'Aged Cheddar Lake', '520 kcal'],
        imageModelUrl: '/assets/models/loaded_truffle_fries.gltf',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC5v5Xa99CvfRIUUIFpdfZKL3w_388ZlcKwKcvuF24nPaBpodffC6uSvGk4PLbALweJ0swTn95Bc-P2kWwuNdzTg6oYNGIDZVQ3yJFT6SWBmAU0pOEw0toq5PzQcBlhQUb4DdnyU_GQ68EL_VG3fmtx4zsMUblBuZQ_7OHXZwgx1c1ZDn3BwgKgWHzkZH9vPTJQzlUqzqGojWOlEkCPv2k63u73sy8A3MM5pxDpNKz-rKYw01w6VY-Tg',
        isAvailable: true,
        customizationOptions: [
          {
            id: 'addons',
            name: 'Artisanal Add-ons',
            type: 'checkbox',
            required: false,
            options: [
              { id: 'extra_cheese', label: 'Extra Melted Cheddar', price: 1.50 },
              { id: 'jalapeno', label: 'Fire-Roasted Jalapeños', price: 1.00 }
            ]
          }
        ]
      },
      {
        id: 'item_04',
        dishCode: '#3D-04',
        name: 'Artisanal Wild Mushroom Slice',
        price: 11.50,
        category: 'Artisanal Slices',
        description: 'Slow 72h cold-fermented sourdough crust, creamy roasted garlic purée, cremini and foraged morels, fior di latte mozzarella.',
        calories: '460 kcal',
        badges: ['72h Fermented Crust', 'Roasted Morels', '460 kcal'],
        imageModelUrl: '/assets/models/wild_mushroom_pizza.gltf',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDfGybbZPyL_LQs5W1Jhq6WKP6Eey6EBz6zNQkQ74SBBDgljQ9YwnlgB6eDSsZoRY6VInFTgm2wRuMypk-rFfEoKsD1FINCsXMgF88s1OvaWd53BfMFhwKf7AKFgdAUtHgQHZhR4wNc4gjv5Qm19xljkxexlfw_yTT_E2pUTUK-7JvdHj_Hv5XeV7twmufLCXbELtXXrk-VPabWt0v0ma3EWY0n041a-8URHOyg_oeFdY04eDlpirxBA',
        isAvailable: true,
        customizationOptions: [
          {
            id: 'addons',
            name: 'Artisanal Add-ons',
            type: 'checkbox',
            required: false,
            options: [
              { id: 'truffle_oil', label: 'White Truffle Drizzle', price: 1.75 },
              { id: 'micro_basil', label: 'Fresh Micro Basil', price: 0.75 }
            ]
          }
        ]
      },
      {
        id: 'item_05',
        dishCode: '#3D-05',
        name: 'Craft Salted Caramel Shake',
        price: 7.99,
        category: 'Beverages & Sweets',
        description: 'Creamy hand-spun Madagascar bean ice cream, thick buttery caramel ribbons, pinch of Brittany fleur de sel and a 24k gold straw accent.',
        calories: '580 kcal',
        badges: ['Madagascar Vanilla', 'Fleur de Sel', '580 kcal'],
        imageModelUrl: '/assets/models/salted_caramel_shake.gltf',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAbwi8M0ESmvO5qiXD8faUWYtESP7F_u6NTkqQNqiVHMyCeWlQhuW1dbPL1bYy04fnzxSnAAcKoovA3c_3kyMV1vd10neqVws0Ohwbq_9hc0_8gS3gIP0-dV_S11xp8jw0p1edG1VqXO4czI_ZHGqeOiROYz9gH5QtHELF63mDodsx37_PQNEPsWACQOEr5O53JDqCDe6OXdjlxizK6nJyrJ_dVEmv_iLCBW9TydHIg7Q9hiEsY3rs2g',
        isAvailable: true,
        customizationOptions: [
          {
            id: 'milk_base',
            name: 'Milk Base',
            type: 'radio',
            required: true,
            options: [
              { id: 'whole_dairy', label: 'Organic Whole Milk', price: 0 },
              { id: 'oat_milk', label: 'Barista Oat Milk', price: 1.00 }
            ]
          }
        ]
      }
    ];

    items.forEach(item => this.menuItems.set(item.id, item));
  }

  private seedOrders() {
    const sample1: Order = {
      orderId: 'AB-1088',
      tableNumber: 3,
      items: [
        {
          menuItemId: 'item_02',
          name: 'Crispy Nashville Hot Bird',
          quantity: 2,
          price: 14.50,
          selectedCustomizations: ['Nashville Hot 🔥', 'Extra Purple Slaw'],
          unitTotal: 15.50
        },
        {
          menuItemId: 'item_03',
          name: 'Smokey Loaded Truffle Fries',
          quantity: 1,
          price: 9.99,
          selectedCustomizations: ['Extra Melted Cheddar'],
          unitTotal: 11.49
        }
      ],
      subtotal: 42.49,
      tax: 3.61,
      serviceFee: 0,
      tipAmount: 7.65,
      totalAmount: 53.75,
      paymentStatus: 'Paid',
      paymentIntentId: 'pi_3MtwxELkdZ07ZFs10zZ9SAMPLE1',
      orderStatus: 'Preparing',
      specialInstructions: 'Allergies: shellfish on table. Extra napkins please.',
      createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      estimatedPrepMinutes: 12,
      kitchenStation: 'Grill & Fryer 2'
    };

    const sample2: Order = {
      orderId: 'AB-1090',
      tableNumber: 5,
      items: [
        {
          menuItemId: 'item_04',
          name: 'Artisanal Wild Mushroom Slice',
          quantity: 2,
          price: 11.50,
          selectedCustomizations: ['White Truffle Drizzle'],
          unitTotal: 13.25
        },
        {
          menuItemId: 'item_05',
          name: 'Craft Salted Caramel Shake',
          quantity: 2,
          price: 7.99,
          selectedCustomizations: ['Barista Oat Milk'],
          unitTotal: 8.99
        }
      ],
      subtotal: 44.48,
      tax: 3.78,
      serviceFee: 0,
      tipAmount: 8.00,
      totalAmount: 56.26,
      paymentStatus: 'Paid',
      paymentIntentId: 'pi_3MtwxELkdZ07ZFs10zZ9SAMPLE2',
      orderStatus: 'Ready',
      specialInstructions: 'Table anniversary celebration.',
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      estimatedPrepMinutes: 15,
      kitchenStation: 'Pizza Hearth'
    };

    this.orders.set(sample1.orderId, sample1);
    this.orders.set(sample2.orderId, sample2);
  }

  // Table operations
  public getTable(tableNumber: number): Table | null {
    return this.tables.get(tableNumber) || null;
  }

  public getAllTables(): Table[] {
    return Array.from(this.tables.values());
  }

  public updateTableStatus(tableNumber: number, status: Table['status'], sessionId?: string | null): Table | null {
    const table = this.tables.get(tableNumber);
    if (!table) return null;
    table.status = status;
    if (sessionId !== undefined) {
      table.currentSessionId = sessionId;
    }
    table.lastActiveAt = new Date().toISOString();
    this.tables.set(tableNumber, table);
    return table;
  }

  // Menu operations
  public getAllMenuItems(): MenuItem[] {
    return Array.from(this.menuItems.values());
  }

  public getMenuItem(id: string): MenuItem | null {
    return this.menuItems.get(id) || null;
  }

  // Order operations
  public getOrder(orderId: string): Order | null {
    return this.orders.get(orderId) || null;
  }

  public getAllOrders(statusFilter?: OrderStatus): Order[] {
    const list = Array.from(this.orders.values());
    if (statusFilter) {
      return list.filter(o => o.orderStatus === statusFilter);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrdersForTable(tableNumber: number): Order[] {
    return Array.from(this.orders.values())
      .filter(o => o.tableNumber === tableNumber)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createOrder(orderData: Omit<Order, 'orderId' | 'createdAt' | 'updatedAt'>): Order {
    this.orderCounter++;
    const orderId = `AB-${this.orderCounter}`;
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...orderData,
      orderId,
      createdAt: now,
      updatedAt: now,
      estimatedPrepMinutes: 12 + Math.floor(Math.random() * 6),
      kitchenStation: 'Main Expeditor'
    };

    this.orders.set(orderId, newOrder);

    // Update table status to occupied with active session
    this.updateTableStatus(newOrder.tableNumber, 'Occupied', `session_${orderId}`);

    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
    const order = this.orders.get(orderId);
    if (!order) return null;
    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();
    this.orders.set(orderId, order);
    return order;
  }

  public updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus, paymentIntentId?: string): Order | null {
    const order = this.orders.get(orderId);
    if (!order) return null;
    order.paymentStatus = paymentStatus;
    if (paymentIntentId) {
      order.paymentIntentId = paymentIntentId;
    }
    order.updatedAt = new Date().toISOString();
    this.orders.set(orderId, order);
    return order;
  }

  // Service calls
  public createServiceCall(tableNumber: number, type: ServiceCall['type'], notes?: string): ServiceCall {
    const id = `srv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const call: ServiceCall = {
      id,
      tableNumber,
      type,
      status: 'Pending',
      timestamp: new Date().toISOString(),
      notes
    };
    this.serviceCalls.set(id, call);
    return call;
  }

  public getAllServiceCalls(): ServiceCall[] {
    return Array.from(this.serviceCalls.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public updateServiceCallStatus(id: string, status: ServiceCall['status']): ServiceCall | null {
    const call = this.serviceCalls.get(id);
    if (!call) return null;
    call.status = status;
    this.serviceCalls.set(id, call);
    return call;
  }
}

export const db = new RestaurantDatabase();
