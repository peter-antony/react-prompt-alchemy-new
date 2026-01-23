import React from 'react';
import { useNavigate } from "react-router-dom";
import { Settings, User, Filter, Download, MoreHorizontal, X, Fullscreen } from 'lucide-react';
import { Button } from './ui/button';
import ProfilePic from '../assets/images/Ellipse-73.png';
import Logo from '../assets/images/logo.svg';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
import { authUtils } from '@/utils/auth';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "./ui/dialog";
import Moon from '../assets/images/moon-01.svg';
import Bell from '../assets/images/bell-01.svg';
import Search from '../assets/images/search-md.svg';
import DropDown, { DropDownOption } from './ui/dropdown';
import { apiClient } from '@/api/client';
import { API_ENDPOINTS, setUserContext } from '@/api/config';

interface AppHeaderProps {
  onToggleSidebar?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<string | undefined>(undefined);
  const [selectedOU, setSelectedOU] = React.useState<string | undefined>(undefined);
  const [roleOptions, setRoleOptions] = React.useState<DropDownOption[]>([]);
  const [ouOptions, setOUOptions] = React.useState<DropDownOption[]>([]);
  const [contextApiResponse, setContextApiResponse] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [contextInitialized, setContextInitialized] = React.useState(false);

  // Initialize context from localStorage or API (only once per session)
  React.useEffect(() => {
    const initializeContext = async () => {
      try {
        setIsLoading(true);

        // Check if we already have user context data
        const existingUserInfo = localStorage.getItem('nebulaUserInfo');
        const existingSelectedContext = localStorage.getItem('selectedUserContext');

        if (existingUserInfo) {
          console.log('Using existing user context from localStorage');
          const parsedData = JSON.parse(existingUserInfo);
          setContextApiResponse(parsedData);

          // If user has already selected context, use it
          if (existingSelectedContext) {
            const selectedContext = JSON.parse(existingSelectedContext);
            setSelectedRole(selectedContext.roleName);
            setSelectedOU(selectedContext.ouId?.toString());
            console.log('Restored user selection:', selectedContext);
          }

          setContextInitialized(true);
          setIsLoading(false);
          return;
        }

        // Only call API if no data exists in localStorage
        console.log('Fetching user context from API (first time)');
        const token = JSON.parse(localStorage.getItem('token') || '{}');
        const response = await apiClient.get(API_ENDPOINTS.Context.CONTEXT, {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            'Content-Type': 'application/json',
            'context-lang-id': '1',
            'context-ou-id': '0',
            'context-role-name': '',
            'context-user-id': token.profile.name
          }
        });

        if (response?.data) {
          const data = response.data;
          setContextApiResponse(data);
          localStorage.setItem('ForwardisUserInfo', JSON.stringify(data));
          setContextInitialized(true);
          console.log('User context fetched and stored');
        } else {
          console.error('Failed to fetch user context:', response?.status);
        }
      } catch (error) {
        console.error('Error while fetching the user context:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only initialize once per session
    if (!contextInitialized) {
      initializeContext();
    }
  }, [contextInitialized]);

  // Set up role options when context data is available
  React.useEffect(() => {
    if (!contextApiResponse?.data || !contextInitialized) return;

    const userData = contextApiResponse.data;

    if (userData && userData.roles) {
      const roles = userData.roles.map(role => ({
        label: role.description,
        value: role.name
      }));
      setRoleOptions(roles);

      // Only set defaults if user hasn't made a selection yet
      if (!selectedRole && userData.userDefaults && userData.userDefaults.roleName) {
        setSelectedRole(userData.userDefaults.roleName);
        console.log('Set default role:', userData.userDefaults.roleName);
      }
    }
  }, [contextApiResponse, contextInitialized, selectedRole]);

  // Set up OU options when role is selected
  React.useEffect(() => {
    if (!contextApiResponse?.data || !selectedRole || !contextInitialized) return;

    const userData = contextApiResponse.data;
    const selectedRoleData = userData.roles.find(role => role.name === selectedRole);

    if (selectedRoleData && selectedRoleData.ous) {
      const ous = selectedRoleData.ous.map(ou => ({
        label: ou.description,
        value: ou.id.toString()
      }));
      setOUOptions(ous);

      // Only set default OU if user hasn't made a selection yet
      if (!selectedOU) {
        if (userData.userDefaults &&
          userData.userDefaults.roleName === selectedRole &&
          userData.userDefaults.ouId) {
          setSelectedOU(userData.userDefaults.ouId.toString());
          console.log('Set default OU:', userData.userDefaults.ouId);
        } else if (selectedRoleData.ous.length > 0) {
          setSelectedOU(selectedRoleData.ous[0].id.toString());
          console.log('Set first available OU:', selectedRoleData.ous[0].id);
        }
      }
    } else {
      setOUOptions([]);
      if (!selectedOU) {
        setSelectedOU("");
      }
    }
  }, [selectedRole, contextApiResponse, contextInitialized, selectedOU]);

  // Save user context whenever role and OU are both selected
  React.useEffect(() => {
    if (selectedRole && selectedOU && contextApiResponse?.data && contextInitialized) {
      const userData = contextApiResponse.data;
      const selectedRoleData = userData.roles.find(role => role.name === selectedRole);
      if (selectedRoleData) {
        const selectedOUData = selectedRoleData.ous.find(ou => ou.id.toString() === selectedOU);
        if (selectedOUData) {
          // Use the setUserContext function from config.ts
          setUserContext(selectedOUData.id, selectedRole, selectedOUData.description);
          console.log('User context saved:', {
            ouId: selectedOUData.id,
            roleName: selectedRole,
            ouDescription: selectedOUData.description
          });
        }
      }
    }
  }, [selectedRole, selectedOU, contextApiResponse, contextInitialized]);

  const handleRoleChange = (value: string | string[] | undefined) => {
    const roleValue = value as string;
    setSelectedRole(roleValue);
    setSelectedOU(""); // Reset OU when role changes
    console.log('Role changed to:', roleValue);
  };

  const handleOUChange = (value: string | string[] | undefined) => {
    const ouValue = value as string;
    const previousOU = selectedOU;
    setSelectedOU(ouValue);
    console.log('OU changed from:', previousOU, 'to:', ouValue);

    // Reload page when OU is actually changed (not initial load)
    if (previousOU && previousOU !== ouValue && contextInitialized) {
      console.log('OU switched - reloading page to refresh context');
      // Small delay to ensure context is saved before reload
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };
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
              <span className="text-xs font-bold text-purple-700">
                {contextApiResponse?.data?.name?.substring(0, 2)?.toUpperCase() || 'RA'}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="p-0 rounded-xl shadow-lg w-[13.875rem]"
          >
            <div className='p-4'>
              <div className="row">
                <div className='col-md-12 col-xl-12 col-lg-12'>
                  <div className="align-items-center justify-content-center d-flex">
                    <span className='w-24 h-24 bg-purple-200 rounded-full'>
                      {contextApiResponse?.data?.name?.substring(0, 2)?.toUpperCase() || 'RA'}
                    </span>
                    <span className="ml-2" style={{ fontSize: '13px', fontWeight: '600' }}>
                      {contextApiResponse?.data?.fullName || 'Loading...'}
                    </span>
                  </div>
                </div>
              </div>
              <div className='row mt-3'>
                <div className='col-md-12 col-xl-12 col-lg-12 mb-2'>
                  <DropDown
                    options={roleOptions}
                    id="Role-dropdown"
                    value={selectedRole}
                    placeholder={isLoading ? "Loading roles..." : "Select a Role"}
                    multiSelect={false}
                    searchable={true}
                    size='medium'
                    hideCaption={true}
                    caption='Role'
                    tooltip="Choose from available roles"
                    onChange={handleRoleChange}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className='row mt-3'>
                <div className='col-md-12 col-xl-12 col-lg-12 mb-2'>
                  <DropDown
                    id="Organization-dropdown"
                    options={ouOptions}
                    value={selectedOU}
                    placeholder={isLoading ? "Loading organizations..." : "Select an Organization"}
                    multiSelect={false}
                    searchable={true}
                    size='medium'
                    hideCaption={true}
                    caption='Organization'
                    tooltip="Choose from available organizations"
                    onChange={handleOUChange}
                    className="w-full"
                    disabled={isLoading || !selectedRole || ouOptions.length === 0}
                  />
                </div>
              </div>
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