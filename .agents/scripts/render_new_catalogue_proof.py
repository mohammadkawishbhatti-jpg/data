import fitz
from pathlib import Path
pdf=fitz.open('artifacts/prime-site/public/prime-packaging-product-catalogue.pdf')
out=Path('.agents/outputs/new-catalogue-proof'); out.mkdir(parents=True, exist_ok=True)
for i in [0,1,2,5,9,10,11,12,13,14]:
    pix=pdf[i].get_pixmap(matrix=fitz.Matrix(1.15,1.15), alpha=False)
    path=out/f'page-{i+1:02d}.png'; pix.save(path); print(path)
print('pages',len(pdf))
