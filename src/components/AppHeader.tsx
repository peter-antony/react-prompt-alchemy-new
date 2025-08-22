import React from 'react';
import { useNavigate } from "react-router-dom";
import { Settings, User, Filter, Download, MoreHorizontal, X } from 'lucide-react';
import { Button } from './ui/button';
import ProfilePic from '../assets/images/Ellipse-73.png';
import Logo from '../assets/images/logo.svg';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
import { authUtils } from '@/utils/auth';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "./ui/dialog";
import Moon from '../assets/images/moon-01.svg';
import Bell from '../assets/images/bell-01.svg';
import Search from '../assets/images/search-md.svg';

interface AppHeaderProps {
  onToggleSidebar?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const LogOut = () => {
    authUtils.removeToken();
    setOpen(false);
    navigate("/signout");
  }

  return (
    <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4">
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
            className="w-52 h-[28px] pl-4 pr-4 headerSearch searchBG rounded text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <img src={Search} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-800" />
          {/* <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-800" size={16} /> */}
        </div>

        {/* Action Icons */}
        <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          {/* <Moon size={20} /> */}
          <img src={Moon} alt='moon' className="" />
        </button>
        <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          <img src={Bell} alt='moon' className="" />
        </button>

        <div className="headerDivider bg-gray-300"></div>
        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="w-8 h-8 bg-purple-200 rounded-full cursor-pointer flex items-center justify-center border-2 border-white">
              <span className="text-xs font-bold text-purple-700">RA</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl shadow-lg">
            <div className="flex flex-col items-center pt-6 pb-4 px-6">
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mb-2">
                <span className="text-lg font-bold text-purple-700">RA</span>
              </div>
              <div className="font-bold text-lg mb-1">RAMCOUSER</div>
            </div>
            <div className="border-t px-6 py-3 flex items-center cursor-pointer hover:bg-gray-50 transition" onClick={() => setOpen(true)}>
              <span className="mr-2">↩️</span>
              <span className="text-gray-700 font-medium" onClick={() => LogOut()}>Logout</span>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* <Dialog open={open}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader className="flex items-center gap-3 mb-2">
              <DialogTitle className="text-lg font-semibold text-gray-800">
                Logout
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-gray-600 text-sm mb-6">
              Are you sure that you want to logout?
            </DialogDescription>
            <DialogFooter className="flex justify-end gap-2">
              <DialogTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </DialogTrigger>
              <Button>Logout</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog> */}
      </div>
    </header>
  );
};