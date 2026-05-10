import React from 'react';
import { useAnalytics, useAdvancedFunnel } from '../hooks/useAnalytics';
import { formatCurrency } from '../utils/format';

const Reports = () => {
  const { data: analytics, loading } = useAnalytics();
  const { data: advancedFunnel, loading: loadingFunnel } = useAdvancedFunnel();

  if (loading || loadingFunnel) return <div className="animate-pulse space-y-12"><div className="h-12 bg-slate-100 rounded-xl w-1/4" /><div className="grid grid-cols-2 gap-8"><div className="h-96 bg-slate-50 rounded-3xl" /></div></div>;
  if (!analytics) return null;

  const monthlyRevenue = analytics.monthly_revenue || [];
  const maxMonthlyValue = Math.max(...monthlyRevenue.map(m => m.total), 1);
  const totalDeals = analytics.deals_per_stage?.reduce((sum, s) => sum + (Number(s.count) || 0), 0) || 1;
  const wonDeals = analytics.deals_per_stage?.find(s => s.stage === 'Closed Won')?.count || 0;

  return (
    <div className="view-content animate-slideIn">
      <section className="mb-16">
        <p className="text-primary font-bold tracking-[0.3em] text-[10px] uppercase mb-2">Performance Intelligence</p>
        <div className="flex items-end justify-between">
          <h2 className="text-6xl font-extrabold text-on-surface tracking-tighter">Analytics.</h2>
          <div className="flex gap-4">
             <div className="px-5 py-2 bg-emerald-50 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">Q2 Fiscal Period</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-8">
        {/* Advanced Funnel (Conversion Velocity) */}
        <div className="col-span-12 bg-surface-container-low p-10 rounded-3xl mb-8">
           <h3 className="text-xs font-black tracking-widest uppercase mb-12 opacity-60">Conversion Velocity</h3>
           <div className="flex justify-between items-end gap-2">
              {advancedFunnel?.length > 0 ? (
                 advancedFunnel.map((stageData, idx) => (
                    <div key={stageData.stage} className="flex-1 flex flex-col group">
                       <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stageData.stage}</div>
                       <div className="flex-1 bg-slate-100 rounded-t-xl group-hover:bg-primary transition-all relative overflow-hidden flex flex-col justify-end" style={{ height: '200px' }}>
                          <div 
                             className="bg-primary/20 w-full group-hover:bg-white/20 transition-all duration-700 absolute bottom-0" 
                             style={{ height: `${Math.min(100, Math.max(10, (stageData.total_deals / totalDeals) * 100))}%` }} 
                          />
                          <div className="p-4 relative z-10 flex flex-col justify-end h-full">
                             <span className="text-2xl font-black text-on-surface group-hover:text-white transition-colors">{stageData.total_deals} <span className="text-[10px] uppercase tracking-widest">deals</span></span>
                             <span className="text-xs font-bold text-slate-400 group-hover:text-white/60 transition-colors mt-1">Avg {stageData.avg_days || 0} days</span>
                          </div>
                       </div>
                       {idx < advancedFunnel.length - 1 && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 z-10">
                             <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                          </div>
                       )}
                    </div>
                 ))
              ) : (
                 <div className="w-full py-12 text-center text-slate-300 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-2xl">
                    Insufficient historical data for velocity calculation.
                 </div>
              )}
           </div>
        </div>

        {/* Revenue Projection */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-10 rounded-3xl editorial-shadow">
          <div className="flex justify-between items-center mb-12">
            <h3 className="text-xs font-black tracking-widest uppercase opacity-60">Revenue trajectory</h3>
            <span className="text-[10px] font-bold text-slate-300">Last 6 Months</span>
          </div>
          <div className="space-y-8">
            {monthlyRevenue.map((item) => (
              <div key={item.month} className="group">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-sm font-bold text-on-surface uppercase tracking-tight">
                    {new Date(item.month).toLocaleDateString('en-US', { month: 'long' })}
                  </span>
                  <span className="text-xl font-black text-primary tracking-tighter group-hover:scale-110 transition-transform">{formatCurrency(item.total)}</span>
                </div>
                <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000"
                    style={{ width: `${(item.total / maxMonthlyValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {monthlyRevenue.length === 0 && (
               <div className="py-8 text-center text-slate-300 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-2xl">No revenue recorded yet</div>
            )}
          </div>
        </div>

        {/* Acquisition Efficiency */}
        <div className="col-span-12 lg:col-span-4 bg-primary text-on-primary p-10 rounded-3xl flex flex-col justify-between shadow-2xl shadow-primary/20">
           <div>
              <h3 className="text-[10px] font-black tracking-[0.2em] uppercase opacity-60 mb-8">Conversion efficiency</h3>
              <div className="relative flex items-center justify-center h-48">
                 <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="12" 
                      strokeDasharray={`${(wonDeals / totalDeals) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black tracking-tighter">{Math.round((wonDeals / totalDeals) * 100)}%</span>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Win Rate</span>
                 </div>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
              <div className="text-center">
                 <div className="text-xl font-bold">{wonDeals}</div>
                 <div className="text-[8px] font-black uppercase opacity-60">Closed Won</div>
              </div>
              <div className="text-center border-l border-white/10">
                 <div className="text-xl font-bold">{totalDeals - wonDeals}</div>
                 <div className="text-[8px] font-black uppercase opacity-60">In Pipeline</div>
              </div>
           </div>
        </div>

        {/* Activity Distribution */}
        <div className="col-span-12 bg-surface-container-low p-10 rounded-3xl">
           <h3 className="text-xs font-black tracking-widest uppercase mb-12 opacity-60">Engagement Intensity</h3>
           <div className="grid grid-cols-5 gap-8">
              {analytics.activity_counts?.map((item) => (
                <div key={item.type} className="bg-white p-8 rounded-2xl shadow-sm text-center group hover:bg-primary transition-all duration-300">
                   <div className="text-4xl mb-6 group-hover:scale-125 transition-transform duration-300">
                      {item.type === 'call' && '📞'}
                      {item.type === 'email' && '✉️'}
                      {item.type === 'meeting' && '🗓'}
                      {item.type === 'note' && '📝'}
                      {item.type === 'task' && '✅'}
                   </div>
                   <div className="text-3xl font-black text-on-surface tracking-tighter group-hover:text-white">{item.count}</div>
                   <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2 group-hover:text-white/60">{item.type}s</div>
                </div>
              ))}
              {!analytics.activity_counts?.length && (
                 <div className="col-span-5 py-8 text-center text-slate-300 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-slate-200 rounded-2xl">No engagement activity recorded</div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;