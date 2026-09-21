/* Two views for NDA case studies.
   First-time visitors see only the teaser: [data-nda-teaser].
   Once access is granted the full case study is shown instead.
   Usage: <script src="./case-confidential.js" data-code="gayatri2026"></script>
   Hooks: [data-nda-teaser] the public view (first child of the page root)
          [data-nda-toggle] reveals [data-nda-form] with [data-nda-input] / [data-nda-err]
          [data-nda-copy] with data-email — click to copy the address */
(function () {
  var s = document.currentScript;
  var CODE = ((s && s.dataset.code) || 'gayatri2026').toLowerCase();
  var KEY = 'gb-case-access';
  var granted = false;
  try { granted = localStorage.getItem(KEY) === 'granted'; } catch (e) {}

  function teaser() { return document.querySelector('[data-nda-teaser]'); }

  function apply() {
    var t = teaser();
    if (!t) return;
    var root = t.parentElement;
    if (!root) return;
    Array.prototype.forEach.call(root.children, function (el) {
      if (el === t) el.style.display = granted ? 'none' : '';
      else el.style.display = granted ? '' : 'none';
    });
    document.documentElement.style.setProperty('--nda', granted ? 'open' : 'closed');
  }

  function grant() {
    granted = true;
    try { localStorage.setItem(KEY, 'granted'); } catch (x) {}
    apply();
    window.scrollTo(0, 0);
  }

  function wire() {
    var toggle = document.querySelector('[data-nda-toggle]');
    var form = document.querySelector('[data-nda-form]');
    if (toggle && form) {
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        var open = form.style.display !== 'none';
        form.style.display = open ? 'none' : 'flex';
        if (!open) { var i = form.querySelector('[data-nda-input]'); if (i) i.focus(); }
      });
    }
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = form.querySelector('[data-nda-input]');
        var err = form.querySelector('[data-nda-err]');
        if (input && input.value.trim().toLowerCase() === CODE) grant();
        else if (err) { err.style.visibility = 'visible'; if (input) input.select(); }
      });
    }
    document.querySelectorAll('[data-nda-copy]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var mail = btn.dataset.email || 'gayatribodke18@gmail.com';
        var label = btn.querySelector('[data-nda-copy-label]') || btn;
        var was = label.textContent;
        function done() {
          label.textContent = 'Copied';
          setTimeout(function () { label.textContent = was; }, 1600);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(mail).then(done, done);
        else done();
      });
    });
  }

  function revokeChip() {
    if (!granted || document.querySelector('[data-nda-chip]')) return;
    var c = document.createElement('button');
    c.setAttribute('data-nda-chip', '');
    c.type = 'button';
    c.style.cssText = 'position:fixed; left:22px; bottom:26px; z-index:40; display:inline-flex; align-items:center; gap:9px; padding:9px 15px; border-radius:30px; border:1px solid #E8E7E4; background:rgba(255,255,255,.92); backdrop-filter:blur(8px); box-shadow:0 10px 26px rgba(30,30,30,.10); font-family:"Hanken Grotesk",system-ui,sans-serif; font-size:12.5px; line-height:1; color:#888; cursor:pointer';
    c.innerHTML = '<span style="color:#2A6B62">Full study unlocked</span><span>show public view</span>';
    c.addEventListener('click', function () {
      try { localStorage.removeItem(KEY); } catch (x) {}
      granted = false;
      c.remove();
      apply();
      window.scrollTo(0, 0);
    });
    document.body.appendChild(c);
  }

  function mount() { apply(); wire(); revokeChip(); }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
