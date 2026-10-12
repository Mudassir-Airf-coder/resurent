import React from 'react';

interface HeaderProps {
  tableNumber: number;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenTableSelect: () => void;
  activeView: 'menu' | 'kds' | 'orders';
  setActiveView: (view: 'menu' | 'kds' | 'orders') => void;
  kdsActiveCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  tableNumber,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenTableSelect,
  activeView,
  setActiveView,
  kdsActiveCount
}) => {
  return (
    <header className="fixed top-0 w-full z-40 bg-[#faf5ee]/90 backdrop-blur-xl pt-safe border-b border-[#d8d0c8]/40 shadow-[0_2px_16px_rgba(58,48,42,0.04)]">
      <div className="h-16 px-4 max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand & Table Number Chip */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setActiveView('menu')}
            className="flex items-center gap-1.5 focus:outline-none"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#c2652a] animate-pulse shadow-[0_0_8px_rgba(194,101,42,0.6)]" />
            <span className="font-headline text-lg sm:text-xl font-bold tracking-widest text-[#3a302a] uppercase">
              Aura Bites
            </span>
          </button>

          <button
            onClick={onOpenTableSelect}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ece6dc]/80 hover:bg-[#e6e0d6] transition-colors border border-[#d8d0c8]/60 cursor-pointer shadow-xs"
            title="Click to verify or switch table QR"
          >
            <span className="material-symbols-outlined text-[#c2652a] text-[15px]">table_restaurant</span>
            <span className="text-[11px] font-semibold tracking-wide text-[#605850] font-label">
              Table #{String(tableNumber).padStart(2, '0')}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="QR Verified" />
          </button>
        </div>

        {/* Right: Mode Switcher (Customer vs KDS) & Cart Button */}
        <div className="flex items-center gap-2">
          {/* Kitchen Display System Switcher */}
          <button
            onClick={() => setActiveView(activeView === 'kds' ? 'menu' : 'kds')}
            className={`h-9 px-2.5 rounded-full text-xs font-bold font-label flex items-center gap-1.5 transition-all shadow-xs ${
              activeView === 'kds'
                ? 'bg-[#3a302a] text-[#faf5ee] ring-2 ring-[#c2652a]'
                : 'bg-[#ece6dc] text-[#605850] hover:bg-[#e6e0d6]'
            }`}
            title="Toggle between Guest Table View and Kitchen POS KDS"
          >
            <span className="material-symbols-outlined text-[17px] text-[#c2652a]">
              {activeView === 'kds' ? 'restaurant_menu' : 'skillet'}
            </span>
            <span className="hidden sm:inline">
              {activeView === 'kds' ? 'Guest Menu' : 'Kitchen KDS'}
            </span>
            {kdsActiveCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#c2652a] text-white text-[10px] font-bold">
                {kdsActiveCount}
              </span>
            )}
          </button>

          {/* Cart Pill */}
          <button
            onClick={onOpenCart}
            className="h-10 px-3 rounded-full bg-[#f2ece4] hover:bg-[#ece6dc] flex items-center gap-2 transition-all active:scale-95 border border-[#d8d0c8]/50 shadow-xs cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <span className="material-symbols-outlined text-[#c2652a] text-[20px]">lunch_dining</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-[#c2652a] text-[#faf5ee] text-[9px] font-bold flex items-center justify-center font-label">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-[#3a302a] font-label">
              ${cartTotal.toFixed(2)}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
