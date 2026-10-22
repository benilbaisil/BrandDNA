import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Trash2,
  Eye,
  Edit,
  RefreshCw,
  X,
  Shield,
  FileText,
  Download,
  Plus,
  Package,
  Megaphone,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Lock,
  EyeOff,
  User as UserIcon,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { exportReportToPDF } from '../../utils/pdfExport';
import {
  validatePhoneNumber,
  validateStreet,
  validateCity,
  validateState,
  validatePinCode,
  validateAddress,
  formatAddressDisplay,
} from '../../utils/validation';
import { storageCache } from '../../utils/storageCache';

export const AdminUsersPage = () => {
  const { addToast } = useToast();
  const [usersList, setUsersList] = useState(() => storageCache.get('admin_users_list', []));
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('staff'); // 'staff', 'customers', 'all'

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals: 'view', 'create', 'edit', 'delete'
  const [modalMode, setModalMode] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State for Add / Edit Staff Account
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'inventory_staff',
    status: 'Active',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    vehicleNumber: '',
    vehicleType: 'Bike',
    password: '',
    confirmPassword: '',
  });

  // Inline Validation Errors
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers();
      if (res && res.data) {
        setUsersList(res.data);
        storageCache.set('admin_users_list', res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch users from database', 'error');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Real-time Field Validation Handler
  const validateSingleField = (name, value, currentForm = formData) => {
    let error = null;

    if (name === 'fullName') {
      if (!value || !value.trim()) {
        error = 'Full name is required';
      } else if (value.trim().length < 2) {
        error = 'Full name must be at least 2 characters';
      } else if (!/^[a-zA-Z\s]+$/.test(value)) {
        error = 'Full name can only contain letters and spaces';
      }
    } else if (name === 'email') {
      if (!value || !value.trim()) {
        error = 'Email address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        error = 'Please enter a valid email address';
      }
    } else if (name === 'phone') {
      if (value && value.trim()) {
        const phoneRes = validatePhoneNumber(value);
        if (!phoneRes.isValid) {
          error = phoneRes.error;
        }
      }
    } else if (name === 'street') {
      error = validateStreet(value);
    } else if (name === 'city') {
      error = validateCity(value);
    } else if (name === 'state') {
      error = validateState(value);
    } else if (name === 'zipCode') {
      error = validatePinCode(value, currentForm.country || 'India');
    } else if (name === 'password') {
      if (modalMode === 'create' && (!value || value.length < 6)) {
        error = 'Password must be at least 6 characters';
      } else if (modalMode === 'edit' && value && value.length < 6) {
        error = 'New password must be at least 6 characters';
      }
    } else if (name === 'confirmPassword') {
      if (modalMode === 'create' && value !== currentForm.password) {
        error = 'Passwords do not match';
      }
    } else if (name === 'vehicleNumber') {
      if (currentForm.role === 'delivery_agent' && (!value || !value.trim())) {
        error = 'Vehicle number is required for delivery agents';
      }
    }

    setFieldErrors((prev) => {
      const updated = { ...prev };
      if (error) {
        updated[name] = error;
      } else {
        delete updated[name];
      }
      return updated;
    });

    return error;
  };

  const handleFieldChange = (name, value) => {
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);
    if (touched[name]) {
      validateSingleField(name, value, updatedForm);
    }
  };

  const handleFieldBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateSingleField(name, formData[name], formData);
  };

  // Open Create Staff Modal
  const openCreateModal = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      role: 'inventory_staff',
      status: 'Active',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      vehicleNumber: '',
      vehicleType: 'Bike',
      password: '',
      confirmPassword: '',
    });
    setFieldErrors({});
    setTouched({});
    setSelectedUser(null);
    setModalMode('create');
  };

  // Open Edit Staff Modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    const addr = user.address || {};
    setFormData({
      fullName: user.fullName || user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'inventory_staff',
      status: user.status || 'Active',
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      zipCode: addr.zipCode || '',
      country: addr.country || 'India',
      vehicleNumber: user.vehicleNumber || '',
      vehicleType: user.vehicleType || 'Bike',
      password: '',
      confirmPassword: '',
    });
    setFieldErrors({});
    setTouched({});
    setModalMode('edit');
  };

  // Form Submit Handler for Create & Edit
  const handleStaffFormSubmit = async (e) => {
    e.preventDefault();

    // Trigger validation on all required fields
    const fieldsToValidate = ['fullName', 'email', 'street', 'city', 'state', 'zipCode'];
    if (formData.phone) fieldsToValidate.push('phone');
    if (modalMode === 'create') fieldsToValidate.push('password', 'confirmPassword');
    if (formData.role === 'delivery_agent') fieldsToValidate.push('vehicleNumber');

    let hasErrors = false;
    const newTouched = {};
    const newErrors = {};

    fieldsToValidate.forEach((f) => {
      newTouched[f] = true;
      const err = validateSingleField(f, formData[f], formData);
      if (err) {
        newErrors[f] = err;
        hasErrors = true;
      }
    });

    setTouched((prev) => ({ ...prev, ...newTouched }));
    setFieldErrors(newErrors);

    if (hasErrors) {
      addToast('Please fix the validation errors before submitting', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        role: formData.role,
        status: formData.status,
        address: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipCode: formData.zipCode.trim(),
          country: formData.country.trim() || 'India',
        },
      };

      if (formData.role === 'delivery_agent') {
        payload.vehicleNumber = formData.vehicleNumber.trim();
        payload.vehicleType = formData.vehicleType;
      }

      if (modalMode === 'create') {
        payload.password = formData.password;
        const res = await adminService.createUser(payload);
        if (res && (res.success || res.data)) {
          addToast(`Staff account for ${payload.fullName} created successfully!`, 'success');
          setModalMode(null);
          fetchUsers();
        }
      } else if (modalMode === 'edit' && selectedUser) {
        if (formData.password && formData.password.trim().length >= 6) {
          payload.password = formData.password.trim();
        }
        const res = await adminService.updateUser(selectedUser.id || selectedUser._id, payload);
        if (res && (res.success || res.data)) {
          addToast(`Staff account for ${payload.fullName} updated successfully!`, 'success');
          setModalMode(null);
          fetchUsers();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

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
      addToast(`Generating report for ${userName}...`, 'info');
      const res = await adminService.getUserReport(userId);
      if (res && res.data) {
        exportReportToPDF(res.data);
        addToast(`PDF report generated for ${userName}!`, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to generate user report', 'error');
    }
  };

  // Staff roles definition
  const staffRoles = ['inventory_staff', 'marketing_staff', 'delivery_agent', 'DELIVERY_AGENT'];

  // Metrics computation
  const totalStaffCount = usersList.filter((u) => staffRoles.includes(u.role)).length;
  const inventoryStaffCount = usersList.filter((u) => u.role === 'inventory_staff').length;
  const marketingStaffCount = usersList.filter((u) => u.role === 'marketing_staff').length;
  const deliveryAgentCount = usersList.filter((u) => ['delivery_agent', 'DELIVERY_AGENT'].includes(u.role)).length;
  const activeStaffCount = usersList.filter((u) => staffRoles.includes(u.role) && (u.status || 'Active') === 'Active').length;
  const customerCount = usersList.filter((u) => u.role === 'customer').length;

  // Filtered Users List according to current tab and filters
  const filteredUsers = usersList.filter((u) => {
    // 1. Tab level filtering
    if (activeTab === 'staff') {
      if (!staffRoles.includes(u.role)) return false;
    } else if (activeTab === 'customers') {
      if (u.role !== 'customer') return false;
    }

    // 2. Role filter dropdown
    if (roleFilter !== 'all') {
      if (roleFilter === 'delivery_agent') {
        if (!['delivery_agent', 'DELIVERY_AGENT'].includes(u.role)) return false;
      } else if (u.role !== roleFilter) {
        return false;
      }
    }

    // 3. Status filter dropdown
    if (statusFilter !== 'all') {
      if ((u.status || 'Active').toLowerCase() !== statusFilter.toLowerCase()) return false;
    }

    // 4. Search query matching
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const nameMatch = (u.fullName || u.name || '').toLowerCase().includes(q);
      const emailMatch = (u.email || '').toLowerCase().includes(q);
      const phoneMatch = (u.phone || '').includes(q);
      return nameMatch || emailMatch || phoneMatch;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-left">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#0B192C] text-white text-[10px] font-sans font-bold uppercase tracking-wider">
            BrandDNA Platform Administration
          </span>
          <h1 className="font-serif text-3xl font-extrabold text-slate-900 tracking-tight mt-2 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#1E3E62]" />
            Staff & User Account Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create and administer Inventory Staff, Marketing Staff, and Delivery Agent accounts with real-time validation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B192C] hover:bg-[#1E3E62] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Staff Account</span>
          </button>
        </div>
      </div>

      {/* Staff Metrics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Staff</span>
          <span className="text-2xl font-black text-slate-900 mt-0.5 block">{totalStaffCount}</span>
          <span className="text-[10px] text-emerald-600 font-semibold">{activeStaffCount} active</span>
        </div>

        <div className="bg-sky-50/50 rounded-2xl p-4 border border-sky-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800">Inventory Staff</span>
            <Package className="w-4 h-4 text-sky-600" />
          </div>
          <span className="text-2xl font-black text-sky-950 mt-0.5 block">{inventoryStaffCount}</span>
          <span className="text-[10px] text-sky-700 font-medium">Stock & Dispatch</span>
        </div>

        <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-800">Marketing Staff</span>
            <Megaphone className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-black text-purple-950 mt-0.5 block">{marketingStaffCount}</span>
          <span className="text-[10px] text-purple-700 font-medium">Ad & Strategy Studio</span>
        </div>

        <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">Delivery Agents</span>
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-amber-950 mt-0.5 block">{deliveryAgentCount}</span>
          <span className="text-[10px] text-amber-700 font-medium">Field Logistics</span>
        </div>

        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Store Customers</span>
          <span className="text-2xl font-black text-slate-900 mt-0.5 block">{customerCount}</span>
          <span className="text-[10px] text-slate-400 font-medium">Registered buyers</span>
        </div>
      </div>

      {/* Primary Navigation Tabs & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => { setActiveTab('staff'); setRoleFilter('all'); }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-[#0B192C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Staff Accounts ({totalStaffCount})
          </button>
          <button
            onClick={() => { setActiveTab('customers'); setRoleFilter('all'); }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-[#0B192C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Customers ({customerCount})
          </button>
          <button
            onClick={() => { setActiveTab('all'); setRoleFilter('all'); }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#0B192C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Accounts ({usersList.length})
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full bg-stone-50 border border-stone-200 focus:border-[#0B192C] focus:bg-white text-xs text-slate-900 rounded-xl pl-9 pr-3 py-2 outline-none"
            />
          </div>

          {activeTab === 'staff' && (
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto bg-stone-50 border border-stone-200 text-xs text-slate-800 font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
            >
              <option value="all">All Staff Roles</option>
              <option value="inventory_staff">Inventory Staff</option>
              <option value="marketing_staff">Marketing Staff</option>
              <option value="delivery_agent">Delivery Agent</option>
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-stone-50 border border-stone-200 text-xs text-slate-800 font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600">No account records match the selected criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-slate-500 font-mono text-[10px] uppercase bg-stone-50/70">
                  <th className="py-3.5 px-4 font-bold">Account Name & Contact</th>
                  <th className="py-3.5 px-4 font-bold">Assigned Role</th>
                  <th className="py-3.5 px-4 font-bold">Address / Location</th>
                  <th className="py-3.5 px-4 font-bold">Created On</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.map((u) => {
                  const isStaff = staffRoles.includes(u.role);
                  const addrStr = formatAddressDisplay(u.address);
                  const isDeliveryAgent = ['delivery_agent', 'DELIVERY_AGENT'].includes(u.role);

                  return (
                    <tr key={u.id || u._id} className="hover:bg-stone-50/50 transition-colors">
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                            u.role === 'admin'
                              ? 'bg-slate-900'
                              : u.role === 'inventory_staff'
                              ? 'bg-sky-700'
                              : u.role === 'marketing_staff'
                              ? 'bg-purple-700'
                              : isDeliveryAgent
                              ? 'bg-amber-600'
                              : 'bg-emerald-700'
                          }`}>
                            {(u.fullName || u.name || 'U')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <span className="font-bold text-slate-900 block truncate">{u.fullName || u.name}</span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                              <span className="truncate">{u.email}</span>
                              {u.phone && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-700 font-medium">{u.phone}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            u.role === 'admin'
                              ? 'bg-slate-900 text-white border-slate-900'
                              : u.role === 'inventory_staff'
                              ? 'bg-sky-50 text-sky-900 border-sky-300'
                              : u.role === 'marketing_staff'
                              ? 'bg-purple-50 text-purple-900 border-purple-300'
                              : isDeliveryAgent
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                          }`}>
                            {u.role ? u.role.replace('_', ' ') : 'User'}
                          </span>
                          {isDeliveryAgent && u.vehicleNumber && (
                            <span className="text-[10px] font-mono text-slate-500 block">
                              {u.vehicleType || 'Bike'}: {u.vehicleNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Address / Location */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        {addrStr ? (
                          <div className="flex items-start gap-1 text-[11px] text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="truncate" title={addrStr}>{addrStr}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No address on file</span>
                        )}
                      </td>

                      {/* Created On */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {u.date || 'N/A'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          (u.status || 'Active') === 'Active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}>
                          {u.status || 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isStaff && (
                            <button
                              onClick={() => openEditModal(u)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#0B192C] hover:bg-stone-100 transition-colors cursor-pointer"
                              title="Edit Staff Account"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => { setSelectedUser(u); setModalMode('view'); }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0B192C] hover:bg-stone-100 transition-colors cursor-pointer"
                            title="View Account Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(u.id || u._id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title={(u.status || 'Active') === 'Active' ? 'Deactivate Account' : 'Activate Account'}
                          >
                            {(u.status || 'Active') === 'Active' ? (
                              <UserX className="w-4 h-4 text-amber-600" />
                            ) : (
                              <UserCheck className="w-4 h-4 text-emerald-600" />
                            )}
                          </button>

                          {!isStaff && (
                            <button
                              onClick={() => handleExportUserReport(u.id || u._id, u.fullName || u.name)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
                              title="Download PDF Report"
                            >
                              <Download className="w-4 h-4 text-sky-600" />
                            </button>
                          )}

                          <button
                            onClick={() => { setSelectedUser(u); setModalMode('delete'); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT STAFF ACCOUNT MODAL */}
      <AnimatePresence>
        {(modalMode === 'create' || modalMode === 'edit') && (
          <div className="fixed inset-0 z-50 bg-[#0B192C]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white max-w-2xl w-full rounded-3xl border border-stone-200 shadow-2xl overflow-hidden text-left my-8"
            >
              <div className="p-6 bg-[#0B192C] text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-300">
                    {modalMode === 'create' ? 'Admin Action' : 'Modify Credentials'}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-white mt-0.5">
                    {modalMode === 'create' ? 'Create Staff Account' : `Edit Account: ${selectedUser?.fullName || selectedUser?.name}`}
                  </h3>
                </div>
                <button
                  onClick={() => setModalMode(null)}
                  className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleStaffFormSubmit} className="p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto text-xs">
                {/* 1. Basic Account Credentials */}
                <div className="space-y-3">
                  <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-slate-500 border-b border-stone-100 pb-1">
                    Staff Identity & Role
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleFieldChange('fullName', e.target.value)}
                        onBlur={() => handleFieldBlur('fullName')}
                        placeholder="e.g. Anjali Nair"
                        className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 outline-none font-medium transition-all ${
                          fieldErrors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200 focus:border-[#0B192C] focus:bg-white'
                        }`}
                      />
                      {fieldErrors.fullName && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1">{fieldErrors.fullName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        onBlur={() => handleFieldBlur('email')}
                        placeholder="staff@branddna.ai"
                        className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 outline-none font-medium transition-all ${
                          fieldErrors.email ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200 focus:border-[#0B192C] focus:bg-white'
                        }`}
                      />
                      {fieldErrors.email && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1">{fieldErrors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Phone Number with Real-time Validation */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        onBlur={() => handleFieldBlur('phone')}
                        placeholder="e.g. 9876543210 or +919876543210"
                        className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 outline-none font-medium transition-all ${
                          fieldErrors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200 focus:border-[#0B192C] focus:bg-white'
                        }`}
                      />
                      {fieldErrors.phone ? (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1">{fieldErrors.phone}</p>
                      ) : formData.phone && !fieldErrors.phone && touched.phone ? (
                        <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Valid phone format
                        </p>
                      ) : null}
                    </div>

                    {/* Assigned Role */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Assigned Staff Role <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => handleFieldChange('role', e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 text-xs text-slate-900 font-bold rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0B192C] cursor-pointer"
                      >
                        <option value="inventory_staff">Inventory Staff (Stock & Returns)</option>
                        <option value="marketing_staff">Marketing Staff (Campaigns & Tools)</option>
                        <option value="delivery_agent">Delivery Agent (Field Deliveries)</option>
                      </select>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleFieldChange('status', e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 text-xs text-slate-900 font-bold rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0B192C] cursor-pointer"
                      >
                        <option value="Active">Active (Permitted to log in)</option>
                        <option value="Disabled">Disabled (Suspended access)</option>
                      </select>
                    </div>

                    {/* Delivery Agent Vehicle Info */}
                    {formData.role === 'delivery_agent' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Type</label>
                        <select
                          value={formData.vehicleType}
                          onChange={(e) => handleFieldChange('vehicleType', e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 text-xs text-slate-900 font-bold rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0B192C] cursor-pointer"
                        >
                          <option value="Bike">Motorcycle / Bike</option>
                          <option value="Scooter">Scooter</option>
                          <option value="Van">Delivery Van</option>
                          <option value="Truck">Logistics Truck</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {formData.role === 'delivery_agent' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Vehicle Registration Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.vehicleNumber}
                        onChange={(e) => handleFieldChange('vehicleNumber', e.target.value)}
                        onBlur={() => handleFieldBlur('vehicleNumber')}
                        placeholder="e.g. KA-01-AB-1234"
                        className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 outline-none font-medium ${
                          fieldErrors.vehicleNumber ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200 focus:border-[#0B192C]'
                        }`}
                      />
                      {fieldErrors.vehicleNumber && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1">{fieldErrors.vehicleNumber}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Structured Address Fields with Live Validation */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-slate-500 border-b border-stone-100 pb-1">
                    Staff Address & Location Details
                  </h4>

                  {/* Street Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Street / Building / Address Line <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => handleFieldChange('street', e.target.value)}
                      onBlur={() => handleFieldBlur('street')}
                      placeholder="e.g. Flat 402, Green Avenue, Indiranagar"
                      className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 outline-none font-medium transition-all ${
                        fieldErrors.street ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200 focus:border-[#0B192C] focus:bg-white'
                      }`}
                    />
                    {fieldErrors.street && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1">{fieldErrors.street}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* City */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleFieldChange('city', e.target.value)}
                        onBlur={() => handleFieldBlur('city')}
                        placeholder="e.g. Bangalore"
                        className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 outline-none font-medium transition-all ${
                          fieldErrors.city ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200 focus:border-[#0B192C] focus:bg-white'
                        }`}
                      />
                      {fieldErrors.city && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1">{fieldErrors.city}</p>
                      )}
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        State <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleFieldChange('state', e.target.value)}
                        onBlur={() => handleFieldBlur('state')}
                        placeholder="e.g. Karnataka"
                        className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 outline-none font-medium transition-all ${
                          fieldErrors.state ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200 focus:border-[#0B192C] focus:bg-white'
                        }`}
                      />
                      {fieldErrors.state && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1">{fieldErrors.state}</p>
                      )}
                    </div>

                    {/* PIN Code */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        PIN Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={formData.zipCode}
                        onChange={(e) => handleFieldChange('zipCode', e.target.value)}
                        onBlur={() => handleFieldBlur('zipCode')}
                        placeholder="e.g. 560038"
                        className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 outline-none font-medium transition-all ${
                          fieldErrors.zipCode ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200 focus:border-[#0B192C] focus:bg-white'
                        }`}
                      />
                      {fieldErrors.zipCode && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1">{fieldErrors.zipCode}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Password / Authentication */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-slate-500 border-b border-stone-100 pb-1">
                    {modalMode === 'create' ? 'Security Password' : 'Change Password (Optional)'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {modalMode === 'create' ? 'Account Password' : 'New Password (leave blank to keep current)'}
                        {modalMode === 'create' && <span className="text-rose-500"> *</span>}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => handleFieldChange('password', e.target.value)}
                          onBlur={() => handleFieldBlur('password')}
                          placeholder="••••••••"
                          className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 outline-none font-medium pr-10 ${
                            fieldErrors.password ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200 focus:border-[#0B192C]'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1">{fieldErrors.password}</p>
                      )}
                    </div>

                    {modalMode === 'create' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Confirm Password <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                          onBlur={() => handleFieldBlur('confirmPassword')}
                          placeholder="••••••••"
                          className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 outline-none font-medium ${
                            fieldErrors.confirmPassword ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200 focus:border-[#0B192C]'
                          }`}
                        />
                        {fieldErrors.confirmPassword && (
                          <p className="text-[11px] text-rose-600 font-semibold mt-1">{fieldErrors.confirmPassword}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer Controls */}
                <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalMode(null)}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || Object.keys(fieldErrors).length > 0}
                    className="px-6 py-2.5 rounded-xl bg-[#0B192C] hover:bg-[#1E3E62] text-white font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{modalMode === 'create' ? 'Create Staff Account' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW ACCOUNT DETAILS MODAL */}
      <AnimatePresence>
        {modalMode === 'view' && selectedUser && (
          <div className="fixed inset-0 z-50 bg-[#0B192C]/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white max-w-md w-full rounded-3xl border border-stone-200 shadow-2xl overflow-hidden text-left"
            >
              <div className="p-6 bg-[#0B192C] text-white flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-white">User Record Inspector</h3>
                <button
                  onClick={() => setModalMode(null)}
                  className="p-1 rounded-full text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                  <h4 className="font-serif text-lg font-bold text-slate-900">{selectedUser.fullName || selectedUser.name}</h4>
                  <p className="text-slate-500 font-mono text-[11px]">{selectedUser.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                    <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">ROLE</span>
                    <p className="font-bold text-slate-900 mt-0.5 capitalize">{selectedUser.role?.replace('_', ' ')}</p>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                    <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">STATUS</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedUser.status || 'Active'}</p>
                  </div>
                </div>

                {selectedUser.phone && (
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                    <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">PHONE NUMBER</span>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedUser.phone}</p>
                  </div>
                )}

                {selectedUser.address && (
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                    <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">ADDRESS</span>
                    <p className="font-medium text-slate-800 mt-0.5">{formatAddressDisplay(selectedUser.address) || 'N/A'}</p>
                  </div>
                )}

                {selectedUser.vehicleNumber && (
                  <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200">
                    <span className="text-[10px] text-amber-800 font-mono uppercase font-bold">VEHICLE DETAILS</span>
                    <p className="font-bold text-amber-950 mt-0.5">
                      {selectedUser.vehicleType || 'Bike'}: {selectedUser.vehicleNumber}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
                <button
                  onClick={() => setModalMode(null)}
                  className="px-6 py-2.5 rounded-full bg-[#0B192C] text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {modalMode === 'delete' && selectedUser && (
          <div className="fixed inset-0 z-50 bg-[#0B192C]/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-sm w-full rounded-3xl border border-stone-200 shadow-2xl p-6 text-left space-y-4"
            >
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">Delete Account</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Permanently delete account for <strong>{selectedUser.fullName || selectedUser.name}</strong> ({selectedUser.email})? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-slate-700 font-bold text-xs hover:bg-stone-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(selectedUser.id || selectedUser._id)}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer shadow-xs"
                >
                  Delete Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
