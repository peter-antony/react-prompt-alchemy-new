import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authUtils } from '@/utils/auth';
import { ROUTES } from '@/api/config';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // const [isLoading, setIsLoading] = useState(true);
  // const [hasToken, setHasToken] = useState(false);
  // const location = useLocation();

  // useEffect(() => {
  //   // Check if token exists
  //   const checkToken = () => {
  //     const tokenExists = authUtils.hasToken();
  //     setHasToken(tokenExists);
  //     setIsLoading(false);
  //   };

  //   checkToken();
  // }, []);

  // // Show loading state while checking
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  // // If no token, redirect to signin
  // if (!hasToken) {
  //   return <Navigate to={ROUTES.SIGNIN} state={{ from: location }} replace />;
  // }

  // If token exists, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 