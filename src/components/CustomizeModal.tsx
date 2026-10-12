import React, { useState, useEffect } from 'react';
import { MenuItem } from '../server/types.js';

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish: MenuItem | null;
  onAddToCart: (item: {
    menuItemId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    selectedCustomizations: string[];
    specialNotes: string;
  }) => void;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  isOpen,
  onClose,
  dish,
  onAddToCart
}) => {
  const [selectedHeat, setSelectedHeat] = useState<string>('Mild');
  const [selectedAddons, setSelectedAddons] = useState<{ id: string; label: string; price: number }[]>([]);
  const [kitchenNotes, setKitchenNotes] = useState<string[]>([]);
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (dish) {
      setSelectedHeat('Mild');
      setSelectedAddons([]);
      setKitchenNotes([]);
      setCustomInstructions('');
      setQuantity(1);
    }
  }, [dish]);

  if (!isOpen || !dish) return null;

  // Add-on options specific to dish or defaults
  const addonOptions = [
    { id: 'addon-cheddar', label: 'Extra Aged White Cheddar', price: 1.50 },
    { id: 'addon-bacon', label: 'Crispy Turkey Bacon Strips', price: 2.00 },
    { id: 'addon-aioli', label: 'Double Black Truffle Aioli', price: 2.00 }
  ];

  const instructionOptions = [
    'No Raw Onions',
    'Extra Pickles',
    'Sauce On The Side'
  ];

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = dish.price + addonsTotal;
  const grandTotal = unitPrice * quantity;

  const toggleAddon = (item: { id: string; label: string; price: number }) => {
    if (selectedAddons.some(a => a.id === item.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== item.id));
    } else {
      setSelectedAddons([...selectedAddons, item]);
    }
  };

  const toggleInstruction = (inst: string) => {
    if (kitchenNotes.includes(inst)) {
      setKitchenNotes(kitchenNotes.filter(k => k !== inst));
    } else {
      setKitchenNotes([...kitchenNotes, inst]);
    }
  };

  const handleConfirm = () => {
    const customs: string[] = [selectedHeat];
    selectedAddons.forEach(a => customs.push(a.label));
    kitchenNotes.forEach(k => customs.push(k));
    if (customInstructions.trim()) {
      customs.push(customInstructions.trim());
    }

    onAddToCart({
      menuItemId: dish.id,
      name: dish.name,
      unitPrice,
      quantity,
      selectedCustomizations: customs,
      specialNotes: customInstructions.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#3a302a]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-[#faf5ee] rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl flex flex-col z-10 border border-[#d8d0c8]/60 animate-in slide-in-from-bottom duration-300">
        {/* Grab Handle */}
        <div className="pt-3 pb-1 flex justify-center cursor-pointer" onClick={onClose}>
          <div className="w-10 h-1 bg-[#d8d0c8] rounded-full" />
        </div>

        {/* Header Preview */}
        <div className="px-6 py-3 flex items-start justify-between border-b border-[#f2ece4]">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#c2652a] font-label">
              Bespoke Preparation
            </span>
            <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#3a302a]">
              {dish.name}
            </h2>
            <span className="text-xs text-[#605850] font-label">
              Base price: ${dish.price.toFixed(2)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f2ece4] hover:bg-[#ece6dc] flex items-center justify-center text-[#605850] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Options Body */}
        <div className="p-6 flex flex-col gap-6">
          {/* Heat Intensity */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#3a302a] font-label flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#c2652a] text-[15px]">whatshot</span>
              Heat Intensity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Mild' },
                { label: 'Medium 🔥' },
                { label: 'Blazing 🔥🔥' }
              ].map(h => (
                <button
                  key={h.label}
                  type="button"
                  onClick={() => setSelectedHeat(h.label)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold font-label transition-all text-center cursor-pointer ${
                    selectedHeat === h.label
                      ? 'bg-[#c2652a] text-[#faf5ee] shadow-xs'
                      : 'bg-[#f2ece4] text-[#605850] hover:bg-[#ece6dc]'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {/* Artisanal Add-ons */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#3a302a] font-label flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#c2652a] text-[15px]">stars</span>
                Artisanal Add-ons
              </label>
              <span className="text-[10px] text-[#605850] font-label">Optional</span>
            </div>
            <div className="flex flex-col gap-2">
              {addonOptions.map(addon => {
                const isChecked = selectedAddons.some(a => a.id === addon.id);
                return (
                  <label
                    key={addon.id}
                    onClick={() => toggleAddon(addon)}
                    className="flex items-center justify-between p-3 rounded-lg bg-white border border-[#d8d0c8]/60 hover:bg-[#f6f0e8] transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-[#c2652a] accent-[#c2652a] focus:ring-[#c2652a]"
                      />
                      <span className="text-xs font-medium text-[#3a302a] font-body">
                        {addon.label}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#c2652a] font-label">
                      +${addon.price.toFixed(2)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Kitchen Instructions */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#3a302a] font-label flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#c2652a] text-[15px]">skillet</span>
              Kitchen Instructions
            </label>
            <div className="flex flex-wrap gap-2">
              {instructionOptions.map(inst => {
                const isChecked = kitchenNotes.includes(inst);
                return (
                  <label
                    key={inst}
                    onClick={() => toggleInstruction(inst)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-label cursor-pointer select-none transition-colors border ${
                      isChecked
                        ? 'bg-[#fbe8d8] text-[#8a4518] border-[#c2652a]/40 font-bold'
                        : 'bg-white text-[#605850] border-[#d8d0c8]/60 hover:bg-[#f6f0e8]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="accent-[#c2652a] rounded"
                    />
                    <span>{inst}</span>
                  </label>
                );
              })}
            </div>
            <input
              type="text"
              placeholder="Allergies or custom chef notes (optional)..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-xs rounded-lg bg-white border border-[#d8d0c8]/60 focus:outline-none focus:border-[#c2652a] text-[#3a302a]"
            />
          </div>

          {/* Quantity Stepper & Final Action */}
          <div className="pt-2 pb-2 flex items-center gap-3">
            <div className="flex items-center bg-[#f2ece4] rounded-lg p-1 border border-[#d8d0c8]/50">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded bg-white flex items-center justify-center text-[#3a302a] active:scale-90 font-bold cursor-pointer"
              >
                -
              </button>
              <span className="w-8 text-center text-xs font-bold text-[#3a302a] font-label">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded bg-white flex items-center justify-center text-[#3a302a] active:scale-90 font-bold cursor-pointer"
              >
                +
              </button>
            </div>

            <button
              onClick={handleConfirm}
              className="flex-1 h-12 bg-[#c2652a] hover:bg-[#b05722] text-[#faf5ee] rounded-lg font-label text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              <span>Add to Table Order • ${grandTotal.toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
