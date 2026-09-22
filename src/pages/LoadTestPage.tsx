import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Zap, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Activity, 
  AlertTriangle, 
  Gauge, 
  Sliders, 
  Layers, 
  Server, 
  Flame,
  CheckCircle2
} from 'lucide-react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Sparkline } from '../components/ui/Sparkline';
import { formatNumber } from '../utils';
import { toast } from 'sonner';
import { backendApi } from '../services/backendApi';

export function LoadTestPage() {
  const loadTest = useStore((s) => s.loadTest);
  const startLoadTest = useStore((s) => s.startLoadTest);
  const pauseLoadTest = useStore((s) => s.pauseLoadTest);
  const resumeLoadTest = useStore((s) => s.resumeLoadTest);
  const stopLoadTest = useStore((s) => s.stopLoadTest);
  const resetLoadTest = useStore((s) => s.resetLoadTest);
  const chaosMode = useStore((s) => s.chaosMode);
  const toggleChaosMode = useStore((s) => s.toggleChaosMode);
  const isBackendConnected = useStore((s) => s.isBackendConnected);

  const [targetRps, setTargetRps] = useState<number>(loadTest.targetRps || 60);
  const [totalOrders, setTotalOrders] = useState<number>(loadTest.totalOrders || 2000);
  const [burstMode, setBurstMode] = useState<boolean>(loadTest.burstMode || false);

  const handleStart = () => {
    startLoadTest({
      targetRps,
      totalOrders,
      burstMode
    });

    if (isBackendConnected) {
      backendApi.startLoadTest(Math.min(totalOrders, 50), targetRps).then((res) => {
        if (res) {
          toast.success(`Spring Boot Backend load burst initiated!`, {
            description: `RabbitMQ workers dispatched ${res.targetOrders || 50} concurrent orders.`
          });
        }
      });
    }

    toast.success(`Load test fired! Targeting ${targetRps} req/s`);
  };

  const handlePauseResume = () => {
    if (loadTest.isPaused) {
      resumeLoadTest();
      toast.info('Load test resumed');
    } else {
      pauseLoadTest();
      toast.info('Load test paused');
    }
  };

  const handleStop = () => {
    stopLoadTest();
    toast.warning('Load test stopped');
  };

  const handleReset = () => {
    resetLoadTest();
    toast.info('Load test metrics reset');
  };

  // Progress percentage
  const progressPct = totalOrders > 0 
    ? Math.min(100, Math.round((loadTest.generatedCount / totalOrders) * 100))
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            <span>High-Scale Load Generation & Stress Console</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Simulate thousands of concurrent orders, stress RabbitMQ consumer queues, and observe worker autoscaling.
          </p>
        </div>

        {/* Live status badge */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${
            loadTest.isRunning 
              ? 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30 animate-pulse'
              : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
          }`}>
            <span className={`w-2 h-2 rounded-full ${loadTest.isRunning ? 'bg-yellow-400' : 'bg-slate-400'}`} />
            {loadTest.isRunning ? (loadTest.isPaused ? 'TEST PAUSED' : 'BURST GENERATING') : 'CONSOLE IDLE'}
          </span>
        </div>
      </div>

      {/* Main Top Grid: Speedometer Gauge & Live Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gauge Visualizer Card */}
        <Card className="lg:col-span-5 p-6 flex flex-col items-center justify-center text-center space-y-4 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-yellow-500/20">
          <div className="relative w-48 h-32 flex items-end justify-center overflow-hidden">
            {/* Speedometer Arc SVG */}
            <svg viewBox="0 0 160 90" className="w-full h-full">
              <path
                d="M 20 80 A 60 60 0 0 1 140 80"
                fill="none"
                stroke="currentColor"
                strokeWidth="14"
                className="text-slate-800"
              />
              <path
                d="M 20 80 A 60 60 0 0 1 140 80"
                fill="none"
                stroke="url(#speed-gradient)"
                strokeWidth="14"
                strokeDasharray="188.5"
                strokeDashoffset={188.5 - (188.5 * (loadTest.currentThroughput / 250))}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              <defs>
                <linearGradient id="speed-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-0 text-center">
              <div className="text-3xl font-extrabold font-mono text-white">
                {loadTest.currentThroughput}
              </div>
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                Requests / Sec
              </div>
            </div>
          </div>

          <div className="w-full space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Test Completion</span>
              <span>{progressPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-yellow-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center gap-2 pt-2">
            {!loadTest.isRunning ? (
              <Button
                variant="primary"
                size="md"
                leftIcon={<Play className="w-4 h-4 fill-white" />}
                onClick={handleStart}
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold border-yellow-400"
              >
                Launch Load Test
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={loadTest.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  onClick={handlePauseResume}
                >
                  {loadTest.isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Square className="w-3.5 h-3.5 fill-white" />}
                  onClick={handleStop}
                >
                  Stop
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </Card>

        {/* Live Counters Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          <Card className="p-4 space-y-1">
            <div className="text-xs text-slate-400 font-medium">Orders Generated</div>
            <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              {formatNumber(loadTest.generatedCount)}
            </div>
            <div className="text-[11px] text-slate-400">Target volume: {formatNumber(totalOrders)}</div>
          </Card>

          <Card className="p-4 space-y-1">
            <div className="text-xs text-emerald-500 font-medium">Pipeline Processed</div>
            <div className="text-3xl font-extrabold font-mono text-emerald-500">
              {formatNumber(loadTest.processedCount)}
            </div>
            <div className="text-[11px] text-slate-400">Acknowledged by workers</div>
          </Card>

          <Card className="p-4 space-y-1">
            <div className="text-xs text-rose-500 font-medium">Failed / Dropped</div>
            <div className="text-3xl font-extrabold font-mono text-rose-500">
              {formatNumber(loadTest.failedCount)}
            </div>
            <div className="text-[11px] text-slate-400">Retries & DLQ overflows</div>
          </Card>

          <Card className="p-4 space-y-1">
            <div className="text-xs text-cyan-500 font-medium">Mean Response Latency</div>
            <div className="text-3xl font-extrabold font-mono text-cyan-500">
              {loadTest.latencySamples[loadTest.latencySamples.length - 1] || 24}ms
            </div>
            <Sparkline data={loadTest.latencySamples} color="sky" width={100} height={20} />
          </Card>
        </div>
      </div>

      {/* Configuration Controls Card */}
      <Card className="p-6 space-y-6">
        <CardTitle className="text-base flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-500" />
          <span>Stress Parameter Tuning</span>
        </CardTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* RPS Slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Target Throughput</span>
              <span className="font-mono text-indigo-500 font-bold">{targetRps} RPS</span>
            </div>
            <input
              type="range"
              min={10}
              max={250}
              step={5}
              value={targetRps}
              onChange={(e) => setTargetRps(parseInt(e.target.value))}
              disabled={loadTest.isRunning}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>10 RPS</span>
              <span>125 RPS</span>
              <span>250 RPS</span>
            </div>
          </div>

          {/* Orders Volume Slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Total Orders to Generate</span>
              <span className="font-mono text-indigo-500 font-bold">{formatNumber(totalOrders)}</span>
            </div>
            <input
              type="range"
              min={500}
              max={10000}
              step={500}
              value={totalOrders}
              onChange={(e) => setTotalOrders(parseInt(e.target.value))}
              disabled={loadTest.isRunning}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>500</span>
              <span>5,000</span>
              <span>10,000</span>
            </div>
          </div>

          {/* Burst & Chaos Toggles */}
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-yellow-500" /> Burst Mode
                </span>
                <span className="text-[10px] text-slate-400">Double traffic bursts at pseudo-random intervals</span>
              </div>
              <input
                type="checkbox"
                checked={burstMode}
                onChange={(e) => setBurstMode(e.target.checked)}
                className="rounded accent-yellow-500 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Chaos Fault Injection
                </span>
                <span className="text-[10px] text-slate-400">Inject 15% transient errors & worker delay</span>
              </div>
              <input
                type="checkbox"
                checked={chaosMode}
                onChange={toggleChaosMode}
                className="rounded accent-rose-500 w-4 h-4"
              />
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
}
