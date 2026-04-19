export const formatCurrency = (value) => {
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
  const colors = ['#4f8ef7', '#a78bfa', '#10b981', '#f59e0b', '#f87171', '#f97316'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export const getStatusColor = (status) => {
  const colors = {
    'Customer': '#10b981',
    'Lead': '#4f8ef7',
    'Prospect': '#a78bfa',
    'Churned': '#f87171'
  };
  return colors[status] || '#8b90a7';
};

export const getStageColor = (stage) => {
  const colors = {
    'New': '#8b90a7',
    'Qualified': '#4f8ef7',
    'Proposal': '#a78bfa',
    'Negotiation': '#f59e0b',
    'Closed Won': '#10b981',
    'Closed Lost': '#f87171'
  };
  return colors[stage] || '#8b90a7';
};

export const getPriorityColor = (priority) => {
  const colors = {
    'High': '#f87171',
    'Medium': '#f59e0b',
    'Low': '#10b981'
  };
  return colors[priority] || '#8b90a7';
};

export const getRelativeTime = (date) => {
  const diff = new Date() - new Date(date);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days > 0 && days < 7) return `${days} days ago`;
  if (days >= 7 && days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};