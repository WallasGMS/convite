"""Publica el sitio en Cloudflare Pages: https://convitegt.pages.dev

Run:  python tools/deploy_pages.py
Copia solo archivos versionados en git (private/ nunca entra: está en .gitignore), deja fuera herramientas y
notas, agrega el servidor de links cortos como _worker.js y sube con wrangler (sesión de Cloudflare del dueño).
GitHub sigue siendo el respaldo del código: haz git push además de esto.
"""
import shutil, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / '.pages'
SKIP_DIRS = ('tools/', 'worker/', 'private/', '.claude/')
SKIP_FILES = {'.gitignore', '.nojekyll'}

TOML = '''name = "convitegt"
pages_build_output_dir = "dist"
compatibility_date = "2026-11-01"

[[kv_namespaces]]
binding = "KV"
id = "0a6d7a54611240c09e39a47445271e02"
'''


def main():
    files = subprocess.run(['git', 'ls-files'], cwd=ROOT, capture_output=True, text=True, check=True).stdout.split('\n')
    if OUT.exists():
        shutil.rmtree(OUT)
    dist = OUT / 'dist'
    n = 0
    for f in filter(None, files):
        if f.startswith(SKIP_DIRS) or f in SKIP_FILES or f.endswith('.md'):
            continue
        (dist / f).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / f, dist / f)
        n += 1
    shutil.copy2(ROOT / 'worker' / 'index.js', dist / 'api.js')
    shutil.copy2(ROOT / 'worker' / 'pages.js', dist / '_worker.js')
    (OUT / 'wrangler.toml').write_text(TOML, encoding='utf-8')
    print(f'{n} archivos del sitio + _worker.js')
    npx = shutil.which('npx') or 'npx'
    r = subprocess.run([npx, 'wrangler', 'pages', 'deploy', '--branch', 'main', '--commit-dirty=true'], cwd=OUT)
    sys.exit(r.returncode)


if __name__ == '__main__':
    main()
