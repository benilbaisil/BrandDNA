import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { UserPlus, FileText, BarChart3, Download, Zap } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminQuickActionCard = ({ onNavigateTab }) => {
  const { addToast } = useToast();

  const handleExport = () => {
    addToast('Exporting system database records to CSV...', 'success');
  };

  return (
    <Card className="text-left border-slate-200/90 p-5 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <Zap className="w-4 h-4 text-blue-600" />
        <h4 className="text-xs font-bold text-slate-900">Admin Quick Actions</h4>
      </div>

      <div className="space-y-2">
        <Button
          variant="primary"
          size="sm"
          icon={UserPlus}
          onClick={() => {
            if (onNavigateTab) onNavigateTab('users');
            addToast('Navigated to User Management', 'info');
          }}
          className="w-full justify-start shadow-xs"
        >
          Add User
        </Button>

        <Button
          variant="outline"
          size="sm"
          icon={FileText}
          onClick={() => {
            if (onNavigateTab) onNavigateTab('reports');
            addToast('Navigated to Report Management', 'info');
          }}
          className="w-full justify-start"
        >
          Generate Report
        </Button>

        <Button
          variant="outline"
          size="sm"
          icon={BarChart3}
          onClick={() => {
            if (onNavigateTab) onNavigateTab('system-analytics');
            addToast('Navigated to System Analytics', 'info');
          }}
          className="w-full justify-start"
        >
          View Analytics
        </Button>

        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={handleExport}
          className="w-full justify-start"
        >
          Export System Data
        </Button>
      </div>
    </Card>
  );
};
