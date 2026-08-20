import { readFileSync } from 'fs';
import path from 'path';
import StateDetail from '@/components/StateDetail';
import { slugify } from '@/lib/slug';

// Static export needs every possible [name] segment known at build time — read the same
// discoms2.json the client fetches at runtime, straight off disk, rather than duplicating the
// state list in source.
function loadStateOrder(): string[] {
  const file = readFileSync(path.join(process.cwd(), 'public/data/discoms2.json'), 'utf8');
  return (JSON.parse(file) as { state_order: string[] }).state_order;
}

// Params are plain slugs ("madhya-pradesh"), not the raw state name — see slug.ts for why.
export function generateStaticParams() {
  return loadStateOrder().map((name) => ({ name: slugify(name) }));
}

export default async function StatePage({ params }: { params: Promise<{ name: string }> }) {
  const { name: slug } = await params;
  const name = loadStateOrder().find((s) => slugify(s) === slug) ?? slug;
  return <StateDetail name={name} />;
}
