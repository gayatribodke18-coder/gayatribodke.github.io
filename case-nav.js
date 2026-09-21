(function () {
  function init() {
    var cache = { items: [], sections: [] };
    var raf = null;
    // some hosts scroll an outer container instead of the document — probe once
    var canWindowScroll = null;
    function windowScrollWorks() {
      if (canWindowScroll !== null) return canWindowScroll;
      var before = window.scrollY;
      window.scrollTo(0, before + 1);
      canWindowScroll = window.scrollY !== before;
      window.scrollTo(0, before);
      return canWindowScroll;
    }
    function scrolledPast(px) {
      // works with any scroller: how far the top of the document sits above the viewport
      return -document.body.getBoundingClientRect().top > px;
    }
    function refresh() {
      var items = [].slice.call(document.querySelectorAll('.csRail .railItem'));
      if (items.length !== cache.items.length) {
        cache.items = items;
        cache.sections = items.map(function (a) { return document.getElementById(a.getAttribute('data-nav')); });
      }
    }
    function paint() {
      refresh();
      var line = window.innerHeight * 0.35, active = 0;
      cache.sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= line) active = i; });
      var hovering = !!document.querySelector('.csRail:hover');
      cache.items.forEach(function (a, i) {
        var on = i === active;
        var tick = a.querySelector('.railTick'), lb = a.querySelector('.railLabel');
        if (tick) { tick.style.width = on ? '30px' : '16px'; tick.style.background = on ? '#2A6B62' : '#DDDCD9'; }
        if (lb) {
          lb.style.opacity = (on || hovering) ? '1' : '0';
          lb.style.transform = (on || hovering) ? 'none' : 'translateX(6px)';
          lb.style.color = on ? '#111111' : '#9a958d';
        }
      });
      // the rail retires once the reader reaches the closing blocks (contact / next case / footer)
      var rail = document.querySelector('.csRail');
      if (rail) {
        var stop = document.querySelector('.tvNext') || document.querySelector('footer');
        var done = stop ? (stop.getBoundingClientRect().top < window.innerHeight - 40) : false;
        rail.style.transition = 'opacity .3s ease';
        rail.style.opacity = done ? '0' : '1';
        rail.style.pointerEvents = done ? 'none' : 'auto';
      }
      var t = document.querySelector('.csTop');
      if (t) { var show = scrolledPast(420); t.style.opacity = show ? '1' : '0'; t.style.pointerEvents = show ? 'auto' : 'none'; }
    }
    // scroll to a target and keep pinning it while late images change the layout
    function goTo(el) {
      if (raf) cancelAnimationFrame(raf);
      var start = performance.now(), animDur = 950, lockDur = 6000;
      var startY = window.scrollY, interrupted = false, stable = 0;
      var onUser = function () { interrupted = true; };
      var onImg = function () { stable = 0; };
      window.addEventListener('wheel', onUser, { passive: true });
      window.addEventListener('touchmove', onUser, { passive: true });
      window.addEventListener('load', onImg);
      document.querySelectorAll('img').forEach(function (im) { if (!im.complete) im.addEventListener('load', onImg); });
      var cleanup = function () {
        window.removeEventListener('wheel', onUser);
        window.removeEventListener('touchmove', onUser);
        window.removeEventListener('load', onImg);
        document.querySelectorAll('img').forEach(function (im) { im.removeEventListener('load', onImg); });
      };
      var step = function (now) {
        if (interrupted) { cleanup(); return; }
        var elapsed = now - start;
        var off = el.getBoundingClientRect().top - 90;
        if (elapsed < animDur) {
          var t = elapsed / animDur;
          var ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          var target = window.scrollY + off;
          window.scrollTo(0, startY + (target - startY) * ease);
        } else {
          if (Math.abs(off) > 1) { window.scrollTo(0, window.scrollY + off); stable = 0; }
          else stable++;
          if (stable > 30 || elapsed > lockDur) { cleanup(); paint(); return; }
        }
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }
    document.addEventListener('click', function (e) {
      if (!e.target.closest) return;
      var a = e.target.closest('.csRail .railItem');
      if (a) {
        var el = document.getElementById(a.getAttribute('data-nav'));
        // when the document itself scrolls, run the pinned scroll; otherwise let the
        // native href="#id" jump do the work (the host owns the scroller)
        if (el && windowScrollWorks()) { e.preventDefault(); goTo(el); }
        return;
      }
      if (e.target.closest('.csTop') && windowScrollWorks()) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    window.addEventListener('scroll', function () { window.requestAnimationFrame(paint); }, { passive: true });
    window.addEventListener('resize', paint);
    document.addEventListener('mouseover', function (e) { if (e.target.closest && e.target.closest('.csRail')) paint(); });
    document.addEventListener('mouseout', function (e) { if (e.target.closest && e.target.closest('.csRail')) paint(); });
    setInterval(paint, 900);
    paint();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
