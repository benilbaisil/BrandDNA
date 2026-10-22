import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Package,
  MapPin,
  Phone,
  User,
  LogOut,
  RefreshCw,
  X,
  ShieldCheck,
  KeyRound,
  FileText,
  ChevronRight,
  ArrowRight,
  Check,
  Navigation,
  Bell,
  Award,
  TrendingUp,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { storageCache } from '../../utils/storageCache';

const DEFAULT_AGENT_STATS = {
  todaysDeliveries: 0,
  pendingDeliveries: 0,
  deliveredToday: 0,
  totalDelivered: 0,
  failedDeliveries: 0,
  completionRate: 100,
  availabilityStatus: 'Available',
};

export const DeliveryDashboardPage = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned', 'history', 'profile'
  const [loading, setLoading] = useState(false);

  // Stats & Data - Initialized immediately from cache for 0ms delay
  const [stats, setStats] = useState(() => storageCache.get('agent_stats', DEFAULT_AGENT_STATS));
  const [assignedOrders, setAssignedOrders] = useState(() => storageCache.get('agent_assigned_orders', []));
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [orderDetailsHistory, setOrderDetailsHistory] = useState([]);

  // Form Inputs
  const [otpInput, setOtpInput] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [failureReason, setFailureReason] = useState('Customer unavailable');
  const [failureNote, setFailureNote] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchAgentData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        deliveryService.getAgentStats(),
        deliveryService.getAssignedOrders(statusFilter),
      ]);

      if (statsRes?.success && statsRes?.data) {
        setStats(statsRes.data);
        storageCache.set('agent_stats', statsRes.data);
      }

      if (ordersRes?.success && ordersRes?.data?.orders) {
        setAssignedOrders(ordersRes.data.orders);
        storageCache.set('agent_assigned_orders', ordersRes.data.orders);
      }
    } catch (err) {
      console.warn('Silent revalidation error in delivery dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
  }, [statusFilter]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Toggle Duty Availability Status
  const handleToggleAvailability = async () => {
    try {
      const res = await deliveryService.toggleAgentAvailability();
      if (res?.success) {
        setStats((prev) => ({
          ...prev,
          availabilityStatus: res.data.availabilityStatus,
        }));
        addToast(`Duty status updated: ${res.data.availabilityStatus}`, 'success');
      }
    } catch (err) {
      addToast('Failed to toggle availability status', 'error');
    }
  };

  // Actions
  const handleAccept = async (orderId) => {
    try {
      const res = await deliveryService.acceptDelivery(orderId);
      if (res?.success) {
        addToast('Delivery accepted!', 'success');
        fetchAgentData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to accept delivery', 'error');
    }
  };

  const handlePickup = async (orderId) => {
    try {
      const res = await deliveryService.pickupOrder(orderId);
      if (res?.success) {
        addToast('Order marked as Picked Up!', 'success');
        fetchAgentData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to update pickup status', 'error');
    }
  };

  const handleStartDelivery = async (orderId) => {
    try {
      const res = await deliveryService.startDelivery(orderId);
      if (res?.success) {
        addToast('Delivery started! Verification OTP sent to customer.', 'success');
        fetchAgentData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to start delivery', 'error');
    }
  };

  // Open OTP Confirm Modal
  const handleOpenOtpModal = (order) => {
    setSelectedOrder(order);
    setOtpInput('');
    setDeliveryNote('');
    setShowOtpModal(true);
  };

  // Submit OTP Delivery Confirmation
  const handleConfirmOtp = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length !== 6) {
      addToast('Please enter a valid 6-digit Customer OTP', 'error');
      return;
    }

    setSubmittingAction(true);
    try {
      const res = await deliveryService.confirmDelivery(selectedOrder._id, otpInput, deliveryNote);
      if (res?.success) {
        addToast('OTP verified! Delivery marked as DELIVERED.', 'success');
        setShowOtpModal(false);
        setSelectedOrder(null);
        fetchAgentData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Invalid OTP. Delivery failed to complete.', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Open Fail Modal
  const handleOpenFailModal = (order) => {
    setSelectedOrder(order);
    setFailureReason('Customer unavailable');
    setFailureNote('');
    setShowFailModal(true);
  };

  // Submit Delivery Failure
  const handleConfirmFailure = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      const res = await deliveryService.failDelivery(selectedOrder._id, failureReason, failureNote);
      if (res?.success) {
        addToast('Delivery issue reported. Admin notified for reassignment.', 'info');
        setShowFailModal(false);
        setSelectedOrder(null);
        fetchAgentData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to report delivery issue', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // View Order Details
  const handleViewOrderDetails = async (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
    try {
      const res = await deliveryService.getAgentOrderDetails(order._id);
      if (res?.success && res?.data?.history) {
        setOrderDetailsHistory(res.data.history);
      }
    } catch (err) {
      setOrderDetailsHistory([]);
    }
  };

  // Open Navigation via Google Maps
  const handleOpenMapsNavigation = (addressObj) => {
    if (!addressObj) return;
    const query = `${addressObj.street || ''}, ${addressObj.city || ''}, ${addressObj.state || ''} ${addressObj.zipCode || ''}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(mapsUrl, '_blank');
  };

  // Filter Deliveries based on search and active state
  const activeDeliveriesList = assignedOrders.filter((o) => {
    const isActive = [
      'Assigned to Agent',
      'ACCEPTED',
      'Picked Up',
      'Out for Delivery',
      'ASSIGNED_TO_AGENT',
      'PICKED_UP',
      'OUT_FOR_DELIVERY',
    ].includes(o.status);
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customer?.fullName?.toLowerCase().includes(q) ||
      o.shippingAddress?.street?.toLowerCase().includes(q) ||
      o.shippingAddress?.city?.toLowerCase().includes(q);
    return isActive && matchesQuery;
  });

  const completedDeliveriesList = assignedOrders.filter((o) => {
    const isCompleted = ['Delivered', 'Delivery Failed', 'DELIVERED', 'DELIVERY_FAILED'].includes(o.status);
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customer?.fullName?.toLowerCase().includes(q) ||
      o.shippingAddress?.city?.toLowerCase().includes(q);
    return isCompleted && matchesQuery;
  });

  // Newly Assigned Orders needing acceptance
  const unacceptedNewOrders = activeDeliveriesList.filter(
    (o) => o.status === 'Assigned to Agent' || o.status === 'ASSIGNED_TO_AGENT'
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 pb-20 text-left">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#D6E6EC] px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0F291E] text-white flex items-center justify-center font-bold shadow-xs">
            <Truck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2">
              BrandDNA Express
              <span className="text-[9px] font-sans font-extrabold px-2 py-0.5 bg-emerald-800 text-white rounded-full uppercase tracking-wider">
                Agent Portal
              </span>
            </span>
            <p className="text-[11px] text-slate-500 font-medium">
              Agent: <strong className="text-slate-900">{user?.fullName || 'Rahul Kumar'}</strong> ({user?.vehicleType || 'Bike'} - {user?.vehicleNumber || 'KL-10-AB-1234'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Duty Availability Toggle */}
          <button
            onClick={handleToggleAvailability}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              stats.availabilityStatus === 'Available'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}
            title="Click to toggle your duty availability"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                stats.availabilityStatus === 'Available' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>{stats.availabilityStatus === 'Available' ? 'On Duty (Available)' : 'Off Duty (Unavailable)'}</span>
          </button>

          <button
            onClick={fetchAgentData}
            disabled={loading}
            className="p-2 rounded-xl border border-[#D6E6EC] bg-white text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Refresh Deliveries"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 transition-colors cursor-pointer border border-rose-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Delivery Notification Banner (If new assigned orders exist) */}
        {unacceptedNewOrders.length > 0 && (
          <div className="p-4 rounded-3xl bg-amber-500/10 border-2 border-amber-400/40 text-amber-900 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500 text-white font-bold shrink-0">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm">
                  {unacceptedNewOrders.length} New Delivery Assignment{unacceptedNewOrders.length > 1 ? 's' : ''} Received!
                </h4>
                <p className="text-xs text-amber-800 font-medium">
                  Review and accept your assigned deliveries below to begin dispatch.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('assigned')}
              className="px-4 py-2 rounded-xl bg-amber-900 text-white text-xs font-bold hover:bg-amber-950 transition-all cursor-pointer shrink-0"
            >
              View New Orders
            </button>
          </div>
        )}

        {/* Metric & Performance Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-3xl glass-panel border border-[#D6E6EC] bg-white shadow-2xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Today's Assigned</span>
              <Package className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-3xl font-extrabold text-[#0F291E] tracking-tight mt-2">
              {stats.todaysDeliveries || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Deliveries scheduled today</p>
          </div>

          <div className="p-5 rounded-3xl glass-panel border border-[#D6E6EC] bg-white shadow-2xs">
            <div className="flex items-center justify-between text-amber-600">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pending Action</span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-3xl font-extrabold text-amber-700 tracking-tight mt-2">
              {stats.pendingDeliveries || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Active / In-transit packages</p>
          </div>

          <div className="p-5 rounded-3xl glass-panel border border-[#D6E6EC] bg-white shadow-2xs">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-[10px] font-bold uppercase tracking-wider">Delivered Today</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-700 tracking-tight mt-2">
              {stats.deliveredToday || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">OTP verified today</p>
          </div>

          <div className="p-5 rounded-3xl glass-panel border border-[#D6E6EC] bg-white shadow-2xs">
            <div className="flex items-center justify-between text-rose-600">
              <span className="text-[10px] font-bold uppercase tracking-wider">Failed Deliveries</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <p className="text-3xl font-extrabold text-rose-700 tracking-tight mt-2">
              {stats.failedDeliveries || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Issues / Unreachable</p>
          </div>

          <div className="p-5 rounded-3xl glass-panel border border-[#D6E6EC] bg-white shadow-2xs col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-blue-600">
              <span className="text-[10px] font-bold uppercase tracking-wider">Success Rate</span>
              <Award className="w-4 h-4" />
            </div>
            <p className="text-3xl font-extrabold text-blue-700 tracking-tight mt-2">
              {stats.completionRate || 100}%
            </p>
            <p className="text-[11px] text-slate-500 mt-1">{stats.totalDelivered || 0} total delivered</p>
          </div>
        </div>

        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#D6E6EC] pb-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'assigned'
                  ? 'bg-[#0F291E] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-[#EAF4F7]'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Assigned Deliveries ({activeDeliveriesList.length})</span>
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
              <span>Delivery History ({completedDeliveriesList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#0F291E] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-[#EAF4F7]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </button>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order ID, customer name, street..."
            className="bg-white border border-[#D6E6EC] focus:border-slate-900 rounded-xl px-4 py-2 text-xs text-slate-900 outline-none w-full sm:w-64 font-medium"
          />
        </div>

        {/* TAB 1: ASSIGNED DELIVERIES */}
        {activeTab === 'assigned' && (
          <div className="space-y-4">
            {activeDeliveriesList.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#D6E6EC] space-y-3">
                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-slate-800">No Active Deliveries Assigned</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You have no pending orders assigned to your account right now. Check back later or ask Admin to assign ready packages.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeDeliveriesList.map((ord) => (
                  <div
                    key={ord._id}
                    className="p-5 rounded-3xl bg-white border border-[#D6E6EC] shadow-2xs hover:shadow-md transition-all space-y-4 text-xs"
                  >
                    {/* Header bar */}
                    <div className="flex items-center justify-between border-b border-[#D6E6EC] pb-3">
                      <div>
                        <span className="font-mono font-extrabold text-sm text-slate-900 block">
                          {ord.orderNumber || ord._id}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Assigned: {ord.assignedAt ? new Date(ord.assignedAt).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ord.status === 'Out for Delivery' || ord.status === 'OUT_FOR_DELIVERY'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                            : ord.status === 'Picked Up' || ord.status === 'PICKED_UP'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : 'bg-slate-100 text-slate-800 border border-slate-300'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">{ord.customer?.fullName || ord.shippingAddress?.fullName}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <a
                              href={`tel:${ord.shippingAddress?.phone || ord.customer?.phone}`}
                              className="text-xs text-emerald-700 font-bold flex items-center gap-1 hover:underline bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Call Customer</span>
                            </a>

                            <button
                              onClick={() => handleOpenMapsNavigation(ord.shippingAddress)}
                              className="text-xs text-blue-700 font-bold flex items-center gap-1 hover:underline bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 cursor-pointer"
                            >
                              <Navigation className="w-3.5 h-3.5 text-blue-600" />
                              <span>Open Navigation</span>
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-slate-900 text-sm">₹{ord.totalAmount?.toLocaleString('en-IN')}</p>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md block mt-1 ${
                              ord.paymentStatus === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            Payment: {ord.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Delivery Address Box */}
                      <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#D6E6EC] space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> Delivery Address
                        </span>
                        <p className="font-semibold text-slate-800 leading-snug">
                          {ord.shippingAddress?.street}, {ord.shippingAddress?.city}, {ord.shippingAddress?.state} - {ord.shippingAddress?.zipCode}
                        </p>
                      </div>

                      <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
                        <span>Items: {ord.items?.length || 0} product(s)</span>
                        <button
                          onClick={() => handleViewOrderDetails(ord)}
                          className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                        >
                          View Details & Products →
                        </button>
                      </div>
                    </div>

                    {/* Action Bar depending on status */}
                    <div className="pt-3 border-t border-[#D6E6EC] flex items-center gap-2">
                      {ord.status === 'Assigned to Agent' || ord.status === 'ASSIGNED_TO_AGENT' ? (
                        <>
                          {!ord.acceptedAt ? (
                            <button
                              onClick={() => handleAccept(ord._id)}
                              className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
                            >
                              Accept Delivery
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePickup(ord._id)}
                              className="flex-1 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-all cursor-pointer shadow-2xs"
                            >
                              Pick Up Order
                            </button>
                          )}
                        </>
                      ) : ord.status === 'Picked Up' || ord.status === 'PICKED_UP' ? (
                        <button
                          onClick={() => handleStartDelivery(ord._id)}
                          className="w-full py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-2"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Start Delivery (Generate Customer OTP)</span>
                        </button>
                      ) : ord.status === 'Out for Delivery' || ord.status === 'OUT_FOR_DELIVERY' ? (
                        <>
                          <button
                            onClick={() => handleOpenOtpModal(ord)}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                          >
                            <KeyRound className="w-4 h-4" />
                            <span>Mark as Delivered (OTP)</span>
                          </button>
                          <button
                            onClick={() => handleOpenFailModal(ord)}
                            className="py-2.5 px-3 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
                          >
                            Report Issue / Fail
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === 'history' && (
          <div className="glass-panel rounded-3xl border border-[#D6E6EC] bg-white shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#D6E6EC] text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Delivery Location</th>
                    <th className="p-4">Final Outcome</th>
                    <th className="p-4">Completed / Failed Date</th>
                    <th className="p-4">Notes / Issue Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D6E6EC]">
                  {completedDeliveriesList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400 font-semibold">
                        No completed or failed delivery records yet.
                      </td>
                    </tr>
                  ) : (
                    completedDeliveriesList.map((ord) => (
                      <tr key={ord._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-900">
                          {ord.orderNumber || ord._id}
                        </td>
                        <td className="p-4 font-bold text-slate-900">
                          {ord.customer?.fullName || ord.shippingAddress?.fullName}
                        </td>
                        <td className="p-4 text-slate-600">
                          {ord.shippingAddress?.city}
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
                        <td className="p-4 text-slate-500 font-mono">
                          {ord.deliveredAt
                            ? new Date(ord.deliveredAt).toLocaleString()
                            : ord.failedAt
                            ? new Date(ord.failedAt).toLocaleString()
                            : 'Recently'}
                        </td>
                        <td className="p-4 text-slate-600">
                          {ord.deliveryFailureReason ? (
                            <span className="text-rose-600 font-bold">{ord.deliveryFailureReason}</span>
                          ) : (
                            <span className="text-emerald-700 font-bold">Verified via Customer OTP</span>
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

        {/* TAB 3: AGENT PROFILE */}
        {activeTab === 'profile' && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#D6E6EC] bg-white shadow-2xs max-w-xl space-y-6 text-left">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#0F291E] text-white font-extrabold text-xl flex items-center justify-center">
                {user?.fullName?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <h2 className="font-serif font-bold text-2xl text-slate-900">{user?.fullName || 'Rahul Kumar'}</h2>
                <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Role: DELIVERY_AGENT
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                    Status: {stats.availabilityStatus || 'Available'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#D6E6EC] text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-bold">Phone Number</span>
                <span className="font-bold text-slate-900">{user?.phone || '9876543210'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-bold">Vehicle Type</span>
                <span className="font-bold text-slate-900">{user?.vehicleType || 'Bike'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-bold">Vehicle Registration</span>
                <span className="font-mono font-bold text-slate-900">{user?.vehicleNumber || 'KL-10-AB-1234'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-bold">Total Completed Deliveries</span>
                <span className="font-bold text-emerald-700">{stats.totalDelivered || 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-bold">Delivery Success Rate</span>
                <span className="font-bold text-blue-700">{stats.completionRate || 100}%</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: OTP DELIVERY CONFIRMATION */}
      <AnimatePresence>
        {showOtpModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-[#D6E6EC] shadow-xl w-full max-w-md p-6 space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-[#D6E6EC] pb-4">
                <h3 className="font-serif font-bold text-xl text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-emerald-700" /> Delivery Confirmation OTP
                </h3>
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <p>
                  Order ID: <strong className="font-mono text-slate-900">{selectedOrder.orderNumber || selectedOrder._id}</strong>
                </p>
                <p>
                  Customer: <strong className="text-slate-900">{selectedOrder.customer?.fullName || selectedOrder.shippingAddress?.fullName}</strong>
                </p>
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-2 font-medium">
                  Ask the customer for the 6-digit OTP displayed on their order tracking page.
                </p>
              </div>

              <form onSubmit={handleConfirmOtp} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 uppercase text-[10px] tracking-wider">
                    Enter Customer 6-Digit OTP *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center text-2xl font-mono font-extrabold tracking-widest bg-[#FAF8F5] border-2 border-slate-900 rounded-2xl p-3 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Delivery Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="Handed directly to customer at front door..."
                    className="w-full bg-[#FAF8F5]/40 border border-[#D6E6EC] focus:border-slate-900 rounded-xl p-2.5 outline-none font-medium text-slate-900"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#D6E6EC]">
                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#D6E6EC] text-slate-600 font-bold hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {submittingAction ? 'Verifying OTP...' : 'Verify & Mark Delivered'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: REPORT DELIVERY FAILURE */}
      <AnimatePresence>
        {showFailModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-[#D6E6EC] shadow-xl w-full max-w-md p-6 space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-[#D6E6EC] pb-4">
                <h3 className="font-serif font-bold text-xl text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" /> Report Delivery Issue / Failure
                </h3>
                <button
                  onClick={() => setShowFailModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmFailure} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reason for Delivery Failure *</label>
                  <select
                    value={failureReason}
                    onChange={(e) => setFailureReason(e.target.value)}
                    className="w-full bg-[#FAF8F5]/40 border border-[#D6E6EC] focus:border-slate-900 rounded-xl p-2.5 outline-none font-bold text-slate-900 cursor-pointer"
                  >
                    <option value="Customer unavailable">Customer unavailable at delivery address</option>
                    <option value="Incorrect address">Incorrect address or house untraceable</option>
                    <option value="Customer rejected">Customer rejected order / refused package</option>
                    <option value="Damaged package">Damaged package during transit</option>
                    <option value="Vehicle issue">Vehicle issue / Breakdown</option>
                    <option value="Other">Other reason</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Delivery Issue Notes</label>
                  <textarea
                    rows={3}
                    value={failureNote}
                    onChange={(e) => setFailureNote(e.target.value)}
                    placeholder="Called customer 3 times, door locked..."
                    className="w-full bg-[#FAF8F5]/40 border border-[#D6E6EC] focus:border-slate-900 rounded-xl p-2.5 outline-none font-medium text-slate-900"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#D6E6EC]">
                  <button
                    type="button"
                    onClick={() => setShowFailModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#D6E6EC] text-slate-600 font-bold hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {submittingAction ? 'Submitting...' : 'Log Delivery Failure'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: ORDER DETAILS & PRODUCTS */}
      <AnimatePresence>
        {showDetailsModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-[#D6E6EC] shadow-xl w-full max-w-lg p-6 space-y-6 text-left max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#D6E6EC] pb-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-slate-900">
                    Order Details #{selectedOrder.orderNumber || selectedOrder._id}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Status: <strong className="text-slate-900">{selectedOrder.status}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Contact Bar */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#D6E6EC] flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-xs">{selectedOrder.customer?.fullName || selectedOrder.shippingAddress?.fullName}</p>
                  <p className="text-[11px] text-slate-500">{selectedOrder.shippingAddress?.phone || selectedOrder.customer?.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedOrder.shippingAddress?.phone || selectedOrder.customer?.phone}`}
                    className="p-2 rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                    title="Call Customer"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleOpenMapsNavigation(selectedOrder.shippingAddress)}
                    className="p-2 rounded-xl bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                    title="Navigate via Google Maps"
                  >
                    <Navigation className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Products List */}
              <div className="space-y-3 text-xs">
                <h4 className="font-serif font-bold text-sm text-slate-900">Ordered Products</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#D6E6EC] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {item.productImage && (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                          />
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{item.productName}</p>
                          <p className="text-[10px] text-slate-500">Qty: {item.quantity} × ₹{item.unitPrice}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">₹{item.totalPrice}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery History Timeline */}
              <div className="space-y-3 text-xs pt-3 border-t border-[#D6E6EC]">
                <h4 className="font-serif font-bold text-sm text-slate-900">Delivery Audit Event Logs</h4>
                {orderDetailsHistory.length === 0 ? (
                  <p className="text-slate-400 italic">No events logged yet.</p>
                ) : (
                  <div className="space-y-2 pl-2 border-l-2 border-emerald-500">
                    {orderDetailsHistory.map((h, i) => (
                      <div key={i} className="pl-3 relative">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -left-[13px] top-1.5" />
                        <p className="font-bold text-slate-900">{h.statusText || h.status}</p>
                        <p className="text-slate-600">{h.description}</p>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {new Date(h.timestamp).toLocaleString()} ({h.updatedByName || 'Agent'})
                        </span>
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
