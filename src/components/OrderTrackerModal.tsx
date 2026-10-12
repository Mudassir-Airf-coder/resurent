import React from 'react';
import { Order, OrderStatus } from '../server/types.js';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  order
}) => {
  if (!isOpen || !order) return null;

  const getStepProgress = (status: OrderStatus) => {
    switch (status) {
      case 'Received':
        return { percent: '25%', label: 'Order Received & Dispatched', activeStep: 0 };
      case 'Preparing':
        return { percent: '55%', label: 'Grill Station Active • Searing', activeStep: 1 };
      case 'Ready':
        return { percent: '85%', label: 'Plated & Ready for Runner', activeStep: 2 };
      case 'Served':
        return { percent: '100%', label: 'Delivered to Table • Bon Appétit', activeStep: 3 };
      default:
        return { percent: '15%', label: 'Processing...', activeStep: 0 };
    }
  };

  const progress = getStepProgress(order.orderStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#3a302a]/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-[#faf5ee] rounded-2xl w-full max-w-sm p-6 shadow-2xl z-10 flex flex-col items-center text-center gap-4 border border-[#d8d0c8]/60 animate-in zoom-in-95 duration-200">
        {/* Animated Status Icon */}
        <div className="w-16 h-16 rounded-full bg-[#fbe8d8] flex items-center justify-center text-[#c2652a] shadow-inner">
          <span className="material-symbols-outlined text-3xl animate-bounce">restaurant</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#c2652a] font-label">
            Ticket #{order.orderId} Verified
          </span>
          <h3 className="font-headline text-2xl font-bold text-[#3a302a]">
            {order.orderStatus === 'Served' ? 'Order Completed!' : 'Order Dispatched to Kitchen'}
          </h3>
          <p className="text-xs text-[#605850] font-body">
            Chef Marco has received your selections for Table #{String(order.tableNumber).padStart(2, '0')}.
          </p>
        </div>

        {/* Prep Status Tracker Bar */}
        <div className="w-full bg-[#f6f0e8] border border-[#d8d0c8]/60 rounded-xl p-3.5 flex flex-col gap-2.5 text-left">
          <div className="flex justify-between items-center text-[11px] font-label font-semibold">
            <span className="text-[#c2652a] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#c2652a] animate-ping" />
              {progress.label}
            </span>
            <span className="text-[#605850]">
              {order.orderStatus === 'Served' ? 'Completed' : `Est. ${order.estimatedPrepMinutes || 12} mins`}
            </span>
          </div>

          {/* Progress Track */}
          <div className="w-full h-2 bg-[#ece6dc] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c2652a] rounded-full transition-all duration-700 ease-out"
              style={{ width: progress.percent }}
            />
          </div>

          {/* 3 Step Indicators */}
          <div className="grid grid-cols-3 text-[9px] font-label">
            <span className={`text-left font-bold ${progress.activeStep >= 0 ? 'text-[#c2652a]' : 'text-[#605850]'}`}>
              Dispatched
            </span>
            <span className={`text-center font-bold ${progress.activeStep >= 1 ? 'text-[#c2652a]' : 'text-[#605850]'}`}>
              Searing
            </span>
            <span className={`text-right font-bold ${progress.activeStep >= 2 ? 'text-[#c2652a]' : 'text-[#605850]'}`}>
              Table Delivery
            </span>
          </div>
        </div>

        {/* Order Details Preview */}
        <div className="w-full bg-white rounded-lg p-3 text-left border border-[#d8d0c8]/50 text-xs">
          <div className="text-[10px] font-bold uppercase text-[#605850] mb-1.5 flex justify-between">
            <span>Ordered Items ({order.items.length})</span>
            <span className="text-[#c2652a] font-bold">${order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex flex-col gap-1 max-h-24 overflow-y-auto no-scrollbar">
            {order.items.map((it, i) => (
              <div key={i} className="flex justify-between text-[#3a302a]">
                <span className="truncate pr-2">
                  {it.quantity}x {it.name}
                </span>
                <span className="font-semibold shrink-0">${it.unitTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full h-11 bg-[#c2652a] hover:bg-[#b05722] text-[#faf5ee] rounded-lg font-label text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
        >
          Done • Back to 3D Experience
        </button>
      </div>
    </div>
  );
};
