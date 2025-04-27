import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { sendBookingConfirmation } from '../lib/emailService';

interface Guest {
  id: string;
  name: string;
  email: string;
}

interface BookingFormProps {
  bookingId: string | null;
  onClose: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ bookingId, onClose }) => {
  const { user } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    guest_id: '',
    check_in_date: format(new Date(), 'yyyy-MM-dd'),
    check_out_date: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'), // Tomorrow
    price: 0,
    notes: '',
  });

  // Fetch guests for dropdown
  useEffect(() => {
    const fetchGuests = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('guests')
          .select('id, name, email')
          .eq('user_id', user.id);

        if (error) throw error;
        setGuests(data);
      } catch (error) {
        console.error('Error fetching guests:', error);
        toast.error('Failed to load guests');
      }
    };

    fetchGuests();
  }, [user]);

  // Fetch booking data if editing
  useEffect(() => {
    const fetchBookingData = async () => {
      if (!bookingId || !user) return;

      setFormLoading(true);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setFormData({
            guest_id: data.guest_id,
            check_in_date: format(new Date(data.check_in_date), 'yyyy-MM-dd'),
            check_out_date: format(new Date(data.check_out_date), 'yyyy-MM-dd'),
            price: data.price,
            notes: data.notes || '',
          });
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error('Failed to load booking data');
      } finally {
        setFormLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingId, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate form
    if (!formData.guest_id) {
      toast.error('Please select a guest');
      return;
    }

    if (!formData.check_in_date || !formData.check_out_date) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (new Date(formData.check_out_date) <= new Date(formData.check_in_date)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Price must be greater than zero');
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        guest_id: formData.guest_id,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        price: parseFloat(formData.price.toString()),
        notes: formData.notes,
        user_id: user.id,
      };

      let result;

      if (bookingId) {
        // Update existing booking
        result = await supabase
          .from('bookings')
          .update(bookingData)
          .eq('id', bookingId)
          .eq('user_id', user.id);
      } else {
        // Create new booking
        result = await supabase.from('bookings').insert(bookingData);
        
        // Send email notification for new booking
        if (!result.error) {
          // Find the guest details
          const guest = guests.find(g => g.id === formData.guest_id);
          if (guest) {
            try {
              await sendBookingConfirmation({
                guestName: guest.name,
                guestEmail: guest.email,
                checkInDate: formData.check_in_date,
                checkOutDate: formData.check_out_date,
                price: formData.price,
                hostEmail: user.email || '',
              });
            } catch (emailError) {
              console.error('Error sending email notification:', emailError);
              // Don't show error to user, as the booking was still created
            }
          }
        }
      }

      if (result.error) throw result.error;

      toast.success(bookingId ? 'Booking updated successfully' : 'Booking created successfully');
      onClose();
    } catch (error: any) {
      console.error('Error saving booking:', error);
      toast.error(error.message || 'Failed to save booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          {bookingId ? 'Edit Booking' : 'Create New Booking'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {bookingId ? 'Update the booking details below' : 'Fill in the booking information'}
        </p>
      </div>

      {formLoading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="guest_id" className="block text-sm font-medium text-gray-700">
              Guest
            </label>
            <select
              id="guest_id"
              name="guest_id"
              value={formData.guest_id}
              onChange={handleChange}
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Select a guest</option>
              {guests.map((guest) => (
                <option key={guest.id} value={guest.id}>
                  {guest.name}
                </option>
              ))}
            </select>
            {guests.length === 0 && (
              <p className="mt-1 text-sm text-red-500">
                No guests found. Please add a guest first.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="check_in_date" className="block text-sm font-medium text-gray-700">
                Check-in Date
              </label>
              <input
                type="date"
                name="check_in_date"
                id="check_in_date"
                value={formData.check_in_date}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="check_out_date" className="block text-sm font-medium text-gray-700">
                Check-out Date
              </label>
              <input
                type="date"
                name="check_out_date"
                id="check_out_date"
                value={formData.check_out_date}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price ($)
            </label>
            <input
              type="number"
              name="price"
              id="price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Add any notes about this booking"
            />
          </div>

          <div className="flex justify-end pt-4 space-x-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Saving...' : bookingId ? 'Update Booking' : 'Create Booking'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BookingForm;