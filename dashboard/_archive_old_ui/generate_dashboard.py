import json, colorsys

discoms = json.load(open('data/discoms.json', encoding='utf-8'))
by_sheet = {d['sheet']: d for d in discoms}

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16)/255 for i in (0, 2, 4))

def rgb_to_hex(rgb):
    return '#' + ''.join(f'{max(0, min(255, round(c*255))):02x}' for c in rgb)

def shades(base_hex, n, l_range=(0.38, 0.62)):
    r, g, b = hex_to_rgb(base_hex)
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    if n == 1:
        return [base_hex]
    lo, hi = l_range
    out = []
    for i in range(n):
        t = i/(n-1)
        nl = lo + t*(hi-lo)
        nr, ng, nb = colorsys.hls_to_rgb(h, nl, min(1, s*1.05))
        out.append(rgb_to_hex((nr, ng, nb)))
    return out

STATE_ORDER = ['Maharashtra', 'Gujarat', 'Madhya Pradesh', 'Rajasthan', 'Odisha']
STATE_HUE = {
    'Maharashtra': '#2a78d6',
    'Gujarat': '#eb6834',
    'Madhya Pradesh': '#1baf7a',
    'Rajasthan': '#c98500',
    'Odisha': '#e87ba4',
}
STATE_SHEETS = {
    'Maharashtra': ['MSEDCL,MAHARASHTRA'],
    'Gujarat': ['DGCVL,GUJARAT', 'MGVCL,GUJARAT', 'UGVCL,GUJARAT', 'PGVCL,GUJARAT'],
    'Madhya Pradesh': ['MPEZ,MADHYA PRADESH', 'MPWZ,MADHYA PRADESH', 'MPCZ, MADHYA PRADESH'],
    'Rajasthan': ['AVVNL,RAJASTHAN', 'JVVNL,RAJASTHAN', 'JVVNL,RAJ'],
    'Odisha': ['TPCODL,ODISHA', 'TPNODL,ODISHA'],
}

color_by_sheet = {}
for state in STATE_ORDER:
    sheets = STATE_SHEETS[state]
    cols = shades(STATE_HUE[state], len(sheets))
    for sheet, col in zip(sheets, cols):
        color_by_sheet[sheet] = col

def find(sheet, indicator_name):
    d = by_sheet[sheet]
    name_u = indicator_name.strip().upper()
    for i in d['indicators']:
        if (i['indicator'] or '').strip().upper() == name_u:
            return i
    return None

def bar_entry(sheet, indicator_name, value_key, label_suffix=None):
    d = by_sheet[sheet]
    ind = find(sheet, indicator_name)
    if ind is None:
        return None
    val = ind.get(value_key)
    label = d['short_name'] + (f' ({label_suffix})' if label_suffix else '')
    return {
        'label': label,
        'sheet': sheet,
        'state': d['state'],
        'color': color_by_sheet[sheet],
        'value': val,
        'raw': ind['reported_raw'],
        'meaning': ind['reported_meaning'],
        'benchmark': ind['benchmark'],
        'benchmark_meaning': ind['benchmark_meaning'],
        'comparison_possible': ind['comparison_possible'],
        'standard_met': ind['standard_met'],
    }

def chart_series(entries_specs):
    out = []
    for spec in entries_specs:
        e = bar_entry(*spec)
        if e is not None:
            out.append(e)
    return out

# ---- Reliability: duration (SAIDI / CAIDI), hours ----
duration_sheets = ['MSEDCL,MAHARASHTRA', 'DGCVL,GUJARAT', 'MGVCL,GUJARAT', 'UGVCL,GUJARAT',
                    'PGVCL,GUJARAT', 'AVVNL,RAJASTHAN', 'JVVNL,RAJ', 'TPCODL,ODISHA']
saidi = chart_series([(s, 'SAIDI', 'value_hours') for s in duration_sheets])
caidi = chart_series([(s, 'CAIDI', 'value_hours') for s in duration_sheets])

# ---- Reliability: frequency (SAIFI / MAIFI), count/year ----
freq_sheets = ['MSEDCL,MAHARASHTRA', 'DGCVL,GUJARAT', 'MGVCL,GUJARAT', 'UGVCL,GUJARAT',
               'PGVCL,GUJARAT', 'AVVNL,RAJASTHAN', 'JVVNL,RAJ', 'TPCODL,ODISHA']
