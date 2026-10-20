import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Search,
  Eye,
  Trash2,
  RefreshCw,
  X,
  Tag,
  Target,
  Compass,
  BookOpen,
  Sliders,
  BookmarkCheck,
  Download
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { exportReportToPDF } from '../../utils/pdfExport';

export const AdminStartupsPage = () => {
  const { addToast } = useToast();
  const [startupsList, setStartupsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'view_profile' | 'view_analysis' | 'delete'

  const fetchStartups = async () => {
    setLoading(true);
    try {
      const res = await adminService.getStartups();
      if (res && res.data) {
        setStartupsList(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch startup profiles from backend', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, []);

  const filteredStartups = startupsList.filter((s) => {
    const name = s.companyName || s.name || '';
    const owner = s.ownerName || s.owner || '';
    const industry = s.industry || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      industry.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleDeleteStartup = async (id) => {
    try {
      await adminService.deleteStartup(id);
      addToast('Startup profile deleted from database.', 'success');
      setModalMode(null);
      fetchStartups();
    } catch (err) {
      addToast(err.message || 'Failed to delete startup profile', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#D6E6EC] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#0F291E] text-white text-[10px] font-sans font-bold uppercase tracking-wider">
            Startup Profiles Directory
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#0F291E] tracking-tight mt-2">
            Startup Profiles ({loading ? '...' : startupsList.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Registered business profiles and their post-analysis AI brand identity summaries.
          </p>
        </div>

        <button
          onClick={fetchStartups}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F291E] text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-white ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Startups</span>
        </button>
      </div>

      {/* Filter */}
      <div className="p-4 rounded-3xl glass-panel border border-[#D6E6EC] shadow-2xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, industry, or owner..."
            className="w-full bg-[#FAF8F5]/40 border border-[#D6E6EC] focus:border-slate-900 focus:glass-panel text-xs text-[#0F291E] placeholder-slate-400 rounded-xl pl-9 pr-4 py-2.5 outline-none font-medium transition-all"
          />
        </div>
      </div>

      {/* Startups Table */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-[#D6E6EC] shadow-2xs space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#0F291E]" />
            <span>Loading startup profile records from database...</span>
          </div>
        ) : filteredStartups.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No startup profile records found in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D6E6EC] text-slate-500 font-mono text-[10px] uppercase bg-[#FAF8F5]/50">
                  <th className="py-3.5 px-4 font-bold">Company Name</th>
                  <th className="py-3.5 px-4 font-bold">Industry Domain</th>
                  <th className="py-3.5 px-4 font-bold">Owner</th>
                  <th className="py-3.5 px-4 font-bold">Target Audience</th>
                  <th className="py-3.5 px-4 font-bold">Created Date</th>
                  <th className="py-3.5 px-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStartups.map((s) => (
                  <tr key={s.id} className="hover:bg-[#FAF8F5]/30 transition-colors">
                    <td className="py-4 px-4 text-[#0F291E]">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                          <span className="font-bold">{s.companyName || s.name}</span>
                        </div>
                        {s.originalCompanyName && s.originalCompanyName !== s.companyName && (
                          <span className="text-[10px] text-slate-400 font-mono pl-6">
                            Original: {s.originalCompanyName}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700">{s.industry}</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#0F291E]">{s.ownerName || s.owner}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{s.ownerEmail || ''}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{s.targetAudience || 'N/A'}</td>
                    <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">{s.date || 'N/A'}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => exportReportToPDF({
                            companyName: s.companyName || s.name,
                            title: `${s.companyName || s.name} Executive Strategy Blueprint`,
                            industry: s.industry,
                            ownerName: s.ownerName || s.owner,
                            ownerEmail: s.ownerEmail,
                            date: s.date,
                            brandIdentity: s.brandIdentity || {},
                            productStrategy: s.productStrategy || {},
                          })}
                          className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Download Separate User PDF Report"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-300" />
                          <span>PDF Report</span>
                        </button>

                        <button
                          onClick={() => { setSelectedStartup(s); setModalMode('view_analysis'); }}
                          className="px-3 py-1.5 rounded-full bg-[#0F291E] text-white text-[11px] font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="View Brand Analysis Summary"
                        >
                          <BookmarkCheck className="w-3.5 h-3.5 text-white" />
                          <span>Brand Analysis</span>
                        </button>

                        <button
                          onClick={() => { setSelectedStartup(s); setModalMode('view_profile'); }}
                          className="p-1.5 rounded-full text-slate-400 hover:text-[#0F291E] hover:bg-slate-100 transition-colors cursor-pointer"
                          title="View Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => { setSelectedStartup(s); setModalMode('delete'); }}
                          className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Startup"
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
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalMode && selectedStartup && (
          <div className="fixed inset-0 z-50 bg-[#0F291E]/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="glass-panel max-w-2xl w-full rounded-3xl border border-[#D6E6EC] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-left"
            >
              <div className="p-6 bg-[#FAF8F5]/60 border-b border-[#D6E6EC] flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#0F291E]">
                    {selectedStartup.companyName || selectedStartup.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Owner: <span className="font-bold text-[#0F291E]/90">{selectedStartup.ownerName}</span> ({selectedStartup.ownerEmail})
                  </p>
                </div>
                <button
                  onClick={() => setModalMode(null)}
                  className="p-2 text-slate-400 hover:text-[#0F291E]/90 rounded-full hover:glass-panel transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto space-y-5 flex-1">
                {modalMode === 'view_analysis' && (
                  <div className="space-y-4">
                    <h4 className="font-serif text-lg font-bold text-[#0F291E] border-b border-[#D6E6EC] pb-2">
                      Brand Identity Analysis Summary
                    </h4>

                    {(() => {
                      const b = selectedStartup.brandIdentity || {};
                      const hasData = Boolean(
                        b.brandName || b.tagline || b.missionStatement || b.visionStatement || b.brandStory || b.brandPersonality
                      );

                      if (!hasData) {
                        return (
                          <div className="py-8 text-center space-y-2">
                            <BookmarkCheck className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="text-xs text-slate-500">No brand analysis identity elements saved yet.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4 text-xs">
                          <div className="p-3.5 rounded-2xl bg-[#FAF8F5]/40 border border-[#D6E6EC] space-y-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Brand Name</span>
                            <p className="font-serif text-xl font-bold text-[#0F291E]">{b.brandName || 'Not saved'}</p>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-[#FAF8F5]/40 border border-[#D6E6EC] space-y-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Tagline</span>
                            <p className="font-serif text-base italic text-[#0F291E]">"{b.tagline || 'Not saved'}"</p>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-[#FAF8F5]/40 border border-[#D6E6EC] space-y-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Mission Statement</span>
                            <p className="text-[#0F291E]/90 leading-relaxed font-medium">{b.missionStatement || 'Not saved'}</p>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-[#FAF8F5]/40 border border-[#D6E6EC] space-y-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Vision Statement</span>
                            <p className="text-[#0F291E]/90 leading-relaxed font-medium">{b.visionStatement || 'Not saved'}</p>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-[#FAF8F5]/40 border border-[#D6E6EC] space-y-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Brand Story</span>
                            <p className="text-[#0F291E]/90 leading-relaxed font-medium whitespace-pre-wrap">{b.brandStory || 'Not saved'}</p>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-[#FAF8F5]/40 border border-[#D6E6EC] space-y-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Brand Personality</span>
                            {b.brandPersonality ? (
                              <div className="flex flex-wrap gap-1.5">
                                {b.brandPersonality.split(',').map((t, idx) => (
                                  <span key={idx} className="px-2.5 py-0.5 rounded-full bg-[#0F291E] text-white text-[10px] font-bold">
                                    {t.trim()}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-400 italic">Not saved</p>
                            )}
                          </div>

                          {/* Product Strategy Section in Admin Modal */}
                          {(() => {
                            const ps = selectedStartup.productStrategy || {};
                            const hasPs = Boolean(ps.productName || ps.shortDescription || ps.positioningStatement || ps.usps?.length > 0);
                            if (!hasPs) return null;

                            return (
                              <div className="pt-4 border-t border-[#D6E6EC] space-y-3">
                                <span className="text-xs font-mono font-bold text-[#0F291E] uppercase tracking-wider block">
                                  Product Strategy & Positioning
                                </span>

                                {ps.productName && (
                                  <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-1">
                                    <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">Product Offering Name</span>
                                    <p className="font-serif text-lg font-bold text-[#0F291E]">{ps.productName} {ps.productTagline ? `("${ps.productTagline}")` : ''}</p>
                                  </div>
                                )}

                                {ps.shortDescription && (
                                  <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-1">
                                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Elevator Pitch</span>
                                    <p className="text-[#0F291E]/90 leading-relaxed font-medium">{ps.shortDescription}</p>
                                  </div>
                                )}

                                {ps.usps?.length > 0 && (
                                  <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-2">
                                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Unique Selling Propositions (USPs)</span>
                                    <div className="space-y-1.5">
                                      {ps.usps.map((u, i) => (
                                        <div key={i} className="text-[#0F291E]/90 font-medium leading-snug">
                                          <strong className="text-[#0F291E]">• {u.title}:</strong> {u.description}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {ps.positioningStatement && (
                                  <div className="p-4 rounded-2xl bg-[#0F291E] text-white space-y-1">
                                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">Positioning Statement</span>
                                    <p className="italic text-xs font-medium leading-relaxed">"{ps.positioningStatement}"</p>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {modalMode === 'view_profile' && (
                  <div className="space-y-4 text-xs">
                    <h4 className="font-serif text-lg font-bold text-[#0F291E] border-b border-[#D6E6EC] pb-2">
                      Basic Business Details
                    </h4>
                    <div className="p-4 bg-[#FAF8F5]/40 rounded-2xl border border-[#D6E6EC] space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Industry</span>
                      <p className="font-bold text-[#0F291E]">{selectedStartup.industry}</p>
                    </div>
                    {selectedStartup.companyDescription && (
                      <div className="p-4 bg-[#FAF8F5]/40 rounded-2xl border border-[#D6E6EC] space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Description</span>
                        <p className="text-[#0F291E]/90 leading-relaxed font-medium">{selectedStartup.companyDescription}</p>
                      </div>
                    )}
                    {selectedStartup.productsServices && (
                      <div className="p-4 bg-[#FAF8F5]/40 rounded-2xl border border-[#D6E6EC] space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Products & Services</span>
                        <p className="text-[#0F291E]/90 leading-relaxed font-medium">{selectedStartup.productsServices}</p>
                      </div>
                    )}
                  </div>
                )}

                {modalMode === 'delete' && (
                  <div className="space-y-4 text-xs">
                    <p className="text-slate-700 font-medium">
                      Are you sure you want to delete startup profile <strong>{selectedStartup.companyName || selectedStartup.name}</strong> from MongoDB?
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setModalMode(null)}
                        className="px-5 py-2.5 rounded-full bg-slate-100 font-bold text-[#0F291E]/90 hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteStartup(selectedStartup.id)}
                        className="px-5 py-2.5 rounded-full bg-rose-600 font-bold text-white hover:bg-rose-700 transition-colors"
                      >
                        Delete Startup
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {modalMode !== 'delete' && (
                <div className="p-4 bg-[#FAF8F5] border-t border-[#D6E6EC] flex justify-end">
                  <button
                    onClick={() => setModalMode(null)}
                    className="px-6 py-2.5 rounded-full bg-[#0F291E] text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

