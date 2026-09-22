import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  Layers, 
  Download, 
  Calendar, 
  Zap,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

export function AnalyticsPage() {
  const theme = useStore((s) => s.theme);
  const kpis = useStore((s) => s.kpis);
  const workers = useStore((s) => s.workers);
  const orders = useStore((s) => s.orders);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('1h');

  // Time Range Tabs
  const rangeTabs = [
    { id: '1h', label: 'Last 1 Hour' },
    { id: '24h', label: 'Last 24 Hours' },
    { id: '7d', label: 'Last 7 Days' },
  ];

  // 1. Orders Per Minute Time Series
  const ordersPerMinuteData = [
    { time: '12:00', orders: 38, processed: 36, rate: 41 },
    { time: '12:10', orders: 42, processed: 40, rate: 43 },
    { time: '12:20', orders: 55, processed: 51, rate: 52 },
    { time: '12:30', orders: 68, processed: 64, rate: 66 },
    { time: '12:40', orders: 62, processed: 60, rate: 61 },
    { time: '12:50', orders: 74, processed: 72, rate: 73 },
    { time: '13:00', orders: 85, processed: 82, rate: 84 },
    { time: '13:10', orders: Math.round(kpis.processingRate * 1.8), processed: Math.round(kpis.processingRate * 1.7), rate: Math.round(kpis.processingRate) },
  ];

  // 2. Order Status Distribution (Donut)
  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusDonutData = [
    { name: 'Completed', value: statusCounts['completed'] || 12, color: '#10b981' },
    { name: 'Processing', value: statusCounts['processing'] || 6, color: '#6366f1' },
    { name: 'Reserved', value: statusCounts['reserved'] || 4, color: '#0ea5e9' },
    { name: 'Pending', value: statusCounts['pending'] || 2, color: '#94a3b8' },
    { name: 'Retrying', value: statusCounts['retrying'] || 2, color: '#f59e0b' },
    { name: 'DLQ / Failed', value: (statusCounts['dlq'] || 0) + (statusCounts['failed'] || 0) || 1, color: '#f43f5e' },
  ];

  // 3. Queue Depth Over Time (Area Chart)
  const queueDepthData = [
    { time: '12:00', orderQueue: 24, retryQueue: 3, dlq: 8 },
    { time: '12:15', orderQueue: 35, retryQueue: 5, dlq: 9 },
    { time: '12:30', orderQueue: 48, retryQueue: 6, dlq: 10 },
    { time: '12:45', orderQueue: 42, retryQueue: 4, dlq: 11 },
    { time: '13:00', orderQueue: 36, retryQueue: 5, dlq: 11 },
    { time: '13:15', orderQueue: kpis.queueDepth, retryQueue: kpis.retryQueueCount, dlq: kpis.dlqCount },
  ];

  // 4. Worker Throughput Performance (Bar Chart)
  const workerPerfData = workers.map((w) => ({
    name: w.name.split(' ')[0],
    processed: w.ordersProcessed,
    cpu: w.cpuUsage,
    successRate: w.successRate
  }));

  // 5. Inventory Consumption Trend
  const inventoryTrendData = [
    { hour: '08:00', QNT: 140, TPU: 60, HPD: 95 },
    { hour: '09:00', QNT: 180, TPU: 85, HPD: 130 },
    { hour: '10:00', QNT: 260, TPU: 120, HPD: 190 },
    { hour: '11:00', QNT: 310, TPU: 145, HPD: 240 },
    { hour: '12:00', QNT: 380, TPU: 175, HPD: 290 },
    { hour: '13:00', QNT: 420, TPU: 210, HPD: 340 },
  ];

  // 6. Failure vs Success (Stacked Bar)
  const failureVsSuccessData = [
    { batch: 'B-101', success: 480, retryRecovered: 16, unrecoverableDLQ: 4 },
    { batch: 'B-102', success: 520, retryRecovered: 22, unrecoverableDLQ: 3 },
    { batch: 'B-103', success: 610, retryRecovered: 18, unrecoverableDLQ: 6 },
    { batch: 'B-104', success: 580, retryRecovered: 24, unrecoverableDLQ: 5 },
    { batch: 'B-105', success: 690, retryRecovered: 31, unrecoverableDLQ: 7 },
  ];

  const chartTheme = {
    grid: theme === 'dark' ? '#1e293b' : '#e2e8f0',
    text: theme === 'dark' ? '#94a3b8' : '#64748b',
    tooltipBg: theme === 'dark' ? '#0f172a' : '#ffffff',
    tooltipBorder: theme === 'dark' ? '#334155' : '#cbd5e1',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            System Telemetry & Operational Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time Grafana-grade metrics across distributed ingest, RabbitMQ broker saturation, and worker SLA targets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tabs
            tabs={rangeTabs}
            activeTab={timeRange}
            onChange={(t) => setTimeRange(t as any)}
            size="sm"
          />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => toast.success('Exporting telemetry timeseries data')}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Grid of 6 Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Orders Per Minute (Line Chart) */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <span>Orders Ingestion vs Processing Velocity</span>
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Incoming order requests vs worker pipeline output</p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">
              ~{kpis.processingRate} req/s
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ordersPerMinuteData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                <XAxis dataKey="time" stroke={chartTheme.text} fontSize={11} />
                <YAxis stroke={chartTheme.text} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartTheme.tooltipBg,
                    borderColor: chartTheme.tooltipBorder,
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} name="Orders Ingested" />
                <Line type="monotone" dataKey="processed" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} name="Orders Processed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Order Status Distribution (Donut) */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-500" />
                <span>Order Status Distribution</span>
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Current state machine distribution of in-flight orders</p>
            </div>
            <span className="text-xs font-mono text-slate-400 font-semibold">
              {orders.length} in-memory
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartTheme.tooltipBg,
                    borderColor: chartTheme.tooltipBorder,
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 3: Queue Size Over Time (Area Chart) */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-pink-500" />
                <span>RabbitMQ Queue Depth Over Time</span>
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Incoming message backlog vs retry and dead-letter count</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={queueDepthData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                <XAxis dataKey="time" stroke={chartTheme.text} fontSize={11} />
                <YAxis stroke={chartTheme.text} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartTheme.tooltipBg,
                    borderColor: chartTheme.tooltipBorder,
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="orderQueue" stroke="#ec4899" fill="#ec4899" fillOpacity={0.25} name="Order Queue" />
                <Area type="monotone" dataKey="retryQueue" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} name="Retry Queue" />
                <Area type="monotone" dataKey="dlq" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.25} name="Dead Letter Queue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 4: Worker Performance Comparison (Bar Chart) */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-500" />
                <span>Worker Throughput & Success Rate</span>
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Per-pod cumulative processed orders and core utilization</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workerPerfData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                <XAxis dataKey="name" stroke={chartTheme.text} fontSize={11} />
                <YAxis stroke={chartTheme.text} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartTheme.tooltipBg,
                    borderColor: chartTheme.tooltipBorder,
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Bar dataKey="processed" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Orders Processed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 5: Inventory Consumption Over Time (Line Chart) */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                <span>Inventory SKU Depletion Trend</span>
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Top-selling hardware products reserved over time</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inventoryTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                <XAxis dataKey="hour" stroke={chartTheme.text} fontSize={11} />
                <YAxis stroke={chartTheme.text} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartTheme.tooltipBg,
                    borderColor: chartTheme.tooltipBorder,
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="QNT" stroke="#6366f1" strokeWidth={2} name="QNT-EDG-X1" />
                <Line type="monotone" dataKey="TPU" stroke="#f59e0b" strokeWidth={2} name="ACN-TPU-400" />
                <Line type="monotone" dataKey="HPD" stroke="#10b981" strokeWidth={2} name="HPD-NV5-8TB" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 6: Failure vs Success (Stacked Bar) */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                <span>Fulfillment Resolution Breakdown</span>
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Direct completions vs retry recoveries vs DLQ routing</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={failureVsSuccessData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                <XAxis dataKey="batch" stroke={chartTheme.text} fontSize={11} />
                <YAxis stroke={chartTheme.text} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartTheme.tooltipBg,
                    borderColor: chartTheme.tooltipBorder,
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Bar dataKey="success" stackId="a" fill="#10b981" name="Clean Success" />
                <Bar dataKey="retryRecovered" stackId="a" fill="#f59e0b" name="Recovered on Retry" />
                <Bar dataKey="unrecoverableDLQ" stackId="a" fill="#f43f5e" name="DLQ Terminated" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
