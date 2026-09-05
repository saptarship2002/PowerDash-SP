'use client';

import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { hexToRgba } from '@/lib/colors';
import { fyLabel } from '@/lib/format';
import ContextLens from './ContextLens';
import ComplianceRail, { complianceStatus } from './ComplianceRail';
import ObservationEvidenceCard from './ObservationEvidenceCard';
import RegulationBadge from './RegulationBadge';

export interface CardPoint {
  year: string;
  value: number | null;
  benchmark: number | null;
  benchmarkMeaning: string | null;
  reportedMeaning: string | null;
  standardSpecified: string | null;
  comparisonPossible: boolean | null;
  standardMet: boolean | null;
  reasonNotComparable: string | null;
  regulation: string | null;
}

export interface CardSeries {
  label: string;
  color: string;
  points: CardPoint[];
}

interface Props {
  title: string;
  typeLabel?: string | null;
  meaning?: string | null;
  measuredAsLabel?: string | null;
  unitSuffix: (v: number) => string;
  yAxisLabel?: string;
  yearsAsc: string[];
  activeYear: string;
  series: CardSeries[];
  animationDelay?: number;
}

/** Most-frequent numeric benchmark among points that are actually marked comparable — never draws
 * a reference line from a benchmark the sheet itself said couldn't be compared to what's plotted. */
function representativeComparableBenchmark(series: CardSeries[]): number | null {
  const counts = new Map<number, number>();
  for (const s of series) {
    for (const p of s.points) {
      if (p.comparisonPossible === true && p.benchmark != null && !Number.isNaN(p.benchmark)) {
        counts.set(p.benchmark, (counts.get(p.benchmark) || 0) + 1);
      }
    }
  }
  let best: number | null = null;
  let bestN = -1;
  for (const [v, n] of counts) {
    if (n > bestN) {
      best = v;
      bestN = n;
    }
  }
  return best;
}

function firstNonNull<T>(series: CardSeries[], pick: (p: CardPoint) => T | null | undefined): T | null {
  for (const s of series) {
    for (const p of s.points) {
      const v = pick(p);
      if (v != null && v !== '') return v;
    }
  }
  return null;
}

function truncated(text: string, max = 140): { short: string; needsMore: boolean } {
  if (text.length <= max) return { short: text, needsMore: false };
  return { short: text.slice(0, max).trimEnd() + '…', needsMore: true };
}

