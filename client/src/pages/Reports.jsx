import React from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatCurrency } from '../utils/format';

const Reports = () => {
  const { data: analytics, loading } = useAnalytics();

  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px'
      }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            padding: '20px',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <div style={{
              height: '15px',
              background: 'var(--bg-surface2)',
              borderRadius: '4px',
              marginBottom: '20px',
              width: '60%'
            }} />
            <div style={{
              height: '200px',
              background: 'var(--bg-surface2)',
              borderRadius: '8px'
            }} />
          </div>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  const monthlyRevenue = analytics.monthly_revenue || [];
  const maxMonthlyValue = Math.max(...monthlyRevenue.map(m => m.total), 1);

  const totalWon = analytics.deals_per_stage?.find(s => s.stage === 'Closed Won')?.count || 0;
  const totalDeals = analytics.deals_per_stage?.reduce((sum, s) => sum + s.count, 0) || 1;
  const circumference = 2 * Math.PI * 45;
  const wonDash = (totalWon / totalDeals) * circumference;

  return (
    <div className="view-content">
      <div className="reports-grid">
        {/* Revenue by Month */}
        <div className="card">
          <div className="card-title">Revenue by Month</div>
          <div className="bar-chart">
            {monthlyRevenue.map((item) => (
              <div key={item.month} className="bar-chart-item">
                <div className="bar-chart-label">
                  {new Date(item.month).toLocaleDateString('en-US', { month: 'short' })}
                </div>
                <div className="bar-chart-bar-container">
                  <div
                    className="bar-chart-bar"
                    style={{ width: `${(item.total / maxMonthlyValue) * 100}%` }}
                  />
                </div>
                <div className="bar-chart-value">{formatCurrency(item.total)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Funnel */}
        <div className="card">
          <div className="card-title">Pipeline Funnel</div>
          <div className="funnel-chart">
            {analytics.deals_per_stage
              ?.filter(s => !['Closed Won', 'Closed Lost'].includes(s.stage))
              .map((stage, index) => (
                <div
                  key={stage.stage}
                  className="funnel-stage"
                  style={{
                    width: `${100 - (index * 15)}%`,
                    margin: '0 auto'
                  }}
                >
                  <div className="funnel-stage-header">
                    <span className="funnel-stage-name">{stage.stage}</span>
                    <span className="funnel-stage-count">{stage.count} deals</span>
                  </div>
                  <div className="funnel-stage-value">
                    {formatCurrency(stage.total_value)}
                  </div>
                </div>
              ))}
            <div className="funnel-stage funnel-stage-final">
              <div className="funnel-stage-header">
                <span className="funnel-stage-name">Closed Won</span>
                <span className="funnel-stage-count">
                  {analytics.deals_per_stage?.find(s => s.stage === 'Closed Won')?.count || 0} deals
                </span>
              </div>
              <div className="funnel-stage-value">
                {formatCurrency(analytics.closed_revenue)}
              </div>
            </div>
          </div>
        </div>

        {/* Win/Loss Ratio */}
        <div className="card">
          <div className="card-title">Win/Loss Ratio</div>
          <div className="donut-chart">
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="45"
                fill="none"
                stroke="#232736"
                strokeWidth="20"
              />
              <circle
                cx="100"
                cy="100"
                r="45"
                fill="none"
                stroke="#10b981"
                strokeWidth="20"
                strokeDasharray={`${wonDash} ${circumference - wonDash}`}
                transform="rotate(-90 100 100)"
              />
              <text x="100" y="95" textAnchor="middle" fill="#e8eaf0" fontSize="32" fontWeight="700">
                {totalWon}
              </text>
              <text x="100" y="115" textAnchor="middle" fill="#8b90a7" fontSize="14">
                Won
              </text>
            </svg>
            <div className="donut-legend">
              <div className="donut-legend-item">
                <div className="donut-legend-color" style={{ backgroundColor: '#10b981' }} />
                <span>Won ({totalWon})</span>
              </div>
              <div className="donut-legend-item">
                <div className="donut-legend-color" style={{ backgroundColor: '#232736' }} />
                <span>Remaining ({totalDeals - totalWon})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="card">
          <div className="card-title">Activity Breakdown</div>
          <div className="activity-breakdown-grid">
            {analytics.activity_counts?.map((item) => (
              <div key={item.type} className="activity-breakdown-item">
                <div className="activity-breakdown-icon">
                  {item.type === 'call' && '📞'}
                  {item.type === 'email' && '✉️'}
                  {item.type === 'meeting' && '🗓'}
                  {item.type === 'note' && '📝'}
                  {item.type === 'task' && '✅'}
                </div>
                <div className="activity-breakdown-count">{item.count}</div>
                <div className="activity-breakdown-label">
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}s
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;