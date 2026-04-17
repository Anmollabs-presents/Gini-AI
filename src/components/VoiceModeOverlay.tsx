import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AIAvatar } from './AIAvatar';
import { cn } from '@/lib/utils';

type VoiceState = 'passive' | 'active' | 'processing' | 'speaking';

interface VoiceModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  state: VoiceState;
  transcript?: string;
}

export function VoiceModeOverlay({ isOpen, onClose, state, transcript }: VoiceModeOverlayProps) {
  const [displayText, setDisplayText] = useState('');

  // Handle transcript display with subtle animations
  useEffect(() => {
    if (transcript) {
      setDisplayText(transcript);
    } else if (state === 'passive') {
      setDisplayText('');
    }
  }, [transcript, state]);

  // Map functional states to orb states
  const orbState = state === 'passive' ? 'idle' : state === 'active' ? 'listening' : state;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background Atmosphere */}
          <div className="absolute inset-0 bg-[#020205]" />
          
          {/* Centered Anime Assistant Gini (Absolute focus) */}
          <div className="absolute inset-0 z-0">
             <AIAvatar state={state} mode="fullscreen" />
          </div>

          {/* Small Close Trigger (Minimalist) */}
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white/60 transition-all z-50 group"
          >
            <X size={16} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Minimalist Status Feedback (Anime UI style) */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-6 w-full max-w-sm px-8">
            <AnimatePresence mode="wait">
               {state === 'active' && displayText && (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-white font-medium text-center text-lg italic tracking-wide pb-4 line-clamp-2"
                 >
                    "{displayText}"
                 </motion.div>
               )}

               {state === 'processing' ? (
                 <motion.div 
                    key="thinking"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="flex flex-col items-center gap-2"
                 >
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                          className="w-1 h-1 bg-teal-400 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.6)]"
                        />
                      ))}
                    </div>
                 </motion.div>
               ) : (
                 <motion.div 
                    key="status-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    className="text-[10px] uppercase font-mono tracking-[0.6em] text-white/60 text-center"
                 >
                    {state === 'passive' ? 'Neural Link Standby' : 'Listening...'}
                 </motion.div>
               )}
            </AnimatePresence>

            {/* Prompt Hint */}
            {state === 'passive' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                className="text-[8px] uppercase font-mono tracking-widest text-teal-400/80"
              >
                Say "Gini" to activate uplink
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
