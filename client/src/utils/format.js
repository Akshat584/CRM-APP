export const formatCurrency = (value) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}k`;
  }
  return `$${value}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const getInitials = (name) => {
  if (!name) return 'NA';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export const getAvatarColor = (name) => {
  const colors = ['#00453e', '#176a60', '#5b5e66', '#393e3e', '#1a1c1e'];
  const index = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[index];
};

export const getStatusColor = (status) => {
  const colors = {
    'Customer': '#00453e',
    'Lead': '#5b5e66',
    'Prospect': '#434848',
    'Churned': '#ba1a1a'
  };
  return colors[status] || '#6f7977';
};

export const getStageColor = (stage) => {
  const colors = {
    'New': '#6f7977',
    'Qualified': '#5b5e66',
    'Proposal': '#434848',
    'Negotiation': '#00453e',
    'Closed Won': '#176a60',
    'Closed Lost': '#ba1a1a'
  };
  return colors[stage] || '#6f7977';
};

export const getPriorityColor = (priority) => {
  const colors = {
    'High': '#ba1a1a',
    'Medium': '#f59e0b',
    'Low': '#176a60'
  };
  return colors[priority] || '#6f7977';
};

export const getRelativeTime = (date) => {
  if (!date) return 'Unknown';
  const diff = new Date() - new Date(date);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
};
