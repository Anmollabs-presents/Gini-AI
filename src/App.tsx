import React, { useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ChatWidget } from './components/ChatWidget';
import { LockScreen } from './components/LockScreen';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { User, Palette } from 'lucide-react';

function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  
  const themes = [
    { name: 'blue', color: '#3b82f6', label: 'Blue' },
    { name: 'royal', color: '#ffffff', label: 'Royal Black' },
    { name: 'orange', color: '#f97316', label: 'Orange' },
    { name: 'yellow', color: '#eab308', label: 'Yellow' }
  ];

  const setTheme = (themeName: string) => {
    document.documentElement.setAttribute('data-theme', themeName);
    try { localStorage.setItem('gini-theme', themeName); } catch {}
    setIsOpen(false);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gini-theme');
      if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
      } else {
        document.documentElement.setAttribute('data-theme', 'royal');
        localStorage.setItem('gini-theme', 'royal');
      }
    } catch {}
  }, []);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-[var(--glass)] transition-colors text-[var(--fg-2)] hover:text-[var(--fg)]"
        aria-label="Change Theme"
      >
        <Palette size={18} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 p-2 bg-[var(--bg-2)] border border-[var(--glass-border)] rounded-xl shadow-xl flex gap-2 z-[600]"
          >
            {themes.map(t => (
              <button
                key={t.name}
                onClick={() => setTheme(t.name)}
                className="w-6 h-6 rounded-full border border-[var(--glass-strong)] hover:scale-110 transition-transform"
                style={{ backgroundColor: t.color, boxShadow: `0 0 10px ${t.color}40` }}
                title={t.label}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let mouse = { x: -9999, y: -9999 };
    let targetMouse = { x: -9999, y: -9999 };
    let dots: any[] = [];
    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(dpr, dpr);
      buildDots();
    };

    const buildDots = () => {
      dots = [];
      const gap = 36;
      const cols = Math.ceil(w / gap) + 1;
      const rows = Math.ceil(h / gap) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({
            x: c * gap,
            y: r * gap,
            baseOpacity: Math.random() * 0.15 + 0.05,
            r: Math.random() * 1.2 + 0.5,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.4 + 0.2,
          });
        }
      }
    };

    const animate = (t: number) => {
      t /= 1000;
      ctx.clearRect(0, 0, w, h);

      if (targetMouse.x !== -9999) {
        if (mouse.x === -9999) {
          mouse.x = targetMouse.x;
          mouse.y = targetMouse.y;
        } else {
          mouse.x += (targetMouse.x - mouse.x) * 0.15;
          mouse.y += (targetMouse.y - mouse.y) * 0.15;
        }
      }

      const computedStyle = getComputedStyle(document.documentElement);
      const brandColor = computedStyle.getPropertyValue('--violet').trim();
      let rHex=129, gHex=140, bHex=248; 
      if (brandColor.startsWith('#') && brandColor.length >= 7) {
        rHex = parseInt(brandColor.slice(1, 3), 16);
        gHex = parseInt(brandColor.slice(3, 5), 16);
        bHex = parseInt(brandColor.slice(5, 7), 16);
      } else if (brandColor.startsWith('rgb')) {
         // rough fallback
         const match = brandColor.match(/\d+/g);
         if (match) {
            rHex = parseInt(match[0]); gHex = parseInt(match[1]); bHex = parseInt(match[2]);
         }
      }

      for (const dot of dots) {
        const dx = dot.x - mouse.x;
        const dy = dot.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = Math.max(0, 1 - dist / 250);

        const pulse = Math.sin(t * dot.speed + dot.phase) * 0.5 + 0.5;
        const opacity = dot.baseOpacity * pulse + (proximity * 0.8);

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r + proximity * 3, 0, Math.PI * 2);

        if (proximity > 0.05) {
           ctx.fillStyle = `rgba(${rHex}, ${gHex}, ${bHex}, ${Math.min(opacity, 1)})`;
           ctx.shadowBlur = proximity * 20;
           ctx.shadowColor = `rgba(${rHex}, ${gHex}, ${bHex}, ${proximity})`;
        } else {
           ctx.fillStyle = `rgba(${rHex}, ${gHex}, ${bHex}, ${Math.min(opacity * 0.2, 0.15)})`;
           ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
      targetMouse.x = e.clientX;
      targetMouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      targetMouse.x = -9999;
      targetMouse.y = -9999;
    });

    resize();
    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-80 z-0" />;
}

