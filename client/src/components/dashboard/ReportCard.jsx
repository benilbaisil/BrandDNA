import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { FileText, Download, Share2, Eye } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const ReportCard = () => {
  const { addToast } = useToast();

  const report = {
    title: 'BrandDNA AI Blueprint & Strategy Audit 2026.pdf',
    size: '2.4 MB',
    date: 'Generated 2 hours ago',
  };

  return (
    <Card hoverEffect className="text-left border-[#E5E0D8]/90 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F291E] leading-tight">AI Strategy & Legal Reports</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Exportable Investor Documentation</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0F291E]">{report.title}</h4>
            <p className="text-[11px] text-slate-500">{report.size} • {report.date}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => addToast('Opening PDF preview...', 'info')}
          >
            View
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Share2}
            onClick={() => addToast('Share link copied to clipboard!', 'info')}
          >
            Share
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={() => addToast('Downloading PDF report...', 'success')}
          >
            Download
          </Button>
        </div>
      </div>
    </Card>
  );
};

