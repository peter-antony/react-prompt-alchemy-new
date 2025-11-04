
import React, { useState } from 'react';
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

const COHubIcon = () => {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.6948 4.30617L15.6943 4.3057C15.0514 3.66276 13.9927 3.66343 13.3335 4.30523L13.3331 4.3057C12.8041 4.83463 12.7111 5.63146 13.0372 6.25204L11.5941 7.69519C11.2707 7.47536 10.9018 7.31611 10.4879 7.24586V5.2031C11.163 4.98479 11.6668 4.36873 11.6668 3.61684C11.6668 2.6966 10.9202 1.95 10 1.95C9.07975 1.95 8.33316 2.6966 8.33316 3.61684C8.33316 4.36873 8.837 4.98479 9.51211 5.2031V7.24612C9.11286 7.31644 8.73031 7.47541 8.40592 7.69521L6.96275 6.25204C7.28886 5.63146 7.19587 4.83463 6.66693 4.3057C6.04109 3.67986 4.93154 3.67986 4.3057 4.3057C3.66276 4.94864 3.66343 6.00731 4.30523 6.66646L4.3057 6.66693C4.61828 6.97952 5.03523 7.15316 5.48632 7.15316C5.7696 7.15316 6.01991 7.07347 6.251 6.96171L7.69519 8.4059C7.47536 8.72934 7.31611 9.09816 7.24586 9.51211H5.2031C4.98479 8.837 4.36873 8.33316 3.61684 8.33316C2.6966 8.33316 1.95 9.07975 1.95 10C1.95 10.9202 2.6966 11.6668 3.61684 11.6668C4.36873 11.6668 4.98479 11.163 5.2031 10.4879H7.24613C7.31644 10.8871 7.47541 11.2697 7.69521 11.5941L6.25175 13.0375C5.61601 12.7113 4.83506 12.8037 4.3057 13.3331C3.66276 13.976 3.66343 15.0347 4.30523 15.6938L4.3057 15.6943C4.63559 16.0242 5.05276 16.1805 5.48632 16.1805C5.91988 16.1805 6.33704 16.0242 6.66693 15.6943C7.19587 15.1654 7.28886 14.3685 6.96275 13.748L8.4059 12.3048C8.72934 12.5246 9.09816 12.6839 9.51211 12.7541V14.7969C8.837 15.0152 8.33316 15.6313 8.33316 16.3832C8.33316 17.3034 9.07975 18.05 10 18.05C10.9202 18.05 11.6668 17.3034 11.6668 16.3832C11.6668 15.6313 11.163 15.0152 10.4879 14.7969V12.7539C10.8871 12.6836 11.2697 12.5246 11.5941 12.3048L13.0372 13.748C12.7111 14.3685 12.8041 15.1654 13.3331 15.6943C13.663 16.0242 14.0801 16.1805 14.5137 16.1805C14.9472 16.1805 15.3644 16.0242 15.6943 15.6943C16.3372 15.0514 16.3366 13.9927 15.6948 13.3335L15.6943 13.3331C15.1654 12.8041 14.3685 12.7111 13.748 13.0372L12.3048 11.5941C12.5246 11.2707 12.6839 10.9018 12.7541 10.4879H14.7969C15.0152 11.163 15.6313 11.6668 16.3832 11.6668C17.3034 11.6668 18.05 10.9202 18.05 10C18.05 9.07975 17.3034 8.33316 16.3832 8.33316C15.6313 8.33316 15.0152 8.837 14.7969 9.51211H12.7539C12.6836 9.11286 12.5246 8.7303 12.3048 8.40592L13.7477 6.96306C13.9832 7.08993 14.2486 7.15316 14.5137 7.15316C14.9472 7.15316 15.3644 6.99683 15.6943 6.66693C16.3372 6.02399 16.3366 4.96532 15.6948 4.30617ZM14.0438 5.95622L14.0438 5.95621L14.0427 5.95517C13.778 5.70601 13.7762 5.26661 14.0275 4.99903C14.1534 4.87335 14.326 4.79526 14.5137 4.79526C14.6863 4.79526 14.8586 4.85777 15.0004 4.99957C15.2672 5.26636 15.2672 5.68943 15.0004 5.95622C14.7336 6.22301 14.3106 6.22301 14.0438 5.95622ZM3.61684 10.6742C3.24025 10.6742 2.94263 10.3766 2.94263 10C2.94263 9.6234 3.24025 9.32579 3.61684 9.32579C3.99344 9.32579 4.29105 9.6234 4.29105 10C4.29105 10.3766 3.99344 10.6742 3.61684 10.6742ZM9.32579 3.61684C9.32579 3.24025 9.6234 2.94263 10 2.94263C10.3766 2.94263 10.6742 3.24025 10.6742 3.61684C10.6742 3.99344 10.3766 4.29105 10 4.29105C9.6234 4.29105 9.32579 3.99344 9.32579 3.61684ZM4.99903 5.97253C4.73278 5.70571 4.73296 5.28302 4.99957 5.01641C5.12556 4.89042 5.29834 4.81211 5.48632 4.81211C5.67513 4.81211 5.83085 4.87419 5.97307 5.01641C6.23968 5.28302 6.23986 5.70571 5.9736 5.97253C5.70667 6.22319 5.26597 6.22319 4.99903 5.97253ZM5.97253 15.001C5.70571 15.2672 5.28302 15.267 5.01641 15.0004C4.74962 14.7336 4.74962 14.3106 5.01641 14.0438C5.1424 13.9178 5.31518 13.8395 5.50316 13.8395C5.67552 13.8395 5.84766 13.9018 5.98934 14.0432C6.22257 14.2927 6.22384 14.7334 5.97253 15.001ZM10.6742 16.3832C10.6742 16.7598 10.3766 17.0574 10 17.0574C9.6234 17.0574 9.32579 16.7598 9.32579 16.3832C9.32579 16.0066 9.6234 15.7089 10 15.7089C10.3766 15.7089 10.6742 16.0066 10.6742 16.3832ZM10 11.8195C9.00025 11.8195 8.18053 10.9998 8.18053 10C8.18053 9.00025 9.00025 8.18053 10 8.18053C10.9998 8.18053 11.8195 9.00025 11.8195 10C11.8195 10.9998 10.9998 11.8195 10 11.8195ZM15.001 14.0275C15.2672 14.2943 15.267 14.717 15.0004 14.9836C14.7336 15.2504 14.3106 15.2504 14.0438 14.9836C13.777 14.7168 13.777 14.2937 14.0438 14.0269C14.293 13.7777 14.7332 13.7761 15.001 14.0275ZM16.3832 10.6742C16.0066 10.6742 15.7089 10.3766 15.7089 10C15.7089 9.6234 16.0066 9.32579 16.3832 9.32579C16.7598 9.32579 17.0574 9.6234 17.0574 10C17.0574 10.3766 16.7598 10.6742 16.3832 10.6742Z"  fill="#475467" stroke="black" strokeWidth="0.1"  />
    </svg>
  )
}

