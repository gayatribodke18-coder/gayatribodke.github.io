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
  function isDark() { return document.documentElement.getAttribute('data-gb-theme') === 'dark'; }
  var SCRIPT_LABEL = (document.currentScript && document.currentScript.dataset.label) || '';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IN_MS = REDUCED ? 160 : 620;

  function nameFrom(path) {
    var f = decodeURIComponent(String(path).split(/[?#]/)[0].split('/').pop() || '').replace(/\.dc\.html$|\.html$/i, '');
    if (!f || /^index$/i.test(f) || /^landing/i.test(f)) return 'Gayatri Bodke';
    f = f.replace(/^(article|note|writing)\s*[-–—]\s*/i, '');
    return f.replace(/\s*Case Study.*$/i, '').trim() || 'Gayatri Bodke';
  }
  function isHome(path) { return nameFrom(path) === 'Gayatri Bodke'; }
  function label() { return SCRIPT_LABEL || nameFrom(location.pathname); }

  /* Coming back from a case study: the exit screen already covered the change, so don't play a second one. */
  var skip = false;
  try { skip = sessionStorage.getItem('gb-skip-loader') === '1'; if (skip) sessionStorage.removeItem('gb-skip-loader'); } catch (e) {}
  if (skip) { wireExit(); return; }

  var el = document.createElement('div');
  el.setAttribute('data-gb-loader', '');
  el.style.cssText = 'position:fixed; inset:0; z-index:9999; background:' + (isDark() ? '#15130F' : '#FFFFFF') + '; display:flex; align-items:center; justify-content:center; transition:opacity .24s ease, visibility .24s ease';
  el.innerHTML =
    '<div style="overflow:hidden; padding:0 6px">' +
      '<div data-gb-loader-word style="font-family:\'Instrument Serif\',Georgia,serif; font-size:clamp(30px,5vw,54px); letter-spacing:-.5px; color:' + (isDark() ? '#F0EAE0' : '#241F18') + '; line-height:1.1; transform:translateY(102%); animation:gbLoadUp .5s cubic-bezier(.22,1,.36,1) forwards">' + label() + '</div>' +
      '<div style="height:2px; margin-top:12px; background:#EDE7DA; overflow:hidden"><div style="height:100%; width:100%; background:#4E4187; transform:scaleX(0); transform-origin:left; animation:gbLoadBar ' + (IN_MS / 1000) + 's cubic-bezier(.4,0,.2,1) forwards"></div></div>' +
    '</div>';

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

  function mount() {
    styleEl();
    document.body.appendChild(el);
    setTimeout(hide, IN_MS);
  }
  function hide() {
    el.setAttribute('data-gb-loader-hidden', '');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
  wireExit();

  /* Exit transition: fade a screen in before an in-site navigation. */
  function wireExit() {
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    var href = a.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#' || a.target === '_blank' || /^(mailto:|tel:|https?:)/i.test(href)) return;
    if (/\.pdf$/i.test(href)) return;
    e.preventDefault();
    var home = isHome(href);
    if (home) { try { sessionStorage.setItem('gb-skip-loader', '1'); } catch (x) {} }
    var out = document.createElement('div');
    out.style.cssText = 'position:fixed; inset:0; z-index:9999; background:' + (isDark() ? '#15130F' : '#FFFFFF') + '; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .2s ease';
    styleEl();
    out.innerHTML =
      '<div style="overflow:hidden; padding:0 6px">' +
        '<div style="font-family:\'Instrument Serif\',Georgia,serif; font-size:clamp(30px,5vw,54px); letter-spacing:-.5px; color:' + (isDark() ? '#F0EAE0' : '#241F18') + '; line-height:1.1; transform:translateY(102%); animation:gbLoadUp .5s cubic-bezier(.22,1,.36,1) forwards">' + (home ? 'Going home' : nameFrom(href)) + '</div>' +
        '<div style="height:2px; margin-top:12px; background:#EDE7DA; overflow:hidden"><div style="height:100%; width:100%; background:#4E4187; transform:scaleX(0); transform-origin:left; animation:gbLoadBar .42s cubic-bezier(.4,0,.2,1) forwards"></div></div>' +
      '</div>';
    styleEl();
    document.body.appendChild(out);
    requestAnimationFrame(function () { out.style.opacity = '1'; });
    setTimeout(function () { location.href = withQuery(href); }, REDUCED ? 60 : 460);
  }, true);
  }
})();
