import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, serverTimestamp, setDoc, doc, getDocFromServer } from 'firebase/firestore';
import { getAIResponse } from '../services/ai';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

import { VoiceModeOverlay } from './VoiceModeOverlay';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: any;
}

// Voice Pipeline States
type VoiceState = 'passive' | 'active' | 'processing' | 'speaking';
import { AIAvatar } from './AIAvatar';

export function ChatWidget({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const { user, logOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  
  // Voice System States
  const [voiceState, setVoiceState] = useState<VoiceState>('passive');
  const voiceStateRef = useRef<VoiceState>('passive');
  
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const isAiSpeakingRef = useRef(false);
  
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const activeTranscriptRef = useRef(''); 
  const isSwitchingToActiveRef = useRef(false);
  const wakePhrases = [
    "gini", "jini", "genie", "ginny", "jinny", "jenny", "zini", "cini", 
    "zinc", "jinnniii", "zinnniii", "ginini", "gianni", "geni", "jini",
    "ginnie", "jinni", "jean", "jeanie", "gina", "vini", "sini",
    "जिनी", "जिन्नी", "जीनी", "जेनी"
  ];

  // Sync refs for async callbacks
  useEffect(() => { voiceStateRef.current = voiceState; }, [voiceState]);

  const resetSilenceTimer = (duration = 1500) => {
     if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
     silenceTimerRef.current = setTimeout(() => {
        if (voiceStateRef.current === 'active') {
           stopListening();
        }
     }, duration);
  };

  const startListening = () => {
    if (!recognitionRef.current || isAiSpeakingRef.current || !isOpen) return;
    if (isListening) return;
    
    try {
      // Toggle continuous based on state
      // Passive needs continuous to stay open for the wake word
      // Active works better without it to trigger onend when the user stops talking
      recognitionRef.current.continuous = voiceStateRef.current === 'passive';
      recognitionRef.current.start();
    } catch (e) {
      // Ignore rapid switching errors
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
       setVoiceState('passive');
       setTimeout(() => startListening(), 100);
    } else {
       stopListening();
    }
  }, [isOpen]);

  const handleWakePhraseDetected = () => {
     if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
     isSwitchingToActiveRef.current = true;
     setVoiceState('active');
     setInput('');
     activeTranscriptRef.current = '';
     
     if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
     }

     if (recognitionRef.current) {
        recognitionRef.current.abort();
     }
     
     // Restart with continuous=false for the actual command capture
     // This allows the browser to natively detect 'end of speech' more reliably
     setTimeout(() => {
        if (recognitionRef.current) {
           recognitionRef.current.continuous = false;
           startListening();
        }
     }, 100);
  };

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
       window.speechSynthesis.cancel();

       // Ensure voices are loaded
       if (window.speechSynthesis.getVoices().length === 0) {
         window.speechSynthesis.onvoiceschanged = () => {
           speak(text); // Retry speaking once voices are loaded
         };
         return; // Wait for voices to load
       }
       
       const utterance = new SpeechSynthesisUtterance(text);
       
       // Neural-like variability (Natural Pacing & Pitch)
       utterance.rate = 0.95 + (Math.random() * 0.1); // Dynamic pacing
       utterance.pitch = 1.05 + (Math.random() * 0.05); // Slight feminine lift
       
       // Handle micro-pauses by splitting long text if needed (internal browser handling is usually okay)
       
       const findVoice = () => {
          const availableVoices = window.speechSynthesis.getVoices();
          // Prioritize Hindi voices, then English
          const preferred = [
            'Google Hindi', 'hi-IN', 
            'Google US English Female', 'en-US-Neural', 'Microsoft Aria', 
            'Microsoft Zira', 'Samantha', 'Google US English'
          ];
          for (const name of preferred) {
            const found = availableVoices.find(v => v.name.includes(name) || v.lang.includes(name));
            if (found) return found;
          }
          return availableVoices.find(v => v.lang.startsWith('hi')) || availableVoices.find(v => v.lang.startsWith('en'));
       };

       const voice = findVoice();
       if (voice) utterance.voice = voice;

       utterance.onstart = () => {
         isAiSpeakingRef.current = true;
         setVoiceState('speaking');
         stopListening();
       };

       const endSpeaking = () => {
         isAiSpeakingRef.current = false;
         setVoiceState('passive');
         
         // PERMANENT LOOP: Immediately return to listening
         setTimeout(() => {
           if (!isAiSpeakingRef.current && voiceStateRef.current === 'passive') {
              console.log("Automatically returning to listening loop...");
              startListening();
           }
         }, 800);
       };

       utterance.onend = endSpeaking;
       utterance.onerror = (e) => {
         console.error('TTS Error:', e);
         endSpeaking();
       };

       window.speechSynthesis.speak(utterance);
    } else {
       setVoiceState('passive');
       startListening();
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'hi-IN,en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setVoiceError(null);
          console.log('Speech Recognition Started');
        };

        recognitionRef.current.onresult = (event: any) => {
          let fullTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
             fullTranscript += event.results[i][0].transcript;
          }
          
          const transcriptLower = fullTranscript.toLowerCase().trim();
          console.log('Transcript:', transcriptLower);

          if (voiceStateRef.current === 'passive') {
             // More aggressive wake detection
             const isMatch = wakePhrases.some(p => transcriptLower.includes(p));

             if (isMatch) {
                console.log('Wake word detected!');
                handleWakePhraseDetected();
             }
          } else if (voiceStateRef.current === 'active') {
             setInput(fullTranscript);
             activeTranscriptRef.current = fullTranscript;
             resetSilenceTimer(1800); // 1.8s of silence triggers processing
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          
          if (isSwitchingToActiveRef.current) {
             isSwitchingToActiveRef.current = false;
             startListening();
             return;
          }

          if (voiceStateRef.current === 'active') {
            const finalTranscript = activeTranscriptRef.current.trim();
            if (finalTranscript) {
               setVoiceState('processing');
               handleSend(undefined, finalTranscript);
               activeTranscriptRef.current = '';
               return; 
            } else {
               setVoiceState('passive');
            }
          }

          // Restart listening regardless of state if not processing
          if (!isAiSpeakingRef.current && voiceStateRef.current !== 'processing') {
             setTimeout(() => startListening(), 100);
          }
        };
        
        recognitionRef.current.onerror = (e: any) => {
          setIsListening(false);
          if (e.error === 'aborted' || e.error === 'no-speech') return;
          setVoiceError(`System Error: ${e.error}`);
        };
      }
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []); 

  // Test connection
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    if (!user) return;
    const path = `users/${user.uid}/messages`;
    const q = query(collection(db, path), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    }, (error) => {
      console.error('Firestore Error:', error);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSend = async (e?: React.FormEvent, overrideText?: string) => {
    const text = (overrideText || input).trim();
    if (!text) return;

    setVoiceState('processing');
    setInput('');
    
    const userMsgId = Date.now().toString();

    if (user) {
      const userMsgPath = `users/${user.uid}/messages`;
      try {
        await setDoc(doc(db, userMsgPath, userMsgId), {
          uid: user.uid,
          role: 'user',
          content: text,
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.error('Firestore Error:', err);
        return;
      }
    }

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: text });
      
      const aiResponseText = await getAIResponse(history);
      console.log('DEBUG: AI Response received:', aiResponseText);
      const aiMsgId = (Date.now() + 1).toString();
      
      console.log('DEBUG: Calling speak()...');
      speak(aiResponseText);

      if (user) {
        const userMsgPath = `users/${user.uid}/messages`;
        await setDoc(doc(db, userMsgPath, aiMsgId), {
          uid: user.uid,
          role: 'ai',
          content: aiResponseText,
          timestamp: serverTimestamp()
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (voiceStateRef.current === 'processing') {
         setTimeout(() => {
           if (voiceStateRef.current === 'processing') {
             setVoiceState('passive');
             startListening();
           }
         }, 1000);
      }
    }
  };

  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Main Chat Interface with Integrated Gini */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] bg-[var(--bg)] flex flex-col md:flex-row"
          >
            {/* Shared Header (Back to Start) */}
            <header className="absolute top-0 left-0 right-0 h-16 md:h-20 flex items-center justify-between px-6 z-[450] bg-gradient-to-b from-[var(--bg)] via-[var(--bg)]/80 to-transparent">
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 -ml-2 rounded-full hover:bg-white/5 text-[var(--fg-2)] hover:text-[var(--fg)] transition-all"
                title="Back to Start"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold tracking-tight text-brand-gradient">Gini.Portal</span>
                <span className="text-[9px] uppercase tracking-widest text-[var(--fg-3)] font-mono">
                  {voiceState === 'passive' ? 'System Standby' : 'Neural Link Active'}
                </span>
              </div>
              <button 
                onClick={logOut}
                className="p-2 -mr-2 text-[var(--fg-3)] hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              </button>
            </header>

            {/* Chat Content */}
            <div className="flex-1 flex flex-col h-full bg-black/40 relative overflow-hidden backdrop-blur-sm">
              {/* Mobile Backdrop Avatar */}
              <div className="md:hidden absolute inset-0 z-0 opacity-[0.12] pointer-events-none scale-125 translate-y-20">
                 <AIAvatar state={voiceState} mode="chat" />
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 pt-24 pb-32 relative z-10 scrollbar-hide">
                {messages.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center px-8"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[var(--glass)] border border-[var(--glass-border)] flex items-center justify-center mb-6">
                       <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                    </div>
                    <h2 className="text-xl font-medium text-[var(--fg)] mb-2">Initialize Neural Link</h2>
                    <p className="text-sm text-[var(--fg-3)] max-w-xs leading-relaxed">
                      "I'm here, under the cherry blossoms. Say 'Gini' or type a message to begin our session."
                    </p>
                  </motion.div>
                )}
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed",
                      m.role === 'user' 
                        ? "ml-auto bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/5 text-[var(--fg)] rounded-tr-none shadow-lg" 
                        : "mr-auto bg-[var(--glass)] border border-[var(--glass-border)] text-[var(--fg-2)] rounded-tl-none shadow-sm"
                    )}
                  >
                    {m.content}
                  </motion.div>
                ))}
              </div>

              {/* Input Area */}
              <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/90 to-transparent z-20">
                <div className="max-w-4xl mx-auto flex items-center gap-4 bg-[var(--bg-3)]/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-3 shadow-2xl">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Message your assistant..."
                    className="flex-1 bg-transparent border-none outline-none text-[var(--fg)] px-4 py-2 placeholder:text-[var(--fg-3)] text-sm"
                  />
                  <div className="flex items-center gap-1.5 px-2">
                    <button 
                      onClick={() => setIsFullscreen(true)}
                      className="p-2.5 rounded-2xl bg-white/5 text-[var(--fg-3)] hover:text-pink-400 hover:bg-pink-400/10 transition-all active:scale-90"
                      title="Voice Mode"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                    </button>
                    <button 
                      onClick={() => handleSend()}
                      disabled={!input.trim()}
                      className="p-2.5 rounded-2xl bg-white text-black hover:bg-white/90 disabled:opacity-30 transition-all active:scale-90"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 14-7-8 7 8 7-14-7Z"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Assistant Sidebar */}
            <div className="hidden md:flex w-[450px] border-l border-white/5 bg-[var(--bg-2)] relative overflow-hidden group shadow-2xl">
               <div className="absolute inset-0 opacity-[0.25] group-hover:opacity-[0.35] transition-opacity duration-1000">
                  <AIAvatar state={voiceState} mode="chat" />
               </div>
               <div className="relative z-10 w-full h-full p-10 flex flex-col justify-end bg-gradient-to-t from-[var(--bg-2)] via-[var(--bg-2)]/40 to-transparent">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-[var(--fg)] tracking-tight">Gini Prototype</h3>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", voiceState === 'passive' ? 'bg-green-500' : 'bg-pink-500 animate-pulse')} />
                      <p className="text-[10px] text-[var(--fg-3)] font-mono uppercase tracking-[0.3em]">{voiceState === 'passive' ? 'Neural Online' : 'Active Uplink'}</p>
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Fullscreen Immersion Layer */}
          {isFullscreen && (
            <VoiceModeOverlay 
              isOpen={true} 
              onClose={() => setIsFullscreen(false)}
              state={voiceState}
              transcript={input}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}
