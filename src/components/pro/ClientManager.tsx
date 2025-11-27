import React, { useState } from 'react';
import { listClients, saveClient, loadClient, deleteClient } from '../../utils/clientStorage';
import type { TaxCalculatorSnapshot } from '../../hooks/useTaxCalculator';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  getSnapshot: () => TaxCalculatorSnapshot;
  loadFromSnapshot: (snapshot: Partial<TaxCalculatorSnapshot>) => void;
};

export default function ClientManager({ isOpen, onClose, getSnapshot, loadFromSnapshot }: Props) {
  const [clients, setClients] = useState(() => listClients());
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  if (!isOpen) return null;

  const refresh = () => setClients(listClients());

  const handleSave = () => {
    const snap = getSnapshot();
    const row = saveClient(name || 'Untitled Return', snap, selected || undefined);
    setName(row.name);
    setSelected(row.id);
    refresh();
  };

  const handleLoad = () => {
    if (!selected) return;
    const snap = loadClient(selected);
    if (snap) loadFromSnapshot(snap);
    onClose();
  };

  const handleDelete = () => {
    if (!selected) return;
    deleteClient(selected);
    setSelected(null);
    refresh();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Client Manager</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>Close</button>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="mb-2 text-sm font-medium text-gray-700">Saved Clients</div>
            <div className="border rounded-md max-h-80 overflow-auto divide-y">
              {clients.length === 0 && (
                <div className="p-3 text-gray-500 text-sm">No clients yet</div>
              )}
              {clients.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelected(c.id); setName(c.name); }}
                  className={`w-full text-left p-3 hover:bg-gray-50 ${selected === c.id ? 'bg-blue-50' : ''}`}
                >
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-gray-500">Updated {new Date(c.updatedAt).toLocaleString()}</div>
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <button onClick={handleLoad} disabled={!selected} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Load</button>
              <button onClick={handleDelete} disabled={!selected} className="px-3 py-2 bg-red-600 text-white rounded disabled:opacity-50">Delete</button>
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm font-medium text-gray-700">Save Current Return</div>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Client name (e.g., John & Jane 2025)"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <div className="mt-2">
              <button onClick={handleSave} className="px-3 py-2 bg-green-600 text-white rounded">Save</button>
            </div>
            <div className="mt-6 text-sm text-gray-600">
              Tip: Select a client from the list to overwrite their return.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



