import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Users, CreditCard, BarChart2 } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import RecentBookings from '../components/RecentBookings';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalGuests: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Fetch booking count
        const { count: bookingsCount, error: bookingsError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (bookingsError) throw bookingsError;

        // Fetch guest count
        const { count: guestsCount, error: guestsError } = await supabase
          .from('guests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (guestsError) throw guestsError;

        // Fetch revenue sum
        const { data: revenueData, error: revenueError } = await supabase
          .from('bookings')
          .select('price')
          .eq('user_id', user.id);

        if (revenueError) throw revenueError;

        const totalRevenue = revenueData.reduce(
          (sum, booking) => sum + booking.price,
          0
        );

        setStats({
          totalBookings: bookingsCount || 0,
          totalGuests: guestsCount || 0,
          totalRevenue: totalRevenue || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const navigateToSection = (path: string) => {
    navigate(path);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back, {user?.email?.split('@')[0]}
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Bookings"
          value={loading ? '-' : stats.totalBookings.toString()}
          icon={<Calendar className="h-6 w-6 text-blue-600" />}
          description="All-time bookings"
          onClick={() => navigateToSection('/bookings')}
          className="bg-blue-50 border-blue-200 hover:bg-blue-100"
        />
        <StatsCard
          title="Total Guests"
          value={loading ? '-' : stats.totalGuests.toString()}
          icon={<Users className="h-6 w-6 text-green-600" />}
          description="Unique guests"
          onClick={() => navigateToSection('/guests')}
          className="bg-green-50 border-green-200 hover:bg-green-100"
        />
        <StatsCard
          title="Total Revenue"
          value={loading ? '-' : `$${stats.totalRevenue.toLocaleString()}`}
          icon={<CreditCard className="h-6 w-6 text-indigo-600" />}
          description="All-time revenue"
          onClick={() => navigateToSection('/bookings')}
          className="bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
        />
        <StatsCard
          title="Analytics"
          value="View"
          icon={<BarChart2 className="h-6 w-6 text-purple-600" />}
          description="Detailed statistics"
          onClick={() => navigateToSection('/statistics')}
          className="bg-purple-50 border-purple-200 hover:bg-purple-100"
        />
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Bookings</h2>
        <RecentBookings limit={5} />
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/bookings')}
            className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
          >
            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-800">New Booking</span>
          </button>
          <button
            onClick={() => navigate('/guests')}
            className="flex items-center justify-center p-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
          >
            <Users className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-medium text-green-800">Add Guest</span>
          </button>
          <button
            onClick={() => navigate('/statistics')}
            className="flex items-center justify-center p-4 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors"
          >
            <BarChart2 className="h-5 w-5 text-purple-600 mr-2" />
            <span className="font-medium text-purple-800">View Stats</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;