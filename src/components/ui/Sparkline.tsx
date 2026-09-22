import React from 'react';
import { cn } from '../../utils';

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
  className?: string;
}

export function Sparkline({
  data,
  width = 90,
  height = 28,
  color = 'indigo',
  className
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  const strokeColors = {
    indigo: '#6366f1',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    sky: '#0284c7'
  };

  const fillColors = {
    indigo: 'rgba(99, 102, 241, 0.15)',
    emerald: 'rgba(16, 185, 129, 0.15)',
    amber: 'rgba(245, 158, 11, 0.15)',
    rose: 'rgba(244, 63, 94, 0.15)',
    sky: 'rgba(2, 132, 199, 0.15)'
  };

  const areaPoints = `${points} ${width},${height} 0,${height}`;

  return (
    <div className={cn('inline-block overflow-hidden', className)}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <polygon points={areaPoints} fill={fillColors[color]} />
        <polyline
          fill="none"
          stroke={strokeColors[color]}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
}
