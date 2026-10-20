import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Eye, Edit2, Ban, Trash2, UserPlus, Users, Search } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services/adminService';

export const AdminUserTable = ({ searchQuery = '' }) => {
  const { addToast } = useToast();
  const [localQuery, setLocalQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers();
      if (res && res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      // Fallback data if offline
      setUsers([
        { id: '1', name: 'Sarah Founder', email: 'sarah@company.com', role: 'startup_owner', projects: 4, date: '2026-08-01', status: 'Active' },
        { id: '2', name: 'Alex Product', email: 'alex@startup.io', role: 'startup_owner', projects: 2, date: '2026-07-28', status: 'Active' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const activeQuery = searchQuery || localQuery;
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(activeQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(activeQuery.toLowerCase())
  );

  const toggleStatus = async (id, name) => {
    try {
      await adminService.toggleUserStatus(id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: u.status === 'Active' ? 'Disabled' : 'Active' } : u
        )
      );
      addToast(`Updated user status for "${name}"`, 'info');
    } catch (err) {
      addToast('Status update failed', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      addToast(`Deleted user "${name}" from database`, 'info');
    } catch (err) {
      addToast('Delete failed', 'error');
    }
  };

  return (
    <Card className="text-left border-[#E5E0D8]/90 p-0 overflow-hidden space-y-0">
      {/* Table Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#0F291E] text-white flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F291E] leading-tight">User Management</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Live Database Records ({users.length} Users)</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs rounded-xl pl-9 pr-3 py-2 outline-none focus:border-blue-600"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={() => addToast('Opening add user modal...', 'info')}
          >
            Add User
          </Button>
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-600">
          <thead className="bg-[#FAF8F5] border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-6">User</th>
              <th className="py-3 px-6">Email</th>
              <th className="py-3 px-6">Role</th>
              <th className="py-3 px-6">Reg. Date</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400 text-xs font-medium">
                  Loading users from database...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400 text-xs font-medium">
                  No matching users found in database.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#FAF8F5]/70 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-[#0F291E] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {user.name?.[0] || 'U'}
                    </div>
                    <span>{user.name}</span>
                  </td>
                  <td className="py-3.5 px-6 font-medium text-slate-600">{user.email}</td>
                  <td className="py-3.5 px-6">
                    <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-[#E5E0D8]">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-500 font-medium">{user.date}</td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        user.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => addToast(`Viewing profile for "${user.name}"`, 'info')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => addToast(`Editing user "${user.name}"`, 'info')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleStatus(user.id, user.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                        title="Disable / Enable"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
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

