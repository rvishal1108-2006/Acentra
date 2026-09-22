import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  Cpu, 
  Radio, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

export function LoginPage() {
  const login = useStore((s) => s.login);
  const navigate = useNavigate();

  const [email, setEmail] = useState('schen@acentra.internal');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<'operator' | 'customer' | 'admin'>('operator');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, selectedRole);
    toast.success(`Welcome back! Authenticated as ${selectedRole.toUpperCase()}`);
    navigate(selectedRole === 'customer' ? '/portal' : '/');
  };

  const handleQuickPersona = (role: 'operator' | 'customer' | 'admin', mail: string) => {
    setSelectedRole(role);
    setEmail(mail);
    login(mail, role);
    toast.success(`Signed in as ${role.toUpperCase()}`);
    navigate(role === 'customer' ? '/portal' : '/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden bg-mesh-dark">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-2xl shadow-indigo-500/40 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Layers className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-3">
            ACENTRA PULSE
          </h1>
          <p className="text-xs text-slate-400">
            Enterprise High-Scale Order Processing & Live Operations Platform
          </p>
        </div>

        {/* Main Auth Card */}
        <Card className="p-6 space-y-6 bg-slate-900/80 border-slate-800 backdrop-blur-2xl shadow-2xl">
          {/* Quick Persona Picker */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Demo Personas
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPersona('operator', 'schen@acentra.internal')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedRole === 'operator'
                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400 font-bold'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">Staff SRE</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Operator</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPersona('customer', 'alex@nexis-cyber.com')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedRole === 'customer'
                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400 font-bold'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">Buyer</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Customer</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPersona('admin', 'erostova@acentra.internal')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedRole === 'admin'
                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400 font-bold'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">Superadmin</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Full Root</div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Corporate Identity (SSO / LDAP)
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Hardware Token / Master Secret
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <Button
              variant="glow"
              size="md"
              type="submit"
              className="w-full mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Operations Console
            </Button>
          </form>

          {/* SSO Integrations */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-2">
            <span className="text-[11px] text-slate-500">Supported Enterprise SSO:</span>
            <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-400">
              <span className="hover:text-white cursor-pointer">Okta Verified</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">SAML 2.0</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">Google Cloud IAM</span>
            </div>
          </div>
        </Card>

        {/* Bottom System Live Status */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Production East Cluster 99.99% Nominal</span>
        </div>
      </div>
    </div>
  );
}
