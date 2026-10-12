import React, { useState } from 'react';

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  selectedCustomizations: string[];
  specialNotes?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
  items: CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckoutSuccess: (order: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  tableNumber,
  items,
  onUpdateQty,
  onRemoveItem,
  onCheckoutSuccess
}) => {
  const [tipRate, setTipRate] = useState<number>(0.18);
  const [paymentMode, setPaymentMode] = useState<'apple_pay' | 'card' | 'table'>('apple_pay');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tax = subtotal * 0.085;
  const tipAmount = subtotal * tipRate;
  const totalDue = subtotal + tax + tipAmount;

  const handlePlaceOrder = async () => {
    if (items.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Create Stripe Payment Intent for total amount
      let paymentIntentId = '';
      let paymentStatus: 'Paid' | 'PayAtCounter' = 'PayAtCounter';

      if (paymentMode !== 'table') {
        const intentRes = await fetch('/api/orders/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalDue,
            tableNumber,
            metadata: {
              itemsCount: String(items.length),
              paymentMode
            }
          })
        });

        const intentJson = await intentRes.json();
        if (intentJson.success && intentJson.data) {
          paymentIntentId = intentJson.data.id;
          paymentStatus = 'Paid';
        }
      }

      // 2. Submit Order to Backend
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber,
          items: items.map(it => ({
            menuItemId: it.menuItemId,
            quantity: it.quantity,
            selectedCustomizations: it.selectedCustomizations,
            specialNotes: it.specialNotes
          })),
          tipPercent: tipRate,
          paymentStatus,
          paymentIntentId,
          specialInstructions: `Payment via ${paymentMode.toUpperCase()}`
        })
      });

      const orderJson = await orderRes.json();
      if (!orderRes.ok || !orderJson.success) {
        throw new Error(orderJson.error?.message || 'Failed to place table order.');
      }

      onCheckoutSuccess(orderJson.data);
      onClose();
    } catch (err: any) {
      console.error('Order submission error:', err);
      setErrorMsg(err.message || 'Network error placing order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#3a302a]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#faf5ee] h-full shadow-2xl flex flex-col justify-between z-10 border-l border-[#d8d0c8]/60 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-[#f2ece4] bg-[#faf5ee]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#fbe8d8] flex items-center justify-center text-[#c2652a]">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </div>
            <div>
              <h2 className="font-headline text-lg font-bold text-[#3a302a] leading-tight">
                Table Session Cart
              </h2>
              <span className="text-[11px] font-semibold text-[#c2652a] font-label">
                Table #{String(tableNumber).padStart(2, '0')} (Active Session)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f2ece4] hover:bg-[#ece6dc] flex items-center justify-center text-[#605850] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 no-scrollbar">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-2.5">
              <div className="w-14 h-14 rounded-full bg-[#f2ece4] flex items-center justify-center text-[#605850]">
                <span className="material-symbols-outlined text-3xl">shopping_cart</span>
              </div>
              <span className="font-headline text-lg font-bold text-[#3a302a]">
                Your table order is empty
              </span>
              <p className="text-xs text-[#605850] font-body">
                Tap any culinary item from the menu to add to your order.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const lineTotal = item.unitPrice * item.quantity;
              return (
                <div
                  key={item.id}
                  className="p-3.5 bg-white border border-[#d8d0c8]/60 rounded-xl shadow-xs flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-headline font-bold text-sm text-[#3a302a] leading-tight">
                        {item.name}
                      </h4>
                      {item.selectedCustomizations.length > 0 && (
                        <span className="text-[10px] text-[#605850] font-body block mt-0.5">
                          {item.selectedCustomizations.join(' • ')}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-[#605850] hover:text-[#c0392b] p-1 transition-colors cursor-pointer"
                      title="Remove Item"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete_outline</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#f2ece4]">
                    <div className="flex items-center bg-[#f2ece4] rounded-md border border-[#d8d0c8]/50">
                      <button
                        onClick={() => onUpdateQty(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#3a302a] active:scale-90 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold font-label text-[#3a302a]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#3a302a] active:scale-90 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-headline font-bold text-sm text-[#c2652a]">
                      ${lineTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Financial Breakdown */}
        <div className="p-5 bg-[#f6f0e8] border-t border-[#d8d0c8]/60 flex flex-col gap-3">
          {errorMsg && (
            <div className="p-2.5 bg-red-100 border border-red-300 text-red-800 rounded-lg text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Tip Gratuity Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-[#605850] uppercase font-label">
              Kitchen &amp; Service Gratuity
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[0.15, 0.18, 0.20, 0.25].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setTipRate(rate)}
                  className={`py-1 rounded text-[11px] font-bold font-label text-center transition-all cursor-pointer ${
                    tipRate === rate
                      ? 'bg-[#c2652a] text-[#faf5ee] shadow-xs'
                      : 'bg-[#f2ece4] text-[#605850] hover:bg-[#ece6dc]'
                  }`}
                >
                  {Math.round(rate * 100)}%
                </button>
              ))}
            </div>
          </div>

          {/* Bill Line Items */}
          <div className="flex flex-col gap-1 text-xs font-body pt-1">
            <div className="flex justify-between text-[#605850]">
              <span>Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#605850]">
              <span>Table Tax (8.5%)</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#605850]">
              <span>Service &amp; Tip</span>
              <span className="font-medium">${tipAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#605850]">
              <span>Express Table Expedite</span>
              <span className="font-bold text-[#c2652a]">COMPLIMENTARY</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#3a302a] pt-1 border-t border-[#d8d0c8]/60">
              <span className="font-headline text-base">Total Due</span>
              <span className="font-headline text-base text-[#c2652a]">
                ${totalDue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Mode Selector */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setPaymentMode('apple_pay')}
              className={`py-1.5 px-2 rounded text-[10px] font-semibold font-label flex flex-col items-center justify-center gap-0.5 border cursor-pointer transition-all ${
                paymentMode === 'apple_pay'
                  ? 'bg-white border-[#c2652a] text-[#3a302a] shadow-xs ring-1 ring-[#c2652a]'
                  : 'bg-white border-[#d8d0c8]/60 text-[#605850]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-[#c2652a]">contactless</span>
              <span>Apple Pay</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('card')}
              className={`py-1.5 px-2 rounded text-[10px] font-semibold font-label flex flex-col items-center justify-center gap-0.5 border cursor-pointer transition-all ${
                paymentMode === 'card'
                  ? 'bg-white border-[#c2652a] text-[#3a302a] shadow-xs ring-1 ring-[#c2652a]'
                  : 'bg-white border-[#d8d0c8]/60 text-[#605850]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-[#605850]">credit_card</span>
              <span>Card</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('table')}
              className={`py-1.5 px-2 rounded text-[10px] font-semibold font-label flex flex-col items-center justify-center gap-0.5 border cursor-pointer transition-all ${
                paymentMode === 'table'
                  ? 'bg-white border-[#c2652a] text-[#3a302a] shadow-xs ring-1 ring-[#c2652a]'
                  : 'bg-white border-[#d8d0c8]/60 text-[#605850]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-[#605850]">handshake</span>
              <span>Pay on Table</span>
            </button>
          </div>

          {/* Place Order CTA Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={items.length === 0 || isSubmitting}
            className="w-full h-12 bg-[#c2652a] hover:bg-[#b05722] disabled:opacity-50 text-[#faf5ee] rounded-lg font-label text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Order...</span>
              </span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Place Order for Table #{String(tableNumber).padStart(2, '0')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
