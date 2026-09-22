import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Workflow, 
  Layers, 
  Trash2, 
  RefreshCw, 
  ArrowRight, 
  Radio, 
  Zap, 
  Cpu, 
  Server, 
  AlertTriangle,
  Send,
  Sliders,
  Play
} from 'lucide-react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatNumber } from '../utils';
import { toast } from 'sonner';

export function QueuesPage() {
  const queues = useStore((s) => s.queues);
  const purgeQueue = useStore((s) => s.purgeQueue);
  const addEvent = useStore((s) => s.addEvent);
  const [selectedQueueId, setSelectedQueueId] = useState<string>(queues[0].id);

  const selectedQueue = queues.find((q) => q.id === selectedQueueId) || queues[0];

  const handlePurge = (id: string) => {
    purgeQueue(id);
    toast.warning(`Purged messages from ${id}`);
  };

  const handleInjectSynthetic = () => {
    toast.success('Injected 100 synthetic benchmark messages to ingress exchange');
    addEvent({
      type: 'new_order',
      title: 'Synthetic Load Injection',
      description: 'Operator injected 100 test message packets into orders.v1.incoming',
      severity: 'info'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            RabbitMQ AMQP Broker & Queue Topology
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Distributed message exchange pipeline with dead-letter exchange (DLX) routing and worker consumer prefetch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Send className="w-4 h-4 text-indigo-400" />}
            onClick={handleInjectSynthetic}
          >
            Inject 100 Messages
          </Button>
        </div>
      </div>

      {/* Interactive Topology Visualizer */}
      <Card className="p-6 relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-950 border border-indigo-500/20">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-pink-500 animate-pulse" />
            <span className="text-sm font-bold text-white tracking-tight">Live Message Pipeline Flow</span>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Cluster Rate: ~{(queues[0].throughputIn).toFixed(1)} msg/s
          </span>
        </div>

        {/* Animated Nodes Canvas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
          {/* Node 1: Ingress Gateway */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/70 text-center space-y-2 relative group hover:border-indigo-500 transition-colors">
            <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-white">API Ingress Exchange</div>
            <p className="text-[10px] text-slate-400">orders.direct.exchange</p>
            <div className="text-xs font-mono font-bold text-indigo-400 pt-1">
              +{queues[0].throughputIn} msg/s
            </div>
          </div>

          {/* Node 2: Primary Order Queue */}
          <div 
            onClick={() => setSelectedQueueId('q-orders')}
            className={`p-4 rounded-2xl bg-slate-900/80 border text-center space-y-2 relative cursor-pointer transition-all ${
              selectedQueueId === 'q-orders' ? 'border-pink-500 ring-2 ring-pink-500/30' : 'border-slate-700/70 hover:border-pink-500/50'
            }`}
          >
            <div className="w-10 h-10 mx-auto rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <Workflow className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-white">Incoming Order Queue</div>
            <p className="text-[10px] text-slate-400">orders.v1.incoming</p>
            <div className="text-lg font-mono font-bold text-pink-400 pt-1">
              {queues[0].messages} msgs
            </div>
            <span className="inline-block text-[9px] font-mono px-2 py-0.5 rounded bg-pink-500/10 text-pink-300">
              Prefetch: 50
            </span>
          </div>

          {/* Node 3: Retry Backoff Queue */}
          <div 
            onClick={() => setSelectedQueueId('q-retry')}
            className={`p-4 rounded-2xl bg-slate-900/80 border text-center space-y-2 relative cursor-pointer transition-all ${
              selectedQueueId === 'q-retry' ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-slate-700/70 hover:border-amber-500/50'
            }`}
          >
            <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-white">Retry Backoff Queue</div>
            <p className="text-[10px] text-slate-400">orders.v1.retry.backoff</p>
            <div className="text-lg font-mono font-bold text-amber-400 pt-1">
              {queues[1].messages} msgs
            </div>
            <span className="inline-block text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">
              TTL: Exponential
            </span>
          </div>

          {/* Node 4: Dead Letter Queue */}
          <div 
            onClick={() => setSelectedQueueId('q-dlq')}
            className={`p-4 rounded-2xl bg-slate-900/80 border text-center space-y-2 relative cursor-pointer transition-all ${
              selectedQueueId === 'q-dlq' ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-slate-700/70 hover:border-rose-500/50'
            }`}
          >
            <div className="w-10 h-10 mx-auto rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-white">Dead Letter Queue (DLQ)</div>
            <p className="text-[10px] text-slate-400">orders.v1.deadletter.dlq</p>
            <div className="text-lg font-mono font-bold text-rose-400 pt-1">
              {queues[2].messages} msgs
            </div>
            <span className="inline-block text-[9px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300">
              Action Required
            </span>
          </div>
        </div>
      </Card>

      {/* Selected Queue Detailed Inspection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {queues.map((q) => {
          const isSelected = q.id === selectedQueueId;

          return (
            <Card
              key={q.id}
              className={`p-5 space-y-4 transition-all cursor-pointer ${
                isSelected ? 'ring-2 ring-indigo-500 shadow-xl' : 'hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              onClick={() => setSelectedQueueId(q.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-sm font-bold text-slate-900 dark:text-white truncate">
                    {q.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">vhost: {q.vhost}</span>
                </div>
                <Badge
                  variant={q.state === 'active' ? 'success' : q.state === 'surging' ? 'warning' : 'danger'}
                  size="sm"
                  dot
                >
                  {q.state}
                </Badge>
              </div>

              {/* Message Volume */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-baseline justify-between font-mono">
                <div>
                  <div className="text-xs text-slate-400">Current Depth</div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                    {q.messages}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Consumers</div>
                  <div className="text-xl font-bold text-indigo-500 mt-1">
                    {q.consumers} Pods
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="text-[10px] text-slate-400">Throughput In</div>
                  <div className="font-bold text-emerald-500 mt-0.5">+{q.throughputIn} /s</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="text-[10px] text-slate-400">Throughput Out</div>
                  <div className="font-bold text-cyan-500 mt-0.5">-{q.throughputOut} /s</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="text-[10px] text-slate-400">Avg Wait Time</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{q.avgWaitTimeMs}ms</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="text-[10px] text-slate-400">RAM Allocation</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {(q.memoryBytes / (1024 * 1024)).toFixed(1)} MB
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePurge(q.id);
                  }}
                >
                  Purge Queue
                </Button>
                <span className="text-[10px] text-slate-400 font-mono">Durable • Ack Req</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
