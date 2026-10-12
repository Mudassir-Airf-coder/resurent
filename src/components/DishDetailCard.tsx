import React from 'react';
import { MenuItem } from '../server/types.js';

interface DishDetailCardProps {
  dish: MenuItem;
  onCustomize: () => void;
  onQuickAdd: () => void;
}

export const DishDetailCard: React.FC<DishDetailCardProps> = ({
  dish,
  onCustomize,
  onQuickAdd
}) => {
  return (
    <section className="px-4 sm:px-6 pt-3 pb-2 max-w-xl mx-auto w-full">
      <div className="bg-[#f6f0e8] border border-[#d8d0c8]/60 rounded-xl p-5 shadow-xs relative overflow-hidden transition-all duration-300">
        {/* Subtle Watermark Culinary Graphic */}
        <div className="absolute -right-3 -bottom-3 text-[#ece6dc] select-none pointer-events-none">
          <span className="material-symbols-outlined text-8xl">dinner_dining</span>
        </div>

        <div className="relative z-10 flex flex-col gap-2.5">
          {/* Header & Price */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#c2652a] font-label">
                Master Chef Selection
              </span>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold leading-tight text-[#3a302a] tracking-normal">
                {dish.name}
              </h1>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className="font-headline text-2xl sm:text-3xl font-bold text-[#c2652a]">
                ${dish.price.toFixed(2)}
              </span>
              <span className="text-[10px] text-[#605850] font-label">Table Served</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-[#605850] font-body leading-relaxed">
            {dish.description}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {dish.badges.map((badge, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-medium font-label px-2.5 py-0.5 rounded-full bg-[#f2ece4] text-[#605850] border border-[#d8d0c8]/40"
              >
                <span className="material-symbols-outlined text-[13px] text-[#c2652a]">
                  {idx === 0 ? 'verified' : idx === 1 ? 'spa' : 'local_fire_department'}
                </span>
                {badge}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center gap-2.5">
            <button
              onClick={onCustomize}
              className="flex-1 h-11 bg-[#c2652a] hover:bg-[#b05722] text-[#faf5ee] rounded-lg font-label text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Customize &amp; Add</span>
            </button>

            <button
              onClick={onQuickAdd}
              className="w-11 h-11 rounded-lg bg-[#fbe8d8] text-[#8a4518] hover:bg-[#c2652a] hover:text-[#faf5ee] flex items-center justify-center active:scale-90 transition-all shadow-xs cursor-pointer"
              title="Quick Add 1 to Order"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
