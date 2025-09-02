import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react'; // Import X icon

interface ResourceGroupSearchProps {
  resourceGroups: any[];
  onSearch: (filteredGroups: any[]) => void;
}

const ResourceGroupSearch: React.FC<ResourceGroupSearchProps> = ({ resourceGroups, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (searchTerm.length >= 3 || searchTerm === '') {
      if (searchTerm === '') {
        onSearch(resourceGroups);
        return;
      }

      const lowerCaseSearchTerm = searchTerm.toLowerCase();

      const filtered = resourceGroups.filter(group => {
        // Check top-level properties
        const matchesTopLevel = Object.values(group).some(value =>
          String(value).toLowerCase().includes(lowerCaseSearchTerm)
        );
        if (matchesTopLevel) return true;

        // Check BasicDetails (if available)
        if (group.BasicDetails && Array.isArray(group.BasicDetails)) {
          const matchesBasicDetails = group.BasicDetails.some((detail: any) =>
            Object.values(detail).some(detailValue =>
              String(detailValue).toLowerCase().includes(lowerCaseSearchTerm)
            )
          );
          if (matchesBasicDetails) return true;
        }

        // Check PlanDetails (if available)
        if (group.PlanDetails && Array.isArray(group.PlanDetails)) {
          const matchesPlanDetails = group.PlanDetails.some((detail: any) =>
            Object.values(detail).some(detailValue =>
              String(detailValue).toLowerCase().includes(lowerCaseSearchTerm)
            )
          );
          if (matchesPlanDetails) return true;
        }

        // Check BillingDetails (if available)
        if (group.BillingDetails && Array.isArray(group.BillingDetails)) {
          const matchesBillingDetails = group.BillingDetails.some((detail: any) =>
            Object.values(detail).some(detailValue =>
              String(detailValue).toLowerCase().includes(lowerCaseSearchTerm)
            )
          );
          if (matchesBillingDetails) return true;
        }

        // Check OperationalDetails (if available)
        if (group.OperationalDetails && Array.isArray(group.OperationalDetails)) {
          const matchesOperationalDetails = group.OperationalDetails.some((detail: any) =>
            Object.values(detail).some(detailValue =>
              String(detailValue).toLowerCase().includes(lowerCaseSearchTerm)
            )
          );
          if (matchesOperationalDetails) return true;
        }

        return false;
      });
      onSearch(filtered);
    }
  }, [searchTerm, resourceGroups, onSearch]);

  return (
    <div className="relative">
      <Input
        name='resource-group-search-input'
        placeholder="Search"
        className="border border-gray-300 rounded text-sm placeholder-gray-400 px-2 py-1 pl-3 w-64 h-9 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        style={{ width: 200, paddingRight: searchTerm ? 30 : 10 }} // Adjust padding to make space for the X icon
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm ? (
        <X
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600 cursor-pointer"
          onClick={() => setSearchTerm('')}
        />
      ) : (
        <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
      )}
    </div>
  );
};

export default ResourceGroupSearch;
