import React, { useState } from 'react';

interface ServiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
  onCallSuccess: (type: string) => void;
}

export const ServiceCallModal: React.FC<ServiceCallModalProps> = ({
  isOpen,
  onClose,
  tableNumber,
  onCallSuccess
}) => {
  const [selectedType, setSelectedType] = useState<string>('Assistance');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const serviceOptions = [
    { type: 'Assistance', icon: 'support_agent', title: 'Table Assistance', desc: 'Call floor waiter to table' },
    { type: 'Water', icon: 'water_drop', title: 'Water Refill', desc: 'Fresh iced or sparkling water' },
    { type: 'Bill', icon: 'payments', title: 'Request Bill / Check', desc: 'Itemized receipt or card machine' },
    { type: 'Cutlery', icon: 'fork_spoon', title: 'Extra Cutlery & Napkins', desc: 'Silverware or condiments' }
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tables/${tableNumber}/call-service`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          notes: notes.trim()
        })
      });

      if (res.ok) {
        setSentSuccess(true);
        onCallSuccess(selectedType);
        setTimeout(() => {
          setSentSuccess(false);
          onClose();
        }, 1600);
      }
    } catch (err) {
      console.error('Failed to summon table service:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#3a302a]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-[#faf5ee] rounded-2xl w-full max-w-sm p-6 shadow-2xl z-10 flex flex-col gap-4 border border-[#d8d0c8]/60 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[#f2ece4] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c2652a] text-2xl">notifications_active</span>
            <div>
              <h3 className="font-headline text-xl font-bold text-[#3a302a]">
                Direct-to-Table Service
              </h3>
              <span className="text-[11px] text-[#605850] font-label">
                Expedite to Table #{String(tableNumber).padStart(2, '0')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f2ece4] flex items-center justify-center text-[#605850] hover:bg-[#ece6dc] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {sentSuccess ? (
          <div className="py-6 flex flex-col items-center justify-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">check</span>
            </div>
            <h4 className="font-headline text-lg font-bold text-[#3a302a]">Attendant Alerted</h4>
            <p className="text-xs text-[#605850]">
              Staff is heading directly to Table #{String(tableNumber).padStart(2, '0')}.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-[#3a302a] font-label">
                How may we assist you?
              </span>
              <div className="grid grid-cols-1 gap-2">
                {serviceOptions.map((opt) => (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setSelectedType(opt.type)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      selectedType === opt.type
                        ? 'bg-[#fbe8d8] border-[#c2652a] shadow-xs ring-1 ring-[#c2652a]'
                        : 'bg-white border-[#d8d0c8]/60 hover:bg-[#f6f0e8]'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        selectedType === opt.type
                          ? 'bg-[#c2652a] text-white'
                          : 'bg-[#f2ece4] text-[#605850]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#3a302a] font-label">{opt.title}</span>
                      <span className="text-[10px] text-[#605850]">{opt.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Additional requests (e.g. extra lemons)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-[#d8d0c8]/60 focus:outline-none focus:border-[#c2652a] text-[#3a302a]"
            />

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-11 bg-[#c2652a] hover:bg-[#b05722] text-[#faf5ee] rounded-lg font-label text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {isSubmitting ? 'Summoning...' : 'Alert Floor Attendant'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
