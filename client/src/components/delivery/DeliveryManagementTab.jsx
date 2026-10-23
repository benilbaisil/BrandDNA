import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Users,
  Search,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  ArrowRight,
  Package,
  Calendar,
  RotateCcw,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { businessService } from '../../services/businessService';
import { useToast } from '../../context/ToastContext';
import { storageCache } from '../../utils/storageCache';

const DEFAULT_AGENTS = [
  {
    _id: '6ac72fa3971d45fdb5537acf',
    id: '6ac72fa3971d45fdb5537acf',
    fullName: 'tom',
    email: 'tr@branddna.ai',
    phone: '875665676',
    vehicleType: 'Car',
    vehicleNumber: '5y6565',
    status: 'Active',
    availabilityStatus: 'AVAILABLE'
  },
  {
    _id: '6ac4fcb71bf9b385d33b1e99',
    id: '6ac4fcb71bf9b385d33b1e99',
    fullName: 'Rahul Kumar',
    email: 'delivery@branddna.ai',
    phone: '9876543210',
    vehicleType: 'Bike',
    vehicleNumber: 'KL-10-AB-1234',
    status: 'Active',
    availabilityStatus: 'AVAILABLE'
  }
];

export const DeliveryManagementTab = ({ onOrderUpdated }) => {
  const { addToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('assign'); // 'assign', 'active', 'history', 'agents'

  // Data States - Initialized immediately from cache for 0ms delay
  const [agents, setAgents] = useState(() => storageCache.get('delivery_agents', DEFAULT_AGENTS));
  const [orders, setOrders] = useState(() => storageCache.get('all_orders', []));
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Assign Delivery State: map of orderId -> selected agentId
  const [selectedAgentForOrder, setSelectedAgentForOrder] = useState({});
  const [assigningOrderId, setAssigningOrderId] = useState(null);

  // Live Tracking Modal State
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [loadingTracking, setLoadingTracking] = useState(false);

  const fetchDeliveryData = async () => {
    try {
      const [agentsRes, ordersRes] = await Promise.all([
        deliveryService.getDeliveryAgents(),
        businessService.getOrders(),
      ]);

      if (agentsRes?.success) {
        const rawAgents = agentsRes?.data?.agents || (Array.isArray(agentsRes?.data) ? agentsRes.data : []);
        // Strictly filter to ensure ONLY Tom and Rahul are available
        const onlyTomAndRahul = rawAgents.filter((a) => {
          const name = (a.fullName || '').toLowerCase();
          return name.includes('tom') || name.includes('rahul');
        });
        const finalFleet = onlyTomAndRahul.length > 0 ? onlyTomAndRahul : DEFAULT_AGENTS;
        setAgents(finalFleet);
        storageCache.set('delivery_agents', finalFleet);
      }

      const fetchedOrders = ordersRes?.data?.orders || (Array.isArray(ordersRes?.data) ? ordersRes.data : []);
      if (fetchedOrders.length > 0) {
        setOrders(fetchedOrders);
        storageCache.set('all_orders', fetchedOrders);
      }
    } catch (err) {
      console.warn('Silent revalidation error in delivery management:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  // Filtered Orders for Assignment (Packed, Ready for Pickup, Placed, Confirmed, Delivery Failed)
  const assignableOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return orders.filter((o) => {
      const matchQuery =
        !q ||
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customer?.fullName?.toLowerCase().includes(q) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
        o.shippingAddress?.city?.toLowerCase().includes(q);
      const isUnassignedOrFailed =
        !o.deliveryAgent ||
        ['Placed', 'Confirmed', 'Packed', 'Ready for Pickup', 'Delivery Failed', 'DELIVERY_FAILED'].includes(
          o.status
        );
      const notCompleted = !['Delivered', 'Cancelled', 'DELIVERED'].includes(o.status);
      return matchQuery && isUnassignedOrFailed && notCompleted;
    });
  }, [orders, searchTerm]);

  // Active Deliveries (Assigned to Agent, Accepted, Picked Up, Out for Delivery)
  const activeDeliveries = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return orders.filter((o) => {
      const matchQuery =
        !q ||
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customer?.fullName?.toLowerCase().includes(q) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
        o.deliveryAgent?.fullName?.toLowerCase().includes(q);
      const isActive = [
        'Assigned to Agent',
        'Accepted',
        'ACCEPTED',
        'Picked Up',
        'Out for Delivery',
        'ASSIGNED_TO_AGENT',
        'PICKED_UP',
        'OUT_FOR_DELIVERY',
      ].includes(o.status);
      return matchQuery && isActive;
    });
  }, [orders, searchTerm]);

  // Delivery History (Delivered & Delivery Failed & Cancelled)
  const historyDeliveries = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return orders.filter((o) => {
      const matchQuery =
        !q ||
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customer?.fullName?.toLowerCase().includes(q) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
        o.deliveryAgent?.fullName?.toLowerCase().includes(q);
      const isHistory = ['Delivered', 'Delivery Failed', 'DELIVERED', 'DELIVERY_FAILED', 'Cancelled'].includes(o.status);
      return matchQuery && isHistory;
    });
  }, [orders, searchTerm]);

  // Active agents only for selection
  const activeAgentsList = useMemo(() => {
    return agents.filter((a) => a.status === 'Active');
  }, [agents]);

  // Handle Assigning an Agent to an Order
  const handleAssignAgent = async (orderId) => {
    const agentId = selectedAgentForOrder[orderId];
    if (!agentId) {
      addToast('Please select an active delivery agent first', 'error');
      return;
    }

    setAssigningOrderId(orderId);
    try {
      const res = await deliveryService.assignDeliveryAgent(orderId, agentId);
      if (res?.success) {
        addToast('Order assigned to delivery agent successfully!', 'success');
        await fetchDeliveryData();
        if (onOrderUpdated) onOrderUpdated();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to assign agent', 'error');
    } finally {
      setAssigningOrderId(null);
    }
  };

  // Handle Reassigning an Order
  const handleReassignAgent = async (orderId, targetAgentId = null) => {
    setAssigningOrderId(orderId);
    try {
      const res = await deliveryService.reassignDeliveryAgent(orderId, targetAgentId);
      if (res?.success) {
        addToast(targetAgentId ? 'Order reassigned to agent!' : 'Order reset to Ready for Pickup', 'success');
        await fetchDeliveryData();
        if (onOrderUpdated) onOrderUpdated();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to reassign agent', 'error');
    } finally {
      setAssigningOrderId(null);
    }
  };

  // Open Live Delivery Tracking Modal
  const openTrackingModal = async (order) => {
    setTrackingModalOrder(order);
    setLoadingTracking(true);
    try {
      const res = await deliveryService.getDeliveryTracking(order._id);
      if (res?.success && res?.data) {
        setTrackingData(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch live tracking details', 'error');
    } finally {
      setLoadingTracking(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Controls & Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('assign')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'assign'
                ? 'bg-[#0F291E] text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-slate-700'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Ready for Dispatch ({assignableOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'active'
                ? 'bg-sky-800 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-slate-700'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Active Deliveries ({activeDeliveries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'history'
                ? 'bg-purple-800 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Delivery History ({historyDeliveries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('agents')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'agents'
                ? 'bg-[#1E3E62] text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Delivery Fleet ({agents.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search orders, agent..."
              className="w-full bg-stone-50 border border-stone-200 focus:border-[#0F291E] focus:bg-white text-xs text-slate-900 rounded-xl pl-8 pr-3 py-2 outline-none font-medium"
            />
          </div>

          <button
            type="button"
            onClick={fetchDeliveryData}
            disabled={refreshing}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-200 transition-all cursor-pointer shrink-0"
            title="Refresh Orders & Agent Status"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: READY FOR DISPATCH & ASSIGN */}
      {activeSubTab === 'assign' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <p>Assign orders ready for dispatch to active Delivery Agents. Dispatched status synchronizes automatically across platforms.</p>
            <span className="font-mono font-bold text-slate-700 bg-stone-100 px-2.5 py-1 rounded-lg shrink-0">
              {activeAgentsList.length} Active Agent{activeAgentsList.length !== 1 ? 's' : ''} Available
            </span>
          </div>

          {assignableOrders.length === 0 ? (
            <div className="p-12 text-center bg-stone-50 rounded-2xl text-slate-500 space-y-2 border border-stone-200/80">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-800">No orders currently awaiting delivery assignment.</p>
              <p className="text-xs text-slate-400">Orders placed or packed will appear here for agent assignment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-2xl border border-stone-200 shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-slate-500 font-mono text-[10px] uppercase font-bold">
                    <th className="p-3.5">Order ID & Date</th>
                    <th className="p-3.5">Customer & Delivery Destination</th>
                    <th className="p-3.5">Order Value</th>
                    <th className="p-3.5">Current Status</th>
                    <th className="p-3.5">Assign Delivery Agent</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {assignableOrders.map((ord) => {
                    const isAssigning = assigningOrderId === ord._id;

                    return (
                      <tr key={ord._id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-3.5">
                          <span className="font-mono font-extrabold text-slate-900 block text-xs">
                            {ord.orderNumber || ord._id}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <p className="font-bold text-slate-900">
                            {ord.customer?.fullName || ord.shippingAddress?.fullName || 'Customer'}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-xs">
                              {ord.shippingAddress?.street}, {ord.shippingAddress?.city} ({ord.shippingAddress?.zipCode})
                            </span>
                          </p>
                        </td>

                        <td className="p-3.5">
                          <span className="font-extrabold text-slate-900 block">
                            ₹{ord.totalAmount?.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {ord.items?.length || 0} items
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                              ord.status === 'Delivery Failed' || ord.status === 'DELIVERY_FAILED'
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            {ord.status}
                          </span>
                          {ord.deliveryFailureReason && (
                            <p className="text-[10px] text-rose-600 mt-1 font-semibold truncate max-w-xs" title={ord.deliveryFailureReason}>
                              Reason: {ord.deliveryFailureReason}
                            </p>
                          )}
                        </td>

                        <td className="p-3.5 min-w-[220px]">
                          <select
                            value={selectedAgentForOrder[ord._id] || ''}
                            onChange={(e) =>
                              setSelectedAgentForOrder((prev) => ({
                                ...prev,
                                [ord._id]: e.target.value,
                              }))
                            }
                            className="w-full bg-stone-50 border border-stone-200 text-xs text-slate-900 font-bold rounded-xl px-3 py-2 outline-none focus:border-[#0F291E] cursor-pointer"
                          >
                            <option value="">-- Select Active Delivery Agent --</option>
                            {activeAgentsList.map((a) => (
                              <option key={a._id || a.id} value={a._id || a.id}>
                                {a.fullName} ({a.vehicleType || 'Bike'} • {a.phone || 'No phone'})
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="p-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleAssignAgent(ord._id)}
                            disabled={!selectedAgentForOrder[ord._id] || isAssigning}
                            className="px-3.5 py-2 rounded-xl bg-[#0F291E] hover:bg-[#1E3E62] text-white font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                          >
                            {isAssigning ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <span>Assign Agent</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: ACTIVE DELIVERIES */}
      {activeSubTab === 'active' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <p>Real-time delivery progress monitoring. Track agent acceptance, order pickup, and transit to customer.</p>
            <span className="font-mono font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg shrink-0 border border-sky-200">
              {activeDeliveries.length} Live Order{activeDeliveries.length !== 1 ? 's' : ''} in Transit
            </span>
          </div>

          {activeDeliveries.length === 0 ? (
            <div className="p-12 text-center bg-stone-50 rounded-2xl text-slate-500 space-y-2 border border-stone-200/80">
              <Truck className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-800">No deliveries currently in active transit.</p>
              <p className="text-xs text-slate-400">Assigned deliveries will appear here until OTP confirmation is complete.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDeliveries.map((ord) => (
                <div
                  key={ord._id}
                  className="p-5 bg-white border border-stone-200 rounded-3xl shadow-2xs space-y-3.5 hover:border-stone-300 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div>
                      <span className="font-mono font-extrabold text-slate-900 text-sm block">
                        {ord.orderNumber || ord._id}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Assigned on {ord.assignedAt ? new Date(ord.assignedAt).toLocaleString() : 'Recently'}
                      </span>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-50 text-sky-900 border border-sky-300">
                      {ord.status}
                    </span>
                  </div>

                  {/* Assigned Agent Details */}
                  <div className="p-3 bg-sky-50/40 rounded-2xl border border-sky-200/70 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-sky-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {(ord.deliveryAgent?.fullName || 'D')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{ord.deliveryAgent?.fullName || 'Delivery Agent'}</p>
                        <p className="text-[10px] text-slate-500">
                          {ord.deliveryAgent?.vehicleType || 'Bike'} • {ord.deliveryAgent?.vehicleNumber || 'Vehicle Active'}
                        </p>
                      </div>
                    </div>

                    {ord.deliveryAgent?.phone && (
                      <a
                        href={`tel:${ord.deliveryAgent.phone}`}
                        className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-800 font-bold rounded-xl border border-sky-200 flex items-center gap-1 text-[11px]"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call Agent</span>
                      </a>
                    )}
                  </div>

                  {/* Customer & Location */}
                  <div className="text-xs space-y-1 text-slate-600 bg-stone-50/70 p-3 rounded-2xl border border-stone-200/60">
                    <p className="font-bold text-slate-900">
                      To: {ord.customer?.fullName || ord.shippingAddress?.fullName}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{ord.shippingAddress?.street}, {ord.shippingAddress?.city} ({ord.shippingAddress?.zipCode})</span>
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                    <button
                      type="button"
                      onClick={() => openTrackingModal(ord)}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Live Timeline</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReassignAgent(ord._id, null)}
                      className="text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors cursor-pointer"
                    >
                      Reassign / Reset
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: DELIVERY HISTORY */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <p>Audit log of past deliveries. Verify completed customer handoffs and inspect delivery failure notes.</p>
            <span className="font-mono font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg shrink-0 border border-purple-200">
              {historyDeliveries.length} Completed / Logged Orders
            </span>
          </div>

          {historyDeliveries.length === 0 ? (
            <div className="p-12 text-center bg-stone-50 rounded-2xl text-slate-500 space-y-2 border border-stone-200/80">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-800">No past delivery records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-2xl border border-stone-200 shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-slate-500 font-mono text-[10px] uppercase font-bold">
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Customer & City</th>
                    <th className="p-3.5">Delivered By</th>
                    <th className="p-3.5">Outcome & Status</th>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {historyDeliveries.map((ord) => {
                    const isDelivered = ['Delivered', 'DELIVERED'].includes(ord.status);

                    return (
                      <tr key={ord._id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-slate-900">
                          {ord.orderNumber || ord._id}
                        </td>

                        <td className="p-3.5">
                          <p className="font-bold text-slate-900">{ord.customer?.fullName || ord.shippingAddress?.fullName}</p>
                          <p className="text-[11px] text-slate-500">{ord.shippingAddress?.city}</p>
                        </td>

                        <td className="p-3.5">
                          <span className="font-semibold text-slate-800">
                            {ord.deliveryAgent?.fullName || 'Agent Not Recorded'}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                              isDelivered
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            {ord.status}
                          </span>
                          {ord.deliveryFailureReason && (
                            <p className="text-[10px] text-rose-600 mt-0.5 font-medium">
                              Note: {ord.deliveryFailureReason}
                            </p>
                          )}
                        </td>

                        <td className="p-3.5 text-[11px] font-mono text-slate-500 whitespace-nowrap">
                          {ord.deliveredAt ? new Date(ord.deliveredAt).toLocaleString() : new Date(ord.updatedAt).toLocaleString()}
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => openTrackingModal(ord)}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold rounded-lg text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Timeline</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: DELIVERY AGENTS FLEET */}
      {activeSubTab === 'agents' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <p>Active and assigned delivery agents available for dispatch. Accounts are created and administered by Admin.</p>
            <span className="font-mono font-bold text-slate-700 bg-stone-100 px-2.5 py-1 rounded-lg shrink-0">
              {agents.length} Total Registered Agents
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <div
                key={agent._id || agent.id}
                className="p-5 bg-white border border-stone-200 rounded-3xl shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#1E3E62] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {(agent.fullName || 'D')[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{agent.fullName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{agent.email}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      agent.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    {agent.status || 'Active'}
                  </span>
                </div>

                <div className="text-xs space-y-1 bg-stone-50/70 p-3 rounded-2xl border border-stone-200/60 font-medium text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Phone:</span>
                    <span className="font-mono">{agent.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Vehicle:</span>
                    <span>{agent.vehicleType || 'Bike'} ({agent.vehicleNumber || 'Standard'})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Availability:</span>
                    <span className="text-emerald-700 font-bold">{agent.availabilityStatus || 'Available'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIVE DELIVERY TRACKING TIMELINE MODAL */}
      <AnimatePresence>
        {trackingModalOrder && (
          <div className="fixed inset-0 z-50 bg-[#0B192C]/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-lg w-full rounded-3xl border border-stone-200 shadow-2xl overflow-hidden text-left"
            >
              <div className="p-5 bg-[#0B192C] text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-sky-300 uppercase tracking-wider">
                    Order Tracking Timeline
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white mt-0.5">
                    Order #{trackingModalOrder.orderNumber || trackingModalOrder._id}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="p-1 rounded-full text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                {/* Customer & Status Header */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Customer Destination</span>
                    <strong className="text-slate-900 block">{trackingModalOrder.customer?.fullName || trackingModalOrder.shippingAddress?.fullName}</strong>
                    <span className="text-[11px] text-slate-500">{trackingModalOrder.shippingAddress?.city}, {trackingModalOrder.shippingAddress?.zipCode}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-sky-50 text-sky-900 border border-sky-300">
                    {trackingModalOrder.status}
                  </span>
                </div>

                {/* Timeline Events */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-slate-500">
                    Carrier & Agent Milestones
                  </h4>

                  {loadingTracking ? (
                    <div className="p-8 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto text-slate-400" />
                      <p className="mt-2 text-xs">Loading tracking audit events...</p>
                    </div>
                  ) : trackingData?.trackingEvents?.length > 0 ? (
                    <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 pl-6">
                      {trackingData.trackingEvents.map((ev, i) => (
                        <div key={i} className="relative space-y-0.5">
                          <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 text-xs">{ev.statusText || ev.status}</span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600">{ev.description}</p>
                          {ev.location && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {ev.location}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 bg-stone-50 rounded-2xl">
                      No discrete timeline events logged for this order yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="px-5 py-2 rounded-xl bg-[#0B192C] text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
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
