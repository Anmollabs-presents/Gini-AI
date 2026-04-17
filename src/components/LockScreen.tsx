import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Fallback to "gini-private" if not set in env
    const correctKey = (import.meta as any).env.VITE_SITE_PASSKEY || "gini-private";
    
    if (passkey === correctKey) {
      sessionStorage.setItem('gini_unlocked', 'true');
      sessionStorage.setItem('gini_passkey', passkey);
      localStorage.removeItem('gini_unlocked');
      onUnlock();
    } else {
      setError(true);
      setPasskey('');
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md relative"
      >
        <motion.div 
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}} 
          transition={{ duration: 0.4 }}
          className="glass p-8 md:p-10 rounded-[32px] border border-[var(--glass-strong)] shadow-[0_24px_80px_rgba(0,0,0,0.6)] flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* gradient overlay */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--violet)] to-transparent opacity-50" />
          
          <div className="w-16 h-16 rounded-2xl bg-[var(--glass)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--violet)] mb-6 shadow-[0_0_20px_var(--brand-glow-sm)]">
            <ShieldCheck size={32} />
          </div>
          
          <h2 className="text-2xl font-bold text-[var(--fg)] mb-2 tracking-tight">Access Restricted</h2>
          <p className="text-sm text-[var(--fg-2)] mb-8">This environment is extremely private. Please enter your passkey to continue.</p>

          <form onSubmit={handleSubmit} className="w-full relative">
            <div className="relative flex items-center">
              <div className="absolute left-4 text-[var(--fg-3)]">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter Passkey"
                className="w-full bg-[var(--bg-3)] border border-[var(--glass-strong)] rounded-xl py-3.5 pl-12 pr-12 text-[var(--fg)] outline-none focus:border-[var(--violet)] focus:ring-1 focus:ring-[var(--violet)] transition-all placeholder:text-[var(--fg-3)]"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!passkey.trim()}
                className="absolute right-2 w-9 h-9 rounded-lg bg-[var(--brand-gradient)] flex items-center justify-center text-white disabled:opacity-50 transition-transform hover:scale-105 active:scale-95 shadow-[0_2px_8px_var(--brand-glow-sm)]"
              >
                <ArrowRight size={18} />
              </button>
            </div>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -bottom-6 left-0 right-0 text-xs text-[var(--red)] text-center font-medium">
                Incorrect passkey. Please try again.
              </motion.p>
            )}
          </form>
          
        </motion.div>
      </motion.div>
    </div>
  );
}
