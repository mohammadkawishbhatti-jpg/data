import fitz
from pathlib import Path
pdf_path = Path('attached_assets/Product-Catalogue_1786905402232.pdf')
out_dir = Path('.agents/outputs/reference-catalogue')
doc = fitz.open(pdf_path)
print('pages:', len(doc), 'size:', doc[0].rect)
for index, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(1.35, 1.35), alpha=False)
    path = out_dir / f'page-{index+1:02d}.png'
    pix.save(path)
    text = ' '.join(page.get_text().split())
    print(index + 1, text[:180])
