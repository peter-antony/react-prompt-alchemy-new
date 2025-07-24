
import React from 'react';
import { Badge } from './ui/badge';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'default' }) => {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'released':
        return 'default';
      case 'under_execution':
        return 'secondary';
      case 'initiated':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Badge variant={variant || getStatusVariant(status)}>
      {status.replace('_', ' ').toUpperCase()}
    </Badge>
  );
};
