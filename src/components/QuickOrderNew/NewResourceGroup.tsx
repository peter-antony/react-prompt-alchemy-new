import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ResourceGroupDetailsForm from './ResourceGroupDetails';
import { SideDrawer } from '../Common/SideDrawer';
import AddIcon from '../../assets/images/addIcon.png';
import CardDetails, { CardDetailsItem } from '../Common/Card-View-Details';
import { Input } from '@/components/ui/input';
import jsonStore from '@/stores/jsonStore';

interface NewResourceGroupProps {
  onAddResource: () => void;
  isEditQuickOrder?: boolean;
}

const NewResourceGroup = ({ onAddResource, isEditQuickOrder }: NewResourceGroupProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMoreInfoOpen, setMoreInfoOpen] = useState(false);
  const [isBack, setIsBack] = useState(true);
  const [resourceData, setResourceData] = useState<any[]>([]); // <-- resourceData state
  // const cardData: CardDetailsItem[] = [
  //   {
  //     id: "R01",
  //     title: "R01 - Wagon Rentals",
  //     subtitle: "Vehicle",
  //     wagons: "10 Wagons",
  //     price: "€ 45595.00",
  //     trainType: "Block Train Conventional",
  //     repairType: "Repair",
  //     date: "12-Mar-2025 to 12-Mar-2025",
  //     rateType: "Rate Per Unit-Buy Sell",
  //     location: "Frankfurt Station A - Frankfurt Station B",
  //     draftBill: "DB/000234",
  //     status: "Approved",


  //   },
  //   {
  //     id: "R02",
  //     title: "R02 - Wagon Rentals",
  //     subtitle: "Vehicle",
  //     wagons: "10 Wagons",
  //     price: "€ 45595.00",
  //     trainType: "Block Train Conventional",
  //     repairType: "Repair",
  //     date: "12-Mar-2025 to 12-Mar-2025",
  //     rateType: "Rate Per Unit-Buy Sell",
  //     location: "Frankfurt Station A - Frankfurt Station B",
  //     draftBill: "DB/000234",
  //     status: "Failed",
  //   }
  // ];
  const [isResourceData, setIsResourceData] = useState(false);
  const openResourceGroup = () => {
    setMoreInfoOpen(true);
  }
  const closeResource = () => {
    setMoreInfoOpen(false);
    setIsBack(true);
    const resourceGroups = jsonStore.getAllResourceGroups();
     if (resourceGroups.length > 0) {
      setIsResourceData(true);
      setResourceData(resourceGroups);
    }
  }

  useEffect(() => {
    const resourceGroups = jsonStore.getAllResourceGroups();
    if (resourceGroups.length > 0) {
      setIsResourceData(true);
      setResourceData(resourceGroups);
    }
    // if (isEditQuickOrder) {
    // }
  }, [isResourceData]);

  return (
    <>
      {(!isEditQuickOrder && !isResourceData) ?
        <div className="rounded-lg p-8 flex flex-col items-center justify-center h-full">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {/* <Plus className="w-10 h-10 text-blue-500" /> */}
            <img src={AddIcon} alt='Add' className="w-20 h-20" />
          </div>

          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            No Resource Group Have been Added
          </h3>

          <p className="text-gray-500 text-center mb-6 text-sm">
            Click the "add" button to create a new resource group.
          </p>

          <Button onClick={openResourceGroup} className="bg-blue-600 hover:bg-blue-700">
            {/* <Plus className="w-4 h-4 mr-2" /> */}
            Add
          </Button>
        </div>
        :
        <div className="">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Resource Group Details
              <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">3</span>
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  name='grid-search-input'
                  placeholder="Search"
                  className="border border-gray-300 rounded text-sm placeholder-gray-400 px-2 py-1 pl-3 w-64 h-9 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ width: 200 }}
                />
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
              </div>
              <Button onClick={openResourceGroup} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 bg-gray-100 text-gray-600 p-0 border border-gray-300">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <CardDetails data={resourceData} isEditQuickOrder={isEditQuickOrder} />
          </div>
        </div>
      }




      <SideDrawer isOpen={isMoreInfoOpen} onClose={() => closeResource()} width="100%" title="Resource Group Details" isBack={isBack}>
        <div className="text-sm text-gray-600">
          <ResourceGroupDetailsForm
            isEditQuickOrder={isEditQuickOrder}
            onSaveSuccess={closeResource} // <-- Pass the close function
          />
        </div>
      </SideDrawer>

      {/* <ResourceGroupDetailsForm /> */}
      {/* <ResourceGroupDetailsForm open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} /> */}
    </>
  );
};

export default NewResourceGroup;
