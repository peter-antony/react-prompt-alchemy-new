import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";
import { Calendar } from "../ui/calendar";
import { SimpleDropDown } from "../Common/SimpleDropDown";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Search } from 'lucide-react';

// Dummy data for dropdowns
const wagonGroups = [
  { id: 1, name: "Group A", seqNo: 1, default: "Y", description: "Group A" },
  { id: 2, name: "Group B", seqNo: 2, default: "N", description: "Group B" },
];
const containerGroups = [
  {
    id: 1,
    name: "Container X",
    seqNo: 1,
    default: "Y",
    description: "Container X",
  },
  {
    id: 2,
    name: "Container Y",
    seqNo: 2,
    default: "N",
    description: "Container Y",
  },
];
const products = [
  {
    id: 1,
    name: "Product 1",
    seqNo: 1,
    default: "Y",
    description: "Product 1",
  },
  {
    id: 2,
    name: "Product 2",
    seqNo: 2,
    default: "N",
    description: "Product 2",
  },
];
const activities = ["Loading", "Unloading", "Inspection"];
const productWeightUnits = ["Ton", "Kg", "Lbs"];

export const BulkUpdatePlanActuals: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  // State for all fields
  const [plannedDate, setPlannedDate] = useState<Date | undefined>(new Date());
  const [revisedPlannedDate, setRevisedPlannedDate] = useState<
    Date | undefined
  >(new Date());
  const [actualDate, setActualDate] = useState<Date | undefined>(new Date());
  const [activity, setActivity] = useState(activities[0]);
  const [activityLocation, setActivityLocation] = useState("");
  const [wagonGroup, setWagonGroup] = useState(wagonGroups[0].description);
  const [containerGroup, setContainerGroup] = useState(
    containerGroups[0].description
  );
  const [product, setProduct] = useState(products[0].description);
  const [productWeightUnit, setProductWeightUnit] = useState(
    productWeightUnits[0]
  );
  const [productWeight, setProductWeight] = useState("");
  const [wagon, setWagon] = useState("");
  const [container, setContainer] = useState("");

  return (
    <>
      <form className="flex flex-col h-full">
        <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4 bg-gray-50 px-4 py-4">
          {/* Planned Date and Time */}
          <div>
            <Label>Planned Date and Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal relative",
                    !plannedDate && "text-muted-foreground"
                  )}
                >
                  {plannedDate ? format(plannedDate, "dd/MM/yyyy") : "Select date"}
                  <CalendarIcon className="mr-2 h-4 w-4 absolute right-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={plannedDate}
                  onSelect={setPlannedDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* Revised Planned Date and Time */}
          <div>
            <Label>Revised Planned Date and Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal relative",
                    !revisedPlannedDate && "text-muted-foreground"
                  )}
                >
                  {revisedPlannedDate ? format(revisedPlannedDate, "dd/MM/yyyy") : "Select date"}
                  <CalendarIcon className="mr-2 h-4 w-4 absolute right-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={revisedPlannedDate}
                  onSelect={setRevisedPlannedDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* Actual Date and Time */}
          <div>
            <Label>Actual Date and Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal relative",
                    !actualDate && "text-muted-foreground"
                  )}
                >
                  {actualDate ? format(actualDate, "dd/MM/yyyy") : "Select date"}
                  <CalendarIcon className="mr-2 h-4 w-4 absolute right-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={actualDate}
                  onSelect={setActualDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* Activity */}
          <div>
            <Label>Activity</Label>
            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger>
                <SelectValue placeholder="Select Activity" />
              </SelectTrigger>
              <SelectContent>
                {activities.map((act) => (
                  <SelectItem key={act} value={act}>
                    {act}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Activity Location */}
          <div className="col-span-2">
            <Label>Activity Location</Label>
            <div className="relative">
              <Input
                type="search"
                placeholder="Search Location"
                value={activityLocation}
                onChange={(e) => setActivityLocation(e.target.value)}
                className="h-8 text-xs border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-8"
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
          {/* Wagon Group */}
          <div>
            <Label>Wagon Group</Label>
            <SimpleDropDown
              list={wagonGroups}
              value={wagonGroup}
              onValueChange={setWagonGroup}
            />
          </div>
          {/* Container Group */}
          <div>
            <Label>Container Group</Label>
            <SimpleDropDown
              list={containerGroups}
              value={containerGroup}
              onValueChange={setContainerGroup}
            />
          </div>
          {/* Product */}
          <div>
            <Label>Product</Label>
            <SimpleDropDown
              list={products}
              value={product}
              onValueChange={setProduct}
            />
          </div>
          {/* Product Weight */}
          <div>
            <Label>Product Weight</Label>
            <div className="flex gap-2 items-center">
              <select
                value={productWeightUnit}
                onChange={e => setProductWeightUnit(e.target.value)}
                className="h-8 px-2 text-xs rounded-md border border-gray-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {productWeightUnits.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              <Input
                type="number"
                placeholder="Enter Weight"
                value={productWeight}
                onChange={e => setProductWeight(e.target.value)}
                className="h-8 text-xs border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                step="0.01"
              />
            </div>
          </div>
          {/* Wagon */}
          <div>
            <Label>Wagon</Label>
            <Input
              type="text"
              placeholder="Enter Wagon"
              value={wagon}
              onChange={(e) => setWagon(e.target.value)}
            />
          </div>
          {/* Container */}
          <div>
            <Label>Container</Label>
            <Input
              type="text"
              placeholder="Enter Container"
              value={container}
              onChange={(e) => setContainer(e.target.value)}
            />
          </div>
        </div>
        <div className="flex bg-white justify-end w-full px-4 border-t border-gray-300">
          <Button type="button" onClick={() => onClose()} className="bg-blue-600 my-2 text-white px-6 py-2 rounded font-medium">
            Default Details
          </Button>
        </div>
        {/* <div className="w-full bg-white border-t flex justify-end space-x-3 absolute bottom-0 px-6 py-2">
          <Button
            type="button"
            className="bg-blue-600 text-white rounded my-2 hover:bg-blue-700"
            onClick={() => onClose()}
          >
            Default Details
          </Button>
        </div> */}
      </form>
    </>
  );
};

export default BulkUpdatePlanActuals;
