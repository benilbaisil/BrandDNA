import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  X
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminIndustriesPage = () => {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalMode, setModalMode] = useState(null); // 'add', 'edit', 'delete'
  const [newIndustryName, setNewIndustryName] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  const [industriesList, setIndustriesList] = useState([
    { id: 1, name: 'Technology', startupCount: 180, status: 'Enabled' },
    { id: 2, name: 'Healthcare', startupCount: 95, status: 'Enabled' },
    { id: 3, name: 'Education', startupCount: 40, status: 'Enabled' },
    { id: 4, name: 'Finance', startupCount: 85, status: 'Enabled' },
    { id: 5, name: 'Retail', startupCount: 50, status: 'Enabled' },
    { id: 6, name: 'Food & Beverage', startupCount: 30, status: 'Enabled' },
    { id: 7, name: 'Travel', startupCount: 22, status: 'Enabled' },
    { id: 8, name: 'Manufacturing', startupCount: 18, status: 'Disabled' }
  ]);

  const filteredIndustries = industriesList.filter((ind) =>
    ind.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (id) => {
    setIndustriesList((prev) =>
      prev.map((ind) => {
        if (ind.id === id) {
          const newStatus = ind.status === 'Enabled' ? 'Disabled' : 'Enabled';
          addToast(`Industry ${ind.name} is now ${newStatus}`, 'info');
          return { ...ind, status: newStatus };
        }
        return ind;
      })
    );
  };

  const handleAddIndustry = (e) => {
    e.preventDefault();
    if (!newIndustryName.trim()) return;
    const newInd = {
      id: Date.now(),
      name: newIndustryName.trim(),
      startupCount: 0,
      status: 'Enabled'
    };
    setIndustriesList((prev) => [...prev, newInd]);
    addToast(`Industry "${newIndustryName}" created successfully.`, 'success');
    setNewIndustryName('');
    setModalMode(null);
  };

  const handleDeleteIndustry = (id) => {
    setIndustriesList((prev) => prev.filter((ind) => ind.id !== id));
    addToast('Industry deleted.', 'success');
    setModalMode(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">
            Taxonomy & Sector Configuration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F291E] tracking-tight mt-1">
            Industry Management ({industriesList.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Add, edit, enable or disable supported industry classifications for startup branding.
          </p>
        </div>

        <button
          onClick={() => setModalMode('add')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F291E] text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add New Industry</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl glass-panel border border-[#E5E0D8] shadow-2xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search industry name..."
            className="w-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs text-[#0F291E] placeholder-slate-400 rounded-xl pl-9 pr-4 py-2.5 outline-none"
          />
        </div>
      </div>

      {/* Industry Table */}
      <div className="p-6 rounded-2xl glass-panel border border-[#E5E0D8] shadow-2xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5E0D8] text-slate-500 font-mono text-[10px] uppercase bg-[#FAF8F5]">
                <th className="py-3 px-4">Industry Sector Name</th>
                <th className="py-3 px-4">Active Startups</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIndustries.map((ind) => (
                <tr key={ind.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#0F291E] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>{ind.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0F291E]">{ind.startupCount} Startups</td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleStatus(ind.id)}
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border transition-colors cursor-pointer ${
                        ind.status === 'Enabled' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 border-[#E5E0D8] hover:bg-slate-200'
                      }`}
                    >
                      {ind.status}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => { setSelectedIndustry(ind); setModalMode('delete'); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Industry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {modalMode === 'add' && (
        <div className="fixed inset-0 z-50 bg-[#0F291E]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddIndustry} className="glass-panel border border-[#E5E0D8] rounded-3xl shadow-2xl max-w-md w-full p-6 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0F291E]">Add New Industry</h3>
              <button type="button" onClick={() => setModalMode(null)} className="p-1 text-slate-400 hover:text-[#0F291E]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Industry Name</label>
              <input
                type="text"
                required
                value={newIndustryName}
                onChange={(e) => setNewIndustryName(e.target.value)}
                placeholder="e.g. Clean Energy, E-Commerce..."
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalMode(null)} className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-xs">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-[#0F291E] text-white font-bold text-xs">Save Industry</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

