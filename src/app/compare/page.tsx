'use client';

import { use } from 'react';
import CompareView from '@/components/CompareView';

export default function ComparePage({ searchParams }: { searchParams: Promise<{ states?: string; year?: string }> }) {
  const { states, year } = use(searchParams);
  const stateList = states ? states.split(',').filter(Boolean) : [];
  return <CompareView states={stateList} year={year} />;
}
