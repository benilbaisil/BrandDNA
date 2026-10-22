import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
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
  FileText,
  ChevronDown,
  ChevronUp,
  User,
  Building2
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

export const AdminProjectsPage = () => {
  const { addToast } = useToast();
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProjects, setExpandedProjects] = useState({});
  const [selectedModalProject, setSelectedModalProject] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await adminService.getProjects();
      if (res && res.data) {
        setProjectsList(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch projects from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const toggleExpand = (id) => {
    setExpandedProjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredProjects = projectsList.filter((p) => {
    const name = p.name || '';
    const company = p.companyName || p.company || '';
    const owner = p.ownerName || '';
    const brandName = p.brandIdentity?.brandName || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brandName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleDeleteProject = async (id) => {
    try {
      await adminService.deleteProject(id);
      addToast('Project removed from database.', 'success');
      fetchProjects();
    } catch (err) {
      addToast(err.message || 'Failed to delete project', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#D6E6EC] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#0F291E] text-white text-[10px] font-sans font-bold uppercase tracking-wider">
            Saved Brand DNA Directory
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#0F291E] tracking-tight mt-2">
            User Saved Brand Projects ({loading ? '...' : projectsList.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Consolidated list of startup projects and their user-saved Brand Identity Analysis.
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="p-4 rounded-3xl glass-panel border border-[#D6E6EC] shadow-2xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search project name, company, or brand name..."
            className="w-full bg-[#FAF8F5]/40 border border-[#D6E6EC] focus:border-slate-900 focus:glass-panel text-xs text-[#0F291E] placeholder-slate-400 rounded-xl pl-9 pr-4 py-2.5 outline-none font-medium transition-all"
          />
        </div>
      </div>

      {/* Projects Cards Showcase */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 glass-panel rounded-3xl border border-[#D6E6EC] shadow-2xs">
          No user saved brand projects found in database.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProjects.map((p) => {
            const b = p.brandIdentity || {};
            const isExpanded = Boolean(expandedProjects[p.id]);
            const hasBrandData = Boolean(
              b.brandName || b.tagline || b.missionStatement || b.visionStatement || b.brandStory || b.brandPersonality
            );

            return (
              <div
                key={p.id}
                className="glass-panel rounded-3xl border border-[#D6E6EC] shadow-2xs overflow-hidden transition-all text-left"
              >
                {/* Project Header Bar */}
                <div className="p-6 glass-panel flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D6E6EC]/60">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0F291E] text-white text-[10px] font-mono font-bold uppercase">
                        {p.status || 'Completed'}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Updated: {p.lastUpdated || p.date || 'N/A'}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl font-bold text-[#0F291E] mt-1">
                      {p.companyName || p.name}
                    </h3>
                    
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Owner: <strong className="text-[#0F291E]/90">{p.ownerName}</strong> ({p.ownerEmail})</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      onClick={() => toggleExpand(p.id)}
                      className="px-4 py-2 rounded-full bg-[#FAF8F5] hover:bg-[#D6E6EC] text-[#0F291E]/90 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      <span>{isExpanded ? 'Collapse Analysis' : 'Show Saved Brand Analysis'}</span>
                    </button>

                    <button
                      onClick={() => setSelectedModalProject(p)}
                      className="px-4 py-2 rounded-full bg-[#0F291E] text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      <span>Full View</span>
                    </button>

                    <button
                      onClick={() => handleDeleteProject(p.id)}
                      className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inline Saved Brand Identity Summary */}
                <div className="p-6 sm:p-8 bg-[#FAF8F5]/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-slate-700" /> Saved Brand Identity Analysis Summary
                    </h4>
                    {hasBrandData && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        Saved in Database
                      </span>
                    )}
                  </div>

                  {hasBrandData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Brand Name */}
                      <div className="p-4 rounded-2xl glass-panel border border-[#D6E6EC] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Brand Name</span>
                          {b.brandNameSource && (
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                              {b.brandNameSource === 'manual' ? 'Manual' : 'AI'}
                            </span>
                          )}
                        </div>
                        <p className="font-serif text-xl font-bold text-[#0F291E]">{b.brandName || 'Not saved'}</p>
                      </div>

                      {/* Tagline */}
                      <div className="p-4 rounded-2xl glass-panel border border-[#D6E6EC] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Tagline</span>
                          {b.taglineSource && (
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                              {b.taglineSource === 'manual' ? 'Manual' : 'AI'}
                            </span>
                          )}
                        </div>
                        <p className="font-serif text-base italic text-[#0F291E]">"{b.tagline || 'Not saved'}"</p>
                      </div>

                      {/* Mission Statement */}
                      <div className="p-4 rounded-2xl glass-panel border border-[#D6E6EC] space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Mission Statement</span>
                        <p className="text-[#0F291E]/90 leading-relaxed font-medium line-clamp-2">{b.missionStatement || 'Not saved'}</p>
                      </div>

                      {/* Vision Statement */}
                      <div className="p-4 rounded-2xl glass-panel border border-[#D6E6EC] space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Vision Statement</span>
                        <p className="text-[#0F291E]/90 leading-relaxed font-medium line-clamp-2">{b.visionStatement || 'Not saved'}</p>
                      </div>

                      {/* Expandable Section: Brand Story, Personality, and Product Strategy */}
                      {isExpanded && (
                        <>
                          <div className="p-4 rounded-2xl glass-panel border border-[#D6E6EC] space-y-1 md:col-span-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Brand Story</span>
                            <p className="text-[#0F291E]/90 leading-relaxed font-medium whitespace-pre-wrap">{b.brandStory || 'Not saved'}</p>
                          </div>

                          <div className="p-4 rounded-2xl glass-panel border border-[#D6E6EC] space-y-2 md:col-span-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Brand Personality</span>
                            {b.brandPersonality ? (
                              <div className="flex flex-wrap gap-1.5">
                                {b.brandPersonality.split(',').map((trait, idx) => (
                                  <span key={idx} className="px-3 py-1 rounded-full bg-[#0F291E] text-white text-[10px] font-bold">
                                    {trait.trim()}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-400 italic">Not saved</p>
                            )}
                          </div>

                          {/* Product Strategy in Expanded Card */}
                          {(() => {
                            const ps = p.productStrategy || {};
                            const hasPs = Boolean(ps.productName || ps.shortDescription || ps.positioningStatement || ps.usps?.length > 0);
                            if (!hasPs) return null;

                            return (
                              <div className="p-4 rounded-2xl bg-[#FAF8F5]/70 border border-[#D6E6EC] space-y-3 md:col-span-2">
                                <span className="text-xs font-mono font-bold text-[#0F291E] uppercase tracking-wider block">
                                  Product Strategy & Positioning
                                </span>

                                {ps.productName && (
                                  <div className="p-3 rounded-xl glass-panel border border-[#E5E0D8] space-y-1">
                                    <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">Product Offering Name</span>
                                    <p className="font-serif text-base font-bold text-[#0F291E]">{ps.productName} {ps.productTagline ? `("${ps.productTagline}")` : ''}</p>
                                  </div>
                                )}

                                {ps.shortDescription && (
                                  <div className="p-3 rounded-xl glass-panel border border-[#E5E0D8] space-y-1">
                                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Elevator Pitch</span>
                                    <p className="text-[#0F291E]/90 leading-relaxed font-medium">{ps.shortDescription}</p>
                                  </div>
                                )}

                                {ps.usps?.length > 0 && (
                                  <div className="p-3 rounded-xl glass-panel border border-[#E5E0D8] space-y-1.5">
                                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Unique Selling Propositions (USPs)</span>
                                    <div className="space-y-1">
                                      {ps.usps.map((u, i) => (
                                        <div key={i} className="text-[#0F291E]/90 text-[11px] font-medium">
                                          <strong className="text-[#0F291E]">• {u.title}:</strong> {u.description}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {ps.positioningStatement && (
                                  <div className="p-3.5 rounded-xl bg-[#0F291E] text-white space-y-1">
                                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">Positioning Statement</span>
                                    <p className="italic text-xs font-medium leading-relaxed">"{ps.positioningStatement}"</p>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl glass-panel border border-[#D6E6EC] text-center space-y-1">
                      <p className="text-xs text-slate-400 italic">No brand analysis identity elements saved for this project yet.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}


      {/* Modal View for Full Details */}
      <AnimatePresence>
        {selectedModalProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0F291E]/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="glass-panel max-w-3xl w-full rounded-3xl border border-[#D6E6EC] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-left"
            >
              <div className="p-6 bg-[#FAF8F5]/60 border-b border-[#D6E6EC] flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#0F291E]">
                    {selectedModalProject.companyName || selectedModalProject.name} — Full Brand DNA
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Owner: <span className="font-bold text-[#0F291E]/90">{selectedModalProject.ownerName}</span> ({selectedModalProject.ownerEmail})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedModalProject(null)}
                  className="p-2 rounded-full text-slate-400 hover:text-[#0F291E]/90 hover:glass-panel transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto space-y-5 flex-1 text-xs">
                {(() => {
                  const b = selectedModalProject.brandIdentity || {};
                  return (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-[#FAF8F5]/40 border border-[#D6E6EC] space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Brand Name</span>
                        <p className="font-serif text-2xl font-bold text-[#0F291E]">{b.brandName || 'Not saved'}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FAF8F5]/40 border border-[#D6E6EC] space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Tagline</span>
                        <p className="font-serif text-lg italic text-[#0F291E]">"{b.tagline || 'Not saved'}"</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FAF8F5]/40 border border-[#D6E6EC] space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Mission Statement</span>
                        <p className="text-[#0F291E]/90 leading-relaxed font-medium">{b.missionStatement || 'Not saved'}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FAF8F5]/40 border border-[#D6E6EC] space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Vision Statement</span>
                        <p className="text-[#0F291E]/90 leading-relaxed font-medium">{b.visionStatement || 'Not saved'}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FAF8F5]/40 border border-[#D6E6EC] space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Brand Story</span>
                        <p className="text-[#0F291E]/90 leading-relaxed font-medium whitespace-pre-wrap">{b.brandStory || 'Not saved'}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FAF8F5]/40 border border-[#D6E6EC] space-y-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Brand Personality</span>
                        {b.brandPersonality ? (
                          <div className="flex flex-wrap gap-1.5">
                            {b.brandPersonality.split(',').map((t, idx) => (
                              <span key={idx} className="px-3 py-1 rounded-full bg-[#0F291E] text-white text-[10px] font-bold">
                                {t.trim()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">Not saved</p>
                        )}
                      </div>

                      {/* Product Strategy in Admin Modal */}
                      {(() => {
                        const ps = selectedModalProject.productStrategy || {};
                        const hasPs = Boolean(ps.productName || ps.shortDescription || ps.positioningStatement || ps.usps?.length > 0);
                        if (!hasPs) return null;

                        return (
                          <div className="pt-4 border-t border-[#D6E6EC] space-y-3">
                            <span className="text-xs font-mono font-bold text-[#0F291E] uppercase tracking-wider block">
                              Product Strategy & Positioning Framework
                            </span>

                            {ps.productName && (
                              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-1">
                                <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">Product Name</span>
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
                                <div className="space-y-1 text-[#0F291E]/90 font-medium">
                                  {ps.usps.map((u, i) => (
                                    <div key={i} className="leading-snug">
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

              <div className="p-4 bg-[#FAF8F5] border-t border-[#D6E6EC] flex justify-end">
                <button
                  onClick={() => setSelectedModalProject(null)}
                  className="px-6 py-2.5 rounded-full bg-[#0F291E] text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

