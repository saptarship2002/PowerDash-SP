import { readFileSync } from 'fs';
import path from 'path';
import StateDetail from '@/components/StateDetail';
import { slugify } from '@/lib/slug';

// Static export needs every possible [name] segment known at build time. The map is clickable
// for every state/UT in the India geojson — not just the 12 ACPET tracks — so an "idle" state
// (outside ACPET's scope in both datasets) still needs a real static route to land on, or a map
// click there would 404 rather than reach StateDetail's "coming soon" fallback.
function loadAllStateNames(): string[] {
  const file = readFileSync(path.join(process.cwd(), 'public/data/india-states.geojson'), 'utf8');
  const geojson = JSON.parse(file) as { features: { properties: { st_nm: string } }[] };
  return geojson.features.map((f) => f.properties.st_nm);
}

// Params are plain slugs ("madhya-pradesh"), not the raw state name — see slug.ts for why.
export function generateStaticParams() {
  return loadAllStateNames().map((name) => ({ name: slugify(name) }));
}

export default async function StatePage({ params }: { params: Promise<{ name: string }> }) {
  const { name: slug } = await params;
  const name = loadAllStateNames().find((s) => slugify(s) === slug) ?? slug;
  return <StateDetail name={name} />;
}
