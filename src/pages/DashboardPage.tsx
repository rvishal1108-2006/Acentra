import React from 'react';
import { useStore } from '../store/useStore';
import { 
  ShoppingBag, 
  CheckCircle2, 
  Activity, 
  Clock, 
  AlertTriangle, 
  RotateCcw, 
  AlertOctagon, 
  PackageX, 
  ArrowUpRight, 
  ArrowDownRight, 
  Cpu, 
  Workflow, 
  Database, 
  Globe, 
  Radio, 
  Zap, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Sparkline } from '../components/ui/Sparkline';
import { Button } from '../components/ui/Button';
import { formatNumber } from '../utils';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const kpis = useStore((s) => s.kpis);
  const systemHealth = useStore((s) => s.systemHealth);
  const queues = useStore((s) => s.queues);
  const workers = useStore((s) => s.workers);
  const eventFeed = useStore((s) => s.eventFeed);
  const orders = useStore((s) => s.orders);
  const openOrderDrawer = useStore((s) => s.openOrderDrawer);
  const setCommandPaletteOpen = useStore((s) => s.setCommandPaletteOpen);

  const kpiCards = [
    {
      title: 'Orders Received',
      value: formatNumber(kpis.ordersReceived),
      trend: '+12.4%',
      isPositive: true,
      icon: ShoppingBag,
      color: 'indigo' as const,
      sparkline: kpis.sparklines.received
    },
    {
      title: 'Orders Processed',
      value: formatNumber(kpis.ordersProcessed),
      trend: '+14.1%',
      isPositive: true,
      icon: CheckCircle2,
      color: 'emerald' as const,
      sparkline: kpis.sparklines.processed
    },
    {
      title: 'Processing Rate',
      value: `${kpis.processingRate} /s`,
      trend: '+4.2%',
      isPositive: true,
      icon: Activity,
      color: 'sky' as const,
      sparkline: kpis.sparklines.rate
    },
    {
      title: 'Pending Orders',
      value: formatNumber(kpis.pendingOrders),
      trend: '-2.5%',
      isPositive: true,
      icon: Clock,
      color: 'amber' as const,
      sparkline: kpis.sparklines.queue
    },
    {
      title: 'Failed Orders',
      value: formatNumber(kpis.failedOrders),
      trend: '-0.8%',
      isPositive: true,
      icon: AlertTriangle,
      color: 'rose' as const,
      sparkline: kpis.sparklines.failed
    },
    {
      title: 'Retry Queue',
      value: formatNumber(kpis.retryQueueCount),
      trend: '+1.2%',
      isPositive: false,
      icon: RotateCcw,
      color: 'amber' as const,
      sparkline: [2, 3, 4, 3, 5, 4, 6]
    },
    {
      title: 'DLQ Messages',
      value: formatNumber(kpis.dlqCount),
      trend: kpis.dlqCount > 10 ? '+3.1%' : 'Nominal',
      isPositive: kpis.dlqCount <= 10,
      icon: AlertOctagon,
      color: 'rose' as const,
      sparkline: [8, 9, 10, 11, 10, 12]
    },
    {
      title: 'Inventory Alerts',
      value: `${kpis.inventoryAlerts} SKUs`,
      trend: 'Low threshold',
      isPositive: false,
      icon: PackageX,
      color: 'amber' as const,
      sparkline: [1, 2, 2, 2, 3, 2]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Dashboard Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/40 via-slate-900/70 to-slate-950 border border-indigo-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>SYSTEM ONLINE • HIGH AVAILABILITY ACTIVE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Acentra Live Operations Center
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time enterprise telemetry across distributed ingress gateways, RabbitMQ message brokers, 
              asynchronous worker pools, and inventory hold reservations.
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="glow"
              size="md"
              leftIcon={<Zap className="w-4 h-4" />}
              onClick={() => setCommandPaletteOpen(true)}
            >
              Command Palette (Ctrl+K)
            </Button>
            <Link to="/loadtest">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Activity className="w-4 h-4 text-cyan-400" />}
              >
                Load Test Console
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8 pt-6 border-t border-white/10 text-slate-200">
          <div>
            <div className="text-xs text-slate-400 font-medium">Orders Today</div>
            <div className="text-2xl font-extrabold text-white mt-0.5 tracking-tight">
              {formatNumber(kpis.ordersToday)}
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="w-3 h-3" /> +18.2% vs yesterday
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Processing Rate</div>
            <div className="text-2xl font-extrabold text-cyan-300 mt-0.5 tracking-tight font-mono">
              {kpis.processingRate} /s
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Adaptive autoscaling</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Success Rate</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-0.5 tracking-tight font-mono">
              {kpis.successRate}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">SLA target: 99.0%</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Active Worker Nodes</div>
            <div className="text-2xl font-extrabold text-indigo-300 mt-0.5 tracking-tight font-mono">
              {workers.filter((w) => w.status === 'active' || w.status === 'busy').length} / {workers.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">K8s cluster pod pool</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Total Queue Depth</div>
            <div className="text-2xl font-extrabold text-pink-300 mt-0.5 tracking-tight font-mono">
              {queues.reduce((a, b) => a + b.messages, 0)} msgs
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">RabbitMQ East Cluster</div>
          </div>
        </div>
      </div>

      {/* 8 Animated Live KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="group hover:-translate-y-1 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {card.title}
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                    {card.value}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-indigo-500 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <div className={`text-xs font-semibold flex items-center gap-0.5 ${card.isPositive ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {card.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>{card.trend}</span>
                </div>
                <Sparkline data={card.sparkline} color={card.color} width={80} height={22} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Operations Grid: Queue Flow + Workers + Live Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: RabbitMQ & Workers Snapshot */}
        <div className="lg:col-span-2 space-y-6">
          {/* RabbitMQ Queues Overview Card */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-pink-500" />
                  <span>RabbitMQ Broker Telemetry</span>
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">Live message ingress, retry backoff & dead-letter queue</p>
              </div>
              <Link to="/queues">
                <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                  View Topology
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {queues.map((q) => (
                <div
                  key={q.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                      {q.name}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                      {q.messages}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">msgs queued</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800 pt-1.5 font-mono">
                    <span>{q.throughputIn} in/s</span>
                    <span>{q.throughputOut} out/s</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Worker Pool Status */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-500" />
                  <span>Distributed Worker Nodes</span>
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">CPU load, active tasks and heartbeat synchronization</p>
              </div>
              <Link to="/workers">
                <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                  Inspect Workers
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {workers.map((worker) => (
                <div
                  key={worker.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${worker.status === 'busy' ? 'bg-amber-500 animate-ping' : worker.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{worker.name}</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300">
                      {worker.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {worker.currentTask || 'Idle - Polling queue'}
                  </p>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>CPU Utilization</span>
                      <span className="text-slate-700 dark:text-slate-200 font-semibold">{worker.cpuUsage}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${worker.cpuUsage > 75 ? 'bg-rose-500' : worker.cpuUsage > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${worker.cpuUsage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Col: Live Event Feed */}
        <div className="space-y-6">
          <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                <CardTitle>Live Activity Feed</CardTitle>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Streaming</span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[460px] space-y-3 py-3 pr-1">
              {eventFeed.slice(0, 10).map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${evt.severity === 'error' ? 'bg-rose-500' : evt.severity === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                      {evt.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {evt.description}
                  </p>
                  {evt.orderId && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = orders.find((o) => o.id === evt.orderId);
                        if (target) openOrderDrawer(target);
                      }}
                      className="mt-1 text-[10px] font-mono text-indigo-500 hover:text-indigo-400 font-semibold inline-flex items-center gap-1"
                    >
                      Inspect {evt.orderId} →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Source Health Panel */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Core Service Health & Latencies</span>
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">End-to-end component SLAs, database connection pools, and brokers</p>
          </div>
          <div className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            ALL SYSTEMS NORMAL
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { metric: systemHealth.api, icon: Globe },
            { metric: systemHealth.postgres, icon: Database },
            { metric: systemHealth.rabbitmq, icon: Workflow },
            { metric: systemHealth.websocket, icon: Radio },
            { metric: systemHealth.workerCluster, icon: Cpu },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    {item.metric.name.split(' ')[0]}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {item.metric.latencyMs}ms
                  </span>
                  <span className="text-[10px] text-slate-400">{item.metric.extra}</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {item.metric.description}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