function NavBar() {
  const { user, signIn, logOut } = useAuth();
  
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-[500] p-6 transition-all duration-400 ease-out backdrop-blur-xl bg-black/40 border-b border-[var(--glass-border)]"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-2 text-lg font-bold tracking-tight text-brand-gradient hover:opacity-75 transition-opacity">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke="url(#g1)" strokeWidth="1.5"/>
              <circle cx="11" cy="11" r="4" fill="url(#g1)"/>
              <defs>
                <linearGradient id="g1" x1="1" y1="1" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#818CF8"/>
                  <stop offset="1" stopColor="#A78BFA"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="flex flex-col items-start leading-[1.1]">
               GINI AI
               <span className="text-[9px] uppercase tracking-widest text-[var(--fg-3)]">by Anmollabs</span>
            </span>
          </a>
          <ThemeSwitcher />
        </div>
        
        <div className="hidden md:flex items-center gap-8 ml-auto">
          {['Features', 'Model', 'About'].map(t => (
             <a key={t} href={`#${t.toLowerCase()}`} className="text-sm font-medium text-[var(--fg-2)] hover:text-[var(--fg)] transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-px after:bg-[var(--brand-gradient)] hover:after:w-full after:transition-all">
              {t}
             </a>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          {!user ? (
            <button 
              onClick={signIn}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[var(--glass)] border border-[var(--glass-strong)] rounded-full text-sm font-medium transition-all hover:bg-[var(--glass-hover)] hover:border-[var(--violet)] hover:shadow-[0_0_0_4px_var(--brand-glow-sm)]"
            >
              Sign In
              <User size={14} />
            </button>
          ) : (
            <button 
              onClick={logOut}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[var(--glass)] border border-[var(--violet)] rounded-full text-sm font-medium transition-all hover:bg-[var(--glass-hover)] hover:border-[var(--purple)] hover:shadow-[0_0_0_4px_var(--brand-glow-sm)]"
            >
              <span className="max-w-[100px] truncate">{user.displayName || 'Signed In'}</span>
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('gini_unlocked') === 'true';
    }
    return false;
  });
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Clear legacy localStorage lock so it requires password again
  useEffect(() => {
    localStorage.removeItem('gini_unlocked');
  }, []);

  return (
    <ErrorBoundary>
      <div className="grain" />
      <GridCanvas />

      {!isUnlocked ? (
        <LockScreen onUnlock={() => {
          try { sessionStorage.setItem('gini_unlocked', 'true'); } catch {}
          setIsUnlocked(true);
        }} />
      ) : (
        <AuthProvider>
          <div className="flex flex-col min-h-[100dvh] relative">
            <AnimatePresence>
              {!isChatOpen && <NavBar />}
            </AnimatePresence>

            <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden z-10 pt-20">
              
              {!isChatOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="flex flex-col items-center justify-center gap-10"
                >
                  <button 
                     onClick={() => setIsChatOpen(true)} 
                     className="relative group outline-none border-none animate-orb-float"
                     aria-label="Talk to GINI"
                  >
                     <div className="orb-button" />
                  </button>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-[var(--fg-3)] font-semibold tracking-[0.25em] uppercase text-xs sm:text-sm">
                      Talk to GINI
                    </p>
                    <div className="w-8 h-px bg-[var(--glass-border)]" />
                  </div>
                </motion.div>
              )}
            </main>

            <ChatWidget isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
          </div>
        </AuthProvider>
      )}
    </ErrorBoundary>
  );
}
