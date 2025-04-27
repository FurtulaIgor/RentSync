import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

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

interface BookingCalendarProps {
  onSelectBooking: (id: string) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ onSelectBooking }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, guest:guests(name)')
          .eq('user_id', user.id);

        if (error) throw error;
        setBookings(data as Booking[]);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  // Find bookings for the selected date
  const selectedDateBookings = selectedDate
    ? bookings.filter((booking) => {
        const checkIn = new Date(booking.check_in_date);
        const checkOut = new Date(booking.check_out_date);
        const selected = new Date(selectedDate);
        
        // Reset time part for comparison
        selected.setHours(0, 0, 0, 0);
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);
        
        return selected >= checkIn && selected <= checkOut;
      })
    : [];

  // Function to check if a date has bookings
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;

    date.setHours(0, 0, 0, 0);
    
    const hasBooking = bookings.some((booking) => {
      const checkIn = new Date(booking.check_in_date);
      const checkOut = new Date(booking.check_out_date);
      
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      
      return date >= checkIn && date <= checkOut;
    });

    return hasBooking ? (
      <div className="h-2 w-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
    ) : null;
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="calendar-container">
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={tileContent}
                className="w-full border rounded-lg shadow-sm p-4 bg-white"
              />
            )}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedDate
                ? `Bookings for ${format(selectedDate, 'MMMM d, yyyy')}`
                : 'Select a date'}
            </h3>
            {selectedDateBookings.length === 0 ? (
              <p className="text-gray-500">No bookings for this date</p>
            ) : (
              <div className="space-y-4">
                {selectedDateBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white p-4 rounded-md shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onSelectBooking(booking.id)}
                  >
                    <div className="font-medium text-gray-900">
                      {booking.guest?.name || 'Unknown Guest'}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Check-in: {format(new Date(booking.check_in_date), 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500">
                      Check-out: {format(new Date(booking.check_out_date), 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm font-medium text-blue-600 mt-2">
                      ${booking.price.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;