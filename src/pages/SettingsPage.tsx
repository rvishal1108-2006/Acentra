import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Settings, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Sliders, 
  AlertTriangle, 
  Radio, 
  Send, 
  RotateCcw, 
  ShieldCheck, 
  Database,
  CheckCircle2
} from 'lucide-react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

export function SettingsPage() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const simulatedLatencyMs = useStore((s) => s.simulatedLatencyMs);
  const setSimulatedLatency = useStore((s) => s.setSimulatedLatency);
  const chaosMode = useStore((s) => s.chaosMode);
  const toggleChaosMode = useStore((s) => s.toggleChaosMode);
  const audioEnabled = useStore((s) => s.audioEnabled);
  const toggleAudio = useStore((s) => s.toggleAudio);
  const simulationSpeed = useStore((s) => s.simulationSpeed);
  const setSimulationSpeed = useStore((s) => s.setSimulationSpeed);
  const addAuditLog = useStore((s) => s.addAuditLog);
  const currentUser = useStore((s) => s.currentUser);

  const [webhookUrl, setWebhookUrl] = useState('https://events.internal.acentra.net/v1/orders/webhook');
  const [apiKey, setApiKey] = useState('ak_live_99214_892b_sec441');

  const handleTestWebhook = () => {
    toast.success('Simulated webhook payload delivered with HTTP 200 OK (22ms)');
    addAuditLog({
      user: currentUser,
      action: 'TEST_WEBHOOK_PING',
      module: 'System',
      details: `Dispatched test ping to ${webhookUrl}`,
      result: 'success',
      ip: '127.0.0.1'
    });
  };

  const handleFlushCache = () => {
    toast.info('In-memory simulation state reset to initial factory baseline');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          System & Simulation Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure runtime latency simulations, theme preferences, chaos injection tolerances, and webhook listeners.
        </p>
      </div>

      {/* Theme Preference */}
      <Card className="p-6 space-y-4">
        <CardTitle className="text-sm">Appearance & Visual Theme</CardTitle>
        <p className="text-xs text-slate-400">
          Select between deep charcoal glassmorphic dark mode or crisp clean high-contrast light mode.
        </p>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
              theme === 'dark'
                ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-slate-900 text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-xs">Deep Charcoal Dark</div>
              <div className="text-[11px] text-slate-400">Neon cyan, emerald & indigo accents</div>
            </div>
          </div>

          <div
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
              theme === 'light'
                ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-slate-100 text-amber-500">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-xs">High-Contrast Light</div>
              <div className="text-[11px] text-slate-400">White surfaces with soft slate shadows</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Real-time Simulator Parameters */}
      <Card className="p-6 space-y-6">
        <CardTitle className="text-sm">Real-Time Simulation Controls</CardTitle>

        <div className="space-y-4 text-xs">
          {/* Latency slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Simulated WebSocket & API Gateway Latency</span>
              <span className="font-mono text-indigo-500 font-bold">{simulatedLatencyMs} ms</span>
            </div>
            <input
              type="range"
              min={5}
              max={350}
              step={5}
              value={simulatedLatencyMs}
              onChange={(e) => setSimulatedLatency(parseInt(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>5ms (Fiber Edge)</span>
              <span>150ms (Transatlantic)</span>
              <span>350ms (Satellite Surge)</span>
            </div>
          </div>

          {/* Speed Multiplier */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Event Loop Processing Velocity
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setSimulationSpeed(spd)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    simulationSpeed === spd
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {spd}x Multiplier
                </button>
              ))}
            </div>
          </div>

          {/* Chaos Toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Synthetic Chaos & Fault Injection</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Forces 15% transient network timeouts, inventory hold expirations, and DLQ overflows.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleChaosMode}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                chaosMode
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {chaosMode ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Audio toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-500" />
                <span>Interactive Micro Audio Cues</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Play subtle ambient clicks and alert sounds when orders and DLQ events trigger.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleAudio}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                audioEnabled
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {audioEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </Card>

      {/* Webhook & API Gateway Config */}
      <Card className="p-6 space-y-4">
        <CardTitle className="text-sm">Webhook Destination</CardTitle>
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Production Webhook Listener URL
            </label>
            <Input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              API Signing Key
            </label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Send className="w-3.5 h-3.5" />}
              onClick={handleTestWebhook}
            >
              Send Test Ping
            </Button>

            <Button
              variant="danger"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleFlushCache}
            >
              Reset Memory Baseline
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
