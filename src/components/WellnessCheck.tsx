import React from 'react';
import { Sun, SunDim, Moon, Zap, BedDouble } from 'lucide-react';
import { WellnessData, WellnessSlot } from '../types';
import { cn } from '../lib/utils';

interface WellnessCheckProps {
  slot: WellnessSlot;
  data: WellnessData;
  onChange: (slot: WellnessSlot, field: keyof WellnessData, value: number) => void;
}

const slotConfig = {
  morning: {
    label: 'Mattina',
    icon: Sun,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20'
  },
  afternoon: {
    label: 'Pomeriggio',
    icon: SunDim,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20'
  },
  evening: {
    label: 'Sera',
    icon: Moon,
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10',
    border: 'border-indigo-400/20'
  }
};

export const WellnessCheck: React.FC<WellnessCheckProps> = ({ slot, data, onChange }) => {
  const config = slotConfig[slot];

  return (
    <div className={cn(
      "p-5 rounded-2xl border backdrop-blur-md transition-all duration-300",
      config.bg,
      config.border
    )}>
      <div className="flex items-center gap-3 mb-6">
        <div className={cn("p-2 rounded-xl bg-white/5", config.color)}>
          <config.icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">{config.label}</h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Energia</span>
            </div>
            <span className="text-lg font-bold text-white">{data.energy}/10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={data.energy}
            onChange={(e) => onChange(slot, 'energy', parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <BedDouble className="w-4 h-4 text-blue-400" />
              <span>Ore Sonno</span>
            </div>
            <span className="text-lg font-bold text-white">{data.sleep}h</span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={data.sleep}
            onChange={(e) => onChange(slot, 'sleep', parseFloat(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>
    </div>
  );
};
