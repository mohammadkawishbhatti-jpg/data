from pathlib import Path
import fitz
from PIL import Image, ImageOps, ImageDraw

W, H = 1440, 810
BG = (0.965, 0.952, 0.925)
NAVY = (0.035, 0.055, 0.34)
RED = (0.78, 0.05, 0.10)
INK = (0.055, 0.07, 0.20)
MUTED = (0.25, 0.26, 0.35)
WHITE = (1, 1, 1)
ROOT = Path('attached_assets/prime-catalogue-web-images')
LOGO_SVG = Path('artifacts/api-server/uploads/prime-packaging-logo-transparent.svg')
LOGO_PNG = Path('.agents/outputs/prime-logo-overlay.png')
PREP = Path('.agents/outputs/prime-catalogue-prepared')
OUT = Path('artifacts/prime-site/public/prime-packaging-product-catalogue.pdf')

CATEGORIES = [
    ('RIGID BOXES', 'rigid', 'Premium rigid boxes with magnetic, book-style, shoulder-neck, and presentation structures.'),
    ('COSMETIC BOXES', 'cosmetic', 'Presentation-ready packaging for skincare, makeup, fragrance, and wellness products.'),
    ('CIGARETTE BOXES', 'cigarette', 'Custom cigarette and tobacco packaging with practical retail-ready formats.'),
    ('CBD BOXES', 'cbd', 'Custom CBD and hemp packaging for tinctures, oils, pre-rolls, and wellness products.'),
    ('PILLOW BOXES', 'pillow', 'Curved pillow-style cartons for gifts, apparel, accessories, and small retail products.'),
    ('CORRUGATED BOXES', 'corrugated', 'Durable mailer and shipping cartons designed for branded fulfillment.'),
    ('GABLE BOXES', 'gable', 'Handled gable cartons for gifts, food, events, and takeaway presentation.'),
    ('KRAFT CARD BOXES', 'kraft', 'Natural kraft packaging with inserts, lids, windows, and custom printed details.'),
    ('DISPLAY BOXES', 'display', 'Countertop and shelf-ready display packaging that helps products stand out.'),
    ('DISPENSER BOXES', 'dispenser', 'Functional dispenser cartons for packets, sachets, retail goods, and service counters.'),
]


def fcolor(rgb):
    return tuple(c / 255 for c in rgb)


def text(page, value, x, y, size=18, color=INK, font='helv', align=0, width=None, height=None):
    if width is None:
        page.insert_text((x, y), value, fontsize=size, fontname=font, color=color, overlay=True)
    else:
        page.insert_textbox(fitz.Rect(x, y, x + width, y + height), value, fontsize=size, fontname=font, color=color, align=align, overlay=True)


def centered_text(page, value, y, size=18, color=INK, font='helv'):
    text_width = fitz.get_text_length(value, fontname=font, fontsize=size)
    page.insert_text(((W - text_width) / 2, y), value, fontsize=size, fontname=font, color=color, overlay=True)


def rect(page, x0, y0, x1, y1, fill=None, border=None, border_width=0.8, radius=0):
    r = fitz.Rect(x0, y0, x1, y1)
    # Keep this compatible with the PyMuPDF build available in the workspace.
    page.draw_rect(r, color=border, fill=fill, width=border_width, overlay=True)


def corner_frame(page):
    page.draw_line((18, 16), (215, 16), color=NAVY, width=2, overlay=True)
    page.draw_line((18, 16), (18, 210), color=NAVY, width=2, overlay=True)
    page.draw_line((1422, 794), (1220, 794), color=NAVY, width=2, overlay=True)
    page.draw_line((1422, 794), (1422, 600), color=NAVY, width=2, overlay=True)


def make_logo_png():
    LOGO_PNG.parent.mkdir(parents=True, exist_ok=True)
    # ImageMagick is available in the Replit image and preserves the SVG transparency.
    import subprocess
    subprocess.run(['convert', '-background', 'none', '-density', '180', str(LOGO_SVG), '-resize', '360x110', str(LOGO_PNG)], check=True)


def image_files(key):
    files = []
    for n in range(1, 5):
        matches = list(ROOT.glob(f'{key}-{n}.*'))
        for p in matches:
            try:
                with Image.open(p) as im:
                    im.verify()
                files.append(p)
                break
            except Exception:
                continue
    if not files:
        raise RuntimeError(f'No valid web images for {key}')
    while len(files) < 4:
        files.append(files[-1])
    return files


