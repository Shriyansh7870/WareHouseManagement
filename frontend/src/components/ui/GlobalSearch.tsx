import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle, Thermometer, Rocket, X } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';

interface Result {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  link: string;
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { inventory, grns, capas, deliveryOrders } = useDataStore();

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery('');
  }, [open]);

  const results: Result[] = query.length < 2 ? [] : [
    ...inventory.filter(i =>
      i.itemName.toLowerCase().includes(query.toLowerCase()) ||
      i.batchNumber.toLowerCase().includes(query.toLowerCase()) ||
      i.itemCode.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 4).map(i => ({
      type: 'Inventory', id: i.id,
      title: i.itemName,
      subtitle: `Batch ${i.batchNumber} · ${i.qtyOnHand} ${i.unit} · ${i.qaStatus}`,
      icon: <Package size={14} className="text-purple-500" />,
      link: '/inventory',
    })),
    ...grns.filter(g =>
      g.grnNumber.toLowerCase().includes(query.toLowerCase()) ||
      g.itemName.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 3).map(g => ({
      type: 'GRN', id: g.id,
      title: g.grnNumber,
      subtitle: `${g.itemName} · ${g.vendorName} · ${g.status}`,
      icon: <Truck size={14} className="text-blue-500" />,
      link: '/grn',
    })),
    ...capas.filter(c =>
      c.capaNumber.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 3).map(c => ({
      type: 'CAPA', id: c.id,
      title: c.capaNumber,
      subtitle: `${c.priority} · ${c.status} · ${c.assignedTo}`,
      icon: <CheckCircle size={14} className="text-green-500" />,
      link: '/qa',
    })),
    ...deliveryOrders.filter(d =>
      d.doNumber.toLowerCase().includes(query.toLowerCase()) ||
      d.customerName.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 3).map(d => ({
      type: 'Dispatch', id: d.id,
      title: d.doNumber,
      subtitle: `${d.customerName} · ${d.doStatus}`,
      icon: <Rocket size={14} className="text-orange-500" />,
      link: '/dispatch',
    })),
  ];

  const handleSelect = (result: Result) => {
    navigate(result.link);
    setOpen(false);
  };

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 border border-gray-200 rounded-lg hover:border-[#6c63ff] hover:text-[#6c63ff] transition-colors bg-white"
    >
      <Search size={12} />
      <span>Search…</span>
      <kbd className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search inventory, GRNs, CAPAs, orders…"
            className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400"
          />
          {query && <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>}
          <kbd className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-400">Esc</kbd>
        </div>

        {results.length > 0 ? (
          <div className="max-h-80 overflow-y-auto py-2">
            {['Inventory', 'GRN', 'CAPA', 'Dispatch'].map(type => {
              const group = results.filter(r => r.type === type);
              if (!group.length) return null;
              return (
                <div key={type}>
                  <div className="px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{type}</div>
                  {group.map(r => (
                    <button key={r.id} onClick={() => handleSelect(r)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
                      <div className="flex-shrink-0">{r.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800">{r.title}</div>
                        <div className="text-xs text-gray-500 truncate">{r.subtitle}</div>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ) : query.length >= 2 ? (
          <div className="py-10 text-center text-sm text-gray-400">No results for "{query}"</div>
        ) : (
          <div className="py-6 px-4">
            <p className="text-xs text-gray-400 mb-3">Quick navigate</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Inventory', icon: <Package size={13} />, link: '/inventory' },
                { label: 'GRN Register', icon: <Truck size={13} />, link: '/grn' },
                { label: 'QA / CAPAs', icon: <CheckCircle size={13} />, link: '/qa' },
                { label: 'Cold Chain', icon: <Thermometer size={13} />, link: '/cold-chain' },
              ].map(item => (
                <button key={item.label} onClick={() => { navigate(item.link); setOpen(false); }}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 hover:border-[#6c63ff] hover:bg-purple-50/30 transition-colors text-sm text-gray-600">
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
