'use client';

import { useEffect, useRef } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { select } from 'd3-selection';
import type { Discom, IndiaGeoJSON } from '@/lib/types';
import { stateFillColor, stateHasData, stateIsTracked } from '@/lib/computations';

interface PathDatum {
  name: string;
  d: string | null;
  c: [number, number];
}

interface Props {
  discoms: Discom[];
  geojson: IndiaGeoJSON;
  year: string;
  compareSet: string[];
  compareColorOf: (name: string) => string | null;
  onStateClick: (name: string) => void;
  revealedRef: React.RefObject<boolean>;
  onCentroids?: (centroids: Record<string, [number, number]>, size: { width: number; height: number }) => void;
}

export default function HeroMap({ discoms, geojson, year, compareSet, compareColorOf, onStateClick, revealedRef, onCentroids }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const builtRef = useRef(false);

  // refs so D3 event handlers (attached once) always read fresh values
  const discomsRef = useRef(discoms);
  const yearRef = useRef(year);
  const compareColorRef = useRef(compareColorOf);
  const onClickRef = useRef(onStateClick);
  const onCentroidsRef = useRef(onCentroids);
  discomsRef.current = discoms;
  yearRef.current = year;
  compareColorRef.current = compareColorOf;
  onClickRef.current = onStateClick;
  onCentroidsRef.current = onCentroids;

  function build() {
    const wrap = wrapRef.current;
    const tip = tipRef.current;
    if (!wrap || !tip) return;
    const width = wrap.clientWidth || window.innerWidth;
    const height = wrap.clientHeight || window.innerHeight;

    select(wrap).selectAll('svg').remove();
    const svg = select(wrap)
      .insert('svg', '.map-tip')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const proj = geoMercator().fitExtent(
      [
        [width * 0.04, height * 0.06],
        [width * 0.96, height * 0.97],
      ],
      geojson as never
    );
    const gp = geoPath(proj);
    const paths: PathDatum[] = geojson.features.map((f) => ({
      name: f.properties.st_nm,
      d: gp(f as never),
      c: gp.centroid(f as never) as [number, number],
    }));

    svg
      .selectAll('path.state-path')
      .data(paths)
      .enter()
      .append('path')
      .attr('class', 'state-path')
      .attr('d', (p) => p.d)
      .attr('data-name', (p) => p.name)
      .on('mouseenter', function (_ev, p) {
        if (!revealedRef.current) return;
        select(this).raise().classed('hovered', true);
        svg.selectAll<SVGPathElement, PathDatum>('path.state-path').classed('dimmed', (o) => o.name !== p.name);
        const hasData = stateHasData(discomsRef.current, p.name, yearRef.current);
        const comparing = compareColorRef.current(p.name) ? ' ✓ comparing' : '';
        tip.style.display = 'block';
        tip.style.left = p.c[0] + 'px';
        tip.style.top = p.c[1] + 'px';
        tip.textContent = p.name + (hasData ? '' : ' · no data') + comparing;
      })
      .on('mouseleave', function () {
        select(this).classed('hovered', false);
        svg.selectAll('path.state-path').classed('dimmed', false);
        tip.style.display = 'none';
      })
      .on('click', (_ev, p) => {
        if (!revealedRef.current) return;
        if (!stateIsTracked(discomsRef.current, p.name)) return;
        onClickRef.current(p.name);
      });

    builtRef.current = true;
    paint();

    if (onCentroidsRef.current) {
      const centroids: Record<string, [number, number]> = {};
      paths.forEach((p) => {
        centroids[p.name] = p.c;
      });
      onCentroidsRef.current(centroids, { width, height });
    }
  }

  function paint() {
    const wrap = wrapRef.current;
    if (!wrap) return;
    select(wrap)
      .select('svg')
      .selectAll<SVGPathElement, PathDatum>('path.state-path')
      .attr('fill', (p) => stateFillColor(stateHasData(discoms, p.name, year)))
      .attr('stroke', (p) => compareColorOf(p.name) || 'rgba(7,17,31,0.32)')
      .attr('stroke-width', (p) => (compareColorOf(p.name) ? 3 : 0.8))
      .classed('selected', (p) => !!compareColorOf(p.name))
      .classed('clickable', (p) => stateIsTracked(discoms, p.name));
  }

  useEffect(() => {
    build();
    function onResize() {
      build();
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geojson]);

  useEffect(() => {
    if (builtRef.current) paint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discoms, year, compareSet]);

  return (
    <div id="mapWrap" ref={wrapRef}>
      <div className="map-tip" id="mapTip" ref={tipRef} />
    </div>
  );
}
