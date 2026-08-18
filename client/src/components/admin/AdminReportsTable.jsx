import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { FileText, Download, Eye, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { exportReportToPDF } from '../../utils/pdfExport';

export const AdminReportsTable = () => {
  const { addToast } = useToast();
  const [reports, setReports] = useState([
    { id: 1, name: 'BrandDNA_Audit_AuraCraft_2026.pdf', companyName: 'AuraCraft AI', company: 'AuraCraft AI', date: '2026-08-05' },
    { id: 2, name: 'Novaflow_GTM_Strategy_Report.pdf', companyName: 'Novaflow Cloud', company: 'Novaflow Cloud', date: '2026-08-03' },
    { id: 3, name: 'Synthetix_Investor_Deck_Brief.pdf', companyName: 'Synthetix Data', company: 'Synthetix Data', date: '2026-07-30' },
  ]);

  const handleDelete = (id, name) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    addToast(`Deleted report "${name}"`, 'info');
  };

  return (
    <Card className="text-left border-slate-200/90 p-0 overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">Report Management</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Generated PDF Strategy Briefs & Audits</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-6">Report Name</th>
              <th className="py-3 px-6">Company</th>
              <th className="py-3 px-6">Generated Date</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{r.name}</span>
                </td>
                <td className="py-3.5 px-6 font-medium text-slate-600">{r.company}</td>
                <td className="py-3.5 px-6 text-slate-500 font-medium">{r.date}</td>
                <td className="py-3.5 px-6 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => exportReportToPDF(r)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                      title="View PDF Report"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => exportReportToPDF(r)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(r.id, r.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Delete"
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
    </Card>
  );
};