saifi = chart_series([(s, 'SAIFI', 'value_count') for s in freq_sheets])
maifi = chart_series([(s, 'MAIFI', 'value_count') for s in freq_sheets])

# ---- Power quality ----
harmonics = chart_series([(s, 'Harmonics', 'value_pct') for s in
                           ['DGCVL,GUJARAT', 'MGVCL,GUJARAT', 'UGVCL,GUJARAT', 'PGVCL,GUJARAT']])
voltage = chart_series([
    ('MSEDCL,MAHARASHTRA', 'VOLTAGE VARIATION', 'value_pct'),
    ('DGCVL,GUJARAT', 'Voltage Variation', 'value_pct'),
    ('MGVCL,GUJARAT', 'Voltage Variation', 'value_pct'),
    ('UGVCL,GUJARAT', 'Voltage Variation', 'value_pct'),
    ('PGVCL,GUJARAT', 'Voltage Variation', 'value_pct'),
    ('AVVNL,RAJASTHAN', 'Voltage Variation', 'value_pct'),
    ('JVVNL,RAJ', 'Voltage Variation', 'value_pct'),
])

# ---- Service quality: transformer restoration compliance (resolution-rate bucket) ----
transformer_restore = chart_series([
    ('MSEDCL,MAHARASHTRA', 'Distribution Transformer Failure : Urban', 'value_pct', 'Urban'),
    ('MSEDCL,MAHARASHTRA', 'Distribution Transformer Failure : Rural', 'value_pct', 'Rural'),
    ('MPEZ,MADHYA PRADESH', 'Distribution Transformer Failure : Urban ', 'value_pct', 'Urban'),
    ('MPEZ,MADHYA PRADESH', 'Distribution Transformer Failure : Rural', 'value_pct', 'Rural'),
    ('MPWZ,MADHYA PRADESH', 'Distribution Transformer Failure : Urban ', 'value_pct', 'Urban'),
    ('MPWZ,MADHYA PRADESH', 'Distribution Transformer Failure : Rural', 'value_pct', 'Rural'),
    ('MPCZ, MADHYA PRADESH', 'Distribution Transformer Failure : Urban ', 'value_pct', 'Urban'),
    ('MPCZ, MADHYA PRADESH', 'Distribution Transformer Failure : Rural', 'value_pct', 'Rural'),
    ('AVVNL,RAJASTHAN', 'Transformer Failure', 'value_pct'),
    ('JVVNL,RAJ', 'Transformer Failure', 'value_pct'),
    ('TPCODL,ODISHA', 'Transformer Failure', 'value_pct'),
])

# ---- Service quality: Gujarat transformer failure rate (different metric, lower=better, no benchmark) ----
gujarat_transformer_failure = chart_series([
    (s, 'Transformer Failure', 'value_pct') for s in
    ['DGCVL,GUJARAT', 'MGVCL,GUJARAT', 'UGVCL,GUJARAT', 'PGVCL,GUJARAT']
])

# ---- Billing complaint resolution % (resolution-rate bucket; excludes Odisha's fault-rate metric) ----
billing = chart_series([
    ('MSEDCL,MAHARASHTRA', 'Billing Complaint Resolution', 'value_pct'),
    ('DGCVL,GUJARAT', 'Billing Complaint Resolution', 'value_pct'),
    ('MGVCL,GUJARAT', 'Billing Complaint Resolution', 'value_pct'),
    ('UGVCL,GUJARAT', 'Billing Complaint Resolution', 'value_pct'),
    ('PGVCL,GUJARAT', 'Billing Complaint Resolution', 'value_pct'),
    ('MPEZ,MADHYA PRADESH', 'Billing Complaint Resolution : Urban', 'value_pct', 'Urban'),
    ('MPEZ,MADHYA PRADESH', 'Billing Complaint Resolution : Rural', 'value_pct', 'Rural'),
    ('MPWZ,MADHYA PRADESH', 'Billing Complaint Resolution : Urban', 'value_pct', 'Urban'),
    ('MPWZ,MADHYA PRADESH', 'Billing Complaint Resolution : Rural', 'value_pct', 'Rural'),
    ('MPCZ, MADHYA PRADESH', 'Billing Complaint Resolution : Urban', 'value_pct', 'Urban'),
    ('MPCZ, MADHYA PRADESH', 'Billing Complaint Resolution : Rural', 'value_pct', 'Rural'),
    ('AVVNL,RAJASTHAN', 'Billing Complaint Resolution', 'value_pct'),
    ('JVVNL,RAJ', 'Billing Complaint Resolution', 'value_pct'),
])

