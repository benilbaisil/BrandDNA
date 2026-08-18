import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  Printer,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { exportReportToPDF, exportAllReportsToPDF } from '../../utils/pdfExport';

export const AdminReportsPage = () => {
  const { addToast } = useToast();
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await adminService.getReports();
      if (res && res.data) {
        setReportsList(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch report records from backend database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateAllReports = async () => {
    setGenerating(true);
    try {
      const res = await adminService.generateReports();
      if (res && res.data) {
        setReportsList(res.data);
        addToast(`Generated ${res.data.length} executive reports from MongoDB startup profiles!`, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to generate executive reports', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const filteredReports = reportsList.filter((r) => {
    const name = r.name || '';
    const company = r.companyName || r.company || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || company.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDeleteReport = async (id) => {
    try {
      await adminService.deleteReport(id);
      addToast('Report deleted from database.', 'success');
      fetchReports();
    } catch (err) {
      addToast(err.message || 'Failed to delete report', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">
            MongoDB Executive Reports Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Reports Management ({loading ? '...' : reportsList.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Generate and export publication-grade executive PDF reports for all registered startups.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleGenerateAllReports}
            disabled={generating || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Compiling Reports...' : 'Generate All Reports'}</span>
          </button>

          {reportsList.length > 0 && (
            <button
              onClick={() => exportAllReportsToPDF(reportsList)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download Master PDF</span>
            </button>
          )}

          <button
            onClick={fetchReports}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search report name, company, or owner..."
            className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 rounded-xl pl-9 pr-4 py-2.5 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>PDF Exporter Ready</span>
        </div>
      </div>

      {/* Reports Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading report records from MongoDB...</span>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-xs text-slate-400">No report records found in MongoDB database.</p>
            <button
              onClick={handleGenerateAllReports}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Generate All Reports Now</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase bg-slate-50">
                  <th className="py-3 px-4">Report Title</th>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Generated Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <span className="block font-extrabold text-slate-900">{r.title || r.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">{r.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-blue-600">{r.companyName || r.company}</td>
                    <td className="py-3.5 px-4 text-slate-600">{r.ownerName || 'Startup Owner'}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{r.date || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => exportReportToPDF(r)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-[11px] hover:bg-slate-800 transition-all shadow-2xs cursor-pointer"
                          title="Download PDF Executive Report"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-400" />
                          <span>Download PDF</span>
                        </button>

                        <button
                          onClick={() => handleDeleteReport(r.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete Report"
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

    </div>
  );
};
