import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, ServiceCall } from '../server/types.js';

interface KDSProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  serviceCalls: ServiceCall[];
  onResolveServiceCall: (callId: string) => Promise<void>;
  onCloseKDS: () => void;
  isSocketConnected: boolean;
}

export const KitchenDisplaySystem: React.FC<KDSProps> = ({
  orders,
  onUpdateStatus,
  serviceCalls,
  onResolveServiceCall,
  onCloseKDS,
  isSocketConnected
}) => {
  const [filter, setFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'ALL') return o.orderStatus !== 'Served' && o.orderStatus !== 'Cancelled';
    return o.orderStatus === filter;
  });

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'Received':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Preparing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Ready':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Served':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    if (current === 'Received') return 'Preparing';
    if (current === 'Preparing') return 'Ready';
    if (current === 'Ready') return 'Served';
    return null;
  };

  const getNextStatusLabel = (current: OrderStatus) => {
    if (current === 'Received') return 'Start Preparing (Fire 🔥)';
    if (current === 'Preparing') return 'Mark Ready (Plated ✨)';
    if (current === 'Ready') return 'Deliver to Table (Runner 🛎️)';
    return 'Completed';
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1c1917] text-[#faf5ee] flex flex-col font-['Manrope',sans-serif] overflow-hidden">
      {/* KDS Top Bar */}
      <div className="h-16 px-4 sm:px-6 bg-[#292524] border-b border-[#44403c] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c2652a] text-2xl">skillet</span>
            <h1 className="font-headline text-xl sm:text-2xl font-bold tracking-wide uppercase text-white">
              Aura Bites • Kitchen Display System (KDS)
            </h1>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1c1917] border border-[#44403c] text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="text-[#a8a29e] font-mono text-[11px]">
              {isSocketConnected ? 'LIVE SOCKET.IO' : 'OFFLINE'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right">
            <span className="font-mono text-sm font-bold text-amber-400">{currentTime}</span>
            <span className="text-[10px] text-[#a8a29e] uppercase">Head Chef Station</span>
          </div>

          <button
            onClick={onCloseKDS}
            className="px-3.5 py-1.5 rounded-lg bg-[#c2652a] hover:bg-[#b05722] text-white text-xs font-bold font-label uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>Switch to Guest Menu</span>
          </button>
        </div>
      </div>

      {/* KDS Subheader: Filter Tabs & Service Alert Banner */}
      <div className="px-4 sm:px-6 py-2.5 bg-[#1c1917] border-b border-[#292524] flex flex-wrap items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'Active Queue' },
            { id: 'Received', label: 'Received' },
            { id: 'Preparing', label: 'Preparing' },
            { id: 'Ready', label: 'Ready for Runner' },
            { id: 'Served', label: 'History (Served)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#c2652a] text-white shadow-xs'
                  : 'bg-[#292524] text-[#a8a29e] hover:bg-[#44403c]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Service Requests Counter */}
        {serviceCalls.filter(s => s.status === 'Pending').length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-950/80 border border-amber-600 rounded-lg text-amber-200 text-xs animate-pulse">
            <span className="material-symbols-outlined text-base">notifications_active</span>
            <span>
              {serviceCalls.filter(s => s.status === 'Pending').length} Pending Floor Attendant Call(s)
            </span>
          </div>
        )}
      </div>

      {/* Main KDS Grid */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto no-scrollbar bg-[#141210]">
        {filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#78716c]">
            <span className="material-symbols-outlined text-6xl mb-2 text-[#44403c]">skillet</span>
            <h2 className="font-headline text-2xl font-bold text-[#a8a29e]">All Tickets Clear</h2>
            <p className="text-xs text-[#78716c] max-w-sm mt-1">
              No orders in '{filter}' queue. Place an order from the table-side screen or wait for incoming guest tickets.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map((order) => {
              const nextStatus = getNextStatus(order.orderStatus);
              const elapsedMinutes = Math.floor(
                (Date.now() - new Date(order.createdAt).getTime()) / 60000
              );

              return (
                <div
                  key={order.orderId}
                  className="bg-[#1f1d1a] border border-[#3d3835] rounded-xl flex flex-col justify-between overflow-hidden shadow-lg transition-all hover:border-[#c2652a]/60"
                >
                  {/* Ticket Header */}
                  <div className="p-3.5 bg-[#292522] border-b border-[#3d3835] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold font-mono text-white">
                        {order.orderId}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#c2652a] text-white text-xs font-bold font-label">
                        Table #{String(order.tableNumber).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e]">
                      <span className="material-symbols-outlined text-[14px]">timer</span>
                      <span className={elapsedMinutes > 15 ? 'text-red-400 font-bold' : ''}>
                        {elapsedMinutes}m ago
                      </span>
                    </div>
                  </div>

                  {/* Status & Station Bar */}
                  <div className="px-3.5 py-1.5 bg-[#141210] flex items-center justify-between text-[11px] border-b border-[#292522]">
                    <span
                      className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${getStatusBadgeClass(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                    <span className="text-[#a8a29e] font-mono">
                      {order.kitchenStation || 'Grill & Fryer'}
                    </span>
                  </div>

                  {/* Order Items List */}
                  <div className="p-3.5 flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-56">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex flex-col pb-2 border-b border-[#2e2a26] last:border-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-sm text-[#f5f5f4] leading-snug">
                            <span className="text-amber-400 font-mono mr-1.5">{item.quantity}x</span>
                            {item.name}
                          </span>
                        </div>
                        {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.selectedCustomizations.map((c, cIdx) => (
                              <span
                                key={cIdx}
                                className="px-1.5 py-0.5 rounded bg-[#2e2a26] text-amber-300 text-[10px] font-mono"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {order.specialInstructions && (
                      <div className="p-2 rounded bg-amber-950/40 border border-amber-900/60 text-amber-200 text-xs">
                        <span className="font-bold mr-1">Note:</span>
                        {order.specialInstructions}
                      </div>
                    )}
                  </div>

                  {/* Ticket Footer & Bump Action */}
                  <div className="p-3 bg-[#24201c] border-t border-[#3d3835] flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-[#a8a29e]">
                      Total: ${order.totalAmount.toFixed(2)}
                    </span>

                    {nextStatus && (
                      <button
                        onClick={() => onUpdateStatus(order.orderId, nextStatus)}
                        className="flex-1 ml-2 py-2 px-3 rounded-lg bg-[#c2652a] hover:bg-[#b05722] active:scale-95 text-white font-label text-xs font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">fast_forward</span>
                        <span>{getNextStatusLabel(order.orderStatus)}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floor Service Calls Section */}
        {serviceCalls.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#332e29]">
            <h3 className="font-headline text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400">notifications</span>
              Table Attendant &amp; Service Calls
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {serviceCalls.map((call) => (
                <div
                  key={call.id}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    call.status === 'Pending'
                      ? 'bg-amber-950/40 border-amber-600 text-amber-100'
                      : 'bg-[#1f1d1a] border-[#3d3835] text-[#a8a29e]'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">Table #{call.tableNumber}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        {call.type}
                      </span>
                    </div>
                    {call.notes && <span className="text-xs text-[#d6d3d1] mt-0.5">{call.notes}</span>}
                    <span className="text-[10px] text-[#78716c] font-mono mt-1">
                      {new Date(call.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  {call.status === 'Pending' ? (
                    <button
                      onClick={() => onResolveServiceCall(call.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                    >
                      Resolve
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-bold">Resolved ✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
