import React, { useState } from 'react';

export function BackgroundRippleEffect() {
  const rows = 12;
  const cols = 20;

  return (
    <div className="absolute inset-0 z-0 flex h-full w-full items-center justify-center overflow-hidden bg-white dark:bg-[#09090b]">
      {/* The rotated grid of boxes */}
      <div 
        className="absolute -inset-1/2 w-[200%] h-[200%] -rotate-12 opacity-60 dark:opacity-40"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`
        }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => (
          <div
            key={i}
            className="border-r border-t border-zinc-200 dark:border-zinc-800 hover:bg-indigo-500/30 dark:hover:bg-indigo-500/40 transition-colors duration-500 ease-in-out cursor-pointer active:bg-indigo-600/50"
          />
        ))}
      </div>
      
      {/* Gradient mask to fade out the edges and highlight the center */}
      <div className="absolute inset-0 bg-white dark:bg-[#09090b] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_85%)] pointer-events-none" />
      
      {/* Subtle center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] max-w-2xl h-[60%] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
    </div>
  );
}
