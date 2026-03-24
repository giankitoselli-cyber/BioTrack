import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { format, subDays, parseISO, isWithinInterval } from 'date-fns';
import { EnergyCheckIn, SleepEntry } from '../types';

interface StatisticsProps {
  energyData: EnergyCheckIn[];
  sleepData: SleepEntry[];
}

export function Statistics({ energyData, sleepData }: StatisticsProps) {
  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      return date;
    }).reverse();

    return last7Days.map(date => {
      const daySleep = sleepData.find(s => s.date === date)?.hours || 0;
      const dayEnergy = energyData.filter(e => e.date === date);
      const avgEnergy = dayEnergy.length > 0 
        ? dayEnergy.reduce((acc, curr) => acc + curr.level, 0) / dayEnergy.length 
        : 0;

      return {
        date: format(parseISO(date), 'EEE'),
        sleep: daySleep,
        energy: parseFloat(avgEnergy.toFixed(1)),
      };
    });
  }, [energyData, sleepData]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Statistiche</h1>
        <p className="text-slate-400 mt-1">Analisi della correlazione tra riposo ed energia settimanale.</p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Combined Correlation Chart */}
        <div className="bg-card-dark border border-white/5 p-6 rounded-2xl h-[400px]">
          <h3 className="text-lg font-semibold mb-6">Correlazione Sonno vs Energia</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                yAxisId="left"
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                label={{ value: 'Ore Sonno', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                label={{ value: 'Energia (1-10)', angle: 90, position: 'insideRight', style: { fill: '#94a3b8' } }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#16161a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="sleep" 
                name="Sonno (h)"
                stroke="#bc13fe" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#bc13fe', strokeWidth: 2, stroke: '#16161a' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="energy" 
                name="Energia Media"
                stroke="#6366f1" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#16161a' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Energy Trend Area Chart */}
        <div className="bg-card-dark border border-white/5 p-6 rounded-2xl h-[300px]">
          <h3 className="text-lg font-semibold mb-6">Trend Energia</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#bc13fe" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#bc13fe" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="date" hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#16161a', border: '1px solid #ffffff10', borderRadius: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey="energy" 
                stroke="#bc13fe" 
                fillOpacity={1} 
                fill="url(#colorEnergy)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
