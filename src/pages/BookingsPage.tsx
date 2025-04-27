import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookingCalendar from '../components/BookingCalendar';
import BookingList from '../components/BookingList';
import BookingForm from '../components/BookingForm';
import { Plus } from 'lucide-react';

const BookingsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<'calendar' | 'list'>('list');
  const [showForm, setShowForm] = useState(false);
  const [editBookingId, setEditBookingId] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's a booking ID in the URL params
    const bookingId = searchParams.get('id');
    if (bookingId) {
      setEditBookingId(bookingId);
      setShowForm(true);
    }
  }, [searchParams]);

  const handleAddBooking = () => {
    setEditBookingId(null);
    setShowForm(true);
  };

  const handleEditBooking = (id: string) => {
    setEditBookingId(id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditBookingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <div className="flex space-x-2">
          <div className="flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                view === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setView('list')}
            >
              List
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                view === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setView('calendar')}
            >
              Calendar
            </button>
          </div>
          <button
            onClick={handleAddBooking}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Booking
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="bg-white rounded-lg shadow">
        {view === 'calendar' ? (
          <BookingCalendar onSelectBooking={handleEditBooking} />
        ) : (
          <BookingList onEdit={handleEditBooking} />
        )}
      </div>

      {/* Booking form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCloseForm}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <BookingForm bookingId={editBookingId} onClose={handleCloseForm} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;