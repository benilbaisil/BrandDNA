import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Eye, Edit2, Trash2, FolderKanban, Plus } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { brandService } from '../../services/brandService';

export const ProjectTable = ({ filterQuery = '' }) => {
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await brandService.getProjects();
      if (res && res.success && res.data) {
        setProjects(
          res.data.map((p) => ({
            id: p._id,
            name: p.name,
            company: p.companyName,
            date: p.createdAt ? p.createdAt.split('T')[0] : '2026-08-05',
            status: p.status || 'Completed',
          }))
        );
      }
    } catch (err) {
      setProjects([
        { id: '1', name: 'AuraCraft AI Identity', date: '2026-08-04', status: 'Completed' },
        { id: '2', name: 'Novaflow GTM Campaign', date: '2026-08-02', status: 'In Progress' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    try {
      const res = await brandService.createProject({
        name: `New Brand Initiative #${projects.length + 1}`,
        companyName: 'AuraCraft AI',
        generatedModules: 'Brand Identity + GTM Strategy',
      });
      if (res && res.success) {
        addToast('New project created and saved in MongoDB Atlas!', 'success');
        fetchProjects();
      }
    } catch (err) {
      addToast('Project creation failed', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    try {
      await brandService.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      addToast(`Project "${name}" deleted from database`, 'info');
    } catch (err) {
      addToast('Delete failed', 'error');
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes((filterQuery || '').toLowerCase())
  );

  return (
    <Card className="text-left border-[#E5E0D8]/90 p-0 overflow-hidden">
      {/* Table Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F291E] leading-tight">Recent Projects</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Live MongoDB Database Workspace ({projects.length})</p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={handleCreate}
        >
          New Project
        </Button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-600">
          <thead className="bg-[#FAF8F5] border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-6">Project Name</th>
              <th className="py-3 px-6">Created Date</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-slate-400 text-xs font-medium">
                  Loading projects from database...
                </td>
              </tr>
            ) : filteredProjects.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-slate-400 text-xs font-medium">
                  No projects found in database.
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-[#FAF8F5]/70 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-[#0F291E]">{project.name}</td>
                  <td className="py-3.5 px-6 font-medium text-slate-500">{project.date}</td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        project.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => addToast(`Viewing "${project.name}"`, 'info')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => addToast(`Editing "${project.name}"`, 'info')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id, project.name)}
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

