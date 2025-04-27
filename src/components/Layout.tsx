import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={toggleSidebar}
      >
        <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
      </div>

      {/* Sidebar component */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={toggleSidebar} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm lg:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
            >
              <Menu size={24} />
            </button>
            <div className="text-xl font-semibold text-blue-600">RentSync</div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;