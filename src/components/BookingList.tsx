import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Booking {
  id: string;
  guest_id: string;
  check_in_date: string;
  check_out_date: string;
  price: number;
  notes: string | null;
  guest: {
    name: string;
    email: string;
    phone: string;
  };
}

interface BookingListProps {
  onEdit: (id: string) => void;
}

const BookingList: React.FC<BookingListProps> = ({ onEdit }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBookings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, guest:guests(name, email, phone)')
        .eq('user_id', user.id)
        .order('check_in_date', { ascending: true });

      if (error) throw error;
      setBookings(data as Booking[]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleDeleteBooking = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const { error } = await supabase
          .from('bookings')
          .delete()
          .eq('id', id)
          .eq('user_id', user?.id);

        if (error) throw error;

        toast.success('Booking deleted successfully');
        fetchBookings();
      } catch (error) {
        console.error('Error deleting booking:', error);
        toast.error('Failed to delete booking');
      }
    }
  };

  // Filter bookings based on search term
  const filteredBookings = bookings.filter((booking) => {
    const searchString = searchTerm.toLowerCase();
    return (
      booking.guest?.name?.toLowerCase().includes(searchString) ||
      booking.notes?.toLowerCase().includes(searchString) ||
      booking.guest?.email?.toLowerCase().includes(searchString) ||
      booking.guest?.phone?.includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-end mb-4">
          <div className="w-64 h-10 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Search bookings..."
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm
              ? 'No bookings match your search'
              : 'No bookings found. Create your first booking!'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Guest
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Check-in
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Check-out
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Price
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Notes
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="font-medium text-gray-900">{booking.guest?.name || 'Unknown'}</div>
                    <div className="text-gray-500">{booking.guest?.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {format(new Date(booking.check_in_date), 'MMM d, yyyy')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {format(new Date(booking.check_out_date), 'MMM d, yyyy')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    ${booking.price.toLocaleString()}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {booking.notes || '-'}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onEdit(booking.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingList;