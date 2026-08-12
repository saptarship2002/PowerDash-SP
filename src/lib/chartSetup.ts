import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(...registerables, annotationPlugin);

if (typeof window !== 'undefined') {
  const sans = getComputedStyle(document.documentElement).getPropertyValue('--font-sans').trim();
  if (sans) Chart.defaults.font.family = sans;
  Chart.defaults.color = '#666f85';
}
