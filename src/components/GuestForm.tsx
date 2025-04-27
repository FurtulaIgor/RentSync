import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface GuestFormProps {
  guestId: string | null;
  onClose: () => void;
}

const GuestForm: React.FC<GuestFormProps> = ({ guestId, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Fetch guest data if editing
  useEffect(() => {
    const fetchGuestData = async () => {
      if (!guestId || !user) return;

      setFormLoading(true);
      try {
        const { data, error } = await supabase
          .from('guests')
          .select('*')
          .eq('id', guestId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setFormData({
            name: data.name,
            email: data.email,
            phone: data.phone,
            notes: data.notes || '',
          });
        }
      } catch (error) {
        console.error('Error fetching guest:', error);
        toast.error('Failed to load guest data');
      } finally {
        setFormLoading(false);
      }
    };

    fetchGuestData();
  }, [guestId, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate form
    if (!formData.name) {
      toast.error('Please enter guest name');
      return;
    }

    if (!formData.email) {
      toast.error('Please enter guest email');
      return;
    }

    if (!formData.phone) {
      toast.error('Please enter guest phone number');
      return;
    }

    setLoading(true);

    try {
      const guestData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes || null,
        user_id: user.id,
      };

      let result;

      if (guestId) {
        // Update existing guest
        result = await supabase
          .from('guests')
          .update(guestData)
          .eq('id', guestId)
          .eq('user_id', user.id);
      } else {
        // Create new guest
        result = await supabase.from('guests').insert(guestData);
      }

      if (result.error) throw result.error;

      toast.success(guestId ? 'Guest updated successfully' : 'Guest created successfully');
      onClose();
    } catch (error: any) {
      console.error('Error saving guest:', error);
      toast.error(error.message || 'Failed to save guest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          {guestId ? 'Edit Guest' : 'Add New Guest'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {guestId ? 'Update the guest details below' : 'Fill in the guest information'}
        </p>
      </div>

      {formLoading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Full Name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="+1 (123) 456-7890"
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
              placeholder="Add any notes about this guest"
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
              {loading ? 'Saving...' : guestId ? 'Update Guest' : 'Add Guest'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default GuestForm;