import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DrawerLayoutProps {
  title: string;
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  className?: string;
  gridColumns?: string;
}

export const DrawerLayout: React.FC<DrawerLayoutProps> = ({
  title,
  leftPanel,
  rightPanel,
  footer,
  onClose,
  className,
  gridColumns = 'md:grid-cols-2',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn('flex flex-col h-full bg-background', className)}
    >
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b bg-card">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Body - Two Panel Layout */}
      <div className={cn("flex-1 grid grid-cols-1 gap-6 p-6 overflow-y-auto", gridColumns)}>
        {/* Left Panel */}
        <div className="space-y-4">
          {leftPanel}
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {rightPanel}
        </div>
      </div>

      {/* Footer */}
      {footer && (
        <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 px-6 py-4 border-t bg-card">
          {footer}
        </div>
      )}
    </motion.div>
  );
};
