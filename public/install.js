/* GasDost — "⬇ Install" button for the header.
   Android / desktop Chrome & Edge: opens the browser's own install prompt.
   iPhone / iPad (Safari has no install prompt): shows a 2-step picture guide.
   Hidden once the app is already installed (opened from the home screen). */
(function(){
  const btns = () => document.querySelectorAll('.install-btn');
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let deferred = null;

  function show(on){ btns().forEach(b => { b.style.display = on && !isStandalone() ? (b.classList.contains('install-big') ? 'block' : 'inline-flex') : 'none'; }); }

  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; show(true); });
  window.addEventListener('appinstalled', () => { deferred = null; show(false); note('✅ Installed — open GasDost from your home screen.'); });
  document.addEventListener('DOMContentLoaded', () => { if(isIOS) show(true); });
  if(document.readyState !== 'loading' && isIOS) show(true);

  function note(t){ if(typeof toast === 'function') toast(t); }

  function iosGuide(){
    let m = document.getElementById('installGuide');
    if(!m){
      m = document.createElement('div');
      m.id = 'installGuide';
      m.innerHTML = `
        <div class="ig-card" role="dialog" aria-label="Install GasDost">
          <div class="ig-title">📲 Install GasDost</div>
          <div class="ig-step"><span class="ig-n">1</span><span>Tap the <b>Share</b> button <span class="ig-icon">⬆️</span> at the bottom of Safari</span></div>
          <div class="ig-step"><span class="ig-n">2</span><span>Scroll down and tap <b>Add to Home Screen</b> <span class="ig-icon">➕</span></span></div>
          <div class="ig-step"><span class="ig-n">3</span><span>Tap <b>Add</b>. GasDost appears on your home screen.</span></div>
          <div class="ig-hint">Open this page in <b>Safari</b> for this to work.</div>
          <button class="ig-ok" type="button">OK</button>
        </div>`;
      m.addEventListener('click', e => { if(e.target === m || e.target.classList.contains('ig-ok')) m.style.display = 'none'; });
      document.body.appendChild(m);
    }
    m.style.display = 'flex';
  }

  window.installApp = function(){
    if(deferred){
      deferred.prompt();
      deferred.userChoice.then(() => { deferred = null; show(false); });
      return;
    }
    if(isIOS){ iosGuide(); return; }
    note('Use the browser menu ⋮ → "Install app" / "Add to Home screen".');
  };

  // Styles for the button and the guide (same look in both apps).
  const css = document.createElement('style');
  css.textContent = `
    .install-big{display:none;width:100%;margin-top:12px;padding:12px;border:2px dashed #c62828;border-radius:12px;background:#fff5f5;
      color:#c62828;font-size:15px;font-weight:800;cursor:pointer;}
    #installBtn{display:none;align-items:center;gap:4px;background:#fff;color:#c62828;border:none;border-radius:8px;
      padding:7px 11px;font-size:12.5px;font-weight:800;cursor:pointer;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.15);}
    #installGuide{position:fixed;inset:0;background:rgba(0,0,0,.45);display:none;align-items:flex-end;justify-content:center;z-index:9999;}
    #installGuide .ig-card{background:#fff;color:#1c2530;width:100%;max-width:420px;border-radius:18px 18px 0 0;padding:20px 18px 26px;
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;}
    #installGuide .ig-title{font-size:18px;font-weight:800;margin-bottom:12px;}
    #installGuide .ig-step{display:flex;gap:10px;align-items:flex-start;margin:10px 0;font-size:15px;line-height:1.35;}
    #installGuide .ig-n{flex:0 0 26px;height:26px;border-radius:50%;background:#c62828;color:#fff;font-weight:800;display:flex;align-items:center;justify-content:center;}
    #installGuide .ig-icon{font-size:17px;}
    #installGuide .ig-hint{font-size:12.5px;color:#6b7684;margin-top:8px;}
    #installGuide .ig-ok{margin-top:14px;width:100%;padding:12px;border:none;border-radius:12px;background:#0a6cff;color:#fff;font-size:16px;font-weight:800;}`;
  document.head.appendChild(css);

  if('serviceWorker' in navigator){
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }
})();
