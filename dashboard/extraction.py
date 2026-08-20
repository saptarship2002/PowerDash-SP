import openpyxl
wb = openpyxl.load_workbook('data/PQ_Dashboard_ACPET.xlsx')

# Get all reported data rows
ws = wb['Reported Data']
rows = []
for i, row in enumerate(ws.iter_rows(values_only=True)):
    if i == 0: continue
    if row[0] is not None:
        rows.append(row)

# Print unique DISCOMs and parameters
discoms = set()
params = set()
for r in rows:
    if r[2]: discoms.add(str(r[2]).strip())
    if r[7]: params.add(str(r[7]).strip())
print('DISCOMs:', sorted(discoms))
print()
print('Params:', sorted(params))
print()
print('Total rows:', len(rows))
