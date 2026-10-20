import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  AlertTriangle,
  XCircle,
  PlusCircle,
  MinusCircle,
  Sliders,
  History,
  Truck,
  ShoppingCart,
  RotateCcw,
  ShieldAlert,
  BarChart3,
  Search,
  RefreshCw,
  CheckCircle2,
  Box,
  X,
  Printer,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Building2,
  UserCheck
} from 'lucide-react';
import { businessService } from '../../services/businessService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES_LIST = [
  'ALL',
  'Workout Essentials',
  'Hiking & Trekking',
  'Shoes',
  'Bags & Backpacks',
  'Sport Accessories',
  'Nutrition & Care'
];

export const InventoryStaffApp = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') || 'dashboard';

  // Redirect legacy tabs cleanly
  const currentTab = (() => {
    if (['stock-in', 'stock-out', 'stock-adjust'].includes(rawTab)) return 'stock-management';
    if (['low-stock', 'out-of-stock'].includes(rawTab)) return 'products';
    if (['returns', 'damaged'].includes(rawTab)) return 'returns-damaged';
    return rawTab;
  })();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Real MongoDB Telemetry States
  const [telemetry, setTelemetry] = useState(null);
  const [products, setProducts] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [orders, setOrders] = useState([]);
  const [returnsList, setReturnsList] = useState([]);

  // Product & Stock View Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStockStatus, setSelectedStockStatus] = useState('ALL');

  // Stock Movement History Filters
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState('ALL');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('ALL');

  // Unified Stock Management Form State
  const [stockOpType, setStockOpType] = useState('stockIn'); // 'stockIn' | 'stockOut' | 'stockAdjust'
  const [stockOpForm, setStockOpForm] = useState({
    productId: '',
    quantity: 1,
    reason: 'Purchase Received',
    notes: '',
    reference: '',
    adjustmentMode: 'Addition' // 'Addition' | 'Deduction'
  });
  const [submittingStockOp, setSubmittingStockOp] = useState(false);

  // Purchase Receiving Form State
  const [receivingForm, setReceivingForm] = useState({
    productId: '',
    quantity: 1,
    reference: '',
    notes: ''
  });
  const [submittingReceiving, setSubmittingReceiving] = useState(false);

  // Combined Returns & Damaged Stock Sub-Tab State
  const [rdSubTab, setRdSubTab] = useState('returns'); // 'returns' | 'damaged'

  // Damage Form State (Inside Returns & Damaged Stock Page)
  const [damageForm, setDamageForm] = useState({
    productId: '',
    quantity: 1,
    reason: 'Damaged in warehouse / transit',
    notes: ''
  });
  const [submittingDamage, setSubmittingDamage] = useState(false);

  // Fetch initial telemetry & real data from MongoDB
  const fetchAllInventoryData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, ledgerRes, ordersRes, returnsRes] = await Promise.all([
        businessService.getInventoryDashboardStats(),
        businessService.getProducts({ status: 'ALL' }),
        businessService.getInventoryLedger({}),
        businessService.getOrders(),
        businessService.getReturns()
      ]);

      if (statsRes?.success) setTelemetry(statsRes.data);
      if (prodRes?.success) {
        const fetchedProds = prodRes.data?.products || [];
        setProducts(fetchedProds);
        // Set default selected product ID if not set
        if (fetchedProds.length > 0) {
          setStockOpForm((prev) => ({ ...prev, productId: prev.productId || fetchedProds[0]._id }));
          setReceivingForm((prev) => ({ ...prev, productId: prev.productId || fetchedProds[0]._id }));
          setDamageForm((prev) => ({ ...prev, productId: prev.productId || fetchedProds[0]._id }));
        }
      }
      if (ledgerRes?.success) setLedger(ledgerRes.data?.ledger || []);
      if (ordersRes?.success) setOrders(ordersRes.data?.orders || []);
      if (returnsRes?.success) setReturnsList(returnsRes.data?.returns || []);
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      addToast('Failed to sync real inventory data from server', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllInventoryData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllInventoryData();
  };

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // Helper to open Stock Management with preselected product & operation
  const openStockManagementWithProduct = (prodId, op = 'stockIn') => {
    setStockOpType(op);
    setStockOpForm({
      productId: prodId,
      quantity: 1,
      reason: op === 'stockIn' ? 'Purchase Received' : op === 'stockOut' ? 'Stock Out' : 'Inventory Correction',
      notes: '',
      reference: '',
      adjustmentMode: 'Addition'
    });
    handleTabChange('stock-management');
  };

  // UNIFIED STOCK MANAGEMENT SUBMISSION HANDLER
  const handleStockOperationSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(stockOpForm.quantity);
    if (!stockOpForm.productId) {
      addToast('Please select a product', 'error');
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      addToast('Quantity must be greater than zero', 'error');
      return;
    }

    const targetProd = products.find((p) => p._id === stockOpForm.productId);
    if (!targetProd) {
      addToast('Selected product was not found', 'error');
      return;
    }

    // Prevent negative stock on Stock Out or Deduction adjustment
    if (stockOpType === 'stockOut' && targetProd.stock < qty) {
      addToast(`Cannot issue Stock Out: requested quantity (${qty}) exceeds available stock (${targetProd.stock})`, 'error');
      return;
    }
    if (stockOpType === 'stockAdjust' && stockOpForm.adjustmentMode === 'Deduction' && targetProd.stock < qty) {
      addToast(`Cannot deduct stock: deduction quantity (${qty}) exceeds current stock (${targetProd.stock})`, 'error');
      return;
    }

    setSubmittingStockOp(true);
    try {
      let res;
      if (stockOpType === 'stockIn') {
        res = await businessService.stockIn({
          productId: stockOpForm.productId,
          quantity: qty,
          reference: stockOpForm.reference || stockOpForm.reason || 'Stock In',
          notes: stockOpForm.notes
        });
      } else if (stockOpType === 'stockOut') {
        res = await businessService.stockOut({
          productId: stockOpForm.productId,
          quantity: qty,
          reference: stockOpForm.reference || stockOpForm.reason || 'Stock Out',
          notes: stockOpForm.notes
        });
      } else if (stockOpType === 'stockAdjust') {
        const delta = stockOpForm.adjustmentMode === 'Deduction' ? -Math.abs(qty) : Math.abs(qty);
        res = await businessService.adjustStock({
          productId: stockOpForm.productId,
          transactionType: 'Adjustment',
          quantity: delta,
          reference: stockOpForm.reference || stockOpForm.reason || 'Manual Adjustment',
          notes: stockOpForm.notes
        });
      }

      if (res?.success) {
        addToast(
          stockOpType === 'stockIn'
            ? `Stock In recorded successfully (+${qty} units)!`
            : stockOpType === 'stockOut'
            ? `Stock Out completed successfully (-${qty} units)!`
            : `Stock adjustment recorded cleanly!`,
          'success'
        );
        // Reset quantity/notes
        setStockOpForm((prev) => ({ ...prev, quantity: 1, notes: '', reference: '' }));
        fetchAllInventoryData();
      } else {
        addToast(res?.message || 'Stock operation failed', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Stock operation failed', 'error');
    } finally {
      setSubmittingStockOp(false);
    }
  };

  // PURCHASE RECEIVING SUBMISSION HANDLER
  const handleReceivingSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(receivingForm.quantity);
    if (!receivingForm.productId || isNaN(qty) || qty <= 0) {
      addToast('Please select a valid product and enter a positive quantity', 'error');
      return;
    }
    setSubmittingReceiving(true);
    try {
      const res = await businessService.stockIn({
        productId: receivingForm.productId,
        quantity: qty,
        reference: receivingForm.reference || 'Purchase Order Received',
        notes: receivingForm.notes || 'Incoming stock received into inventory'
      });
      if (res?.success) {
        addToast(`Successfully received ${qty} units into stock!`, 'success');
        setReceivingForm((prev) => ({ ...prev, quantity: 1, reference: '', notes: '' }));
        fetchAllInventoryData();
      } else {
        addToast(res?.message || 'Failed to receive stock', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Receiving stock failed', 'error');
    } finally {
      setSubmittingReceiving(false);
    }
  };

  // DAMAGE STOCK SUBMISSION HANDLER (Inside Returns & Damaged Stock Page)
  const handleDamageSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(damageForm.quantity);
    if (!damageForm.productId || isNaN(qty) || qty <= 0) {
      addToast('Please select a valid product and enter a positive quantity', 'error');
      return;
    }
    const targetProd = products.find((p) => p._id === damageForm.productId);
    if (targetProd && targetProd.stock < qty) {
      addToast(`Damaged quantity (${qty}) cannot exceed available stock (${targetProd.stock})`, 'error');
      return;
    }
    setSubmittingDamage(true);
    try {
      const res = await businessService.recordDamage({
        productId: damageForm.productId,
        quantity: qty,
        reason: damageForm.reason || 'Damaged Stock',
        notes: damageForm.notes
      });
      if (res?.success) {
        addToast(`Damaged stock logged! ${qty} units deducted from sellable inventory.`, 'success');
        setDamageForm((prev) => ({ ...prev, quantity: 1, notes: '' }));
        fetchAllInventoryData();
      } else {
        addToast(res?.message || 'Failed to record damaged stock', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Damage record failed', 'error');
    } finally {
      setSubmittingDamage(false);
    }
  };

  // ORDER STATUS UPDATE HANDLER
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await businessService.updateOrderStatus(orderId, newStatus);
      if (res?.success) {
        addToast(`Order status updated to '${newStatus}'!`, 'success');
        fetchAllInventoryData();
      } else {
        addToast(res?.message || 'Failed to update order status', 'error');
      }
    } catch (err) {
      addToast('Failed to update order status', 'error');
    }
  };

  // RETURN INSPECTION HANDLER
  const handleProcessReturnInspection = async (returnId, inspectStatus) => {
    try {
      const res = await businessService.processReturn(returnId, { status: 'Approved', inspectStatus });
      if (res?.success) {
        addToast(`Return processed as '${inspectStatus}'. Inventory updated!`, 'success');
        fetchAllInventoryData();
      } else {
        addToast(res?.message || 'Inspection failed', 'error');
      }
    } catch (err) {
      addToast('Failed to process return', 'error');
    }
  };

  // Filtered Products for Products & Stock Page
  const getFilteredProducts = () => {
    return products.filter((p) => {
      // Category Filter (Exact matching against 6 categories)
      const pCatName = p.category?.name || p.categoryName || 'General';
      if (selectedCategory !== 'ALL' && pCatName.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Stock Status Filter
      if (selectedStockStatus === 'Low Stock' && (p.stock === 0 || p.stock > (p.reorderLevel || 10))) return false;
      if (selectedStockStatus === 'Out of Stock' && p.stock !== 0) return false;
      if (selectedStockStatus === 'In Stock' && p.stock <= (p.reorderLevel || 10)) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchSKU = p.sku?.toLowerCase().includes(q);
        const matchCat = pCatName.toLowerCase().includes(q);
        return matchName || matchSKU || matchCat;
      }

      return true;
    });
  };

  const filteredProductsList = getFilteredProducts();
  const lowStockProductsList = products.filter((p) => p.stock > 0 && p.stock <= (p.reorderLevel || 10));
  const outOfStockProductsList = products.filter((p) => p.stock === 0);

  // Target active product object for Stock Management Page
  const selectedStockProd = products.find((p) => p._id === stockOpForm.productId) || products[0];

  return (
    <div className="space-y-8 pb-12 font-sans text-slate-800">
      {/* Premium Forest & Midnight Portal Header */}
      <div className="bg-gradient-to-r from-[#060D1A] via-[#0F291E] to-[#1E3E62] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#1E3E62]/50 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-400/30">
              Role: Inventory Staff
            </span>
            <span className="text-slate-300 text-xs font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live MongoDB Telemetry
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Inventory & Stock Control Hub
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Real-time stock management, product inventory, movement history ledger, receiving, and return inspections.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2.5 bg-[#1E3E62]/80 hover:bg-[#1E3E62] text-white rounded-2xl text-xs font-extrabold flex items-center gap-2 border border-sky-400/30 shadow-xs cursor-pointer transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-300 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          <button
            onClick={() => handleTabChange('stock-management')}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#060D1A] font-black rounded-2xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Sliders className="w-4 h-4 text-[#060D1A]" />
            <span>Stock Management</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Views */}
      <div className="space-y-6">

        {/* 1. DASHBOARD TAB */}
        {currentTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Real MongoDB Telemetry Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3 relative overflow-hidden group hover:border-emerald-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Products</span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-slate-900">{telemetry?.totalProducts || products.length}</span>
                  <span className="text-[11px] text-emerald-700 font-bold">In Catalog</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3 relative overflow-hidden group hover:border-emerald-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Available Stock</span>
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center font-bold">
                    <Box className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-slate-900">
                    {telemetry?.totalAvailableStock ?? products.reduce((acc, p) => acc + (p.stock || 0), 0)}
                  </span>
                  <span className="text-[11px] text-sky-700 font-bold">Units Available</span>
                </div>
              </div>

              <div
                onClick={() => handleTabChange('products')}
                className="bg-white rounded-3xl p-6 border border-amber-200 bg-amber-50/20 shadow-xs space-y-3 relative overflow-hidden group hover:border-amber-400 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800">Low-Stock Items</span>
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-amber-900">{telemetry?.lowStockProducts ?? lowStockProductsList.length}</span>
                  <span className="text-[11px] text-amber-700 font-extrabold underline">View Products →</span>
                </div>
              </div>

              <div
                onClick={() => handleTabChange('products')}
                className="bg-white rounded-3xl p-6 border border-rose-200 bg-rose-50/20 shadow-xs space-y-3 relative overflow-hidden group hover:border-rose-400 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800">Out-of-Stock Items</span>
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                    <XCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-rose-900">{telemetry?.outOfStockProducts ?? outOfStockProductsList.length}</span>
                  <span className="text-[11px] text-rose-700 font-extrabold underline">View Out of Stock →</span>
                </div>
              </div>
            </div>

            {/* Dashboard 2-Column Real Activity Feeds */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Feed 1: Recent Stock Movements */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <History className="w-5 h-5 text-emerald-700" /> Recent Stock Movements
                  </h3>
                  <button onClick={() => handleTabChange('movement-history')} className="text-xs text-emerald-700 font-bold hover:underline">
                    View Full History →
                  </button>
                </div>

                {(!telemetry?.recentMovements || telemetry.recentMovements.length === 0) ? (
                  <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200/70 space-y-2">
                    <History className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">No stock movements recorded yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {telemetry.recentMovements.slice(0, 5).map((m) => {
                      const mImg = m.product?.images?.[0] || '/images/cat_workout_essentials.jpg';
                      const isAddition = ['Purchase', 'Return', 'Stock In'].includes(m.transactionType);
                      return (
                        <div key={m._id} className="py-3 flex items-center justify-between text-xs gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-stone-50 p-1 flex items-center justify-center border border-stone-200 shrink-0 overflow-hidden">
                              <img src={mImg} alt={m.product?.name} className="w-full h-full object-contain" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{m.product?.name || 'Product'}</p>
                              <span className="text-[10px] text-slate-400 block">{new Date(m.createdAt).toLocaleDateString()} • {m.reference || m.transactionType}</span>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shrink-0 ${
                            isAddition
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {isAddition ? `+${m.quantity}` : `-${m.quantity}`} {m.transactionType}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Feed 2: Orders Requiring Processing */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-emerald-700" /> Recent Orders
                  </h3>
                  <button onClick={() => handleTabChange('orders')} className="text-xs text-emerald-700 font-bold hover:underline">
                    Order Processing →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200/70 space-y-2">
                    <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">No customer orders available.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o._id} className="py-3 flex items-center justify-between text-xs gap-3">
                        <div>
                          <p className="font-mono font-extrabold text-slate-900">{o.orderNumber || o._id}</p>
                          <p className="text-[10px] text-slate-400">Customer: {o.customer?.fullName || 'Customer'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">₹{o.totalAmount?.toLocaleString('en-IN')}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {o.status || 'Placed'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dashboard Secondary Feeds: Returns/Damaged Stock */}
            <div className="grid grid-cols-1 gap-8">

              {/* Recent Returns & Damaged Stock */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-emerald-700" /> Recent Returns & Damaged Stock
                  </h3>
                  <button onClick={() => handleTabChange('returns-damaged')} className="text-xs text-emerald-700 font-bold hover:underline">
                    Manage Returns & Damaged →
                  </button>
                </div>
                {returnsList.length === 0 && (!telemetry?.recentDamages || telemetry.recentDamages.length === 0) ? (
                  <p className="text-xs text-slate-400 italic p-4 text-center">No recent returns or damaged stock records.</p>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {returnsList.slice(0, 3).map((r) => (
                      <div key={r._id} className="py-2.5 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 truncate max-w-[200px]">Return: {r.product?.name}</span>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md font-bold text-[10px]">Inspect Return</span>
                      </div>
                    ))}
                    {telemetry?.recentDamages?.slice(0, 2).map((d) => (
                      <div key={d._id} className="py-2.5 flex items-center justify-between text-xs">
                        <span className="font-bold text-rose-900 truncate max-w-[200px]">Damaged: {d.product?.name}</span>
                        <span className="font-bold text-rose-700">-{d.quantity} Units</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. PRODUCTS & STOCK TAB */}
        {currentTab === 'products' && (
          <div className="space-y-6">
            {/* Category Filter & Search Bar */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* 6 Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Category:
                  </span>
                  {CATEGORIES_LIST.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-[#0F291E] text-white shadow-xs font-bold'
                          : 'bg-stone-100 hover:bg-stone-200 text-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search & Stock Filter */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="relative flex-1 sm:w-60">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search product name, SKU..."
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#0F291E]"
                    />
                  </div>

                  <select
                    value={selectedStockStatus}
                    onChange={(e) => setSelectedStockStatus(e.target.value)}
                    className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="ALL">All Stock Statuses</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProductsList.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-slate-500 space-y-3">
                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-800 text-base">No products match your search or filter.</p>
                <p className="text-xs text-slate-400">Try changing the category or search keywords.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProductsList.map((product) => {
                  const pImg = product.images?.[0] || '/images/cat_workout_essentials.jpg';
                  const isLow = product.stock > 0 && product.stock <= (product.reorderLevel || 10);
                  const isOut = product.stock === 0;
                  const catName = product.category?.name || product.categoryName || 'General';

                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between group hover:shadow-md hover:border-emerald-300 transition-all duration-300"
                    >
                      <div>
                        {/* Image Container with Fallback */}
                        <div className="h-48 bg-stone-50 p-4 relative flex items-center justify-center border-b border-stone-100 overflow-hidden">
                          <img
                            src={pImg}
                            alt={product.name}
                            onError={(e) => { e.target.src = '/images/cat_workout_essentials.jpg'; }}
                            className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                          />
                          <span
                            className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              isOut
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : isLow
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                        </div>

                        {/* Product Info */}
                        <div className="p-5 space-y-2">
                          <span className="inline-block bg-stone-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Category: {catName}
                          </span>
                          <h4 className="font-serif font-extrabold text-slate-900 text-base leading-snug line-clamp-1">
                            {product.name}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                            <span>SKU: {product.sku || 'N/A'}</span>
                            <span className="font-extrabold text-slate-900 text-sm font-sans">₹{product.price?.toLocaleString('en-IN')}</span>
                          </div>

                          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Available Stock:</span>
                            <span className={`font-black text-sm ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                              {product.stock} units
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stock Action Button */}
                      <div className="p-4 bg-stone-50 border-t border-stone-100">
                        <button
                          onClick={() => openStockManagementWithProduct(product._id, 'stockIn')}
                          className="w-full py-2 bg-[#0F291E] hover:bg-[#1E3E62] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5 text-emerald-300" /> Manage Stock
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. UNIFIED STOCK MANAGEMENT TAB */}
        {currentTab === 'stock-management' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs max-w-3xl mx-auto space-y-6">
            <div className="border-b border-stone-100 pb-4 space-y-1">
              <h3 className="font-serif font-extrabold text-slate-900 text-xl flex items-center gap-2">
                <Sliders className="w-6 h-6 text-emerald-700" /> Unified Stock Management
              </h3>
              <p className="text-xs text-slate-500">
                Manage inventory additions (Stock In), deductions (Stock Out), or custom quantity adjustments from a single view.
              </p>
            </div>

            {/* Operation Selector Pills */}
            <div className="grid grid-cols-3 gap-3 p-1.5 bg-stone-100 rounded-2xl border border-stone-200">
              <button
                type="button"
                onClick={() => setStockOpType('stockIn')}
                className={`py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  stockOpType === 'stockIn'
                    ? 'bg-[#0F291E] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PlusCircle className={`w-4 h-4 ${stockOpType === 'stockIn' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>Stock In</span>
              </button>

              <button
                type="button"
                onClick={() => setStockOpType('stockOut')}
                className={`py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  stockOpType === 'stockOut'
                    ? 'bg-[#0F291E] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MinusCircle className={`w-4 h-4 ${stockOpType === 'stockOut' ? 'text-rose-400' : 'text-slate-400'}`} />
                <span>Stock Out</span>
              </button>

              <button
                type="button"
                onClick={() => setStockOpType('stockAdjust')}
                className={`py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  stockOpType === 'stockAdjust'
                    ? 'bg-[#0F291E] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className={`w-4 h-4 ${stockOpType === 'stockAdjust' ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>Stock Adjustment</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleStockOperationSubmit} className="space-y-5">
              {/* Product Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Select Product</label>
                <select
                  value={stockOpForm.productId}
                  onChange={(e) => setStockOpForm({ ...stockOpForm, productId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold outline-none focus:border-[#0F291E]"
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (Cat: {p.category?.name || p.categoryName || 'General'} | Current Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Product Details Card */}
              {selectedStockProd && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF9F6] to-slate-50 border border-stone-200 flex items-center gap-4">
                  <img
                    src={selectedStockProd.images?.[0] || '/images/cat_workout_essentials.jpg'}
                    alt="Product"
                    onError={(e) => { e.target.src = '/images/cat_workout_essentials.jpg'; }}
                    className="w-16 h-16 object-contain rounded-xl bg-white p-1 border border-stone-200 shrink-0"
                  />
                  <div className="text-xs space-y-0.5">
                    <p className="font-serif font-bold text-slate-900 text-sm">{selectedStockProd.name}</p>
                    <p className="text-slate-500">Category: <strong className="text-slate-800">{selectedStockProd.category?.name || selectedStockProd.categoryName || 'General'}</strong></p>
                    <p className="text-slate-500">SKU: <strong className="text-slate-800">{selectedStockProd.sku || 'N/A'}</strong></p>
                    <p className="text-slate-500">Current Stock: <strong className="text-emerald-700 font-extrabold">{selectedStockProd.stock} units</strong></p>
                  </div>
                </div>
              )}

              {/* Operation Specific Fields */}
              {stockOpType === 'stockAdjust' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Adjustment Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setStockOpForm({ ...stockOpForm, adjustmentMode: 'Addition' })}
                      className={`py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        stockOpForm.adjustmentMode === 'Addition'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-stone-50 border-stone-200 text-slate-600'
                      }`}
                    >
                      + Add Stock (Addition)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStockOpForm({ ...stockOpForm, adjustmentMode: 'Deduction' })}
                      className={`py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        stockOpForm.adjustmentMode === 'Deduction'
                          ? 'bg-rose-50 border-rose-300 text-rose-800'
                          : 'bg-stone-50 border-stone-200 text-slate-600'
                      }`}
                    >
                      - Deduct Stock (Deduction)
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    {stockOpType === 'stockIn' ? 'Quantity to Add' : stockOpType === 'stockOut' ? 'Quantity to Remove' : 'Quantity / Delta'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={stockOpForm.quantity}
                    onChange={(e) => setStockOpForm({ ...stockOpForm, quantity: e.target.value })}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#0F291E]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Reason / Reference</label>
                  <input
                    type="text"
                    value={stockOpForm.reference || stockOpForm.reason}
                    onChange={(e) => setStockOpForm({ ...stockOpForm, reference: e.target.value, reason: e.target.value })}
                    placeholder={
                      stockOpType === 'stockIn'
                        ? 'e.g. Supplier PO #1042'
                        : stockOpType === 'stockOut'
                        ? 'e.g. Customer Order #ORD-88'
                        : 'e.g. Inventory Audit Count'
                    }
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#0F291E]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Notes (Optional)</label>
                <textarea
                  value={stockOpForm.notes}
                  onChange={(e) => setStockOpForm({ ...stockOpForm, notes: e.target.value })}
                  placeholder="Additional stock operation notes..."
                  rows="3"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#0F291E]"
                />
              </div>

              {/* Confirmation Button */}
              <button
                type="submit"
                disabled={submittingStockOp}
                className="w-full py-3 bg-[#0F291E] hover:bg-[#1E3E62] text-white font-extrabold rounded-2xl text-xs cursor-pointer shadow-md transition-all active:scale-95"
              >
                {submittingStockOp
                  ? 'Processing Stock Transaction...'
                  : stockOpType === 'stockIn'
                  ? 'Confirm Stock In (+Inventory)'
                  : stockOpType === 'stockOut'
                  ? 'Confirm Stock Out (-Inventory)'
                  : 'Confirm Stock Adjustment'}
              </button>
            </form>
          </div>
        )}

        {/* 4. STOCK MOVEMENT HISTORY TAB */}
        {currentTab === 'movement-history' && (() => {
          const filteredLedger = ledger.filter((m) => {
            if (historyTypeFilter !== 'ALL' && m.transactionType !== historyTypeFilter) return false;
            const catName = m.product?.category?.name || m.product?.categoryName || (typeof m.product?.category === 'string' ? m.product?.category : 'General');
            if (historyCategoryFilter !== 'ALL' && catName.toLowerCase() !== historyCategoryFilter.toLowerCase()) return false;
            if (historySearchQuery.trim()) {
              const q = historySearchQuery.toLowerCase();
              const pName = m.product?.name?.toLowerCase() || '';
              const pSku = m.product?.sku?.toLowerCase() || '';
              const ref = m.reference?.toLowerCase() || '';
              const notes = m.notes?.toLowerCase() || '';
              const staff = m.user?.fullName?.toLowerCase() || '';
              const opType = m.transactionType?.toLowerCase() || '';
              return pName.includes(q) || pSku.includes(q) || ref.includes(q) || notes.includes(q) || staff.includes(q) || opType.includes(q) || catName.toLowerCase().includes(q);
            }
            return true;
          });

          // Dynamic statistics calculated directly from filteredLedger
          const totalAdditions = filteredLedger.filter(m => ['Purchase', 'Return', 'Stock In'].includes(m.transactionType)).reduce((acc, m) => acc + (m.quantity || 0), 0);
          const totalDeductions = filteredLedger.filter(m => ['Sale', 'Damage', 'Stock Out'].includes(m.transactionType)).reduce((acc, m) => acc + (m.quantity || 0), 0);
          const totalAdjustments = filteredLedger.filter(m => m.transactionType === 'Adjustment').length;

          const isFiltered = historyCategoryFilter !== 'ALL' || historyTypeFilter !== 'ALL' || historySearchQuery.trim() !== '';

          const clearHistoryFilters = () => {
            setHistoryCategoryFilter('ALL');
            setHistoryTypeFilter('ALL');
            setHistorySearchQuery('');
          };

          return (
            <div className="space-y-6">
              {/* Dynamic Summary Stats Counter Header */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                    <History className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      {isFiltered ? 'Filtered Logs' : 'Total Logs'}
                    </span>
                    <span className="text-2xl font-black text-slate-900">{filteredLedger.length}</span>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {isFiltered ? `Out of ${ledger.length} total entries` : 'Recorded in MongoDB'}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-emerald-100 bg-emerald-50/20 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <ArrowUpRight className="w-6 h-6 text-[#060D1A]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">Units Received (+)</span>
                    <span className="text-2xl font-black text-emerald-950">+{totalAdditions}</span>
                    <span className="text-[10px] text-emerald-700 block font-bold">Purchases & Restocks</span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-rose-100 bg-rose-50/20 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <ArrowDownRight className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 block">Units Dispatched (-)</span>
                    <span className="text-2xl font-black text-rose-950">-{totalDeductions}</span>
                    <span className="text-[10px] text-rose-700 block font-bold">Sales & Damages</span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-sky-100 bg-sky-50/20 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <Sliders className="w-6 h-6 text-[#060D1A]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800 block">Audit Corrections</span>
                    <span className="text-2xl font-black text-sky-950">{totalAdjustments}</span>
                    <span className="text-[10px] text-sky-700 block font-bold">Manual Adjustments</span>
                  </div>
                </div>
              </div>

              {/* Active Filters Bar if any filter is active */}
              {isFiltered && (
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3 px-4 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-emerald-900">Active Ledger Filters:</span>
                    {historyCategoryFilter !== 'ALL' && (
                      <span className="bg-white text-emerald-800 font-bold px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        Category: {historyCategoryFilter}
                      </span>
                    )}
                    {historyTypeFilter !== 'ALL' && (
                      <span className="bg-white text-emerald-800 font-bold px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        Operation: {historyTypeFilter}
                      </span>
                    )}
                    {historySearchQuery.trim() && (
                      <span className="bg-white text-emerald-800 font-bold px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        Search: "{historySearchQuery}"
                      </span>
                    )}
                  </div>
                  <button
                    onClick={clearHistoryFilters}
                    className="text-emerald-700 hover:text-emerald-900 font-extrabold underline shrink-0 cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}

              {/* Main Table Card Container */}
              <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 space-y-6">
                {/* Header & Controls Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-5">
                  <div>
                    <h3 className="font-serif font-extrabold text-slate-900 text-xl flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#0F291E] text-emerald-400 flex items-center justify-center">
                        <History className="w-4 h-4" />
                      </div>
                      Audit Movement History Ledger
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Immutable record of all stock transactions with real timestamps, quantities, and staff signatures.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Ledger Search */}
                    <div className="relative flex-1 sm:w-56">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={historySearchQuery}
                        onChange={(e) => setHistorySearchQuery(e.target.value)}
                        placeholder="Search product, ref, staff..."
                        className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#0F291E]"
                      />
                    </div>

                    {/* Category Filter */}
                    <select
                      value={historyCategoryFilter}
                      onChange={(e) => setHistoryCategoryFilter(e.target.value)}
                      className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                    >
                      <option value="ALL">All Categories</option>
                      {CATEGORIES_LIST.filter((c) => c !== 'ALL').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    {/* Operation Type Filter */}
                    <select
                      value={historyTypeFilter}
                      onChange={(e) => setHistoryTypeFilter(e.target.value)}
                      className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                    >
                      <option value="ALL">All Operations</option>
                      <option value="Purchase">Purchase (Stock In)</option>
                      <option value="Sale">Sale (Stock Out)</option>
                      <option value="Return">Return</option>
                      <option value="Damage">Damage</option>
                      <option value="Adjustment">Adjustment</option>
                    </select>

                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-stone-200 cursor-pointer transition-colors"
                      title="Print Ledger Report"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                  </div>
                </div>

                {/* Ledger Table */}
                {filteredLedger.length === 0 ? (
                  <div className="p-12 text-center bg-stone-50 rounded-2xl text-slate-500 space-y-2 border border-stone-200/60">
                    <History className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-800 text-sm">No matching stock movement logs found.</p>
                    <p className="text-xs text-slate-400">Try clearing search keywords or selecting different category filters.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-stone-200/80 shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#060D1A] text-slate-300 font-mono text-[11px] uppercase tracking-wider">
                          <th className="py-3.5 px-4 font-bold">Date & Time</th>
                          <th className="py-3.5 px-4 font-bold">Product Item</th>
                          <th className="py-3.5 px-4 font-bold">Category</th>
                          <th className="py-3.5 px-4 font-bold">Operation Type</th>
                          <th className="py-3.5 px-4 font-bold text-center">Qty</th>
                          <th className="py-3.5 px-4 font-bold">Stock Delta</th>
                          <th className="py-3.5 px-4 font-bold">Reference / Notes</th>
                          <th className="py-3.5 px-4 font-bold">Staff Signature</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 bg-white">
                        {filteredLedger.map((m) => {
                          const mImg = m.product?.images?.[0] || '/images/cat_workout_essentials.jpg';
                          const catName = m.product?.category?.name || m.product?.categoryName || 'General';
                          const isAdd = ['Purchase', 'Return', 'Stock In'].includes(m.transactionType);
                          const isDamage = m.transactionType === 'Damage';
                          const isSale = m.transactionType === 'Sale';
                          const staffName = m.user?.fullName || 'Inventory Manager';
                          const staffInitial = staffName[0]?.toUpperCase() || 'I';

                          return (
                            <tr key={m._id} className="hover:bg-[#0F291E]/5 transition-all duration-150">
                              {/* Date & Time */}
                              <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-slate-800 block">
                                    {new Date(m.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block font-mono">
                                    {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                  </span>
                                </div>
                              </td>

                              {/* Product Item */}
                              <td className="py-3.5 px-4 font-bold text-slate-900">
                                <div className="flex items-center gap-3 min-w-[180px]">
                                  <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] p-1 flex items-center justify-center border border-stone-200 shadow-2xs shrink-0 overflow-hidden">
                                    <img
                                      src={mImg}
                                      alt={m.product?.name}
                                      onError={(e) => { e.target.src = '/images/cat_workout_essentials.jpg'; }}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-serif font-bold text-slate-900 text-xs sm:text-sm truncate">
                                      {m.product?.name || 'Product Item'}
                                    </p>
                                    <span className="text-[10px] font-mono text-slate-400 block">
                                      SKU: {m.product?.sku || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-stone-100 text-slate-700 border border-stone-200/80">
                                  {catName}
                                </span>
                              </td>

                              {/* Operation Type */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold shadow-2xs border ${
                                    isAdd
                                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300/80'
                                      : isDamage || isSale
                                      ? 'bg-rose-50 text-rose-900 border-rose-300/80'
                                      : 'bg-sky-50 text-sky-900 border-sky-300/80'
                                  }`}
                                >
                                  {isAdd ? (
                                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  ) : isDamage || isSale ? (
                                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                  ) : (
                                    <Sliders className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                  )}
                                  <span>{m.transactionType}</span>
                                </span>
                              </td>

                              {/* Quantity */}
                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                <span
                                  className={`font-black text-sm px-2.5 py-0.5 rounded-lg ${
                                    isAdd
                                      ? 'text-emerald-700 bg-emerald-50'
                                      : isDamage || isSale
                                      ? 'text-rose-700 bg-rose-50'
                                      : 'text-slate-900 bg-stone-100'
                                  }`}
                                >
                                  {isAdd ? `+${m.quantity}` : isDamage || isSale ? `-${m.quantity}` : `${m.quantity}`}
                                </span>
                              </td>

                              {/* Stock Delta */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-xl text-[11px] font-mono">
                                  <span className="text-slate-500">{m.previousStock}</span>
                                  <span className="text-slate-400 font-bold">→</span>
                                  <strong className="text-slate-900 font-extrabold">{m.newStock} units</strong>
                                </div>
                              </td>

                              {/* Reference / Notes */}
                              <td className="py-3.5 px-4 max-w-[200px]">
                                <div className="space-y-0.5">
                                  <span className="font-mono text-[11px] font-bold text-slate-800 block truncate">
                                    {m.reference || m.transactionType}
                                  </span>
                                  {m.notes && (
                                    <span className="text-[10px] text-slate-500 block truncate" title={m.notes}>
                                      {m.notes}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Staff Signature */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-[#1E3E62] text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-2xs border border-sky-400/30">
                                    {staffInitial}
                                  </div>
                                  <span className="text-xs font-semibold text-slate-800">{staffName}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Footer Count Bar */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-medium border-t border-stone-100">
                  <span>Showing <strong>{filteredLedger.length}</strong> of <strong>{ledger.length}</strong> total transaction entries</span>
                  <span className="font-mono text-[10px] text-slate-400">Sync status: Authenticated MongoDB Engine</span>
                </div>
              </div>
            </div>
          );
        })()}



        {/* 6. ORDER PROCESSING TAB */}
        {currentTab === 'orders' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="border-b border-stone-100 pb-4 space-y-1">
              <h3 className="font-serif font-extrabold text-slate-900 text-xl flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-emerald-700" /> Order Processing & Dispatch
              </h3>
              <p className="text-xs text-slate-500">Fulfill customer orders and progress order status through fulfillment workflow.</p>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center bg-stone-50 rounded-2xl text-slate-500 space-y-2">
                <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-800">No orders found requiring inventory processing.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const latestEv = order.shipmentEvents && order.shipmentEvents.length > 0 ? order.shipmentEvents[order.shipmentEvents.length - 1] : null;

                  return (
                    <div key={order._id} className="border border-stone-200 rounded-3xl p-6 space-y-4 bg-slate-50/40">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-3 text-xs">
                        <div className="space-y-0.5">
                          <span className="font-mono font-extrabold text-slate-900 text-sm">{order.orderNumber || order._id}</span>
                          <span className="text-slate-500 block text-[11px]">Customer: <strong>{order.customer?.fullName || order.shippingAddress?.fullName || 'Customer'}</strong></span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-slate-900 text-sm">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                          <span className="px-3 py-1 bg-stone-200 text-slate-800 rounded-xl text-xs font-bold">
                            Order Status: {order.status || 'Placed'}
                          </span>
                        </div>
                      </div>

                      {/* API Shipment Tracking Info Bar (Read-Only) */}
                      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 text-xs space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-sky-600" />
                            <span className="font-bold text-slate-900">Shipment Courier: {order.shipmentProvider || 'SwiftExpress Courier'}</span>
                            {order.trackingNumber && (
                              <span className="font-mono font-bold bg-stone-100 px-2.5 py-0.5 rounded-md text-[10px] text-slate-700">
                                #{order.trackingNumber}
                              </span>
                            )}
                          </div>
                          <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                            Shipment Status: {order.shipmentStatusText || order.shipmentStatus || 'ORDER_PLACED'}
                          </span>
                        </div>

                        {latestEv && (
                          <div className="text-[11px] text-slate-500 pt-1 border-t border-stone-100 flex items-center justify-between">
                            <span>Latest Event: <strong>{latestEv.description}</strong> ({latestEv.location})</span>
                            <span className="font-mono text-[10px]">{new Date(latestEv.timestamp).toLocaleTimeString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Items List */}
                      <div className="divide-y divide-stone-100">
                        {order.items?.map((item, i) => (
                          <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.productImage || item.product?.images?.[0] || '/images/cat_workout_essentials.jpg'}
                                alt=""
                                onError={(e) => { e.target.src = '/images/cat_workout_essentials.jpg'; }}
                                className="w-10 h-10 object-contain bg-white rounded-lg p-1 border"
                              />
                              <div>
                                <p className="font-bold text-slate-900">{item.productName || item.product?.name}</p>
                                <p className="text-[10px] text-slate-400">Qty: {item.quantity} • Category: {item.product?.category?.name || 'General'}</p>
                              </div>
                            </div>
                            <span className="font-bold text-slate-800">₹{(item.unitPrice || 0) * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 7. COMBINED RETURNS & DAMAGED STOCK TAB */}
        {currentTab === 'returns-damaged' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="border-b border-stone-100 pb-4 space-y-3">
              <h3 className="font-serif font-extrabold text-slate-900 text-xl flex items-center gap-2">
                <RotateCcw className="w-6 h-6 text-emerald-700" /> Returns & Damaged Stock Management
              </h3>

              {/* Sub-Tab Selector */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRdSubTab('returns')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    rdSubTab === 'returns'
                      ? 'bg-[#0F291E] text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-slate-700'
                  }`}
                >
                  Customer Returns Inspection
                </button>

                <button
                  type="button"
                  onClick={() => setRdSubTab('damaged')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    rdSubTab === 'damaged'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-slate-700'
                  }`}
                >
                  Damaged Stock Log & Control
                </button>
              </div>
            </div>

            {/* Sub-Tab 1: Customer Returns */}
            {rdSubTab === 'returns' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Inspect returned items from customers. Restock accepted usable items (+Stock) or mark damaged.
                </p>

                {returnsList.length === 0 ? (
                  <div className="p-12 text-center bg-stone-50 rounded-2xl text-slate-500 space-y-2">
                    <RotateCcw className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-800">No returns currently filed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {returnsList.map((ret) => (
                      <div key={ret._id} className="p-5 border border-stone-200 rounded-2xl bg-stone-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-4">
                          <img
                            src={ret.product?.images?.[0] || '/images/cat_workout_essentials.jpg'}
                            alt=""
                            onError={(e) => { e.target.src = '/images/cat_workout_essentials.jpg'; }}
                            className="w-12 h-12 object-contain bg-white rounded-xl p-1 border shrink-0"
                          />
                          <div className="space-y-0.5">
                            <p className="font-mono font-bold text-slate-900">{ret.returnNumber || ret._id}</p>
                            <p className="font-bold text-slate-800 text-sm">{ret.product?.name}</p>
                            <p className="text-[10px] text-slate-500">Reason: {ret.reason} • Customer: {ret.customer?.fullName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleProcessReturnInspection(ret._id, 'Restocked')}
                            className="px-3.5 py-2 bg-[#0F291E] hover:bg-[#1E3E62] text-white rounded-xl font-bold cursor-pointer shadow-xs"
                          >
                            Accept & Restock (+Stock)
                          </button>
                          <button
                            onClick={() => handleProcessReturnInspection(ret._id, 'Damaged')}
                            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer"
                          >
                            Mark Damaged (No Stock Add)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sub-Tab 2: Damaged Stock Control */}
            {rdSubTab === 'damaged' && (
              <div className="space-y-6">
                {/* Record Damaged Stock Form */}
                <form onSubmit={handleDamageSubmit} className="p-5 border border-rose-200 bg-rose-50/20 rounded-2xl space-y-4">
                  <h4 className="font-bold text-rose-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" /> Record Damaged Inventory Item
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Select Product</label>
                      <select
                        value={damageForm.productId}
                        onChange={(e) => setDamageForm({ ...damageForm, productId: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold"
                      >
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>{p.name} (Available Stock: {p.stock})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Damaged Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={damageForm.quantity}
                        onChange={(e) => setDamageForm({ ...damageForm, quantity: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Reason / Details</label>
                      <input
                        type="text"
                        value={damageForm.reason}
                        onChange={(e) => setDamageForm({ ...damageForm, reason: e.target.value })}
                        placeholder="e.g. Expired, Broken Packaging"
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingDamage}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-xs cursor-pointer"
                  >
                    {submittingDamage ? 'Processing...' : 'Record Damage & Deduct Stock'}
                  </button>
                </form>

                {/* Damaged Stock Log */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Damaged Stock Audit Log</h4>
                  {ledger.filter((m) => m.transactionType === 'Damage').length === 0 ? (
                    <div className="p-8 text-center bg-stone-50 rounded-2xl text-slate-500">
                      <p className="font-bold text-xs">No damaged stock recorded.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl p-4">
                      {ledger.filter((m) => m.transactionType === 'Damage').map((m) => (
                        <div key={m._id} className="py-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={m.product?.images?.[0] || '/images/cat_workout_essentials.jpg'}
                              alt=""
                              onError={(e) => { e.target.src = '/images/cat_workout_essentials.jpg'; }}
                              className="w-10 h-10 object-contain rounded-lg bg-white p-1 border"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{m.product?.name}</p>
                              <p className="text-[10px] text-slate-400">Reason: {m.reference || 'Damaged'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-rose-600 text-sm block">-{m.quantity} Units</span>
                            <span className="text-[10px] text-slate-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 8. INVENTORY REPORTS TAB */}
        {currentTab === 'reports' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-serif font-extrabold text-slate-900 text-xl flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-emerald-700" /> Real MongoDB Inventory Reports
                </h3>
                <p className="text-xs text-slate-500 mt-1">Exportable inventory metrics generated live from database records.</p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-stone-200 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print / Export PDF
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 border border-stone-200 rounded-2xl bg-stone-50/50 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Stock Summary Metrics</h4>
                <div className="text-xs space-y-2 text-slate-600">
                  <p className="flex justify-between border-b border-stone-200/50 pb-1"><span>Total Products:</span> <strong>{products.length}</strong></p>
                  <p className="flex justify-between border-b border-stone-200/50 pb-1"><span>Total Available Stock:</span> <strong>{products.reduce((a, b) => a + (b.stock || 0), 0)} units</strong></p>
                  <p className="flex justify-between border-b border-stone-200/50 pb-1"><span>Low-Stock Products:</span> <strong className="text-amber-600">{lowStockProductsList.length}</strong></p>
                  <p className="flex justify-between"><span>Out-of-Stock Products:</span> <strong className="text-rose-600">{outOfStockProductsList.length}</strong></p>
                </div>
              </div>

              <div className="p-5 border border-stone-200 rounded-2xl bg-stone-50/50 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Transaction Movements Breakdown</h4>
                <div className="text-xs space-y-2 text-slate-600">
                  <p className="flex justify-between border-b border-stone-200/50 pb-1"><span>Stock In / Received:</span> <strong>{ledger.filter(m => m.transactionType === 'Purchase').length} shipments</strong></p>
                  <p className="flex justify-between border-b border-stone-200/50 pb-1"><span>Stock Out / Dispatches:</span> <strong>{ledger.filter(m => m.transactionType === 'Sale').length} orders</strong></p>
                  <p className="flex justify-between border-b border-stone-200/50 pb-1"><span>Customer Returns:</span> <strong>{returnsList.length} returns</strong></p>
                  <p className="flex justify-between"><span>Damaged Stock Logs:</span> <strong>{ledger.filter(m => m.transactionType === 'Damage').length} logs</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
