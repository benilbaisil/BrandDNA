import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  Download,
  AlertCircle,
  FileImage,
  Package,
  User,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const EvidencePhotoModal = ({ isOpen, onClose, imageUrl, returnDoc = null }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Reset controls when a new image or modal opens
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      setRotation(0);
      setImageError(false);
      setLoading(true);
    }
  }, [isOpen, imageUrl]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  // Resolve absolute image URL if relative
  const resolvedUrl = imageUrl.startsWith('data:') || imageUrl.startsWith('http://') || imageUrl.startsWith('https://')
    ? imageUrl
    : `${window.location.origin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = resolvedUrl;
    link.download = `Return_Evidence_${returnDoc?.returnNumber || 'photo'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
                <FileImage className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                  Customer Return Evidence Photo
                  {returnDoc?.returnNumber && (
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold">
                      {returnDoc.returnNumber}
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Inspected & verified customer defect evidence uploaded from device
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <a
                href={resolvedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-all"
                title="Open raw image in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Open Raw</span>
              </a>

              <button
                type="button"
                onClick={handleDownload}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                title="Download photo"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                title="Close modal (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Viewer Area */}
          <div className="relative flex-1 bg-slate-900 min-h-[320px] max-h-[58vh] flex items-center justify-center overflow-hidden select-none p-4">
            {/* Zoom & Rotate Toolbar */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-slate-800/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/80 shadow-lg text-white">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg hover:bg-slate-700/80 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg hover:bg-slate-700/80 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRotate}
                className="p-1.5 rounded-lg hover:bg-slate-700/80 transition-colors cursor-pointer"
                title="Rotate 90 degrees"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-700 mx-1" />
              <button
                type="button"
                onClick={handleReset}
                className="px-2 py-1 text-[11px] font-bold rounded-lg hover:bg-slate-700/80 transition-colors cursor-pointer"
                title="Reset Zoom & Rotation"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
            </div>

            {/* Loading Indicator */}
            {loading && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">
                <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3" />
                <span>Loading full resolution photo...</span>
              </div>
            )}

            {/* Error Fallback */}
            {imageError ? (
              <div className="p-8 text-center text-white space-y-3 max-w-md">
                <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
                <h4 className="font-bold text-sm">Image Preview Unavailable</h4>
                <p className="text-xs text-slate-400">
                  The evidence image could not be rendered directly in the viewer. You can open or download the file directly:
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <a
                    href={resolvedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Direct Link
                  </a>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download File
                  </button>
                </div>
              </div>
            ) : (
              /* The Image itself */
              <div className="w-full h-full flex items-center justify-center overflow-auto cursor-grab active:cursor-grabbing">
                <img
                  src={resolvedUrl}
                  alt={returnDoc?.productName || 'Customer Return Evidence'}
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setImageError(true);
                  }}
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    transition: 'transform 0.15s ease-out',
                  }}
                  className="max-h-[50vh] max-w-full object-contain rounded-lg shadow-2xl transition-all"
                />
              </div>
            )}
          </div>

          {/* Details / Context Footer */}
          {returnDoc && (
            <div className="p-4 sm:p-5 bg-white border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <Package className="w-3 h-3 text-slate-400" /> Product Details
                </span>
                <p className="font-bold text-slate-900 truncate">
                  {returnDoc.productName || returnDoc.product?.name || 'Returned Product'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Qty: <strong>{returnDoc.quantity || 1}</strong> {returnDoc.size && `• Size: ${returnDoc.size}`}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" /> Customer & Reason
                </span>
                <p className="font-bold text-slate-900 truncate">
                  {returnDoc.customer?.fullName || 'Customer'}
                </p>
                <p className="text-[11px] text-amber-800 font-semibold truncate">
                  Reason: {returnDoc.reason || 'Item defect'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> Customer Notes
                </span>
                <p className="text-slate-700 text-[11px] line-clamp-2">
                  {returnDoc.description ? `"${returnDoc.description}"` : 'No additional customer description provided.'}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
