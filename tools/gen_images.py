"""Generate Convite's illustrations with the OpenAI Images API (run locally, never from the website).

Key: put OPENAI_API_KEY=sk-... in private/.env (git-ignored) or in the environment.
Run:  python tools/gen_images.py            # only missing images
      python tools/gen_images.py --force    # redo all
      python tools/gen_images.py boda xv    # only these
Output: img/eventos/<id>.webp (800 px). Costs a few cents per image on your OpenAI account.
"""
import base64, io, json, os, sys, urllib.error, urllib.request
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'img' / 'eventos'
# ponytail: model ids changed twice in 2026; try newest first, fall back on "unknown model".
MODELS = [os.environ.get('OPENAI_IMAGE_MODEL')] if os.environ.get('OPENAI_IMAGE_MODEL') else [
    'gpt-image-2.6-flare', 'gpt-image-2.5-flare', 'gpt-image-2']

STYLE = ('Flat paper-cut illustration, hand-made look, soft grain, simple shapes, warm festive palette '
         '(deep green #0f5a4e, marigold #f5b318, rose #e23d5e, cream background #fbf6ec). '
         'Not photorealistic, no 3D render, no text, no letters, no logos, no faces in detail. '
         'Centered composition with generous empty margin, square.')
SCENES = {
    'cumple': 'a birthday cake with candles, confetti and two balloons',
    'xv': 'a quinceañera tiara on a cushion with roses and a small ribbon, Latin American XV años party',
    'boda': 'two wedding rings, a small bouquet of white flowers and a ribbon',
    'baby': 'a baby bottle, a rattle and a tiny knitted sock with little stars',
    'revelacion': 'a big balloon with a question mark shape made of confetti, pink and blue confetti around',
    'bautizo': 'a white dove above a baptism shell with water drops and an olive branch',
    'comunion': 'a golden chalice with a host and a small white flower wreath',
    'graduacion': 'a graduation cap, a rolled diploma with a ribbon and laurel leaves',
    'aniversario': 'two champagne glasses toasting with small hearts and sparkles',
    'otro': 'a festive envelope with a wax seal surrounded by papel picado banners and confetti',
}


def api_key():
    if os.environ.get('OPENAI_API_KEY'):
        return os.environ['OPENAI_API_KEY'].strip()
    env = ROOT / 'private' / '.env'
    if env.exists():
        for line in env.read_text(encoding='utf-8').splitlines():
            if line.strip().startswith('OPENAI_API_KEY='):
                return line.split('=', 1)[1].strip().strip('"\'')
    return ''


def generate(key, model, prompt, **extra):
    req = urllib.request.Request(
        'https://api.openai.com/v1/images/generations',
        data=json.dumps({'model': model, 'prompt': prompt, 'size': '1024x1024', 'n': 1, **extra}).encode(),
        headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=180) as r:
        item = json.load(r)['data'][0]
    if item.get('b64_json'):
        return base64.b64decode(item['b64_json'])
    with urllib.request.urlopen(item['url'], timeout=120) as r:  # some models answer with a URL
        return r.read()


def main(args):
    key = api_key()
    if not key:
        sys.exit('Falta la clave: escribe OPENAI_API_KEY=sk-... en private/.env')
    force = '--force' in args
    ids = [a for a in args if not a.startswith('--')] or list(SCENES)
    OUT.mkdir(parents=True, exist_ok=True)
    model_i = 0
    for eid in ids:
        dest = OUT / f'{eid}.webp'
        if dest.exists() and not force:
            print('ya existe', dest.name); continue
        prompt = f'{SCENES[eid]}. {STYLE}'
        while True:
            try:
                raw = generate(key, MODELS[model_i], prompt); break
            except urllib.error.HTTPError as e:
                body = e.read().decode(errors='replace')
                if e.code in (400, 404) and 'model' in body.lower() and model_i + 1 < len(MODELS):
                    print(f'modelo {MODELS[model_i]} no disponible, probando {MODELS[model_i + 1]}')
                    model_i += 1; continue
                sys.exit(f'Error {e.code} de OpenAI: {body[:300]}')
        img = Image.open(io.BytesIO(raw)).convert('RGB').resize((800, 800), Image.LANCZOS)
        img.save(dest, 'WEBP', quality=82, method=6)
        print(f'ok {dest.name} ({dest.stat().st_size // 1024} KB, {MODELS[model_i]})')


if __name__ == '__main__':
    main(sys.argv[1:])