function StandardLens({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const { short, needsMore } = truncated(text);
  return (
    <ContextLens
      icon="📜"
      label="Standard"
      value={<span>{expanded ? text : short}</span>}
      sub={
        needsMore && (
          <button type="button" className="lens-more-btn" onClick={() => setExpanded((e) => !e)}>
            {expanded ? 'Show less' : 'View full standard'}
          </button>
        )
      }
    />
  );
}

/** The core reusable visual unit: indicator identity, a time-series chart, compact context
 * lenses, a per-year compliance rail, per-observation evidence cards, and any not-comparable
 * exception callouts and regulatory citations — all inside one card so a chart never needs a
 * hidden table underneath it to be understood. Used for both reliability/power-quality
 * indicators (one series per DISCOM) and Standards-of-Performance indicators (one series per
 * DISCOM/indicator pair). */
export default function IndicatorVisualCard({ title, typeLabel, meaning, measuredAsLabel, unitSuffix, yAxisLabel, yearsAsc, activeYear, series, animationDelay }: Props) {
  const hasNumeric = series.some((s) => s.points.some((p) => p.value != null));
  const bench = representativeComparableBenchmark(series);

  const benchmarkMeaning = firstNonNull(series, (p) => p.benchmarkMeaning);
  const standardSpecified = firstNonNull(series, (p) => p.standardSpecified);
  const reportedMeaning = measuredAsLabel ?? firstNonNull(series, (p) => p.reportedMeaning);

  const regulations = Array.from(new Set(series.flatMap((s) => s.points.map((p) => p.regulation).filter((r): r is string => !!r))));

  const reasons = Array.from(
    new Set(
      series.flatMap((s) => s.points.filter((p) => p.comparisonPossible === false && p.reasonNotComparable && p.reasonNotComparable !== 'N/A').map((p) => p.reasonNotComparable as string))
    )
  );

  const datasets = series.map((s) => ({
    label: s.label,
    data: s.points.map((p) => p.value),
    borderColor: s.color,
    borderWidth: 2,
    fill: series.length === 1,
    spanGaps: false,
    tension: 0.35,
    backgroundColor: hexToRgba(s.color, 0.1),
    pointRadius: s.points.map((p) => (p.year === activeYear ? 6 : 4)),
    pointHoverRadius: 8,
    pointBackgroundColor: s.color,
    pointBorderColor: '#faf8f3',
    pointBorderWidth: 2,
  }));

  return (
    <div className="chart-card visual-card animate-in" style={animationDelay ? { animationDelay: `${animationDelay}ms` } : undefined}>
      <div className="visual-card-identity">
        <h4>{title}</h4>
        {typeLabel && <div className="chart-sub">{typeLabel}</div>}
        {meaning && <div className="visual-card-meaning">{meaning}</div>}
      </div>

      <div className="context-lens-row">
        {(benchmarkMeaning || bench != null) && <ContextLens icon="🎯" label="Benchmark" value={bench != null ? unitSuffix(bench) : 'N/A'} sub={benchmarkMeaning} />}
        {reportedMeaning && <ContextLens icon="📏" label="Measured as" value={reportedMeaning} />}
        {standardSpecified && <StandardLens text={standardSpecified} />}
      </div>

      {hasNumeric ? (
        <div style={{ height: 300, marginTop: 14 }}>
          <Line
            data={{ labels: yearsAsc.map((y) => fyLabel(y)), datasets }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              animation: { duration: 900, easing: 'easeOutQuart' },
              interaction: { mode: 'nearest', intersect: false, axis: 'x' },
              plugins: {
                legend: { display: series.length > 1, position: 'bottom', labels: { boxWidth: 10, usePointStyle: true, padding: 14, font: { size: 11.5 } } },
                tooltip: {
                  backgroundColor: '#1c2127',
                  padding: 10,
                  cornerRadius: 8,
                  displayColors: true,
                  callbacks: { label: (c) => c.dataset.label + ': ' + (c.raw == null ? 'no data' : unitSuffix(c.raw as number)) },
                },
                annotation:
                  bench == null
                    ? { annotations: {} }
                    : {
                        annotations: {
                          standard: {
                            type: 'line',
                            yMin: bench,
                            yMax: bench,
                            borderColor: '#b1441c',
                            borderWidth: 2,
                            borderDash: [7, 5],
                            label: {
                              display: true,
                              content: 'Benchmark: ' + unitSuffix(bench),
                              position: 'start',
                              backgroundColor: '#b1441c',
                              color: '#fff',
                              font: { size: 10.5, weight: 600 },
                              padding: { x: 6, y: 3 },
                              borderRadius: 4,
                            },
                          },
                        },
                      },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(18,23,42,0.07)' },
                  ticks: { font: { size: 11.5 } },
                  title: yAxisLabel ? { display: true, text: yAxisLabel, font: { size: 11.5, weight: 600 }, color: '#6b7280' } : undefined,
                },
                x: { grid: { display: false }, ticks: { font: { size: 11.5 } } },
              },
            }}
          />
        </div>
      ) : (
        <div className="no-data-box" style={{ marginTop: 14 }}>
          ○ No numeric time-series figures reported for this indicator
        </div>
      )}

      <div className="compliance-rail-group">
        {series.map((s) => (
          <ComplianceRail key={s.label} yearsAsc={yearsAsc} label={series.length > 1 ? s.label : undefined} color={series.length > 1 ? s.color : undefined} statuses={s.points.map((p) => complianceStatus(p.comparisonPossible, p.standardMet))} />
        ))}
      </div>

      {reasons.length > 0 && (
        <div className="exception-callout">
          <div className="exception-callout-head">⚠ Why comparison isn&rsquo;t possible</div>
          {reasons.map((r, i) => (
            <div key={i} className="exception-callout-text">
              {r}
            </div>
          ))}
        </div>
      )}

      <div className="evidence-row">
        {series.flatMap((s) =>
          s.points.map((p) => (
            <ObservationEvidenceCard
              key={s.label + p.year}
              year={p.year}
              seriesLabel={series.length > 1 ? s.label : undefined}
              color={s.color}
              reportedText={p.value == null ? 'N/A' : unitSuffix(p.value)}
              reportedSub={p.reportedMeaning}
              benchmarkText={p.benchmark == null ? null : unitSuffix(p.benchmark)}
              benchmarkSub={p.benchmarkMeaning}
              comparisonPossible={p.comparisonPossible}
              standardMet={p.standardMet}
              reasonNotComparable={p.reasonNotComparable}
            />
          ))
        )}
      </div>

      {regulations.length === 1 && <RegulationBadge text={regulations[0]} />}
      {regulations.length > 1 && (
        <div className="regulation-badge-group">
          {series.map(
            (s) =>
              s.points.some((p) => p.regulation) && (
                <RegulationBadge key={s.label} text={s.points.find((p) => p.regulation)?.regulation} label={`${s.label}: regulatory citation`} />
              )
          )}
        </div>
      )}
    </div>
  );
}
