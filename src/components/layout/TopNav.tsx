import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  Radio, 
  Zap, 
  ShieldAlert, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ChevronDown,
  LogOut,
  ExternalLink,
  Layers
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../utils';
import { Link } from 'react-router-dom';

export function TopNav() {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const currentUser = useStore((s) => s.currentUser);
  const switchUserRole = useStore((s) => s.switchUserRole);
  const isSimulationActive = useStore((s) => s.isSimulationActive);
  const toggleSimulation = useStore((s) => s.toggleSimulation);
  const simulationSpeed = useStore((s) => s.simulationSpeed);
  const setSimulationSpeed = useStore((s) => s.setSimulationSpeed);
  const chaosMode = useStore((s) => s.chaosMode);
  const toggleChaosMode = useStore((s) => s.toggleChaosMode);
  const simulatedLatencyMs = useStore((s) => s.simulatedLatencyMs);
  const setCommandPaletteOpen = useStore((s) => s.setCommandPaletteOpen);
  const eventFeed = useStore((s) => s.eventFeed);
  const audioEnabled = useStore((s) => s.audioEnabled);
  const toggleAudio = useStore((s) => s.toggleAudio);
  const isBackendConnected = useStore((s) => s.isBackendConnected);

  const [timeStr, setTimeStr] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-nav px-4 lg:px-6 h-16 flex items-center justify-between transition-colors">
      {/* Left: Brand / Live connection indicator */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">ACENTRA</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-500 font-bold border border-indigo-500/20">
                PULSE
              </span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:block font-medium">Enterprise Operations Engine</span>
          </div>
        </Link>

        {/* Live WebSocket Status Pill */}
        {isBackendConnected ? (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              SPRING BOOT 3 :8081
            </span>
            <span className="text-emerald-300 dark:text-emerald-700">•</span>
            <span className="font-mono text-[10px] text-emerald-600/90 dark:text-emerald-400/90">
              RABBITMQ + STOMP
            </span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="font-mono text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
              ENGINE SIMULATION
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
              {simulatedLatencyMs}ms
            </span>
          </div>
        )}

        {/* Chaos Active Alert */}
        {chaosMode && (
          <button
            type="button"
            onClick={toggleChaosMode}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[11px] font-bold animate-pulse"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>CHAOS ACTIVE</span>
          </button>
        )}
      </div>

      {/* Center: Global Search Bar Trigger */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-800 transition-all shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search orders, workers, inventory...</span>
          </div>
          <kbd className="px-1.5 py-0.5 font-mono text-[10px] text-slate-400 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Clock */}
        <div className="hidden xl:flex items-center font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
          <Radio className="w-3.5 h-3.5 text-cyan-500 mr-1.5 animate-pulse" />
          <span>{timeStr || '00:00:00'} UTC</span>
        </div>

        {/* Engine Speed & Pause */}
        <div className="hidden lg:flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/70 p-0.5 border border-slate-200 dark:border-slate-700/60">
          <button
            type="button"
            onClick={toggleSimulation}
            title={isSimulationActive ? 'Pause real-time stream' : 'Resume real-time stream'}
            className={cn(
              'p-1.5 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1',
              isSimulationActive
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-amber-500 text-white shadow-sm'
            )}
          >
            {isSimulationActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <div className="flex items-center px-1">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setSimulationSpeed(spd)}
                className={cn(
                  'px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-colors',
                  simulationSpeed === spd
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                )}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Audio Toggle */}
        <button
          type="button"
          onClick={toggleAudio}
          title={audioEnabled ? 'Mute micro sound effects' : 'Enable ambient micro sound effects'}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {audioEnabled ? <Volume2 className="w-4 h-4 text-indigo-500" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-dropdown p-4 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Live Activity Feed</span>
                <span className="text-[10px] text-slate-400 font-mono">{eventFeed.length} Events</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2 py-2">
                {eventFeed.slice(0, 5).map((evt) => (
                  <div key={evt.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{evt.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{evt.description}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/audit"
                onClick={() => setNotificationsOpen(false)}
                className="block text-center text-xs font-semibold text-indigo-500 hover:text-indigo-400 pt-2 border-t border-slate-200 dark:border-slate-800"
              >
                View Full Audit & Event Logs →
              </Link>
            </div>
          )}
        </div>

        {/* Dark/Light Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* User Role Switcher & Avatar */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-300 dark:ring-slate-700"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-900 dark:text-white leading-none">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400 capitalize mt-0.5">{currentUser.roleType}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-dropdown p-2 border border-slate-200 dark:border-slate-800 shadow-2xl z-50">
              <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 mb-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                <div className="mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-500 font-semibold inline-block">
                  Role: {currentUser.role}
                </div>
              </div>

              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">
                Switch Persona
              </div>

              <button
                type="button"
                onClick={() => {
                  switchUserRole('operator');
                  setUserMenuOpen(false);
                }}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-xs rounded-xl transition-colors flex items-center justify-between',
                  currentUser.roleType === 'operator' ? 'bg-indigo-500/10 text-indigo-500 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <span>Staff SRE Operator</span>
                {currentUser.roleType === 'operator' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  switchUserRole('customer');
                  setUserMenuOpen(false);
                }}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-xs rounded-xl transition-colors flex items-center justify-between',
                  currentUser.roleType === 'customer' ? 'bg-indigo-500/10 text-indigo-500 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <span>Enterprise Customer</span>
                {currentUser.roleType === 'customer' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  switchUserRole('admin');
                  setUserMenuOpen(false);
                }}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-xs rounded-xl transition-colors flex items-center justify-between',
                  currentUser.roleType === 'admin' ? 'bg-indigo-500/10 text-indigo-500 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <span>System Superadmin</span>
                {currentUser.roleType === 'admin' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
              </button>

              <div className="border-t border-slate-200 dark:border-slate-800 mt-1 pt-1">
                <Link
                  to="/login"
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Switch Account / Logout</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
