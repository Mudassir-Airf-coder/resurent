import React, { useState } from 'react';
import { Table } from '../server/types.js';

interface TableSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTable: number;
  onSelectTable: (num: number) => void;
}

export const TableSelectorModal: React.FC<TableSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTable,
  onSelectTable
}) => {
  const [tableData, setTableData] = useState<Table | null>(null);
  const [verificationMsg, setVerificationMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const testTables = [
    { num: 7, name: 'Table #07 (Mezzanine Booth)', desc: 'Primary Interactive Demo' },
    { num: 3, name: 'Table #03 (Dining Salon)', desc: 'Center Salon Booth' },
    { num: 5, name: 'Table #05 (Garden Terrace)', desc: 'Outdoor Terrace' },
    { num: 1, name: 'Table #01 (Window Bay)', desc: 'Window View Seat' }
  ];

  const verifyTableNumber = async (num: number) => {
    setIsLoading(true);
    setVerificationMsg(null);
    try {
      const res = await fetch(`/api/tables/${num}`);
      const json = await res.json();
      if (json.success && json.data) {
        setTableData(json.data.table);
        setVerificationMsg(`Verified QR: Table #${num} • Status: ${json.data.table.status}`);
        onSelectTable(num);
      } else {
        setVerificationMsg(json.error?.message || 'Verification failed');
      }
    } catch (e: any) {
      setVerificationMsg('Error reaching table API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#3a302a]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-[#faf5ee] rounded-2xl w-full max-w-sm p-6 shadow-2xl z-10 flex flex-col gap-4 border border-[#d8d0c8]/60 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[#f2ece4] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c2652a] text-2xl">qr_code_scanner</span>
            <div>
              <h3 className="font-headline text-xl font-bold text-[#3a302a]">
                Table QR Verification
              </h3>
              <span className="text-[11px] text-[#605850] font-label">
                Simulate Digital Table Token
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

        <p className="text-xs text-[#605850] leading-relaxed">
          In production, scanning the NFC or QR code at each luxury dining table automatically verifies its cryptographic token via{' '}
          <code className="text-[#c2652a] font-mono bg-[#f2ece4] px-1 py-0.5 rounded">
            GET /api/tables/:tableNumber
          </code>
          .
        </p>

        <div className="flex flex-col gap-2">
          {testTables.map((t) => (
            <button
              key={t.num}
              type="button"
              onClick={() => verifyTableNumber(t.num)}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                currentTable === t.num
                  ? 'bg-[#fbe8d8] border-[#c2652a] ring-1 ring-[#c2652a]'
                  : 'bg-white border-[#d8d0c8]/60 hover:bg-[#f6f0e8]'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-[#3a302a] font-label block">
                  {t.name}
                </span>
                <span className="text-[10px] text-[#605850]">{t.desc}</span>
              </div>
              <span className="material-symbols-outlined text-base text-[#c2652a]">
                {currentTable === t.num ? 'check_circle' : 'chevron_right'}
              </span>
            </button>
          ))}
        </div>

        {verificationMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono">
            {verificationMsg}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full h-10 bg-[#c2652a] text-white rounded-lg font-label text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          Confirm Table #{String(currentTable).padStart(2, '0')}
        </button>
      </div>
    </div>
  );
};
