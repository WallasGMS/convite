"""Header illustrations for the invitation designs (OpenAI Images, run locally like gen_images.py).

Run:  python tools/gen_decos.py                # only missing
      python tools/gen_decos.py religioso boda-elegante --force
Output: img/deco/<theme>.webp (960 px wide, transparent, trimmed) + img/deco/sm/<theme>.webp (360 px, editor thumbnails).
Prints the aspect ratio of each image; css/invite.css uses it for --deco-top-ratio.
"""
import base64, io, sys, urllib.error
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).parent))
from gen_images import api_key, generate, MODELS, ROOT  # noqa: E402

OUT = ROOT / 'img' / 'deco'
BASE = ('Decorative header for a digital party invitation. Wide horizontal banner: the motif runs across the top and both '
        'upper corners, the lower middle stays empty for text. Transparent background, no frame, no text, no letters, '
        'no logos, no watermark. Not photorealistic, no 3D render. Original artwork, no existing characters. ')
# theme id -> (motif and style, palette)
DECOS = {
    # current designs
    'clasico': ('delicate engraved botanical garland, thin leaves and small flowers, fine ink line art with soft fill', 'antique gold #a8844a and navy #1f2a44'),
    'fiesta': ('festive paper bunting flags, streamers, confetti and two balloons, flat paper-cut style', 'coral #ff5a5f, teal #0f7a70, yellow #ffc94a'),
    'minimal': ('one single thin continuous line drawing of a small olive branch, very minimal, lots of empty space', 'black #141414'),
    'cielo': ('soft fluffy clouds, tiny stars and a small hot air balloon, gentle watercolor', 'sky blue #3f8ed0 and white'),
    'floral': ('lush garland of garden roses, peonies and leaves, loose watercolor', 'dusty rose #c7757f, blush, sage green'),
    'dorado': ('art deco golden fan shapes and sunburst lines with small stars, elegant gold foil look on dark', 'metallic gold #d4af37'),
    'xv-rosa': ('quinceañera tiara surrounded by pink roses, butterflies and sparkles, soft watercolor', 'pink #d6457e, blush, gold'),
    'boda-salvia': ('eucalyptus and olive branches with small white flowers, loose watercolor', 'sage green #6f845f, cream'),
    'bebe-azul': ('cute baby clouds, a little moon, stars and a tiny teddy bear, soft pastel watercolor', 'baby blue #5fa3d6, cream'),
    'bebe-rosa': ('cute pastel clouds, little hearts, stars and a tiny bunny, soft watercolor', 'baby pink #ee7d9c, cream'),
    'noche': ('crescent moon, constellations and twinkling stars over soft clouds, dreamy illustration on dark', 'gold #f2d388 on midnight blue'),
    'tropical': ('tropical monstera and palm leaves with hibiscus flowers and a pineapple, flat paper-cut style', 'pink #ff4f8b, green, yellow'),
    'globos': ('bunch of colorful party balloons with curly strings and confetti, flat cheerful style', 'red #ef476f, teal, yellow, blue'),
    'deportivo': ('soccer ball, trophy, stars and pennant flags, flat sporty illustration', 'green #1f9d55, white, yellow'),
    'rustico': ('wooden branches, wildflowers, mason jar lights string and burlap ribbon, warm hand-drawn style', 'brown #8a5a33, cream, sage'),
    'boho': ('pampas grass, dried palm leaves and terracotta arches with small suns, boho flat style', 'terracotta #c2693f, sand, olive'),
    'vintage': ('vintage engraved roses with ribbon banner shape (empty) and small birds, old print style', 'sepia brown #8b5e34, cream'),
    'negro-oro': ('art deco geometric gold ornament with fans and diamonds, luxurious', 'metallic gold #d4af37 on black'),
    'religioso': ('a graceful white dove with an olive branch among soft clouds and gentle golden light rays, delicate watercolor, elegant', 'soft blue #6f9cc0, white, pale gold'),
    'playa': ('seashells, starfish, gentle waves and a palm leaf, beach watercolor', 'turquoise #1fb5c4, sand, coral'),
    'mexicana': ('papel picado banners, marigolds, small piñata and maracas, vibrant flat folk art', 'magenta #e6007e, orange, turquoise, yellow'),
    'princesa': ('fairy tale castle silhouette, crown, stars and sparkles, soft pastel watercolor', 'lilac #b676d9, pink, gold'),
    'graduacion': ('graduation caps tossed in the air, laurel branches and diplomas with ribbon, elegant flat style', 'gold #b8892a, navy'),
    'acuarela': ('loose watercolor splashes with wildflowers and leaves, artistic and soft', 'rose #d98a9a, peach, sage'),
    # new designs
    'boda-elegante': ('white garden roses and peonies with thin gold leaves, elegant luxury wedding stationery, fine watercolor with gold line accents', 'ivory, white, gold #b08d57, soft green'),
    'boda-jardin': ('lush greenery garland, eucalyptus, ferns and white anemones, botanical watercolor', 'deep green #4f6b4a, white, cream'),
    'boda-marino': ('fine gold botanical line art, leaves and roses, elegant wedding on dark navy', 'gold #c9a45c on navy blue'),
    'cumple-heroe': ('comic book city skyline at sunset with a generic caped hero silhouette flying, POW style burst shapes without letters, lightning bolts and halftone dots, bold comic illustration', 'red #e63946, yellow #ffd23f, blue #1d4ed8, black outlines'),
    'cumple-elegante': ('champagne glasses toasting, gold balloons and elegant confetti, luxury birthday', 'gold #d8b46a, emerald green, black'),
    'cumple-cute': ('kawaii birthday: a smiling cake with a candle, cute bunny and bear with party hats, stars and hearts, chibi pastel style', 'pastel pink #ff7eb6, mint, lemon'),
    'grad-formal': ('golden laurel wreath branches, a graduation cap and rolled diploma with navy ribbon, formal engraved style', 'gold #b8892a, navy #1d2a44, ivory'),
    'grad-noche': ('graduation caps flying with golden stars and streamers, elegant celebration on dark navy', 'gold #e0c068 on navy'),
    'otaku-sakura': ('anime style cherry blossom branches with falling petals, small paper lanterns and a soft sky, beautiful Japanese anime background art style', 'sakura pink #e86a92, white, soft lilac'),
    'otaku-manga': ('manga style speed lines, halftone dots, comic action burst shapes without letters, stars and sparkles, black ink manga look', 'black and white with red #ff3b3b accents'),
    'otaku-kawaii': ('kawaii anime style cute items: boba tea, onigiri, stars, clouds and sparkles all with tiny happy faces, chibi pastel', 'lavender #8b6cff, pink, mint'),
    'revelacion': ('pink and blue balloons, confetti, a big question-mark-shaped balloon, baby footprints, cheerful flat style', 'pink #f28bb3 and blue #6fb3e8'),
    'aniversario': ('two intertwined rings among red roses and gold leaves, romantic elegant watercolor', 'burgundy #8c1c3b, gold, blush'),
}


