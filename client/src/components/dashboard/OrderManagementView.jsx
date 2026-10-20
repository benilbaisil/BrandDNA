import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  X,
  CreditCard,
  User,
  Calendar,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { businessService } from '../../services/businessService';
import { useToast } from '../../context/ToastContext';

export const OrderManagementView = ({ allowStatusUpdates = true }) => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [retryingId, setRetryingId] = useState(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (paymentStatusFilter !== 'ALL') params.paymentStatus = paymentStatusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await businessService.getOrders(params);
      if (res?.success && res?.data?.orders) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching order history:', err);
      addToast('Failed to load orders from database', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentStatusFilter, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleRetryShipment = async (orderId) => {
    setRetryingId(orderId);
    try {
      const res = await businessService.retryShipment(orderId);
      if (res?.success && res?.data?.order) {
        addToast('Shipment creation/sync retry successful!', 'success');
        fetchOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(res.data.order);
        }
      } else {
        addToast(res?.message || 'Shipment retry failed', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to retry shipment creation', 'error');
    } finally {
      setRetryingId(null);
    }
  };

  const getShipmentBadgeClass = (shipmentStatus) => {
    switch (shipmentStatus) {
      case 'ORDER_PLACED':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'ORDER_CONFIRMED':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'PICKED_UP':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'IN_TRANSIT':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'ARRIVED_AT_HUB':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-stone-200';
    }
  };

  // Filter orders by search, shipment status filter
  const displayedOrders = orders.filter((ord) => {
    if (shipmentStatusFilter !== 'ALL') {
      if ((ord.shipmentStatus || 'ORDER_PLACED') !== shipmentStatusFilter) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const trkMatch = ord.trackingNumber?.toLowerCase().includes(q);
      const ordMatch = ord.orderNumber?.toLowerCase().includes(q);
      const custMatch = ord.customer?.fullName?.toLowerCase().includes(q) || ord.shippingAddress?.fullName?.toLowerCase().includes(q);
      return trkMatch || ordMatch || custMatch;
    }
    return true;
  });

  return (
    <div className="space-y-6 text-left font-sans text-[#0F291E]/90">
      {/* Search & Filter Header Toolbar */}
      <div className="glass-panel rounded-2xl p-5 border border-[#E5E0D8] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#0F291E] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#0F291E]" /> Shipment Monitoring & Order Management
            </h2>
            <p className="text-xs text-slate-500">
              API-driven automated courier tracking monitoring. Shipment statuses update automatically from the courier API service.
            </p>
          </div>

          <button
            onClick={() => {
              setRefreshing(true);
              fetchOrders();
            }}
            disabled={refreshing}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
            title="Refresh Order & Shipment List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Live Statuses</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 text-xs">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Tracking #, Order #, Customer Name..."
              className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 pl-9 outline-none focus:border-[#0F382C] font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Shipment API Status Filter */}
          <div className="lg:col-span-3">
            <select
              value={shipmentStatusFilter}
              onChange={(e) => setShipmentStatusFilter(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 outline-none font-bold text-slate-700 cursor-pointer"
            >
              <option value="ALL">Courier Shipment: All</option>
              <option value="ORDER_PLACED">1. Order Placed</option>
              <option value="ORDER_CONFIRMED">2. Confirmed</option>
              <option value="PICKED_UP">3. Picked Up</option>
              <option value="IN_TRANSIT">4. In Transit</option>
              <option value="ARRIVED_AT_HUB">5. Arrived at Hub</option>
              <option value="OUT_FOR_DELIVERY">6. Out for Delivery</option>
              <option value="DELIVERED">7. Delivered</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="lg:col-span-3">
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 outline-none font-bold text-slate-700 cursor-pointer"
            >
              <option value="ALL">Payment: All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          {/* Search Action Button */}
          <div className="lg:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#0F291E] hover:bg-[#09271E] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
          </div>
        </form>
      </div>

      {/* Orders & Shipments Monitoring Table */}
      <div className="glass-panel rounded-2xl border border-[#E5E0D8]/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-3">
            <div className="w-8 h-8 border-3 border-[#0F382C] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-semibold text-slate-600">Querying live orders and shipment statuses...</p>
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">No Customer Orders Found</p>
            <p className="text-slate-500 max-w-sm mx-auto">
              There are currently no orders in the database matching your search and filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Order & Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Tracking Number</th>
                  <th className="p-4">Courier</th>
                  <th className="p-4">Shipment Status (API)</th>
                  <th className="p-4">Sync Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {displayedOrders.map((ord) => {
                  const latestEvent = ord.shipmentEvents && ord.shipmentEvents.length > 0 ? ord.shipmentEvents[ord.shipmentEvents.length - 1] : null;

                  return (
                    <tr key={ord._id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      {/* Order ID & Date */}
                      <td className="p-4">
                        <span className="font-bold text-[#0F291E] block text-sm font-mono">{ord.orderNumber}</span>
                        <span className="text-slate-400 text-[11px]">
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-[#0F291E] flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#0F291E]" />
                            {ord.customer?.fullName || ord.shippingAddress?.fullName || 'Customer'}
                          </p>
                          <p className="text-slate-400 text-[10px]">{ord.shippingAddress?.city}, {ord.shippingAddress?.state}</p>
                        </div>
                      </td>

                      {/* Tracking Number */}
                      <td className="p-4">
                        {ord.trackingNumber ? (
                          <span className="font-mono font-bold bg-stone-100 text-slate-900 px-2.5 py-1 rounded-md border border-stone-200">
                            {ord.trackingNumber}
                          </span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md text-[11px] font-bold border border-amber-200">
                            Pending Sync
                          </span>
                        )}
                      </td>

                      {/* Courier Name */}
                      <td className="p-4">
                        <span className="font-bold text-slate-700">
                          {ord.shipmentProvider || 'SwiftExpress Courier'}
                        </span>
                      </td>

                      {/* Shipment Status (API Read-Only) */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${getShipmentBadgeClass(ord.shipmentStatus)}`}>
                            {ord.shipmentStatusText || ord.shipmentStatus || 'ORDER_PLACED'}
                          </span>
                          {latestEvent && (
                            <span className="block text-[10px] text-slate-500 truncate max-w-[160px]">
                              Latest: {latestEvent.description}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Sync Status Badge */}
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${
                          ord.shipmentSyncStatus === 'SYNCED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : ord.shipmentSyncStatus === 'FAILED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {ord.shipmentSyncStatus || 'SYNCED'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold rounded-xl text-xs inline-flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                        <button
                          onClick={() => handleRetryShipment(ord._id)}
                          disabled={retryingId === ord._id}
                          className="px-3 py-1.5 bg-[#0F291E] hover:bg-[#09271E] text-white font-bold rounded-xl text-xs inline-flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                          title="Retry shipment creation or status synchronization"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${retryingId === ord._id ? 'animate-spin' : ''}`} />
                          <span>Retry/Sync</span>
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

      {/* Complete Order & Shipment Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-[#0F291E]/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#E5E0D8] max-w-xl w-full shadow-2xl space-y-5 text-left my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold">MONGODB ORDER ID: {selectedOrder._id}</span>
                <h3 className="font-serif text-xl font-bold text-[#0F291E]">Order #{selectedOrder.orderNumber}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Shipment API Live Monitoring Card */}
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5E0D8] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F291E] text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-sky-600" /> Demo Shipment API Monitor
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${getShipmentBadgeClass(selectedOrder.shipmentStatus)}`}>
                    {selectedOrder.shipmentStatusText || selectedOrder.shipmentStatus || 'ORDER_PLACED'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Tracking Number</span>
                    <span className="font-mono font-bold text-[#0F291E]">{selectedOrder.trackingNumber || 'Not Generated'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Courier Partner</span>
                    <span className="font-bold text-slate-800">{selectedOrder.shipmentProvider || 'SwiftExpress Courier'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Estimated Delivery</span>
                    <span className="font-bold text-slate-800">
                      {selectedOrder.estimatedDelivery ? new Date(selectedOrder.estimatedDelivery).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Last Synced</span>
                    <span className="font-medium text-slate-600">
                      {selectedOrder.shipmentLastSyncedAt ? new Date(selectedOrder.shipmentLastSyncedAt).toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {selectedOrder.shipmentSyncError && (
                  <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-[11px] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Sync Warning: {selectedOrder.shipmentSyncError}</span>
                  </div>
                )}
              </div>

              {/* Event Log History */}
              <div>
                <span className="font-bold text-slate-700 block mb-1">API Event Log History</span>
                <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E5E0D8] divide-y divide-stone-200 max-h-40 overflow-y-auto">
                  {(!selectedOrder.shipmentEvents || selectedOrder.shipmentEvents.length === 0) ? (
                    <p className="text-slate-400 text-center py-2">No event logs recorded.</p>
                  ) : (
                    selectedOrder.shipmentEvents.slice().reverse().map((ev, i) => (
                      <div key={i} className="py-2 first:pt-0 last:pb-0 flex items-start justify-between text-[11px]">
                        <div>
                          <strong className="text-[#0F291E] block">{ev.statusText || ev.status}</strong>
                          <p className="text-slate-600">{ev.description}</p>
                          <span className="text-[10px] text-slate-400 font-mono">Location: {ev.location}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                          {new Date(ev.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Customer Contact Details */}
              <div>
                <span className="font-bold text-slate-700 block mb-1">Customer & Delivery Destination</span>
                <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E5E0D8] space-y-1">
                  <p className="font-bold text-[#0F291E]">{selectedOrder.customer?.fullName || selectedOrder.shippingAddress?.fullName}</p>
                  <p className="text-slate-600">
                    Address: {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}
                  </p>
                  <p className="text-slate-600">Phone: {selectedOrder.shippingAddress?.phone || selectedOrder.customer?.phone}</p>
                </div>
              </div>

              {/* Products Ordered Breakdown */}
              <div>
                <span className="font-bold text-slate-700 block mb-1">Products Ordered</span>
                <div className="divide-y divide-stone-100 border border-[#E5E0D8] rounded-2xl p-3 glass-panel space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=100&auto=format&fit=crop'}
                          alt={item.productName || item.product?.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#E5E0D8] shrink-0"
                        />
                        <div>
                          <p className="font-bold text-[#0F291E]">{item.productName || item.product?.name}</p>
                          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                            <span>₹{item.unitPrice} × {item.quantity}</span>
                            {item.size && (
                              <span className="bg-sky-50 text-indigo-700 px-1.5 py-0.5 rounded border border-sky-200 font-mono font-bold text-[10px]">
                                Size: {item.size}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-[#0F291E]">₹{item.totalPrice}</span>
                    </div>
                  ))}

                  <div className="flex justify-between font-bold text-[#0F291E] text-sm pt-3 border-t border-[#E5E0D8]">
                    <span>Total Amount Paid:</span>
                    <span>₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => handleRetryShipment(selectedOrder._id)}
                  disabled={retryingId === selectedOrder._id}
                  className="px-4 py-2 bg-[#0F291E] hover:bg-[#09271E] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${retryingId === selectedOrder._id ? 'animate-spin' : ''}`} />
                  <span>Retry / Sync Shipment API</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2 bg-stone-200 hover:bg-stone-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


