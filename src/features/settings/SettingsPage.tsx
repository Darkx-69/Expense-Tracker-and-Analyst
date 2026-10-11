import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  HardDrive,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useFinanceStore } from '../../store/finance-store';
import { exportService } from '../../services/export';
import { formatINR } from '../../lib/financial-engine';

export function SettingsPage() {
  const navigate = useNavigate();
  const state = useFinanceStore((s) => s.state);
  const resetDemoData = useFinanceStore((s) => s.resetDemoData);
  const loadStateFromBackup = useFinanceStore((s) => s.loadStateFromBackup);
  const clearUserData = useFinanceStore((s) => s.clearUserData);

  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Storage estimation
  const storageBytes =
    typeof window !== 'undefined' && window.localStorage
      ? JSON.stringify(window.localStorage).length
      : 0;

  const handleExportJson = () => {
    exportService.exportToJson(state);
  };

  const handleExportCsv = () => {
    exportService.exportTransactionsToCsv(state.transactions);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = exportService.importFromJson(content);
      if (res.success && res.data) {
        loadStateFromBackup(res.data);
        setImportStatus({
          type: 'success',
          message: 'Backup successfully verified & restored!',
        });
      } else {
        setImportStatus({
          type: 'error',
          message: res.error || 'Failed to parse JSON backup.',
        });
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleResetDemo = () => {
    if (
      window.confirm(
        'Reset all data back to the original Day 1 deterministic baseline (₹10,000 budget)?'
      )
    ) {
      resetDemoData();
      setImportStatus({
        type: 'success',
        message: 'Original demo data baseline restored successfully.',
      });
      navigate('/');
    }
  };

  const handleClearData = () => {
    if (
      window.confirm(
        'Clear all browser storage? This will remove all local changes and reinitialize demo data.'
      )
    ) {
      clearUserData();
      setImportStatus({
        type: 'success',
        message: 'Storage cleared and reinitialized.',
      });
      navigate('/');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <Settings className="h-6 w-6 text-lime-400" /> Settings & Data Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage local browser storage, import/export JSON state backups, and reset baseline.
        </p>
      </div>

      {/* Status banner */}
      {importStatus && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-in fade-in ${
            importStatus.type === 'success'
              ? 'bg-lime-400/15 border-lime-400/40 text-lime-200'
              : 'bg-red-400/15 border-red-400/40 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {importStatus.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-lime-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
          <button
            onClick={() => setImportStatus(null)}
            className="text-xs font-bold underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Local Storage Status Card */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-sm">
              <HardDrive className="h-4 w-4 text-lime-400" /> Browser Local Storage
            </CardTitle>
            <CardDescription>
              Client-only persistence: zero external database dependencies or authentication tokens
            </CardDescription>
          </div>
          <Badge variant="lime" size="sm">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Client-Side Only
          </Badge>
        </CardHeader>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 rounded-lg bg-charcoal-950 border border-charcoal-800">
            <span className="text-slate-400 block">Current Day</span>
            <span className="font-mono font-bold text-slate-100 text-sm">
              Day {state.currentDay} of 30
            </span>
          </div>
          <div className="p-3 rounded-lg bg-charcoal-950 border border-charcoal-800">
            <span className="text-slate-400 block">Total Transactions</span>
            <span className="font-mono font-bold text-slate-100 text-sm">
              {state.transactions.length}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-charcoal-950 border border-charcoal-800">
            <span className="text-slate-400 block">Storage Footprint</span>
            <span className="font-mono font-bold text-lime-400 text-sm">
              {(storageBytes / 1024).toFixed(1)} KB / 5 MB
            </span>
          </div>
          <div className="p-3 rounded-lg bg-charcoal-950 border border-charcoal-800">
            <span className="text-slate-400 block">Schema Version</span>
            <span className="font-mono font-bold text-slate-100 text-sm">v{state.version}</span>
          </div>
        </div>
      </Card>

      {/* Export & Import Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Card */}
        <Card className="space-y-3">
          <CardHeader className="pb-2 border-none">
            <CardTitle className="text-sm">Data Export</CardTitle>
            <CardDescription>
              Download a complete JSON snapshot or CSV transaction ledger
            </CardDescription>
          </CardHeader>

          <p className="text-xs text-slate-400 leading-relaxed">
            Exports include all transactions, budget allocations, commitments, savings goals, and daily simulation history.
          </p>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <Button
              data-testid="export-data-button"
              variant="primary"
              size="sm"
              onClick={handleExportJson}
            >
              <Download className="h-4 w-4 mr-1.5" /> Export Full JSON
            </Button>

            <Button variant="secondary" size="sm" onClick={handleExportCsv}>
              <FileSpreadsheet className="h-4 w-4 mr-1.5 text-lime-400" /> Export CSV Ledger
            </Button>
          </div>
        </Card>

        {/* Import Card */}
        <Card className="space-y-3">
          <CardHeader className="pb-2 border-none">
            <CardTitle className="text-sm">Data Import</CardTitle>
            <CardDescription>
              Restore financial state from an existing JSON backup
            </CardDescription>
          </CardHeader>

          <p className="text-xs text-slate-400 leading-relaxed">
            All imported files are strictly validated with Zod runtime schemas before being loaded into state.
          </p>

          <div className="pt-2">
            <label className="inline-block">
              <input
                data-testid="import-data-button"
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
                id="json-file-input"
              />
              <span className="inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg text-sm px-4 py-2 h-10 gap-2 bg-charcoal-800 text-slate-100 hover:bg-charcoal-700 border border-charcoal-700 cursor-pointer">
                <Upload className="h-4 w-4 mr-1.5 text-lime-400" /> Upload JSON Backup
              </span>
            </label>
          </div>
        </Card>
      </div>

      {/* Reset & Wipe Section */}
      <Card className="border-red-500/20 bg-charcoal-900">
        <CardHeader>
          <div>
            <CardTitle className="text-red-400 text-sm">Danger Zone / Baseline Reset</CardTitle>
            <CardDescription>
              Restore original deterministic demo baseline or clear local browser storage
            </CardDescription>
          </div>
        </CardHeader>

        <div className="flex flex-wrap gap-3">
          <Button
            data-testid="reset-demo-button"
            variant="amber"
            size="sm"
            onClick={handleResetDemo}
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Reset to Deterministic Demo Baseline
          </Button>

          <Button variant="danger" size="sm" onClick={handleClearData}>
            <Trash2 className="h-4 w-4 mr-1.5" />
            Clear All User Data & Wipe Storage
          </Button>
        </div>
      </Card>

      {/* About Section */}
      <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center gap-2 text-slate-200 font-bold">
          <Zap className="h-4 w-4 text-lime-400 fill-current" />
          BROKE BUT FUNCTIONAL — SURVIVE THE MONTH
        </div>
        <p>
          Tagline: <em className="text-slate-300">₹10,000. 30 days. Every decision counts.</em>
        </p>
        <p className="text-[11px] text-slate-500">
          Built for Gen Z students & young adults. Powered by React, TypeScript, Tailwind CSS, Recharts, Zustand & Vitest.
        </p>
      </div>
    </div>
  );
}
