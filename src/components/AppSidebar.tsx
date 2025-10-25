
import React from 'react';
import { Home, Calendar, Package, Truck, Users, IdCard, Fence, BarChart3, Settings, MapPinned, HelpCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import MenuIcon2 from '../assets/images/Menu-2.svg';
import MenuIcon3 from '../assets/images/Menu-3.svg';
import MenuIcon4 from '../assets/images/Menu-4.svg';

const TripRouteIcon = () => {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.58171 3.16504H8.9437C11.4831 3.16504 12.7528 3.16504 13.2347 3.62111C13.6514 4.01535 13.836 4.59611 13.7235 5.15855C13.5934 5.80922 12.5568 6.54242 10.4836 8.00881L7.09647 10.4046C5.02329 11.871 3.9867 12.6042 3.85657 13.2549C3.74409 13.8173 3.92872 14.3981 4.34534 14.7923C4.82732 15.2484 6.097 15.2484 8.63637 15.2484H9.41504M5.66504 3.16504C5.66504 4.54575 4.54575 5.66504 3.16504 5.66504C1.78433 5.66504 0.665039 4.54575 0.665039 3.16504C0.665039 1.78433 1.78433 0.665039 3.16504 0.665039C4.54575 0.665039 5.66504 1.78433 5.66504 3.16504ZM17.3317 14.8317C17.3317 16.2124 16.2124 17.3317 14.8317 17.3317C13.451 17.3317 12.3317 16.2124 12.3317 14.8317C12.3317 13.451 13.451 12.3317 14.8317 12.3317C16.2124 12.3317 17.3317 13.451 17.3317 14.8317Z" stroke="#475467" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


interface AppSidebarProps {
  collapsed?: boolean;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed = false }) => {
  // const menuItems = [
  //   { icon: Home, label: 'Home', active: true, path: '/quick-order' },
  //   { icon: Package, label: 'Inventory', active: false, path: '/quick-order' },
  //   // { icon: IdCard, label: 'Quick Billing', active: false, path: '/quick-billing' },
  //   { icon: MapPinned, label: 'Route Management', active: false, path: '/trip-plans-search-hub' },
  //   { icon: Truck, label: 'Fleet Management', active: false, path: '/dynamic-panel-demo' },
  //   // { icon: Fence, label: 'Panel', active: false, path: '/dynamic-panel' },
  // ];

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    // { icon: Package, label: 'Inventory', path: '/quick-order' },
    // { icon: MenuIcon2, label: 'Inventory', path: '/quick-order' },
    { icon: MenuIcon2, label: 'Inventory', path: '/json-creater' },
    { icon: MenuIcon3, label: 'Route Management', path: '/trip-hub' },
    { icon: MenuIcon4, label: 'Fleet Management', path: '/trp' },
    { icon: TripRouteIcon, label: 'Trip Route', path: '/trip-route' },
  ];

  return (
    <div className="w-[60px] h-screen bg-white border-r border-gray-200 flex flex-col items-center py-4 fixed left-0 top-0">
      <div className="w-8 h-8 flex items-center justify-center mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M2.5 10H12.5M2.5 5H17.5M2.5 15H17.5" stroke="#475467" />
        </svg>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col flex-1">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path} end={item.path === '/'}
            className={({ isActive }) =>
              `w-9 h-9 mb-3 rounded-lg flex items-center justify-center transition-colors 
            ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`
            }
          >
            {typeof item.icon === 'string' ? (
              <img src={item.icon} alt={item.label} />
            ) : (
              <item.icon size={20} />
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col space-y-3 mt-auto">
        <button className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};