def prepare_images():
    PREP.mkdir(parents=True, exist_ok=True)
    logo = Image.open(LOGO_PNG).convert('RGBA')
    for title, key, _ in CATEGORIES:
        sources = image_files(key)
        for i, source in enumerate(sources):
            with Image.open(source) as raw:
                base = ImageOps.fit(raw.convert('RGB'), (1000, 760), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
            base = base.convert('RGBA')
            stamp_logo = logo.copy()
            stamp_logo.thumbnail((215, 66), Image.Resampling.LANCZOS)
            pad = 12
            badge = Image.new('RGBA', (stamp_logo.width + pad * 2, stamp_logo.height + pad * 2), (255, 255, 255, 224))
            badge.alpha_composite(stamp_logo, (pad, pad))
            # Brand the fresh web image without obscuring the packaging itself.
            base.alpha_composite(badge, (base.width - badge.width - 24, base.height - badge.height - 24))
            out = PREP / f'{key}-{i+1}.png'
            base.convert('RGB').save(out, optimize=True)


def insert_photo(page, path, x, y, w, h, border=True):
    if border:
        rect(page, x - 8, y - 8, x + w + 8, y + h + 8, fill=WHITE, border=WHITE, border_width=2)
    page.insert_image(fitz.Rect(x, y, x + w, y + h), filename=str(path), keep_proportion=False, overlay=True)


def photo_path(key, index):
    return PREP / f'{key}-{index}.png'


def footer(page, page_no=None):
    text(page, 'help@primepackagingboxes.com', 128, 758, 14, NAVY, 'hebo')
    text(page, '•', 418, 758, 14, RED, 'hebo')
    text(page, '818-758-4076', 444, 758, 14, NAVY, 'hebo')
    text(page, '•', 635, 758, 14, RED, 'hebo')
    text(page, 'FREE US & UK SHIPPING  |  100 UNIT MOQ', 662, 758, 13, NAVY, 'hebo')
    text(page, 'PRIME PACKAGING BOXES  •  CUSTOM PRINTED PACKAGING', 128, 785, 11, MUTED, 'hebo')
    if page_no:
        text(page, f'{page_no:02d}', 1360, 785, 11, MUTED, 'hebo')


def header(page, title=None, page_no=None):
    page.draw_rect(fitz.Rect(0, 0, W, H), color=BG, fill=BG, overlay=True)
    corner_frame(page)
    page.insert_image(fitz.Rect(60, 28, 285, 92), filename=str(LOGO_PNG), keep_proportion=True, overlay=True)
    if title:
        centered_text(page, title, 72, 44, NAVY, 'tiro')
    if page_no:
        footer(page, page_no)


def cover(doc):
    page = doc.new_page(width=W, height=H)
    header(page)
    text(page, 'Product', 82, 244, 78, NAVY, 'tiit')
    text(page, 'CATALOGUE', 72, 324, 68, RED, 'tiro')
    text(page, 'Premium custom packaging for brands that want\na memorable unboxing experience.', 78, 388, 24, INK, 'helv', width=540, height=75)
    text(page, 'SAME BOX TYPES. FRESH PACKAGING REFERENCES.', 80, 490, 16, NAVY, 'hebo')
    text(page, 'Custom structures • Print-ready artwork • USA & UK support', 80, 522, 14, MUTED, 'helv')
    # Fresh web images only; no storefront catalogue imagery.
    insert_photo(page, photo_path('rigid', 1), 700, 150, 300, 245)
    insert_photo(page, photo_path('cosmetic', 1), 1024, 150, 300, 245)
    insert_photo(page, photo_path('corrugated', 1), 700, 432, 300, 245)
    insert_photo(page, photo_path('gable', 1), 1024, 432, 300, 245)
    rect(page, 80, 595, 490, 641, fill=NAVY, border=NAVY, border_width=0, radius=12)
    text(page, 'primepackagingboxes.com', 104, 624, 18, WHITE, 'hebo')
    text(page, 'help@primepackagingboxes.com   |   818-758-4076', 80, 730, 15, NAVY, 'hebo')


def category_page(doc, number, title, key, description):
    page = doc.new_page(width=W, height=H)
    header(page, title, number)
    positions = [
        (108, 116, 250, 190, 1), (397, 116, 250, 190, 2), (686, 116, 250, 190, 3),
        (108, 385, 430, 196, 4), (572, 385, 430, 196, 1), (1034, 116, 300, 465, 2),
    ]
    for x, y, w, h, index in positions:
        insert_photo(page, photo_path(key, index), x, y, w, h)
    text(page, description.upper(), 112, 647, 14, NAVY, 'hebo', width=850, height=32)
    text(page, 'AVAILABLE IN CUSTOM SHAPES, SIZES & CARD THICKNESS  •  FULL COLOR CMYK / PMS', 112, 680, 12, MUTED, 'helv', width=880, height=20)
    footer(page, number)


def design_page(doc, number):
    page = doc.new_page(width=W, height=H)
    header(page)
    text(page, 'Design layout', 80, 108, 62, NAVY, 'tiro')
    text(page, 'The Prime Packaging team helps turn your structure, artwork, and finish into a production-ready box.', 84, 158, 20, MUTED, 'helv', width=700, height=45)
    insert_photo(page, photo_path('rigid', 4), 760, 150, 520, 430)
    insert_photo(page, photo_path('kraft', 2), 90, 310, 260, 220)
    text(page, 'CUSTOM PACKAGING, CLEARLY PRESENTED.', 90, 600, 20, RED, 'hebo')
    text(page, 'Free design support • Practical artwork guidance • Print-ready proofing', 90, 635, 16, NAVY, 'helv')
    footer(page, number)


def specification_page(doc, number):
    page = doc.new_page(width=W, height=H)
    header(page)
    rect(page, 96, 106, 1344, 176, fill=NAVY, border=NAVY, border_width=0, radius=16)
    centered_text(page, 'SPECIFICATION', 155, 32, WHITE, 'hebo')
    rows = [
        ('Stocks Available', '100lb C1S / C2S, 120lb C1S / C2S, 200lb C1S / C2S, Kraft Card Stock, Corrugate Stock'),
        ('Color Choice', 'Full Color CMYK / PMS (Pantone Matching System) Printing Process'),
        ('Finishing Type', 'Gloss Lamination, Matte Lamination, Gloss AQ, Gloss UV, Spot UV, Embossing, Foiling'),
        ('Included Options', 'Die Cutting, Gluing, Scored, Perforation, Windows, Inserts, Custom Closures'),
        ('Color Mode', 'CMYK with print-ready artwork proofing before production'),
        ('Artwork Requirements', 'Layered artwork file with accurate die-line; die-line and design on separate layers; text content outlined.'),
    ]
    y = 215
    for i, (label, value) in enumerate(rows):
        fill = (0.91, 0.91, 0.91) if i % 2 else (0.985, 0.98, 0.96)
        rect(page, 96, y, 1344, y + 62, fill=fill, border=fill, border_width=0)
        text(page, label.upper(), 122, y + 38, 15, NAVY, 'hebo')
        text(page, value, 410, y + 37, 14, MUTED, 'helv', width=850, height=40)
        y += 69
    footer(page, number)


def process_page(doc, number):
    page = doc.new_page(width=W, height=H)
    header(page)
    centered_text(page, 'Easy and Swift Process', 95, 54, NAVY, 'tiro')
    text(page, 'OUR SIMPLE ORDERING PROCESS ENSURES A BETTER CUSTOMER EXPERIENCE.', 0, 140, 16, MUTED, 'hebo', align=1, width=W, height=28)
    cards = [
        ('Place order', 'rigid', 1, 'Tell us your box type, dimensions, quantity, and delivery destination.'),
        ('Design Approval', 'cosmetic', 2, 'Review your structure and artwork options with our creative support team.'),
        ('Production', 'corrugated', 3, 'Quality checks, responsive communication, and dependable turnaround.'),
        ('Delivery', 'gable', 4, 'Your packaging ships directly to your business or fulfillment location.'),
    ]
    xs = [110, 430, 750, 1070]
    for x, (label, key, index, body) in zip(xs, cards):
        insert_photo(page, photo_path(key, index), x, 205, 250, 190)
        text(page, label, x, 438, 19, RED, 'hebo')
        text(page, body, x, 468, 13, MUTED, 'helv', width=250, height=58)
    rect(page, 86, 625, 920, 675, fill=(0.89, 0.90, 0.95), border=(0.89, 0.90, 0.95), border_width=0, radius=10)
    text(page, 'Get in touch for your next branded packaging run.', 112, 657, 20, NAVY, 'hebo')
    footer(page, number)


def contact_page(doc, number):
    page = doc.new_page(width=W, height=H)
    header(page)
    text(page, 'Your Trusted Packaging Experts', 90, 210, 50, NAVY, 'tiro')
    text(page, 'Fresh packaging references for the same box types shown throughout this catalogue.', 92, 260, 20, MUTED, 'helv', width=620, height=52)
    insert_photo(page, photo_path('rigid', 3), 760, 150, 250, 210)
    insert_photo(page, photo_path('display', 1), 1035, 150, 250, 210)
    insert_photo(page, photo_path('kraft', 3), 760, 405, 250, 210)
    insert_photo(page, photo_path('dispenser', 2), 1035, 405, 250, 210)
    text(page, 'CALL', 92, 400, 14, RED, 'hebo')
    text(page, '818-758-4076', 92, 432, 24, NAVY, 'hebo')
    text(page, 'EMAIL', 92, 490, 14, RED, 'hebo')
    text(page, 'help@primepackagingboxes.com', 92, 522, 20, NAVY, 'hebo')
    text(page, 'primepackagingboxes.com', 92, 588, 18, NAVY, 'hebo')
    text(page, '444 Alaska Avenue Suite, Torrance, CA 90503, USA', 760, 680, 14, MUTED, 'helv')
    footer(page, number)


def main():
    make_logo_png()
    prepare_images()
    doc = fitz.open()
    cover(doc)
    for idx, (title, key, description) in enumerate(CATEGORIES, start=2):
        category_page(doc, idx, title, key, description)
    design_page(doc, 12)
    specification_page(doc, 13)
    process_page(doc, 14)
    contact_page(doc, 15)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(OUT, garbage=4, deflate=True)
    print(f'created {OUT} with {len(doc)} pages and {OUT.stat().st_size/1024/1024:.1f} MB')


if __name__ == '__main__':
    main()
