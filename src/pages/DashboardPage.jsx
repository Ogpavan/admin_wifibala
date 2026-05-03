import {
  Badge,
  Box,
  Grid,
  GridItem,
  Heading,
  Progress,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { FiAlertCircle, FiDollarSign, FiRepeat, FiUsers } from 'react-icons/fi';
import LoadingState from '../components/common/LoadingState';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import { getCarouselSlides } from '../services/carouselApi';
import { getComplaintStats } from '../services/complaintsApi';
import { getOffers } from '../services/offersApi';
import { getPlans } from '../services/plansApi';
import { getSettings } from '../services/settingsApi';
import { getSubscriptions } from '../services/subscriptionsApi';
import { getUsers } from '../services/usersApi';
import { getVipOffers } from '../services/vipOffersApi';

const icons = [FiUsers, FiRepeat, FiDollarSign, FiAlertCircle];

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DashboardPage() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [trend, setTrend] = useState({ active: 0, expired: 0 });
  const [recentSubscriptions, setRecentSubscriptions] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const [
          usersRes,
          plansRes,
          offersRes,
          complaintsStatsRes,
          subscriptionsRes,
          vipRes,
          carouselRes,
          settingsRes,
        ] = await Promise.all([
          getUsers({ page: 1, limit: 1 }),
          getPlans({ page: 1, limit: 1 }),
          getOffers(),
          getComplaintStats(),
          getSubscriptions({ page: 1, limit: 10 }),
          getVipOffers(),
          getCarouselSlides(),
          getSettings(),
        ]);

        const totalUsers = usersRes?.pagination?.total || 0;
        const totalSubscriptions = subscriptionsRes?.total || 0;
        const totalOffers = offersRes?.count || 0;
        const pendingComplaints = Number(complaintsStatsRes?.stats?.pending_complaints || 0);
        const resolvedComplaints = Number(complaintsStatsRes?.stats?.resolved_complaints || 0);

        setStats([
          { id: 'users', label: 'Total Users', value: totalUsers, helpText: 'Registered users' },
          { id: 'subs', label: 'Subscriptions', value: totalSubscriptions, helpText: 'Current subscriptions' },
          { id: 'offers', label: 'Offers', value: totalOffers, helpText: 'Active + inactive offers' },
          { id: 'complaints', label: 'Pending Complaints', value: pendingComplaints, helpText: `${resolvedComplaints} resolved` },
        ]);

        const rows = subscriptionsRes?.subscriptions || [];
        const now = new Date();
        const activeCount = rows.filter((s) => s.end_date && new Date(s.end_date) >= now).length;
        const expiredCount = rows.length - activeCount;
        const activePct = rows.length ? Math.round((activeCount / rows.length) * 100) : 0;
        const expiredPct = rows.length ? Math.round((expiredCount / rows.length) * 100) : 0;
        setTrend({ active: activePct, expired: expiredPct });
        setRecentSubscriptions(rows);

        const latestOffer = (offersRes?.data || [])[0];
        const latestVip = (Array.isArray(vipRes) ? vipRes : [])[0];
        const latestUser = (usersRes?.users || [])[0];
        const carouselCount = Array.isArray(carouselRes) ? carouselRes.length : 0;
        const plansTotal = plansRes?.pagination?.total || 0;
        const settingsName = Array.isArray(settingsRes) && settingsRes.length ? settingsRes[0]?.company_name : null;

        setRecentActivity([
          latestUser ? `New user signup: ${latestUser.name}` : null,
          latestOffer ? `Offer updated: ${latestOffer.offer_name}` : null,
          latestVip ? `VIP plan updated: ${latestVip.plan_name}` : null,
          `Total plans: ${plansTotal}, carousel slides: ${carouselCount}`,
          settingsName ? `Application settings: ${settingsName}` : null,
        ].filter(Boolean));
      } catch (error) {
        toast({ title: 'Failed to load dashboard', description: error.message, status: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const subscriptionRows = useMemo(() => (
    recentSubscriptions.map((item) => {
      const isActive = item.end_date && new Date(item.end_date) >= new Date();
      return {
        id: item.subscription_id,
        user: item.user_name || '-',
        plan: item.plan_description || '-',
        status: isActive ? 'active' : 'expired',
        renewDate: formatDate(item.end_date),
      };
    })
  ), [recentSubscriptions]);

  if (isLoading) {
    return <LoadingState text="Loading dashboard metrics..." />;
  }

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of platform metrics and operations." />

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }} gap={4} mb={6}>
        {stats.map((item, idx) => (
          <StatCard key={item.id} {...item} icon={icons[idx]} />
        ))}
      </Grid>

      <Grid templateColumns={{ base: '1fr', xl: '2fr 1fr' }} gap={4}>
        <GridItem>
          <Box bg="white" borderWidth="1px" borderRadius="lg" p={5}>
            <Heading size="sm" mb={4}>Subscription Trend (Current Page)</Heading>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text mb={1}>Active ({trend.active}%)</Text>
                <Progress value={trend.active} colorScheme="green" borderRadius="md" />
              </Box>
              <Box>
                <Text mb={1}>Expired ({trend.expired}%)</Text>
                <Progress value={trend.expired} colorScheme="orange" borderRadius="md" />
              </Box>
            </VStack>
          </Box>
        </GridItem>

        <GridItem>
          <Box bg="white" borderWidth="1px" borderRadius="lg" p={5}>
            <Heading size="sm" mb={4}>Recent Activity</Heading>
            <VStack align="stretch" spacing={3}>
              {recentActivity.length ? recentActivity.map((line) => (
                <Text key={line} color="gray.600">{line}</Text>
              )) : <Text color="gray.500">No recent activity</Text>}
            </VStack>
          </Box>
        </GridItem>
      </Grid>

      <Box mt={4} bg="white" borderWidth="1px" borderRadius="lg" overflow="hidden">
        <Box p={4}><Heading size="sm">Recent Subscriptions</Heading></Box>
        <Table>
          <Thead bg="gray.50">
            <Tr><Th>User</Th><Th>Plan</Th><Th>Status</Th><Th>Renew Date</Th></Tr>
          </Thead>
          <Tbody>
            {subscriptionRows.length ? subscriptionRows.map((row) => (
              <Tr key={row.id}>
                <Td>{row.user}</Td>
                <Td>{row.plan}</Td>
                <Td>
                  <Badge colorScheme={row.status === 'active' ? 'green' : 'orange'}>{row.status}</Badge>
                </Td>
                <Td>{row.renewDate}</Td>
              </Tr>
            )) : (
              <Tr>
                <Td colSpan={4}>
                  <Text color="gray.500">No subscriptions found</Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </>
  );
}
