import React from 'react';
import { useStore } from '../store/useStore';
import { WorkerNode } from '../types';
import { 
  Cpu, 
  Activity, 
  RotateCw, 
  Server, 
  CheckCircle2, 
  Clock, 
  HardDrive, 
  Radio, 
  Zap,
  ShieldCheck,
  Power
} from 'lucide-react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatNumber } from '../utils';
import { toast } from 'sonner';

export function WorkersPage() {
  const workers = useStore((s) => s.workers);
  const restartWorker = useStore((s) => s.restartWorker);

  const handleRestart = (id: string, name: string) => {
    restartWorker(id);
    toast.info(`Rolling restart initiated for ${name}`);
  };

  const totalProcessed = workers.reduce((sum, w) => sum + w.ordersProcessed, 0);
  const avgCpu = Math.round(workers.reduce((sum, w) => sum + w.cpuUsage, 0) / (workers.length || 1));
  const avgMem = Math.round(workers.reduce((sum, w) => sum + w.memoryUsage, 0) / (workers.length || 1));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Distributed Worker Execution Pool
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kubernetes horizontal pod autoscaling (HPA) execution nodes consuming from RabbitMQ broker.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>ALL PODS RUNNING</span>
          </div>
        </div>
      </div>

      {/* Cluster Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Active Worker Pool</span>
            <Server className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {workers.length} Nodes
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Kubernetes Cluster v1.31</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Cumulative Processed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {formatNumber(totalProcessed)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Zero unhandled exceptions</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Mean CPU Load</span>
            <Cpu className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-500 mt-1">
            {avgCpu}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Cluster capacity headroom: {100 - avgCpu}%</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Mean Memory Pressure</span>
            <HardDrive className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-500 mt-1">
            {avgMem}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Heap GC latency nominal</div>
        </Card>
      </div>

      {/* Worker Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workers.map((worker) => {
          const isBusy = worker.status === 'busy';
          const isRestarting = worker.status === 'restarting';

          return (
            <Card
              key={worker.id}
              className={`p-5 space-y-5 transition-all hover:border-slate-300 dark:hover:border-slate-700 ${
                isRestarting ? 'opacity-60 pointer-events-none' : ''
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-500 flex items-center justify-center font-mono font-bold text-sm">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {worker.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>Host: {worker.host}</span>
                      <span>•</span>
                      <span>Uptime: {Math.floor(worker.uptimeSeconds / 3600)}h</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isRestarting
                          ? 'bg-amber-500 animate-spin'
                          : isBusy
                          ? 'bg-amber-400 animate-ping'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span className="capitalize">{worker.status}</span>
                  </span>
                </div>
              </div>

              {/* Current Active Task Box with Heartbeat Pulse */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                    Active Pipeline Task
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    Concurrency: 1/{worker.concurrencyLimit}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-mono truncate leading-relaxed">
                  {worker.currentTask || 'Idle - Polling queue orders.v1.incoming'}
                </p>
              </div>

              {/* Telemetry Meters (CPU & Memory) */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                {/* CPU Meter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>CPU Core Load</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{worker.cpuUsage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        worker.cpuUsage > 75 ? 'bg-rose-500' : worker.cpuUsage > 50 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${worker.cpuUsage}%` }}
                    />
                  </div>
                </div>

                {/* Memory Meter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>RAM Utilization</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{worker.memoryUsage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        worker.memoryUsage > 75 ? 'bg-rose-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${worker.memoryUsage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Stats & Restart Button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 font-mono">
                  Processed: <span className="text-slate-800 dark:text-slate-200 font-bold">{formatNumber(worker.ordersProcessed)}</span>
                  <span className="text-slate-500 ml-2">({worker.successRate}% OK)</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<RotateCw className="w-3.5 h-3.5" />}
                  onClick={() => handleRestart(worker.id, worker.name)}
                >
                  Restart Pod
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
