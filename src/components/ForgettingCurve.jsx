import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { generateForgettingCurve, getCurrentRetention, formatInterval } from '../utils/spacedRepetition';

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-elevated rounded-xl px-3 py-2 text-xs shadow-lg border border-white/10">
        <p className="text-gray-500 dark:text-gray-400">Day {parseFloat(label).toFixed(0)}</p>
        <p className="font-semibold text-brand-600 dark:text-brand-400">{payload[0].value}% retention</p>
      </div>
    );
  }
  return null;
};

/**
 * ForgettingCurve — visualizes the FSRS-6 power-law memory decay curve for a card.
 *
 * Formula: R(t) = (1 + factor × t/S)^(−w₂₀)
 * where S = stability (days until R drops to 90%), w₂₀ = 0.1542.
 *
 * Shows:
 *  - The decay curve from last review to 3× stability
 *  - A dot at the current moment showing live retention %
 *  - A dashed line at the 90% target retention threshold
 *  - A vertical line at the scheduled next review date
 */
const ForgettingCurve = ({ card }) => {
  const stability = card.stability ?? 0;
  const hasBeenReviewed = card.last_review && stability > 0;

  // Generate curve data
  const data = useMemo(() => {
    if (!hasBeenReviewed) return [];
    return generateForgettingCurve(stability);
  }, [stability, hasBeenReviewed]);

  // Current retention (live, based on elapsed time since last review)
  const currentRetention = useMemo(() => getCurrentRetention(card), [card]);

  // Days elapsed since last review (x-position of the "now" dot)
  const elapsedDays = useMemo(() => {
    if (!card.last_review) return 0;
    return (Date.now() - new Date(card.last_review).getTime()) / (1000 * 60 * 60 * 24);
  }, [card.last_review]);

  // Days until next review (x-position of the "due" line)
  const dueDays = useMemo(() => {
    if (!card.due && !card.nextReview) return stability;
    const dueDate = new Date(card.due ?? card.nextReview);
    const lastReview = new Date(card.last_review ?? Date.now());
    return Math.max(0, (dueDate - lastReview) / (1000 * 60 * 60 * 24));
  }, [card.due, card.nextReview, card.last_review, stability]);

  // FSRS state labels
  const stateLabels = { 0: 'New', 1: 'Learning', 2: 'Review', 3: 'Relearning' };
  const stateColors = {
    0: 'text-gray-500',
    1: 'text-blue-500',
    2: 'text-emerald-500',
    3: 'text-orange-500'
  };

  if (!hasBeenReviewed) {
    return (
      <div className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          📊 Forgetting curve will appear after the first review
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Stability: not yet set · State: New
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gray-50/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4">
      {/* Header row */}
      <div className="flex items-start justify-between mb-3 gap-3">
        <div>
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-0.5">
            Memory Retention Curve
          </h4>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            R(t) = (1 + factor·t/S)^(−w₂₀) · FSRS-6
          </p>
        </div>
        {/* Live stats */}
        <div className="flex gap-3 shrink-0">
          <div className="text-center">
            <div className={`text-lg font-extrabold ${
              currentRetention >= 80 ? 'text-emerald-500' :
              currentRetention >= 60 ? 'text-orange-500' : 'text-red-500'
            }`}>
              {currentRetention}%
            </div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500">Now</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-extrabold text-brand-500">
              {stability < 1 ? `${Math.round(stability * 24)}h` : formatInterval(Math.round(stability))}
            </div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500">Stability</div>
          </div>
          <div className="text-center">
            <div className={`text-sm font-bold ${stateColors[card.state ?? 0]}`}>
              {stateLabels[card.state ?? 0]}
            </div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500">State</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
          <defs>
            <linearGradient id="retentionGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" />

          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: 'currentColor' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `d${Math.round(v)}`}
            interval="preserveStartEnd"
          />

          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: 'currentColor' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}%`}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Decay curve */}
          <Area
            type="monotone"
            dataKey="retention"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#retentionGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#6366f1' }}
          />

          {/* 90% target retention threshold */}
          <ReferenceLine
            y={90}
            stroke="#22c55e"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{ value: '90%', fontSize: 10, fill: '#22c55e', position: 'right' }}
          />

          {/* "Now" marker — current position on the curve */}
          <ReferenceLine
            x={parseFloat(elapsedDays.toFixed(1))}
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="3 3"
            label={{ value: 'Now', fontSize: 10, fill: '#f59e0b', position: 'top' }}
          />

          {/* Due date marker */}
          {dueDays > 0 && (
            <ReferenceLine
              x={parseFloat(dueDays.toFixed(1))}
              stroke="#8b5cf6"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              label={{ value: 'Due', fontSize: 10, fill: '#8b5cf6', position: 'top' }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-4 mt-2 text-[10px] text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-brand-500 inline-block"></span> Retention
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-emerald-500 inline-block" style={{borderTop:'1.5px dashed #22c55e', background:'none'}}></span>
          <span className="text-emerald-500">─ ─</span> 90% target
        </span>
        <span className="flex items-center gap-1">
          <span className="text-amber-500">─ ─</span> Now
        </span>
        <span className="flex items-center gap-1">
          <span className="text-purple-500">─ ─</span> Due
        </span>
      </div>
    </div>
  );
};

export default ForgettingCurve;
