import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  RotateCcw,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { businessService } from '../../services/businessService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { storageCache } from '../../utils/storageCache';
import { EvidencePhotoModal } from '../../components/common/EvidencePhotoModal';

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
  const [assignedReturnPickups, setAssignedReturnPickups] = useState(() => storageCache.get('agent_return_pickups', []));
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [orderDetailsHistory, setOrderDetailsHistory] = useState([]);
  const [evidenceModal, setEvidenceModal] = useState({
    isOpen: false,
    imageUrl: '',
    returnDoc: null,
  });

  // Form Inputs
  const [otpInput, setOtpInput] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [failureReason, setFailureReason] = useState('Customer unavailable');
  const [failureNote, setFailureNote] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAgentData = async () => {
    try {
      const [statsRes, ordersRes, returnsRes] = await Promise.allSettled([
        deliveryService.getAgentStats(),
        deliveryService.getAssignedOrders(statusFilter),
        businessService.getReturns(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.success && statsRes.value?.data) {
        setStats(statsRes.value.data);
        storageCache.set('agent_stats', statsRes.value.data);
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value?.success && ordersRes.value?.data?.orders) {
        setAssignedOrders(ordersRes.value.data.orders);
        storageCache.set('agent_assigned_orders', ordersRes.value.data.orders);
      }

      if (returnsRes.status === 'fulfilled') {
        const val = returnsRes.value;
        const fetchedReturns = val?.data?.returns || (Array.isArray(val?.data) ? val.data : []);
        if (val?.success && Array.isArray(fetchedReturns)) {
          setAssignedReturnPickups(fetchedReturns);
          storageCache.set('agent_return_pickups', fetchedReturns);
        }
      }
    } catch (err) {
      console.warn('Silent revalidation error in delivery dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
    // Auto-poll every 15 seconds so newly assigned orders & returns appear automatically
    const interval = setInterval(() => {
      fetchAgentData();
    }, 15000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchAgentData();
    setIsRefreshing(false);
    addToast('Dashboard data updated', 'info');
  };

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

  // Actions with Zero-Delay Optimistic UI Updates
  const handleAccept = async (orderId) => {
    // 1. Instant optimistic update: flip to "Pick Up Order" immediately (0ms delay)
    const now = new Date().toISOString();
    setAssignedOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord._id === orderId) {
          return {
            ...ord,
            status: 'Assigned to Agent',
            acceptedAt: now,
          };
        }
        return ord;
      });
      storageCache.set('agent_assigned_orders', updated);
      return updated;
    });

    addToast('Delivery accepted!', 'success');

    // 2. Background server synchronization
    try {
      const res = await deliveryService.acceptDelivery(orderId);
      if (res?.success && res.data?.order) {
        setAssignedOrders((prev) => {
          const updated = prev.map((ord) =>
            ord._id === orderId ? { ...ord, ...res.data.order, acceptedAt: res.data.order.acceptedAt || now } : ord
          );
          storageCache.set('agent_assigned_orders', updated);
          return updated;
        });
      }
      fetchAgentData();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to accept delivery', 'error');
      fetchAgentData();
    }
  };

  const handlePickup = async (orderId) => {
    // 1. Instant optimistic update: flip to "Start Delivery" immediately (0ms delay)
    const now = new Date().toISOString();
    setAssignedOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord._id === orderId) {
          return {
            ...ord,
            status: 'Picked Up',
            pickedUpAt: now,
          };
        }
        return ord;
      });
      storageCache.set('agent_assigned_orders', updated);
      return updated;
    });

    addToast('Order marked as Picked Up!', 'success');

    // 2. Background server synchronization
    try {
      const res = await deliveryService.pickupOrder(orderId);
      if (res?.success && res.data?.order) {
        setAssignedOrders((prev) => {
          const updated = prev.map((ord) =>
            ord._id === orderId ? { ...ord, ...res.data.order, status: 'Picked Up' } : ord
          );
          storageCache.set('agent_assigned_orders', updated);
          return updated;
        });
      }
      fetchAgentData();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to update pickup status', 'error');
      fetchAgentData();
    }
  };

  const handleStartDelivery = async (orderId) => {
    // 1. Instant optimistic update: flip to "Mark as Delivered (OTP)" immediately (0ms delay)
    const now = new Date().toISOString();
    setAssignedOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord._id === orderId) {
          return {
            ...ord,
            status: 'Out for Delivery',
            outForDeliveryAt: now,
          };
        }
        return ord;
      });
      storageCache.set('agent_assigned_orders', updated);
      return updated;
    });

    addToast('Delivery started! Verification OTP sent to customer.', 'success');

    // 2. Background server synchronization
    try {
      const res = await deliveryService.startDelivery(orderId);
      if (res?.success && res.data?.order) {
        setAssignedOrders((prev) => {
          const updated = prev.map((ord) =>
            ord._id === orderId ? { ...ord, ...res.data.order, status: 'Out for Delivery' } : ord
          );
          storageCache.set('agent_assigned_orders', updated);
          return updated;
        });
      }
      fetchAgentData();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to start delivery', 'error');
      fetchAgentData();
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
    const orderId = selectedOrder._id;
    try {
      const res = await deliveryService.confirmDelivery(orderId, otpInput, deliveryNote);
      if (res?.success) {
        const now = new Date().toISOString();
        setAssignedOrders((prev) => {
          const updated = prev.map((ord) => {
            if (ord._id === orderId) {
              return {
                ...ord,
                status: 'Delivered',
                deliveredAt: now,
                paymentStatus: 'Paid',
              };
            }
            return ord;
          });
          storageCache.set('agent_assigned_orders', updated);
          return updated;
        });

        setStats((prev) => ({
          ...prev,
          deliveredToday: (prev.deliveredToday || 0) + 1,
          totalDelivered: (prev.totalDelivered || 0) + 1,
          pendingDeliveries: Math.max(0, (prev.pendingDeliveries || 1) - 1),
        }));

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
    const orderId = selectedOrder._id;
    try {
      const res = await deliveryService.failDelivery(orderId, failureReason, failureNote);
      if (res?.success) {
        const now = new Date().toISOString();
        setAssignedOrders((prev) => {
          const updated = prev.map((ord) => {
            if (ord._id === orderId) {
              return {
                ...ord,
                status: 'Delivery Failed',
                failedAt: now,
                deliveryFailureReason: failureReason,
                deliveryFailureNote: failureNote,
              };
            }
            return ord;
          });
          storageCache.set('agent_assigned_orders', updated);
          return updated;
        });

        setStats((prev) => ({
          ...prev,
          failedDeliveries: (prev.failedDeliveries || 0) + 1,
          pendingDeliveries: Math.max(0, (prev.pendingDeliveries || 1) - 1),
        }));

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

  // Return Pickup Actions
  const handleStartReturnPickup = async (returnId) => {
    setSubmittingAction(true);
    try {
      const res = await businessService.startReturnPickup(returnId);
      if (res?.success) {
        addToast('Marked out for pickup! Heading to customer address.', 'success');
        fetchAgentData();
      } else {
        addToast(res?.message || 'Failed to start pickup', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to start pickup', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleConfirmReturnPickup = async (returnId) => {
    setSubmittingAction(true);
    try {
      const res = await businessService.confirmReturnPickup(returnId);
      if (res?.success) {
        addToast('Product successfully collected from customer! Please deliver to warehouse.', 'success');
        fetchAgentData();
      } else {
        addToast(res?.message || 'Failed to confirm pickup', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to confirm pickup', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDeliverReturnToWarehouse = async (returnId) => {
    setSubmittingAction(true);
    try {
      const res = await businessService.deliverReturnToWarehouse(returnId);
      if (res?.success) {
        addToast('Returned product delivered to warehouse! Inventory staff can now inspect.', 'success');
        fetchAgentData();
      } else {
        addToast(res?.message || 'Failed to deliver to warehouse', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to deliver to warehouse', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Open Navigation via Google Maps
  const handleOpenMapsNavigation = (addressObj) => {
    if (!addressObj) return;
    const query = `${addressObj.street || ''}, ${addressObj.city || ''}, ${addressObj.state || ''} ${addressObj.zipCode || ''}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(mapsUrl, '_blank');
  };

  // Filter Deliveries based on search and active state with useMemo to eliminate lag
  const activeDeliveriesList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return assignedOrders.filter((o) => {
      const isActive = [
        'Assigned to Agent',
        'ACCEPTED',
        'Picked Up',
        'Out for Delivery',
        'ASSIGNED_TO_AGENT',
        'PICKED_UP',
        'OUT_FOR_DELIVERY',
      ].includes(o.status);
      if (!isActive) return false;
      if (!q) return true;
      return (
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customer?.fullName?.toLowerCase().includes(q) ||
        o.shippingAddress?.street?.toLowerCase().includes(q) ||
        o.shippingAddress?.city?.toLowerCase().includes(q)
      );
    });
  }, [assignedOrders, searchQuery]);

  const activeReturnPickupsList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return assignedReturnPickups.filter((r) => {
      const statusUpper = (r.status || '').toUpperCase().replace(/[\s-]+/g, '_');
      const isPickupActive = [
        'PICKUP_ASSIGNED',
        'APPROVED',
        'OUT_FOR_PICKUP',
        'PICKED_UP',
      ].includes(statusUpper);
      if (!isPickupActive) return false;
      if (!q) return true;
      return (
        r.returnNumber?.toLowerCase().includes(q) ||
        r.productName?.toLowerCase().includes(q) ||
        r.customer?.fullName?.toLowerCase().includes(q) ||
        r.order?.shippingAddress?.street?.toLowerCase().includes(q) ||
        r.order?.shippingAddress?.city?.toLowerCase().includes(q)
      );
    });
  }, [assignedReturnPickups, searchQuery]);

  const completedReturnPickupsList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return assignedReturnPickups.filter((r) => {
      const statusUpper = (r.status || '').toUpperCase().replace(/[\s-]+/g, '_');
      const isCompleted = ['RETURN_RECEIVED', 'INSPECTED', 'REFUNDED'].includes(statusUpper);
      if (!isCompleted) return false;
      if (!q) return true;
      return (
        r.returnNumber?.toLowerCase().includes(q) ||
        r.productName?.toLowerCase().includes(q) ||
        r.customer?.fullName?.toLowerCase().includes(q)
      );
    });
  }, [assignedReturnPickups, searchQuery]);

  const completedDeliveriesList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return assignedOrders.filter((o) => {
      const isCompleted = ['Delivered', 'Delivery Failed', 'DELIVERED', 'DELIVERY_FAILED'].includes(o.status);
      if (!isCompleted) return false;
      if (!q) return true;
      return (
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customer?.fullName?.toLowerCase().includes(q) ||
        o.shippingAddress?.city?.toLowerCase().includes(q)
      );
    });
  }, [assignedOrders, searchQuery]);

  // Newly Assigned Orders needing acceptance
  const unacceptedNewOrders = useMemo(() => {
    return activeDeliveriesList.filter(
      (o) => o.status === 'Assigned to Agent' || o.status === 'ASSIGNED_TO_AGENT'
    );
  }, [activeDeliveriesList]);

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
          {/* Manual Refresh Button */}
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D6E6EC] text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

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

        {/* Return Pickup Notification Banner */}
        {activeReturnPickupsList.length > 0 && activeTab !== 'return-pickups' && (
          <div className="p-4 rounded-3xl bg-blue-500/10 border-2 border-blue-400/40 text-blue-900 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-600 text-white font-bold shrink-0">
                <RotateCcw className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm">
                  {activeReturnPickupsList.length} Customer Return Pickup{activeReturnPickupsList.length > 1 ? 's' : ''} Ready!
                </h4>
                <p className="text-xs text-blue-800 font-medium">
                  Collect returned items from customer addresses and deliver them to the warehouse.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('return-pickups')}
              className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              View Return Pickups ({activeReturnPickupsList.length})
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
              onClick={() => setActiveTab('return-pickups')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'return-pickups'
                  ? 'bg-[#0F291E] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-[#EAF4F7]'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Return Pickups ({activeReturnPickupsList.length})</span>
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

        {/* TAB: RETURN PICKUPS */}
        {activeTab === 'return-pickups' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-blue-700 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">Customer Return Pickup Tasks</h4>
                  <p className="text-slate-500 text-[11px]">
                    Collect approved returns directly from customer addresses and deliver them to the warehouse for inspection.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold bg-white text-blue-900 px-3 py-1 rounded-xl border border-blue-200 shrink-0">
                {activeReturnPickupsList.length} Active Pickup{activeReturnPickupsList.length !== 1 ? 's' : ''}
              </span>
            </div>

            {activeReturnPickupsList.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#D6E6EC] space-y-3">
                <RotateCcw className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-slate-800">No Active Return Pickups</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You currently have no return pickups assigned. Approved customer returns will appear here once assigned by Inventory Staff.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeReturnPickupsList.map((ret) => {
                  const addr = ret.order?.shippingAddress || ret.customer?.address || {};
                  const isAssigned = ret.status === 'PICKUP_ASSIGNED' || ret.status === 'APPROVED' || ret.status === 'Approved';
                  const isOut = ret.status === 'OUT_FOR_PICKUP';
                  const isPicked = ret.status === 'PICKED_UP';

                  return (
                    <div
                      key={ret._id}
                      className="p-5 rounded-3xl bg-white border border-[#D6E6EC] shadow-2xs hover:shadow-md transition-all space-y-4 text-xs"
                    >
                      {/* Return Header */}
                      <div className="flex items-center justify-between border-b border-[#D6E6EC] pb-3">
                        <div>
                          <span className="font-mono font-extrabold text-sm text-slate-900 block">
                            {ret.returnNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Order #{ret.order?.orderNumber || 'ORDER'}
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isOut
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                              : isPicked
                              ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                              : 'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}
                        >
                          {ret.status === 'APPROVED' ? 'PICKUP ASSIGNED' : ret.status?.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Product details */}
                      <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
                        <img
                          src={ret.productImage || ret.product?.images?.[0] || '/images/cat_workout_essentials.jpg'}
                          alt=""
                          className="w-14 h-14 object-contain rounded-xl bg-white p-1 border border-stone-200 shrink-0"
                          onError={(e) => { e.target.src = '/images/cat_workout_essentials.jpg'; }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 truncate">{ret.productName || ret.product?.name}</p>
                          <p className="text-[11px] text-slate-500">
                            Quantity: <strong>{ret.quantity}</strong> {ret.size && `• Size: ${ret.size}`}
                          </p>
                          <p className="text-[10px] text-amber-800 font-medium truncate mt-0.5">
                            Reason: {ret.reason}
                          </p>
                        </div>
                      </div>

                      {/* Customer Pickup Location */}
                      <div className="space-y-1.5 p-3 rounded-2xl bg-[#F0F7F9] border border-[#D6E6EC]">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                            Pickup Address (Customer)
                          </span>
                          {addr.street && (
                            <button
                              type="button"
                              onClick={() => handleOpenMapsNavigation(addr)}
                              className="text-[10px] text-blue-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Navigation className="w-3 h-3" /> Navigate
                            </button>
                          )}
                        </div>
                        <p className="font-bold text-slate-900">
                          {addr.fullName || ret.customer?.fullName || 'Customer'}
                        </p>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {addr.street ? `${addr.street}, ${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}` : 'Customer registered address'}
                        </p>
                        <div className="pt-1 flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <a
                            href={`tel:${addr.phone || ret.customer?.phone || ''}`}
                            className="font-mono text-blue-700 font-bold hover:underline"
                          >
                            {addr.phone || ret.customer?.phone || 'No phone provided'}
                          </a>
                        </div>
                      </div>

                      {/* Evidence Photo thumbnail with In-App Viewer Modal */}
                      {ret.evidenceImage && (
                        <div className="flex items-center justify-between p-2.5 bg-blue-50/60 rounded-2xl border border-blue-200/70 text-[11px]">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={ret.evidenceImage}
                              alt="Evidence"
                              className="w-9 h-9 rounded-xl object-cover border border-blue-200 bg-white cursor-pointer hover:opacity-85 transition-opacity shrink-0"
                              onClick={() => setEvidenceModal({ isOpen: true, imageUrl: ret.evidenceImage, returnDoc: ret })}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">Customer Evidence Photo</span>
                              <span className="text-[10px] text-slate-500">Tap to inspect defect photo</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEvidenceModal({ isOpen: true, imageUrl: ret.evidenceImage, returnDoc: ret })}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Photo</span>
                          </button>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-2 border-t border-[#D6E6EC] flex flex-wrap items-center justify-end gap-2">
                        {/* Step 1: Heading to customer */}
                        {isAssigned && (
                          <button
                            type="button"
                            onClick={() => handleStartReturnPickup(ret._id)}
                            disabled={submittingAction}
                            className="flex-1 py-2.5 bg-[#0F291E] hover:bg-[#1E3E62] text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Start Pickup (Heading to Customer)</span>
                          </button>
                        )}

                        {/* Step 2: Confirm Picked Up from Customer */}
                        {(isAssigned || isOut) && (
                          <button
                            type="button"
                            onClick={() => handleConfirmReturnPickup(ret._id)}
                            disabled={submittingAction}
                            className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm Product Picked Up</span>
                          </button>
                        )}

                        {/* Step 3: Deliver to Warehouse */}
                        {isPicked && (
                          <button
                            type="button"
                            onClick={() => handleDeliverReturnToWarehouse(ret._id)}
                            disabled={submittingAction}
                            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-sky-700 hover:from-emerald-700 hover:to-sky-800 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>Deliver to Warehouse (Handover for Inspection)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Completed Return Pickups History Section */}
            {completedReturnPickupsList.length > 0 && (
              <div className="pt-4 border-t border-[#D6E6EC] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Completed Return Pickups ({completedReturnPickupsList.length})</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Delivered to warehouse</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {completedReturnPickupsList.map((ret) => (
                    <div
                      key={ret._id}
                      className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2 text-xs opacity-90 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900">{ret.returnNumber}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {ret.status === 'RETURN_RECEIVED' ? 'Received at Warehouse' : ret.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800 truncate">{ret.productName || ret.product?.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Customer: {ret.customer?.fullName || 'Customer'} • Qty: {ret.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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

      {/* MODAL 4: EVIDENCE PHOTO LIGHTBOX MODAL */}
      <EvidencePhotoModal
        isOpen={evidenceModal.isOpen}
        onClose={() => setEvidenceModal({ isOpen: false, imageUrl: '', returnDoc: null })}
        imageUrl={evidenceModal.imageUrl}
        returnDoc={evidenceModal.returnDoc}
      />
    </div>
  );
};
