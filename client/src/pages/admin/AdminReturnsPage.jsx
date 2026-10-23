import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  CreditCard,
  Package,
  Calendar,
  User,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { businessService } from '../../services/businessService';
import { useToast } from '../../context/ToastContext';
import { EvidencePhotoModal } from '../../components/common/EvidencePhotoModal';

export const AdminReturnsPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [returnsList, setReturnsList] = useState([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Return Detail / Reject Modal / Refund Modal
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [rejectModalReturn, setRejectModalReturn] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [refundModalReturn, setRefundModalReturn] = useState(null);
  const [refundAmount, setRefundAmount] = useState(0);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [evidenceModal, setEvidenceModal] = useState({
    isOpen: false,
    imageUrl: '',
    returnDoc: null,
  });

  const loadReturns = async () => {
    try {
      setRefreshing(true);
      const res = await businessService.getReturns();
      if (res?.data?.returns) {
        setReturnsList(res.data.returns);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load returns', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  // Admin Actions
  const handleReview = async (returnId) => {
    try {
      setProcessingAction(true);
      const res = await businessService.reviewReturn(returnId, { note: 'Review started by administrator' });
      if (res?.success) {
        addToast('Return status moved to UNDER_REVIEW', 'success');
        loadReturns();
        if (selectedReturn?._id === returnId) setSelectedReturn(res.data.returnDoc);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update review status', 'error');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleApprove = async (returnId) => {
    try {
      setProcessingAction(true);
      const res = await businessService.approveReturn(returnId, { note: 'Approved by administrator' });
      if (res?.success) {
        addToast('Return request approved. Item can now be received at warehouse.', 'success');
        loadReturns();
        if (selectedReturn?._id === returnId) setSelectedReturn(res.data.returnDoc);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to approve return', 'error');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModalReturn || !rejectionReason.trim()) {
      addToast('Please provide a valid rejection reason', 'error');
      return;
    }
    try {
      setProcessingAction(true);
      const res = await businessService.rejectReturn(rejectModalReturn._id, {
        rejectionReason: rejectionReason.trim(),
      });
      if (res?.success) {
        addToast('Return request rejected successfully', 'info');
        setRejectModalReturn(null);
        setRejectionReason('');
        loadReturns();
        if (selectedReturn?._id === rejectModalReturn._id) setSelectedReturn(res.data.returnDoc);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reject return', 'error');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRazorpayRefundSubmit = async (e) => {
    e.preventDefault();
    if (!refundModalReturn) return;
    const amt = Number(refundAmount);
    if (isNaN(amt) || amt <= 0) {
      addToast('Please enter a valid positive refund amount', 'error');
      return;
    }
    try {
      setProcessingRefund(true);
      const res = await businessService.refundReturn(refundModalReturn._id, { amount: amt });
      if (res?.success) {
        addToast(
          `Razorpay refund of ₹${amt} initiated successfully! (Refund ID: ${res.data?.refundResponse?.id || 'Processed'})`,
          'success'
        );
        setRefundModalReturn(null);
        loadReturns();
        if (selectedReturn?._id === refundModalReturn._id) setSelectedReturn(res.data.returnDoc);
      } else {
        addToast(res?.message || 'Refund processing failed', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to initiate Razorpay refund', 'error');
    } finally {
      setProcessingRefund(false);
    }
  };


  // KPI Calculations
  const totalReturns = returnsList.length;
  const pendingOrReview = returnsList.filter((r) =>
    ['RETURN_REQUESTED', 'UNDER_REVIEW', 'Pending'].includes(r.status)
  ).length;
  const approvedReturns = returnsList.filter((r) =>
    ['APPROVED', 'Approved', 'RETURN_RECEIVED', 'INSPECTED'].includes(r.status)
  ).length;
  const rejectedReturns = returnsList.filter((r) =>
    ['REJECTED', 'Rejected'].includes(r.status)
  ).length;
  const totalRefundedAmount = returnsList
    .filter((r) => ['Processed', 'Refunded'].includes(r.refundStatus))
    .reduce((sum, r) => sum + (r.refundDetails?.amount || r.refundAmount || 0), 0);

  // Filtered List
  const filteredReturns = returnsList.filter((r) => {
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'PENDING' && !['RETURN_REQUESTED', 'UNDER_REVIEW', 'Pending'].includes(r.status)) return false;
      if (statusFilter === 'APPROVED' && !['APPROVED', 'Approved'].includes(r.status)) return false;
      if (statusFilter === 'REJECTED' && !['REJECTED', 'Rejected'].includes(r.status)) return false;
      if (statusFilter === 'INSPECTED' && r.status !== 'INSPECTED') return false;
      if (statusFilter === 'REFUNDED' && !['Processed', 'Refunded'].includes(r.refundStatus)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = r.returnNumber?.toLowerCase().includes(q);
      const matchCust = r.customer?.fullName?.toLowerCase().includes(q) || r.customer?.email?.toLowerCase().includes(q);
      const matchProd = r.productName?.toLowerCase().includes(q) || r.product?.name?.toLowerCase().includes(q);
      const matchOrder = r.order?.orderNumber?.toLowerCase().includes(q);
      return matchNum || matchCust || matchProd || matchOrder;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-left">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#0B192C] text-white text-[10px] font-sans font-bold uppercase tracking-wider">
            BrandDNA Customer Operations
          </span>
          <h1 className="font-serif text-3xl font-extrabold text-slate-900 tracking-tight mt-2 flex items-center gap-2.5">
            <RotateCcw className="w-7 h-7 text-[#1E3E62]" />
            Return & Refund Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review customer return requests, enforce strict 7-day policy, record reasons, and monitor Razorpay refunds.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Requests</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{totalReturns}</span>
          <span className="text-[10px] text-slate-400 font-medium">All logged returns</span>
        </div>

        <div className="bg-amber-50/40 rounded-3xl p-5 border border-amber-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">Awaiting Review</span>
          <span className="text-2xl font-black text-amber-950 mt-1 block">{pendingOrReview}</span>
          <span className="text-[10px] text-amber-700 font-medium">Action required</span>
        </div>

        <div className="bg-emerald-50/40 rounded-3xl p-5 border border-emerald-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">Approved Returns</span>
          <span className="text-2xl font-black text-emerald-950 mt-1 block">{approvedReturns}</span>
          <span className="text-[10px] text-emerald-700 font-medium">In warehouse pipeline</span>
        </div>

        <div className="bg-rose-50/40 rounded-3xl p-5 border border-rose-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 block">Rejected</span>
          <span className="text-2xl font-black text-rose-950 mt-1 block">{rejectedReturns}</span>
          <span className="text-[10px] text-rose-700 font-medium">With recorded reason</span>
        </div>

        <div className="bg-sky-50/40 rounded-3xl p-5 border border-sky-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800 block">Razorpay Refunded</span>
          <span className="text-2xl font-black text-sky-950 mt-1 block">₹{totalRefundedAmount.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-sky-700 font-medium">Disbursed successfully</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 space-y-6">
        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by return #, customer, order #, product..."
              className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#0B192C]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['ALL', 'PENDING', 'APPROVED', 'INSPECTED', 'REFUNDED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#0B192C] text-white shadow-xs'
                    : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        {filteredReturns.length === 0 ? (
          <div className="p-12 text-center bg-stone-50 rounded-2xl text-slate-500 space-y-2 border border-stone-200/60">
            <RotateCcw className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-800 text-sm">No return requests found.</p>
            <p className="text-xs text-slate-400">All customer return requests will appear here for review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-stone-200/80">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0B192C] text-slate-300 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-bold">Return Number</th>
                  <th className="py-3.5 px-4 font-bold">Product Item</th>
                  <th className="py-3.5 px-4 font-bold">Customer</th>
                  <th className="py-3.5 px-4 font-bold">Order / Deadline</th>
                  <th className="py-3.5 px-4 font-bold">Reason</th>
                  <th className="py-3.5 px-4 font-bold">Lifecycle Status</th>
                  <th className="py-3.5 px-4 font-bold">Refund Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {filteredReturns.map((ret) => {
                  const pImg = ret.productImage || ret.product?.images?.[0] || '/images/cat_workout_essentials.jpg';
                  const isPending = ['RETURN_REQUESTED', 'UNDER_REVIEW', 'Pending'].includes(ret.status);

                  return (
                    <tr key={ret._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Return Number & Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 block">{ret.returnNumber}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(ret.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>

                      {/* Product Item */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 min-w-[180px]">
                          <img
                            src={pImg}
                            alt=""
                            onError={(e) => { e.target.src = '/images/cat_workout_essentials.jpg'; }}
                            className="w-10 h-10 object-contain bg-stone-50 rounded-lg p-1 border shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{ret.productName || ret.product?.name}</p>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Qty: <strong>{ret.quantity}</strong> • Est: ₹{ret.refundAmount || (ret.quantity * (ret.unitPrice || 0))}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800 block">{ret.customer?.fullName || 'Customer'}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{ret.customer?.email}</span>
                      </td>

                      {/* Order & 7-Day Deadline */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-800 block">#{ret.order?.orderNumber || 'ORDER'}</span>
                        <span className="text-[10px] text-emerald-700 block font-medium">
                          Deadline: {ret.returnDeadline ? new Date(ret.returnDeadline).toLocaleDateString() : '7 Days'}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 max-w-[160px]">
                        <span className="font-bold text-slate-800 block truncate">{ret.reason}</span>
                        {ret.description && (
                          <span className="text-[10px] text-slate-400 block truncate" title={ret.description}>
                            "{ret.description}"
                          </span>
                        )}
                        {ret.rejectionReason && (
                          <span className="text-[10px] text-rose-600 font-semibold block truncate" title={ret.rejectionReason}>
                            Rejection: {ret.rejectionReason}
                          </span>
                        )}
                      </td>

                      {/* Lifecycle Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                            ret.status === 'APPROVED' || ret.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : ret.status === 'REJECTED' || ret.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : ret.status === 'UNDER_REVIEW'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : ret.status === 'INSPECTED'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : ret.status === 'RETURN_RECEIVED'
                              ? 'bg-sky-50 text-sky-800 border-sky-300'
                              : 'bg-stone-100 text-stone-700 border-stone-300'
                          }`}
                        >
                          {ret.status?.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Refund Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {ret.refundStatus === 'Processed' || ret.refundStatus === 'Refunded' ? (
                          <div>
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              Refunded: ₹{ret.refundDetails?.amount || ret.refundAmount}
                            </span>
                            {ret.refundDetails?.razorpayRefundId && (
                              <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                                {ret.refundDetails.razorpayRefundId}
                              </span>
                            )}
                          </div>
                        ) : ret.refundStatus === 'Denied' ? (
                          <span className="text-[10px] font-bold text-rose-600">Denied</span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400">Pending</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedReturn(ret)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {ret.status !== 'REJECTED' && ret.status !== 'Rejected' && !['Processed', 'Refunded'].includes(ret.refundStatus) && (ret.inspectStatus === 'Resellable' || ret.status === 'INSPECTED') && (
                            <button
                              onClick={() => {
                                setRefundModalReturn(ret);
                                setRefundAmount(ret.refundAmount || (ret.quantity * (ret.unitPrice || 0)));
                              }}
                              disabled={processingRefund}
                              className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-white font-extrabold rounded-lg text-[11px] cursor-pointer transition-all inline-flex items-center gap-1 shadow-xs"
                              title="Process Razorpay Refund"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Refund via Razorpay</span>
                            </button>
                          )}

                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(ret._id)}
                                disabled={processingAction}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-[11px] cursor-pointer transition-all"
                                title="Approve Return"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setRejectModalReturn(ret);
                                  setRejectionReason('');
                                }}
                                disabled={processingAction}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-lg text-[11px] cursor-pointer transition-all"
                                title="Reject Return"
                              >
                                Reject
                              </button>
                            </>
                          )}
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

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: RAZORPAY GATEWAY REFUND SETTLEMENT LEDGER
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-600" /> Gateway Disbursals
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Synchronized with Razorpay API</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-sky-700" /> Razorpay Gateway Settlement Ledger
            </h2>
            <p className="text-xs text-slate-500">
              Audit log of all refund transactions credited back to customer payment sources through the Razorpay Payment Gateway.
            </p>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 sm:text-right">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block font-mono">
              Total Volume Refunded
            </span>
            <span className="text-2xl font-black text-emerald-950 block mt-0.5">
              ₹{totalRefundedAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">Disbursed directly via gateway</span>
          </div>
        </div>

        {/* Ledger Table */}
        {(() => {
          const refundedList = returnsList.filter(r => ['Processed', 'Refunded'].includes(r.refundStatus));

          if (refundedList.length === 0) {
            return (
              <div className="p-12 text-center bg-stone-50 rounded-2xl text-slate-400 text-xs border border-stone-200/60 space-y-2">
                <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700 text-sm">No Razorpay refund settlements recorded yet.</p>
                <p className="text-xs text-slate-400">Processed returns will automatically generate a Razorpay refund record here.</p>
              </div>
            );
          }

          return (
            <div className="overflow-x-auto rounded-2xl border border-stone-200/80">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0B192C] text-slate-300 font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">Razorpay Refund ID</th>
                    <th className="py-3 px-4 font-bold">Original Payment Ref</th>
                    <th className="py-3 px-4 font-bold">Return # / Order #</th>
                    <th className="py-3 px-4 font-bold">Customer</th>
                    <th className="py-3 px-4 font-bold">Returned Product</th>
                    <th className="py-3 px-4 font-bold">Refund Amount</th>
                    <th className="py-3 px-4 font-bold">Disbursed At</th>
                    <th className="py-3 px-4 font-bold text-right">Gateway Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {refundedList.map(ret => (
                    <tr key={ret._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-800 whitespace-nowrap">
                        {ret.refundDetails?.razorpayRefundId || 'rfnd_processed'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                        {ret.order?.razorpayPaymentId || 'pay_sim_verified'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 block">{ret.returnNumber}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{ret.order?.orderNumber || 'ORDER'}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800 block">{ret.customer?.fullName || 'Customer'}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{ret.customer?.email}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800 truncate max-w-[160px]">{ret.productName || ret.product?.name}</p>
                        <span className="text-[10px] text-slate-400 block font-mono">Qty: {ret.quantity}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 text-sm whitespace-nowrap">
                        ₹{(ret.refundDetails?.amount || ret.refundAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                        {ret.refundDetails?.refundedAt ? new Date(ret.refundDetails.refundedAt).toLocaleString() : 'Recent'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Settled via Gateway
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

      {/* Admin Razorpay Refund Modal */}
      <AnimatePresence>
        {refundModalReturn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative"
            >
              <button
                onClick={() => setRefundModalReturn(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 text-sky-700">
                <CreditCard className="w-6 h-6" />
                <h3 className="font-serif text-lg font-bold text-slate-900">Initiate Razorpay Refund</h3>
              </div>

              <p className="text-xs text-slate-500">
                Disburse refund for return <strong>{refundModalReturn.returnNumber}</strong> directly through the Razorpay Payment Gateway back to the customer's source account.
              </p>

              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer:</span>
                  <strong className="text-slate-800">{refundModalReturn.customer?.fullName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Order:</span>
                  <strong className="font-mono text-slate-800">#{refundModalReturn.order?.orderNumber || 'ORDER'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Razorpay Payment ID:</span>
                  <strong className="font-mono text-sky-700">{refundModalReturn.order?.razorpayPaymentId || 'pay_sim_verified'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Returned Item:</span>
                  <span className="font-medium text-slate-800">{refundModalReturn.productName || refundModalReturn.product?.name} ({refundModalReturn.quantity} unit)</span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-1.5">
                  <span className="text-slate-400 font-bold">Item Valuation:</span>
                  <strong className="text-emerald-700 font-mono font-bold">
                    ₹{refundModalReturn.refundAmount || (refundModalReturn.quantity * (refundModalReturn.unitPrice || 0))}
                  </strong>
                </div>
              </div>

              <form onSubmit={handleRazorpayRefundSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Refund Amount in INR (₹)</label>
                  <input
                    type="number"
                    min="1"
                    max={refundModalReturn.order?.totalAmount || refundModalReturn.refundAmount}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 outline-none font-mono font-bold text-sm text-slate-900 focus:border-sky-600"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Refund will be credited via Razorpay back to customer's card / UPI / netbanking.
                  </span>
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
                    disabled={processingRefund || Number(refundAmount) <= 0}
                    className="flex-1 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{processingRefund ? 'Disbursing...' : `Disburse ₹${refundAmount}`}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Reason Modal */}
      <AnimatePresence>
        {rejectModalReturn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative"
            >
              <button
                onClick={() => setRejectModalReturn(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 text-rose-600">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="font-serif text-lg font-bold text-slate-900">Reject Return Request</h3>
              </div>

              <p className="text-xs text-slate-500">
                Rejecting return <strong>{rejectModalReturn.returnNumber}</strong> for {rejectModalReturn.productName || 'product'}. Please record a mandatory rejection reason for the customer.
              </p>

              <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
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
                    disabled={processingAction || !rejectionReason.trim()}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {processingAction ? 'Processing...' : 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Return Detail Drawer/Modal */}
      <AnimatePresence>
        {selectedReturn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedReturn(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <div className="border-b border-stone-100 pb-3">
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Return Detail Record
                </span>
                <h3 className="font-serif text-xl font-bold text-slate-900 mt-0.5">
                  {selectedReturn.returnNumber}
                </h3>
              </div>

              {/* Status and Action Badge Row */}
              <div className="flex items-center justify-between gap-2 bg-stone-50 p-3 rounded-2xl border border-stone-200/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Return Status</span>
                  <span className="font-extrabold text-slate-900">{selectedReturn.status?.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Inspection Status</span>
                  <span className="font-extrabold text-slate-800">{selectedReturn.inspectStatus || 'Pending'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Refund Status</span>
                  <span className="font-extrabold text-emerald-700">{selectedReturn.refundStatus || 'Pending'}</span>
                </div>
              </div>

              {/* Product and Order Context */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
                  <img
                    src={selectedReturn.productImage || selectedReturn.product?.images?.[0] || '/images/cat_workout_essentials.jpg'}
                    alt=""
                    onError={(e) => { e.target.src = '/images/cat_workout_essentials.jpg'; }}
                    className="w-12 h-12 object-contain bg-white rounded-xl p-1 border shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{selectedReturn.productName || selectedReturn.product?.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Quantity: <strong>{selectedReturn.quantity}</strong> • Unit Price: ₹{selectedReturn.unitPrice} • Refund Value: <strong>₹{selectedReturn.refundAmount}</strong>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Customer</span>
                    <strong className="text-slate-800">{selectedReturn.customer?.fullName}</strong>
                    <span className="text-[10px] text-slate-500 block font-mono">{selectedReturn.customer?.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Order</span>
                    <strong className="text-slate-800">#{selectedReturn.order?.orderNumber || 'ORDER'}</strong>
                    <span className="text-[10px] text-slate-500 block">Total: ₹{selectedReturn.order?.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Return Reason and Customer Notes */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Return Reason</span>
                <p className="font-bold text-slate-900">{selectedReturn.reason}</p>
                {selectedReturn.description && (
                  <p className="text-slate-600 mt-1">"{selectedReturn.description}"</p>
                )}
                {selectedReturn.evidenceImage && (
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 block mb-1">Customer Evidence Photo:</span>
                    <button
                      type="button"
                      onClick={() => setEvidenceModal({ isOpen: true, imageUrl: selectedReturn.evidenceImage, returnDoc: selectedReturn })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs border border-blue-200 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Photo Evidence
                    </button>
                  </div>
                )}
              </div>

              {/* Rejection / Refund Details if present */}
              {selectedReturn.rejectionReason && (
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Rejection Reason</span>
                  <p className="text-rose-950 font-medium">{selectedReturn.rejectionReason}</p>
                </div>
              )}

              {selectedReturn.refundDetails?.razorpayRefundId && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Razorpay Refund Details</span>
                  <p className="text-emerald-950 font-mono text-[11px]">
                    Refund ID: <strong>{selectedReturn.refundDetails.razorpayRefundId}</strong>
                  </p>
                  <p className="text-emerald-950">
                    Amount: <strong>₹{selectedReturn.refundDetails.amount}</strong> • Status: {selectedReturn.refundDetails.status}
                  </p>
                  <p className="text-[10px] text-emerald-700">
                    Disbursed on: {new Date(selectedReturn.refundDetails.refundedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Audit Status History */}
              {selectedReturn.statusHistory && selectedReturn.statusHistory.length > 0 && (
                <div className="space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Audit Trail</span>
                  <div className="divide-y divide-stone-100 max-h-36 overflow-y-auto rounded-xl border border-stone-200 p-2 bg-stone-50">
                    {selectedReturn.statusHistory.map((h, i) => (
                      <div key={i} className="py-1.5 first:pt-0 last:pb-0 text-[11px] flex items-center justify-between">
                        <div>
                          <strong className="text-slate-800 font-mono">{h.status}</strong>
                          {h.note && <span className="text-slate-500 block text-[10px]">{h.note}</span>}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(h.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                {!['Processed', 'Refunded'].includes(selectedReturn.refundStatus) &&
                  !['REJECTED', 'Rejected'].includes(selectedReturn.status) &&
                  (selectedReturn.inspectStatus === 'Resellable' || selectedReturn.status === 'INSPECTED') && (
                    <button
                      onClick={() => {
                        setRefundModalReturn(selectedReturn);
                        setRefundAmount(selectedReturn.refundAmount || (selectedReturn.quantity * (selectedReturn.unitPrice || 0)));
                      }}
                      disabled={processingRefund}
                      className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Initiate Razorpay Refund</span>
                    </button>
                  )}

                {['RETURN_REQUESTED', 'Pending'].includes(selectedReturn.status) && (
                  <button
                    onClick={() => handleReview(selectedReturn._id)}
                    disabled={processingAction}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Mark Under Review
                  </button>
                )}

                {['RETURN_REQUESTED', 'UNDER_REVIEW', 'Pending'].includes(selectedReturn.status) && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedReturn._id)}
                      disabled={processingAction}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Approve Return
                    </button>
                    <button
                      onClick={() => {
                        setRejectModalReturn(selectedReturn);
                        setSelectedReturn(null);
                        setRejectionReason('');
                      }}
                      disabled={processingAction}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Reject Return
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Evidence Photo Lightbox Modal */}
      <EvidencePhotoModal
        isOpen={evidenceModal.isOpen}
        onClose={() => setEvidenceModal({ isOpen: false, imageUrl: '', returnDoc: null })}
        imageUrl={evidenceModal.imageUrl}
        returnDoc={evidenceModal.returnDoc}
      />
    </div>
  );
};
