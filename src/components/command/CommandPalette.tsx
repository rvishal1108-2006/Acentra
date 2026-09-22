import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Clock, 
  Workflow, 
  Cpu, 
  BarChart3, 
  FileText, 
  Zap, 
  Settings, 
  User, 
  AlertTriangle, 
  SunMoon,
  ArrowRight,
  PlusCircle
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export function CommandPalette() {
  const isOpen = useStore((s) => s.commandPaletteOpen);
  const setIsOpen = useStore((s) => s.setCommandPaletteOpen);
  const orders = useStore((s) => s.orders);
  const inventory = useStore((s) => s.inventory);
  const workers = useStore((s) => s.workers);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const toggleChaosMode = useStore((s) => s.toggleChaosMode);
  const openOrderDrawer = useStore((s) => s.openOrderDrawer);

  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const handleSelectPage = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  const filteredOrders = orders
    .filter((o) => 
      o.id.toLowerCase().includes(query.toLowerCase()) || 
      o.customerName.toLowerCase().includes(query.toLowerCase()) ||
      o.productSku.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 4);

  const filteredProducts = inventory
    .filter((p) => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.sku.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 3);

  const pages = [
    { label: 'Live Operations Dashboard', path: '/', icon: <LayoutDashboard className="w-4 h-4 text-indigo-400" /> },
    { label: 'Order Processing Table', path: '/orders', icon: <ShoppingBag className="w-4 h-4 text-emerald-400" /> },
    { label: 'Real-Time Inventory', path: '/inventory', icon: <Package className="w-4 h-4 text-amber-400" /> },
    { label: 'Reservation Monitor', path: '/reservations', icon: <Clock className="w-4 h-4 text-sky-400" /> },
    { label: 'RabbitMQ Queue Visualizer', path: '/queues', icon: <Workflow className="w-4 h-4 text-pink-400" /> },
    { label: 'Worker Execution Nodes', path: '/workers', icon: <Cpu className="w-4 h-4 text-cyan-400" /> },
    { label: 'Telemetry & Analytics', path: '/analytics', icon: <BarChart3 className="w-4 h-4 text-purple-400" /> },
    { label: 'Enterprise Audit Logs', path: '/audit', icon: <FileText className="w-4 h-4 text-slate-400" /> },
    { label: 'Load Testing Console', path: '/loadtest', icon: <Zap className="w-4 h-4 text-yellow-400" /> },
    { label: 'Customer Self-Service Portal', path: '/portal', icon: <User className="w-4 h-4 text-teal-400" /> },
    { label: 'System Settings', path: '/settings', icon: <Settings className="w-4 h-4 text-blue-400" /> }
  ].filter((p) => p.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-24 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-10 overflow-hidden"
        >
          {/* Search Header */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
            <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders, workers, inventory SKUs, pages, or commands..."
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-2 space-y-4 text-xs">
            {/* Quick Actions */}
            <div>
              <div className="px-3 py-1.5 font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                Quick Actions
              </div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    toggleTheme();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <SunMoon className="w-4 h-4 text-amber-500" />
                    <span>Toggle Dark / Light Theme</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toggleChaosMode();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Toggle Chaos & Fault Injection Mode</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/portal');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <PlusCircle className="w-4 h-4 text-indigo-500" />
                    <span>Create New Order (Customer Portal)</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Pages */}
            {pages.length > 0 && (
              <div>
                <div className="px-3 py-1.5 font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                  Navigation Pages
                </div>
                <div className="space-y-0.5">
                  {pages.map((p) => (
                    <button
                      key={p.path}
                      type="button"
                      onClick={() => handleSelectPage(p.path)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        {p.icon}
                        <span className="font-medium">{p.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Orders */}
            {filteredOrders.length > 0 && (
              <div>
                <div className="px-3 py-1.5 font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                  Orders ({filteredOrders.length})
                </div>
                <div className="space-y-0.5">
                  {filteredOrders.map((ord) => (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => {
                        openOrderDrawer(ord);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-semibold text-indigo-500 dark:text-indigo-400">{ord.id}</span>
                        <span className="text-slate-500 truncate max-w-[200px]">{ord.customerName}</span>
                      </div>
                      <span className="capitalize px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 font-medium">
                        {ord.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Inventory */}
            {filteredProducts.length > 0 && (
              <div>
                <div className="px-3 py-1.5 font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                  Inventory SKUs ({filteredProducts.length})
                </div>
                <div className="space-y-0.5">
                  {filteredProducts.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleSelectPage('/inventory')}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-amber-500 font-semibold">{prod.sku}</span>
                        <span className="truncate max-w-[220px]">{prod.name}</span>
                      </div>
                      <span className="text-slate-400">{prod.available} avail</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono">K</kbd> anywhere</span>
            <span>Acentra Pulse Command Engine</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
