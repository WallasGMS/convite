"""Adornos del personalizador (premium): siluetas de un color que la invitación pinta con el color elegido.

Run:  python tools/gen_orns.py               # solo los que faltan
      python tools/gen_orns.py lazos --force
Output: img/orn/<id>.webp (arriba), img/orn/<id>-b.webp (abajo, el mismo volteado), img/orn/sm/<id>.webp (editor). Solo cuenta el canal alfa:
css/invite.css los usa como máscara, así que cualquier color que elija la persona funciona.
"""
import io, sys, urllib.error
from pathlib import Path
from PIL import Image, ImageOps
sys.path.insert(0, str(Path(__file__).parent))
from gen_images import api_key, generate, MODELS, ROOT  # noqa: E402

OUT = ROOT / 'img' / 'orn'
BASE = ('A wide decorative header garland for the top edge of an invitation card: a horizontal composition spanning '
        'the full width, fuller at the left and right ends and lighter toward the center, leaving the middle mostly open. '
        'Solid pure black monochrome line art and silhouettes only, one single flat color, no gray, no shading, no gradients, '
        'transparent background. Elegant hand-drawn illustration, crisp clean lines. No text, no letters, no side borders, '
        'no frame. Original artwork. Motif: ')
ORNS = {
    'lazos': 'delicate coquette ribbon bows tied along a thin draped ribbon, with a few small pearls',
    'eucalipto': 'eucalyptus branches with round leaves',
    'pampas': 'boho pampas grass plumes and dried palm leaves',
    'limones': 'Mediterranean lemons with leaves and small blossoms',
    'olivo': 'olive branches with small olives',
    'silvestres': 'fine wildflowers and tiny daisies, minimalist line art',
    'girasoles': 'sunflowers with leaves',
    'celestial': 'a sun, crescent moons and sparkling stars, celestial',
    'disco': 'disco balls hanging on strings with little sparkles, retro party',
    'cerezas': 'pairs of cherries with leaves and tiny bows',
    'rosas': 'roses and rosebuds with leaves, fine line art',
    'laurel': 'a symmetric laurel garland arc with a small crest at the center, classic and regal',
}


def make(key, model, oid):
    raw = generate(key, model, BASE + ORNS[oid], size='1536x1024', background='transparent', output_format='png')
    a = Image.open(io.BytesIO(raw)).convert('RGBA').getchannel('A')
    a = a.crop(a.point(lambda v: 255 if v > 8 else 0).getbbox())
    a = a.resize((960, max(1, round(a.height * 960 / a.width))), Image.LANCZOS)
    img = Image.new('RGBA', a.size, (0, 0, 0, 0)); img.putalpha(a)
    img.save(OUT / f'{oid}.webp', 'WEBP', quality=80, method=6)
    ImageOps.flip(img).save(OUT / f'{oid}-b.webp', 'WEBP', quality=80, method=6)
    (OUT / 'sm').mkdir(exist_ok=True)
    img.thumbnail((240, 120), Image.LANCZOS)  # miniatura del editor
    img.save(OUT / 'sm' / f'{oid}.webp', 'WEBP', quality=70, method=6)


def main(args):
    key = api_key()
    if not key:
        sys.exit('Falta la clave: escribe OPENAI_API_KEY=sk-... en private/.env')
    force = '--force' in args
    OUT.mkdir(parents=True, exist_ok=True)
    mi = 0
    for oid in [a for a in args if not a.startswith('--')] or list(ORNS):
        if (OUT / f'{oid}.webp').exists() and not force:
            print('ya existe', oid); continue
        while True:
            try:
                make(key, MODELS[mi], oid); break
            except urllib.error.HTTPError as e:
                body = e.read().decode(errors='replace')
                if e.code in (400, 404) and 'model' in body.lower() and mi + 1 < len(MODELS):
                    mi += 1; continue
                sys.exit(f'Error {e.code} en {oid}: {body[:300]}')
        print('ok', oid, flush=True)


if __name__ == '__main__':
    main(sys.argv[1:])
