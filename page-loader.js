/* Quick page transition used across the portfolio.
   Paper-coloured screen, the page's name wiping up, ~600ms in and ~240ms out. */
(function () {
  if (window.__gbLoader) return;
  window.__gbLoader = true;

  /* The editor preview serves pages with an auth query (?t=...). A bare relative
     href drops it and the navigation dies, so carry the current query across. */
  function withQuery(href) {
    var qs = location.search;
    if (!qs || href.indexOf('?') > -1) return href;
    var i = href.indexOf('#');
    return i > -1 ? href.slice(0, i) + qs + href.slice(i) : href + qs;
  }
  function isDark() {
    var a = document.documentElement.getAttribute('data-gb-theme');
    if (a) return a === 'dark';
    try { var s = localStorage.getItem('gb-theme'); if (s) return s === 'dark'; } catch (e) {}
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
  var NAMES = { tvak: 'Indus Derma', aarogyam: 'Aarogyam', sts: 'STS', mai: 'Mai', ojas: 'Ojas', about: 'About', articles: 'Writing', 'portfolio about': 'About' };
  var SCRIPT_LABEL = (document.currentScript && document.currentScript.dataset.label) || '';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IN_MS = REDUCED ? 160 : 620;

  function nameFrom(path) {
    var f = decodeURIComponent(String(path).split(/[?#]/)[0].split('/').pop() || '').replace(/\.dc\.html$|\.html$/i, '');
    if (!f || /^index$/i.test(f) || /^landing/i.test(f)) return 'Gayatri Bodke';
    f = f.replace(/^(article|note|writing)\s*[-–—]\s*/i, '');
    f = f.replace(/\s*Case Study.*$/i, '').trim();
    if (/^article-/i.test(f)) return 'Writing';
    return NAMES[f.toLowerCase()] || f || 'Gayatri Bodke';
  }
  function ready() { document.documentElement.setAttribute('data-gb-ready', ''); }
  function isHome(path) { return nameFrom(path) === 'Gayatri Bodke'; }
  function label() { return SCRIPT_LABEL || nameFrom(location.pathname); }

  /* The page's <head> already painted the loader; adopt it. Build one only as a fallback. */
  var el = document.querySelector('[data-gb-loader]');
  var T0 = window.__gbLoaderT0 || Date.now();
  if (!el) {
    el = document.createElement('div');
    el.setAttribute('data-gb-loader', '');
    el.style.cssText = 'position:fixed; inset:0; z-index:9999; background:' + (isDark() ? '#15130F' : '#FFFFFF') + '; display:flex; align-items:center; justify-content:center; transition:opacity .24s ease, visibility .24s ease';
    el.innerHTML =
      '<div style="overflow:hidden; padding:0 6px">' +
        '<div style="font-family:\'Instrument Serif\',Georgia,serif; font-size:clamp(30px,5vw,54px); letter-spacing:-.5px; color:' + (isDark() ? '#F0EAE0' : '#241F18') + '; line-height:1.1; transform:translateY(102%); animation:gbLoadUp .5s cubic-bezier(.22,1,.36,1) forwards">' + label() + '</div>' +
        '<div style="height:2px; margin-top:12px; background:' + (isDark() ? '#322D25' : '#EDE7DA') + '; overflow:hidden"><div style="height:100%; width:100%; background:' + (isDark() ? '#B5A6EC' : '#4E4187') + '; transform:scaleX(0); transform-origin:left; animation:gbLoadBar ' + (IN_MS / 1000) + 's cubic-bezier(.4,0,.2,1) forwards"></div></div>' +
      '</div>';
  }

  var css = null;
  function styleEl() {
    if (!css) {
      css = document.createElement('style');
      css.textContent = KEYFRAMES;
    }
    if (!css.parentNode) document.head.appendChild(css);
    return css;
  }
  var KEYFRAMES = '@keyframes gbLoadUp{to{transform:translateY(0)}}@keyframes gbLoadBar{to{transform:scaleX(1)}}[data-gb-loader-hidden]{opacity:0 !important; visibility:hidden !important; pointer-events:none !important}';

  /* Mounted on <html>, not <body>: it shows before the body exists and isn't hidden by the
     dark-mode pre-paint gate. It lifts once the minimum time has passed AND the page has
     loaded (theme painted), capped so a slow image never holds it. */
  /* Lifts once the bar has run AND fonts are in (so the page underneath is painted), capped at 1.4s. */
  function mount() {
    styleEl();
    if (!el.parentNode) document.documentElement.appendChild(el);
    var done = false;
    function lift() {
      if (done) return;
      done = true;
      requestAnimationFrame(function () { requestAnimationFrame(hide); });
    }
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    var minWait = new Promise(function (res) { setTimeout(res, Math.max(0, IN_MS - (Date.now() - T0))); });
    Promise.all([fonts, minWait]).then(lift, lift);
    setTimeout(lift, Math.max(0, 1400 - (Date.now() - T0)));
  }
  function hide() {
    ready();
    el.setAttribute('data-gb-loader-hidden', '');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
  }

  mount();
  wireExit();

  /* Coming back with the browser's Back button restores the page as it was left, exit screen included. Clear it. */
  window.addEventListener('pageshow', function () {
    document.querySelectorAll('[data-gb-exit]').forEach(function (n) { n.remove(); });
    var l = document.querySelector('[data-gb-loader]');
    if (l) l.remove();
    ready();
  });

  /* Exit transition: fade to the destination's name (static) before navigating. The next page's
     head loader shows the same name without re-animating it, so it reads as one continuous screen. */
  function wireExit() {
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    var href = a.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#' || a.target === '_blank' || /^(mailto:|tel:|https?:)/i.test(href)) return;
    if (/\.pdf$/i.test(href)) return;
    e.preventDefault();
    var out = document.createElement('div');
    out.setAttribute('data-gb-exit', '');
    out.setAttribute('data-gb-keep', '');
    out.style.cssText = 'position:fixed; inset:0; z-index:9999; background:' + (isDark() ? '#15130F' : '#FFFFFF') + '; opacity:0; transition:opacity .14s ease';
    styleEl();
    var nm = nameFrom(href);
    out.style.display = 'flex'; out.style.alignItems = 'center'; out.style.justifyContent = 'center';
    out.innerHTML =
      '<div style="overflow:hidden; padding:0 6px">' +
        '<div style="font-family:\'Instrument Serif\',Georgia,serif; font-size:clamp(30px,5vw,54px); letter-spacing:-.5px; color:' + (isDark() ? '#F0EAE0' : '#241F18') + '; line-height:1.1">' + nm + '</div>' +
        '<div style="height:2px; margin-top:12px; background:' + (isDark() ? '#322D25' : '#EDE7DA') + '"></div>' +
      '</div>';
    try { sessionStorage.setItem('gb-nav', '1'); } catch (x) {}
    styleEl();
    document.body.appendChild(out);
    requestAnimationFrame(function () { out.style.opacity = '1'; });
    setTimeout(function () { location.href = withQuery(href); }, REDUCED ? 60 : 170);
  }, true);
  }
})();
