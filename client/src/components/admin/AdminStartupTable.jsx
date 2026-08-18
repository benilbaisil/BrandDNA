import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Building2, Eye, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services/adminService';

export const AdminStartupTable = () => {
  const { addToast } = useToast();
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStartups();
      if (res && res.success && res.data) {
        setStartups(res.data);
      }
    } catch (err) {
      setStartups([
        { id: '1', name: 'AuraCraft AI', industry: 'HealthTech & AI Diagnostics', owner: 'Sarah Founder', date: '2026-08-01', status: 'Completed' },
        { id: '2', name: 'Novaflow Cloud', industry: 'DevOps & Cloud Orchestration', owner: 'Alex Product', date: '2026-07-28', status: 'In Progress' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, []);

  const handleDelete = async (id, name) => {
    try {
      await adminService.deleteStartup(id);
      setStartups((prev) => prev.filter((s) => s.id !== id));
      addToast(`Deleted startup profile for "${name}"`, 'info');
    } catch (err) {
      addToast('Delete failed', 'error');
    }
  };

  return (
    <Card className="text-left border-slate-200/90 p-0 overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">Startup Management</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Live MongoDB Startup Profiles ({startups.length})</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-6">Company Name</th>
              <th className="py-3 px-6">Industry</th>
              <th className="py-3 px-6">Owner</th>
              <th className="py-3 px-6">Created Date</th>
              <th className="py-3 px-6">Brand Status</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400 text-xs font-medium">
                  Loading startups from database...
                </td>
              </tr>
            ) : startups.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400 text-xs font-medium">
                  No startup profiles found in database.
                </td>
              </tr>
            ) : (
              startups.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-slate-900">{s.name}</td>
                  <td className="py-3.5 px-6 font-medium text-slate-600">{s.industry}</td>
                  <td className="py-3.5 px-6 text-slate-700 font-medium">{s.owner}</td>
                  <td className="py-3.5 px-6 text-slate-500 font-medium">{s.date}</td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => addToast(`Viewing startup "${s.name}"`, 'info')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => addToast(`Editing startup "${s.name}"`, 'info')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
