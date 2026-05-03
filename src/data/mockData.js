export const stats = [
  { id: 1, label: 'Total Users', value: '12,458', helpText: '+8.2% this month' },
  { id: 2, label: 'Active Subscriptions', value: '4,320', helpText: '+3.4% this week' },
  { id: 3, label: 'Revenue', value: '$28,900', helpText: '+12.1% this month' },
  { id: 4, label: 'Open Complaints', value: '37', helpText: '-5 from yesterday' },
];

export const users = [
  { id: 'u1', name: 'Aarav Sharma', email: 'aarav@mail.com', role: 'admin', status: 'active' },
  { id: 'u2', name: 'Mia Patel', email: 'mia@mail.com', role: 'moderator', status: 'active' },
  { id: 'u3', name: 'Noah Khan', email: 'noah@mail.com', role: 'moderator', status: 'inactive' },
];

export const plans = [
  { id: 'p1', name: 'Basic 30Mbps', price: '19', duration: '30 days', status: 'active' },
  { id: 'p2', name: 'Premium 100Mbps', price: '39', duration: '30 days', status: 'active' },
];

export const subscriptions = [
  { id: 's1', user: 'Aarav Sharma', plan: 'Premium 100Mbps', status: 'active', renewDate: '2026-05-19' },
  { id: 's2', user: 'Mia Patel', plan: 'Basic 30Mbps', status: 'expired', renewDate: '2026-04-20' },
];

export const offers = [
  { id: 'o1', title: 'Summer10', code: 'SUMMER10', discount: '10%', status: 'active' },
  { id: 'o2', title: 'Welcome25', code: 'NEW25', discount: '25%', status: 'inactive' },
];

export const vipOffers = [
  { id: 'v1', title: 'VIP Gold Deal', code: 'VIPGOLD', discount: '40%', status: 'active' },
];

export const carousels = [
  { id: 'c1', title: 'Speed Upgrade', image: 'banner-1.jpg', link: 'https://example.com/speed', status: 'active' },
];

export const complaints = [
  { id: 'cp1', user: 'Noah Khan', issue: 'Frequent disconnections', status: 'pending' },
  { id: 'cp2', user: 'Mia Patel', issue: 'Billing mismatch', status: 'resolved' },
];
