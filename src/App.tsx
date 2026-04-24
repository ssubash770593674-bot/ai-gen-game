/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, SkipBack, SkipForward, 
  Volume2, Music2, Gamepad2, Layers, 
  Maximize2, Crosshair, Cpu, Radio
} from 'lucide-react';
import { TRACKS } from './types';
import { SnakeGame } from './components/SnakeGame';

export default function App() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipTrack = (direction: 'next' | 'prev') => {
    let nextIndex = currentTrackIndex + (direction === 'next' ? 1 : -1);
    if (nextIndex >= TRACKS.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = TRACKS.length - 1;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
    // Audio source update handled by effect or element change
  };

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play();
    }
  }, [currentTrackIndex, isPlaying]);

  return (
    <div className="min-h-screen flex flex-col font-sans select-none bg-[#050505] text-white overflow-hidden border-8 border-[#111] scanlines">
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={() => skipTrack('next')}
      />

      {/* Header / Nav */}
      <header className="h-24 flex items-center justify-between px-10 border-b border-[#222] shrink-0 bg-[#050505] z-50">
        <div className="flex flex-col">
          <h1 className="bold-title uppercase">SONIC SERPENT</h1>
          <span className="text-[10px] font-mono opacity-30 tracking-[0.3em] mt-1 ml-1">SYSTEM_CORE_V.2.0</span>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase tracking-widest text-[#555] font-bold">System Status</p>
            <p className="text-xs text-[#00f2ff] font-mono">AUDIO_SYNC_ACTIVE</p>
          </div>
          <div className="h-12 w-12 rounded-full border border-[#333] flex items-center justify-center">
            <div className="w-3 h-3 bg-[#ff00ff] rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden grid lg:grid-cols-[300px_1fr_300px] gap-0">
        {/* Left Sidebar: Tracks Listing */}
        <aside className="border-r border-[#222] p-8 bg-[#080808] overflow-y-auto hidden lg:flex flex-col gap-8 shrink-0">
          <div className="space-y-6">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#555] border-b border-[#222] pb-2">Archive_Library</h2>
            
            <div className="space-y-3">
              {TRACKS.map((track, i) => (
                <div
                  key={track.id}
                  onClick={() => { setCurrentTrackIndex(i); setIsPlaying(true); }}
                  className={`p-4 border cursor-pointer transition-all ${
                    currentTrackIndex === i 
                      ? 'bg-white/5 border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.2)]' 
                      : 'bg-transparent border-[#222] opacity-40 hover:opacity-100 hover:border-[#333]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] opacity-30">{String(i + 1).padStart(2, '0')}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm tracking-tight truncate uppercase">{track.title}</p>
                      <p className="text-[9px] text-[#ff00ff] font-medium leading-none mt-1 uppercase tracking-wider">{track.artist}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-auto pt-8 border-t border-[#222]">
             <div className="aspect-square w-full bg-[#111] border border-[#222] relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#00f2ff] via-transparent to-transparent"></div>
                <Music2 size={48} className="text-[#00f2ff] opacity-20" />
             </div>
          </div>
        </aside>

        {/* Center: Snake Game Window */}
        <section className="relative flex items-center justify-center p-8 bg-black overflow-hidden">
          {/* Background Ambient Glow */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-10 pointer-events-none transition-colors duration-1000"
            style={{ 
              background: `radial-gradient(circle at center, ${currentTrack.color} 0%, transparent 70%)` 
            }}
          />
          
          <div className="relative z-10 w-full flex flex-col items-center">
            <SnakeGame onScoreChange={setScore} accentColor={currentTrack.color} />
            
            <div className="mt-12 flex justify-center gap-12 text-[10px] uppercase font-bold tracking-widest text-[#333]">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#00f2ff] rotate-45"></div> Neural_Link</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#ff00ff] rotate-45"></div> Buffer_Lock</span>
            </div>
          </div>
        </section>

        {/* Right Sidebar: Active Track Info & Controls */}
        <aside className="border-l border-[#222] p-10 flex flex-col bg-[#080808] hidden lg:flex">
          <div className="text-center mb-12">
            <p className="text-[10px] uppercase tracking-widest text-[#555] font-bold mb-2">Current_Unit</p>
            <p className="text-7xl font-black text-[#00f2ff] font-mono leading-none tracking-tighter">{String(score).padStart(4, '0')}</p>
          </div>

          <div className="flex-1 space-y-10">
            <div className="space-y-4">
               <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#555] border-b border-[#222] pb-2">Active_Signal</h2>
               <div className="aspect-square w-full border border-[#222] shadow-[20px_20px_0px_rgba(0,0,0,0.5)] overflow-hidden">
                 <img 
                    src={currentTrack.cover} 
                    className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500" 
                    referrerPolicy="no-referrer"
                    alt={currentTrack.title}
                  />
               </div>
               <div className="pt-2">
                 <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none mb-1">{currentTrack.title}</h2>
                 <p className="text-sm font-bold text-[#ff00ff] uppercase tracking-widest">{currentTrack.artist}</p>
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-end">
                 <p className="text-[10px] uppercase tracking-widest text-[#555] font-bold">Latency_Buffer</p>
                 <p className="text-sm font-mono text-[#00f2ff] uppercase">80%</p>
               </div>
               <div className="h-1 bg-[#111] w-full rounded-none overflow-hidden">
                 <div className="h-full bg-[#00f2ff] w-4/5"></div>
               </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between font-mono text-[9px] text-[#333] pt-8 border-t border-[#222]">
            <span>HIGH_CORE: {localStorage.getItem('snake-highscore') || '0'}</span>
            <span>FREQ: 192KHZ</span>
          </div>
        </aside>
      </main>

      {/* Footer Controls */}
      <footer className="h-24 bg-[#0a0a0a] border-t border-[#222] px-10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-8 w-1/3">
           <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                 <span className="text-[10px] font-mono text-[#00f2ff] uppercase">Progress_</span>
                 <span className="text-[10px] font-mono opacity-30">01:42 / 03:20</span>
              </div>
              <div className="w-56 h-1 bg-[#222] relative rounded-none">
                 <motion.div 
                    animate={{ width: isPlaying ? '100%' : '45%' }}
                    transition={{ duration: 180, ease: 'linear' }}
                    className="absolute top-0 left-0 h-full bg-[#00f2ff]" 
                 />
              </div>
           </div>
        </div>

        <div className="flex items-center gap-10 justify-center w-1/3">
          <button 
             onClick={() => skipTrack('prev')}
             className="text-[#444] hover:text-white transition-colors"
          >
             <SkipBack size={24} fill="currentColor" strokeWidth={0} />
          </button>
          
          <button 
             onClick={togglePlay}
             className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform"
          >
             {isPlaying ? <Pause size={28} fill="currentColor" strokeWidth={0} /> : <Play size={28} fill="currentColor" strokeWidth={0} className="ml-1" />}
          </button>

          <button 
             onClick={() => skipTrack('next')}
             className="text-[#444] hover:text-white transition-colors"
          >
             <SkipForward size={24} fill="currentColor" strokeWidth={0} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-10 w-1/3">
          <div className="flex gap-1.5 items-end h-8">
            {[0.4, 0.8, 0.6, 1.0, 0.3, 0.7].map((h, i) => (
              <motion.div 
                key={i}
                animate={{ height: ['20%', '100%', '40%', '100%'] }}
                transition={{ duration: 0.4 + i * 0.1, repeat: Infinity }}
                className={`w-1.5 ${i < 4 ? 'bg-[#ff00ff]' : 'bg-[#222]'}`}
              />
            ))}
          </div>
          <div className="text-right">
             <p className="text-[10px] uppercase tracking-widest text-[#555] font-bold">Visual_Link</p>
             <p className="text-[9px] font-mono opacity-30 mt-0.5">READY_BUFFER_ACTIVE</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
