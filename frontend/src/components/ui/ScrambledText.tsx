import React, { useEffect, useRef } from 'react';
import './ScrambledText.css';

export interface ScrambledTextProps {
  radius?: number;
  duration?: number;
  speed?: number;
  scrambleChars?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const ScrambledText: React.FC<ScrambledTextProps> = ({
  radius = 100,
  duration = 1.2,
  speed = 0.5, // Used for controlling update frequency
  scrambleChars = '.:*#01',
  className = '',
  style = {},
  children
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  // Extract text
  const text = typeof children === 'string' ? children : '';

  useEffect(() => {
    if (!rootRef.current || !textRef.current || !text) return;

    const container = textRef.current;
    container.innerHTML = '';

    const chars: HTMLSpanElement[] = [];

    // Split text into spans
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = text[i];
      if (text[i] === ' ') {
        span.style.width = '0.25em';
      }
      span.dataset.original = text[i];
      chars.push(span);
      container.appendChild(span);
    }

    const activeAnimations = new Map<HTMLElement, { startTime: number, timer: number }>();

    chars.forEach(c => {
      const original = c.dataset.original!;
      if (original === ' ') return; // Don't scramble spaces

      const handleEnter = () => {
        if (activeAnimations.has(c)) {
          cancelAnimationFrame(activeAnimations.get(c)!.timer);
        }

        const startTime = performance.now();
        let lastUpdate = startTime;
        const updateInterval = (1 - speed) * 100; // Update frequency
        const charDuration = duration * 1000;

        const animate = (time: number) => {
          const elapsed = time - startTime;
          if (elapsed < charDuration) {
            if (time - lastUpdate > updateInterval) {
              c.textContent = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
              lastUpdate = time;
            }
            const timer = requestAnimationFrame(animate);
            activeAnimations.set(c, { startTime, timer });
          } else {
            c.textContent = original;
            activeAnimations.delete(c);
          }
        };

        const timer = requestAnimationFrame(animate);
        activeAnimations.set(c, { startTime, timer });
      };

      c.addEventListener('pointerenter', handleEnter);
      (c as any)._handleEnter = handleEnter;
    });

    return () => {
      chars.forEach(c => {
        if ((c as any)._handleEnter) {
          c.removeEventListener('pointerenter', (c as any)._handleEnter);
        }
      });
      activeAnimations.forEach(val => cancelAnimationFrame(val.timer));
    };
  }, [duration, speed, scrambleChars, text]);

  return (
    <div ref={rootRef} className={`text-block ${className}`} style={style}>
      <p ref={textRef} className="scramble-p"></p>
    </div>
  );
};

export default ScrambledText;
