const pool = require('../db/pool');
const { getTotalPipelineValue, getClosedRevenue, getWinRate, getPipelineStats } = require('./dealService');
const { getActivityCounts, getRecentActivities } = require('./activityService');

const getDashboardAnalytics = async (userId) => {
  const [
    pipelineValue,
    closedRevenue,
    winRate,
    pipelineStats,
    contactStats,
    monthlyRevenue,
    activityCounts,
    recentActivities
  ] = await Promise.all([
    getTotalPipelineValue(userId),
    getClosedRevenue(userId),
    getWinRate(userId),
    getPipelineStats(userId),
    getContactsByStatus(userId),
    getMonthlyRevenue(userId),
    getActivityCounts(userId),
    getRecentActivities(userId, 4)
  ]);

  const contactsResult = await pool.query(
    'SELECT COUNT(*) as count FROM contacts WHERE user_id = $1 AND deleted_at IS NULL',
    [userId]
  );
  const totalContacts = parseInt(contactsResult.rows[0].count);

  return {
    total_pipeline_value: pipelineValue,
    closed_revenue: closedRevenue,
    total_contacts: totalContacts,
    win_rate: winRate,
    deals_per_stage: pipelineStats,
    contacts_per_status: contactStats,
    monthly_revenue: monthlyRevenue,
    activity_counts: activityCounts,
    recent_activities: recentActivities
  };
};

const getContactsByStatus = async (userId) => {
  const result = await pool.query(
    `SELECT status, COUNT(*) as count
     FROM contacts
     WHERE user_id = $1 AND deleted_at IS NULL
     GROUP BY status`,
    [userId]
  );

  return result.rows;
};

const getMonthlyRevenue = async (userId) => {
  const result = await pool.query(
    `SELECT
      DATE_TRUNC('month', due_date) as month,
      SUM(value) as total
     FROM deals
     WHERE user_id = $1
       AND stage = 'Closed Won'
       AND due_date >= CURRENT_DATE - INTERVAL '6 months'
     GROUP BY DATE_TRUNC('month', due_date)
     ORDER BY month ASC`,
    [userId]
  );

  return result.rows.map(row => ({
    month: row.month.toISOString().split('T')[0].substring(0, 7),
    total: parseFloat(row.total)
  }));
};

const getPipelineFunnel = async (userId) => {
  const result = await pool.query(
    `SELECT
      stage,
      COUNT(*) as count,
      SUM(value) as total_value
     FROM deals
     WHERE user_id = $1
       AND stage NOT IN ('Closed Won', 'Closed Lost')
     GROUP BY stage
     ORDER BY
       CASE stage
         WHEN 'New' THEN 1
         WHEN 'Qualified' THEN 2
         WHEN 'Proposal' THEN 3
         WHEN 'Negotiation' THEN 4
       END`,
    [userId]
  );

  return result.rows;
};

const getTopContacts = async (userId) => {
  const result = await pool.query(
    `SELECT id, name, company, avatar_initials, lifetime_value
     FROM contacts
     WHERE user_id = $1 AND deleted_at IS NULL
     ORDER BY lifetime_value DESC
     LIMIT 5`,
    [userId]
  );

  return result.rows;
};

const getAdvancedFunnel = async (organizationId) => {
  // Funnel Insights: Average time spent in each stage (in days)
  const durationResult = await pool.query(
    `SELECT stage, 
            COUNT(id) as total_deals,
            ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(exited_at, CURRENT_TIMESTAMP) - entered_at)) / 86400)) as avg_days
     FROM deal_stage_history h
     JOIN deals d ON h.deal_id = d.id
     WHERE d.organization_id = $1
     GROUP BY stage
     ORDER BY 
       CASE stage
         WHEN 'New' THEN 1
         WHEN 'Qualified' THEN 2
         WHEN 'Proposal' THEN 3
         WHEN 'Negotiation' THEN 4
         WHEN 'Closed Won' THEN 5
         WHEN 'Closed Lost' THEN 6
       END`,
    [organizationId]
  );

  return durationResult.rows;
};

module.exports = {
  getDashboardAnalytics,
  getPipelineFunnel,
  getTopContacts,
  getAdvancedFunnel
};