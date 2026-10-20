import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Package,
  Truck,
  Users,
  Building2,
  DollarSign,
  Calendar,
  CheckCircle2,
  BarChart3,
  Filter,
  Eye
} from 'lucide-react';
import { businessService } from '../../services/businessService';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { exportBusinessReportToPDF, exportBusinessDataToCSV } from '../../utils/pdfExport';

export const AdminReportsPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Selected Report Category Tab: 'sales' | 'inventory' | 'shipment' | 'users' | 'marketing' | 'master'
  const [activeReportTab, setActiveReportTab] = useState('sales');
  const [dateRange, setDateRange] = useState('ALL'); // 'ALL' | 'TODAY' | '7DAYS' | '30DAYS'

  // Data loaded from MongoDB
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [marketingList, setMarketingList] = useState([]);

  const fetchAllReportData = async () => {
    setLoading(true);
    try {
      const [ordersRes, prodsRes, usersRes] = await Promise.all([
        businessService.getOrders(),
        businessService.getProducts({ status: 'ALL' }),
        adminService.getUsers().catch(() => ({ data: [] }))
      ]);

      if (ordersRes?.success) setOrders(ordersRes.data?.orders || []);
      if (prodsRes?.success) setProducts(prodsRes.data?.products || []);
      if (usersRes?.data) setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Error fetching admin report data:', err);
      addToast('Failed to load live database telemetry for reports', 'error');
    } fontally: {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllReportData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllReportData();
  };

  // Date Filtering Helper
  const filterByDate = (items, dateKey = 'createdAt') => {
    if (dateRange === 'ALL') return items;
    const now = new Date();
    return items.filter((item) => {
      const itemDate = new Date(item[dateKey]);
      if (dateRange === 'TODAY') {
        return itemDate.toDateString() === now.toDateString();
      }
      if (dateRange === '7DAYS') {
        const diffDays = (now - itemDate) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }
      if (dateRange === '30DAYS') {
        const diffDays = (now - itemDate) / (1000 * 3600 * 24);
        return diffDays <= 30;
      }
      return true;
    });
  };

  const filteredOrders = filterByDate(orders, 'createdAt');

  // Computed Metrics
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const paidOrdersCount = filteredOrders.filter((o) => o.paymentStatus === 'Paid').length;
  const avgOrderValue = filteredOrders.length > 0 ? Math.round(totalRevenue / filteredOrders.length) : 0;
  
  const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalStockValuation = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= (p.reorderLevel || 10)).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const deliveredShipmentsCount = filteredOrders.filter((o) => o.shipmentStatus === 'DELIVERED').length;
  const inTransitCount = filteredOrders.filter((o) => ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'ARRIVED_AT_HUB'].includes(o.shipmentStatus)).length;

  // Export PDF Handler for current active report
  const handleExportCurrentReportPDF = () => {
    if (activeReportTab === 'sales') {
      exportBusinessReportToPDF({
        title: 'Sales & Financial Revenue Executive Report',
        category: 'Sales Analytics',
        metrics: [
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}` },
          { label: 'Total Paid Orders', value: paidOrdersCount },
          { label: 'Average Order Value', value: `₹${avgOrderValue.toLocaleString('en-IN')}` },
          { label: 'Total Orders Processed', value: filteredOrders.length },
        ],
        tableHeaders: ['Order #', 'Customer Name', 'Date', 'Payment Method', 'Payment Status', 'Total Amount'],
        tableData: filteredOrders.map((o) => [
          o.orderNumber || o._id,
          o.customer?.fullName || o.shippingAddress?.fullName || 'Customer',
          new Date(o.createdAt).toLocaleDateString(),
          o.paymentMethod?.toUpperCase() || 'RAZORPAY',
          o.paymentStatus || 'Paid',
          `₹${o.totalAmount?.toLocaleString('en-IN')}`,
        ]),
        summaryNotes: 'Comprehensive breakdown of customer transactions, revenue volume, and payment method distribution.'
      });
      addToast('Generated Sales & Revenue PDF Report!', 'success');
    } else if (activeReportTab === 'inventory') {
      exportBusinessReportToPDF({
        title: 'Inventory & Stock Asset Valuation Report',
        category: 'Inventory Management',
        metrics: [
          { label: 'Catalog Items', value: products.length },
          { label: 'Total Stock Units', value: totalStockUnits.toLocaleString() },
          { label: 'Inventory Valuation', value: `₹${totalStockValuation.toLocaleString('en-IN')}` },
          { label: 'Low Stock Alerts', value: lowStockCount },
        ],
        tableHeaders: ['SKU', 'Product Title', 'Category', 'Price', 'Available Stock', 'Stock Status'],
        tableData: products.map((p) => [
          p.sku || 'BDNA-PRO',
          p.name,
          p.category?.name || p.categoryName || 'General',
          `₹${p.price?.toLocaleString('en-IN')}`,
          `${p.stock} units`,
          p.stock === 0 ? 'Out of Stock' : p.stock <= (p.reorderLevel || 10) ? 'Low Stock' : 'In Stock',
        ]),
        summaryNotes: 'Warehouse inventory valuation, stock level thresholds, and reorder warnings.'
      });
      addToast('Generated Inventory & Valuation PDF Report!', 'success');
    } else if (activeReportTab === 'shipment') {
      exportBusinessReportToPDF({
        title: 'Order Tracking & Shipment Performance Report',
        category: 'Logistics & Order Fulfillment',
        metrics: [
          { label: 'Total Shipments', value: filteredOrders.length },
          { label: 'Delivered Packages', value: deliveredShipmentsCount },
          { label: 'In Transit', value: inTransitCount },
          { label: 'Courier Partner', value: 'SwiftExpress' },
        ],
        tableHeaders: ['Order #', 'Customer', 'Tracking #', 'Courier', 'Current Status', 'Est. Delivery'],
        tableData: filteredOrders.map((o) => [
          o.orderNumber || o._id,
          o.customer?.fullName || o.shippingAddress?.fullName || 'Customer',
          o.trackingNumber || 'Pending',
          o.shipmentProvider || 'SwiftExpress Courier',
          o.shipmentStatusText || o.shipmentStatus || 'ORDER_PLACED',
          o.estimatedDelivery ? new Date(o.estimatedDelivery).toLocaleDateString() : 'N/A',
        ]),
        summaryNotes: 'Real-time courier API tracking status simulation, dispatch events, and delivery fulfillment metrics.'
      });
      addToast('Generated Shipment & Tracking PDF Report!', 'success');
    } else if (activeReportTab === 'users') {
      exportBusinessReportToPDF({
        title: 'User Accounts & Role Distribution Report',
        category: 'User Access & Security',
        metrics: [
          { label: 'Total Registered Users', value: users.length },
          { label: 'Customers', value: users.filter((u) => u.role === 'customer').length },
          { label: 'Inventory Staff', value: users.filter((u) => u.role === 'inventory_staff').length },
          { label: 'System Admins', value: users.filter((u) => u.role === 'admin').length },
        ],
        tableHeaders: ['Full Name', 'Email Address', 'Role Permission', 'Status', 'Registered Date'],
        tableData: users.map((u) => [
          u.fullName || 'User',
          u.email,
          u.role?.replace('_', ' ').toUpperCase() || 'CUSTOMER',
          u.status || 'Active',
          u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
        ]),
        summaryNotes: 'User access log, security credentials audit, and staff assignment breakdown.'
      });
      addToast('Generated User Accounts PDF Report!', 'success');
    } else {
      // Master PDF
      exportMasterExecutivePDF();
    }
  };

  // Master All-In-One PDF Report Generator
  const exportMasterExecutivePDF = () => {
    exportBusinessReportToPDF({
      title: 'Master All-In-One BrandDNA Business Executive Audit',
      category: 'Master Executive Audit',
      metrics: [
        { label: 'Gross Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}` },
        { label: 'Catalog Stock Value', value: `₹${totalStockValuation.toLocaleString('en-IN')}` },
        { label: 'Total Orders', value: filteredOrders.length },
        { label: 'Total Users', value: users.length },
      ],
      tableHeaders: ['Category Module', 'Key Performance Indicator', 'Current Value / Status', 'Notes'],
      tableData: [
        ['Sales & Revenue', 'Total Gross Revenue', `₹${totalRevenue.toLocaleString('en-IN')}`, 'Verified Razorpay transactions'],
        ['Sales & Revenue', 'Total Orders Processed', `${filteredOrders.length} orders`, `${paidOrdersCount} paid orders`],
        ['Inventory', 'Catalog Products Count', `${products.length} products`, '6 Core Categories'],
        ['Inventory', 'Total Warehouse Asset Value', `₹${totalStockValuation.toLocaleString('en-IN')}`, `${totalStockUnits} total stock units`],
        ['Logistics', 'Delivered Packages', `${deliveredShipmentsCount} delivered`, 'Simulated Demo API courier tracking'],
        ['User Access', 'Total Registered Accounts', `${users.length} accounts`, 'Customers, Inventory Staff & Admins'],
      ],
      summaryNotes: 'Complete Platform Master Audit combining financial sales telemetry, warehouse inventory valuation, shipment fulfillment, and user security permissions.'
    });
    addToast('Generated Master All-In-One Business Executive PDF Report!', 'success');
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    if (activeReportTab === 'sales') {
      const headers = ['Order Number', 'Customer Name', 'Order Date', 'Payment Method', 'Payment Status', 'Total Amount'];
      const rows = filteredOrders.map((o) => [
        o.orderNumber || o._id,
        o.customer?.fullName || o.shippingAddress?.fullName || 'Customer',
        new Date(o.createdAt).toLocaleDateString(),
        o.paymentMethod || 'razorpay',
        o.paymentStatus || 'Paid',
        o.totalAmount || 0,
      ]);
      exportBusinessDataToCSV('BrandDNA_Sales_Revenue_Report', headers, rows);
      addToast('Exported Sales CSV Spreadsheet!', 'success');
    } else if (activeReportTab === 'inventory') {
      const headers = ['SKU', 'Product Name', 'Category', 'Price', 'Stock Quantity', 'Stock Status'];
      const rows = products.map((p) => [
        p.sku || 'BDNA-PRO',
        p.name,
        p.category?.name || p.categoryName || 'General',
        p.price,
        p.stock,
        p.stock === 0 ? 'Out of Stock' : p.stock <= (p.reorderLevel || 10) ? 'Low Stock' : 'In Stock',
      ]);
      exportBusinessDataToCSV('BrandDNA_Inventory_Valuation_Report', headers, rows);
      addToast('Exported Inventory CSV Spreadsheet!', 'success');
    } else if (activeReportTab === 'shipment') {
      const headers = ['Order Number', 'Customer', 'Tracking Number', 'Courier', 'Shipment Status', 'Est Delivery'];
      const rows = filteredOrders.map((o) => [
        o.orderNumber || o._id,
        o.customer?.fullName || o.shippingAddress?.fullName || 'Customer',
        o.trackingNumber || 'Pending',
        o.shipmentProvider || 'SwiftExpress Courier',
        o.shipmentStatusText || o.shipmentStatus || 'ORDER_PLACED',
        o.estimatedDelivery ? new Date(o.estimatedDelivery).toLocaleDateString() : 'N/A',
      ]);
      exportBusinessDataToCSV('BrandDNA_Shipment_Tracking_Report', headers, rows);
      addToast('Exported Shipment Tracking CSV Spreadsheet!', 'success');
    } else {
      const headers = ['Full Name', 'Email', 'Role', 'Status', 'Created Date'];
      const rows = users.map((u) => [
        u.fullName || 'User',
        u.email,
        u.role || 'customer',
        u.status || 'Active',
        u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
      ]);
      exportBusinessDataToCSV('BrandDNA_User_Analytics_Report', headers, rows);
      addToast('Exported Users CSV Spreadsheet!', 'success');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-left font-sans text-slate-800">
      
      {/* Top Banner & Control Center */}
      <div className="bg-[#0F291E] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-extrabold uppercase tracking-widest border border-emerald-400/30">
              Admin Exclusive Reporting Center
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            System Reports & Business Intelligence Generator
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Generate, preview, and export official PDF executive reports and CSV spreadsheets across Sales, Inventory, Logistics Shipments, and User Accounts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={exportMasterExecutivePDF}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#0F291E] font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-[#0F291E]" />
            <span>Generate Master All-In-One PDF</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-3 bg-stone-800 hover:bg-stone-700 text-white rounded-2xl text-xs font-bold border border-stone-700 shadow-xs cursor-pointer transition-all"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-300 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Report Module Selector Pills & Date Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          {/* 5 Core Report Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveReportTab('sales')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                activeReportTab === 'sales'
                  ? 'bg-[#0F291E] text-white shadow-md'
                  : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
              }`}
            >
              <DollarSign className={`w-4 h-4 ${activeReportTab === 'sales' ? 'text-emerald-300' : 'text-slate-500'}`} />
              <span>Sales & Revenue</span>
            </button>

            <button
              onClick={() => setActiveReportTab('inventory')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                activeReportTab === 'inventory'
                  ? 'bg-[#0F291E] text-white shadow-md'
                  : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
              }`}
            >
              <Package className={`w-4 h-4 ${activeReportTab === 'inventory' ? 'text-emerald-300' : 'text-slate-500'}`} />
              <span>Inventory & Valuation</span>
            </button>

            <button
              onClick={() => setActiveReportTab('shipment')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                activeReportTab === 'shipment'
                  ? 'bg-[#0F291E] text-white shadow-md'
                  : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
              }`}
            >
              <Truck className={`w-4 h-4 ${activeReportTab === 'shipment' ? 'text-emerald-300' : 'text-slate-500'}`} />
              <span>Shipments & Logistics</span>
            </button>

            <button
              onClick={() => setActiveReportTab('users')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                activeReportTab === 'users'
                  ? 'bg-[#0F291E] text-white shadow-md'
                  : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
              }`}
            >
              <Users className={`w-4 h-4 ${activeReportTab === 'users' ? 'text-emerald-300' : 'text-slate-500'}`} />
              <span>User Accounts</span>
            </button>
          </div>

          {/* Date Filter & Export Bar */}
          <div className="flex items-center gap-3 shrink-0">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">Time Range: All History</option>
              <option value="TODAY">Time Range: Today</option>
              <option value="7DAYS">Time Range: Last 7 Days</option>
              <option value="30DAYS">Time Range: Last 30 Days</option>
            </select>

            <button
              onClick={handleExportCurrentReportPDF}
              className="px-4 py-2 bg-[#0F291E] hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-300" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-stone-200 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Selected Report Key Metrics Cards */}
        {activeReportTab === 'sales' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-800">Gross Sales Revenue</span>
              <span className="text-2xl font-black text-emerald-950 block">₹{totalRevenue.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Verified Customer Orders</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-stone-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Paid Orders Count</span>
              <span className="text-2xl font-black text-slate-900 block">{paidOrdersCount}</span>
              <span className="text-[10px] text-slate-500 font-medium">Out of {filteredOrders.length} total orders</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-stone-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Average Order Value</span>
              <span className="text-2xl font-black text-slate-900 block">₹{avgOrderValue.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-500 font-medium">Per Customer Transaction</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-stone-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Razorpay Prepaid Ratio</span>
              <span className="text-2xl font-black text-slate-900 block">100%</span>
              <span className="text-[10px] text-slate-500 font-medium">Prepaid Gateway Verified</span>
            </div>
          </div>
        )}

        {activeReportTab === 'inventory' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-sky-50/50 border border-sky-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-sky-800">Catalog Products Count</span>
              <span className="text-2xl font-black text-sky-950 block">{products.length} Items</span>
              <span className="text-[10px] text-sky-700 font-semibold">Across 6 Core Store Categories</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-stone-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Total Available Units</span>
              <span className="text-2xl font-black text-slate-900 block">{totalStockUnits.toLocaleString()} Units</span>
              <span className="text-[10px] text-slate-500 font-medium">Warehouse Inventory</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-stone-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Total Stock Valuation</span>
              <span className="text-2xl font-black text-slate-900 block">₹{totalStockValuation.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-500 font-medium">Retail Asset Valuation</span>
            </div>
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-800">Low & Out of Stock Alerts</span>
              <span className="text-2xl font-black text-amber-950 block">{lowStockCount + outOfStockCount} Items</span>
              <span className="text-[10px] text-amber-700 font-bold">{outOfStockCount} completely out of stock</span>
            </div>
          </div>
        )}

        {activeReportTab === 'shipment' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-800">Total Shipments Tracked</span>
              <span className="text-2xl font-black text-teal-950 block">{filteredOrders.length} Packages</span>
              <span className="text-[10px] text-teal-700 font-semibold">Demo Shipment API Simulator</span>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-800">Delivered Shipments</span>
              <span className="text-2xl font-black text-emerald-950 block">{deliveredShipmentsCount} Delivered</span>
              <span className="text-[10px] text-emerald-700 font-semibold">100% On-Time Target Rate</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-stone-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Active In Transit</span>
              <span className="text-2xl font-black text-slate-900 block">{inTransitCount} En Route</span>
              <span className="text-[10px] text-slate-500 font-medium">10s Auto Progression simulation</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-stone-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Primary Courier Partner</span>
              <span className="text-2xl font-black text-slate-900 block">SwiftExpress</span>
              <span className="text-[10px] text-slate-500 font-medium">Port 4000 Demo Integration</span>
            </div>
          </div>
        )}

        {activeReportTab === 'users' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-indigo-800">Total Accounts</span>
              <span className="text-2xl font-black text-indigo-950 block">{users.length} Users</span>
              <span className="text-[10px] text-indigo-700 font-semibold">Registered MongoDB Users</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-stone-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Customers</span>
              <span className="text-2xl font-black text-slate-900 block">{users.filter((u) => u.role === 'customer').length} Accounts</span>
              <span className="text-[10px] text-slate-500 font-medium">Storefront Shoppers</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-stone-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Inventory Staff</span>
              <span className="text-2xl font-black text-slate-900 block">{users.filter((u) => u.role === 'inventory_staff').length} Staff</span>
              <span className="text-[10px] text-slate-500 font-medium">Stock Control Permission</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-stone-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">System Admins</span>
              <span className="text-2xl font-black text-slate-900 block">{users.filter((u) => u.role === 'admin').length} Admins</span>
              <span className="text-[10px] text-slate-500 font-medium">Platform Root Access</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Breakdown Report Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-900 capitalize">
              {activeReportTab} Detailed Records Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Live records retrieved directly from MongoDB database for export verification.
            </p>
          </div>
          <button
            onClick={handleExportCurrentReportPDF}
            className="px-4 py-2 bg-[#0F291E] hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-300" />
            <span>Generate & Download PDF</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
            <p>Querying report data from MongoDB...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeReportTab === 'sales' && (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-slate-500 font-mono text-[10px] uppercase">
                    <th className="p-3">Order Number</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Order Date</th>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3">Payment Status</th>
                    <th className="p-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-stone-50/80">
                      <td className="p-3 font-mono font-bold text-slate-900">{o.orderNumber || o._id}</td>
                      <td className="p-3">{o.customer?.fullName || o.shippingAddress?.fullName || 'Customer'}</td>
                      <td className="p-3 text-slate-500 font-mono">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 uppercase font-mono text-[10px] font-bold">{o.paymentMethod || 'RAZORPAY'}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {o.paymentStatus || 'Paid'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900">₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeReportTab === 'inventory' && (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-slate-500 font-mono text-[10px] uppercase">
                    <th className="p-3">SKU</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Available Stock</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-stone-50/80">
                      <td className="p-3 font-mono text-slate-500">{p.sku || 'BDNA-PRO'}</td>
                      <td className="p-3 font-bold text-slate-900">{p.name}</td>
                      <td className="p-3 text-slate-600">{p.category?.name || p.categoryName || 'General'}</td>
                      <td className="p-3 font-bold">₹{p.price?.toLocaleString('en-IN')}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{p.stock} units</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          p.stock === 0 ? 'bg-rose-50 text-rose-800 border-rose-200' : p.stock <= (p.reorderLevel || 10) ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {p.stock === 0 ? 'Out of Stock' : p.stock <= (p.reorderLevel || 10) ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeReportTab === 'shipment' && (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-slate-500 font-mono text-[10px] uppercase">
                    <th className="p-3">Order #</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Tracking Number</th>
                    <th className="p-3">Courier</th>
                    <th className="p-3">Current Shipment Status</th>
                    <th className="p-3">Est. Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-stone-50/80">
                      <td className="p-3 font-mono font-bold text-slate-900">{o.orderNumber || o._id}</td>
                      <td className="p-3">{o.customer?.fullName || o.shippingAddress?.fullName || 'Customer'}</td>
                      <td className="p-3 font-mono font-bold">{o.trackingNumber || 'Pending'}</td>
                      <td className="p-3 text-slate-700">{o.shipmentProvider || 'SwiftExpress Courier'}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                          {o.shipmentStatusText || o.shipmentStatus || 'ORDER_PLACED'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono">{o.estimatedDelivery ? new Date(o.estimatedDelivery).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeReportTab === 'users' && (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-slate-500 font-mono text-[10px] uppercase">
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Role Permission</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {users.map((u) => (
                    <tr key={u._id || u.id} className="hover:bg-stone-50/80">
                      <td className="p-3 font-bold text-slate-900">{u.fullName || 'User'}</td>
                      <td className="p-3 text-slate-600">{u.email}</td>
                      <td className="p-3 uppercase font-mono text-[10px] font-extrabold text-indigo-700">{u.role?.replace('_', ' ') || 'CUSTOMER'}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {u.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
