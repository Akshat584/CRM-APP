import React from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatCurrency, getRelativeTime } from '../utils/format';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { data: analytics, loading } = useAnalytics();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="h-16 bg-slate-100 rounded-xl w-1/3" />
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-8 h-96 bg-slate-100 rounded-xl" />
          <div className="col-span-4 h-96 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const totalPipelineValue = analytics.total_pipeline_value || 0;
  const closedRevenue = analytics.closed_revenue || 0;
  const totalContacts = analytics.total_contacts || 0;
  const openDealsCount = analytics.deals_per_stage?.reduce((acc, s) => acc + (Number(s.count) || 0), 0) || 0;

  return (
    <div className="view-content">
      {/* Portfolio Overview Header */}
      <section className="mb-12">
        <p className="text-primary font-bold tracking-[0.3em] text-[10px] uppercase mb-2">Investment Portfolio</p>
        <div className="flex items-end justify-between">
          <h2 className="text-6xl font-extrabold text-on-surface tracking-tighter">Overview.</h2>
          <div className="flex gap-4 mb-2">
            <div className="px-4 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-[10px] font-bold tracking-widest uppercase italic">+12.4% MONTHLY</div>
          </div>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* Main KPI Card */}
        <div className="col-span-8 bg-surface-container-lowest p-10 rounded-xl editorial-shadow relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-on-surface-variant text-xs font-bold tracking-[0.2em] uppercase mb-8">Quarterly Revenue</h3>
            <div className="flex items-baseline gap-4">
              <span className="text-8xl font-thin tracking-tighter text-primary">{formatCurrency(closedRevenue)}</span>
              <span className="text-primary-container font-semibold">USD</span>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-12 border-t border-outline-variant/10 pt-10">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Projected</p>
                <p className="text-2xl font-bold text-on-surface">{formatCurrency(totalPipelineValue)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Retention</p>
                <p className="text-2xl font-bold text-on-surface">94.2%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Growth</p>
                <p className="text-2xl font-bold text-emerald-600">+18%</p>
              </div>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-emerald-50/50 rounded-full -mr-20 -mb-20 blur-3xl transition-transform group-hover:scale-110 duration-700"></div>
        </div>

        {/* Open Deals Summary */}
        <div className="col-span-4 bg-primary text-on-primary p-8 rounded-xl flex flex-col justify-between shadow-2xl shadow-primary/20">
          <div>
            <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-60 mb-2">Pipeline Health</h3>
            <p className="text-4xl font-bold tracking-tight">Open Deals</p>
          </div>
          <div className="mt-8">
            <div className="text-6xl font-light mb-4">{openDealsCount}</div>
            <p className="text-xs opacity-80 leading-relaxed">Your team has accelerated 4 deals in the last 48 hours. Strategic focus recommended for active mergers.</p>
          </div>
          <button 
            onClick={() => navigate('/pipeline')}
            className="mt-8 py-3 border border-on-primary/20 rounded-lg hover:bg-on-primary hover:text-primary transition-all font-bold text-[10px] uppercase tracking-widest"
          >
            View Pipeline
          </button>
        </div>

        {/* Inbound Prospects (using recent activities/contacts concept) */}
        <div className="col-span-5 bg-surface-container-low p-8 rounded-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-bold tracking-widest uppercase">Network Snapshot</h3>
            <span className="material-symbols-outlined text-slate-400">more_horiz</span>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between group cursor-pointer" onClick={() => navigate('/contacts')}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl font-bold text-primary shadow-sm">Σ</div>
                <div>
                  <p className="font-bold text-sm">Total Contacts</p>
                  <p className="text-[10px] text-slate-400">Database Records</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-primary">{totalContacts}</span>
            </div>
            <div className="flex items-center justify-between group cursor-pointer" onClick={() => navigate('/reports')}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl font-bold text-primary shadow-sm">Δ</div>
                <div>
                  <p className="font-bold text-sm">Efficiency</p>
                  <p className="text-[10px] text-slate-400">Win Rate</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-primary">{analytics.win_rate || 0}%</span>
            </div>
          </div>
          <Button variant="secondary" fullWidth className="mt-8" onClick={() => navigate('/contacts')}>Manage Directory</Button>
        </div>

        {/* Recent Activity Feed */}
        <div className="col-span-7 bg-surface-container-lowest p-8 rounded-xl editorial-shadow relative">
          <h3 className="text-xs font-bold tracking-widest uppercase mb-8">Ledger Activity</h3>
          <div className="relative pl-8 space-y-10 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/20">
            {analytics.recent_activities?.slice(0, 3).map((activity) => (
              <div key={activity.id} className="relative">
                <div className="absolute -left-[26px] top-0 w-3 h-3 rounded-full bg-primary ring-4 ring-white"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold">{activity.subject}</p>
                    <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed max-w-md truncate">{activity.body}</p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">{getRelativeTime(activity.activity_date)}</span>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate('/activities')}
            className="mt-8 text-[10px] font-bold text-primary flex items-center gap-1 uppercase tracking-widest hover:underline"
          >
            Full Activity Log <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {/* Upcoming Tasks Calendar-style */}
        <div className="col-span-12 mt-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold tracking-widest uppercase opacity-60">Executive Calendar</h3>
            <button 
              onClick={() => navigate('/tasks')}
              className="text-[10px] font-bold text-primary flex items-center gap-1 uppercase tracking-tighter hover:underline"
            >
              Full Schedule <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border-l-4 border-primary shadow-sm">
              <p className="text-[9px] font-black text-primary mb-2 uppercase">TODAY, 14:00</p>
              <h4 className="font-bold text-base mb-4">Board Sync</h4>
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[8px] font-bold">JD</div>
                <div className="w-6 h-6 rounded-full ring-2 ring-white bg-emerald-100 flex items-center justify-center text-[8px] font-bold text-emerald-800">MA</div>
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl">
              <p className="text-[9px] font-bold text-slate-400 mb-2 uppercase">TOMORROW, 09:30</p>
              <h4 className="font-bold text-base mb-4 text-on-surface/60">Pipeline Review</h4>
              <p className="text-[10px] text-on-surface-variant italic">Weekly strategic alignment</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl opacity-60">
              <p className="text-[9px] font-bold text-slate-400 mb-2 uppercase">OCT 24, 11:00</p>
              <h4 className="font-bold text-base mb-4">Pitch: Solaris</h4>
              <p className="text-[10px] text-on-surface-variant">Round B Presentation</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl opacity-60">
              <p className="text-[9px] font-bold text-slate-400 mb-2 uppercase">OCT 25, 16:00</p>
              <h4 className="font-bold text-base mb-4">Quarterly Audit</h4>
              <p className="text-[10px] text-on-surface-variant">Compliance check</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
