
import React from 'react';
import { Search, Bell, Settings, User, Filter, Download, MoreHorizontal, Moon } from 'lucide-react';
import { Button } from './ui/button';
import ProfilePic from '../assets/images/Ellipse-73.png';
import Logo from '../assets/images/logo.svg';

interface AppHeaderProps {
  onToggleSidebar?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left side - Logo and Title */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <img src={Logo} alt='Logo' className="" />
          <span className="text-lg font-bold blue-gray-800">Logistics</span>
        </div>
      </div>
      
      {/* Right side - Search and Actions */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <input
            name='global-search-input'
            type="text"
            placeholder="Search"
            className="w-64 h-10 pl-4 pr-4 searchBG font-color-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600" size={20} />
        </div>
        
        {/* Action Icons */}
        <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          <Moon size={20} />
        </button>
        <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          <Bell size={20} />
        </button>
        
        <div className="headerDivider bg-gray-300"></div>
        {/* Profile */}
        <div className="w-8 h-8 bg-gray-300 rounded-full">
          <img src={ProfilePic} alt="Logo" className="profilePic"/>
        </div>
      </div>
    </header>
  );
};