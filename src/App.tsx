/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MenuItem, Order, ServiceCall, OrderStatus } from './server/types.js';
import { ThreeFoodCanvas } from './components/ThreeFoodCanvas.js';
import { Header } from './components/Header.js';
import { DishDetailCard } from './components/DishDetailCard.js';
import { DishCarousel } from './components/DishCarousel.js';
import { CustomizeModal } from './components/CustomizeModal.js';
import { CartDrawer, CartItem } from './components/CartDrawer.js';
import { OrderTrackerModal } from './components/OrderTrackerModal.js';
import { KitchenDisplaySystem } from './components/KitchenDisplaySystem.js';
import { ServiceCallModal } from './components/ServiceCallModal.js';
import { TableSelectorModal } from './components/TableSelectorModal.js';

// Default 5 culinary items matching specification
const INITIAL_DISHES: MenuItem[] = [
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
    customizationOptions: []
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
    customizationOptions: []
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
    customizationOptions: []
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
    customizationOptions: []
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
    customizationOptions: []
  }
];

export default function App() {
  const [dishes, setDishes] = useState<MenuItem[]>(INITIAL_DISHES);
  const [activeDishIndex, setActiveDishIndex] = useState<number>(0);
  const [tableNumber, setTableNumber] = useState<number>(7);

  // Cart state initialized with sample items matching the exact $42.00 / 3 items screenshot
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 'cart_init_1',
      menuItemId: 'item_01',
      name: 'The Signature Truffle Double',
      unitPrice: 16.99,
      quantity: 1,
      selectedCustomizations: ['Mild Heat', 'Extra Aged Cheddar'],
      specialNotes: ''
    },
    {
      id: 'cart_init_2',
      menuItemId: 'item_02',
      name: 'Crispy Nashville Hot Bird',
      unitPrice: 17.02,
      quantity: 1,
      selectedCustomizations: ['Nashville Hot 🔥', 'Extra Purple Slaw'],
      specialNotes: ''
    },
    {
      id: 'cart_init_3',
      menuItemId: 'item_05',
      name: 'Craft Salted Caramel Shake',
      unitPrice: 7.99,
      quantity: 1,
      selectedCustomizations: ['24k Gold Straw'],
      specialNotes: ''
    }
  ]);

  // Orders & KDS state
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
  const [activeTrackedOrder, setActiveTrackedOrder] = useState<Order | null>(null);

  // View & Modals state
  const [activeView, setActiveView] = useState<'menu' | 'kds' | 'orders'>('menu');
  const [isCustomizeOpen, setIsCustomizeOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);
  const [isServiceOpen, setIsServiceOpen] = useState<boolean>(false);
  const [isTableSelectOpen, setIsTableSelectOpen] = useState<boolean>(false);

  // Real-time Socket.io state
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);

  // Sound chime synthesizer for real-time kitchen / table events
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio autoplay policy
    }
  };

  // 1. Fetch Menu from Backend
  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setDishes(json.data);
        }
      })
      .catch((err) => console.log('Using default menu items:', err));
  }, []);

  // 2. Fetch Orders & Service Calls for KDS
  const refreshOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const json = await res.json();
      if (json.success && json.data) {
        setOrders(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch admin orders:', e);
    }
  };

  const refreshServiceCalls = async () => {
    try {
      const res = await fetch('/api/admin/service-calls');
      const json = await res.json();
      if (json.success && json.data) {
        setServiceCalls(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch service calls:', e);
    }
  };

  // 3. Setup Socket.io Real-Time Engine
  useEffect(() => {
    refreshOrders();
    refreshServiceCalls();

    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsSocketConnected(true);
      socket.emit('join:table', tableNumber);
      socket.emit('join:kds');
    });

    socket.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    // Real-time Event: New Order
    socket.on('order:new', (newOrder: Order) => {
      playChime();
      setOrders((prev) => [newOrder, ...prev.filter((o) => o.orderId !== newOrder.orderId)]);
      if (newOrder.tableNumber === tableNumber) {
        setActiveTrackedOrder(newOrder);
      }
    });

    // Real-time Event: Order Status Updated
    socket.on('order:status_updated', (updatedOrder: Order) => {
      playChime();
      setOrders((prev) =>
        prev.map((o) => (o.orderId === updatedOrder.orderId ? updatedOrder : o))
      );
      if (activeTrackedOrder?.orderId === updatedOrder.orderId) {
        setActiveTrackedOrder(updatedOrder);
      }
    });

    // Real-time Event: Table Service Request
    socket.on('service:call', (call: ServiceCall) => {
      playChime();
      setServiceCalls((prev) => [call, ...prev.filter((c) => c.id !== call.id)]);
    });

    return () => {
      socket.disconnect();
    };
  }, [tableNumber]);

  // Cart operations
  const handleUpdateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.id === id) {
            const newQty = it.quantity + delta;
            return newQty > 0 ? { ...it, quantity: newQty } : null;
          }
          return it;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((it) => it.id !== id));
  };

  const handleAddToCart = (newItem: {
    menuItemId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    selectedCustomizations: string[];
    specialNotes: string;
  }) => {
    const item: CartItem = {
      id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...newItem
    };
    setCart((prev) => [...prev, item]);
    setIsCartOpen(true);
  };

  const handleQuickAdd = (dish: MenuItem) => {
    const item: CartItem = {
      id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      menuItemId: dish.id,
      name: dish.name,
      unitPrice: dish.price,
      quantity: 1,
      selectedCustomizations: ["Chef's Signature Recipe"]
    };
    setCart((prev) => [...prev, item]);
    setIsCartOpen(true);
  };

  // KDS Status Bump
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? json.data : o))
        );
      }
    } catch (err) {
      console.error('Failed to bump status:', err);
    }
  };

  const handleResolveServiceCall = async (callId: string) => {
    try {
      const res = await fetch(`/api/admin/service-calls/${callId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved' })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setServiceCalls((prev) =>
          prev.map((c) => (c.id === callId ? json.data : c))
        );
      }
    } catch (err) {
      console.error('Failed to resolve call:', err);
    }
  };

  // Cart financial totals
  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const activeDish = dishes[activeDishIndex] || dishes[0];
  const activeKDSOrdersCount = orders.filter(
    (o) => o.orderStatus !== 'Served' && o.orderStatus !== 'Cancelled'
  ).length;

  return (
    <div className="bg-[#faf5ee] text-[#3a302a] font-['Manrope',sans-serif] min-h-screen flex flex-col relative select-none antialiased">
      {/* 1. TOP HEADER */}
      <Header
        tableNumber={tableNumber}
        cartCount={cartCount}
        cartTotal={cartSubtotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTableSelect={() => setIsTableSelectOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
        kdsActiveCount={activeKDSOrdersCount}
      />

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-20 bg-[#faf5ee]">
        {/* KITCHEN DISPLAY SYSTEM VIEW */}
        {activeView === 'kds' ? (
          <KitchenDisplaySystem
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
            serviceCalls={serviceCalls}
            onResolveServiceCall={handleResolveServiceCall}
            onCloseKDS={() => setActiveView('menu')}
            isSocketConnected={isSocketConnected}
          />
        ) : (
          <div className="flex flex-col w-full text-[#3a302a] pb-12">
            {/* 3D VIEWPORT CONTAINER */}
            <section className="relative w-full overflow-hidden bg-[#ece6dc] shadow-md border-b border-[#d8d0c8]/50">
              {/* Ambient Warm Radiance Gradients */}
              <div className="absolute -top-10 -left-10 w-48 h-48 bg-[#c2652a]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-1/2 right-0 w-56 h-56 bg-[#f0a878]/20 rounded-full blur-3xl pointer-events-none" />

              {/* Live 3D Three.js Food Scene */}
              <ThreeFoodCanvas activeDishIndex={activeDishIndex} />

              {/* Floating HUD: Top Badges & Reset Controls */}
              <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xs border border-[#d8d0c8]/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c2652a] animate-ping" />
                  <span className="text-[11px] font-bold tracking-wider text-[#c2652a] uppercase font-label">
                    {activeDish.dishCode} • {activeDish.name.split(' ')[1] || activeDish.name}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#f2ece4] text-[#605850] font-label font-medium uppercase tracking-widest">
                    PBR 360°
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const btn = document.getElementById('internal-reset-view-btn');
                    if (btn) btn.click();
                  }}
                  className="pointer-events-auto flex items-center gap-1.5 bg-white/85 hover:bg-white active:scale-90 transition-transform backdrop-blur-md px-3 py-1.5 rounded-full shadow-xs text-[#3a302a] font-label text-xs font-semibold cursor-pointer border border-[#d8d0c8]/40"
                >
                  <span className="material-symbols-outlined text-[15px] text-[#c2652a]">
                    restart_alt
                  </span>
                  <span>Reset</span>
                </button>
              </div>

              {/* Floating HUD: Interactive Instruction & 5 Dots */}
              <div className="absolute bottom-3 inset-x-0 flex flex-col items-center gap-2 pointer-events-none">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/75 backdrop-blur-xs text-[10px] font-medium text-[#605850] font-label tracking-wide border border-[#d8d0c8]/40 shadow-xs">
                  <span className="material-symbols-outlined text-[13px] text-[#c2652a]">
                    touch_app
                  </span>
                  <span>Drag to turn 360° • Pinch to inspect texture</span>
                </div>

                {/* 5 Dish Pagination Dots */}
                <div className="flex items-center gap-1.5 pointer-events-auto">
                  {dishes.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveDishIndex(idx)}
                      className={`transition-all duration-300 cursor-pointer ${
                        idx === activeDishIndex
                          ? 'w-6 h-1.5 rounded-full bg-[#c2652a]'
                          : 'w-2 h-1.5 rounded-full bg-[#d8d0c8] hover:bg-[#c2652a]'
                      }`}
                      aria-label={`Select dish ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* ACTIVE DISH SUMMARY CARD */}
            <DishDetailCard
              dish={activeDish}
              onCustomize={() => setIsCustomizeOpen(true)}
              onQuickAdd={() => handleQuickAdd(activeDish)}
            />

            {/* SWIPEABLE LUXURY DISH CAROUSEL */}
            <DishCarousel
              dishes={dishes}
              activeIndex={activeDishIndex}
              onSelectDish={(idx) => setActiveDishIndex(idx)}
              onQuickAdd={handleQuickAdd}
            />

            {/* DIRECT-TO-TABLE SERVICE & CART CTA BAR */}
            <section className="px-5 mt-4 max-w-xl mx-auto w-full">
              <div className="bg-[#f6f0e8] border border-[#d8d0c8]/60 rounded-xl p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#fbe8d8] flex items-center justify-center text-[#c2652a]">
                    <span className="material-symbols-outlined text-[20px]">room_service</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#3a302a] font-label block">
                      Direct-to-Table Service
                    </span>
                    <span className="text-[10px] text-[#605850] font-body">
                      Chef expedites directly to Table #{String(tableNumber).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#f2ece4] hover:bg-[#c2652a] hover:text-[#faf5ee] text-[11px] font-bold text-[#c2652a] font-label transition-colors flex items-center gap-1 cursor-pointer border border-[#d8d0c8]/50"
                >
                  <span>View Cart</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </section>

            {/* ACTIVE ORDER LIVE TRACKER BANNER (If Active Order Exists) */}
            {activeTrackedOrder && (
              <section className="px-5 mt-3 max-w-xl mx-auto w-full">
                <div
                  onClick={() => setIsTrackerOpen(true)}
                  className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-center justify-between shadow-xs cursor-pointer hover:bg-amber-100/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#c2652a] animate-ping" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#c2652a] font-label block">
                        Ticket #{activeTrackedOrder.orderId} • Live Kitchen Status
                      </span>
                      <span className="text-xs font-bold text-[#3a302a]">
                        {activeTrackedOrder.orderStatus === 'Received' && 'Order Dispatched to Kitchen'}
                        {activeTrackedOrder.orderStatus === 'Preparing' && 'Searing on Grill Station 🔥'}
                        {activeTrackedOrder.orderStatus === 'Ready' && 'Ready for Table Delivery ✨'}
                        {activeTrackedOrder.orderStatus === 'Served' && 'Delivered to Table ✓'}
                      </span>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-[#c2652a] font-label underline">
                    Track Live
                  </button>
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* 3. FIXED BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 w-full z-40 pb-safe bg-[#faf5ee]/90 backdrop-blur-xl border-t border-[#d8d0c8]/50 shadow-[0_-2px_16px_rgba(58,48,42,0.04)]">
        <div className="flex justify-around items-center h-16 px-3 max-w-md mx-auto">
          {/* Menu Tab */}
          <button
            onClick={() => setActiveView('menu')}
            className={`flex flex-col items-center justify-center gap-1 w-14 h-12 transition-all cursor-pointer ${
              activeView === 'menu' ? 'text-[#c2652a] font-bold' : 'text-[#605850] hover:text-[#3a302a]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">restaurant_menu</span>
            <span className="text-[10px] font-medium font-label tracking-wide uppercase">Menu</span>
          </button>

          {/* 3D View Tab */}
          <button
            onClick={() => {
              setActiveView('menu');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex flex-col items-center justify-center gap-1 w-14 h-12 text-[#605850] hover:text-[#c2652a] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">view_in_ar</span>
            <span className="text-[10px] font-medium font-label tracking-wide uppercase">3D View</span>
          </button>

          {/* Orders Tab */}
          <button
            onClick={() => {
              if (activeTrackedOrder) {
                setIsTrackerOpen(true);
              } else {
                setIsCartOpen(true);
              }
            }}
            className="flex flex-col items-center justify-center gap-1 w-14 h-12 text-[#605850] hover:text-[#c2652a] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">receipt_long</span>
            <span className="text-[10px] font-medium font-label tracking-wide uppercase">Orders</span>
          </button>

          {/* Service Summon Tab */}
          <button
            onClick={() => setIsServiceOpen(true)}
            className="flex flex-col items-center justify-center gap-1 w-14 h-12 text-[#605850] hover:text-[#c2652a] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">notifications_active</span>
            <span className="text-[10px] font-medium font-label tracking-wide uppercase">Service</span>
          </button>
        </div>
      </nav>

      {/* 4. MODALS & DRAWERS */}
      {/* A. Bespoke Customization Bottom Sheet */}
      <CustomizeModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        dish={activeDish}
        onAddToCart={handleAddToCart}
      />

      {/* B. Cart Slide-over Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        tableNumber={tableNumber}
        items={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onCheckoutSuccess={(placedOrder) => {
          setCart([]);
          setActiveTrackedOrder(placedOrder);
          setIsTrackerOpen(true);
        }}
      />

      {/* C. Order Tracker / Prep Status Modal */}
      <OrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        order={activeTrackedOrder}
      />

      {/* D. Table Service Floor Attendant Modal */}
      <ServiceCallModal
        isOpen={isServiceOpen}
        onClose={() => setIsServiceOpen(false)}
        tableNumber={tableNumber}
        onCallSuccess={() => {
          refreshServiceCalls();
        }}
      />

      {/* E. Table QR Token Verification / Selector Modal */}
      <TableSelectorModal
        isOpen={isTableSelectOpen}
        onClose={() => setIsTableSelectOpen(false)}
        currentTable={tableNumber}
        onSelectTable={(newTable) => setTableNumber(newTable)}
      />
    </div>
  );
}
