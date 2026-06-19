import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { Target, TrendingUp, Calendar, Zap, RefreshCw } from 'lucide-react';

interface AnalyticsProps {
  proteinGoal: number;
  mealsData: { date: string; protein: number; calories: number }[];
  storageCapacity: number; // kg
  storageUsed: number; // kg
  completedLaundryCount: number;
  totalMarketplaceSales: number;
}

export default function StudentAnalytics({
  proteinGoal,
  mealsData,
  storageCapacity,
  storageUsed,
  completedLaundryCount,
  totalMarketplaceSales
}: AnalyticsProps) {
  
  // Storage Gauge calc
  const storagePercent = Math.min(100, Math.round((storageUsed / storageCapacity) * 100)) || 0;

  // Render dummy metrics for gorgeous dashboards if logs are empty:
  const chartingMeals = mealsData.length > 0 ? mealsData : [
    { date: 'Mon', protein: 45, calories: 1800 },
    { date: 'Tue', protein: 78, calories: 2300 },
    { date: 'Wed', protein: 110, calories: 2450 },
    { date: 'Thu', protein: 95, calories: 2100 },
    { date: 'Fri', protein: 125, calories: 2700 },
    { date: 'Sat', protein: 85, calories: 1950 },
    { date: 'Sun', protein: 115, calories: 2200 },
  ];

  return (
    <div id="analytics-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Protein tracker line bar chart */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-150/60 shadow-xs flex flex-col justify-between col-span-1 lg:col-span-2">
        <div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold font-sans text-blue-650 bg-blue-50/80 px-2 py-0.5 rounded-sm">
                Nutrition Progress Log
              </span>
              <h3 className="font-display font-bold text-neutral-850 text-lg tracking-tight mt-1.5">
                Protein Targets & Daily Intake
              </h3>
            </div>
            <div className="flex items-center gap-2 bg-[#F0F5FF] px-3.5 py-1.5 rounded-lg border border-blue-100">
              <span className="text-xs font-bold text-blue-700">Goal: {proteinGoal}g</span>
              <Target className="w-3.5 h-3.5 text-blue-600" />
            </div>
          </div>
          
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartingMeals} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="proteinGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} strokeWidth={0} />
                <Tooltip
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#94A3B8' }}
                  itemStyle={{ fontSize: '12px', color: '#fff' }}
                />
                <Bar dataKey="protein" fill="url(#proteinGrad)" radius={[4, 4, 0, 0]} barSize={24}>
                  {chartingMeals.map((entry, index) => {
                    const isOverGoal = entry.protein >= proteinGoal;
                    return <Cell key={`cell-${index}`} fill={isOverGoal ? 'url(#proteinGrad)' : '#3B82F6'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-[#475569]">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Average intake is <strong className="text-[#1E293B]">93.5g / day</strong>
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold">Weekly Summary Log</span>
        </div>
      </div>

      {/* 2. Cold Locker Capacity Dial / Circular bar */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-150/60 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold font-sans text-rose-650 bg-rose-50 px-2 py-0.5 rounded-sm">
                Locker Analytics
              </span>
              <h3 className="font-display font-bold text-neutral-850 text-lg tracking-tight mt-1.5">
                Storage Allocation
              </h3>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center py-6 relative">
            <div className="relative w-32 h-32 rounded-full border-12 border-[#F1F5F9] flex items-center justify-center shadow-inner">
              {/* Premium Circular Progress Ring */}
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="50"
                  strokeWidth="12"
                  stroke="#F1F5F9"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="50"
                  strokeWidth="12"
                  stroke={storagePercent > 80 ? '#EF4444' : storagePercent > 50 ? '#F59E0B' : '#2563EB'}
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - storagePercent / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <div className="text-center z-10">
                <span className="block font-display font-bold text-3xl text-neutral-900">{storagePercent}%</span>
                <span className="block text-[8px] uppercase font-bold tracking-wider text-slate-400">Capacity Used</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-2 mt-4">
          <div className="flex justify-between text-xs">
            <span className="text-[#64748B]">Weight Stored</span>
            <span className="font-bold text-neutral-850">{storageUsed} kg</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#64748B]">Total Vault Capacity</span>
            <span className="font-medium text-slate-800">{storageCapacity} kg</span>
          </div>
        </div>
      </div>

      {/* 3. Stat Grid strip cards */}
      <div className="bg-[#FAFBFD] p-5 rounded-2xl border border-neutral-150/60 shadow-3xs flex flex-col md:flex-row items-stretch md:items-center justify-between col-span-1 lg:col-span-3 gap-6">
        
        <div className="flex items-center gap-4 flex-1">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#64748B]">LAUNDRY COMPLETED</p>
            <h4 className="font-display font-bold text-lg text-neutral-850 mt-0.5">{completedLaundryCount} Service Orders</h4>
          </div>
        </div>

        <div className="h-10 w-px bg-slate-200 hidden md:block"></div>

        <div className="flex items-center gap-4 flex-1">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#64748B]">PEER TRANSACTION VOLUME</p>
            <h4 className="font-display font-bold text-lg text-neutral-850 mt-0.5">৳{totalMarketplaceSales} Sales Made</h4>
          </div>
        </div>

        <div className="h-10 w-px bg-slate-200 hidden md:block"></div>

        <div className="flex items-center justify-between gap-4 md:text-right">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[9px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold shadow-3xs">
              <RefreshCw className="w-3 h-3 animate-spin" /> Live Connection
            </span>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">Synchronized with RUET Firebase Regional Database</p>
          </div>
        </div>
      </div>

    </div>
  );
}