def make(key, model, tid):
    motif, palette = DECOS[tid]
    raw = generate(key, model, f'{BASE}Motif: {motif}. Colors: {palette}.', size='1536x1024', background='transparent', output_format='png')
    img = Image.open(io.BytesIO(raw)).convert('RGBA')
    box = img.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    if not box:
        raise RuntimeError('empty image')
    img = img.crop(box)
    for w, dest in ((960, OUT / f'{tid}.webp'), (360, OUT / 'sm' / f'{tid}.webp')):
        im = img.resize((w, round(img.height * w / img.width)), Image.LANCZOS) if img.width > w else img
        im.save(dest, 'WEBP', quality=80, method=6)
    return img.width, img.height, img.getpixel((img.width // 2, img.height - 1))[3]


NEW = {'boda-elegante', 'boda-jardin', 'boda-marino', 'cumple-heroe', 'cumple-elegante', 'cumple-cute', 'grad-formal',
       'grad-noche', 'otaku-sakura', 'otaku-manga', 'otaku-kawaii', 'revelacion', 'aniversario'}  # no SVG bottom ornament


def write_css():
    """Rewrite the generated block at the end of css/invite.css from the images that exist."""
    css = ROOT / 'css' / 'invite.css'
    start, end = '/* @deco:start (tools/gen_decos.py) */', '/* @deco:end */'
    lines = [start, '.inv[data-theme] .inv-deco--top { background-size: contain; background-position: center top; }']
    for f in sorted(OUT.glob('*.webp')):
        tid = f.stem
        w, h = Image.open(f).size
        ratio = max(w / h, 2.2)  # a tall image would push the name too far down
        extra = ' --deco-bottom: none; --deco-bottom-ratio: 12 / 1;' if tid in NEW else ''
        lines.append(f'.inv[data-theme="{tid}"] {{ --deco-top: url("../img/deco/{tid}.webp"); --deco-top-ratio: {ratio:.3f};{extra} }}')
        lines.append(f'.ed-thumb .inv[data-theme="{tid}"] {{ --deco-top: url("../img/deco/sm/{tid}.webp"); }}')
    lines.append(end)
    s = css.read_text(encoding='utf-8')
    if start in s:
        s = s[:s.index(start)].rstrip('\n')
    css.write_text(s + '\n\n' + '\n'.join(lines) + '\n', encoding='utf-8', newline='')
    print('css/invite.css: estilos de', len(lines) // 2 - 1, 'ilustraciones')


def main(args):
    if '--css' in args:
        return write_css()
    key = api_key()
    if not key:
        sys.exit('Falta la clave: escribe OPENAI_API_KEY=sk-... en private/.env')
    force = '--force' in args
    ids = [a for a in args if not a.startswith('--')] or list(DECOS)
    (OUT / 'sm').mkdir(parents=True, exist_ok=True)
    mi = 0
    for tid in ids:
        if (OUT / f'{tid}.webp').exists() and not force:
            print('ya existe', tid); continue
        while True:
            try:
                w, h, _ = make(key, MODELS[mi], tid); break
            except urllib.error.HTTPError as e:
                body = e.read().decode(errors='replace')
                if e.code in (400, 404) and 'model' in body.lower() and mi + 1 < len(MODELS):
                    mi += 1; continue
                sys.exit(f'Error {e.code} en {tid}: {body[:300]}')
        print(f'ok {tid} {w}x{h} ratio {w / h:.2f}', flush=True)
    write_css()


if __name__ == '__main__':
    main(sys.argv[1:])
