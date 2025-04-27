import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';

interface Booking {
  id: string;
  guest_id: string;
  check_in_date: string;
  check_out_date: string;
  price: number;
  guest: {
    name: string;
  };
}

interface RecentBookingsProps {
  limit?: number;
}

const RecentBookings: React.FC<RecentBookingsProps> = ({ limit = 5 }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, guest:guests(name)')
          .eq('user_id', user.id)
          .order('check_in_date', { ascending: true })
          .limit(limit);

        if (error) throw error;
        setBookings(data as Booking[]);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, limit]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded"></div>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No bookings found</p>
        <button
          onClick={() => navigate('/bookings')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create your first booking
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guest
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check-in
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check-out
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {booking.guest?.name || 'Unknown Guest'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {format(new Date(booking.check_in_date), 'MMM d, yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {format(new Date(booking.check_out_date), 'MMM d, yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    ${booking.price.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => navigate(`/bookings?id=${booking.id}`)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-right">
        <button
          onClick={() => navigate('/bookings')}
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          View all bookings
        </button>
      </div>
    </div>
  );
};

export default RecentBookings;