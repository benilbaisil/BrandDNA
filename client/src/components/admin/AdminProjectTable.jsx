import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Sparkles, Eye, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminProjectTable = () => {
  const { addToast } = useToast();
  const [projects, setProjects] = useState([
    { id: 1, name: 'AuraCraft Brand Identity', company: 'AuraCraft AI', modules: 'Brand + Persona + GTM', date: '2026-08-04', status: 'Completed' },
    { id: 2, name: 'Novaflow Product Roadmap', company: 'Novaflow Cloud', modules: 'Product Strategy', date: '2026-08-02', status: 'In Progress' },
    { id: 3, name: 'Synthetix Persona Matrix', company: 'Synthetix Data', modules: 'Customer Persona', date: '2026-07-29', status: 'Completed' },
  ]);

  const handleDelete = (id, name) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    addToast(`Deleted project "${name}"`, 'info');
  };

  return (
    <Card className="text-left border-slate-200/90 p-0 overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">Branding Projects</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Platform Brand & Strategy Workspaces</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-6">Project Name</th>
              <th className="py-3 px-6">Company</th>
              <th className="py-3 px-6">Generated Modules</th>
              <th className="py-3 px-6">Created Date</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-slate-900">{p.name}</td>
                <td className="py-3.5 px-6 font-medium text-slate-600">{p.company}</td>
                <td className="py-3.5 px-6 font-medium text-slate-700">{p.modules}</td>
                <td className="py-3.5 px-6 text-slate-500 font-medium">{p.date}</td>
                <td className="py-3.5 px-6">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="py-3.5 px-6 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => addToast(`Viewing project "${p.name}"`, 'info')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => addToast(`Editing project "${p.name}"`, 'info')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
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
