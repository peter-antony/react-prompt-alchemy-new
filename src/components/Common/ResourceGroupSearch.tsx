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

        // Check BasicDetails (object)
        if (group.BasicDetails && typeof group.BasicDetails === 'object') {
          const matchesBasicDetails = Object.values(group.BasicDetails).some(detailValue =>
            String(detailValue).toLowerCase().includes(lowerCaseSearchTerm)
          );
          if (matchesBasicDetails) return true;
        }
        
        // Check OperationalDetails (object)
        if (group.OperationalDetails && typeof group.OperationalDetails === 'object') {
          const matchesOperationalDetails = Object.values(group.OperationalDetails).some(detailValue =>
            String(detailValue).toLowerCase().includes(lowerCaseSearchTerm)
          );
          if (matchesOperationalDetails) return true;
        }

        // Check BillingDetails (object)
        if (group.BillingDetails && typeof group.BillingDetails === 'object') {
          const matchesBillingDetails = Object.values(group.BillingDetails).some(detailValue =>
            String(detailValue).toLowerCase().includes(lowerCaseSearchTerm)
          );
          if (matchesBillingDetails) return true;
        }
        // Check MoreRefDocs (object)
        if (group.MoreRefDocs && typeof group.MoreRefDocs === 'object') {
          const matchesMoreRefDocs = Object.values(group.MoreRefDocs).some(detailValue =>
            String(detailValue).toLowerCase().includes(lowerCaseSearchTerm)
          );
          if (matchesMoreRefDocs) return true;
        }

        // Check PlanDetails (array of objects)
        if (group.PlanDetails && Array.isArray(group.PlanDetails)) {
          const matchesPlanDetails = group.PlanDetails.some(detail =>
            Object.values(detail).some(detailValue =>
              String(detailValue).toLowerCase().includes(lowerCaseSearchTerm)
            )
          );
          if (matchesPlanDetails) return true;
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
        style={{ width: 230, paddingRight: searchTerm ? 30 : 10 }} // Adjust padding to make space for the X icon
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
