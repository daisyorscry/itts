import { useEffect, useState } from 'react';

// Animated counter hook
export function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    let animationId: number;
    
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        animationId = requestAnimationFrame(step);
      }
    };
    
    animationId = requestAnimationFrame(step);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [target, duration, start]);

  return count;
}

interface CounterCardProps {
  value: number;
  suffix?: string;
  label: string;
  started: boolean;
  duration?: number;
}

export function CounterDisplay({ value, suffix = '', label, started, duration = 2000 }: CounterCardProps) {
  const count = useCounter(value, duration, started);
  return (
    <div>
      <div className="text-5xl md:text-6xl font-bold text-white tracking-tighter">
        {count.toLocaleString()}<span className="text-accent">{suffix}</span>
      </div>
      <div className="text-white/40 text-sm mt-1">{label}</div>
    </div>
  );
}