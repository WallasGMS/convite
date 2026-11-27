// "Descargar app": installs Convite on the phone's home screen (PWA).
// Chrome/Android/Edge offer a native prompt; iPhone has none, so we show the two steps instead.
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let prompt = null;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); prompt = e; });
addEventListener('appinstalled', () => document.querySelectorAll('[data-install]').forEach((b) => (b.hidden = true)));

function help() {
  const dlg = document.getElementById('install-dlg');
  dlg.querySelector('[data-ios]').hidden = !ios;
  dlg.querySelector('[data-other]').hidden = ios;
  dlg.showModal();
}

for (const b of document.querySelectorAll('[data-install]')) {
  if (standalone) { b.hidden = true; continue; } // already opened as the app
  b.addEventListener('click', async (e) => {
    e.preventDefault();
    if (prompt) { prompt.prompt(); await prompt.userChoice; prompt = null; return; }
    help();
  });
}
document.getElementById('install-close')?.addEventListener('click', () => document.getElementById('install-dlg').close());
