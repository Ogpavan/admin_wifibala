import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicOnlyRoute from './components/auth/PublicOnlyRoute';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import PlansPage from './pages/PlansPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import OffersPage from './pages/OffersPage';
import VipOffersPage from './pages/VipOffersPage';
import CarouselPage from './pages/CarouselPage';
import ComplaintsPage from './pages/ComplaintsPage';
import PortChangeRequestsPage from './pages/PortChangeRequestsPage';
import ReferralsPage from './pages/ReferralsPage';
import NativeNotificationsPage from './pages/NativeNotificationsPage';
import SettingsPage from './pages/SettingsPage';
import SignInPage from './pages/SignInPage';

export default function App() {
  return (
    <Routes>
      <Route path="/signin" element={<PublicOnlyRoute><SignInPage /></PublicOnlyRoute>} />
      <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="offers" element={<OffersPage />} />
        <Route path="vip-offers" element={<VipOffersPage />} />
        <Route path="carousel" element={<CarouselPage />} />
        <Route path="complaints" element={<ComplaintsPage />} />
        <Route path="port-change-requests" element={<PortChangeRequestsPage />} />
        <Route path="referrals" element={<ReferralsPage />} />
        <Route path="native-notifications" element={<NativeNotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
}