# ---- Comparability heatmap ----
HEATMAP_INDICATORS = ['SAIDI', 'SAIFI', 'MAIFI', 'CAIDI', 'VOLTAGE VARIATION', 'HARMONICS',
                       'TRANSFORMER FAILURE', 'BILLING COMPLAINT RESOLUTION']

def heatmap_row(sheet):
    d = by_sheet[sheet]
    cells = []
    for key in HEATMAP_INDICATORS:
        matches = [i for i in d['indicators'] if key in (i['indicator'] or '').strip().upper()]
        if not matches:
            cells.append({'status': 'absent'})
            continue
        i = matches[0]
        cp = str(i['comparison_possible']).strip().upper()
        reported = i['reported_raw'] is not None
        if cp == 'YES' and reported:
            status = 'yes'
        elif cp == 'YES' and not reported:
            status = 'phantom'  # claims comparable, no data
        elif cp == 'NO':
            status = 'no'
        else:
            status = 'na'
        cells.append({'status': status})
    return {
        'sheet': sheet,
        'short_name': d['short_name'],
        'state': d['state'],
        'color': color_by_sheet[sheet],
        'cells': cells,
    }

heatmap = {
    'indicators': HEATMAP_INDICATORS,
    'rows': [heatmap_row(s) for state in STATE_ORDER for s in STATE_SHEETS[state]],
}

# ---- Scorecards ----
GAP_SENTENCES = {
    'MSEDCL,MAHARASHTRA': 'Reports the fullest indicator set of any licensee, but standard/reported units are inconsistent (minutes vs. resolved-% vs. Hr:Min) and most benchmarks (90-99%) are missed by wide margins.',
    'DGCVL,GUJARAT': 'Reliability indicators (SAIDI/SAIFI/MAIFI/CAIDI) have no GERC benchmark to compare against; power-quality sample tests pass at ~100%.',
    'MGVCL,GUJARAT': 'Same regulatory gap as other Gujarat DISCOMs on reliability; billing complaint resolution is the weakest metric at 50.4%.',
    'UGVCL,GUJARAT': 'Billing complaint resolution is the lowest in the dataset (29.7%); reliability indicators remain non-comparable under GERC rules.',
    'PGVCL,GUJARAT': 'SAIDI (~209 hrs/yr) and SAIFI (~95/yr) are order-of-magnitude outliers versus peers — worth verifying at source.',
    'MPEZ,MADHYA PRADESH': 'Reports zero data for all four reliability and two power-quality indicators; only billing/transformer-restoration are populated (and pass at ~100%).',
    'MPWZ,MADHYA PRADESH': 'Same reporting pattern as MPEZ — reliability & power-quality indicators entirely unreported for 2021-22.',
    'MPCZ, MADHYA PRADESH': 'Same reporting pattern as MPEZ/MPWZ — reliability & power-quality indicators entirely unreported for 2021-22.',
    'AVVNL,RAJASTHAN': 'The most fully comparable licensee in the dataset — RERC benchmarks exist and are met for SAIDI, SAIFI, voltage variation, transformer restoration and billing.',
    'JVVNL,RAJASTHAN': 'Every indicator is tagged "Comparison Possible: Yes" and "Standard Met: Yes" in the source sheet, yet not a single value was actually reported — a reporting-integrity gap, not a real result.',
    'JVVNL,RAJ': 'Second-most complete licensee after AVVNL; meets its RERC benchmarks across reliability, voltage variation, transformer restoration and billing.',
    'TPCODL,ODISHA': "SAIDI (~155 hrs/yr) is a major outlier; its billing indicator measures bill accuracy (% faulty bills), not complaint-resolution speed, so it can't be charted against other states' billing metric.",
    'TPNODL,ODISHA': 'No reliability, power-quality, or service data reported for 2021-22 — only benchmark/standard metadata exists in the sheet.',
}

