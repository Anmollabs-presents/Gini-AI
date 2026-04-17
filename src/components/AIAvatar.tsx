import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type VoiceState = 'passive' | 'active' | 'processing' | 'speaking';

interface AIAvatarProps {
  state: VoiceState;
  mode?: 'fullscreen' | 'chat';
}

export function AIAvatar({ state, mode = 'fullscreen' }: AIAvatarProps) {
  // 👩🎤 Gini Anime Container (Video-based, continuous loop)
  return (
    <div className={cn(
      "relative w-full h-full flex items-center justify-center overflow-hidden transition-all duration-700",
      mode === 'fullscreen' ? 'bg-black' : 'bg-transparent'
    )}>
      <motion.div 
        style={{ perspective: 1200, transformStyle: "preserve-3d" }}
        className={cn(
          "relative flex items-center justify-center z-20 transition-all duration-1000",
          mode === 'fullscreen' ? 'w-full h-full' : 'w-full h-full'
        )}
      >
        <div className={cn(
          "relative flex items-center justify-center overflow-hidden",
          mode === 'fullscreen' ? 'w-full h-full' : 'w-[120%] h-[120%]'
        )}>
          {/* Identity Lock: The Continuous Anime Video */}
          <video 
            src="/gini-avatar.mp4"
            autoPlay 
            loop 
            muted 
            playsInline
            className={cn(
              "object-cover transition-all",
              mode === 'fullscreen' ? 'h-full w-full' : 'h-full w-full'
            )}
          />
        </div>
      </motion.div>
    </div>
  );
}
