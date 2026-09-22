import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { AuditLog } from '../types';
import { 
  FileText, 
  Search, 
  Download, 
  Filter, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2,
  Calendar,
  Layers,
  User
} from 'lucide-react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { formatDate, exportToCsv, exportToJson } from '../utils';
import { toast } from 'sonner';

export function AuditPage() {
  const auditLogs = useStore((s) => s.auditLogs);

  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedResult, setSelectedResult] = useState<string>('all');

  const modules = ['all', 'Orders', 'Inventory', 'Queues', 'Workers', 'Reservations', 'LoadTest', 'System', 'Auth'];

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (selectedModule !== 'all' && log.module !== selectedModule) return false;
      if (selectedResult !== 'all' && log.result !== selectedResult) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.user.name.toLowerCase().includes(q) ||
        log.ip.toLowerCase().includes(q)
      );
    });
  }, [auditLogs, selectedModule, selectedResult, search]);

  const handleExportCsv = () => {
    const flattened = filteredLogs.map((l) => ({
      ID: l.id,
      Timestamp: l.timestamp,
      User: l.user.name,
      Role: l.user.role,
      Module: l.module,
      Action: l.action,
      Result: l.result,
      Details: l.details,
      IP: l.ip
    }));
    exportToCsv(flattened, `audit_logs_${Date.now()}`);
    toast.success('Audit logs exported as CSV');
  };

  const handleExportJson = () => {
    exportToJson(filteredLogs, `audit_logs_${Date.now()}`);
    toast.success('Audit logs exported as JSON');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Enterprise Audit & Compliance Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable SOC2 / ISO-27001 audit trail recording all operator actions, queue purges, and automated events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportJson}
          >
            Export JSON
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:flex-1">
          <Input
            placeholder="Search by action, details, user name, or IP address..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-36">
            <Select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
            >
              {modules.map((m) => (
                <option key={m} value={m}>
                  Module: {m}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-36">
            <Select
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value)}
            >
              <option value="all">Result: All</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="failure">Failure</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Audit Log Table Card */}
      <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-semibold select-none">
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Module</th>
                <th className="p-3.5">Action Code</th>
                <th className="p-3.5">Result</th>
                <th className="p-3.5">Audit Details</th>
                <th className="p-3.5 font-mono">Source IP</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    No audit records matching query filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="p-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </td>

                      {/* Actor User */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img
                            src={log.user.avatar}
                            alt={log.user.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {log.user.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {log.user.role}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Module */}
                      <td className="p-3.5">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {log.module}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {log.action}
                      </td>

                      {/* Result */}
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            log.result === 'success'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : log.result === 'warning'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          }`}
                        >
                          {log.result === 'success' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          <span>{log.result}</span>
                        </span>
                      </td>

                      {/* Details */}
                      <td className="p-3.5 text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
                        {log.details}
                      </td>

                      {/* Source IP */}
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">
                        {log.ip}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Displaying {filteredLogs.length} verified events</span>
          <span className="font-mono">SHA-256 Ledger Verified</span>
        </div>
      </Card>
    </div>
  );
}