scorecards = []
for state in STATE_ORDER:
    for sheet in STATE_SHEETS[state]:
        d = by_sheet[sheet]
        scorecards.append({
            'sheet': sheet,
            'full_name': d['full_name'],
            'short_name': d['short_name'],
            'state': d['state'],
            'color': color_by_sheet[sheet],
            'regulation': d['regulation'],
            'scoring': d['scoring'],
            'gap': GAP_SENTENCES.get(sheet, ''),
        })

# ---- Grade distribution (doughnut) ----
grade_distribution = {'A': 0, 'B': 0, 'C': 0}
for s in scorecards:
    grade_distribution[s['scoring']['grade']] += 1

# ---- Comparability distribution across every heatmap cell (doughnut) ----
comparability_distribution = {'yes': 0, 'no': 0, 'na': 0, 'absent': 0, 'phantom': 0}
for row in heatmap['rows']:
    for c in row['cells']:
        comparability_distribution[c['status']] += 1

# ---- Comparability stack per licensee (stacked horizontal bar) ----
comparability_stack = []
for row in heatmap['rows']:
    counts = {'yes': 0, 'no': 0, 'na': 0, 'phantom': 0}
    for c in row['cells']:
        st = c['status']
        if st == 'absent':
            st = 'na'
        counts[st] += 1
    comparability_stack.append({
        'short_name': row['short_name'], 'state': row['state'], 'color': row['color'], **counts
    })

# ---- Composite score by licensee, grouped by state (ranked within each state) ----
score_ranked = []
for state in STATE_ORDER:
    state_cards = [s for s in scorecards if s['state'] == state]
    state_cards.sort(key=lambda x: x['scoring']['composite_score'], reverse=True)
    for s in state_cards:
        score_ranked.append({
            'short_name': s['short_name'], 'state': s['state'], 'color': s['color'],
            'score': s['scoring']['composite_score']
        })

# ---- SAIDI vs SAIFI duration/frequency comparison (grouped bar, indexed to a common 0-100 scale) ----
duration_frequency = []
for sheet in duration_sheets:
    d = by_sheet[sheet]
    s_ind = find(sheet, 'SAIDI')
    f_ind = find(sheet, 'SAIFI')
    if s_ind and f_ind and s_ind.get('value_hours') is not None and f_ind.get('value_count') is not None:
        duration_frequency.append({
            'short_name': d['short_name'], 'state': d['state'], 'color': color_by_sheet[sheet],
            'saidi_hours': s_ind['value_hours'], 'saifi_count': f_ind['value_count'],
        })
if duration_frequency:
    max_saidi = max(e['saidi_hours'] for e in duration_frequency)
    max_saifi = max(e['saifi_count'] for e in duration_frequency)
    for e in duration_frequency:
        e['saidi_index'] = round(100 * e['saidi_hours'] / max_saidi, 1) if max_saidi else 0
        e['saifi_index'] = round(100 * e['saifi_count'] / max_saifi, 1) if max_saifi else 0

DASH = {
    'state_order': STATE_ORDER,
    'state_hue': STATE_HUE,
    'color_by_sheet': color_by_sheet,
    'charts': {
        'saidi': saidi, 'caidi': caidi,
        'saifi': saifi, 'maifi': maifi,
        'harmonics': harmonics, 'voltage': voltage,
        'transformer_restore': transformer_restore,
        'gujarat_transformer_failure': gujarat_transformer_failure,
        'billing': billing,
    },
    'heatmap': heatmap,
    'scorecards': scorecards,
    'grade_distribution': grade_distribution,
    'comparability_distribution': comparability_distribution,
    'comparability_stack': comparability_stack,
    'score_ranked': score_ranked,
    'duration_frequency': duration_frequency,
}

with open('data/dash.json', 'w', encoding='utf-8') as f:
    json.dump(DASH, f, indent=2, ensure_ascii=False)

print('wrote data/dash.json')
print('saidi n=', len(saidi), 'caidi n=', len(caidi), 'saifi n=', len(saifi), 'maifi n=', len(maifi))
print('harmonics n=', len(harmonics), 'voltage n=', len(voltage))
print('transformer_restore n=', len(transformer_restore), 'gujarat_transformer_failure n=', len(gujarat_transformer_failure))
print('billing n=', len(billing))
