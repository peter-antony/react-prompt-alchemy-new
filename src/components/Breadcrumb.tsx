
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
    active?: boolean;
  }>;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <div className="flex items-center gap-2 text-[13px] font-medium text-blue-500 mb-4">
      {items.map((item, index) => (
        <div key={index} className='flex gap-2 items-center cursor-pointer'>
          {item.label === 'Home' && <Home size={16} className="me-1" />}
          {item.href ? (
            <>
            {/* <a
              href={item.href}
              className={
                item.active ? 'text-foreground' : 'text-blue-600 cursor-pointer'
              }
            >
              {item.label}
            </a> */}
            <Link to={item.href} className={
              item.active ? 'text-foreground' : 'text-blue-600 cursor-pointer'
            }>
              {item.label}
            </Link>
              </>
          ) : (
            <span className="cursor-default text-foreground">{item.label}</span>
          )}
          {index < items.length - 1 && <span><ChevronRight size={16} className="text-gray-400" /></span>}
        </div>
        // <React.Fragment key={index}>
        //   {item.label == 'Home' && <Home size={16} />}
        //   <span className={item.active ? 'text-foreground' : item.href ? 'text-blue-600 cursor-pointer' : 'cursor-pointer'}>
        //     {item.label}
        //   </span>
        //   {index < items.length - 1 && <span><ChevronRight size={16} className="text-gray-400" /></span>}
        // </React.Fragment>
      ))}
    </div>
  );
};