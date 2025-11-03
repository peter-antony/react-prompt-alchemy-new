import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BadgesListProps {
  items: any[];
  onRemove: (index: number) => void;
  className?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const BadgesList: React.FC<BadgesListProps> = ({
  items,
  onRemove,
  className,
  badgeVariant = 'default',
}) => {
  console.log('items:::::::::::: ', items);
  return (
    <div className={cn('flex flex-wrap gap-2 mt-2', className)}>
      {items?.map((item: any, index: any) => (
        <Badge
          key={index}
          variant={badgeVariant}
          className="flex items-center gap-1 pr-1 transition-all hover:opacity-80"
        >
          <span>{item?.EquipmentID}</span>
          <button
            onClick={() => onRemove(index)}
            className="ml-1 rounded-full p-0.5 hover:bg-background/20 transition-colors"
            aria-label={`Remove ${item}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
};