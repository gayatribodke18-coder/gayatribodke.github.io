/* Shared light/dark theme for the portfolio.
   The pages are authored light with inline hex colours, so dark mode works by
   mapping every known palette hex to a dark counterpart at runtime and
   restoring the saved original on the way back. */
(function () {
  if (window.__gbTheme) return;

  var MAP = {
    // paper + surfaces
    '#FFFFFF': '#15130F', '#FEFEFE': '#15130F',
    '#FBFAF8': '#1C1A16', '#FBF7F0': '#15130F', '#FDFBF6': '#1C1A16', '#F5F0E7': '#1C1A16', '#F0E6D6': '#221D17', '#FAF7F1': '#1C1A16', '#F5F4F2': '#1C1A16',
    '#F3F1EC': '#241F19', '#F4EFE6': '#241F19', '#F1ECE1': '#26221B',
    '#F1EEFA': '#201E2B', '#F2EFFA': '#201E2B', '#F6E9EC': '#271C20',
    '#FDF8ED': '#272013', '#DFF0E6': '#172C22', '#525659': '#2A2C2E',
    // lines
    '#EDE7DA': '#322D25', '#E4D7C6': '#3A342A', '#E8E7E4': '#322D25', '#E8E2D6': '#322D25',
    '#E4E2DD': '#322D25', '#E2DCCE': '#3A342A', '#DDD6C6': '#3A342A',
    '#DDDCD9': '#3A342A', '#D5CBB8': '#413A2E',
    '#E4E8EA': '#322D25', '#E1E4E6': '#3A342A', '#D6E5E1': '#2A3C38',
    '#F5F7F8': '#1C1A16', '#F1F7F5': '#17251F', '#D8EAE5': '#26433C',
    '#EFE0BD': '#3B3220', '#FBE7A1': '#F3DB8F',
    '#F2F7F5': '#17251F', '#EAF3F0': '#17251F', '#DDEBE7': '#2A3C38', '#F7EFDC': '#272013',
    '#F1EFEA': '#241F19', '#F0EFEC': '#241F19', '#F7F6F4': '#1C1A16', '#C9C6C0': '#5A5347', '#D8D4CD': '#3A342A',
    // ink
    '#241F18': '#F0EAE0', '#111111': '#F0EAE0', '#222222': '#E6DFD3', '#444444': '#C9C0B2', '#666666': '#B3A996',
    '#3F3410': '#3F3410', '#5A4A1A': '#5A4A1A', '#6B5A22': '#6B5A22', '#8A7430': '#8A7430',
    '#8A6417': '#D8B26A',
    // muted
    '#6F665A': '#A79B89', '#888888': '#A79B89', '#999999': '#A79B89',
    '#9C907A': '#8F8472', '#AAAAAA': '#8F8472',
    '#B4AA96': '#7E7565', '#B0A896': '#7E7565',
    // accents
    '#4E4187': '#B5A6EC', '#2A6B62': '#7CC6B6', '#3E7C63': '#7CC6B6',
    '#BD5836': '#E58A66', '#A85D68': '#E4A6AF'
  };
  // browsers serialise inline styles back as rgb()/rgba(), so both notations matter
  var ALPHA = {
    '255,255,255': '21,19,15',
    '251,247,240': '21,19,15',
    '244,239,230': '36,31,25',
    '240,230,214': '34,29,23',
    '36,31,24': '0,0,0',
    '40,30,20': '0,0,0',
    '20,15,10': '0,0,0',
    '30,30,30': '0,0,0'
  };

  function norm(h) {
    h = h.toUpperCase();
    if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
    return h;
  }
  function toHex(r, g, b) {
    return '#' + [r, g, b].map(function (n) {
      var s = (+n).toString(16).toUpperCase();
      return s.length < 2 ? '0' + s : s;
    }).join('');
  }
  function darken(css) {
    var out = css.replace(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g, function (m) {
      return MAP[norm(m)] || m;
    });
    out = out.replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/g,
      function (m, r, g, b, a) {
        if (a === undefined) {
          var hit = MAP[toHex(r, g, b)];
          return hit || m;
        }
        var base = ALPHA[r + ',' + g + ',' + b];
        return base ? 'rgba(' + base + ',' + a + ')' : m;
      });
    return out;
  }

  // reverse a darkened style string using the element's own light->dark pairs,
  // so JS-driven style changes made while dark don't strand dark colours in light mode
  function variants(hex) {
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return [hex, hex.toLowerCase(), 'rgb(' + r + ', ' + g + ', ' + b + ')', 'rgb(' + r + ',' + g + ',' + b + ')'];
  }
  function lighten(el, cur) {
    var light = el.__gbLight;
    if (light === undefined) return cur;
    if (el.__gbDark === cur) return light;
    var pairs = [];
    light.replace(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g, function (m) {
      var d = MAP[norm(m)];
      if (d && norm(d) !== norm(m)) pairs.push([d, m]);
      return m;
    });
    light.replace(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)/g, function (m) {
      var d = darken(m);
      if (d !== m) pairs.push([d, m]);
      return m;
    });
    var out = cur;
    pairs.forEach(function (p) {
      if (p[0].charAt(0) === '#') variants(norm(p[0])).forEach(function (v) { out = out.split(v).join(p[1]); });
      else out = out.split(p[0]).join(p[1]);
    });
    return out;
  }

  var CSS = [
    'html[data-gb-theme="dark"], html[data-gb-theme="dark"] body { background:#15130F !important; color-scheme: dark; }',
    'html[data-gb-theme="dark"] a { color:#F0EAE0; }',
    'html[data-gb-theme="dark"] a:hover { color:#B5A6EC; }',
    'html[data-gb-theme="dark"] ::selection { background:#4A3F1C; color:#F5EFE2; }',
    'html[data-gb-theme="dark"] img:not([src$=".svg"]) { filter: brightness(.9) contrast(1.02); }',
    'html[data-gb-theme="dark"] [stroke="#111111"], html[data-gb-theme="dark"] [stroke="#241F18"] { stroke:#F0EAE0; }',
    'html[data-gb-theme="dark"] [fill="#111111"], html[data-gb-theme="dark"] [fill="#241F18"] { fill:#F0EAE0; }',
    '[data-nda-copy], [data-nda-form] button[type="submit"], [data-nda-toggle], [data-nda-chip] { transition: background .18s ease, color .18s ease, border-color .18s ease, transform .18s ease; }',
    '[data-nda-copy]:hover, [data-nda-reqform] button[type="submit"]:not(:disabled):hover, [data-nda-form] button[type="submit"]:not(:disabled):hover { background:#241F18 !important; color:#FFFFFF !important; border-color:#241F18 !important; }',
    'html[data-gb-theme="dark"] [data-nda-copy]:hover, [data-nda-reqform] button[type="submit"]:not(:disabled):hover, html[data-gb-theme="dark"] [data-nda-form] button[type="submit"]:not(:disabled):hover { background:#F0EAE0 !important; color:#15130F !important; border-color:#F0EAE0 !important; }',
    '[data-nda-reqform] input, [data-nda-form] input { transition: border-color .15s ease, box-shadow .15s ease; cursor: text; }',
    '[data-nda-reqform] input:hover, [data-nda-form] input:hover { border-color:#B4AA96 !important; }',
    '[data-nda-reqform] input:focus, [data-nda-form] input:focus { border-color:#2A6B62 !important; box-shadow:0 0 0 3px rgba(42,107,98,.16) !important; }',
    'html[data-gb-theme="dark"] [data-nda-reqform] input:focus, html[data-gb-theme="dark"] [data-nda-form] input:focus { border-color:#7CC6B6 !important; box-shadow:0 0 0 3px rgba(124,198,182,.22) !important; }',
    '[data-clear] { transition: background .15s ease, color .15s ease; }',
    '[data-clear]:hover { background:#E8E2D6 !important; color:#241F18 !important; }',
    'html[data-gb-theme="dark"] [data-clear]:hover { background:#3A342A !important; color:#F0EAE0 !important; }',
    '[data-nda-toggle]:hover { color:#241F18 !important; }',
    'html[data-gb-theme="dark"] [data-nda-toggle]:hover { color:#F0EAE0 !important; }',
    '[data-nda-chip]:hover { transform:translateY(-2px); border-color:#B4AA96 !important; }',
    'html[data-gb-theme="dark"] .stsNote { color:#3F3410 !important; }',
    'html[data-gb-theme="dark"] .csRail::before { background:rgba(28,26,22,.92) !important; }',
    'a[href]:not([class]):hover { text-decoration: underline; text-underline-offset: 3px; }',
    '.tvBtn, .lpBtn, .hCard, .arCard { transition: transform .2s ease, background .2s ease, color .2s ease, border-color .2s ease; }',
    '.tvBtn:hover, .lpBtn:hover { transform: translateY(-2px); }',
    'html[data-gb-theme="dark"] .hTool:hover { background:#241F19 !important; border-color:#3A342A !important; }',
    'html[data-gb-theme="dark"] .tvScroll::-webkit-scrollbar-thumb { background:#3A342A; }',
    'html[data-gb-theme="dark"] .tvScroll::-webkit-scrollbar-track { background:#1C1A16; }',
    'html.gbTheming, html.gbTheming *, html.gbTheming *::before, html.gbTheming *::after { transition: background-color .45s ease, color .45s ease, border-color .45s ease, fill .45s ease, stroke .45s ease, box-shadow .45s ease !important; }',
    /* floating buttons: solid fill, no background blur. The blur sampled the photos behind and left a light fringe on the pill's edge. */
    '.lpTop, .csTop, .gbTopBtn, .gbThemeBtn { backdrop-filter:none !important; -webkit-backdrop-filter:none !important; background-clip:padding-box !important; }',
    '.lpTop, .csTop, .gbTopBtn { background-color:#FFFFFF !important; }',
    'html[data-gb-theme="dark"] .lpTop, html[data-gb-theme="dark"] .csTop, html[data-gb-theme="dark"] .gbTopBtn { background-color:#1C1A16 !important; border-color:#3A342A !important; color:#F0EAE0 !important; box-shadow:0 10px 26px rgba(0,0,0,.45) !important; }',
    '.lpTop:hover, .csTop:hover, .gbTopBtn:hover { background-color:#111111 !important; color:#FFFFFF !important; border-color:#111111 !important; }',
    'html[data-gb-theme="dark"] .lpTop:hover, html[data-gb-theme="dark"] .csTop:hover, html[data-gb-theme="dark"] .gbTopBtn:hover { background-color:#F0EAE0 !important; color:#15130F !important; border-color:#F0EAE0 !important; }',
    'html[data-gb-theme="dark"] .gbThemeBtn { background-color:#1C1A16 !important; }',
    '.gbThemeBtn { position:fixed; right:26px; bottom:80px; z-index:60; width:42px; height:42px; display:flex; align-items:center; justify-content:center; border-radius:50%; border:1px solid #EDE7DA; background:rgba(255,255,255,.92); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); color:#6F665A; cursor:pointer; box-shadow:0 10px 26px rgba(36,31,24,.12); transition:transform .18s ease, color .18s ease, border-color .18s ease; }',
    '.gbThemeBtn:hover { transform:translateY(-2px); color:#241F18; border-color:#E2DCCE; }',
    'html[data-gb-theme="dark"] .gbThemeBtn { border-color:#3A342A; background:rgba(28,26,22,.92); color:#A79B89; box-shadow:0 10px 26px rgba(0,0,0,.4); }',
    'html[data-gb-theme="dark"] .gbThemeBtn:hover { color:#F0EAE0; border-color:#5A5142; }',
    '@media (max-width: 720px) { .gbThemeBtn { right:16px; bottom:70px; width:38px; height:38px; } }',
    '.gbTopBtn { position:fixed; right:26px; bottom:26px; z-index:55; display:inline-flex; align-items:center; gap:8px; padding:10px 17px; border-radius:30px; border:1px solid #EDE7DA; background:rgba(255,255,255,.92); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); color:#241F18; font-size:13.5px; line-height:1; text-decoration:none; cursor:pointer; box-shadow:0 10px 26px rgba(36,31,24,.12); opacity:0; pointer-events:none; transition:opacity .3s ease, background .18s ease, color .18s ease, border-color .18s ease; }',
    '.gbTopBtn.on { opacity:1; pointer-events:auto; }',
    '.gbTopBtn:hover { background:#241F18; color:#FFFFFF; border-color:#241F18; }',
    'html[data-gb-theme="dark"] .gbTopBtn { border-color:#3A342A; background:rgba(28,26,22,.92); color:#F0EAE0; box-shadow:0 10px 26px rgba(0,0,0,.4); }',
    'html[data-gb-theme="dark"] .gbTopBtn:hover { background:#F0EAE0; color:#15130F; border-color:#F0EAE0; }',
    '@media (max-width: 720px) { .gbTopBtn { right:16px; bottom:18px; } }'
  ].join('\n');

  var SUN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.4v2.2M12 19.4v2.2M2.4 12h2.2M19.4 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"/></svg>';
  var MOON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M20.5 15.2A8.6 8.6 0 0 1 9.4 4.1 8.6 8.6 0 1 0 20.5 15.2Z"/></svg>';

  var dark = false;
  try {
    var saved = localStorage.getItem('gb-theme');
    if (saved === 'dark' || saved === 'light') dark = saved === 'dark';
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) dark = true;
  } catch (e) {}

  var applying = false;
  function paint() {
    if (!document.body) return;
    applying = true;
    var nodes = document.body.querySelectorAll('[style]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.classList && el.classList.contains('gbThemeBtn')) continue;
      if (el.closest && el.closest('[data-gb-keep]')) continue;
      var cur = el.getAttribute('style');
      if (dark) {
        if (el.__gbDark === cur) continue;
        // the page changed this element while dark (a form opened, a label moved): remember its new light state
        el.__gbLight = el.__gbLight === undefined ? cur : lighten(el, cur);
        var next = darken(cur);
        if (next !== cur) el.setAttribute('style', next);
        el.__gbDark = next;
      } else if (el.__gbLight !== undefined) {
        var back = lighten(el, cur);
        if (back !== cur) el.setAttribute('style', back);
        el.__gbDark = undefined;
      }
    }
    applying = false;
  }

  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; paint(); });
  }

  var fadeT = null;
  function setTheme(next, animate) {
    if (animate && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      var root = document.documentElement;
      root.classList.add('gbTheming');
      clearTimeout(fadeT);
      fadeT = setTimeout(function () { root.classList.remove('gbTheming'); }, 520);
    }
    dark = next;
    document.documentElement.setAttribute('data-gb-theme', dark ? 'dark' : 'light');
    try { localStorage.setItem('gb-theme', dark ? 'dark' : 'light'); } catch (e) {}
    var pre = document.getElementById('gb-preboot');
    if (pre && pre.__gbReleased) pre.textContent = dark ? 'html,body{background:#15130F}' : '';
    paint();
    var btn = document.querySelector('.gbThemeBtn');
    if (btn) {
      btn.innerHTML = dark ? SUN : MOON;
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    }
  }

  function boot() {
    var style = document.createElement('style');
    style.id = 'gb-theme-css';
    style.textContent = CSS;
    document.head.appendChild(style);

    var btn = document.createElement('button');
    btn.className = 'gbThemeBtn';
    btn.type = 'button';
    btn.addEventListener('click', function () { setTheme(!dark, true); });
    document.body.appendChild(btn);

    setTheme(dark);

    // release the pre-paint gate; never let visibility depend on rAF firing
    var pre = document.getElementById('gb-preboot');
    if (pre) {
      var released = false;
      var reveal = function () {
        if (released) return;
        released = true;
        pre.__gbReleased = true;
        pre.textContent = dark ? 'html,body{background:#15130F}' : '';
        document.body.style.transition = 'opacity .2s ease';
        document.body.style.opacity = '1';
      };
      requestAnimationFrame(function () { requestAnimationFrame(reveal); });
      setTimeout(reveal, 0);
      setTimeout(reveal, 300);
      document.addEventListener('visibilitychange', reveal);
    }

    // every page gets a back-to-top; pages that already ship one keep theirs
    if (!document.querySelector('.lpTop, .csTop, .gbTopBtn')) {
      var top = document.createElement('a');
      top.className = 'gbTopBtn';
      top.href = '#';
      top.setAttribute('aria-label', 'Back to top');
      top.textContent = '↑ Top';
      top.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      document.body.appendChild(top);
      var gate = function () { top.classList.toggle('on', window.scrollY > 420); };
      window.addEventListener('scroll', gate, { passive: true });
      gate();
    }

    // keep every tab and back/forward page on the visitor's latest choice
    var sync = function () {
      var want = dark;
      try { var v = localStorage.getItem('gb-theme'); if (v === 'dark' || v === 'light') want = v === 'dark'; } catch (e) {}
      if (want !== dark) setTheme(want);
      var pre2 = document.getElementById('gb-preboot');
      if (pre2 && !dark) pre2.textContent = '';
    };
    window.addEventListener('pageshow', sync);
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) sync(); });
    window.addEventListener('storage', function (e) { if (e.key === 'gb-theme') sync(); });

    // "back to top" links point at a sticky header, which the browser treats as already in view
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href="#top"], .lpTop, .csTop, .gbTopBtn');
      if (!a) return;
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    new MutationObserver(schedule).observe(document.body, {
      childList: true, subtree: true, attributes: true, attributeFilter: ['style']
    });

    // the page renders after DOMContentLoaded, so sweep again as content lands
    window.addEventListener('load', schedule);
    [120, 400, 900, 1800].forEach(function (ms) { setTimeout(paint, ms); });
  }

  document.documentElement.setAttribute('data-gb-theme', dark ? 'dark' : 'light');
  window.__gbTheme = { set: function (v) { setTheme(v, true); }, isDark: function () { return dark; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
