import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO, differenceInDays } from 'date-fns';
import { BarChart2, Calendar, DollarSign, Users } from 'lucide-react';
import StatsCard from '../components/StatsCard';

interface MonthlyStats {
  month: string;
  bookings: number;
  revenue: number;
}

interface BookingLengthStats {
  duration: string;
  count: number;
}

const StatisticsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalGuests: 0,
    totalRevenue: 0,
    averageBookingLength: 0,
    monthlyStats: [] as MonthlyStats[],
    bookingLengthStats: [] as BookingLengthStats[],
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!user) return;

      try {
        // Fetch all bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*, guest:guests(name)')
          .eq('user_id', user.id);

        if (bookingsError) throw bookingsError;

        // Fetch guest count
        const { count: guestsCount, error: guestsError } = await supabase
          .from('guests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (guestsError) throw guestsError;

        // Calculate statistics
        const bookings = bookingsData || [];
        const totalRevenue = bookings.reduce((sum, booking) => sum + booking.price, 0);
        
        // Calculate average booking length
        let totalDays = 0;
        bookings.forEach(booking => {
          const checkIn = parseISO(booking.check_in_date);
          const checkOut = parseISO(booking.check_out_date);
          const days = differenceInDays(checkOut, checkIn);
          totalDays += days;
        });
        
        const averageBookingLength = bookings.length > 0 
          ? Math.round((totalDays / bookings.length) * 10) / 10 
          : 0;

        // Calculate monthly stats
        const monthlyStatsMap = new Map<string, { bookings: number; revenue: number }>();
        
        bookings.forEach(booking => {
          const month = format(parseISO(booking.check_in_date), 'MMM yyyy');
          const current = monthlyStatsMap.get(month) || { bookings: 0, revenue: 0 };
          monthlyStatsMap.set(month, {
            bookings: current.bookings + 1,
            revenue: current.revenue + booking.price,
          });
        });
        
        const monthlyStats: MonthlyStats[] = Array.from(monthlyStatsMap.entries())
          .map(([month, stats]) => ({
            month,
            bookings: stats.bookings,
            revenue: stats.revenue,
          }))
          .sort((a, b) => {
            const dateA = new Date(a.month);
            const dateB = new Date(b.month);
            return dateA.getTime() - dateB.getTime();
          });

        // Calculate booking length distribution
        const lengthDistribution = new Map<string, number>();
        bookings.forEach(booking => {
          const checkIn = parseISO(booking.check_in_date);
          const checkOut = parseISO(booking.check_out_date);
          const days = differenceInDays(checkOut, checkIn);
          
          let category = '';
          if (days <= 1) category = '1 day';
          else if (days <= 3) category = '2-3 days';
          else if (days <= 7) category = '4-7 days';
          else if (days <= 14) category = '8-14 days';
          else category = '15+ days';
          
          lengthDistribution.set(category, (lengthDistribution.get(category) || 0) + 1);
        });
        
        const bookingLengthStats: BookingLengthStats[] = [
          { duration: '1 day', count: lengthDistribution.get('1 day') || 0 },
          { duration: '2-3 days', count: lengthDistribution.get('2-3 days') || 0 },
          { duration: '4-7 days', count: lengthDistribution.get('4-7 days') || 0 },
          { duration: '8-14 days', count: lengthDistribution.get('8-14 days') || 0 },
          { duration: '15+ days', count: lengthDistribution.get('15+ days') || 0 },
        ];

        setStats({
          totalBookings: bookings.length,
          totalGuests: guestsCount || 0,
          totalRevenue,
          averageBookingLength,
          monthlyStats,
          bookingLengthStats,
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Bookings"
          value={loading ? '-' : stats.totalBookings.toString()}
          icon={<Calendar className="h-6 w-6 text-blue-600" />}
          description="All-time bookings"
          className="bg-blue-50 border-blue-200"
        />
        <StatsCard
          title="Total Guests"
          value={loading ? '-' : stats.totalGuests.toString()}
          icon={<Users className="h-6 w-6 text-green-600" />}
          description="Unique guests"
          className="bg-green-50 border-green-200"
        />
        <StatsCard
          title="Total Revenue"
          value={loading ? '-' : `$${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6 text-indigo-600" />}
          description="All-time revenue"
          className="bg-indigo-50 border-indigo-200"
        />
        <StatsCard
          title="Avg. Stay Length"
          value={loading ? '-' : `${stats.averageBookingLength} days`}
          icon={<BarChart2 className="h-6 w-6 text-purple-600" />}
          description="Average booking duration"
          className="bg-purple-50 border-purple-200"
        />
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Booking Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Booking Revenue</h2>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 rounded"></div>
              ))}
            </div>
          ) : stats.monthlyStats.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No booking data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.monthlyStats.map((month, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {month.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {month.bookings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${month.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Booking Length Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Booking Length Distribution</h2>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 rounded"></div>
              ))}
            </div>
          ) : stats.bookingLengthStats.every(s => s.count === 0) ? (
            <p className="text-gray-500 text-center py-8">No booking data available</p>
          ) : (
            <div className="space-y-4">
              {stats.bookingLengthStats.map((item, index) => (
                <div key={index} className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-100 text-blue-800">
                        {item.duration}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-800">
                        {item.count} bookings
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                    <div 
                      style={{ width: `${Math.max(5, (item.count / stats.totalBookings) * 100)}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500">
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;