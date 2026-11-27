"""Wax seals for the envelope screen (OpenAI Images, local only). One per design.

Run:  python tools/gen_seals.py             # only missing
      python tools/gen_seals.py religioso --force
Output: img/sello/<theme>.webp (256 px, transparent). Then: python tools/gen_decos.py --css
"""
import io, sys, urllib.error
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).parent))
from gen_images import api_key, generate, MODELS, ROOT  # noqa: E402

OUT = ROOT / 'img' / 'sello'
BASE = ('A single round wax seal stamp seen from the front, centered, filling most of the square, with soft irregular '
        'melted wax edges and an embossed motif. Transparent background, no shadow outside the seal, no text, no letters, '
        'no initials, no logos. Illustrated look with gentle shading, not photorealistic. Original artwork. ')
SEALS = {
    'clasico': ('a laurel wreath', 'antique gold wax'), 'fiesta': ('a five-pointed star with confetti', 'coral red wax'),
    'minimal': ('a single olive sprig, very simple', 'matte black wax'), 'cielo': ('a fluffy cloud', 'sky blue wax'),
    'floral': ('a garden rose', 'dusty rose wax'), 'dorado': ('an art deco sunburst', 'shiny gold wax'),
    'xv-rosa': ('a princess tiara', 'pink wax with gold shimmer'), 'boda-salvia': ('two wedding rings with leaves', 'sage green wax'),
    'bebe-azul': ('a crescent moon with a small star', 'baby blue wax'), 'bebe-rosa': ('a small heart with bunny ears', 'baby pink wax'),
    'noche': ('a crescent moon and stars', 'midnight blue wax with gold details'), 'tropical': ('a hibiscus flower', 'hot pink wax'),
    'globos': ('a party balloon', 'bright red wax'), 'deportivo': ('a soccer ball', 'green wax'),
    'rustico': ('a wildflower with wheat', 'warm brown wax'), 'boho': ('a rising sun with rays', 'terracotta wax'),
    'vintage': ('an engraved rose', 'sepia brown wax'), 'negro-oro': ('an art deco diamond ornament', 'black wax with gold edges'),
    'religioso': ('a dove with an olive branch', 'white pearl wax with pale gold'), 'playa': ('a seashell', 'turquoise wax'),
    'mexicana': ('a marigold flower', 'magenta wax'), 'princesa': ('a royal crown', 'lilac wax'),
    'graduacion': ('a graduation cap', 'navy blue wax with gold'), 'acuarela': ('a small wildflower bouquet', 'soft rose wax'),
    'boda-elegante': ('a peony flower', 'ivory wax with gold leaf'), 'boda-jardin': ('an anemone flower with leaves', 'deep green wax'),
    'boda-marino': ('a rose in fine lines', 'navy blue wax with gold'), 'cumple-heroe': ('a lightning bolt inside a star, comic book style', 'red wax with yellow, bold black outline'),
    'cumple-elegante': ('two champagne glasses toasting', 'emerald green wax with gold'), 'cumple-cute': ('a cute cupcake with a happy face, kawaii', 'pastel pink wax'),
    'grad-formal': ('a graduation cap inside a laurel wreath', 'navy wax with gold'), 'grad-noche': ('a shining star', 'gold wax'),
    'otaku-sakura': ('a sakura cherry blossom flower, anime style', 'sakura pink wax'), 'otaku-manga': ('a manga action burst star with speed lines', 'red wax with black ink outline'),
    'otaku-kawaii': ('a cute star with a happy face, kawaii', 'lavender wax'), 'revelacion': ('two tiny baby footprints', 'wax half pink and half blue'),
    'aniversario': ('two intertwined hearts', 'burgundy wax with gold'),
}


def make(key, model, tid):
    motif, color = SEALS[tid]
    raw = generate(key, model, f'{BASE}Motif: {motif}. Color: {color}.', background='transparent', output_format='png')
    img = Image.open(io.BytesIO(raw)).convert('RGBA')
    box = img.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    img = img.crop(box)
    side = max(img.size)
    sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    sq.alpha_composite(img, ((side - img.width) // 2, (side - img.height) // 2))
    sq.resize((256, 256), Image.LANCZOS).save(OUT / f'{tid}.webp', 'WEBP', quality=82, method=6)


def main(args):
    key = api_key()
    if not key:
        sys.exit('Falta la clave: escribe OPENAI_API_KEY=sk-... en private/.env')
    force = '--force' in args
    OUT.mkdir(parents=True, exist_ok=True)
    mi = 0
    for tid in [a for a in args if not a.startswith('--')] or list(SEALS):
        if (OUT / f'{tid}.webp').exists() and not force:
            print('ya existe', tid); continue
        while True:
            try:
                make(key, MODELS[mi], tid); break
            except urllib.error.HTTPError as e:
                body = e.read().decode(errors='replace')
                if e.code in (400, 404) and 'model' in body.lower() and mi + 1 < len(MODELS):
                    mi += 1; continue
                sys.exit(f'Error {e.code} en {tid}: {body[:300]}')
        print('ok', tid, flush=True)


if __name__ == '__main__':
    main(sys.argv[1:])
