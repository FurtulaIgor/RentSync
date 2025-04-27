import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string | null;
}

interface GuestListProps {
  onEdit: (id: string) => void;
}

const GuestList: React.FC<GuestListProps> = ({ onEdit }) => {
  const { user } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchGuests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setGuests(data);
    } catch (error) {
      console.error('Error fetching guests:', error);
      toast.error('Failed to load guests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [user]);

  const handleDeleteGuest = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this guest? This will also delete any bookings associated with this guest.')) {
      try {
        const { error } = await supabase
          .from('guests')
          .delete()
          .eq('id', id)
          .eq('user_id', user?.id);

        if (error) throw error;

        toast.success('Guest deleted successfully');
        fetchGuests();
      } catch (error) {
        console.error('Error deleting guest:', error);
        toast.error('Failed to delete guest');
      }
    }
  };

  // Filter guests based on search term
  const filteredGuests = guests.filter((guest) => {
    const searchString = searchTerm.toLowerCase();
    return (
      guest.name.toLowerCase().includes(searchString) ||
      guest.email.toLowerCase().includes(searchString) ||
      guest.phone.includes(searchTerm) ||
      (guest.notes && guest.notes.toLowerCase().includes(searchString))
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
          placeholder="Search guests..."
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredGuests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm
              ? 'No guests match your search'
              : 'No guests found. Add your first guest!'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Name
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Phone
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
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {guest.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {guest.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {guest.phone}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {guest.notes || '-'}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onEdit(guest.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGuest(guest.id)}
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

export default GuestList;