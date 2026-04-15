'use client';

import React, { Suspense } from 'react';
import BoundStrategiesPage from '@/features/strategy-binding/components/BoundStrategiesPage';

const Page: React.FC = () => (
  <Suspense>
    <BoundStrategiesPage />
  </Suspense>
);

export default Page;
