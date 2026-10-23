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
  UserCheck,
  ExternalLink,
  CreditCard,
  CheckCircle
} from 'lucide-react';
import { businessService } from '../../services/businessService';
import { paymentService } from '../../services/paymentService';
import { deliveryService } from '../../services/deliveryService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { DeliveryManagementTab } from '../../components/delivery/DeliveryManagementTab';
import { storageCache } from '../../utils/storageCache';
import { EvidencePhotoModal } from '../../components/common/EvidencePhotoModal';
import { INITIAL_PRODUCTS, INITIAL_INVENTORY_TELEMETRY } from '../../constants/initialProducts';

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

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Real MongoDB Telemetry States - Initialized immediately from cache/fallback for 0ms delay
  const [telemetry, setTelemetry] = useState(() => storageCache.get('inv_telemetry', INITIAL_INVENTORY_TELEMETRY));
  const [products, setProducts] = useState(() => storageCache.get('inv_products', INITIAL_PRODUCTS));
  const [ledger, setLedger] = useState(() => storageCache.get('inv_ledger', []));
  const [orders, setOrders] = useState(() => storageCache.get('all_orders', []));
  const [returnsList, setReturnsList] = useState(() => storageCache.get('inv_returns', []));

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

  // Combined Returns, Refunds & Damaged Stock Sub-Tab State
  const [rdSubTab, setRdSubTab] = useState('returns'); // 'returns' | 'refunds' | 'damaged'

  // Damage Form State (Inside Returns & Damaged Stock Page)
  const [damageForm, setDamageForm] = useState({
    productId: '',
    quantity: 1,
    reason: 'Damaged in warehouse / transit',
    notes: ''
  });
  const [submittingDamage, setSubmittingDamage] = useState(false);

  // Return & Refund Workflow States for Inventory Staff
  const [rejectModalReturn, setRejectModalReturn] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [inspectionModalReturn, setInspectionModalReturn] = useState(null);
  const [inspectionResult, setInspectionResult] = useState('Resellable'); // 'Resellable' | 'Damaged' | 'Inspection Required'
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [refundModalReturn, setRefundModalReturn] = useState(null);
  const [refundAmount, setRefundAmount] = useState(0);
  const [razorpayRefundTestModalData, setRazorpayRefundTestModalData] = useState(null);
  const [assignAgentModalReturn, setAssignAgentModalReturn] = useState(null);
  const [deliveryAgentsList, setDeliveryAgentsList] = useState([]);
  const [selectedDeliveryAgentId, setSelectedDeliveryAgentId] = useState('');
  const [assignAgentNotes, setAssignAgentNotes] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [evidenceModal, setEvidenceModal] = useState({
    isOpen: false,
    imageUrl: '',
    returnDoc: null,
  });

  // Fetch initial telemetry & real data from MongoDB with decoupled Stale-While-Revalidate (SWR)
  const fetchAllInventoryData = () => {
    // 1. Fetch Products immediately
    businessService.getProducts({ status: 'ALL' })
      .then((prodRes) => {
        if (prodRes?.success) {
          const fetchedProds = prodRes.data?.products || [];
          if (fetchedProds.length > 0) {
            setProducts(fetchedProds);
            storageCache.set('inv_products', fetchedProds);
          }
        }
      })
      .catch((e) => console.warn('Products sync notice:', e.message));

    // 2. Fetch Telemetry Stats immediately
    businessService.getInventoryDashboardStats()
      .then((statsRes) => {
        if (statsRes?.success) {
          setTelemetry(statsRes.data);
          storageCache.set('inv_telemetry', statsRes.data);
        }
      })
      .catch((e) => console.warn('Stats sync notice:', e.message));

    // 3. Fetch Ledger movements immediately
    businessService.getInventoryLedger({})
      .then((ledgerRes) => {
        if (ledgerRes?.success) {
          const l = ledgerRes.data?.ledger || [];
          setLedger(l);
          storageCache.set('inv_ledger', l);
        }
      })
      .catch((e) => console.warn('Ledger sync notice:', e.message));

    // 4. Fetch Orders immediately
    businessService.getOrders()
      .then((ordersRes) => {
        const oList = ordersRes.data?.orders || ordersRes.data || ordersRes.orders;
        if (Array.isArray(oList)) {
          setOrders(oList);
          storageCache.set('all_orders', oList);
        }
      })
      .catch((e) => console.warn('Orders sync notice:', e.message));

    // 5. Fetch Returns immediately
    businessService.getReturns()
      .then((returnsRes) => {
        if (returnsRes?.success) {
          const r = returnsRes.data?.returns || [];
          setReturnsList(r);
          storageCache.set('inv_returns', r);
        }
      })
      .catch((e) => console.warn('Returns sync notice:', e.message));

    // 6. Fetch Delivery Agents for Return Pickup assignment
    deliveryService.getDeliveryAgents()
      .then((res) => {
        if (res?.success && res.data?.agents) {
          setDeliveryAgentsList(res.data.agents);
        }
      })
      .catch((e) => console.warn('Delivery agents sync notice:', e.message));
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

  // RETURN LIFECYCLE & REFUND HANDLERS
  const handleApproveReturn = async (returnId) => {
    setIsProcessingAction(true);
    try {
      const res = await businessService.approveReturn(returnId, { note: 'Approved by inventory staff' });
      if (res?.success) {
        const updatedReturn = res.data?.returnDoc || returnsList.find(r => r._id === returnId);
        addToast(
          `Return approved! Assign a delivery agent below to pick up the item from customer.`,
          'success'
        );
        fetchAllInventoryData();
        // Automatically prompt agent assignment for convenience
        if (updatedReturn) {
          setAssignAgentModalReturn(updatedReturn);
          if (deliveryAgentsList.length > 0) {
            setSelectedDeliveryAgentId(deliveryAgentsList[0]._id || deliveryAgentsList[0].id);
          }
        }
      } else {
        addToast(res?.message || 'Failed to approve return', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to approve return', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleAssignAgentSubmit = async (e) => {
    e.preventDefault();
    if (!assignAgentModalReturn || !selectedDeliveryAgentId) {
      addToast('Please select a delivery agent', 'error');
      return;
    }
    setIsProcessingAction(true);
    try {
      const res = await businessService.assignReturnDeliveryAgent(assignAgentModalReturn._id, {
        deliveryAgentId: selectedDeliveryAgentId,
        notes: assignAgentNotes.trim(),
      });
      if (res?.success) {
        addToast(res.message || 'Delivery agent assigned for customer pickup!', 'success');
        setAssignAgentModalReturn(null);
        setSelectedDeliveryAgentId('');
        setAssignAgentNotes('');
        fetchAllInventoryData();
      } else {
        addToast(res?.message || 'Failed to assign delivery agent', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to assign delivery agent', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleRejectReturnSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModalReturn || !rejectionReason.trim()) {
      addToast('Please provide a rejection reason', 'error');
      return;
    }
    setIsProcessingAction(true);
    try {
      const res = await businessService.rejectReturn(rejectModalReturn._id, {
        rejectionReason: rejectionReason.trim(),
      });
      if (res?.success) {
        addToast('Return request rejected.', 'info');
        setRejectModalReturn(null);
        setRejectionReason('');
        fetchAllInventoryData();
      } else {
        addToast(res?.message || 'Failed to reject return', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reject return', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleReceiveReturn = async (returnId) => {
    setIsProcessingAction(true);
    try {
      const res = await businessService.receiveReturn(returnId, { note: 'Package received by inventory staff' });
      if (res?.success) {
        addToast('Return marked received at warehouse! Ready for physical inspection.', 'success');
        fetchAllInventoryData();
      } else {
        addToast(res?.message || 'Failed to receive return', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to receive return', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleInspectionSubmit = async (e) => {
    e.preventDefault();
    if (!inspectionModalReturn) return;
    setIsProcessingAction(true);
    try {
      const res = await businessService.inspectReturn(inspectionModalReturn._id, {
        inspectStatus: inspectionResult,
        inspectionNotes: inspectionNotes.trim(),
      });
      if (res?.success) {
        addToast(
          inspectionResult === 'Resellable'
            ? 'Inspected as Resellable: Stock increased in available inventory (+Stock)!'
            : inspectionResult === 'Damaged'
              ? 'Inspected as Damaged: Recorded in damage audit ledger without increasing sellable stock.'
              : 'Marked as Inspection Required: Kept unavailable for sale until final review.',
          'success'
        );
        setInspectionModalReturn(null);
        setInspectionNotes('');
        fetchAllInventoryData();
      } else {
        addToast(res?.message || 'Inspection failed', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Inspection failed', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayRefundSubmit = async (e) => {
    e.preventDefault();
    if (!refundModalReturn) return;
    const amt = Number(refundAmount);
    if (isNaN(amt) || amt <= 0) {
      addToast('Please enter a valid positive refund amount', 'error');
      return;
    }
    setIsProcessingAction(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        addToast('Razorpay Checkout SDK failed to load. Check network connection.', 'error');
        setIsProcessingAction(false);
        return;
      }

      // Step 1: Create Razorpay Order for Refund Checkout on server
      const orderRes = await businessService.createRefundOrder(refundModalReturn._id, { amount: amt });
      if (!orderRes?.success || !orderRes?.data) {
        addToast(orderRes?.message || 'Failed to prepare Razorpay refund payment order', 'error');
        setIsProcessingAction(false);
        return;
      }

      const { razorpayOrderId, amount, currency, keyId, customer } = orderRes.data;

      // If backend returned a test/simulated mock order (e.g. without live keys)
      if (razorpayOrderId && razorpayOrderId.startsWith('order_test_')) {
        setRazorpayRefundTestModalData({
          returnId: refundModalReturn._id,
          razorpayOrderId,
          amount,
          refundAmount: amt,
          currency: currency || 'INR',
          orderNumber: refundModalReturn.order?.orderNumber,
          returnNumber: refundModalReturn.returnNumber,
          customerName: customer?.fullName || refundModalReturn.customer?.fullName,
        });
        setIsProcessingAction(false);
        return;
      }

      // Step 2: Launch the interactive Razorpay Checkout Gateway Modal
      const options = {
        key: keyId || 'rzp_test_enBJVcajFSH1Ci',
        amount: amount,
        currency: currency || 'INR',
        name: 'BrandDNA Store',
        description: `Refund Payout for Return ${refundModalReturn.returnNumber} (Order #${refundModalReturn.order?.orderNumber || 'N/A'})`,
        image: '/favicon.ico',
        order_id: razorpayOrderId,
        prefill: {
          name: customer?.fullName || refundModalReturn.customer?.fullName || 'Customer',
          email: customer?.email || refundModalReturn.customer?.email || 'customer@branddna.ai',
          contact: customer?.phone || refundModalReturn.customer?.phone || refundModalReturn.order?.shippingAddress?.phone || '9999999999',
        },
        notes: {
          returnId: refundModalReturn._id,
          returnNumber: refundModalReturn.returnNumber,
          orderNumber: refundModalReturn.order?.orderNumber,
          type: 'RETURN_REFUND',
        },
        theme: {
          color: '#0F291E',
        },
        handler: async function (response) {
          try {
            setIsProcessingAction(true);
            const verifyRes = await businessService.refundReturn(refundModalReturn._id, {
              amount: amt,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id || razorpayOrderId,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes?.success) {
              addToast(
                `Razorpay payment of ₹${amt} completed successfully! (Payment ID: ${response.razorpay_payment_id})`,
                'success'
              );
              setRefundModalReturn(null);
              fetchAllInventoryData();
            } else {
              addToast(verifyRes?.message || 'Payment verification failed on server', 'error');
            }
          } catch (verifyErr) {
            addToast(
              verifyErr.response?.data?.message || 'Server refund signature verification failed',
              'error'
            );
          } finally {
            setIsProcessingAction(false);
          }
        },
        modal: {
          ondismiss: function () {
            addToast('Razorpay payment modal closed.', 'info');
            setIsProcessingAction(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (resp) {
        addToast(
          `Payment Failed: ${resp.error?.description || resp.error?.reason || 'Transaction declined'}`,
          'error'
        );
        setIsProcessingAction(false);
      });
      razorpayInstance.open();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to launch Razorpay checkout', 'error');
      setIsProcessingAction(false);
    }
  };

  const handleSimulateTestRefundSuccess = async () => {
    if (!razorpayRefundTestModalData) return;
    try {
      setIsProcessingAction(true);
      const razorpay_payment_id = `pay_test_${Date.now().toString().slice(-8)}`;
      const { returnId, razorpayOrderId, refundAmount } = razorpayRefundTestModalData;

      let razorpay_signature = `test_sig_${Date.now()}`;
      try {
        const sigRes = await paymentService.generateTestSignature({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id,
        });
        if (sigRes?.success && sigRes?.data?.signature) {
          razorpay_signature = sigRes.data.signature;
        }
      } catch (sigErr) {
        // Fallback for simulation
      }

      const verifyRes = await businessService.refundReturn(returnId, {
        amount: refundAmount,
        razorpay_payment_id,
        razorpay_order_id: razorpayOrderId,
        razorpay_signature,
      });

      if (verifyRes?.success) {
        addToast(
          `Simulated Razorpay refund of ₹${refundAmount} verified and recorded! (ID: ${razorpay_payment_id})`,
          'success'
        );
        setRazorpayRefundTestModalData(null);
        setRefundModalReturn(null);
        fetchAllInventoryData();
      } else {
        addToast(verifyRes?.message || 'Simulated refund processing failed', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to complete simulated refund', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

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
      // Category Filter (Flexible matching against categories)
      const pCatName = p.categoryName || (typeof p.category === 'object' ? p.category?.name : '') || 'General';
      if (selectedCategory !== 'ALL') {
        const selLower = selectedCategory.trim().toLowerCase();
        const pLower = pCatName.trim().toLowerCase();
        if (pLower !== selLower && !pLower.includes(selLower) && !selLower.includes(pLower)) {
          return false;
        }
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
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shrink-0 ${isAddition
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
                  <button onClick={() => handleTabChange('returns-damaged')} className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer">
                    Manage Returns & Damaged →
                  </button>
                </div>
                {returnsList.length === 0 && (!telemetry?.recentDamages || telemetry.recentDamages.length === 0) ? (
                  <p className="text-xs text-slate-400 italic p-4 text-center">No recent returns or damaged stock records.</p>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {returnsList.slice(0, 3).map((r) => (
                      <div key={r._id} className="py-2.5 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 truncate max-w-[200px]">Return: {r.product?.name || r.productName}</span>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md font-bold text-[10px]">{r.status}</span>
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

              {/* Delivery Operations Dispatch Quick Card */}
              <div className="bg-gradient-to-r from-[#0B192C] to-[#1E3E62] text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-300 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" /> Field Dispatch & Logistics
                  </span>
                  <h4 className="font-serif text-lg font-bold text-white">Delivery Management & Fleet Assignment</h4>
                  <p className="text-xs text-slate-300 max-w-lg">
                    Assign ready orders to Delivery Agents, monitor real-time in-transit progress, and audit completed or failed deliveries.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabChange('delivery')}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-xs cursor-pointer self-start sm:self-auto shrink-0 flex items-center gap-1.5"
                >
                  <Truck className="w-4 h-4" />
                  <span>Open Delivery Ops</span>
                </button>
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
                      className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${selectedCategory === cat
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
                            className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${isOut
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
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-stone-100 rounded-2xl border border-stone-200">
              <button
                type="button"
                onClick={() => setStockOpType('stockIn')}
                className={`py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${stockOpType === 'stockIn'
                  ? 'bg-[#0F291E] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <PlusCircle className={`w-4 h-4 ${stockOpType === 'stockIn' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>Stock In (+Inventory)</span>
              </button>

              <button
                type="button"
                onClick={() => setStockOpType('stockOut')}
                className={`py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${stockOpType === 'stockOut'
                  ? 'bg-[#0F291E] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <MinusCircle className={`w-4 h-4 ${stockOpType === 'stockOut' ? 'text-rose-400' : 'text-slate-400'}`} />
                <span>Stock Out (-Inventory)</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    {stockOpType === 'stockIn' ? 'Quantity to Add (+)' : 'Quantity to Remove (-)'}
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
                    : 'Confirm Stock Out (-Inventory)'}
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

          const isFiltered = historyCategoryFilter !== 'ALL' || historyTypeFilter !== 'ALL' || historySearchQuery.trim() !== '';

          const clearHistoryFilters = () => {
            setHistoryCategoryFilter('ALL');
            setHistoryTypeFilter('ALL');
            setHistorySearchQuery('');
          };

          return (
            <div className="space-y-6">
              {/* Dynamic Summary Stats Counter Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold shadow-2xs border ${isAdd
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
                                  className={`font-black text-sm px-2.5 py-0.5 rounded-lg ${isAdd
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
                  <span className="font-mono text-[10px] text-slate-400">Database: Authenticated MongoDB Engine</span>
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

                        {/* Delivery Agent Assignment Info */}
                        <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-medium">Assigned Agent:</span>
                            {order.deliveryAgent ? (
                              <span className="font-bold text-slate-900 bg-sky-50 text-sky-900 px-2.5 py-0.5 rounded-lg border border-sky-200">
                                {order.deliveryAgent.fullName || 'Agent Assigned'} {order.deliveryAgent.phone ? `(${order.deliveryAgent.phone})` : ''}
                              </span>
                            ) : (
                              <span className="text-amber-700 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                                Unassigned
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleTabChange('delivery')}
                            className="px-3 py-1.5 rounded-xl bg-[#0F291E] hover:bg-[#1E3E62] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>{order.deliveryAgent ? 'Manage Delivery' : 'Assign Delivery Agent'}</span>
                          </button>
                        </div>
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

        {/* 6B. DELIVERY & DISPATCH OPERATIONS TAB */}
        {currentTab === 'delivery' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="border-b border-stone-100 pb-4 space-y-1">
              <h3 className="font-serif font-extrabold text-slate-900 text-xl flex items-center gap-2">
                <Truck className="w-6 h-6 text-emerald-700" /> Delivery Operations & Fleet Dispatch
              </h3>
              <p className="text-xs text-slate-500">
                View orders ready for dispatch, assign or reassign Delivery Agents, monitor active transit in real-time, and audit delivery history.
              </p>
            </div>
            <DeliveryManagementTab onOrderUpdated={fetchAllInventoryData} />
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
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${rdSubTab === 'returns'
                    ? 'bg-[#0F291E] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-slate-700'
                    }`}
                >
                  Customer Returns Inspection
                </button>

                <button
                  type="button"
                  onClick={() => setRdSubTab('refunds')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${rdSubTab === 'refunds'
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-slate-700'
                    }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Razorpay Gateway Refunds</span>
                  <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                    {returnsList.filter(r => ['Processed', 'Refunded'].includes(r.refundStatus)).length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRdSubTab('damaged')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${rdSubTab === 'damaged'
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    Review customer return requests, record warehouse receipt, inspect items (Resellable vs Damaged), and disburse Razorpay refunds.
                  </p>
                  <span className="text-[11px] font-mono font-bold text-slate-600 bg-stone-100 px-3 py-1 rounded-xl shrink-0">
                    {returnsList.length} Return Request{returnsList.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {returnsList.length === 0 ? (
                  <div className="p-12 text-center bg-stone-50 rounded-2xl text-slate-500 space-y-2 border border-stone-200/60">
                    <RotateCcw className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-800">No customer returns currently filed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {returnsList.map((ret) => {
                      const pImg = ret.productImage || ret.product?.images?.[0] || '/images/cat_workout_essentials.jpg';
                      const isPending = ['RETURN_REQUESTED', 'UNDER_REVIEW', 'Pending'].includes(ret.status);
                      const isApproved = ['APPROVED', 'Approved'].includes(ret.status);
                      const isPickupAssigned = ret.status === 'PICKUP_ASSIGNED';
                      const isOutForPickup = ret.status === 'OUT_FOR_PICKUP';
                      const isPickedUp = ret.status === 'PICKED_UP';
                      const isReceived = ret.status === 'RETURN_RECEIVED';
                      const isInspected = ret.status === 'INSPECTED';
                      const isInspectedOk = isInspected && ret.inspectStatus === 'Resellable';
                      const isInspectedDamaged = isInspected && ret.inspectStatus === 'Damaged';
                      const isRefunded = ['Processed', 'Refunded'].includes(ret.refundStatus);
                      // Strict refund eligibility: Product must be inspected and verified OK
                      const isRefundEligible = isInspectedOk && !isRefunded && ret.status !== 'REJECTED' && ret.status !== 'Rejected';

                      return (
                        <div
                          key={ret._id}
                          className="p-5 sm:p-6 border border-stone-200 rounded-3xl bg-white shadow-2xs space-y-4 hover:border-stone-300 transition-all"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                            {/* Product & Return Context */}
                            <div className="flex items-start sm:items-center gap-4">
                              <div className="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                <img
                                  src={pImg}
                                  alt=""
                                  onError={(e) => { e.target.src = '/images/cat_workout_essentials.jpg'; }}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="space-y-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono font-bold text-slate-900 text-sm">{ret.returnNumber}</span>
                                  <span className="text-[10px] text-slate-400">• Order #{ret.order?.orderNumber || 'ORDER'}</span>
                                  {ret.size && (
                                    <span className="text-[10px] bg-sky-50 text-sky-800 font-bold px-2 py-0.5 rounded border border-sky-200">
                                      Size: {ret.size}
                                    </span>
                                  )}
                                </div>
                                <p className="font-serif font-bold text-slate-900 text-base leading-tight truncate">
                                  {ret.productName || ret.product?.name}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  Quantity: <strong className="text-slate-900">{ret.quantity}</strong> • Customer: <strong className="text-slate-800">{ret.customer?.fullName || 'Customer'}</strong> ({ret.customer?.email})
                                </p>
                              </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Lifecycle Badge */}
                              <span
                                className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${isApproved
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : isPickupAssigned || isOutForPickup
                                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                                    : isPickedUp
                                      ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                                      : isReceived
                                        ? 'bg-sky-50 text-sky-800 border-sky-300'
                                        : isInspected
                                          ? 'bg-purple-50 text-purple-800 border-purple-300'
                                          : ret.status === 'REJECTED' || ret.status === 'Rejected'
                                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                                            : ret.status === 'UNDER_REVIEW'
                                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                                              : 'bg-stone-100 text-stone-700 border-stone-300'
                                  }`}
                              >
                                {ret.status?.replace('_', ' ')}
                              </span>

                              {/* Inspection Result Badge */}
                              {ret.inspectStatus && ret.inspectStatus !== 'PendingInspection' && (
                                <span
                                  className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${ret.inspectStatus === 'Resellable'
                                    ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                                    : ret.inspectStatus === 'Damaged'
                                      ? 'bg-rose-100 text-rose-950 border-rose-300'
                                      : 'bg-amber-100 text-amber-950 border-amber-300'
                                    }`}
                                >
                                  {ret.inspectStatus === 'Resellable' ? '✓ Resellable (+Stock)' : ret.inspectStatus === 'Damaged' ? '⚠ Damaged Stock' : '⏳ Inspection Required'}
                                </span>
                              )}

                              {/* Refund Status Badge */}
                              {isRefunded ? (
                                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                                  ₹{ret.refundDetails?.amount || ret.refundAmount} Refunded via Razorpay
                                </span>
                              ) : ret.refundStatus === 'Denied' ? (
                                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-800 border border-rose-200">
                                  Refund Denied
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {/* Details Bar: Reason, 7-Day Window, Evidence */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-stone-50/70 p-3.5 rounded-2xl border border-stone-200/60">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">Customer Reason</span>
                              <strong className="text-slate-800">{ret.reason}</strong>
                              {ret.description && (
                                <span className="text-[11px] text-slate-500 block mt-0.5 truncate" title={ret.description}>
                                  "{ret.description}"
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">Policy Timestamps</span>
                              <span className="text-slate-700 block">
                                Delivered: {ret.deliveredAt ? new Date(ret.deliveredAt).toLocaleDateString() : 'Confirmed'}
                              </span>
                              <span className="text-emerald-700 font-bold block text-[11px]">
                                7-Day Deadline: {ret.returnDeadline ? new Date(ret.returnDeadline).toLocaleDateString() : 'Valid'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">Refund / Transaction Info</span>
                              <span className="text-slate-700 block">
                                Payment ID: <strong className="font-mono text-slate-900">{ret.order?.razorpayPaymentId || 'Razorpay'}</strong>
                              </span>
                              <span className="text-slate-600 block">
                                Refund Value: <strong className="text-slate-900">₹{ret.refundAmount || (ret.quantity * (ret.unitPrice || 0))}</strong>
                              </span>
                              {ret.evidenceImage && (
                                <div className="mt-2 flex items-center gap-2">
                                  <img
                                    src={ret.evidenceImage}
                                    alt="Evidence"
                                    className="w-7 h-7 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity shrink-0 bg-white"
                                    onClick={() => setEvidenceModal({ isOpen: true, imageUrl: ret.evidenceImage, returnDoc: ret })}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setEvidenceModal({ isOpen: true, imageUrl: ret.evidenceImage, returnDoc: ret })}
                                    className="text-sky-600 hover:text-sky-800 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer bg-sky-50 px-2 py-1 rounded-lg border border-sky-200 hover:bg-sky-100 transition-colors"
                                  >
                                    <ExternalLink className="w-3 h-3" /> View Customer Evidence Photo
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Assigned Delivery Agent Banner */}
                          {ret.assignedDeliveryAgent && (
                            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-950 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                              <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-blue-700 shrink-0" />
                                <span>
                                  Pickup Agent: <strong>{ret.assignedDeliveryAgent.fullName}</strong> ({ret.assignedDeliveryAgent.phone || 'Contact pending'})
                                </span>
                                {ret.assignedDeliveryAgent.vehicleNumber && (
                                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-mono font-bold">
                                    {ret.assignedDeliveryAgent.vehicleNumber} ({ret.assignedDeliveryAgent.vehicleType || 'Bike'})
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] bg-blue-200/80 text-blue-900 px-2.5 py-0.5 rounded-full font-bold">
                                Status: {ret.status?.replace('_', ' ')}
                              </span>
                            </div>
                          )}

                          {/* Rejection Note if Rejected */}
                          {ret.rejectionReason && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                              <span className="font-bold">Rejection Reason:</span> {ret.rejectionReason}
                            </div>
                          )}

                          {/* Razorpay Refund Details if Processed */}
                          {isRefunded && ret.refundDetails?.razorpayRefundId && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className="font-bold">Razorpay Refund ID:</span>{' '}
                                <span className="font-mono">{ret.refundDetails.razorpayRefundId}</span>
                              </div>
                              <div>
                                <span className="font-bold">Amount:</span> ₹{ret.refundDetails.amount}
                              </div>
                              <span className="text-[10px] text-emerald-700">
                                Refunded on {new Date(ret.refundDetails.refundedAt).toLocaleString()}
                              </span>
                            </div>
                          )}

                          {/* Interactive Action Bar according to current state */}
                          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-stone-100">
                            {/* Step 1: Pending -> Approve or Reject */}
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApproveReturn(ret._id)}
                                  disabled={isProcessingAction}
                                  className="px-4 py-2 bg-[#0F291E] hover:bg-[#1E3E62] text-white rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                                >
                                  Approve Return
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectModalReturn(ret);
                                    setRejectionReason('');
                                  }}
                                  disabled={isProcessingAction}
                                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                                >
                                  Reject Return
                                </button>
                              </>
                            )}

                            {/* Step 2: Approved -> Option to Assign Delivery Agent */}
                            {isApproved && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAssignAgentModalReturn(ret);
                                  setSelectedDeliveryAgentId(ret.assignedDeliveryAgent?._id || (deliveryAgentsList[0]?._id || deliveryAgentsList[0]?.id || ''));
                                  setAssignAgentNotes('');
                                }}
                                disabled={isProcessingAction}
                                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs active:scale-95 disabled:opacity-50"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Assign Delivery Agent for Pickup</span>
                              </button>
                            )}

                            {/* Step 2b: Pickup Assigned -> Option to Reassign */}
                            {(isPickupAssigned || isOutForPickup) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAssignAgentModalReturn(ret);
                                  setSelectedDeliveryAgentId(ret.assignedDeliveryAgent?._id || '');
                                  setAssignAgentNotes('');
                                }}
                                disabled={isProcessingAction}
                                className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-300 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Reassign Agent</span>
                              </button>
                            )}

                            {/* Step 3: Picked Up by Agent -> Record Arrival at Warehouse */}
                            {isPickedUp && (
                              <button
                                type="button"
                                onClick={() => handleReceiveReturn(ret._id)}
                                disabled={isProcessingAction}
                                className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs active:scale-95 disabled:opacity-50"
                              >
                                <Package className="w-3.5 h-3.5" />
                                <span>Record Receipt at Warehouse (Handover)</span>
                              </button>
                            )}

                            {/* Step 4: Received at Warehouse -> Inspect Product */}
                            {(isReceived || (isInspected && ret.inspectStatus === 'Inspection Required')) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setInspectionModalReturn(ret);
                                  setInspectionResult('Resellable');
                                  setInspectionNotes('');
                                }}
                                disabled={isProcessingAction}
                                className="px-4 py-2 bg-[#0F291E] hover:bg-[#1E3E62] text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs active:scale-95 disabled:opacity-50"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Inspect Returned Product</span>
                              </button>
                            )}

                            {/* Step 5: Inspected & OK (Resellable) -> Refund Customer via Razorpay */}
                            {isRefundEligible && (
                              <button
                                type="button"
                                onClick={() => {
                                  setRefundModalReturn(ret);
                                  setRefundAmount(ret.refundAmount || (ret.quantity * (ret.unitPrice || 0)));
                                }}
                                disabled={isProcessingAction}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-sky-700 hover:from-emerald-700 hover:to-sky-800 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs active:scale-95 disabled:opacity-50"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Refund via Razorpay (Product OK)</span>
                              </button>
                            )}

                            {/* If Inspected as Damaged -> Deny refund notice */}
                            {isInspectedDamaged && !isRefunded && (
                              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                                ⚠ Inspected Damaged — Refund Denied
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Sub-Tab: Razorpay Gateway Refunds Ledger */}
            {rdSubTab === 'refunds' && (
              <div className="space-y-6 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Razorpay Direct Gateway Disbursals
                    </span>
                    <h4 className="font-serif font-bold text-slate-900 text-lg flex items-center gap-2 mt-1">
                      <CreditCard className="w-5 h-5 text-sky-700" /> Razorpay Gateway Refund History
                    </h4>
                    <p className="text-xs text-slate-500">
                      View all customer refunds disbursed via Razorpay after quality inspection.
                    </p>
                  </div>

                  <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 sm:text-right">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block font-mono">
                      Total Disbursed Volume
                    </span>
                    <strong className="text-xl font-black text-emerald-950 font-mono block">
                      ₹{returnsList
                        .filter(r => ['Processed', 'Refunded'].includes(r.refundStatus))
                        .reduce((sum, r) => sum + (r.refundDetails?.amount || r.refundAmount || 0), 0)
                        .toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                {/* Table of Refunded Items */}
                {(() => {
                  const refundedList = returnsList.filter(r => ['Processed', 'Refunded'].includes(r.refundStatus));

                  if (refundedList.length === 0) {
                    return (
                      <div className="p-12 text-center bg-stone-50 rounded-2xl text-slate-400 text-xs border border-stone-200/60 space-y-2">
                        <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="font-bold text-slate-700 text-sm">No Razorpay refunds disbursed yet.</p>
                        <p className="text-xs text-slate-400">
                          Inspect received returns as "Resellable" to issue instant Razorpay refunds to customers.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto rounded-2xl border border-stone-200/80">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#0F291E] text-slate-300 font-mono text-[11px] uppercase tracking-wider">
                            <th className="py-3 px-4 font-bold">Razorpay Refund ID</th>
                            <th className="py-3 px-4 font-bold">Return Number</th>
                            <th className="py-3 px-4 font-bold">Customer</th>
                            <th className="py-3 px-4 font-bold">Product Item</th>
                            <th className="py-3 px-4 font-bold">Amount</th>
                            <th className="py-3 px-4 font-bold">Disbursed Date</th>
                            <th className="py-3 px-4 font-bold text-right">Gateway Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 bg-white">
                          {refundedList.map(ret => (
                            <tr key={ret._id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-sky-800">
                                {ret.refundDetails?.razorpayRefundId || 'rfnd_processed'}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-800 font-bold">
                                {ret.returnNumber}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-bold text-slate-800 block">{ret.customer?.fullName || 'Customer'}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{ret.customer?.email}</span>
                              </td>
                              <td className="py-3 px-4 font-medium text-slate-700">
                                {ret.productName || ret.product?.name} ({ret.quantity} unit)
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-emerald-700 text-sm">
                                ₹{(ret.refundDetails?.amount || ret.refundAmount || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                                {ret.refundDetails?.refundedAt ? new Date(ret.refundDetails.refundedAt).toLocaleString() : 'Recent'}
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-emerald-600" /> Settled via Razorpay
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
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

      {/* ─────────────────────────────────────────────────────────────
          RETURN WORKFLOW MODALS FOR INVENTORY STAFF
         ───────────────────────────────────────────────────────────── */}

      {/* 1. PRODUCT INSPECTION MODAL */}
      <AnimatePresence>
        {inspectionModalReturn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setInspectionModalReturn(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Package className="w-3 h-3" /> Warehouse Quality Control
                </span>
                <h3 className="font-serif text-xl font-bold text-slate-900 mt-1">Inspect Returned Product</h3>
                <p className="text-xs text-slate-500">
                  Determine condition of returned item <strong>{inspectionModalReturn.returnNumber}</strong>.
                </p>
              </div>

              {/* Product Context */}
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs">
                <img
                  src={
                    inspectionModalReturn.productImage ||
                    inspectionModalReturn.product?.images?.[0] ||
                    '/images/cat_workout_essentials.jpg'
                  }
                  alt=""
                  onError={(e) => { e.target.src = '/images/cat_workout_essentials.jpg'; }}
                  className="w-12 h-12 object-contain bg-white rounded-xl p-1 border shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">
                    {inspectionModalReturn.productName || inspectionModalReturn.product?.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Quantity: <strong>{inspectionModalReturn.quantity} units</strong> • Reason: {inspectionModalReturn.reason}
                  </p>
                </div>
              </div>

              {/* Inspection Form */}
              <form onSubmit={handleInspectionSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-2">Inspection Outcome</label>
                  <div className="space-y-2">
                    <label
                      className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${inspectionResult === 'Resellable'
                        ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-bold'
                        : 'border-stone-200 hover:bg-stone-50'
                        }`}
                    >
                      <input
                        type="radio"
                        name="inspectOutcome"
                        value="Resellable"
                        checked={inspectionResult === 'Resellable'}
                        onChange={(e) => setInspectionResult(e.target.value)}
                        className="mt-0.5"
                      />
                      <div>
                        <span className="block font-bold">Resellable (+Add to Available Stock)</span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          Item is intact and in mint condition. Adds {inspectionModalReturn.quantity} unit(s) back to available inventory.
                        </span>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${inspectionResult === 'Damaged'
                        ? 'border-rose-500 bg-rose-50/40 text-rose-950 font-bold'
                        : 'border-stone-200 hover:bg-stone-50'
                        }`}
                    >
                      <input
                        type="radio"
                        name="inspectOutcome"
                        value="Damaged"
                        checked={inspectionResult === 'Damaged'}
                        onChange={(e) => setInspectionResult(e.target.value)}
                        className="mt-0.5"
                      />
                      <div>
                        <span className="block font-bold">Damaged (Record in Damaged Ledger)</span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          Item is damaged or defective. Recorded in damage records without increasing available stock.
                        </span>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${inspectionResult === 'Inspection Required'
                        ? 'border-amber-500 bg-amber-50/40 text-amber-950 font-bold'
                        : 'border-stone-200 hover:bg-stone-50'
                        }`}
                    >
                      {/* <input
                        type="radio"
                        name="inspectOutcome"
                        value="Inspection Required"
                        checked={inspectionResult === 'Inspection Required'}
                        onChange={(e) => setInspectionResult(e.target.value)}
                        className="mt-0.5"
                      /> */}
                      {/* <div>
                        <span className="block font-bold">Inspection Required (Hold Quarantine)</span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          Needs further testing by senior technician. Keeps item unavailable for sale.
                        </span>
                      </div> */}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Inspection Notes <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows="2"
                    value={inspectionNotes}
                    onChange={(e) => setInspectionNotes(e.target.value)}
                    placeholder="e.g. Unopened box, verified serial number, signs of water damage..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 outline-none font-medium text-slate-800"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setInspectionModalReturn(null)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingAction}
                    className="flex-1 py-2.5 bg-[#0F291E] hover:bg-[#1E3E62] text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingAction ? 'Recording...' : 'Confirm Inspection'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. RAZORPAY REFUND MODAL */}
      <AnimatePresence>
        {refundModalReturn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setRefundModalReturn(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-200">
                  <RotateCcw className="w-3 h-3 text-sky-600" /> Razorpay Payment Gateway
                </span>
                <h3 className="font-serif text-xl font-bold text-slate-900 mt-1">Initiate Razorpay Refund</h3>
                <p className="text-xs text-slate-500">
                  Issue refund back to customer's original payment method via Razorpay.
                </p>
              </div>

              {/* Order & Payment Context */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
                <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                  <span className="text-slate-500">Customer:</span>
                  <strong className="text-slate-900">{refundModalReturn.customer?.fullName}</strong>
                </div>
                <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                  <span className="text-slate-500">Order Number:</span>
                  <strong className="font-mono text-slate-900">{refundModalReturn.order?.orderNumber || 'ORDER'}</strong>
                </div>
                <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                  <span className="text-slate-500">Razorpay Payment ID:</span>
                  <strong className="font-mono text-sky-700">{refundModalReturn.order?.razorpayPaymentId || 'N/A'}</strong>
                </div>
                <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                  <span className="text-slate-500">Original Order Amount:</span>
                  <strong className="text-slate-900">₹{refundModalReturn.order?.totalAmount?.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Item Return Value:</span>
                  <strong className="text-emerald-700">₹{refundModalReturn.refundAmount || (refundModalReturn.quantity * (refundModalReturn.unitPrice || 0))}</strong>
                </div>
              </div>

              {/* Refund Form */}
              <form onSubmit={handleRazorpayRefundSubmit} className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="font-bold text-slate-700">Refund Amount (₹ INR)</label>
                    <span className="text-[10px] text-slate-400">Supports full or partial refund</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={refundModalReturn.order?.totalAmount || refundModalReturn.refundAmount}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 outline-none font-bold text-slate-900 text-sm focus:border-[#0F291E]"
                    required
                  />
                </div>

                <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl text-[11px] text-sky-900 space-y-1">
                  <p className="font-bold">Razorpay API Gateway Verification</p>
                  <p className="text-sky-800">
                    Clicking Execute opens the secure Razorpay payment gateway to process the payment to the customer, verifying authorization and logging transaction details.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRefundModalReturn(null)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingAction || !refundAmount || Number(refundAmount) <= 0}
                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-sky-700 hover:from-emerald-700 hover:to-sky-800 text-white font-extrabold rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    {isProcessingAction ? 'Opening Razorpay Gateway...' : 'Execute Razorpay Refund'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2B. RAZORPAY TEST MODE MODAL SIMULATION */}
      <AnimatePresence>
        {razorpayRefundTestModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative border border-slate-100"
            >
              <div className="flex items-center justify-between border-b border-stone-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-slate-900 text-sm">Razorpay Payment Gateway</h3>
                    <p className="text-[10px] text-slate-500">Refund Payout Simulation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRazorpayRefundTestModalData(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-stone-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-sky-50 text-indigo-900 rounded-xl border border-sky-200">
                  <p className="font-bold">Razorpay Test Mode Active</p>
                  <p className="text-[11px] text-indigo-700 font-mono">Order ID: {razorpayRefundTestModalData.razorpayOrderId}</p>
                  <p className="text-[11px] text-indigo-700">Return: {razorpayRefundTestModalData.returnNumber}</p>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900">
                  <span>Refund Amount</span>
                  <span className="text-emerald-700 font-extrabold">₹{razorpayRefundTestModalData.refundAmount}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSimulateTestRefundSuccess}
                  disabled={isProcessingAction}
                  className="w-full py-3 bg-[#0F291E] hover:bg-[#1E3E62] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {isProcessingAction ? 'Verifying Gateway Signature...' : 'Complete Razorpay Payment (Test Success)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addToast('Refund payment cancelled by staff', 'info');
                    setRazorpayRefundTestModalData(null);
                  }}
                  className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel Payment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. REJECTION REASON MODAL */}
      <AnimatePresence>
        {rejectModalReturn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setRejectModalReturn(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-rose-600">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="font-serif text-lg font-bold text-slate-900">Reject Customer Return</h3>
              </div>

              <p className="text-xs text-slate-500">
                Rejecting return <strong>{rejectModalReturn.returnNumber}</strong> for {rejectModalReturn.productName || 'product'}. Please provide a mandatory rejection reason for audit records.
              </p>

              <form onSubmit={handleRejectReturnSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rejection Reason (Required)</label>
                  <textarea
                    rows="3"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Return requested after policy deadline, item altered/used, damage not covered..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 outline-none font-medium text-slate-800"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectModalReturn(null)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingAction || !rejectionReason.trim()}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingAction ? 'Processing...' : 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* 4. ASSIGN DELIVERY AGENT MODAL */}
      <AnimatePresence>
        {assignAgentModalReturn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setAssignAgentModalReturn(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                  <Truck className="w-3 h-3 text-blue-600" /> Return Pickup Dispatch
                </span>
                <h3 className="font-serif text-xl font-bold text-slate-900 mt-1">Assign Delivery Agent</h3>
                <p className="text-xs text-slate-500">
                  Select an authorized delivery agent to collect this returned product from the customer.
                </p>
              </div>

              {/* Pickup Location & Customer Info */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
                <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                  <span className="text-slate-500">Return Request:</span>
                  <strong className="font-mono text-slate-900">{assignAgentModalReturn.returnNumber}</strong>
                </div>
                <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                  <span className="text-slate-500">Product:</span>
                  <strong className="text-slate-900 truncate max-w-[240px]">
                    {assignAgentModalReturn.productName || 'Product'} (Qty: {assignAgentModalReturn.quantity})
                  </strong>
                </div>
                <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                  <span className="text-slate-500">Customer Name:</span>
                  <strong className="text-slate-900">{assignAgentModalReturn.customer?.fullName}</strong>
                </div>
                <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                  <span className="text-slate-500">Contact Phone:</span>
                  <strong className="text-slate-900">
                    {assignAgentModalReturn.order?.shippingAddress?.phone || assignAgentModalReturn.customer?.phone || 'N/A'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Customer Pickup Address:</span>
                  <p className="text-slate-800 font-medium">
                    {assignAgentModalReturn.order?.shippingAddress
                      ? `${assignAgentModalReturn.order.shippingAddress.street}, ${assignAgentModalReturn.order.shippingAddress.city}, ${assignAgentModalReturn.order.shippingAddress.state} - ${assignAgentModalReturn.order.shippingAddress.zipCode}`
                      : 'Customer registered delivery address'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleAssignAgentSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select Delivery Agent</label>
                  {deliveryAgentsList.length === 0 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                      No delivery agents found. Please ensure delivery agents are registered.
                    </div>
                  ) : (
                    <select
                      value={selectedDeliveryAgentId}
                      onChange={(e) => setSelectedDeliveryAgentId(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 outline-none font-bold text-slate-900 focus:border-blue-600 cursor-pointer"
                      required
                    >
                      <option value="">-- Choose an Available Agent --</option>
                      {deliveryAgentsList.map((agent) => (
                        <option key={agent._id || agent.id} value={agent._id || agent.id}>
                          {agent.fullName} ({agent.phone || 'No phone'}) - {agent.vehicleType || 'Vehicle'} [{agent.vehicleNumber || 'No plate'}] - {agent.availabilityStatus || 'Available'}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Pickup Instructions <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows="2"
                    value={assignAgentNotes}
                    onChange={(e) => setAssignAgentNotes(e.target.value)}
                    placeholder="e.g. Call customer before pickup, check tags, collect box..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 outline-none font-medium text-slate-800 focus:border-blue-600"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAssignAgentModalReturn(null)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingAction || !selectedDeliveryAgentId}
                    className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingAction ? 'Assigning...' : 'Confirm Agent Assignment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EVIDENCE PHOTO LIGHTBOX MODAL */}
      <EvidencePhotoModal
        isOpen={evidenceModal.isOpen}
        onClose={() => setEvidenceModal({ isOpen: false, imageUrl: '', returnDoc: null })}
        imageUrl={evidenceModal.imageUrl}
        returnDoc={evidenceModal.returnDoc}
      />
    </div>
  );
};

