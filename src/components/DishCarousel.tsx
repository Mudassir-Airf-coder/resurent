import React from 'react';
import { MenuItem } from '../server/types.js';

interface DishCarouselProps {
  dishes: MenuItem[];
  activeIndex: number;
  onSelectDish: (index: number) => void;
  onQuickAdd: (dish: MenuItem) => void;
}

export const DishCarousel: React.FC<DishCarouselProps> = ({
  dishes,
  activeIndex,
  onSelectDish,
  onQuickAdd
}) => {
  return (
    <section className="mt-4 flex flex-col gap-2.5 max-w-xl mx-auto w-full">
      <div className="px-5 flex items-baseline justify-between">
        <div>
          <h2 className="font-headline text-lg sm:text-xl font-bold text-[#3a302a]">
            Signature Culinary Collection
          </h2>
          <p className="text-[11px] text-[#605850] font-label">
            Tap any dish to choreograph 3D view
          </p>
        </div>
        <span className="text-[11px] font-bold text-[#c2652a] font-label uppercase tracking-wider">
          {dishes.length} Items
        </span>
      </div>

      {/* Carousel Container */}
      <div className="flex gap-3 overflow-x-auto px-5 py-2 no-scrollbar snap-x snap-mandatory scroll-smooth">
        {dishes.map((dish, idx) => {
          const isSelected = idx === activeIndex;
          return (
            <div
              key={dish.id}
              onClick={() => onSelectDish(idx)}
              className={`snap-start shrink-0 w-64 bg-white rounded-xl p-3.5 shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-[0.99] border ${
                isSelected
                  ? 'border-l-4 border-l-[#c2652a] border-[#c2652a]/40 shadow-sm'
                  : 'border-[#d8d0c8]/60 hover:border-[#c2652a]/50'
              }`}
            >
              <div className="flex gap-3 items-center">
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  className="w-16 h-16 rounded-lg object-cover bg-[#f2ece4] shrink-0 border border-[#d8d0c8]/50"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-[#c2652a] uppercase font-label">
                      {dish.dishCode}
                    </span>
                    <span className="text-[9px] text-[#605850] font-label">
                      • {dish.calories}
                    </span>
                  </div>
                  <h3
                    className={`font-headline font-bold text-sm leading-snug line-clamp-1 transition-colors ${
                      isSelected ? 'text-[#c2652a]' : 'text-[#3a302a] group-hover:text-[#c2652a]'
                    }`}
                  >
                    {dish.name}
                  </h3>
                  <p className="text-[10px] text-[#605850] font-body line-clamp-1 mt-0.5">
                    {dish.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 flex items-center justify-between border-t border-[#f2ece4]">
                <span className="font-headline text-base font-bold text-[#c2652a]">
                  ${dish.price.toFixed(2)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAdd(dish);
                  }}
                  className="px-3 py-1 rounded-full bg-[#f2ece4] hover:bg-[#c2652a] hover:text-[#faf5ee] active:scale-90 text-[11px] font-semibold text-[#605850] font-label transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[13px]">add</span>
                  <span>Add</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
