import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Users,
  Plus,
  Search,
  UserCheck,
  UserX,
  Edit,
  Eye,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldAlert,
  ArrowRight,
  Package,
  Calendar,
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { businessService } from '../../services/businessService';
import { useToast } from '../../context/ToastContext';

export const AdminDeliveryManagementPage = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('agents'); // 'agents', 'assign', 'active', 'history'

  // Data States
  const [agents, setAgents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedAgentDetails, setSelectedAgentDetails] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    vehicleNumber: '',
    vehicleType: 'Bike',
    status: 'Active',
  });

  // Assign Delivery State
  const [selectedAgentForOrder, setSelectedAgentForOrder] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [agentsRes, ordersRes] = await Promise.all([
        deliveryService.getDeliveryAgents(),
        businessService.getOrders(),
      ]);

      if (agentsRes?.success && agentsRes?.data?.agents) {
        setAgents(agentsRes.data.agents);
      }

      if (ordersRes?.success && ordersRes?.data?.orders) {
        setOrders(ordersRes.data.orders);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load delivery management data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Delivery Agents
  const filteredAgents = agents.filter((a) => {
    const q = searchTerm.toLowerCase();
    const matchQuery =
      a.fullName?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.phone?.includes(q) ||
      a.vehicleNumber?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchQuery && matchStatus;
  });

  // Filtered Orders for Assignment (Packed, Ready for Pickup, Placed, Confirmed, Delivery Failed)
  const assignableOrders = orders.filter((o) => {
    const q = searchTerm.toLowerCase();
    const matchQuery =
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customer?.fullName?.toLowerCase().includes(q) ||
      o.shippingAddress?.city?.toLowerCase().includes(q);
    const isUnassignedOrFailed =
      !o.deliveryAgent ||
      ['Placed', 'Confirmed', 'Packed', 'Ready for Pickup', 'Delivery Failed', 'DELIVERY_FAILED'].includes(
        o.status
      );
    const notCompleted = !['Delivered', 'Cancelled', 'DELIVERED'].includes(o.status);
    return matchQuery && isUnassignedOrFailed && notCompleted;
  });

  // Active Deliveries (Assigned, Accepted, Picked Up, Out for Delivery)
  const activeDeliveries = orders.filter((o) => {
    const q = searchTerm.toLowerCase();
    const matchQuery =
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customer?.fullName?.toLowerCase().includes(q) ||
      o.deliveryAgent?.fullName?.toLowerCase().includes(q);
    const isActive = [
      'Assigned to Agent',
      'ACCEPTED',
      'Picked Up',
      'Out for Delivery',
      'ASSIGNED_TO_AGENT',
      'PICKED_UP',
      'OUT_FOR_DELIVERY',
    ].includes(o.status);
    return matchQuery && isActive;
  });

  // Delivery History (Delivered & Delivery Failed)
  const historyDeliveries = orders.filter((o) => {
    const q = searchTerm.toLowerCase();
    const matchQuery =
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customer?.fullName?.toLowerCase().includes(q) ||
      o.deliveryAgent?.fullName?.toLowerCase().includes(q);
    const isHistory = ['Delivered', 'Delivery Failed', 'DELIVERED', 'DELIVERY_FAILED'].includes(o.status);
    return matchQuery && isHistory;
  });

  // Active agents only for selection
  const activeAgentsList = agents.filter((a) => a.status === 'Active');

  // Handle Form Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Create Delivery Agent
  const handleCreateAgent = async (e) => {
    e.preventDefault();
    try {
      const res = await deliveryService.createDeliveryAgent(formData);
      if (res?.success) {
        addToast(`Delivery Agent ${formData.fullName} created successfully!`, 'success');
        setShowAddModal(false);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          password: '',
          vehicleNumber: '',
          vehicleType: 'Bike',
          status: 'Active',
        });
        fetchData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to create delivery agent', 'error');
    }
  };

  // Open Edit Agent
  const handleOpenEdit = (agent) => {
    setSelectedAgent(agent);
    setFormData({
      fullName: agent.fullName || '',
      email: agent.email || '',
      phone: agent.phone || '',
      password: '', // Leave empty unless changing
      vehicleNumber: agent.vehicleNumber || '',
      vehicleType: agent.vehicleType || 'Bike',
      status: agent.status || 'Active',
    });
    setShowEditModal(true);
  };

  // Update Delivery Agent
  const handleUpdateAgent = async (e) => {
    e.preventDefault();
    try {
      const res = await deliveryService.updateDeliveryAgent(selectedAgent._id || selectedAgent.id, formData);
      if (res?.success) {
        addToast(`Delivery Agent ${formData.fullName} updated!`, 'success');
        setShowEditModal(false);
        setSelectedAgent(null);
        fetchData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to update agent', 'error');
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (agentId) => {
    try {
      const res = await deliveryService.toggleDeliveryAgentStatus(agentId);
      if (res?.success) {
        addToast(`Agent status updated to ${res.data.status}`, 'success');
        fetchData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  // View Agent Details
  const handleViewDetails = async (agent) => {
    try {
      const res = await deliveryService.getDeliveryAgentById(agent._id || agent.id);
      if (res?.success && res?.data) {
        setSelectedAgentDetails(res.data);
        setShowDetailsModal(true);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch agent details', 'error');
    }
  };

  // Assign Agent to Order
  const handleAssignAgent = async (orderId) => {
    const agentId = selectedAgentForOrder[orderId];
    if (!agentId) {
      addToast('Please select an active delivery agent first', 'error');
      return;
    }

    try {
      const res = await deliveryService.assignDeliveryAgent(orderId, agentId);
      if (res?.success) {
        addToast(`Order assigned to delivery agent successfully!`, 'success');
        fetchData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to assign agent', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#D6E6EC] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#0F291E] text-white text-[10px] font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <Truck className="w-3.5 h-3.5" /> Delivery Operations & Fleet Management
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#0F291E] tracking-tight mt-2">
            Delivery Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage delivery agent accounts, assign ready orders, monitor live dispatch, and audit delivery history.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#D6E6EC] bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setFormData({
                fullName: '',
                email: '',
                phone: '',
                password: '',
                vehicleNumber: '',
                vehicleType: 'Bike',
                status: 'Active',
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F291E] text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add Delivery Agent</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D6E6EC] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'agents'
              ? 'bg-[#0F291E] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-[#EAF4F7]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Delivery Agents ({agents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assign')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'assign'
              ? 'bg-[#0F291E] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-[#EAF4F7]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Assign Deliveries ({assignableOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'active'
              ? 'bg-[#0F291E] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-[#EAF4F7]'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Active Deliveries ({activeDeliveries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#0F291E] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-[#EAF4F7]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Delivery History ({historyDeliveries.length})</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl glass-panel border border-[#D6E6EC] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search agents, order ID, customer name, vehicle..."
            className="w-full bg-[#FAF8F5]/40 border border-[#D6E6EC] focus:border-slate-900 text-xs text-[#0F291E] placeholder-slate-400 rounded-xl pl-9 pr-4 py-2.5 outline-none font-medium transition-all"
          />
        </div>

        {activeTab === 'agents' && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF8F5]/40 border border-[#D6E6EC] text-xs text-[#0F291E] font-bold rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
            >
              <option value="ALL">All Agent Statuses</option>
              <option value="Active">Active Agents</option>
              <option value="Disabled">Inactive / Disabled Agents</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: DELIVERY AGENTS DIRECTORY */}
      {activeTab === 'agents' && (
        <div className="glass-panel rounded-3xl border border-[#D6E6EC] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#D6E6EC] text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Agent Name</th>
                  <th className="p-4">Contact Details</th>
                  <th className="p-4">Vehicle Info</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Active Deliveries</th>
                  <th className="p-4">Completed</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6E6EC] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400 font-semibold">
                      Loading delivery agents...
                    </td>
                  </tr>
                ) : filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400 font-semibold">
                      No delivery agents found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => (
                    <tr key={agent._id || agent.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                            {agent.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{agent.fullName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{agent.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-600">
                        <p className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {agent.phone || 'N/A'}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-mono font-bold text-slate-800">
                          <span>{agent.vehicleType || 'Bike'}</span>
                          <span className="text-slate-400">•</span>
                          <span>{agent.vehicleNumber || 'KL-10-1234'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                            agent.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              agent.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {agent.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-slate-900">
                        <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-mono text-xs border border-amber-200">
                          {agent.activeDeliveries || 0} active
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-slate-900">
                        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-mono text-xs border border-emerald-200">
                          {agent.completedDeliveries || 0} done
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(agent)}
                            title="View Agent Deliveries & History"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(agent)}
                            title="Edit Agent Details"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(agent._id || agent.id)}
                            title={agent.status === 'Active' ? 'Deactivate Agent' : 'Activate Agent'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              agent.status === 'Active'
                                ? 'text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {agent.status === 'Active' ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGN DELIVERIES */}
      {activeTab === 'assign' && (
        <div className="glass-panel rounded-3xl border border-[#D6E6EC] shadow-2xs overflow-hidden">
          <div className="p-4 bg-[#FAF8F5] border-b border-[#D6E6EC] flex items-center justify-between">
            <h2 className="font-serif font-bold text-lg text-slate-900">Orders Awaiting Delivery Assignment</h2>
            <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
              {assignableOrders.length} Orders Ready
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#D6E6EC] text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer & Location</th>
                  <th className="p-4">Items & Amount</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4">Select Active Agent</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6E6EC] text-xs">
                {assignableOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400 font-semibold">
                      No orders currently ready for delivery assignment.
                    </td>
                  </tr>
                ) : (
                  assignableOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-900 text-sm block">
                          {ord.orderNumber || ord._id}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{ord.customer?.fullName || ord.shippingAddress?.fullName}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {ord.shippingAddress?.street}, {ord.shippingAddress?.city} ({ord.shippingAddress?.zipCode})
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">₹{ord.totalAmount?.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{ord.items?.length || 0} items</p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ord.status === 'Delivery Failed' || ord.status === 'DELIVERY_FAILED'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {ord.status}
                        </span>
                        {ord.deliveryFailureReason && (
                          <p className="text-[10px] text-rose-600 mt-1 font-medium">
                            Reason: {ord.deliveryFailureReason}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <select
                          value={selectedAgentForOrder[ord._id] || ''}
                          onChange={(e) =>
                            setSelectedAgentForOrder((prev) => ({
                              ...prev,
                              [ord._id]: e.target.value,
                            }))
                          }
                          className="w-full bg-white border border-[#D6E6EC] text-xs text-slate-900 font-bold rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-slate-900"
                        >
                          <option value="">-- Select Active Delivery Agent --</option>
                          {activeAgentsList.map((a) => (
                            <option key={a._id || a.id} value={a._id || a.id}>
                              {a.fullName} ({a.vehicleType || 'Bike'} - {a.vehicleNumber || 'KL-10-AB-1234'})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleAssignAgent(ord._id)}
                          disabled={!selectedAgentForOrder[ord._id]}
                          className="px-4 py-2 rounded-xl bg-[#0F291E] text-white font-bold text-xs hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <span>Assign Agent</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVE DELIVERIES */}
      {activeTab === 'active' && (
        <div className="glass-panel rounded-3xl border border-[#D6E6EC] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#D6E6EC] text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Assigned Agent</th>
                  <th className="p-4">Current Delivery Status</th>
                  <th className="p-4">Assigned Date</th>
                  <th className="p-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6E6EC] text-xs">
                {activeDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400 font-semibold">
                      No active deliveries currently in progress.
                    </td>
                  </tr>
                ) : (
                  activeDeliveries.map((ord) => (
                    <tr key={ord._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {ord.orderNumber || ord._id}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{ord.customer?.fullName}</p>
                        <p className="text-[10px] text-slate-500">{ord.shippingAddress?.city}</p>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-emerald-700" />
                          <span>{ord.deliveryAgent?.fullName || 'Assigned Agent'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-mono">
                        {ord.assignedAt ? new Date(ord.assignedAt).toLocaleString() : 'Recently'}
                      </td>
                      <td className="p-4 font-extrabold text-slate-900">
                        ₹{ord.totalAmount?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DELIVERY HISTORY */}
      {activeTab === 'history' && (
        <div className="glass-panel rounded-3xl border border-[#D6E6EC] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#D6E6EC] text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Delivery Agent</th>
                  <th className="p-4">Final Outcome</th>
                  <th className="p-4">Completed / Failed At</th>
                  <th className="p-4">Notes / Failure Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6E6EC] text-xs">
                {historyDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400 font-semibold">
                      No delivery history records available.
                    </td>
                  </tr>
                ) : (
                  historyDeliveries.map((ord) => (
                    <tr key={ord._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {ord.orderNumber || ord._id}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{ord.customer?.fullName}</p>
                        <p className="text-[10px] text-slate-500">{ord.shippingAddress?.city}</p>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        {ord.deliveryAgent?.fullName || 'Delivery Agent'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ord.status === 'Delivered' || ord.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-500">
                        {ord.deliveredAt
                          ? new Date(ord.deliveredAt).toLocaleString()
                          : ord.failedAt
                          ? new Date(ord.failedAt).toLocaleString()
                          : 'N/A'}
                      </td>
                      <td className="p-4 text-slate-700">
                        {ord.deliveryFailureReason ? (
                          <span className="text-rose-600 font-bold">{ord.deliveryFailureReason}</span>
                        ) : (
                          <span className="text-emerald-700 font-bold">Successfully Verified & Delivered</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD DELIVERY AGENT */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-[#D6E6EC] shadow-xl w-full max-w-lg p-6 space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-[#D6E6EC] pb-4">
                <h3 className="font-serif font-bold text-xl text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-700" /> Create Delivery Agent Account
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAgent} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Rahul Kumar"
                    className="w-full bg-[#FAF8F5]/40 border border-[#D6E6EC] focus:border-slate-900 rounded-xl p-2.5 outline-none font-medium text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="rahul@example.com"
                      className="w-full bg-[#FAF8F5]/40 border border-[#D6E6EC] focus:border-slate-900 rounded-xl p-2.5 outline-none font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                      className="w-full bg-[#FAF8F5]/40 border border-[#D6E6EC] focus:border-slate-900 rounded-xl p-2.5 outline-none font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Temporary Password *</label>
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full bg-[#FAF8F5]/40 border border-[#D6E6EC] focus:border-slate-900 rounded-xl p-2.5 outline-none font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      className="w-full bg-[#FAF8F5]/40 border border-[#D6E6EC] focus:border-slate-900 rounded-xl p-2.5 outline-none font-bold text-slate-900 cursor-pointer"
                    >
                      <option value="Bike">Motorbike / Scooter</option>
                      <option value="Van">Delivery Van</option>
                      <option value="Car">Car</option>
                      <option value="Bicycle">Bicycle</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vehicle Registration Number</label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleInputChange}
                    placeholder="KL-10-AB-1234"
                    className="w-full bg-[#FAF8F5]/40 border border-[#D6E6EC] focus:border-slate-900 rounded-xl p-2.5 outline-none font-medium text-slate-900"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#D6E6EC]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#D6E6EC] text-slate-600 font-bold hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0F291E] text-white font-bold hover:bg-slate-800 transition-all shadow-2xs cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT DELIVERY AGENT */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-[#D6E6EC] shadow-xl w-full max-w-lg p-6 space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-[#D6E6EC] pb-4">
                <h3 className="font-serif font-bold text-xl text-slate-900">Edit Delivery Agent</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateAgent} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-[#FAF8F5]/40 border border-[#D6E6EC] focus:border-slate-900 rounded-xl p-2.5 outline-none font-medium text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-[#FAF8F5]/40 border border-[#D6E6EC] focus:border-slate-900 rounded-xl p-2.5 outline-none font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-[#FAF8F5]/40 border border-[#D6E6EC] focus:border-slate-900 rounded-xl p-2.5 outline-none font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      className="w-full bg-[#FAF8F5]/40 border border-[#D6E6EC] focus:border-slate-900 rounded-xl p-2.5 outline-none font-bold text-slate-900 cursor-pointer"
                    >
                      <option value="Bike">Motorbike / Scooter</option>
                      <option value="Van">Delivery Van</option>
                      <option value="Car">Car</option>
                      <option value="Bicycle">Bicycle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-[#FAF8F5]/40 border border-[#D6E6EC] focus:border-slate-900 rounded-xl p-2.5 outline-none font-bold text-slate-900 cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Disabled">Disabled / Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vehicle Registration Number</label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleInputChange}
                    className="w-full bg-[#FAF8F5]/40 border border-[#D6E6EC] focus:border-slate-900 rounded-xl p-2.5 outline-none font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    New Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full bg-[#FAF8F5]/40 border border-[#D6E6EC] focus:border-slate-900 rounded-xl p-2.5 outline-none font-medium text-slate-900"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#D6E6EC]">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#D6E6EC] text-slate-600 font-bold hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0F291E] text-white font-bold hover:bg-slate-800 transition-all shadow-2xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: VIEW AGENT DETAILS & DELIVERIES */}
      <AnimatePresence>
        {showDetailsModal && selectedAgentDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-[#D6E6EC] shadow-xl w-full max-w-2xl p-6 space-y-6 text-left max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#D6E6EC] pb-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-slate-900">
                    {selectedAgentDetails.agent?.fullName}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedAgentDetails.agent?.email}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Agent Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#D6E6EC]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vehicle</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedAgentDetails.agent?.vehicleType} ({selectedAgentDetails.agent?.vehicleNumber})
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#D6E6EC]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedAgentDetails.agent?.phone || 'N/A'}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#D6E6EC]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                  <span className="font-bold text-emerald-700 text-sm">{selectedAgentDetails.agent?.status}</span>
                </div>
              </div>

              {/* Assigned Deliveries List */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-base text-slate-900">
                  Assigned Deliveries ({selectedAgentDetails.orders?.length || 0})
                </h4>

                {selectedAgentDetails.orders?.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    No deliveries currently assigned to this agent.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedAgentDetails.orders?.map((ord) => (
                      <div
                        key={ord._id}
                        className="p-3.5 rounded-2xl border border-[#D6E6EC] bg-white flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-mono font-bold text-slate-900">{ord.orderNumber || ord._id}</p>
                          <p className="text-[11px] text-slate-500">{ord.customer?.fullName} • {ord.shippingAddress?.city}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                            {ord.status}
                          </span>
                          <p className="font-bold text-slate-900 mt-0.5">₹{ord.totalAmount?.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
