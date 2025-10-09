import React from 'react';
import { Banknote, MapPin, TramFront, UserRound } from 'lucide-react';
import { TripUserIcon, TramFrontSVG, TripCurrencyIcon, TripTrainIcon } from './TripIcons';
import { manageTripStore } from '@/stores/mangeTripStore';

export const TripDetailsForm = () => {
  const { tripData } = manageTripStore();
  const { Header } = tripData || {};

  return (
    <div className="space-y-6 mb-6">
      {/* Trip Information Grid */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="flex items-center gap-2">
              <TripUserIcon />
              {Header?.Customer?.map((customer, index) => (
                <span key={index} title={customer?.CustomerName}>{customer?.CustomerID}</span>
              ))}
            </span>
          </div>
          <div>
            <span className="flex items-center gap-2">
              <TramFrontSVG />
              <span>{Header?.TrainNo}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="flex items-center gap-2">
              <TripCurrencyIcon />
              <span>€ {Header?.UpdatedBillingValue}</span>
            </span>
          </div>
          <div>
            <span className="flex items-center gap-2">
              <TripTrainIcon />
              <span>{Header?.TransportMode}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="flex items-center gap-2">
              <MapPin size={18} color="#0068CF" strokeWidth={1.2} />
              <span className='truncate' title={Header?.ArrivalPointDescription}>{Header?.ArrivalPointDescription}</span>
            </span>
          </div>
          <div>
            <span className="flex items-center gap-2">
              <MapPin size={18} color="#D92D20" strokeWidth={1.2} />
              <span className="truncate" title={Header?.DeparturePointDescription}>{Header?.DeparturePointDescription}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Trip Type Radio */}
      {/* <div className="space-y-3">
        <Label className="text-sm font-medium">Trip Type</Label>
        <RadioGroup defaultValue="one-way" className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="one-way" id="one-way" />
            <Label htmlFor="one-way" className="text-sm font-normal cursor-pointer">One Way</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="round-trip" id="round-trip" />
            <Label htmlFor="round-trip" className="text-sm font-normal cursor-pointer">Round Trip</Label>
          </div>
        </RadioGroup>
      </div> */}

      {/* Form Fields */}
      {/* <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="train-no" className="text-sm font-medium">Train No.</Label>
            <Input id="train-no" placeholder="Enter Train No." className="h-9" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cluster" className="text-sm font-medium">Cluster</Label>
            <Select>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="10000406" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10000406">10000406</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier-ref" className="text-sm font-medium">Supplier Ref. No.</Label>
          <Input id="supplier-ref" placeholder="Enter Supplier Ref. No." className="h-9" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="qc-userdefined" className="text-sm font-medium">QC Userdefined 1</Label>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="w-16 h-9">
                <SelectValue placeholder="QC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qc">QC</SelectItem>
              </SelectContent>
            </Select>
            <Input id="qc-userdefined" placeholder="Enter Value" className="flex-1 h-9" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="remarks" className="text-sm font-medium">Remarks 1</Label>
          <Textarea id="remarks" placeholder="Enter Remarks" className="min-h-[80px] resize-none" />
        </div>
      </div> */}
    </div>
  );
};