/* Two views for NDA case studies.
   First-time visitors see only the teaser: [data-nda-teaser].
   Once access is granted the full case study is shown instead.
   Usage: <script src="./case-confidential.js"></script>  (data-code is ignored; codes rotate monthly, see below)
   Hooks: [data-nda-teaser] the public view (first child of the page root)
          [data-nda-toggle] reveals [data-nda-form] with [data-nda-input] / [data-nda-err]
          [data-nda-copy] with data-email — click to copy the address
          [data-nda-request] data-project="Name" — opens a request form; the visitor gets the
          passcode by auto-reply (FormSubmit). The first ever submission sends an activation
          email to the inbox below; click it once and requests start arriving. */
(function () {
  /* Passcodes rotate every month: "gayatri-sep26" in September 2026, "gayatri-oct26" in October…
     The current and previous month's code both work, so a code sent on the 30th still works next week.
     Access is remembered for ACCESS_DAYS, then the visitor has to enter a current code again. */
  var BASE = 'gayatri';
  var ACCESS_DAYS = 14;
  var MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  function codeFor(d) { return BASE + '-' + MONTHS[d.getMonth()] + String(d.getFullYear()).slice(2); }
  var now = new Date();
  var CODE = codeFor(now);
  var PREV = codeFor(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  function valid(v) { v = v.replace(/\s+/g, '').toLowerCase(); return v === CODE || v === PREV; }
  var KEY = 'gb-case-access';
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

  function grant() {
    granted = true;
    try { localStorage.setItem(KEY, String(Date.now() + ACCESS_DAYS * 864e5)); } catch (x) {}
    apply();
    window.scrollTo(0, 0);
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
      if (input && valid(input.value)) grant();
      else if (err) { err.style.visibility = 'visible'; if (input) input.select(); }
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
      apply();
      window.scrollTo(0, 0);
    });
    document.body.appendChild(c);
  }

  var INBOX = 'gayatribodke18@gmail.com';
  var FIELD = 'font:inherit; font-size:15px; padding:12px 15px; border:1px solid #E1E4E6; border-radius:4px; background:#FFFFFF; color:#111111; outline:none; width:100%';
  function esc(v) { return String(v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
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
        '<input name="name" required autocomplete="name" placeholder="Your name" style="' + FIELD + '">' +
        '<input name="email" type="email" required autocomplete="email" placeholder="Work email" style="' + FIELD + '">' +
        '<input name="company" autocomplete="organization" placeholder="Company and role (optional)" style="' + FIELD + '">' +
        '<input name="_honey" tabindex="-1" autocomplete="off" style="display:none">' +
        '<div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-top:4px">' +
          '<button type="submit" class="tvBtn" style="font:inherit; font-size:14.5px; padding:12px 22px; border-radius:30px; border:none; background:#111111; color:#FFFFFF; cursor:pointer; white-space:nowrap; flex-shrink:0">Send me the passcode</button>' +
          '<span style="font-size:13.5px; color:#888888">After a quick robot check, it arrives by email.</span>' +
        '</div>' +
        '<p data-req-msg style="font-size:13.5px; line-height:1.55; color:#BD5836; margin:2px 0 0; display:none"></p>';
      row.parentElement.insertBefore(f, row.nextSibling);
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var open = f.style.display !== 'none';
        f.style.display = open ? 'none' : 'flex';
        if (!open) f.querySelector('input').focus();
      });
      f.method = 'POST';
      f.action = 'https://formsubmit.co/' + INBOX;
      var back = location.href.split('#')[0].replace(/[?&]requested=1/, '');
      back += (back.indexOf('?') > -1 ? '&' : '?') + 'requested=1';
      [['_subject', ''], ['_template', 'table'], ['_autoresponse', ''], ['_next', back], ['project', project], ['page', location.href.split('?')[0]]].forEach(function (p) {
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
          'Open the case study, choose "I have a passcode" and enter it. The same code unlocks Aarogyam and Indus Derma.\n\n' +
          'Happy to walk you through the work on a call too. Just reply to this email.\n\nGayatri\n' + INBOX;
        send.disabled = true;
        send.textContent = 'Sending…';
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
      if (teaser()) { apply(); wireRequest(); revokeChip(); return; }
      if (++tries < 200) setTimeout(ready, 50);
    })();
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
