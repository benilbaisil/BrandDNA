import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Trash2,
  Eye,
  RefreshCw,
  X,
  Shield,
  FileText,
  Download
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { exportReportToPDF } from '../../utils/pdfExport';

export const AdminUsersPage = () => {
  const { addToast } = useToast();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'view', 'delete'

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers();
      if (res && res.data) {
        setUsersList(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch users from backend database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' || (u.status || 'Active').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggleStatus = async (userId) => {
    try {
      const res = await adminService.toggleUserStatus(userId);
      if (res && res.data) {
        addToast(`User status updated to ${res.data.status}`, 'success');
        fetchUsers();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update user status', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await adminService.deleteUser(userId);
      addToast('User account deleted from database.', 'success');
      setModalMode(null);
      fetchUsers();
    } catch (err) {
      addToast(err.message || 'Failed to delete user', 'error');
    }
  };

  const handleExportUserReport = async (userId, userName) => {
    try {
      addToast(`Generating separate executive report for ${userName}...`, 'info');
      const res = await adminService.getUserReport(userId);
      if (res && res.data) {
        exportReportToPDF(res.data);
        addToast(`Executive PDF report opened for ${userName}!`, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to generate user report', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#D6E6EC] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#0F291E] text-white text-[10px] font-sans font-bold uppercase tracking-wider">
            User Accounts Directory
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#0F291E] tracking-tight mt-2">
            User Management ({loading ? '...' : usersList.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Registered user accounts and permission status retrieved directly from MongoDB.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F291E] text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-white ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl glass-panel border border-[#D6E6EC] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-[#FAF8F5]/40 border border-[#D6E6EC] focus:border-slate-900 focus:glass-panel text-xs text-[#0F291E] placeholder-slate-400 rounded-xl pl-9 pr-4 py-2.5 outline-none font-medium transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#FAF8F5]/40 border border-[#D6E6EC] text-xs text-[#0F291E] font-bold rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="inventory_staff">Inventory Staff</option>
            <option value="marketing_staff">Marketing Staff</option>
            <option value="customer">Customer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FAF8F5]/40 border border-[#D6E6EC] text-xs text-[#0F291E] font-bold rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-[#D6E6EC] shadow-2xs space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#0F291E]" />
            <span>Loading user records from database...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No user records found in database matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D6E6EC] text-slate-500 font-mono text-[10px] uppercase bg-[#FAF8F5]/50">
                  <th className="py-3.5 px-4 font-bold">Full Name</th>
                  <th className="py-3.5 px-4 font-bold">Email</th>
                  <th className="py-3.5 px-4 font-bold">Role</th>
                  <th className="py-3.5 px-4 font-bold">Registration Date</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAF8F5]/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-[#0F291E]">{u.name}</td>
                    <td className="py-4 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        u.role === 'admin' ? 'bg-[#0F291E] text-white border-slate-900' : 'bg-slate-100 text-slate-700 border-[#E5E0D8]'
                      }`}>
                        {u.role ? u.role.replace('_', ' ') : 'User'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">{u.date || 'N/A'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {u.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleExportUserReport(u.id, u.name)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0F291E] text-white font-bold text-[10px] hover:bg-slate-800 transition-all shadow-2xs cursor-pointer"
                          title="Generate & Download Separate User Report PDF"
                        >
                          <Download className="w-3 h-3 text-amber-400" />
                          <span>PDF Report</span>
                        </button>
                        <button
                          onClick={() => { setSelectedUser(u); setModalMode('view'); }}
                          className="p-1.5 rounded-full text-slate-400 hover:text-[#0F291E] hover:bg-slate-100 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className="p-1.5 rounded-full text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Toggle Status"
                        >
                          {u.status === 'Active' ? <UserX className="w-4 h-4 text-amber-600" /> : <UserCheck className="w-4 h-4 text-emerald-600" />}
                        </button>
                        <button
                          onClick={() => { setSelectedUser(u); setModalMode('delete'); }}
                          className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete User"
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
        {modalMode && selectedUser && (
          <div className="fixed inset-0 z-50 bg-[#0F291E]/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="glass-panel max-w-md w-full rounded-3xl border border-[#D6E6EC] shadow-2xl overflow-hidden text-left"
            >
              <div className="p-6 bg-[#FAF8F5]/60 border-b border-[#D6E6EC] flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-[#0F291E]">
                  {modalMode === 'view' ? 'User Record Inspector' : 'Delete Confirmation'}
                </h3>
                <button onClick={() => setModalMode(null)} className="p-1.5 rounded-full text-slate-400 hover:text-[#0F291E]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                {modalMode === 'view' ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-[#FAF8F5]/40 rounded-2xl border border-[#D6E6EC] space-y-1">
                      <h4 className="font-serif text-lg font-bold text-[#0F291E]">{selectedUser.name}</h4>
                      <p className="text-slate-500 font-mono text-[11px]">{selectedUser.email}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-[#FAF8F5]/40 rounded-2xl border border-[#D6E6EC]">
                        <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">ROLE</span>
                        <p className="font-bold text-[#0F291E] mt-0.5">{selectedUser.role}</p>
                      </div>
                      <div className="p-3 bg-[#FAF8F5]/40 rounded-2xl border border-[#D6E6EC]">
                        <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">STATUS</span>
                        <p className="font-bold text-[#0F291E] mt-0.5">{selectedUser.status}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-slate-700 font-medium">
                      Permanently delete user account <strong>{selectedUser.name}</strong> from MongoDB database?
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setModalMode(null)}
                        className="px-5 py-2.5 rounded-full bg-slate-100 font-bold text-[#0F291E]/90 hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteUser(selectedUser.id)}
                        className="px-5 py-2.5 rounded-full bg-rose-600 font-bold text-white hover:bg-rose-700 transition-colors"
                      >
                        Delete User
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {modalMode === 'view' && (
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

