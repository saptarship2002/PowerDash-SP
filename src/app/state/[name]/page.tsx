'use client';

import { use } from 'react';
import StateDetail from '@/components/StateDetail';

export default function StatePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  return <StateDetail name={decodeURIComponent(name)} />;
}
