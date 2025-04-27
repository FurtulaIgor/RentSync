import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  BarChart2, 
  LogOut, 
  X 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface SidebarProps {
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 flex items-center justify-between border-b">
        <div className="font-bold text-2xl text-blue-600">RentSync</div>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          <li>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={onClose}
            >
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/bookings" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={onClose}
            >
              <Calendar className="mr-3 h-5 w-5" />
              Bookings
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/guests" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={onClose}
            >
              <Users className="mr-3 h-5 w-5" />
              Guests
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/statistics" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={onClose}
            >
              <BarChart2 className="mr-3 h-5 w-5" />
              Statistics
            </NavLink>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;