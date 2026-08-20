"""Assemble index.html from index_template.html by embedding data/discoms2.json
and data/india-states.geojson inline (same single-file, no-fetch, no-server
convention as the rest of this project). Re-run after re-running extraction_common.py.
"""
import json

with open('data/discoms2.json', encoding='utf-8') as f:
    discoms = json.load(f)
with open('data/india-states.geojson', encoding='utf-8') as f:
    geojson = json.load(f)

with open('index_template.html', encoding='utf-8') as f:
    template = f.read()

out = template.replace(
    '/*__DISCOMS_JSON__*/', json.dumps(discoms, separators=(',', ':'), ensure_ascii=False)
).replace(
    '/*__GEOJSON__*/', json.dumps(geojson, separators=(',', ':'), ensure_ascii=False)
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(out)

import os
print('wrote index.html', os.path.getsize('index.html'), 'bytes')
