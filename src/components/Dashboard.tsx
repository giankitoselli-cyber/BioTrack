import React from 'react';
import { format } from 'date-fns';
import { Sun, CloudSun, Moon, Bed } from 'lucide-react';
import { motion } from 'motion/react';
import { EnergyCheckIn, SleepEntry, TimeSlot } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  selectedDate: Date;
  energyData: EnergyCheckIn[];
  sleepData: SleepEntry[];
  onAddEnergy: (date: string, slot: TimeSlot, level: number) => void;
  onAddSleep: (date: string, hours: number) => void;
}

export function Dashboard({ selectedDate, energyData, sleepData, onAddEnergy, onAddSleep }: DashboardProps) {
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  
  const getEnergyForSlot = (slot: TimeSlot) => {
    return energyData.find(e => e.date === dateKey && e.slot === slot)?.level;
  };

  const daySleep = sleepData.find(s => s.date === dateKey)?.hours || 0;

  const slots: { name: TimeSlot; icon: any; label: string }[] = [
    { name: 'Morning', icon: Sun, label: 'Mattina' },
    { name: 'Afternoon', icon: CloudSun, label: 'Pomeriggio' },
    { name: 'Evening', icon: Moon, label: 'Sera' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {slots.map((slot) => {
          const Icon = slot.icon;
          const level = getEnergyForSlot(slot.name);

          return (
            <motion.div
              key={slot.name}
              whileHover={{ y: -4 }}
              className="bg-card-dark border border-white/5 p-6 rounded-2xl relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-purple-electric/10 rounded-xl">
                  <Icon size={24} className="text-purple-electric" />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{slot.label}</span>
              </div>

              <h3 className="text-lg font-semibold mb-4">Livello Energia</h3>
              
              <div className="flex items-center gap-1.5">
                {[...Array(10)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onAddEnergy(dateKey, slot.name, i + 1)}
                    className={cn(
                      "flex-1 h-10 rounded-lg transition-all active:scale-95",
                      level && i < level 
                        ? "bg-purple-electric shadow-[0_0_10px_rgba(188,19,254,0.4)]" 
                        : "bg-white/5 hover:bg-white/10"
                    )}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                <span>Esaurito</span>
                <span>Carico</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-card-dark border border-white/5 p-8 rounded-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-purple-electric/10 rounded-xl">
            <Bed size={24} className="text-purple-electric" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Ore di Sonno</h3>
            <p className="text-sm text-slate-400">Riposo della notte precedente</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-end">
             <span className="text-sm font-bold text-slate-500 uppercase">Intensità riposo</span>
             <div className="text-4xl font-black text-purple-electric">
               {daySleep}<span className="text-lg ml-1 text-slate-500">h</span>
             </div>
          </div>
          
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={daySleep}
            onChange={(e) => onAddSleep(dateKey, parseFloat(e.target.value))}
            className="w-full h-3 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-electric"
          />
          
          <div className="grid grid-cols-5 gap-2">
            {[4, 6, 7, 8, 9].map(h => (
              <button
                key={h}
                onClick={() => onAddSleep(dateKey, h)}
                className={cn(
                  "py-3 rounded-xl text-sm font-bold transition-all border",
                  daySleep === h 
                    ? "bg-purple-electric border-purple-electric text-white" 
                    : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10"
                )}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
