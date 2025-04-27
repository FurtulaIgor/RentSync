import React, { useState } from 'react';
import GuestList from '../components/GuestList';
import GuestForm from '../components/GuestForm';
import { Plus } from 'lucide-react';

const GuestsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editGuestId, setEditGuestId] = useState<string | null>(null);

  const handleAddGuest = () => {
    setEditGuestId(null);
    setShowForm(true);
  };

  const handleEditGuest = (id: string) => {
    setEditGuestId(id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditGuestId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Guests</h1>
        <button
          onClick={handleAddGuest}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Guest
        </button>
      </div>

      {/* Main content area */}
      <div className="bg-white rounded-lg shadow">
        <GuestList onEdit={handleEditGuest} />
      </div>

      {/* Guest form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCloseForm}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <GuestForm guestId={editGuestId} onClose={handleCloseForm} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestsPage;