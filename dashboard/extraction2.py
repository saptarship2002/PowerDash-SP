import openpyxl, datetime
wb = openpyxl.load_workbook('data/PQ_Dashboard_ACPET.xlsx')

ws = wb['Reported Data']
for i, row in enumerate(ws.iter_rows(values_only=True)):
    if i == 0: continue
    if row[0] is not None:
        discom = str(row[2]).strip()
        param = str(row[7]).strip()
        val = row[8]
        if isinstance(val, datetime.time):
            val_hrs = val.hour + val.minute/60
            print(f'{discom[:20]:20} | {param:20} | {val} -> {val_hrs:.2f} hrs')
        else:
            print(f'{discom[:20]:20} | {param:20} | {val}')