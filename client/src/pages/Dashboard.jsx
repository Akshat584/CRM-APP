import React from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatCurrency, getStageColor, getStatusColor, getRelativeTime } from '../utils/format';

const Dashboard = () => {
  const { data: analytics, loading } = useAnalytics();

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            padding: '20px',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <div style={{ height: '12px', background: 'var(--bg-surface2)', borderRadius: '4px', marginBottom: '8px' }} />
            <div style={{ height: '26px', background: 'var(--bg-surface2)', borderRadius: '4px', width: '60%' }} />
          </div>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  const totalPipelineValue = analytics.total_pipeline_value || 0;
  const closedRevenue = analytics.closed_revenue || 0;
  const totalContacts = analytics.total_contacts || 0;
  const winRate = analytics.win_rate || 0;

  const dealsPerStage = analytics.deals_per_stage || [];
  const contactsPerStatus = analytics.contacts_per_status || [];

  const pipelineStages = ['New', 'Qualified', 'Proposal', 'Negotiation'];

  return (
    <div className="view-content">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Pipeline</div>
          <div className="kpi-value">{formatCurrency(totalPipelineValue)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Closed Revenue</div>
          <div className="kpi-value">{formatCurrency(closedRevenue)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Contacts</div>
          <div className="kpi-value">{totalContacts}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Win Rate</div>
          <div className="kpi-value">{winRate}%</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Pipeline Overview */}
        <div className="card">
          <div className="card-title">Pipeline Overview</div>
          <div className="pipeline-bars">
            {dealsPerStage.filter(stage => pipelineStages.includes(stage.stage)).map((stage) => {
              const percentage = totalPipelineValue > 0 ? (stage.total_value / totalPipelineValue) * 100 : 0;
              const color = getStageColor(stage.stage);
              return (
                <div key={stage.stage} className="pipeline-stage">
                  <div className="stage-label">{stage.stage}</div>
                  <div className="stage-bar">
                    <div
                      className="stage-bar-fill"
                      style={{ width: `${percentage}%`, backgroundColor: color }}
                    />
                  </div>
                  <div className="stage-value">{formatCurrency(stage.total_value)} ({stage.count} deals)</div>
                </div>
              );
            })}
          </div>

          <div className="status-breakdown" style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Contacts by Status
            </div>
            {contactsPerStatus.map((status) => (
              <div key={status.status} className="status-row">
                <div className="status-label">{status.status}</div>
                <div className="status-bar-container">
                  <div
                    className="status-bar"
                    style={{
                      width: `${(status.count / totalContacts) * 100}%`,
                      backgroundColor: getStatusColor(status.status)
                    }}
                  />
                </div>
                <div className="status-count">{status.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="card-stack">
          {/* Recent Activity */}
          <div className="card">
            <div className="card-title">Recent Activity</div>
            {analytics.recent_activities?.length > 0 ? (
              <div className="activity-list">
                {analytics.recent_activities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === 'call' && '📞'}
                      {activity.type === 'email' && '✉️'}
                      {activity.type === 'meeting' && '🗓'}
                      {activity.type === 'note' && '📝'}
                      {activity.type === 'task' && '✅'}
                    </div>
                    <div className="activity-content">
                      <div className="activity-contact">{activity.subject || 'Activity'}</div>
                      <div className="activity-note">{activity.body}</div>
                      <div className="activity-time">{getRelativeTime(activity.activity_date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '14px'
              }}>
                No recent activity
              </div>
            )}
          </div>

          {/* Monthly Revenue */}
          <div className="card">
            <div className="card-title">Monthly Revenue (Last 6 Months)</div>
            {analytics.monthly_revenue?.length > 0 ? (
              <div className="bar-chart">
                {analytics.monthly_revenue.map((item) => {
                  const maxValue = Math.max(...analytics.monthly_revenue.map(m => m.total));
                  const percentage = maxValue > 0 ? (item.total / maxValue) * 100 : 0;
                  return (
                    <div key={item.month} className="bar-chart-item">
                      <div className="bar-chart-label">{new Date(item.month).toLocaleDateString('en-US', { month: 'short' })}</div>
                      <div className="bar-chart-bar-container">
                        <div
                          className="bar-chart-bar"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="bar-chart-value">{formatCurrency(item.total)}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '14px'
              }}>
                No revenue data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;