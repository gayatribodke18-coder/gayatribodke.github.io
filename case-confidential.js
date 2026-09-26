/* Two views for NDA case studies.
   First-time visitors see only the teaser: [data-nda-teaser].
   Once access is granted the full case study is shown instead.
   Usage: <script src="./case-confidential.js"></script>  data-study="aarogyam"  (one code per study, rotating monthly, see below)
   Hooks: [data-nda-teaser] the public view (first child of the page root)
          [data-nda-toggle] reveals [data-nda-form] with [data-nda-input] / [data-nda-err]
          [data-nda-copy] with data-email — click to copy the address
          [data-nda-request] data-project="Name" — opens a request form; the visitor gets the
          passcode by auto-reply (FormSubmit). The first ever submission sends an activation
          email to the inbox below; click it once and requests start arriving. */
(function () {
  /* Passcodes rotate every month: "aarogyam-sep26" in September 2026, "aarogyam-oct26" in October…
     The current and previous month's code both work, so a code sent on the 30th still works next week.
     Access is remembered for ACCESS_DAYS, then the visitor has to enter a current code again. */
  /* Each study has its own code: <study>-<month><yy>, e.g. "aarogyam-sep26", "indus-sep26".
     The study comes from data-study on the script tag, falling back to the file name. */
  var ME = document.currentScript;
  var STUDY = ((ME && ME.dataset.study) || location.pathname.split('/').pop().replace(/\.(dc\.)?html$/i, '').split(/[\s-]/)[0] || 'case').toLowerCase();
  var BASE = STUDY;
  var ACCESS_DAYS = 14;
  var MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  function codeFor(d) { return BASE + '-' + MONTHS[d.getMonth()] + String(d.getFullYear()).slice(2); }
  var now = new Date();
  var CODE = codeFor(now);
  var PREV = codeFor(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  function valid(v) { v = v.replace(/\s+/g, '').toLowerCase(); return v === CODE || v === PREV; }
  var KEY = 'gb-case-access-' + STUDY;
  try { localStorage.removeItem('gb-case-access'); } catch (e) {} // old shared key: no longer unlocks anything
  var granted = false;
  try {
    var until = parseInt(localStorage.getItem(KEY), 10);
    granted = until > Date.now();
    if (!granted) localStorage.removeItem(KEY);
  } catch (e) {}

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

  function grant(form) {
    granted = true;
    try { localStorage.setItem(KEY, String(Date.now() + ACCESS_DAYS * 864e5)); } catch (x) {}
    var t = teaser(), root = t && t.parentElement;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function open() { apply(); revokeChip(); window.scrollTo(0, 0); }
    if (!form || !root || reduce) { open(); return; }
    /* success state, then a soft cross-fade into the full study */
    var ok = form.querySelector('[data-nda-ok]');
    if (!ok) {
      ok = document.createElement('p');
      ok.setAttribute('data-nda-ok', '');
      ok.style.cssText = 'width:100%; display:flex; align-items:center; gap:8px; font-size:14px; color:#2A6B62; margin:4px 0 0; opacity:0; transform:translateY(4px); transition:opacity .25s ease, transform .25s ease';
      form.appendChild(ok);
    }
    ok.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="7.2" stroke="currentColor" stroke-width="1.4"/><path d="M4.8 8.2l2.1 2.1 4.3-4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>Passcode accepted. Opening the full study…';
    var err = form.querySelector('[data-nda-err]'); if (err) err.style.display = 'none';
    var input = form.querySelector('[data-nda-input]'); if (input) { input.style.borderColor = '#2A6B62'; input.readOnly = true; var cx = input.parentNode.querySelector('[data-clear]'); if (cx) cx.style.display = 'none'; }
    var btn = form.querySelector('button[type="submit"]'); if (btn) btn.disabled = true;
    requestAnimationFrame(function () { ok.style.opacity = '1'; ok.style.transform = 'none'; });
    setTimeout(function () {
      root.style.transition = 'opacity .35s ease';
      root.style.opacity = '0';
      setTimeout(function () {
        open();
        requestAnimationFrame(function () { requestAnimationFrame(function () {
          root.style.opacity = '1';
          setTimeout(function () { root.style.transition = ''; root.style.opacity = ''; }, 400);
        }); });
      }, 360);
    }, 900);
  }

  /* View full study stays disabled until something is typed; a wrong code shows the error and
     keeps it disabled until the visitor edits the code */
  var DISABLED = 'opacity:.45; cursor:not-allowed';
  function setBtn(btn, on) {
    if (!btn) return;
    btn.disabled = !on;
    btn.style.opacity = on ? '' : '.45';
    btn.style.cursor = on ? 'pointer' : 'not-allowed';
    // a disabled button swallows hover in some browsers; let the wrapper catch it for the hint
    btn.style.pointerEvents = on ? '' : 'none';
    if (on && btn.__gbTip) btn.__gbTip.style.opacity = '0';
  }
  /* hint shown when hovering a disabled button */
  function tip(btn, text) {
    if (!btn || btn.__gbTip) return;
    var w = document.createElement('span');
    w.style.cssText = 'position:relative; display:inline-flex; flex-shrink:0; cursor:not-allowed';
    btn.parentNode.insertBefore(w, btn);
    w.appendChild(btn);
    var t = document.createElement('span');
    t.setAttribute('role', 'tooltip');
    t.textContent = text;
    t.style.cssText = 'position:absolute; left:50%; bottom:calc(100% + 10px); transform:translate(-50%,4px); white-space:nowrap; padding:7px 12px; border-radius:8px; background:#241F18; color:#FFFFFF; font-size:12.5px; line-height:1.3; pointer-events:none; opacity:0; transition:opacity .15s ease, transform .15s ease; z-index:5';
    w.appendChild(t);
    btn.__gbTip = t;
    w.addEventListener('mouseenter', function () { if (btn.disabled) { t.style.opacity = '1'; t.style.transform = 'translate(-50%,0)'; } });
    w.addEventListener('mouseleave', function () { t.style.opacity = '0'; t.style.transform = 'translate(-50%,4px)'; });
    w.style.cursor = '';
  }
  var EYE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
  var EYE_OFF = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18"/></svg>';
  var XICON = '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  function wirePasscode() {
    var form = document.querySelector('[data-nda-form]');
    if (!form || form.__gbPc) return;
    form.__gbPc = true;
    var input = form.querySelector('[data-nda-input]');
    var btn = form.querySelector('button[type="submit"]');
    var err = form.querySelector('[data-nda-err]');
    if (err) err.textContent = 'Incorrect passcode, try again.';
    var baseBorder = input ? input.style.borderColor : '';
    if (input) {
      var w = document.createElement('div');
      w.style.cssText = 'position:relative; flex:1; min-width:200px; display:flex';
      input.parentNode.insertBefore(w, input);
      w.appendChild(input);
      input.style.flex = '1'; input.style.minWidth = '0'; input.style.width = '100%'; input.style.paddingRight = '80px'; input.style.boxSizing = 'border-box';
      var x = document.createElement('button');
      x.type = 'button';
      x.setAttribute('data-clear', '');
      x.setAttribute('aria-label', 'Clear passcode');
      x.innerHTML = XICON;
      x.style.cssText = 'position:absolute; right:44px; top:50%; transform:translateY(-50%); width:28px; height:28px; display:none; align-items:center; justify-content:center; padding:0; border:none; border-radius:50%; background:#F3F1EC; color:#6F665A; cursor:pointer';
      w.appendChild(x);
      x.addEventListener('mousedown', function (e) { e.preventDefault(); });
      x.addEventListener('click', function () {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
      });
      input.addEventListener('input', function () { x.style.display = input.value && !input.readOnly ? 'flex' : 'none'; });
      /* show / hide the passcode */
      var eye = document.createElement('button');
      eye.type = 'button';
      eye.setAttribute('data-eye', '');
      eye.setAttribute('aria-label', 'Show passcode');
      eye.setAttribute('aria-pressed', 'false');
      eye.innerHTML = EYE;
      eye.style.cssText = 'position:absolute; right:8px; top:50%; transform:translateY(-50%); width:32px; height:32px; display:flex; align-items:center; justify-content:center; padding:0; border:none; border-radius:50%; background:transparent; color:#6F665A; cursor:pointer';
      w.appendChild(eye);
      eye.addEventListener('mousedown', function (e) { e.preventDefault(); });
      eye.addEventListener('click', function () {
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        eye.innerHTML = show ? EYE_OFF : EYE;
        eye.setAttribute('aria-label', show ? 'Hide passcode' : 'Show passcode');
        eye.setAttribute('aria-pressed', show ? 'true' : 'false');
      });
    }
    form.__gbReset = function () {
      form.style.display = 'none';
      if (input) {
        input.value = ''; input.readOnly = false; input.type = 'password'; input.style.borderColor = baseBorder;
        var cx = form.querySelector('[data-clear]'); if (cx) cx.style.display = 'none';
        var ey = form.querySelector('[data-eye]'); if (ey) { ey.innerHTML = EYE; ey.setAttribute('aria-pressed', 'false'); ey.setAttribute('aria-label', 'Show passcode'); }
      }
      var ok = form.querySelector('[data-nda-ok]'); if (ok) ok.remove();
      if (err) { err.style.display = ''; err.style.visibility = 'hidden'; }
      setBtn(btn, false);
    }
    tip(btn, 'Enter your passcode first');
    setBtn(btn, false);
    if (input) input.addEventListener('input', function () {
      setBtn(btn, !!input.value.trim());
      if (err) err.style.visibility = 'hidden';
      input.style.borderColor = baseBorder;
    });
  }

  function wire() {
    if (window.__gbNdaWired) return;
    window.__gbNdaWired = true;
    document.addEventListener('click', function (e) {
      var toggle = e.target.closest && e.target.closest('[data-nda-toggle]');
      if (toggle) {
        e.preventDefault();
        var form = document.querySelector('[data-nda-form]');
        if (!form) return;
        var open = form.style.display !== 'none' && form.style.display !== '';
        form.style.display = open ? 'none' : 'flex';
        if (!open) { var i = form.querySelector('[data-nda-input]'); if (i) i.focus(); }
        return;
      }
      var btn = e.target.closest && e.target.closest('[data-nda-copy]');
      if (btn) {
        e.preventDefault();
        var mail = btn.dataset.email || 'gayatribodke18@gmail.com';
        var label = btn.querySelector('[data-nda-copy-label]') || btn;
        var was = label.textContent;
        function done() { label.textContent = 'Copied'; setTimeout(function () { label.textContent = was; }, 1600); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(mail).then(done, done);
        else done();
      }
    }, true);
    document.addEventListener('submit', function (e) {
      var form = e.target.closest && e.target.closest('[data-nda-form]');
      if (!form) return;
      e.preventDefault();
      var input = form.querySelector('[data-nda-input]');
      var err = form.querySelector('[data-nda-err]');
      var btn = form.querySelector('button[type="submit"]');
      if (!input || !input.value.trim()) return;
      if (valid(input.value)) { grant(form); return; }
      if (err) { err.textContent = 'Incorrect passcode, try again.'; err.style.visibility = 'visible'; }
      input.style.borderColor = '#BD5836';
      setBtn(btn, false);
      input.select();
      if (input.animate) input.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }], { duration: 280, easing: 'ease-out' });
    }, true);
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
      var pf = document.querySelector('[data-nda-form]'); if (pf && pf.__gbReset) pf.__gbReset();
      apply();
      window.scrollTo(0, 0);
    });
    document.body.appendChild(c);
  }

  var INBOX = 'gayatribodke18@gmail.com';
  var FIELD = 'font:inherit; font-size:15px; padding:12px 15px; border:1px solid #E1E4E6; border-radius:4px; background:#FFFFFF; color:#111111; outline:none; width:100%';
  function esc(v) { return String(v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var COOLDOWN = 60, MAX_RESENDS = 3;
  var LINK = 'font:inherit; font-size:14px; padding:0; border:none; background:none; color:#111111; text-decoration:underline; text-underline-offset:3px; cursor:pointer';
  /* After a request: confirmation, then a resend option on a 60s timer, like an OTP. */
  function sent(f, email, project) {
    var fields = f.querySelectorAll('input:not([type="hidden"]), button, span, [data-req-msg]');
    fields.forEach(function (n) { n.style.display = 'none'; });
    var box = f.querySelector('[data-req-sent]');
    if (!box) {
      box = document.createElement('div');
      box.setAttribute('data-req-sent', '');
      box.style.cssText = 'display:flex; flex-direction:column; gap:12px';
      f.appendChild(box);
    }
    var resends = +(f.dataset.resends || 0);
    box.innerHTML =
      '<p style="font-size:15px; line-height:1.6; color:#111111; margin:0"><span style="color:#2A6B62">' + (resends ? 'Sent again.' : 'Request sent.') + '</span> The passcode is on its way to <strong style="font-weight:600">' + esc(email) + '</strong>. It can take a few minutes, and sometimes lands in spam.</p>' +
      '<div style="display:flex; align-items:center; gap:10px 22px; flex-wrap:wrap; font-size:14px; color:#888888">' +
        '<span data-req-wait></span>' +
        '<button type="button" data-req-resend style="' + LINK + '; display:none">Resend passcode</button>' +
        '<button type="button" data-req-change style="' + LINK + '">Use a different email</button>' +
      '</div>';
    var wait = box.querySelector('[data-req-wait]');
    var again = box.querySelector('[data-req-resend]');
    clearInterval(f.__gbTimer);
    if (resends >= MAX_RESENDS) {
      wait.innerHTML = 'Still nothing? Email me at <a href="mailto:' + INBOX + '?subject=' + encodeURIComponent(project + ' case study passcode') + '" style="color:inherit">' + INBOX + '</a>.';
    } else {
      var left = COOLDOWN;
      var tick = function () {
        if (left > 0) { wait.textContent = "Didn't get it? You can resend in " + left + 's'; left--; return; }
        clearInterval(f.__gbTimer);
        wait.textContent = "Didn't get it?";
        again.style.display = '';
      };
      tick();
      f.__gbTimer = setInterval(tick, 1000);
    }
    again.addEventListener('click', function () {
      again.disabled = true;
      again.textContent = 'Sending…';
      fetch('https://formsubmit.co/ajax/' + INBOX, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(f) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); })
        .then(function () { f.dataset.resends = resends + 1; sent(f, email, project); })
        .catch(function () { again.disabled = false; again.textContent = 'Resend passcode'; wait.textContent = "That didn't go through. Try again."; });
    });
    box.querySelector('[data-req-change]').addEventListener('click', function () {
      clearInterval(f.__gbTimer);
      box.remove();
      f.dataset.resends = 0;
      fields.forEach(function (n) { n.style.display = n.name === '_honey' ? 'none' : ''; });
      if (f.__gbSyncClear) f.__gbSyncClear();
      var m = f.querySelector('[data-req-msg]'); if (m) m.style.display = 'none';
      var send = f.querySelector('button[type="submit"]');
      send.textContent = 'Send me the passcode';
      f.__gbReady();
      f.email.value = '';
      if (f.__gbSyncClear) f.__gbSyncClear();
      f.email.focus();
    });
  }
  function wireRequest() {
    document.querySelectorAll('[data-nda-request]').forEach(function (btn) {
      if (btn.__gbReq) return;
      btn.__gbReq = true;
      var project = btn.dataset.project || 'this';
      var row = btn.parentElement;
      var f = document.createElement('form');
      f.setAttribute('data-nda-reqform', '');
      f.noValidate = false;
      f.style.cssText = 'display:none; flex-direction:column; gap:10px; margin-top:18px; max-width:520px';
      f.innerHTML =
        '<div data-clear-wrap style="position:relative">' +
          '<span data-ph aria-hidden="true" style="position:absolute; left:16px; top:50%; transform:translateY(-50%); font-size:15px; color:#999999; pointer-events:none; white-space:nowrap">Your name<span style="color:#BD5836; margin-left:3px">*</span></span>' +
          '<input name="name" required autocomplete="name" aria-label="Your name (required)" style="' + FIELD + '; padding-right:44px">' +
          '<button type="button" data-clear aria-label="Clear name" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); width:28px; height:28px; display:none; align-items:center; justify-content:center; padding:0; border:none; border-radius:50%; background:#F3F1EC; color:#6F665A; cursor:pointer"><svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>' +
        '</div>' +
        '<div data-clear-wrap style="position:relative">' +
          '<span data-ph aria-hidden="true" style="position:absolute; left:16px; top:50%; transform:translateY(-50%); font-size:15px; color:#999999; pointer-events:none; white-space:nowrap">Work email<span style="color:#BD5836; margin-left:3px">*</span></span>' +
          '<input name="email" type="email" required autocomplete="email" aria-label="Work email (required)" style="' + FIELD + '; padding-right:44px">' +
          '<button type="button" data-clear aria-label="Clear email" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); width:28px; height:28px; display:none; align-items:center; justify-content:center; padding:0; border:none; border-radius:50%; background:#F3F1EC; color:#6F665A; cursor:pointer"><svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>' +
        '</div>' +
        '<div data-clear-wrap style="position:relative">' +
          '<input name="company" autocomplete="organization" placeholder="Company and role (optional)" style="' + FIELD + '; padding-right:44px">' +
          '<button type="button" data-clear aria-label="Clear company and role" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); width:28px; height:28px; display:none; align-items:center; justify-content:center; padding:0; border:none; border-radius:50%; background:#F3F1EC; color:#6F665A; cursor:pointer"><svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>' +
        '</div>' +
        '<input name="_honey" tabindex="-1" autocomplete="off" style="display:none">' +
        '<div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-top:4px">' +
          '<button type="submit" class="tvBtn" style="font:inherit; font-size:14.5px; padding:12px 22px; border-radius:30px; border:none; background:#111111; color:#FFFFFF; cursor:pointer; white-space:nowrap; flex-shrink:0">Send me the passcode</button>' +
          '<span style="font-size:13.5px; color:#888888">It arrives by email in a few minutes.</span>' +
        '</div>' +
        '<p data-req-msg style="font-size:13.5px; line-height:1.55; color:#BD5836; margin:2px 0 0; display:none"></p>';
      row.parentElement.insertBefore(f, row.nextSibling);
      /* clear (x) inside each field: shows only when the field has text */
      f.__gbSyncClear = function () {
        f.querySelectorAll('[data-clear-wrap]').forEach(function (w) {
          var i = w.querySelector('input'), x = w.querySelector('[data-clear]'), h = w.querySelector('[data-ph]');
          if (w.style.display === 'none' || i.style.display === 'none') { if (h) h.style.display = 'none'; return; }
          x.style.display = i.value ? 'flex' : 'none';
          if (h) h.style.display = i.value ? 'none' : '';
        });
      };
      f.__gbReady = function () {
        var sb = f.querySelector('button[type="submit"]');
        if (!sb || sb.textContent === 'Sending…') return;
        setBtn(sb, !!f.name.value.trim() && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.value.trim()));
      };
      tip(f.querySelector('button[type="submit"]'), 'Fill in your name and work email first');
      f.addEventListener('input', f.__gbReady);
      setTimeout(f.__gbReady, 0);
      f.addEventListener('input', f.__gbSyncClear);
      f.addEventListener('change', f.__gbSyncClear);
      setTimeout(f.__gbSyncClear, 600);
      f.querySelectorAll('[data-clear]').forEach(function (x) {
        x.addEventListener('mousedown', function (e) { e.preventDefault(); });
        x.addEventListener('click', function () {
          var i = x.parentElement.querySelector('input');
          i.value = '';
          f.__gbSyncClear();
          if (f.__gbReady) f.__gbReady();
          i.focus();
        });
      });
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var open = f.style.display !== 'none';
        f.style.display = open ? 'none' : 'flex';
        if (!open) f.querySelector('input').focus();
      });
      [['_subject', ''], ['_template', 'table'], ['_captcha', 'false'], ['_autoresponse', ''], ['project', project], ['page', location.href.split('?')[0]]].forEach(function (p) {
        var h = document.createElement('input');
        h.type = 'hidden'; h.name = p[0]; h.value = p[1];
        f.appendChild(h);
      });
      f.addEventListener('submit', function (e) {
        if (f._honey && f._honey.value) { e.preventDefault(); return; }
        var msg = f.querySelector('[data-req-msg]');
        var send = f.querySelector('button[type="submit"]');
        var name = f.name.value.trim(), email = f.email.value.trim();
        if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          e.preventDefault();
          msg.textContent = 'Add your name and a valid email.';
          msg.style.display = 'block';
          return;
        }
        var first = name.split(' ')[0];
        f._subject.value = 'Passcode request · ' + project + ' · ' + name;
        f._autoresponse.value = 'Hi ' + first + ',\n\nThanks for asking to see the ' + project + ' case study.\n\n' +
          'Your passcode: ' + CODE + '\n\n' +
          'It works until the end of next month and keeps the study unlocked on your browser for ' + ACCESS_DAYS + ' days.\n\n' +
          'Open the case study, choose "I have a passcode" and enter it. This code is for the ' + project + ' case study only.\n\n' +
          'Happy to walk you through the work on a call too. Just reply to this email.\n\nGayatri\n' + INBOX;
        e.preventDefault();
        send.disabled = true;
        send.textContent = 'Sending…';
        msg.style.display = 'none';
        var fail = function () {
          send.textContent = 'Send me the passcode';
          f.__gbReady();
          msg.innerHTML = 'That didn\'t go through. Please email me at <a href="mailto:' + INBOX + '?subject=' + encodeURIComponent(project + ' case study passcode') + '" style="color:inherit">' + INBOX + '</a>.';
          msg.style.display = 'block';
        };
        fetch('https://formsubmit.co/ajax/' + INBOX, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(f) })
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json().catch(function () { return {}; }); })
          .then(function () { sent(f, email, project); })
          .catch(fail);
      });
    });
    /* Back from FormSubmit (after its robot check): confirm and tidy the URL. */
    if (/[?&]requested=1/.test(location.search)) {
      var box = document.querySelector('[data-nda-reqform]');
      if (box) {
        box.style.display = 'flex';
        box.innerHTML = '<p style="font-size:15px; line-height:1.6; color:#111111; margin:0"><span style="color:#2A6B62">Request sent.</span> The passcode is on its way to your inbox. If it isn\'t there in a few minutes, check spam.</p>';
      }
      try { history.replaceState(null, '', location.pathname + location.search.replace(/[?&]requested=1/, '').replace(/^&/, '?') + location.hash); } catch (x) {}
    }
  }

  /* The page content renders after this script runs, so wait for the teaser to exist. */
  function mount() {
    wire();
    var tries = 0;
    (function ready() {
      if (teaser()) {
        apply(); wirePasscode(); wireRequest(); revokeChip();
        // the page can re-render its markup after load; re-wire anything that came back fresh
        var q = false;
        new MutationObserver(function () {
          if (q) return; q = true;
          requestAnimationFrame(function () { q = false; wirePasscode(); wireRequest(); });
        }).observe(document.body, { childList: true, subtree: true });
        return;
      }
      if (++tries < 200) setTimeout(ready, 50);
    })();
  }

  window.addEventListener('pageshow', function () {
    document.querySelectorAll('[data-nda-reqform] button[type="submit"]').forEach(function (b) { b.disabled = false; b.textContent = 'Send me the passcode'; });
  });

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