const COIcon = () => {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.0833 6.06479L9.99997 9.99998M9.99997 9.99998L2.91664 6.06479M9.99997 9.99998L10 17.9167M17.5 13.3821V6.61788C17.5 6.33234 17.5 6.18957 17.4579 6.06224C17.4207 5.94959 17.3599 5.84619 17.2795 5.75895C17.1886 5.66033 17.0638 5.591 16.8142 5.45233L10.6475 2.02641C10.4112 1.89511 10.293 1.82946 10.1679 1.80372C10.0571 1.78094 9.94288 1.78094 9.83213 1.80372C9.70698 1.82946 9.58881 1.89511 9.35248 2.02641L3.18581 5.45233C2.93621 5.591 2.8114 5.66034 2.72053 5.75895C2.64013 5.84619 2.57929 5.94959 2.54207 6.06224C2.5 6.18957 2.5 6.33234 2.5 6.61788V13.3821C2.5 13.6677 2.5 13.8104 2.54207 13.9378C2.57929 14.0504 2.64013 14.1538 2.72053 14.2411C2.8114 14.3397 2.93621 14.409 3.18581 14.5477L9.35248 17.9736C9.58881 18.1049 9.70698 18.1705 9.83213 18.1963C9.94288 18.2191 10.0571 18.2191 10.1679 18.1963C10.293 18.1705 10.4112 18.1049 10.6475 17.9736L16.8142 14.5477C17.0638 14.409 17.1886 14.3397 17.2795 14.2411C17.3599 14.1538 17.4207 14.0504 17.4579 13.9378C17.5 13.8104 17.5 13.6677 17.5 13.3821Z" stroke="#475467" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const RFQIcon = () => {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.49998 8.75L9.16665 10.4167L12.9166 6.66667M16.6666 17.5V6.5C16.6666 5.09987 16.6666 4.3998 16.3942 3.86502C16.1545 3.39462 15.772 3.01217 15.3016 2.77248C14.7668 2.5 14.0668 2.5 12.6666 2.5H7.33331C5.93318 2.5 5.23312 2.5 4.69834 2.77248C4.22793 3.01217 3.84548 3.39462 3.6058 3.86502C3.33331 4.3998 3.33331 5.09987 3.33331 6.5V17.5L5.62498 15.8333L7.70831 17.5L9.99998 15.8333L12.2916 17.5L14.375 15.8333L16.6666 17.5Z" stroke="#475467" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}


interface AppSidebarProps {
  collapsed?: boolean;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed = false }) => {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  // const menuItems = [
  //   { icon: Home, label: 'Home', active: true, path: '/quick-order' },
  //   { icon: Package, label: 'Inventory', active: false, path: '/quick-order' },
  //   // { icon: IdCard, label: 'Quick Billing', active: false, path: '/quick-billing' },
  //   { icon: MapPinned, label: 'Route Management', active: false, path: '/trip-plans-search-hub' },
  //   { icon: Truck, label: 'Fleet Management', active: false, path: '/dynamic-panel-demo' },
  //   // { icon: Fence, label: 'Panel', active: false, path: '/dynamic-panel' },
  // ];

  const menuItems = [
    { icon: Home, label: 'Home', path: '', tooltip: 'Home' },
    { icon: COHubIcon, label: 'CO Hub', path: '/saasy-app/RailBr', externalURL: true, tooltip: 'CO Management' },  //  CO Management - sassy
    { icon: COIcon, label: 'Create Order', path: '/saasy-app/RailBrHUB', externalURL: true, tooltip: 'Create Order' }, // Create Order - sassy
    { icon: MenuIcon3, label: 'Route Management', path: '/trip-hub', tooltip: 'Manage Trip Plan' }, // Trip Planning
    { icon: MenuIcon2, label: 'Inventory', path: '/json-creater', tooltip: 'Quick Order Management' }, // Quick Order
    // { icon: MenuIcon4, label: 'Fleet Management', path: '/trp' }, 
    { icon: TripRouteIcon, label: 'Trip Route', path: '/trip-route', tooltip: 'Transport Route Update' }, // transport Route Update
    // { icon: COHubIcon, label: 'RFQ Hub', path: '/rfq-hub', tooltip: 'RFQ Hub' }, // RFQ Hub - sassy
    // { icon: RFQIcon, label: 'RFQ', path: '/rfq', tooltip: 'RFQ' }, // RFQ - sassy
  ];

  return (
    <div className="w-[60px] h-screen bg-white border-r border-gray-200 flex flex-col items-center py-4 fixed left-0 top-0">
      <div className="w-8 h-8 flex items-center justify-center mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M2.5 10H12.5M2.5 5H17.5M2.5 15H17.5" stroke="#475467" />
        </svg>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col flex-1 relative">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="relative flex items-center justify-center"
            onMouseEnter={() => setHoveredLabel(item.label)}
            onMouseLeave={() => setHoveredLabel(null)}
          >
            {item.externalURL ? (
              <a
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 mb-3 rounded-lg flex items-center justify-center transition-colors text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              >
                {typeof item.icon === 'string' ? (
                  <img src={item.icon} alt={item.label} />
                ) : (
                  <item.icon size={20} />
                )}
              </a>
            ) : (
              <NavLink
                to={item.path}
                end={item.path === '/'}
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
            )}


            {/* Tooltip */}
            {/* {hoveredLabel === item.label && (
              <div className="absolute left-full ml-2 bg-gray-800 text-white text-xs rounded px-2 py-1 shadow z-50 whitespace-nowrap">
                {item.tooltip}
                <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 left-[-4px] top-1/2 -translate-y-1/2" />
              </div>
            )} */}
          </div>
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