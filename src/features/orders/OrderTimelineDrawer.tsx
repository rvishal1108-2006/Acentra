import React, { useState } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useStore } from '../../store/useStore';
import { 
  formatCurrency, 
  formatDate, 
  getStatusBadgeConfig 
} from '../../utils';
import { 
  RotateCcw, 
  XCircle, 
  Copy, 
  Check, 
  Clock, 
  Cpu, 
  Server, 
  AlertOctagon, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

export function OrderTimelineDrawer() {
  const selectedOrder = useStore((s) => s.selectedOrder);
  const isOpen = useStore((s) => s.isOrderDrawerOpen);
  const closeDrawer = useStore((s) => s.closeOrderDrawer);
  const requeueOrder = useStore((s) => s.requeueOrder);
  const cancelOrder = useStore((s) => s.cancelOrder);

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'payload' | 'logs'>('timeline');

  if (!selectedOrder) return null;

  const badgeConfig = getStatusBadgeConfig(selectedOrder.status);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedOrder, null, 2));
    setCopied(true);
    toast.success('Order JSON copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequeue = () => {
    requeueOrder(selectedOrder.id);
    toast.success(`Re-queued order ${selectedOrder.id} to orders.v1.incoming`);
  };

  const handleCancel = () => {
    cancelOrder(selectedOrder.id);
    toast.warning(`Order ${selectedOrder.id} cancelled. Reserved stock released.`);
  };

  const getStageIcon = (stage: string, status: string) => {
    if (status === 'error') return <AlertOctagon className="w-4 h-4 text-rose-500" />;
    if (status === 'warning') return <RotateCcw className="w-4 h-4 text-amber-500" />;
    if (stage === 'completed') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (stage === 'reserved') return <Package className="w-4 h-4 text-sky-500" />;
    if (stage === 'picked' || stage === 'processing') return <Cpu className="w-4 h-4 text-indigo-500" />;
    return <Clock className="w-4 h-4 text-slate-400" />;
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeDrawer}
      width="xl"
      title={
        <div className="flex items-center gap-3">
          <span className="font-mono text-xl font-bold tracking-tight">{selectedOrder.id}</span>
          <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${badgeConfig.badgeClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badgeConfig.dotClass}`} />
            {badgeConfig.label}
          </div>
        </div>
      }
      description={`Customer: ${selectedOrder.customerName} • Created ${formatDate(selectedOrder.createdAt)}`}
    >
      <div className="space-y-6">
        {/* Quick Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <div className="text-slate-400 font-medium">Product SKU</div>
            <div className="font-mono font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">
              {selectedOrder.productSku}
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Quantity</div>
            <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              {selectedOrder.quantity} Units
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Total Amount</div>
            <div className="font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {formatCurrency(selectedOrder.totalAmount)}
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Assigned Worker</div>
            <div className="font-medium text-slate-900 dark:text-slate-100 truncate mt-0.5">
              {selectedOrder.workerName || 'Awaiting Worker'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {(selectedOrder.status === 'dlq' || selectedOrder.status === 'failed' || selectedOrder.status === 'retrying') && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleRequeue}
            >
              Re-Queue Order
            </Button>
          )}

          {selectedOrder.status !== 'completed' && selectedOrder.status !== 'failed' && (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<XCircle className="w-3.5 h-3.5" />}
              onClick={handleCancel}
            >
              Cancel Order
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            onClick={handleCopyJson}
          >
            {copied ? 'Copied' : 'Copy JSON'}
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`pb-2 transition-colors border-b-2 ${
              activeTab === 'timeline'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Live Execution Timeline ({selectedOrder.timeline.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payload')}
            className={`pb-2 transition-colors border-b-2 ${
              activeTab === 'payload'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Payload & Metadata
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'timeline' ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {selectedOrder.timeline.map((item, idx) => (
              <div key={item.id || idx} className="relative group">
                {/* Node Dot */}
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-xs">
                  {getStageIcon(item.stage, item.status)}
                </div>

                {/* Event Card */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800/80 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-400">
                    <span className="uppercase font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300">
                      STAGE: {item.stage}
                    </span>
                    {item.durationMs && (
                      <span className="font-mono">
                        Latency: {item.durationMs}ms
                      </span>
                    )}
                    {item.workerId && (
                      <span className="font-mono text-indigo-500">
                        Node: {item.workerId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 overflow-x-auto font-mono text-xs text-emerald-400">
              <pre>{JSON.stringify(selectedOrder, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
