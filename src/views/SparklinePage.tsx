'use client';

import React from 'react';
import { Navigate } from '@/shared/ui/Navigation';
import { useSearchParams } from 'next/navigation';

/**
 * Backward compatibility for marketing links:
 * /welcome?sparkly=<id>  ->  /welcome/<id>
 * /welcome (no sparkly)  ->  /login
 */
const SparklinePage: React.FC = () => {
  const searchParams = useSearchParams();
  const sparkly = searchParams?.get('sparkly') ?? '';

  if (sparkly) {
    return <Navigate to={`/welcome/${encodeURIComponent(sparkly)}`} replace />;
  }

  return <Navigate to="/login" replace />;
};

export default SparklinePage;
