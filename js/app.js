/* =========================================================================
   Hyperion — script partagé (toutes les pages)
   Animations qui se lancent seules quand un élément apparaît.
   Aucune section épinglée, aucun scroll détourné (cf. skill hyperion-design).
   Chaque module vérifie la présence de ses éléments.
   ========================================================================= */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var isMobile = function () { return window.innerWidth < 900; };

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);

  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove('is-loading');
    root.classList.add('no-anim');
    var it = $('#intro'); if (it) it.remove();
    $$('.tl-head').forEach(function (h) { h.addEventListener('click', function () { h.closest('.tl-item').classList.toggle('is-open'); }); });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.3 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  function scrollToY(y) {
    if (lenis) lenis.scrollTo(y, { duration: 1.4, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  }
  function scrollToEl(el, offset) { scrollToY(el.getBoundingClientRect().top + window.scrollY - (offset || 100)); }

  /* ---------- pointer ---------- */
  var mouse = { nx: 0, ny: 0, sx: 0, sy: 0 };
  if (finePointer) window.addEventListener('pointermove', function (e) {
    mouse.nx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ny = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
  gsap.ticker.add(function () { mouse.sx = lerp(mouse.sx, mouse.nx, 0.06); mouse.sy = lerp(mouse.sy, mouse.ny, 0.06); });

  function countUp(el, to, dur, delay) {
    var o = { v: 0 };
    gsap.to(o, { v: to, duration: dur || 1.8, delay: delay || 0, ease: 'power3.out', onUpdate: function () { el.textContent = Math.round(o.v); } });
  }
  function onView(el, fn, start) {
    ScrollTrigger.create({ trigger: el, start: start || 'top 82%', once: true, onEnter: fn });
  }

  /* =======================================================================
     NAV
     ======================================================================= */
  function initNav() {
    var nav = $('#nav'), pill = $('#navPill'), blob = $('#navBlob'), toTop = $('#toTop'), burger = $('#burger');
    if (!nav) return;
    var darkTop = document.body.classList.contains('nav-dark') ? $('.nav-logo img', nav) : null, logoSrc = darkTop ? darkTop.getAttribute('src') : '';
    if (darkTop) darkTop.src = 'assets/img/hyperion-logo-dark.png';
    if (pill && blob) {
      $$('.nav-a', pill).forEach(function (a) {
        a.addEventListener('pointerenter', function () {
          if (a.classList.contains('is-active')) { blob.style.opacity = 0; return; }
          var pr = pill.getBoundingClientRect(), r = a.getBoundingClientRect();
          blob.style.width = r.width + 'px';
          blob.style.transform = 'translateX(' + (r.left - pr.left) + 'px)';
          blob.style.opacity = 1;
        });
      });
      pill.addEventListener('pointerleave', function () { blob.style.opacity = 0; });
    }
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        var y = self.scroll();
        nav.classList.toggle('is-scrolled', y > 20);
        if (darkTop) darkTop.src = y > 20 ? logoSrc : 'assets/img/hyperion-logo-dark.png';
        if (!root.classList.contains('menu-open')) {
          if (self.direction === 1 && y > window.innerHeight * 0.9) nav.classList.add('is-hidden');
          else if (self.direction === -1) nav.classList.remove('is-hidden');
        }
        if (toTop) toTop.classList.toggle('is-visible', y > window.innerHeight * 1.2);
      }
    });
    if (toTop) toTop.addEventListener('click', function () { scrollToY(0); });
    function closeMenu() {
      root.classList.remove('menu-open'); if (burger) burger.setAttribute('aria-expanded', 'false');
      if (lenis && !root.classList.contains('is-loading')) lenis.start();
    }
    if (burger) burger.addEventListener('click', function () {
      var open = !root.classList.contains('menu-open');
      root.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      nav.classList.remove('is-hidden');
      if (lenis) { if (open) lenis.stop(); else lenis.start(); }
    });
    $$('.mnav a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    $$('[data-scroll-top]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); closeMenu(); scrollToY(0); }); });
    $$('a[href^="#"]:not([data-scroll-top])').forEach(function (a) {
      var id = a.getAttribute('href'); if (id.length < 2) return;
      a.addEventListener('click', function (e) { var t = $(id); if (!t) return; e.preventDefault(); closeMenu(); scrollToEl(t, 90); });
    });
  }

  /* =======================================================================
     HOME HERO — product scene in perspective (mouse + scroll)
     ======================================================================= */
  var hero = { p: 0 };
  var layers = [{ sel: '.l-back', z: -160 }, { sel: '.l-main', z: 0 }, { sel: '.l-hw', z: 160 }, { sel: '.l-rdo', z: 220 }]
    .map(function (l) { l.el = $(l.sel); l.enter = 0; return l; }).filter(function (l) { return l.el; });
  var rig = $('#heroRig');
  function heroFrame() {
    var p = hero.p, m = isMobile(), zk = m ? 0.4 : 1, ry0 = m ? -8 : -15;
    rig.style.transform = 'translate3d(0,' + (-p * 40).toFixed(1) + 'px,0) rotateY(' + (ry0 + p * 14 + mouse.sx * 6).toFixed(2) + 'deg) rotateX(' + (6 + p * 6 - mouse.sy * 4).toFixed(2) + 'deg)';
    for (var i = 0; i < layers.length; i++) {
      var L = layers[i], ie = 1 - L.enter;
      L.el.style.transform = 'translate3d(0,' + (ie * 80).toFixed(1) + 'px,' + (L.z * zk * (1 + p * 0.8) - ie * (600 + i * 120)).toFixed(1) + 'px)';
      L.el.style.opacity = L.enter.toFixed(3);
    }
  }
  function initHeroScene() {
    if (!rig) return;
    ScrollTrigger.create({ trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true, onUpdate: function (s) { hero.p = s.progress; } });
    gsap.ticker.add(heroFrame);
  }

  /* =======================================================================
     INTRO — logo, then the curtain lifts (no counter)
     ======================================================================= */
  function runIntro() {
    var intro = $('#intro');
    var lines = $$('.hero-title .ln-in');
    var fades = $$('[data-intro]');
    gsap.set(lines, { yPercent: 110 });
    gsap.set(fades, { opacity: 0, y: 20 });
    gsap.set('#nav', { yPercent: -160 });
    var home = !!$('#hero');
    var done = false;
    function reveal(direct) {
      if (done) return; done = true;
      var tl = gsap.timeline();
      if (intro && direct) gsap.set(intro, { display: 'none' });
      else if (intro) {
        tl.to('.intro-logo', { clipPath: 'inset(0 0% 0 0)', duration: reduced ? 0.01 : (home ? 0.8 : 0.5), ease: 'power3.inOut' })
          .to('.intro-logo', { opacity: 0, duration: 0.3, ease: 'power2.in' }, '+=0.15')
          .to(intro, { yPercent: -100, duration: reduced ? 0.01 : 0.9, ease: 'expo.inOut' }, '-=0.1')
          .set(intro, { display: 'none' });
      }
      var t0 = direct ? 0.05 : intro ? (home ? 1.15 : 0.85) : 0;
      tl.to(lines, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, t0)
        .to('#nav', { yPercent: 0, duration: 1, ease: 'expo.out', clearProps: 'transform' }, t0 + 0.15)
        .to(fades, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, t0 + 0.2)
        .add(function () {
          root.classList.remove('is-loading');
          if (lenis && !root.classList.contains('menu-open')) lenis.start();
          ScrollTrigger.refresh();
        }, t0 + 0.1);
      layers.forEach(function (L, i) { tl.to(L, { enter: 1, duration: 1.4, ease: 'expo.out' }, t0 + 0.1 + i * 0.1); });
    }
    // arriving on the site : the 3D intro (js/intro3d.js) ; between pages, or if it cannot run : the classic one
    if (root.classList.contains('i3d-on') && window.WebGLRenderingContext) {
      var meta = $('meta[name="hy-intro3d"]');
      var classic = function () { root.classList.remove('i3d-on'); reveal(); };
      var s3 = document.createElement('script');
      s3.src = meta ? meta.content : 'js/intro3d.js';
      s3.onload = function () {
        window.HyperionIntro3D.play({
          onExit: function () { reveal(true); }
        }).catch(classic);
      };
      s3.onerror = classic;
      document.head.appendChild(s3);
      return;
    }
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, new Promise(function (r) { setTimeout(r, 1800); })]).then(function () { reveal(); });
    setTimeout(function () { reveal(); }, 2600);
  }

  /* =======================================================================
     LOGOS — marquee
     ======================================================================= */
  function initLogos() {
    var track = $('#marqueeTrack'); if (!track) return;
    $$('.mq-item', track).forEach(function (n) { var c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); });
    var loop = gsap.to(track, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 });
    if (reduced) { loop.pause(); return; }
    var hover = false, ts = 1, mq = $('#marquee');
    mq.addEventListener('pointerenter', function () { hover = true; });
    mq.addEventListener('pointerleave', function () { hover = false; });
    gsap.ticker.add(function () { ts = lerp(ts, hover ? 0.2 : 1, 0.06); loop.timeScale(ts); });
  }

  /* =======================================================================
     HOME blocks
     ======================================================================= */
  function initStats() {
    var box = $('#stats'); if (!box) return;
    onView(box, function () { $$('.count', box).forEach(function (el, i) { countUp(el, +el.dataset.to, 1.8 + i * 0.25); }); });
  }
  function initStatements() {
    $$('.statement').forEach(function (el) {
      var words = [];
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var frag = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
              var s = document.createElement('span'); s.className = 'sw'; s.textContent = part; frag.appendChild(s); words.push(s);
            });
            c.parentNode.replaceChild(frag, c);
          } else if (c.nodeType === 1) walk(c);
        });
      })(el);
      var tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 55%', scrub: true } });
      var dark = el.classList.contains('statement--dark');
      words.forEach(function (w, i) {
        var c = w.closest('.accent--coral') ? (dark ? '#e48770' : '#cf6b53') : w.closest('.accent') ? (dark ? '#8fb0ff' : '#1e44f0') : (dark ? '#ffffff' : '#0b1220');
        tl.to(w, { color: c, duration: 1, ease: 'none' }, i * 0.35);
      });
    });
  }
  function initNews() {
    $$('.nrow').forEach(function (row) {
      row.style.setProperty('--line-s', 0);
      var tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 88%', once: true } });
      tl.to(row, { '--line-s': 1, duration: 1.1, ease: 'expo.inOut' }, 0)
        .from(row.children, { opacity: 0, y: 20, duration: 0.9, ease: 'expo.out', stagger: 0.06 }, 0.2);
    });
  }
  function initFigures() {
    var grid = $('#figures'); if (!grid) return;
    var figs = $$('.fig', grid);
    gsap.set(figs, { opacity: 0, y: 30 });
    onView(grid, function () {
      gsap.to(figs, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.12 });
      figs.forEach(function (f, i) {
        var v = +f.dataset.value, d = 0.2 + i * 0.15;
        countUp($('.v', f), v, 2, d);
        var bar = $('.fig-bar i', f);
        if (bar) gsap.to(bar, { scaleX: v / 100, duration: 2, delay: d, ease: 'power3.out' });
        $$('.fig-dots i', f).forEach(function (dot, k) { gsap.delayedCall(d + 0.35 * k, function () { dot.classList.add('on'); }); });
      });
    });
  }

  /* timeline : line fills while reading, nodes light up, cards open on click */
  function initTimeline() {
    var tl = $('#timeline'); if (!tl) return;
    $$('.tl-item', tl).forEach(function (item) {
      var head = $('.tl-head', item);
      $$('.tl-list li', item).forEach(function (li, k) { li.style.transitionDelay = (0.035 * k) + 's'; });
      head.addEventListener('click', function () {
        var open = !item.classList.contains('is-open');
        item.classList.toggle('is-open', open);
        head.setAttribute('aria-expanded', String(open));
      });
      var left = item.classList.contains('tl-item--left'), m = isMobile();
      gsap.from($('.tl-card', item), { opacity: 0, x: m ? 0 : (left ? -50 : 50), y: m ? 30 : 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: item, start: 'top 85%', once: true } });
      var vis = $('.tl-visual', item);
      if (vis) gsap.from(vis, { opacity: 0, x: left ? 50 : -50, duration: 1.3, delay: 0.1, ease: 'expo.out', scrollTrigger: { trigger: item, start: 'top 85%', once: true } });
      ScrollTrigger.create({ trigger: item, start: 'top 62%', end: 'max', onToggle: function (s) { item.classList.toggle('is-on', s.isActive); if (tl._sync) tl._sync(); } });
    });
    var end = $('#tlEnd'), fill = $('#tlFill'), line = $('.tl-line', tl);
    var syncFill = function () {
      var on = $$('.tl-item.is-on', tl), f = 0;
      if (end && end.classList.contains('is-on')) f = 1;
      else if (on.length) { var nd = $('.tl-node', on[on.length - 1]), lr = line.getBoundingClientRect(), nr = nd.getBoundingClientRect(); f = clamp((nr.top + nr.height / 2 - lr.top) / lr.height, 0, 1); }
      fill.style.transform = 'scaleY(' + f.toFixed(4) + ')';
    };
    tl._sync = syncFill;
    if (window.ResizeObserver) {
      var rt = null;
      new ResizeObserver(function () { syncFill(); clearTimeout(rt); rt = setTimeout(function () { ScrollTrigger.refresh(); syncFill(); }, 260); }).observe(tl);
    }
    if (end) onView(end, function () { end.classList.add('is-on'); syncFill(); gsap.from(end.children, { opacity: 0, y: 30, duration: 1, ease: 'expo.out', stagger: 0.12 }); }, 'top 88%');
  }

  function initFeatures() {
    var cards = $$('.fx'); if (!cards.length) return;
    gsap.set(cards, { opacity: 0, y: 40 });
    ScrollTrigger.batch(cards, { start: 'top 90%', onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, overwrite: true }); } });
    if (!finePointer) return;
    cards.forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });
  }

  function initScenes() {
    if ($('#saasRig')) gsap.fromTo('#saasRig', { rotationY: -22, rotationX: 10, y: 40 }, { rotationY: -6, rotationX: 3, y: 0, ease: 'none', scrollTrigger: { trigger: '#saasRig', start: 'top bottom', end: 'center 50%', scrub: true } });
    if ($('#hwRig')) gsap.fromTo('#hwRig', { rotationY: 18 }, { rotationY: -10, ease: 'none', scrollTrigger: { trigger: '#hwRig', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* =======================================================================
     MODE STEALTH page
     ======================================================================= */
  function initStealth() {
    var panel = $('#stealthPanel');
    if (panel) {
      var master = $('.panel-head .switch', panel), rows = $$('.prow', panel), status = $('.panel-status', panel);
      onView(panel, function () {
        gsap.delayedCall(0.3, function () { master.classList.add('is-on'); });
        rows.forEach(function (r, i) { gsap.delayedCall(0.8 + i * 0.4, function () { r.classList.add('is-on'); }); });
        gsap.delayedCall(0.9 + rows.length * 0.4, function () { status.classList.add('is-on'); });
      }, 'top 75%');
    }
    var plates = $$('.plate'), ccs = $$('.cc');
    if (plates.length && ccs.length) {
      var cur = -1, hovering = false, timer = null;
      var light = function (k) { cur = k; plates.forEach(function (p, i) { p.classList.toggle('is-hot', i === k); }); ccs.forEach(function (c, i) { c.classList.toggle('is-hot', i === k); }); };
      var cycle = function () { if (!hovering) light((cur + 1) % ccs.length); };
      ScrollTrigger.create({ trigger: '.layers-wrap', start: 'top 75%', end: 'bottom 20%', onToggle: function (s) { clearInterval(timer); if (s.isActive) { cycle(); timer = setInterval(cycle, 2600); } } });
      ccs.forEach(function (c, i) {
        c.addEventListener('pointerenter', function () { hovering = true; light(i); });
        c.addEventListener('pointerleave', function () { hovering = false; });
      });
      gsap.from(plates, { opacity: 0, '--lift': '-160px', duration: 1.2, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.stack3d', start: 'top 80%', once: true } });
      gsap.from(ccs, { opacity: 0, y: 30, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.carac', start: 'top 85%', once: true } });
    }
    var links = $$('.tech-index a'), blocks = $$('.tb');
    if (links.length && blocks.length) {
      blocks.forEach(function (b, i) {
        ScrollTrigger.create({ trigger: b, start: 'top 55%', end: 'bottom 55%', onToggle: function (s) { if (s.isActive) links.forEach(function (l, k) { l.classList.toggle('is-active', k === i); }); } });
        gsap.from(b, { opacity: 0, y: 30, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: b, start: 'top 88%', once: true } });
      });
    }
  }

  /* =======================================================================
     CONFORMITÉ ANSSI page
     ======================================================================= */
  var STAR = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>';
  function tilt(el, ry, rx, k) {
    if (!el) return;
    var p = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onUpdate: function (s) { p.v = s.progress; } });
    gsap.ticker.add(function () {
      el.style.transform = 'rotateY(' + (ry + mouse.sx * k).toFixed(2) + 'deg) rotateX(' + (rx + (p.v - 0.5) * 8 - mouse.sy * k * 0.7).toFixed(2) + 'deg)';
    });
  }
  function initAnssi() {
    var doc = $('#axDoc');
    if (doc) {
      var checks = $$('.ax-check', doc), stamp = $('.ax-stamp', doc);
      tilt(doc, -14, 6, 7);
      gsap.set(stamp, { scale: 1.9, rotation: -30, z: 40 });
      gsap.delayedCall(reduced ? 0.2 : 2.1, function () {
        checks.forEach(function (c, i) { gsap.delayedCall(i * 0.3, function () { c.classList.add('is-on'); }); });
        gsap.to(stamp, { opacity: 1, scale: 1, rotation: -14, duration: 0.55, ease: 'back.out(2.4)', delay: checks.length * 0.3 + 0.15 });
      });
    }

    var list = $('#axList');
    if (!list) return;
    var nodes = $$('.ax-node'), chs = $$('.ax-ch', list);
    gsap.to('#axRailFill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: list, start: 'top 55%', end: 'bottom 70%', scrub: true } });
    chs.forEach(function (ch, i) {
      ScrollTrigger.create({ trigger: ch, start: 'top 55%', end: 'bottom 55%', onToggle: function (s) { if (nodes[i]) nodes[i].classList.toggle('is-active', s.isActive); } });
      var parts = [$('.ax-ch-head', ch), $('.ax-ch-text', ch), $('.ax-vis', ch), $('.ax-dl', ch)].filter(Boolean);
      gsap.from(parts, { opacity: 0, y: 34, duration: 1.1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: ch, start: 'top 82%', once: true } });
      var ans = $('.ax-ans', ch);
      if (ans) onView(ans, function () {
        if (nodes[i]) nodes[i].classList.add('is-done');
        var v = $('.v', ans); if (v) countUp(v, +v.dataset.to, +v.dataset.to > 10 ? 2 : 1.1, 0.1);
        $$('.vx-dots i', ans).forEach(function (d, k) { gsap.delayedCall(0.25 + k * 0.35, function () { d.classList.add('on'); }); });
      }, 'top 85%');
    });

    // 1 — the two bars fill segment by segment
    $$('.vx-infra').forEach(function (fig) {
      var rows = $$('.vx-row', fig);
      rows.forEach(function (row) { var bar = $('.vx-bar', row); for (var k = 0; k < 32; k++) bar.appendChild(document.createElement('i')); });
      onView(fig, function () {
        rows.forEach(function (row, r) {
          var segs = $$('.vx-bar i', row), pct = $('.vx-pct', row), o = { v: 0 };
          gsap.to(o, { v: segs.length, duration: 1.8, delay: 0.2 + r * 0.45, ease: 'power2.inOut', onUpdate: function () {
            var n = Math.round(o.v);
            segs.forEach(function (sg, k) { sg.classList.toggle('on', k < n); });
            pct.textContent = Math.round(o.v / segs.length * 100);
          } });
        });
        gsap.from($('.vx-infra-foot img', fig), { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', delay: 0.3 });
      }, 'top 78%');
    });

    // 2 — the lost week grows from Monday to Friday, then the attack
    $$('.vx-week').forEach(function (fig) {
      var tl = gsap.timeline({ paused: true });
      tl.from($('.vx-mark--save', fig), { opacity: 0, x: -14, duration: 0.6, ease: 'expo.out' })
        .from($('.vx-lost', fig), { scaleX: 0, duration: 1.5, ease: 'power2.inOut' }, 0.2)
        .from($('.vx-lost span', fig), { opacity: 0, duration: 0.5 }, 1.2)
        .from($('.vx-mark--hit', fig), { opacity: 0, scale: 0.4, duration: 0.6, ease: 'back.out(3)' }, 1.55)
        .from($$('.vx-level', fig), { opacity: 0, y: 18, duration: 0.8, ease: 'expo.out', stagger: 0.12 }, 1.7);
      onView(fig, function () { tl.play(); }, 'top 78%');
    });

    // 3 — nodes pop in
    $$('.vx-tiers').forEach(function (fig) {
      gsap.from($$('.t-node, .t-lab', fig), { opacity: 0, scale: 0.6, transformOrigin: '50% 50%', duration: 0.9, ease: 'back.out(2)', stagger: 0.08, scrollTrigger: { trigger: fig, start: 'top 80%', once: true } });
      gsap.from($('.vx-rdo img', fig), { y: 50, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: fig, start: 'top 80%', once: true } });
    });

    // 4 — the sentence gets encrypted, then the cipher keeps moving
    var line = $('#axCipher'), noise = $('#axNoise');
    if (line) {
      var HEX = '0123456789abcdef', plain = line.dataset.plain, live = false, done = false;
      var rnd = function () { return HEX[(Math.random() * 16) | 0]; };
      var hex = function (n) { var s = ''; for (var k = 0; k < n; k++) s += rnd(); return s; };
      var paint = function (n) {
        var enc = '';
        for (var k = 0; k < n; k++) enc += plain[k] === ' ' ? ' ' : rnd();
        line.textContent = '';
        var sp = document.createElement('span'); sp.className = 'enc'; sp.textContent = enc;
        line.appendChild(sp); line.appendChild(document.createTextNode(plain.slice(n)));
      };
      var fill = function () { var t = []; for (var k = 0; k < 6; k++) t.push(hex(64)); noise.textContent = t.join(' '); };
      fill();
      ScrollTrigger.create({ trigger: line.parentNode, start: 'top bottom', end: 'bottom top', onToggle: function (s) { live = s.isActive; } });
      setInterval(function () { if (!live) return; fill(); if (done) paint(plain.length); }, 160);
      onView(line, function () {
        var o = { n: 0 };
        gsap.to(o, { n: plain.length, duration: 2.4, delay: 0.5, ease: 'none', onUpdate: function () { paint(Math.floor(o.n)); }, onComplete: function () { done = true; } });
      }, 'top 80%');
    }

    // 5 — the twelve stars
    var disc = $('#axStars');
    if (disc) {
      for (var k = 0; k < 12; k++) { var st = document.createElement('i'); st.className = 'star'; st.style.setProperty('--a', (k * 30) + 'deg'); st.innerHTML = STAR; disc.appendChild(st); }
      onView(disc, function () { $$('.star', disc).forEach(function (st, k) { gsap.delayedCall(0.2 + k * 0.09, function () { st.classList.add('on'); }); }); }, 'top 78%');
    }

    // Agir rapidement — 75 dots out of 100
    var f75 = $('#ax75');
    if (f75) {
      var box = $('.ax-75-dots', f75);
      for (var d = 0; d < 100; d++) box.appendChild(document.createElement('i'));
      onView(f75, function () {
        var dots = $$('i', box);
        dots.slice(0, 75).forEach(function (dot, k) { gsap.delayedCall(0.2 + k * 0.016, function () { dot.classList.add('on'); }); });
        countUp($('.ax-75-v .v', f75), 75, 1.6, 0.2);
      }, 'top 75%');
    }
  }

  /* =======================================================================
     CYBER ASSURANCE DATTAK page
     ======================================================================= */
  function initDattak() {
    var venn = $('#dkVenn');
    if (venn) {
      tilt(venn, -8, 4, 6);
      var A = $('#dkA'), B = $('#dkB'), lens = $('#dkLensG'), n360 = $('#dk360');
      gsap.set(A, { x: -110, opacity: 0 });
      gsap.set(B, { x: 110, opacity: 0 });
      gsap.set(lens, { opacity: 0, scale: 0.7, transformOrigin: '50% 50%' });
      n360.textContent = '0';
      var tl = gsap.timeline({ delay: reduced ? 0.2 : 1.4 });
      tl.to([A, B], { x: 0, opacity: 1, duration: 1.4, ease: 'expo.out' })
        .to(lens, { opacity: 1, scale: 1, duration: 0.9, ease: 'expo.out' }, 0.75)
        .add(function () { var o = { v: 0 }; gsap.to(o, { v: 360, duration: 1.6, ease: 'power3.out', onUpdate: function () { n360.textContent = Math.round(o.v); } }); }, 0.8);
    }
    // DataClone : the malwares come, the backups go invisible (Mode Stealth), then the restore bar fills
    var sv = $('#dkStealth');
    if (sv) {
      var mw = $$('.dk-mw circle', sv), ys = [92, 116, 140, 104];
      gsap.set('#dkRestore', { scaleX: 0, transformOrigin: '0% 50%' });
      var loop = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.6 });
      mw.forEach(function (c, i) {
        loop.fromTo(c, { x: 520 + i * 26, y: ys[i], opacity: 0 }, { x: 175, opacity: 1, duration: 1.4, ease: 'power1.in' }, i * 0.12)
          .to(c, { x: 10, opacity: 0, duration: 0.9, ease: 'power1.out' }, 1.4 + i * 0.12);
      });
      loop.to('#dkStack', { opacity: 0.08, duration: 0.45, ease: 'power2.out' }, 1.05)
        .to('#dkGhost', { opacity: 1, duration: 0.45 }, 1.05)
        .to('.dk-sv-mark', { scale: 1.15, transformOrigin: '50% 50%', duration: 0.3, yoyo: true, repeat: 1 }, 1.05)
        .to('#dkStack', { opacity: 1, duration: 0.5 }, 2.75)
        .to('#dkGhost', { opacity: 0, duration: 0.5 }, 2.75)
        .fromTo('#dkRestore', { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, 3)
        .fromTo('#dkOk', { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(3)' }, 3.75)
        .to(['#dkRestore', '#dkOk'], { opacity: 0, duration: 0.4 }, 5.4)
        .set('#dkRestore', { scaleX: 0, opacity: 1 }, 5.8);
      ScrollTrigger.create({ trigger: sv, start: 'top 85%', end: 'bottom top', onToggle: function (s) { if (s.isActive) loop.play(); else loop.pause(); } });
      gsap.from($$('.dk-side'), { opacity: 0, y: 40, duration: 1.1, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '#dkDuo', start: 'top 85%', once: true } });
    }

    var figs = $('#dkFigs');
    if (figs) {
      var fs = $$('.dk-fig', figs);
      gsap.set(fs, { opacity: 0, y: 30 });
      var ticks = $('.dk-ticks', figs);
      if (ticks) for (var k = 0; k < 40; k++) ticks.appendChild(document.createElement('i'));
      onView(figs, function () {
        gsap.to(fs, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.12 });
        fs.forEach(function (f, i) { var v = $('.v', f); countUp(v, +v.dataset.to, +v.dataset.to > 9 ? 2 : 1.2, 0.2 + i * 0.15); });
        gsap.fromTo('.dk-meter--shrink i', { scaleX: 1 }, { scaleX: 1 / 3, duration: 1.8, delay: 0.4, ease: 'power3.inOut' });
        if (ticks) $$('i', ticks).forEach(function (t, k) { gsap.delayedCall(0.4 + k * 0.035, function () { t.classList.add('on'); }); });
        gsap.to('.dk-meter--timer i', { scaleX: 1, duration: 2, delay: 0.5, ease: 'none' });
      });
    }

    var tickets = $$('.dk-ticket');
    if (tickets.length) {
      var notch = function () { tickets.forEach(function (t) { var v = $('.dk-ticket-v', t); t.style.setProperty('--cut', (v.offsetLeft + v.offsetWidth) + 'px'); }); };
      notch(); window.addEventListener('resize', notch);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(notch);
      gsap.from(tickets, { opacity: 0, y: 40, duration: 1.1, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.dk-offers', start: 'top 85%', once: true } });
      onView($('.dk-offers'), function () { tickets.forEach(function (t, i) { var v = $('.dk-ticket-v .v', t); countUp(v, +v.dataset.to, 1.6, 0.25 + i * 0.15); }); }, 'top 80%');
    }
    var docs = $$('.dk-docu');
    if (docs.length) gsap.from(docs, { opacity: 0, y: 50, duration: 1.2, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.dk-res-grid', start: 'top 85%', once: true } });
  }

  /* =======================================================================
     NOUS CONTACTER page
     ======================================================================= */
  function initContact() {
    var panel = $('#ctPanel');
    if (panel) {
      var tabs = $$('.ct-prof', panel), form = $('#ctForm'), formView = $('#ctFormView'), supView = $('#ctSupportView');
      var heads = $$('.ct-form-head', panel), typeIn = $('#ctType'), done = $('#ctDone'), err = $('#ctError');
      var select = function (kind, animate) {
        tabs.forEach(function (t) { var on = t.dataset.kind === kind; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', String(on)); });
        var isForm = kind !== 'support';
        formView.hidden = !isForm; supView.hidden = isForm;
        heads.forEach(function (h) { h.hidden = h.dataset.kind !== kind; });
        if (isForm) typeIn.value = kind;
        done.hidden = true; done.classList.remove('is-on'); formView.classList.remove('is-done');
        if (animate) gsap.from(isForm ? formView : supView, { opacity: 0, y: 14, duration: 0.6, ease: 'expo.out' });
      };
      tabs.forEach(function (t) { t.addEventListener('click', function () { select(t.dataset.kind, true); }); });
      var h = location.hash.replace('#', '');
      if (h === 'client' || h === 'revendeur' || h === 'support') select(h, false);

      // the ring fills as the fields are completed
      var fields = $$('input[required], textarea[required]', form), ring = $('#ctRing'), count = $('#ctCount'), C = 2 * Math.PI * 18;
      var progress = function () {
        var n = 0;
        fields.forEach(function (f) { var ok = !!f.value.trim() && f.checkValidity(); f.parentNode.classList.toggle('is-ok', ok); if (ok) n++; });
        ring.style.strokeDashoffset = (C * (1 - n / fields.length)).toFixed(2);
        count.textContent = n + '/' + fields.length;
        panel.classList.toggle('is-ready', n === fields.length);
        return n === fields.length;
      };
      form.addEventListener('input', progress);
      progress();

      // same sending function as the current site (Supabase "send-contact-email")
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        err.hidden = true;
        if (!progress()) { form.classList.add('was-tried'); var bad = fields.filter(function (f) { return !f.parentNode.classList.contains('is-ok'); })[0]; if (bad) bad.focus(); return; }
        var cfg = window.HYPERION_CONTACT || {}, body = {};
        ['nom', 'prenom', 'email', 'telephone', 'societe', 'message', 'type'].forEach(function (k) { body[k] = form.elements[k].value.trim(); });
        panel.classList.add('is-sending');
        fetch(cfg.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: cfg.anonKey, Authorization: 'Bearer ' + cfg.anonKey }, body: JSON.stringify(body) })
          .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); })
          .then(function () {
            form.reset(); form.classList.remove('was-tried'); progress();
            done.hidden = false; formView.classList.add('is-done');
            gsap.from(done, { opacity: 0, duration: 0.4 });
            requestAnimationFrame(function () { done.classList.add('is-on'); });
          })
          .catch(function (x) { console.error('Email send error:', x); err.hidden = false; })
          .then(function () { panel.classList.remove('is-sending'); });
      });
    }

    // live clocks of the two offices
    var offices = $$('.ct-office');
    if (offices.length) {
      offices.forEach(function (o) {
        var g = $('.ticks', o);
        for (var k = 0; k < 60; k++) {
          var major = k % 5 === 0, a = k * 6 * Math.PI / 180, r1 = major ? 24 : 26.5, r2 = 28;
          var l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          l.setAttribute('x1', (32 + r1 * Math.sin(a)).toFixed(2)); l.setAttribute('y1', (32 - r1 * Math.cos(a)).toFixed(2));
          l.setAttribute('x2', (32 + r2 * Math.sin(a)).toFixed(2)); l.setAttribute('y2', (32 - r2 * Math.cos(a)).toFixed(2));
          if (!major) l.setAttribute('class', 'minor');
          g.appendChild(l);
        }
        try { o._fmt = new Intl.DateTimeFormat('fr-FR', { timeZone: o.dataset.tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); } catch (x) { o._fmt = null; }
      });
      var tick = function () {
        var now = new Date();
        offices.forEach(function (o) {
          var p = { hour: now.getHours(), minute: now.getMinutes(), second: now.getSeconds() };
          if (o._fmt) o._fmt.formatToParts(now).forEach(function (x) { if (p.hasOwnProperty(x.type)) p[x.type] = +x.value % 24; });
          var s = p.second + now.getMilliseconds() / 1000, m = p.minute + s / 60, hh = (p.hour % 12) + m / 60;
          $('.h', o).style.transform = 'rotate(' + (hh * 30).toFixed(2) + 'deg)';
          $('.m', o).style.transform = 'rotate(' + (m * 6).toFixed(2) + 'deg)';
          $('.s', o).style.transform = 'rotate(' + (s * 6).toFixed(2) + 'deg)';
          var t = $('.ct-time', o), txt = ('0' + p.hour).slice(-2) + ':' + ('0' + p.minute).slice(-2);
          if (t.textContent !== txt) t.textContent = txt;
        });
      };
      tick(); setInterval(tick, 200);
    }

  }

  /* =======================================================================
     GESTION CENTRALISÉE page
     ======================================================================= */
  var SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function liveWhileVisible(el, tl) {
    ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: function (s) { if (s.isActive) tl.play(); else tl.pause(); } });
  }
  function initSurv() {
    var fr = function (v) { return v.toFixed(1).replace('.', ','); };

    // HERO — the DataClone console fills itself, then new backups keep arriving
    var con = $('#svConsole');
    if (con) {
      tilt(con, -12, 5, 6);
      var ROWS = [['VM-APPLI', '05-06-2025 23:00:01', '535,11 Go'], ['VM-AD', '06-06-2025 20:00:13', '121,14 Go'], ['VM-APPLI', '06-06-2025 23:00:02', '535,37 Go'], ['VM-AD', '07-06-2025 20:00:12', '121,21 Go'], ['VM-APPLI', '07-06-2025 23:00:01', '535,27 Go'], ['VM-AD', '08-06-2025 20:00:13', '121,24 Go'], ['VM-APPLI', '09-06-2025 00:06:13', '535,41 Go']];
      var box = $('#svRows'), H = 34, VIS = 4, idx = 0, live = false;
      var push = function (fast) {
        var d = ROWS[idx % ROWS.length]; idx++;
        var r = document.createElement('div');
        r.className = 'svc-row is-running';
        r.innerHTML = '<span class="svc-st"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4L19 7"/></svg></span><b>' + d[0] + '</b><span>' + d[1] + '</span><span>' + d[2] + '</span>';
        box.insertBefore(r, box.firstChild);
        var rows = $$('.svc-row', box);
        gsap.set(r, { y: -H, opacity: 0 });
        rows.forEach(function (row, k) { gsap.to(row, { y: k * H, opacity: 1, duration: 0.7, ease: 'expo.out' }); });
        rows.slice(VIS + 1).forEach(function (row) { row.remove(); });
        var o = { p: 0 };
        gsap.to(o, { p: 100, duration: fast ? 0.5 : 1.4, ease: 'power1.inOut', onUpdate: function () { r.style.setProperty('--run', o.p.toFixed(1) + '%'); }, onComplete: function () { r.classList.remove('is-running'); r.classList.add('is-done'); } });
      };
      gsap.delayedCall(reduced ? 0.2 : 1.9, function () {
        gsap.to('#svDonut', { strokeDashoffset: 0, duration: 1.8, ease: 'power3.inOut' });
        var o = { v: 0 }, pct = $('#svPct'), ok = $('.svc-stats .is-ok b', con);
        gsap.to(o, { v: 100, duration: 1.8, ease: 'power3.inOut', onUpdate: function () { pct.textContent = fr(o.v); ok.textContent = fr(o.v) + ' %'; } });
        $('.svc-stats .is-ok i', con).style.setProperty('--p', 1);
        var c = { v: 0 }, cap = $('#svCap');
        gsap.to(c, { v: 84, duration: 1.8, delay: 0.3, ease: 'power3.out', onUpdate: function () { cap.textContent = fr(c.v); } });
        gsap.to('#svCapBar', { scaleX: 0.84, duration: 1.8, delay: 0.3, ease: 'power3.out' });
        for (var k = 0; k < VIS; k++) gsap.delayedCall(0.4 + k * 0.45, function () { push(true); });
        gsap.delayedCall(0.4 + VIS * 0.45 + 1.6, function () { live = true; });
      });
      ScrollTrigger.create({ trigger: con, start: 'top bottom', end: 'bottom top', onToggle: function (s) { con._vis = s.isActive; } });
      setInterval(function () { if (live && con._vis !== false && !document.hidden) push(false); }, 3000);
    }

    // PILLAR 1 — nodes come in around the shield
    var hub = $('.pg-hub');
    if (hub) gsap.from($$('.hub-nodes > g', hub), { opacity: 0, scale: 0.4, transformOrigin: '50% 50%', duration: 0.9, ease: 'back.out(2)', stagger: 0.08, scrollTrigger: { trigger: hub, start: 'top 85%', once: true } });

    // PILLAR 2 — a live curve that keeps scrolling
    var track = $('#svLive');
    if (track) {
      var P = 240, wave = function (x) { var t = x / P * Math.PI * 2; return 74 - 16 * Math.sin(t * 2) - 9 * Math.sin(t * 5 + 1) - 5 * Math.sin(t * 9 + 2); };
      var pts = [];
      for (var x = 0; x <= P * 2; x += 4) pts.push(x + ' ' + wave(x).toFixed(1));
      svgEl('path', { class: 'live-area', d: 'M0 150 L' + pts.join(' L') + ' L' + (P * 2) + ' 150 Z' }, track);
      svgEl('path', { class: 'live-line', d: 'M' + pts.join(' L') }, track);
      var shift = { x: 0 }, dot = $('#svLiveDot'), ring = $('#svLiveRing');
      var run = gsap.to(shift, { x: P, duration: 7, ease: 'none', repeat: -1, paused: true, onUpdate: function () {
        track.setAttribute('transform', 'translate(' + (-shift.x).toFixed(2) + ' 0)');
        var y = wave(226 + shift.x).toFixed(1); dot.setAttribute('cy', y); ring.setAttribute('cy', y);
      } });
      liveWhileVisible(track.ownerSVGElement, run);
    }

    // PILLAR 3 — a cursor switches everything on, simply
    var ctrl = $('#svCtrl');
    if (ctrl) {
      var cur = $('.ctrl-cursor', ctrl), crows = $$('.ctrl-row', ctrl);
      var at = function (k) { return function () { var sw = $('.switch', crows[k]); return { x: sw.offsetLeft + sw.offsetWidth * 0.62, y: sw.offsetTop + sw.offsetHeight * 0.55 }; }; };
      var ctl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.8 });
      ctl.set(cur, { x: function () { return ctrl.offsetWidth * 0.4; }, y: 150, opacity: 0 }).to(cur, { opacity: 1, duration: 0.3 });
      crows.forEach(function (row, k) {
        ctl.to(cur, { x: function () { return at(k)().x; }, y: function () { return at(k)().y; }, duration: 0.7, ease: 'power2.inOut' })
          .to(cur, { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 })
          .add(function () { row.classList.add('is-on'); }, '-=0.1')
          .to({}, { duration: 0.25 });
      });
      ctl.to(cur, { opacity: 0, duration: 0.4 }, '+=1.4').add(function () { crows.forEach(function (r) { r.classList.remove('is-on'); }); });
      liveWhileVisible(ctrl, ctl);
      window.addEventListener('resize', function () { ctl.invalidate(); });
    }

    // CONCEPT — monitored computers report to the console, and one click opens a remote session
    var net = $('#svNet');
    if (net) {
      var links = $('#svLinks'), pk = $('#svPkts'), mach = $('#svMachines'), CX = 244, CY = 218, machines = [];
      [38, 178, 318].forEach(function (sy, s) {
        [452, 522, 592].forEach(function (mx, m) {
          var my = sy + 60, d = 'M' + (mx - 20) + ' ' + my + ' C 340 ' + my + ', 330 ' + CY + ', ' + CX + ' ' + CY;
          svgEl('path', { d: d }, links);
          var g = svgEl('g', { transform: 'translate(' + mx + ' ' + my + ')' }, mach);
          svgEl('rect', { class: 'm-box', x: -20, y: -20, width: 40, height: 40, rx: 9 }, g);
          svgEl('use', { href: m === 0 ? '#i-server' : '#i-monitor', x: -10, y: -10, width: 20, height: 20 }, g);
          svgEl('circle', { class: 'm-led', cx: 17, cy: -17, r: 4 }, g);
          machines.push({ g: g, x: mx, y: my });
          var c = svgEl('circle', { r: 4, class: (s === 1 && m === 2) ? 'is-warn' : '' }, pk);
          svgEl('animateMotion', { dur: '2.6s', begin: ((s * 3 + m) * 0.37).toFixed(2) + 's', repeatCount: 'indefinite', path: d }, c);
        });
      });
      var ld = $('#svLtDonut');
      if (ld) gsap.to(ld, { strokeDashoffset: 0, duration: 1.6, ease: 'power3.inOut', scrollTrigger: { trigger: net, start: 'top 80%', once: true } });
      gsap.from($$('g', mach), { opacity: 0, scale: 0.5, transformOrigin: '50% 50%', duration: 0.8, ease: 'back.out(2)', stagger: 0.05, scrollTrigger: { trigger: net, start: 'top 80%', once: true } });
      var beam = $('#svBeam'), cursor = $('#svCursor'), lab = $('#svClickLab'), targets = [1, 5, 7, 3], ti = 0;
      gsap.set(cursor, { x: 150, y: 270, opacity: 0 });
      var rt = gsap.timeline({ paused: true, repeat: -1 });
      rt.add(function () {
        var t = machines[targets[ti % targets.length]]; ti++;
        var d = 'M' + CX + ' ' + CY + ' C 330 ' + CY + ', 340 ' + t.y + ', ' + (t.x - 20) + ' ' + t.y;
        beam.setAttribute('d', d);
        var L = beam.getTotalLength();
        gsap.set(beam, { strokeDasharray: L, strokeDashoffset: L, opacity: 1 });
        lab.setAttribute('y', (Math.min(CY, t.y) + Math.abs(CY - t.y) / 2 - 26).toFixed(0)); lab.setAttribute('x', 318);
        rt._t = t;
      })
        .to(cursor, { opacity: 1, x: 196, y: 262, duration: 0.7, ease: 'power2.inOut' })
        .to(cursor, { scale: 0.8, transformOrigin: '0 0', duration: 0.1, yoyo: true, repeat: 1 })
        .to(beam, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' })
        .to(lab, { opacity: 1, duration: 0.4 }, '<0.3')
        .add(function () { rt._t.g.classList.add('is-remote'); })
        .to({}, { duration: 1.8 })
        .add(function () { rt._t.g.classList.remove('is-remote'); })
        .to([beam, lab], { opacity: 0, duration: 0.4 })
        .to(cursor, { opacity: 0, x: 150, y: 270, duration: 0.5 }, '<')
        .to({}, { duration: 0.5 });
      liveWhileVisible(net, rt);
    }

    // AVANTAGES — six cards that light up
    var bento = $('#svBento');
    if (bento) {
      gsap.from($$('.svb', bento), { opacity: 0, y: 40, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: bento, start: 'top 85%', once: true } });
      var dash = $('.svb--dash', bento);
      onView(dash, function () {
        gsap.to($('.g-donut', dash), { strokeDashoffset: 0, duration: 1.6, ease: 'power3.inOut' });
        gsap.from($('.g-ok', dash), { scaleX: 0, transformOrigin: '0% 50%', duration: 1.6, ease: 'power3.inOut' });
      });
      var cells = $$('#svMatrix i'), on = [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0];
      onView($('#svMatrix'), function () { cells.forEach(function (c, k) { if (on[k]) gsap.delayedCall(0.2 + k * 0.12, function () { c.classList.add('on'); }); }); });
      var days = $('#svDays');
      if (days) {
        for (var k = 0; k < 14; k++) { var dd = document.createElement('i'); if (k === 9) { dd.className = 'miss'; dd.innerHTML = '<b>!</b>'; } days.appendChild(dd); }
        onView(days, function () {
          $$('i', days).forEach(function (dd, k) {
            gsap.from(dd, { scaleY: 0, duration: 0.6, delay: k * 0.07, ease: 'expo.out', onComplete: function () { if (!dd.classList.contains('miss')) dd.classList.add('ok'); } });
          });
          gsap.delayedCall(1.4, function () { $('.miss', days).classList.add('alert'); });
        });
      }
      var rep = $('#svReport');
      if (rep) onView(rep, function () {
        gsap.from($$('li', rep), { scaleX: 0, duration: 0.7, ease: 'expo.out', stagger: 0.12 });
        gsap.delayedCall(1, function () { rep.classList.add('is-err'); });
      });
      var dev = $('#svDevices');
      if (dev) onView(dev, function () { $$('.dv', dev).forEach(function (g, k) { gsap.delayedCall(0.3 + k * 0.45, function () { g.classList.add('is-on'); }); }); });
      var phone = $('.g-phone', bento);
      if (phone && !reduced) gsap.to(phone, { y: -10, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }
  }

  /* =======================================================================
     IMAGE DISQUE / CLONAGE / P2V page
     ======================================================================= */
  function initDisque() {
    // HERO — the image is built partition by partition, then validated
    var job = $('#idJob');
    if (job) {
      tilt(job, -10, 4, 6);
      var fills = $$('.ij-parts--copy b', job), pctEl = $('#idJobPct'), okEl = $('#idJobOk'), w = [12, 58, 30], o2 = { v: 0 };
      var jt = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1 });
      jt.add(function () { okEl.classList.remove('is-on'); }).set(fills, { scaleX: 0 }).set(o2, { v: 0 });
      var t = 0.3;
      fills.forEach(function (f, k) { var d = 3 * w[k] / 100 + 0.25; jt.to(f, { scaleX: 1, duration: d, ease: 'none' }, t); t += d; });
      jt.to(o2, { v: 100, duration: t - 0.3, ease: 'none', onUpdate: function () { pctEl.textContent = Math.round(o2.v) + '\u00a0%'; } }, 0.3)
        .add(function () { okEl.classList.add('is-on'); }, t + 0.1)
        .to({}, { duration: 3 });
      gsap.delayedCall(reduced ? 0 : 1.6, function () { liveWhileVisible(job, jt); });
    }

    // CONCEPT — compatibility from Windows Vista to Server 2019
    var os = $('#idOs');
    if (os) onView(os, function () {
      $$('.os-row', os).forEach(function (row, r) {
        var ol = $('ol', row), lis = $$('li', row);
        gsap.to(ol, { '--p': 1, duration: 2, delay: 0.2 + r * 0.3, ease: 'power2.inOut' });
        lis.forEach(function (li, k) { gsap.delayedCall(0.2 + r * 0.3 + k * 0.55, function () { li.classList.add('on'); }); });
      });
    }, 'top 80%');

    // AVANTAGES — perpetual, price/features, support
    var facts = $('#idFacts');
    if (facts) {
      var inf = $('#idInf'), L = inf.getTotalLength();
      gsap.set(inf, { strokeDasharray: L, strokeDashoffset: L });
      onView(facts, function () {
        gsap.to(inf, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' });
        gsap.from('#idBalB', { scaleY: 0.25, transformOrigin: '50% 100%', duration: 1.6, delay: 0.3, ease: 'power3.out' });
      });
    }

    // CARACTÉRISTIQUES — partition table + list in sync
    var part = $('#idPart'), specs = $$('#idSpecs li');
    if (part && specs.length) {
      var wts = [8, 9, 10, 9, 8, 8, 10, 7, 9, 11, 11], cols = ['#1e44f0', '#3557f2', '#4f6ff5', '#6a86f7', '#8fb0ff', '#1533c4', '#2a4ef1', '#5a77f5', '#7c97f8', '#1e44f0', '#4562f3'];
      var segs = specs.map(function (li, k) {
        var i = document.createElement('i');
        i.style.setProperty('--w', wts[k]); i.style.setProperty('--c', cols[k]); li.style.setProperty('--c', cols[k]);
        i.innerHTML = '<b>' + (k + 1) + '</b>';
        part.appendChild(i);
        var hl = function (on) { i.classList.toggle('hl', on); li.classList.toggle('hl', on); };
        [i, li].forEach(function (el) { el.addEventListener('pointerenter', function () { hl(true); }); el.addEventListener('pointerleave', function () { hl(false); }); });
        return i;
      });
      onView(part, function () { segs.forEach(function (sg, k) { gsap.delayedCall(0.2 + k * 0.24, function () { sg.classList.add('on'); specs[k].classList.add('on'); }); }); }, 'top 78%');
    }

    // EN DÉTAIL — four tabs, each with its own looping diagram
    var tabsBox = $('#idTabs');
    if (tabsBox) {
      var tabs = $$('.id-tab', tabsBox), panels = $$('.id-panel', tabsBox), loops = [], vis = false, cur = 0;
      var mk = function () { return gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.6 }); };
      // 1 · P2V
      var p1 = $('.pg-p2v', panels[0]), t1 = mk();
      t1.add(function () { p1.classList.remove('is-solid'); }).set($$('.parts--copy rect', p1), { opacity: 0 })
        .to($$('.parts--copy rect', p1), { opacity: 1, duration: 0.4, stagger: 0.45 }, 0.4)
        .add(function () { p1.classList.add('is-solid'); }, 1.8)
        .to({}, { duration: 2.4 });
      // 2 · recovery disk
      var p2 = $('.pg-rec', panels[1]), media = $$('.media', p2), t2 = mk(), mi = 0;
      gsap.set('#idRecLoad', { attr: { width: 0 } }); gsap.set('#idRecDisk', { attr: { width: 0 } });
      t2.add(function () { media.forEach(function (m, k) { m.classList.toggle('is-on', k === mi % 3); }); mi++; })
        .fromTo('#idRecSel', { opacity: 0.3 }, { opacity: 1, duration: 0.3, yoyo: true, repeat: 3 }, 0.3)
        .fromTo('#idRecLoad', { attr: { width: 0 } }, { attr: { width: 144 }, duration: 1.3, ease: 'power1.inOut' }, 1.3)
        .fromTo('#idRecDisk', { attr: { width: 0 } }, { attr: { width: 128 }, duration: 1.3, ease: 'power1.inOut' }, 2.2)
        .to({}, { duration: 1.4 });
      // 3 · low cost : zip, sync, encrypt, then the destinations
      var p3 = $('.pg-cost', panels[2]), sts = $$('.st', p3), dests = $$('.dest', p3), doc = $('#idDoc', p3), t3 = mk();
      t3.add(function () { sts.concat(dests).forEach(function (e) { e.classList.remove('is-on'); }); })
        .fromTo(doc, { x: 40, y: 80, scale: 1, opacity: 1 }, { x: 150, duration: 0.8, ease: 'power1.inOut' })
        .add(function () { sts[0].classList.add('is-on'); }).to(doc, { scale: 0.7, duration: 0.3 })
        .to(doc, { x: 320, duration: 0.8, ease: 'power1.inOut' }, '+=0.3')
        .add(function () { sts[1].classList.add('is-on'); })
        .to(doc, { x: 490, duration: 0.8, ease: 'power1.inOut' }, '+=0.5')
        .add(function () { sts[2].classList.add('is-on'); })
        .to(doc, { opacity: 0, duration: 0.3 }, '+=0.4');
      dests.forEach(function (d, k) { t3.add(function () { d.classList.add('is-on'); }, '+=' + (k ? 0.18 : 0)); });
      t3.to({}, { duration: 1.6 });
      // 4 · bare metal : one image, three ways to use it
      var p4 = $('.pg-bare', panels[3]), brs = $$('.br', p4), outs = $$('.out', p4), t4 = mk();
      brs.forEach(function (b, k) {
        t4.add(function () { brs.concat(outs).forEach(function (e) { e.classList.remove('is-on'); }); b.classList.add('is-on'); outs[k].classList.add('is-on'); }, k * 1.5);
      });
      t4.to({}, { duration: 1.5 }).add(function () { brs.concat(outs).forEach(function (e) { e.classList.add('is-on'); }); }).to({}, { duration: 1.6 });
      loops = [t1, t2, t3, t4];
      var run = function () { loops.forEach(function (l, k) { if (k === cur && vis) l.play(); else l.pause(); }); };
      tabs.forEach(function (tb, k) {
        tb.addEventListener('click', function () {
          if (k === cur) return;
          cur = k;
          tabs.forEach(function (t, j) { t.classList.toggle('is-on', j === k); t.setAttribute('aria-selected', String(j === k)); });
          panels.forEach(function (p, j) { p.hidden = j !== k; });
          gsap.from(panels[k], { opacity: 0, y: 16, duration: 0.6, ease: 'expo.out' });
          loops[k].restart(); run();
        });
        tb.addEventListener('keydown', function (e) {
          var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
          if (!d) return; e.preventDefault();
          var n = tabs[(k + d + tabs.length) % tabs.length]; n.focus(); n.click();
        });
      });
      ScrollTrigger.create({ trigger: tabsBox, start: 'top bottom', end: 'bottom top', onToggle: function (s) { vis = s.isActive; run(); } });
      gsap.from(tabs, { opacity: 0, x: -24, duration: 0.9, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: tabsBox, start: 'top 85%', once: true } });
    }
  }

  /* =======================================================================
     APPLIANCES page
     ======================================================================= */
  function initAppliances() {
    var shot = $('#apShot');
    if (shot) {
      tilt(shot, -8, 2, 5);
      if (!reduced) gsap.to(shot.firstElementChild, { y: -10, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }

    // MISSION — invisible server, extractable media, 100 % ring
    var pil = $('#apPillars');
    if (pil) {
      var st = $('.pl-stealth', pil), mws = $$('.pl-mw', pil), cart = $('#apCart');
      var lt = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.8 });
      mws.forEach(function (m, k) { lt.fromTo(m, { x: 0, opacity: 0 }, { x: -70, opacity: 1, duration: 1.1, ease: 'power1.in' }, k * 0.2).to(m, { x: -150, opacity: 0, duration: 0.8 }, 1.1 + k * 0.2); });
      lt.add(function () { st.classList.add('is-hidden'); }, 0.85).add(function () { st.classList.remove('is-hidden'); }, 2.6)
        .to(cart, { x: 46, duration: 0.8, ease: 'power2.inOut' }, 0.3)
        .to(cart, { x: 0, duration: 0.8, ease: 'power2.inOut' }, 2)
        .to({}, { duration: 0.6 });
      liveWhileVisible(pil, lt);
      onView(pil, function () {
        gsap.to('#apRing', { strokeDashoffset: 0, duration: 2, ease: 'power3.inOut' });
        countUp($('#apRingV'), 100, 2, 0);
      });
    }

    // GAMMES — capacity climbs from ZEN to INFINITE
    var rg = $('#apRanges');
    if (rg) {
      var cards = $$('.ap-r', rg);
      gsap.from(cards, { opacity: 0, y: 40, duration: 1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: rg, start: 'top 85%', once: true } });
      onView(rg, function () {
        cards.forEach(function (c, k) {
          var v = $('.v', c);
          countUp(v, +v.dataset.to, 1.6 + k * 0.25, 0.3 + k * 0.15);
          gsap.to($('.bar i', c), { scaleX: 1, duration: 1.6 + k * 0.25, delay: 0.3 + k * 0.15, ease: 'power3.out' });
        });
      }, 'top 75%');
    }

    // BAIES — 18 media come online, 24 To each
    var media = $('#apMedia');
    if (media) {
      for (var k = 0; k < 18; k++) media.appendChild(document.createElement('i'));
      var tot = $('#apBay .ap-bay-total .v');
      onView(media, function () {
        $$('i', media).forEach(function (m, k) {
          gsap.delayedCall(0.2 + k * 0.12, function () { m.classList.add('on'); tot.textContent = (k + 1) * 24; });
        });
      }, 'top 80%');
    }

    // TECHNOLOGIES — rows come in
    var tl = $$('.ap-t');
    if (tl.length) tl.forEach(function (row) { gsap.from(row, { opacity: 0, y: 24, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: row, start: 'top 90%', once: true } }); });

    // PRA / PCA — the scenario plays along the timeline
    var pra = $('#apPra');
    if (pra) {
      var head = $('#apPraHead'), track = $('.pra-track', pra), lanes = $('.pra-lanes', pra), steps = $$('.pra-steps li', pra), x = $('.pra-x', pra);
      var segs = { up: $('.seg--up', pra), down: $('.seg--down', pra), nw: $('.seg--new', pra), idle: $('.seg--idle', pra), run: $('.seg--run', pra) };
      var pos = function (p) { var l = lanes.getBoundingClientRect(), t = track.getBoundingClientRect(); return (t.left - l.left) + p * t.width; };
      var pt = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.5 });
      var o = { p: 0 };
      pt.add(function () { steps.forEach(function (s) { s.classList.remove('on'); }); x.classList.remove('on'); })
        .set([segs.up, segs.down, segs.nw, segs.idle, segs.run], { scaleX: 0 }).set(head, { opacity: 1 }).set(o, { p: 0 })
        .to(o, { p: 1, duration: 7, ease: 'none', onUpdate: function () { head.style.left = pos(o.p).toFixed(1) + 'px'; } }, 0)
        .to(segs.up, { scaleX: 1, duration: 0.7, ease: 'none' }, 0)
        .to(segs.idle, { scaleX: 1, duration: 3.5, ease: 'none' }, 0)
        .to(segs.down, { scaleX: 1, duration: 5.6, ease: 'none' }, 0.7)
        .to(segs.run, { scaleX: 1, duration: 2.8, ease: 'none' }, 3.5)
        .to(segs.nw, { scaleX: 1, duration: 0.7, ease: 'none' }, 6.3)
        .add(function () { x.classList.add('on'); }, 0.7)
        .to(head, { opacity: 0, duration: 0.4 }, 7)
        .to({}, { duration: 2 });
      [0.7, 2.1, 3.5, 4.9, 6.3].forEach(function (t, k) { pt.add(function () { steps[k].classList.add('on'); }, t); });
      liveWhileVisible(pra, pt);
    }

    // CERTIFICATIONS — figures + the twelve stars
    var dk = $('#apDattak');
    if (dk) onView(dk, function () { $$('.ap-dattak-figs .v', dk).forEach(function (v, k) { countUp(v, +v.dataset.to, 1.8, 0.2 + k * 0.2); }); }, 'top 75%');
    var eu = $('.ap-eu');
    if (eu) {
      for (var s = 0; s < 12; s++) { var i = document.createElement('i'); i.style.setProperty('--a', (s * 30) + 'deg'); eu.appendChild(i); }
      onView(eu, function () { $$('i', eu).forEach(function (i, k) { gsap.delayedCall(k * 0.08, function () { i.classList.add('on'); }); }); });
    }

    // SPEC TABLE — checks pop in
    var tab = $('#apTable');
    if (tab) onView(tab, function () { tab.classList.add('is-on'); }, 'top 70%');
  }

  /* =======================================================================
     OPTION RDO page
     ======================================================================= */
  function initRdo() {
    // HERO — the cartridge slides in, then the three key figures count
    var cart = $('#rdCart');
    if (cart) {
      gsap.set(cart, { x: 140, opacity: 0, rotation: 2 });
      gsap.to(cart, { x: 0, opacity: 1, rotation: 0, duration: 1.6, ease: 'expo.out', delay: reduced ? 0 : 1.5 });
      if (!reduced) gsap.to(cart.firstElementChild, { y: -8, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 3 });
      ScrollTrigger.create({ trigger: '.rd-hero', start: 'top top', end: 'bottom top', scrub: true, onUpdate: function (s) { cart.style.setProperty('--sy', s.progress); gsap.set(cart, { y: s.progress * -60, scale: 1 - s.progress * 0.06 }); } });
      var figs = $$('#rdFigs .v');
      gsap.delayedCall(reduced ? 0.2 : 2.3, function () { figs.forEach(function (v, k) { countUp(v, +v.dataset.to, 1.6 + k * 0.3, k * 0.15); }); });
    }

    // POURQUOI — tape, disk, then RDO = both
    var mx = $('#rdCombine');
    if (mx) {
      var rows = $$('.rm-row:not(.rm-head)', mx);
      onView(mx, function () {
        [0, 1, 2].forEach(function (col) {
          rows.forEach(function (r, k) {
            var cell = $$('i', r)[col], has = col === 2 || (col === 0 ? r.dataset.src === 't' : r.dataset.src === 'd');
            gsap.delayedCall(0.3 + col * 1.1 + k * 0.1, function () { cell.classList.add(has ? 'on' : 'off'); });
          });
        });
      }, 'top 70%');
    }

    // INNOVATIONS — three small loops
    var inn = $('#rdInnov');
    if (inn) {
      var scr = $('#rdVmScr'), rest = $('#rdRest'), ok = $('.g-rest-ok', inn), rcs = $$('#rdRot .g-rc'), slots = [[36, 40], [88, 40], [140, 40]];
      var it = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.6 });
      it.add(function () { scr.classList.remove('on'); ok.classList.remove('on'); })
        .fromTo(rest, { strokeDashoffset: 100.5 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.2)
        .add(function () { ok.classList.add('on'); }, 1.8)
        .add(function () { scr.classList.add('on'); }, 1.2);
      rcs.forEach(function (g, k) { gsap.set(g, { x: slots[k][0], y: slots[k][1] }); });
      for (var step = 0; step < 3; step++) {
        rcs.forEach(function (g, k) {
          var to = slots[(k + step + 1) % 3];
          it.to(g, { x: to[0], y: to[1] - (to[0] === 36 ? 30 : 0), duration: 0.5, ease: 'power2.inOut' }, 0.4 + step * 1.1)
            .to(g, { y: to[1], duration: 0.3, ease: 'power2.out' }, 0.9 + step * 1.1);
        });
      }
      it.to({}, { duration: 0.8 });
      liveWhileVisible(inn, it);
    }

    // C'EST QUOI — data travels to a safe place
    var flow = $('#rdFlow');
    if (flow) onView(flow, function () {
      var parts = $$('.rf-step, .rf-link', flow);
      parts.forEach(function (p, k) { gsap.delayedCall(0.2 + k * 0.45, function () { p.classList.add('on'); }); });
    }, 'top 75%');

    // EXIT — tapes are struck out, RDO comes in
    var ex = $('#rdExit');
    if (ex) onView(ex, function () { ex.classList.add('is-on'); }, 'top 75%');

    // CARACTÉRISTIQUES — 18 media × 32 To = 576 To
    var med = $('#rdMedia');
    if (med) {
      for (var m = 0; m < 18; m++) med.appendChild(document.createElement('i'));
      var tv = $('.rb-cap .v');
      onView(med, function () { $$('i', med).forEach(function (el, k) { gsap.delayedCall(0.2 + k * 0.1, function () { el.classList.add('on'); tv.textContent = (k + 1) * 32; }); }); }, 'top 80%');
      gsap.from($$('#rdBento .rb'), { opacity: 0, y: 36, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '#rdBento', start: 'top 85%', once: true } });
    }

    // FICHE — the document in perspective
    var doc = $('#rdDoc');
    if (doc) tilt(doc, -14, 6, 7);
  }

  /* =======================================================================
     HOME v4 — rings, carousel, live interface
     ======================================================================= */
  function arc(cx, cy, r, a0, a1) {
    var p = function (a) { var t = (a - 90) * Math.PI / 180; return (cx + r * Math.cos(t)).toFixed(2) + ' ' + (cy + r * Math.sin(t)).toFixed(2); };
    return 'M' + p(a0) + ' A' + r + ' ' + r + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + p(a1);
  }
  function segRing(svg, cx, r, n, gap) {
    var step = 360 / n, out = [];
    for (var k = 0; k < n; k++) out.push(svgEl('path', { d: arc(cx, cx, r, k * step + gap / 2, (k + 1) * step - gap / 2) }, svg));
    return out;
  }
  function ringTo(circle, frac, dur, delay) {
    var C = 2 * Math.PI * +circle.getAttribute('r');
    gsap.fromTo(circle, { strokeDashoffset: C }, { strokeDashoffset: C * (1 - frac), duration: dur, delay: delay || 0, ease: 'power3.inOut' });
  }

  // risks : four different neon pictures, a hundred dots, a tube, a level, the days that climb
  function initRisks() {
    var grid = $('#rkGrid'); if (!grid) return;
    var rks = $$('.rk', grid);
    var make = function (box, n, tag) { var out = []; if (box) for (var k = 0; k < n; k++) out.push(box.appendChild(document.createElement(tag || 'i'))); return out; };
    var dots = make($('.rk-dots', grid), 100), lines = make($('.rk-level', grid), 50);
    var week = $('.rk-week', grid), ticks = [];
    if (week) for (var t = 0; t <= 7; t++) ticks.push(svgEl('line', { x1: 8 + t * 32, x2: 8 + t * 32, y1: 142, y2: 148 }, $('.wk-ticks', week)));
    var wl = week ? $('.wk-line', week) : null, wlen = wl ? wl.getTotalLength() : 0;
    if (wl) gsap.set(wl, { strokeDasharray: wlen, strokeDashoffset: wlen });
    // a fixed shuffle so the dots light up scattered
    var order = dots.map(function (d, k) { return { k: k, r: Math.sin(k * 91.7) * 1e4 % 1 }; }).sort(function (x, y) { return x.r - y.r; }).map(function (o) { return o.k; });
    gsap.set(rks, { opacity: 0, y: 30 });
    onView(grid, function () {
      gsap.to(rks, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.12 });
      rks.forEach(function (rk, i) {
        var v = +rk.dataset.value, d = 0.3 + i * 0.18, num = $('.v', rk), kind = rk.dataset.kind;
        if (kind === 'dots') {
          order.slice(0, v).forEach(function (k, j) { gsap.delayedCall(d + j * 0.021, function () { dots[k].classList.add('on'); }); });
          countUp(num, v, 2, d);
        } else if (kind === 'tube') {
          var tk = $$('.tk span', rk);
          gsap.to($('.tr i', rk), { width: v + '%', duration: 2, delay: d, ease: 'power3.inOut', onUpdate: function () { var f = parseFloat(this.targets()[0].style.width) / 100; tk.forEach(function (s, k) { s.classList.toggle('on', k / 10 <= f); }); } });
          countUp(num, v, 2, d);
        } else if (kind === 'level') {
          var n = Math.round(lines.length * v / 100);
          lines.slice(0, n).forEach(function (l, j) { gsap.delayedCall(d + j * 0.085, function () { l.classList.add('on'); }); });
          countUp(num, v, 2, d);
        } else if (kind === 'week' && wl) {
          var head = $('.wk-head', week), pos = { t: 0 }, seg = wlen / 5.6;
          gsap.to(pos, { t: wlen, duration: 2.6, delay: d, ease: 'none', onUpdate: function () {
            var pt = wl.getPointAtLength(pos.t); head.setAttribute('cx', pt.x.toFixed(1)); head.setAttribute('cy', pt.y.toFixed(1));
            wl.style.strokeDashoffset = wlen - pos.t;
            var day = Math.min(v, Math.floor(pos.t / seg + 0.02));
            num.textContent = day; ticks.forEach(function (tk, k) { tk.classList.toggle('on', k <= day); });
          }, onComplete: function () { num.textContent = v; week.classList.add('is-done'); } });
        }
      });
    }, 'top 75%');
  }

  // proof : 100 %, ten years in ten segments, 17 000 To
  function initProof() {
    var box = $('#stats'); if (!box) return;
    var pfs = $$('.pf', box), seg = $('.pf-seg', box), segs = seg ? segRing(seg, 70, 60, 10, 6) : [];
    gsap.set(pfs, { opacity: 0, y: 30 });
    onView(box, function () {
      gsap.to(pfs, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.12 });
      pfs.forEach(function (pf, i) {
        var c = $('.count', pf), p = $('.p', pf), to = +c.dataset.to, d = 0.3 + i * 0.2;
        if (p) ringTo(p, 1, 2.2, d);
        if (segs.length && pf.contains(seg)) segs.forEach(function (s, k) { gsap.delayedCall(d + k * 0.16, function () { s.classList.add('on'); }); });
        countUp(c, to, 2.2, d);
      });
    }, 'top 78%');
  }

  // features : a wheel of cards that turns forever, the main card in the middle ; drag it, swipe it, or use the arrows
  function initCarousel() {
    var view = $('#fcView'), track = $('#fcTrack'); if (!view || !track) return;
    var cards = $$('.fc-card', track), n = cards.length, box = $('#fcDots'), st = { p: 0 }, W = 0, G = 22;
    var visible = false, hover = false, down = false, moved = false, auto = null, cur = -1;
    var wrap = function (d) { d = ((d % n) + n) % n; if (d >= n / 2) d -= n; return d; };
    var dots = cards.map(function (c, k) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Fonctionnalité ' + (k + 1) + ' sur ' + n);
      b.addEventListener('click', function () { go(Math.round(st.p) + wrap(k - Math.round(st.p))); });
      return box.appendChild(b);
    });
    var layout = function () {
      W = cards[0].offsetWidth; var h = 0;
      cards.forEach(function (c) { c.style.height = 'auto'; });
      cards.forEach(function (c) { h = Math.max(h, c.offsetHeight); });
      cards.forEach(function (c) { c.style.height = h + 'px'; });
      track.style.height = h + 'px';
    };
    var render = function () {
      cards.forEach(function (c, k) {
        var d = wrap(k - st.p), a = Math.abs(d), sg = d < 0 ? -1 : 1;
        var x = sg * (Math.min(a, 1) * (W + G) + Math.max(0, a - 1) * (W + G) * 0.92);
        gsap.set(c, { x: x, scale: 1 - Math.min(a, 1) * 0.08 - Math.max(0, Math.min(a, 3) - 1) * 0.04, rotationY: clamp(d, -2.5, 2.5) * 7, transformPerspective: 1600,
          opacity: a <= 2 ? 1 - a * 0.25 : Math.max(0, 0.5 - (a - 2) * 0.6) });
        c.style.zIndex = 30 - Math.round(a * 6);
        c.classList.toggle('is-on', a < 0.5);
      });
      var i = ((Math.round(st.p) % n) + n) % n;
      if (i !== cur) { cur = i; dots.forEach(function (b, k) { b.classList.toggle('on', k === i); }); }
    };
    var schedule = function () {
      if (auto) { auto.kill(); auto = null; }
      if (visible && !hover && !down) auto = gsap.delayedCall(5, function () { go(Math.round(st.p) + 1); });
    };
    var go = function (target) { gsap.to(st, { p: target, duration: 0.95, ease: 'expo.out', overwrite: true, onUpdate: render }); schedule(); };
    $('#fcNext').addEventListener('click', function () { go(Math.round(st.p) + 1); });
    $('#fcPrev').addEventListener('click', function () { go(Math.round(st.p) - 1); });
    cards.forEach(function (c, k) { c.addEventListener('click', function () { if (!moved && k !== cur) go(Math.round(st.p) + wrap(k - Math.round(st.p))); }); });
    view.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hover = true; schedule(); } });
    view.addEventListener('pointerleave', function () { hover = false; schedule(); });
    // drag : the wheel follows the hand, and keeps its momentum when released
    var sx = 0, sp = 0, lx = 0, lt = 0, vel = 0;
    view.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      down = true; moved = false; sx = lx = e.clientX; sp = st.p; lt = performance.now(); vel = 0;
      gsap.killTweensOf(st); schedule(); view.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var now = performance.now(), dx = e.clientX - sx;
      if (Math.abs(dx) > 6) moved = true;
      st.p = sp - dx / (W + G);
      vel = 0.75 * vel + 0.25 * ((e.clientX - lx) / Math.max(1, now - lt)); lx = e.clientX; lt = now;
      render();
    });
    window.addEventListener('pointerup', function () {
      if (!down) return; down = false; view.classList.remove('is-drag');
      go(Math.round(st.p - clamp(vel * 260 / (W + G), -4, 4)));
      setTimeout(function () { moved = false; }, 0);
    });
    // a horizontal swipe on a trackpad turns the wheel too
    var wt = null;
    view.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault(); gsap.killTweensOf(st);
      st.p += e.deltaX / (W + G); render();
      clearTimeout(wt); wt = setTimeout(function () { go(Math.round(st.p)); }, 140);
    }, { passive: false });
    view.setAttribute('tabindex', '0');
    view.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); go(Math.round(st.p) + (e.key === 'ArrowRight' ? 1 : -1)); } });
    window.addEventListener('resize', function () { layout(); render(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); render(); });
    layout(); render();
    gsap.from(view, { opacity: 0, y: 50, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: view, start: 'top 88%', once: true } });
    ScrollTrigger.create({ trigger: view, start: 'top 80%', end: 'bottom top', onToggle: function (s) { visible = s.isActive; schedule(); } });
  }

  // DataClone : the dashboard tiles switch on, LEDs go green, capacity fills
  function initDcUi() {
    var ui = $('#dcUi'); if (!ui) return;
    tilt(ui, -10, 4, 6);
    var cap = $('#dcCap'); for (var k = 0; k < 24; k++) cap.appendChild(document.createElement('i'));
    var tiles = $$('.dc-tile', ui), leds = $$('.dc-leds span', ui), bars = $$('i', cap);
    var t = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.5 });
    t.add(function () { tiles.concat(leds, bars).forEach(function (e) { e.classList.remove('on'); }); });
    tiles.forEach(function (ti, k) { t.add(function () { ti.classList.add('on'); }, 0.5 + k * 0.6); });
    leds.forEach(function (l, k) { t.add(function () { l.classList.add('on'); }, 2.3 + k * 0.25); });
    bars.forEach(function (b, k) { if (k < 15) t.add(function () { b.classList.add('on'); }, 0.4 + k * 0.08); });
    t.to({}, { duration: 4 }, 3);
    liveWhileVisible(ui, t);
  }

  // SaaS : each client gets its own instance
  function initSaasVis() {
    var vis = $('#saasVis'); if (!vis) return;
    var inst = $$('.sv-inst', vis), cl = $$('.sv-clients span', vis);
    onView(vis, function () { inst.forEach(function (it, k) { gsap.delayedCall(0.3 + k * 0.4, function () { it.classList.add('on'); cl[k].classList.add('on'); }); }); }, 'top 75%');
  }

  // buttons : the fill disc always covers the whole button
  function initButtons() {
    var fit = function () { $$('.btn').forEach(function (b) { b.style.setProperty('--fs', Math.max(14, Math.ceil(b.offsetWidth * 2.2 / 40))); }); };
    fit(); window.addEventListener('resize', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }

  /* =======================================================================
     RENTRÉE 2026 page
     ======================================================================= */
  function initRentree() {
    // the change of scale : three from → to lines
    var sc = $('#rtScale');
    if (sc) onView(sc, function () { $$('.rs-row', sc).forEach(function (r, k) { gsap.delayedCall(0.2 + k * 0.35, function () { r.classList.add('on'); }); }); }, 'top 78%');

    // the network : Hyperion → AGS Next → professionals → companies
    var net = $('#rtNet');
    if (net) {
      var links = $('#rtNetLinks'), mid = $('#rtNetMid'), outer = $('#rtNetOuter'), C = 260, ax = 260, ay = 168, mids = [];
      for (var k = 0; k < 25; k++) {
        var a = (k / 25) * Math.PI * 2 - Math.PI / 2, x = C + 170 * Math.cos(a), y = C + 170 * Math.sin(a);
        var path = svgEl('path', { d: 'M' + ax + ' ' + ay + ' Q ' + C + ' ' + C + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) }, links);
        mids.push({ c: svgEl('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 5 }, mid), p: path });
      }
      var outs = [];
      for (var j = 0; j < 110; j++) {
        var b = (j / 110) * Math.PI * 2 + (j % 3) * 0.02, rr = 222 + (j * 37 % 40);
        outs.push(svgEl('circle', { cx: (C + rr * Math.cos(b)).toFixed(1), cy: (C + rr * Math.sin(b)).toFixed(1), r: 2.2 }, outer));
      }
      gsap.set('#rtNetAgs', { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(mids.map(function (m) { return m.c; }), { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(outs, { opacity: 0 });
      mids.forEach(function (m) { var L = m.p.getTotalLength(); gsap.set(m.p, { strokeDasharray: L, strokeDashoffset: L }); });
      onView(net, function () {
        var t = gsap.timeline();
        t.to('#rtNetAgs', { scale: 1, duration: 0.7, ease: 'back.out(2.4)' }, 0.2);
        mids.forEach(function (m, i) {
          t.to(m.p, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out' }, 0.6 + i * 0.04)
            .to(m.c, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, 1.1 + i * 0.04);
        });
        t.to(outs, { opacity: 1, duration: 0.6, stagger: { each: 0.012, from: 'random' } }, 1.8);
        // then pulses travel outward forever
        var pulse = svgEl('g', {}, net);
        t.add(function () {
          var loop = gsap.timeline({ repeat: -1 });
          for (var q = 0; q < 6; q++) {
            var m = mids[(q * 4) % 25], dot = svgEl('circle', { r: 3, cx: 0, cy: 0, class: 'rn-pulse' }, pulse), L = m.p.getTotalLength(), o = { t: 0 };
            (function (m, dot, o, L) {
              loop.fromTo(o, { t: 0 }, { t: 1, duration: 1.6, ease: 'power1.inOut', onUpdate: function () { var pt = m.p.getPointAtLength(o.t * L); dot.setAttribute('cx', pt.x.toFixed(1)); dot.setAttribute('cy', pt.y.toFixed(1)); dot.setAttribute('opacity', (1 - Math.abs(o.t - .5) * 1.6).toFixed(2)); } }, q * 0.45);
            })(m, dot, o, L);
          }
        });
      }, 'top 75%');
    }
    var figs = $('#rtFigs');
    if (figs) onView(figs, function () { countUp($('.v', figs), 25, 1.6, 0.1); });

    // VAD : the role keeps growing beyond licences
    var roles = $('#rtRoles');
    if (roles) onView(roles, function () { $$('li:not(.is-base)', roles).forEach(function (li, k) { gsap.delayedCall(0.3 + k * 0.28, function () { li.classList.add('on'); }); }); }, 'top 78%');

    // DataClone 2.0 : the old code goes away, the new architecture assembles
    var rw = $('#rtRewrite');
    if (rw) {
      var box = $('.rw-lines', rw), widths = [92, 70, 84, 56, 78, 64, 88, 48, 74, 60];
      widths.forEach(function (w) { var i = document.createElement('i'); i.style.width = w + '%'; box.appendChild(i); });
      var blocks = $$('.rw-block', rw);
      gsap.set(blocks, { opacity: 0, y: 20, scale: 0.94 });
      onView(rw, function () {
        var t = gsap.timeline();
        $$('i', box).forEach(function (ln, k) { t.add(function () { ln.classList.add('gone'); }, 0.3 + k * 0.09); });
        t
          .to(blocks, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.8)', stagger: 0.18 }, 1.2);
      }, 'top 75%');
    }
    var res = $('.pil-res');
    if (res) onView(res, function () { gsap.to($('.rp', res), { strokeDashoffset: 0, duration: 1.4, ease: 'power3.inOut', onComplete: function () { res.classList.add('on'); } }); }, 'top 85%');
    var iso = $('.pil-iso');
    if (iso && !reduced) gsap.to($('.pb', iso), { x: 8, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    // DataClone 365 : the cloud can stop, your data stays available
    var cloud = $('#rtCloud');
    if (cloud) {
      var ct = gsap.timeline({ paused: true, repeat: -1 });
      ct.add(function () { cloud.classList.remove('is-down'); }).to({}, { duration: 3.2 }).add(function () { cloud.classList.add('is-down'); }).to({}, { duration: 3.2 });
      liveWhileVisible(cloud, ct);
    }
    var off = $('#rtOff');
    if (off) {
      var ot = gsap.timeline({ paused: true, repeat: -1 });
      ot.add(function () { off.classList.remove('is-down'); }).to({}, { duration: 2.4 }).add(function () { off.classList.add('is-down'); }).to({}, { duration: 3.2 });
      liveWhileVisible(off, ot);
    }
    var lock = $('#rtLock');
    if (lock) {
      var steps = $$('.rl-steps li', lock), bar = $('.rl-bar i', lock), lt = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1 });
      lt.add(function () { steps.forEach(function (s) { s.classList.remove('on'); }); lock.classList.remove('is-open'); }).set(bar, { scaleX: 0 })
        .add(function () { steps[0].classList.add('on'); lock.classList.add('is-open'); }, 0.5)
        .add(function () { steps[1].classList.add('on'); }, 1.3)
        .to(bar, { scaleX: 1, duration: 1.4, ease: 'power1.inOut' }, 1.3)
        .add(function () { steps[2].classList.add('on'); lock.classList.remove('is-open'); }, 2.9)
        .to({}, { duration: 1.6 });
      liveWhileVisible(lock, lt);
    }
    var rst = $('#rtRestore');
    if (rst) {
      var items = $$('.rr-i', rst), dests = $$('.rr-dest span', rst), rt = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.8 }), di = 0;
      rt.add(function () { items.concat(dests).forEach(function (e) { e.classList.remove('on', 'sel'); }); });
      items.forEach(function (it, k) { rt.add(function () { it.classList.add('on'); if (k === items.length - 1) it.classList.add('sel'); }, 0.4 + k * 0.45); });
      rt.add(function () { dests[di % 2].classList.add('on'); di++; }, 0.4 + items.length * 0.45 + 0.2).to({}, { duration: 2 });
      liveWhileVisible(rst, rt);
    }

    // finale : three forces, and the scale grows
    var forces = $('#rtForces');
    if (forces) onView(forces, function () { $$('.rf', forces).forEach(function (f, k) { gsap.delayedCall(0.2 + k * 0.3, function () { f.classList.add('on'); }); }); }, 'top 80%');
    var grow = $('#rtGrow');
    if (grow) {
      var gs = $$('.rg', grow);
      gsap.set(gs, { opacity: 0, y: 30 });
      onView(grow, function () { gsap.to(gs, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.3 }); countUp($('.v', grow), 25, 1.4, 0.1); }, 'top 80%');
    }
    var cards = $$('.rt-card');
    cards.forEach(function (c) { c.addEventListener('mouseenter', function () { gsap.to($('img', c), { scale: 1.04, duration: 0.5, ease: 'expo.out' }); }); c.addEventListener('mouseleave', function () { gsap.to($('img', c), { scale: 1, duration: 0.6, ease: 'expo.out' }); }); });
  }

  /* =======================================================================
     SAUVEGARDE VMWARE page
     ======================================================================= */
  function initVmware() {
    var k;
    // hero : one licence, and the virtual machines keep multiplying (1, 4, 16, 64, 256… ∞)
    var lic = $('#vmLic');
    if (lic) {
      var card = $('.vl-card', lic), stage = $('.vl-stage', lic), cnt = $('#vmCount'), tiles = [], cur = 0, shown = { v: 1 };
      var LV = [{ g: 0, r: 14 }, { g: 12, r: 11 }, { g: 8, r: 8 }, { g: 5, r: 5 }, { g: 3, r: 2.5 }];
      tilt(card, -9, 4, 5);
      var rect = function (L, i, j) {
        var S = stage.offsetWidth, n = 1 << L, g = LV[L].g, s = (S - (n - 1) * g) / n;
        return { left: j * (s + g), top: i * (s + g), width: s, height: s, borderRadius: LV[L].r };
      };
      var count = function (to) {
        cnt.classList.remove('is-inf');
        gsap.to(shown, { v: to, duration: 0.9, ease: 'power2.out', overwrite: true, onUpdate: function () { cnt.textContent = Math.round(shown.v); } });
      };
      var level = function (L) {
        var n = 1 << L, old = tiles; tiles = []; cur = L;
        for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
          var t = document.createElement('i');
          if (L < 2) t.innerHTML = '<svg><use href="#i-monitor"/></svg>';
          t.style.setProperty('--o', (0.62 + ((i * 7 + j * 13) % 10) / 26).toFixed(2));
          if (L) t.className = 'on';
          stage.appendChild(t); tiles.push(t);
          if (L) {
            gsap.set(t, rect(L - 1, i >> 1, j >> 1));
            gsap.to(t, Object.assign(rect(L, i, j), { duration: 0.85, ease: 'expo.inOut', delay: ((i + j) / (2 * n)) * 0.3 }));
          } else {
            gsap.set(t, rect(0, 0, 0));
            gsap.fromTo(t, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out', delay: old.length ? 0.45 : 0 });
            gsap.delayedCall(old.length ? 1.1 : 0.6, function (t) { t.classList.add('on'); }, [t]);
          }
        }
        if (L === 0 && old.length) old.forEach(function (t) { gsap.to(t, Object.assign(rect(0, 0, 0), { opacity: 0, duration: 0.6, ease: 'expo.inOut', onComplete: function () { t.remove(); } })); });
        else old.forEach(function (t) { t.remove(); });
        if (L === 0 && old.length) { shown.v = 1; cnt.classList.remove('is-inf'); cnt.textContent = '1'; } else count(n * n);
      };
      var infinity = function () {
        cnt.textContent = '∞'; cnt.classList.add('is-inf');
        tiles.forEach(function (t) { gsap.delayedCall(Math.random() * 1.4, function () { t.classList.remove('on'); gsap.delayedCall(0.45, function () { t.classList.add('on'); }); }); });
      };
      if (reduced) level(2);
      else {
        var lt = gsap.timeline({ paused: true, repeat: -1 });
        for (k = 0; k < 5; k++) lt.add(level.bind(null, k), k * 1.8);
        lt.add(infinity, 9).to({}, { duration: 3 }, 9);
        liveWhileVisible(lic, lt);
      }
      window.addEventListener('resize', function () { var n = 1 << cur; tiles.forEach(function (t, q) { gsap.set(t, rect(cur, Math.floor(q / n), q % n)); }); });
    }

    // concept : the machine keeps running while its copies leave, automatically
    var auto = $('#vmAuto');
    if (auto) {
      var live = $('.va-live-l', auto), pts = [];
      for (k = 0; k < 41; k++) pts.push(16 + ((k * 37) % 29) + Math.sin(k * 0.8) * 6);
      var drawLive = function () { live.setAttribute('d', pts.map(function (y, i) { return (i ? 'L' : 'M') + i * 5 + ' ' + y.toFixed(1); }).join(' ')); };
      drawLive();
      var ht = gsap.timeline({ paused: true, repeat: -1 });
      ht.call(function () { pts.shift(); pts.push(10 + Math.random() * 40); drawLive(); }, null, 0.22).to({}, { duration: 0.24 }, 0);
      liveWhileVisible(auto, ht);
      var pipes = $$('.va-pipes path', auto), dests = $$('.va-d', auto), psvg = $('.va-pipes svg', auto), bars = dests.map(function (d) { return $('i', d); });
      var pt = gsap.timeline({ paused: true, repeat: -1 });
      pipes.forEach(function (p, i) {
        var L = p.getTotalLength(), dot = svgEl('circle', { r: 4.5, cx: -20, cy: -20, class: 'va-pkt' }, psvg), o = { t: 0 };
        pt.fromTo(o, { t: 0 }, { t: 1, duration: 1.1, ease: 'power1.inOut', immediateRender: false, onUpdate: function () { var q = p.getPointAtLength(o.t * L); dot.setAttribute('cx', q.x.toFixed(1)); dot.setAttribute('cy', q.y.toFixed(1)); dot.style.opacity = o.t < 0.97 ? 1 : 0; } }, 0.3 + i * 0.55)
          .fromTo(bars[i], { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power2.out', immediateRender: false }, 1.35 + i * 0.55)
          .call(function () { dests[i].classList.add('on'); }, null, 1.35 + i * 0.55);
      });
      pt.to(bars, { opacity: 0, duration: 0.4 }, 4.6)
        .call(function () { dests.forEach(function (d) { d.classList.remove('on'); }); }, null, 4.6)
        .set(bars, { scaleX: 0, opacity: 1 }, 5.05);
      liveWhileVisible(auto, pt);
    }

    // replication : increments travel from the source to the destination, then the roles swap
    var rp = $('#vmRepl');
    if (rp) {
      var link = $('.rp-link', rp), lane = $('.rp-blocks', rp), hosts = $$('.rp-host', rp), blocks = [];
      for (k = 0; k < 6; k++) blocks.push(lane.appendChild(document.createElement('i')));
      var hb = function (h) { return $$('.rp-bar i', h); };
      var cycle = function (dir) {
        var src = hosts[dir > 0 ? 0 : 1], dst = hosts[dir > 0 ? 1 : 0], vert = isMobile(), D = (vert ? lane.offsetHeight : lane.offsetWidth) - 14;
        rp.classList.toggle('is-swap', dir < 0);
        hosts.forEach(function (h) { h.classList.toggle('is-src', h === src); });
        gsap.to(hb(src), { scaleX: 1, duration: 0.6, ease: 'power2.out' });
        gsap.to(hb(dst), { scaleX: 0.62, duration: 0.6, ease: 'power2.out' });
        blocks.forEach(function (b, i) {
          var a = dir > 0 ? 0 : D, z = dir > 0 ? D : 0, t = 0.9 + i * 0.34, from = {}, to = {};
          from[vert ? 'y' : 'x'] = a; to[vert ? 'y' : 'x'] = z;
          gsap.set(b, { x: 0, y: 0 });
          gsap.fromTo(b, from, Object.assign(to, { duration: 1.25, ease: 'power1.inOut', delay: t }));
          gsap.fromTo(b, { opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.2 }, { opacity: 1, duration: 0.85 }, { opacity: 0, duration: 0.2 }], delay: t });
          gsap.to(hb(dst)[i % 3], { scaleX: '+=0.19', duration: 0.4, ease: 'power2.out', delay: t + 1.2 });
        });
      };
      var rt = gsap.timeline({ paused: true, repeat: -1 });
      rt.call(cycle, [1], 0).call(cycle, [-1], 4.6).to({}, { duration: 4.6 }, 4.6);
      if (reduced) cycle(1); else liveWhileVisible(rp, rt);
    }

    // CBT : only the changed blocks of the occupied space leave in the incremental backup
    var cbt = $('#vmCbt');
    if (cbt) {
      var grid = $('.cb-grid', cbt), strip = $('.cb-strip', cbt), used = [];
      for (k = 0; k < 144; k++) {
        var c = document.createElement('i'), row = Math.floor(k / 16);
        var u = row < 3 ? (k * 7) % 11 !== 0 : row < 6 ? (k * 13) % 5 < 3 : (k * 17) % 7 < 2;
        if (u) { c.className = 'u'; used.push(c); }
        grid.appendChild(c);
      }
      var ct = gsap.timeline({ paused: true, repeat: -1 });
      ct.call(function () {
        var pick = used.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 7);
        pick.forEach(function (c, i) { gsap.delayedCall(i * 0.12, function () { c.classList.add('c'); }); });
        if (strip.children.length > 26) gsap.to(strip.children, { opacity: 0, duration: 0.3, delay: 1.3, onComplete: function () { strip.innerHTML = ''; } });
        pick.forEach(function (c, i) {
          gsap.delayedCall(1.75 + i * 0.09, function () {
            c.classList.remove('c');
            var b = strip.appendChild(document.createElement('i'));
            gsap.from(b, { scaleY: 0, opacity: 0, duration: 0.4, ease: 'back.out(2)' });
          });
        });
      }, null, 0.2).to({}, { duration: 3.4 }, 0);
      liveWhileVisible(cbt, ct);
    }

    // compatible vCenter / ESXi Free : the nodes light up one after the other
    var cp = $('#vmCompat');
    if (cp) onView(cp, function () { $$('.cp-node, .cp-dc', cp).forEach(function (nd, i) { gsap.delayedCall(0.2 + i * 0.22, function () { nd.classList.add('on'); }); }); }, 'top 82%');

    // application-consistent : writes, pre-freeze, the file system at rest, snapshot, post-thaw
    var fz = $('#vmFreeze');
    if (fz) {
      var line = $('.fz-line', fz), head = $('.fz-head', fz), snap = $('.fz-snap', fz), mks = $$('.fz-mk', fz), d = 'M14 150', x;
      for (x = 21; x <= 406; x += 7) d += ' L' + x + ' ' + ((x > 168 && x < 264) ? 150 : (150 - 22 - (Math.abs(Math.sin(x * 12.9898) * 43758.5453) % 1) * 84).toFixed(1));
      line.setAttribute('d', d);
      var len = line.getTotalLength(), fo = { t: 0 }, snapped = false;
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      var ftl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.4 });
      ftl.call(function () { mks.forEach(function (m) { m.classList.remove('on'); }); fz.classList.remove('is-rest'); gsap.set(snap, { opacity: 0 }); snapped = false; })
        .fromTo(fo, { t: 0 }, { t: 1, duration: 4.4, ease: 'none', immediateRender: false, onUpdate: function () {
          var Lx = fo.t * len, p = line.getPointAtLength(Lx);
          line.style.strokeDashoffset = len - Lx; head.setAttribute('cx', p.x.toFixed(1)); head.setAttribute('cy', p.y.toFixed(1));
          mks.forEach(function (m) { if (p.x >= +m.dataset.at) m.classList.add('on'); });
          if (p.x >= 168) fz.classList.add('is-rest');
          if (p.x >= 216 && !snapped) { snapped = true; gsap.fromTo(snap, { opacity: 1 }, { opacity: 0.3, duration: 0.9, ease: 'power2.out' }); }
        } });
      liveWhileVisible(fz, ftl);
    }

    // characteristics : the switches turn on one by one
    var feat = $('#vmFeat');
    if (feat) onView(feat, function () { $$('.ft-list li', feat).forEach(function (li, i) { gsap.delayedCall(0.3 + i * 0.15, function () { li.classList.add('on'); }); }); }, 'top 75%');

    // « thick » : the backup fills the whole allocated space, not only the data
    var tk = $('#vmThick');
    if (tk) onView(tk, function () { gsap.to($('.tk-fill', tk), { clipPath: 'inset(0 0% 0 0)', duration: 2.2, ease: 'power2.inOut', delay: 0.4, onComplete: function () { tk.classList.add('on'); } }); }, 'top 78%');
    var sk = $('#vmStrike');
    if (sk) onView(sk, function () { sk.classList.add('on'); }, 'top 82%');

    // restoration from the NAS or the media, to a VM that is not declared on the ESXi server
    var rs = $('#vmRestore');
    if (rs) {
      var arrow = $('.rs-arrow', rs), dot = $('i', arrow), rst = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.6 });
      rst.call(function () { rs.classList.remove('on'); })
        .fromTo(dot, { x: 0, opacity: 0 }, { x: function () { return arrow.offsetWidth - 10; }, opacity: 1, duration: 1.4, ease: 'power2.inOut', immediateRender: false }, 0.2)
        .to(dot, { opacity: 0, duration: 0.2 })
        .call(function () { rs.classList.add('on'); })
        .to({}, { duration: 2.2 });
      liveWhileVisible(rs, rst);
    }
  }

  /* =======================================================================
     SAUVEGARDE EXCHANGE page
     ======================================================================= */
  function initExchange() {
    var k;
    // a block animated in CSS only plays while it is on screen
    var live = function (el) { if (el) ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: function (s) { el.classList.toggle('is-live', s.isActive); } }); };

    // hero : new e-mails arrive in the mailbox, each one is copied into the PST file
    var box = $('#exBox');
    if (box) {
      var win = $('.eb-win', box), list = $('.eb-list', box), pst = $('.eb-pst', box), prog = $('.eb-prog i', box), n = 0, done = 0;
      tilt(win, -9, 4, 5);
      var row = function (fresh) {
        var li = document.createElement('li'), w1 = 26 + (n * 37) % 28, w2 = 46 + (n * 53) % 40;
        li.className = 'eb-row ' + (fresh ? 'is-new' : 'is-ok');
        li.innerHTML = '<span class="eb-env"><svg><use href="#i-mail"/></svg></span><span class="eb-txt"><i style="width:' + w1 + '%"></i><i style="width:' + w2 + '%"></i></span>' +
          '<span class="eb-src"><svg><use href="#' + (n % 3 ? 'i-server' : 'i-cloud') + '"/></svg></span><span class="eb-ok"><svg viewBox="0 0 24 24"><path d="M6 12.5l4 4L18 8"/></svg></span>';
        n++;
        return li;
      };
      for (k = 0; k < 5; k++) list.appendChild(row(false));
      var pulse = function () {
        pst.classList.remove('pulse'); void pst.offsetWidth; pst.classList.add('pulse');
        done++;
        var f = (done - 1) % 6 + 1;
        if (f === 1) gsap.set(prog, { width: 0 });
        gsap.to(prog, { width: (f / 6 * 100).toFixed(1) + '%', duration: 0.6, ease: 'power2.out' });
      };
      var step = function () {
        var li = row(true);
        list.insertBefore(li, list.firstChild);
        gsap.fromTo(li, { height: 0, opacity: 0 }, { height: 62, opacity: 1, duration: 0.6, ease: 'expo.out' });
        gsap.delayedCall(0.7, function () { $$('.eb-row', list).slice(5).forEach(function (r) { r.remove(); }); });
        gsap.delayedCall(1.2, function () {
          li.classList.remove('is-new'); li.classList.add('is-ok');
          var env = $('.eb-env', li), fly = document.createElement('span');
          fly.className = 'eb-fly'; fly.innerHTML = '<svg><use href="#i-mail"/></svg>';
          win.appendChild(fly);
          gsap.timeline()
            .fromTo(fly, { x: env.offsetLeft + 3, y: env.offsetTop + 6, opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.2 })
            .to(fly, { x: pst.offsetLeft + 6, y: pst.offsetTop + 13, scale: 0.6, duration: 0.85, ease: 'power2.inOut' })
            .to(fly, { opacity: 0, duration: 0.15, onComplete: function () { fly.remove(); pulse(); } });
        });
      };
      if (!reduced) {
        var bt = gsap.timeline({ paused: true, repeat: -1 });
        bt.call(step, null, 0.4).to({}, { duration: 2.4 }, 0);
        liveWhileVisible(box, bt);
      }
    }

    live($('#exQuad'));
    live($('#exBento'));

    // one licence, the number of mailboxes rolls up to infinity
    var odo = $('#exOdo');
    if (odo) {
      var strip = $('.od-strip', odo), cnt = strip.children.length, ot = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.8 });
      ot.set(strip, { yPercent: 0 });
      for (k = 1; k < cnt; k++) ot.to(strip, { yPercent: -k * 100 / cnt, duration: 0.55, ease: 'expo.inOut' }, 0.5 + k * 0.75);
      liveWhileVisible(odo, ot);
    }

    // a departure board : the e-mails leave for NAS, FTP, the clouds…
    var flap = $('#exFlap');
    if (flap) {
      var word = $('.fl-word', flap), fdots = $('.fl-dots', flap), di = 0;
      var dest = ['NAS', 'FTP', 'Google Drive', 'OneDrive', 'Dropbox', 'Azure Storage', 'Amazon S3', 'stockage S3 compatible'];
      var dl = dest.map(function () { return fdots.appendChild(document.createElement('i')); });
      dl[0].classList.add('on');
      var flip = function () {
        di = (di + 1) % dest.length;
        gsap.to(word, { rotationX: -90, duration: 0.2, ease: 'power2.in', onComplete: function () {
          word.textContent = dest[di];
          word.style.fontSize = dest[di].length > 14 ? '1.12rem' : '';
          dl.forEach(function (d, q) { d.classList.toggle('on', q === di); });
          gsap.fromTo(word, { rotationX: 90 }, { rotationX: 0, duration: 0.34, ease: 'back.out(2)' });
        } });
      };
      var flt = gsap.timeline({ paused: true, repeat: -1 });
      flt.call(flip, null, 1.5).to({}, { duration: 1.5 }, 0);
      liveWhileVisible(flap, flt);
    }

    // granular restoration : a click on one mailbox, it comes back
    var mbx = $('#exMbx');
    if (mbx) {
      var cur = $('.mb-cursor', mbx), tgt = $('.mb-row--t', mbx), mt = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.8 });
      mt.call(function () { mbx.classList.remove('is-sel', 'is-done'); })
        .fromTo(cur, { x: function () { return mbx.offsetWidth - 46; }, y: function () { return mbx.offsetHeight - 12; }, opacity: 0, scale: 1 }, { opacity: 1, duration: 0.3, immediateRender: false }, 0.1)
        .to(cur, { x: function () { return tgt.offsetLeft + tgt.offsetWidth * 0.55; }, y: function () { return tgt.offsetTop + 12; }, duration: 1, ease: 'power3.inOut' }, 0.3)
        .to(cur, { scale: 0.8, duration: 0.12, yoyo: true, repeat: 1 }, 1.35)
        .call(function () { mbx.classList.add('is-sel'); }, null, 1.42)
        .call(function () { mbx.classList.add('is-done'); }, null, 2.1)
        .to(cur, { opacity: 0, duration: 0.4 }, 2.9)
        .to({}, { duration: 1.2 });
      liveWhileVisible(mbx, mt);
    }

    // main characteristics tick one by one
    var checks = $('#exChecks');
    if (checks) onView(checks, function () { $$('li', checks).forEach(function (li, i) { gsap.delayedCall(0.2 + i * 0.14, function () { li.classList.add('on'); }); }); }, 'top 78%');

    // AES 256 : the data turns into cipher
    var ciph = $('#exCipher');
    if (ciph && !reduced) {
      var hex = '0123456789ABCDEF', cit = gsap.timeline({ paused: true, repeat: -1 });
      cit.call(function () { var s = ''; for (var q = 0; q < 20; q++) s += hex[Math.floor(Math.random() * 16)]; ciph.textContent = s; }, null, 0.12).to({}, { duration: 0.12 }, 0);
      liveWhileVisible(ciph, cit);
    }

    // granular restoration with Ontrack PowerControls : tabs, each with its diagram
    var tabs = $('#exTabs');
    if (tabs) {
      var tbs = $$('.ex-tab', tabs), tps = $$('.ex-tp', tabs), seen = false, stl = null;
      var sq = $('.sr-q', tabs), caret = $('.sr-caret', tabs), hits = $$('.sr-hit', tabs), QUERY = sq.textContent;
      sq.textContent = '';
      var runSearch = function () {
        if (stl) stl.kill();
        var o = { n: 0 };
        stl = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
        stl.call(function () { sq.textContent = ''; caret.setAttribute('x', 78); hits.forEach(function (h) { h.classList.remove('is-match'); }); })
          .fromTo(o, { n: 0 }, { n: QUERY.length, duration: QUERY.length * 0.05, ease: 'none', onUpdate: function () { sq.textContent = QUERY.slice(0, Math.round(o.n)); caret.setAttribute('x', (80 + sq.getComputedTextLength()).toFixed(1)); } }, 0.3);
        hits.forEach(function (h) { stl.call(function () { h.classList.add('is-match'); }, null, '+=0.4'); });
        stl.to({}, { duration: 2.4 });
      };
      var play = function (p) {
        p.classList.remove('is-play'); void p.offsetWidth; p.classList.add('is-play');
        if (p.id === 'exP2') runSearch(); else if (stl) { stl.kill(); stl = null; }
      };
      var show = function (i, focus) {
        tbs.forEach(function (b, q) { b.classList.toggle('is-on', q === i); b.setAttribute('aria-selected', q === i ? 'true' : 'false'); b.tabIndex = q === i ? 0 : -1; });
        tps.forEach(function (p, q) { p.hidden = q !== i; p.classList.toggle('is-on', q === i); if (q !== i) p.classList.remove('is-play'); });
        gsap.fromTo(tps[i], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' });
        if (seen) play(tps[i]);
        if (focus) tbs[i].focus();
      };
      tbs.forEach(function (b, i) {
        b.tabIndex = i ? -1 : 0;
        b.addEventListener('click', function () { show(i); });
        b.addEventListener('keydown', function (e) {
          var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
          if (d) { e.preventDefault(); show((i + d + tbs.length) % tbs.length, true); }
        });
      });
      onView(tabs, function () { seen = true; play(tps[0]); }, 'top 75%');
    }
  }

  /* =======================================================================
     LE BACKUP CLOUD page
     ======================================================================= */
  function initCloud() {
    var k;
    // hero : the local level, the removable media, then the Cloud lands on top ; data keeps rising
    var st = $('#clStack');
    if (st) {
      var pls = $$('.cs-pl', st), labs = $$('.cs-lab', st), pk = $('.cs-pk', st), rise = [];
      for (k = 0; k < 4; k++) rise.push(svgEl('circle', { r: 3.5, cx: 200, cy: 352, opacity: 0 }, pk));
      var pt = gsap.timeline({ paused: true, repeat: -1 });
      rise.forEach(function (d, q) {
        pt.fromTo(d, { attr: { cy: 352 } }, { attr: { cy: 150 }, duration: 1.8, ease: 'power1.in', immediateRender: false }, q * 0.45)
          .fromTo(d, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, q * 0.45)
          .to(d, { opacity: 0, duration: 0.3 }, q * 0.45 + 1.5);
      });
      if (reduced) { pt.play(); }
      else {
        gsap.set(pls.slice(0, 2), { y: 40, opacity: 0 });
        gsap.set(pls[2], { y: -130, opacity: 0 });
        gsap.set(labs, { opacity: 0, x: -10 });
        gsap.timeline({ delay: 1.1 })
          .to(pls[0], { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out' }, 0)
          .to(labs[0], { opacity: 1, x: 0, duration: 0.6 }, 0.3)
          .to(pls[1], { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out' }, 0.35)
          .to(labs[1], { opacity: 1, x: 0, duration: 0.6 }, 0.65)
          .to(pls[2], { y: 0, opacity: 1, duration: 1.1, ease: 'back.out(1.5)' }, 0.9)
          .to(labs[2], { opacity: 1, x: 0, duration: 0.6 }, 1.5)
          .add(function () {
            liveWhileVisible(st, pt); pt.play();
            gsap.to(pls[2], { y: -8, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
          }, 2);
      }
    }

    // Microsoft Embedded : among the French companies, one of the very few
    var hex = $('#clHex');
    if (hex) {
      var hg = $('.hx-dots', hex), cx = 125, cy = 130, R = 112, V = [], dots = [];
      for (k = 0; k < 6; k++) V.push([cx + R * Math.cos(k * Math.PI / 3), cy + R * Math.sin(k * Math.PI / 3)]);
      var inside = function (x, y) {
        var c = false;
        for (var i = 0, j = 5; i < 6; j = i++) { var xi = V[i][0], yi = V[i][1], xj = V[j][0], yj = V[j][1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; }
        return c;
      };
      for (var y = cy - R + 4, r = 0; y <= cy + R; y += 13, r++) for (var x = cx - R; x <= cx + R; x += 13) {
        var xx = x + (r % 2 ? 6.5 : 0);
        if (inside(xx, y)) dots.push(svgEl('circle', { cx: xx.toFixed(1), cy: y.toFixed(1), r: 3 }, hg));
      }
      var me = $('.hx-me', hex), tag = $('.hx-tag', hex), best = dots[0], bd = 1e9;
      dots.forEach(function (p) { var dd = Math.hypot(+p.getAttribute('cx') - (cx + 30), +p.getAttribute('cy') - (cy + 34)); if (dd < bd) { bd = dd; best = p; } });
      var mx = +best.getAttribute('cx'), my = +best.getAttribute('cy');
      best.remove();
      gsap.set(me, { x: mx, y: my });
      $('.hx-line', hex).setAttribute('d', 'M' + (mx + 10) + ' ' + my + ' L238 110 H250');
      gsap.set(dots, { opacity: 0 });
      onView(hex, function () {
        gsap.to(dots, { opacity: 1, duration: 0.5, stagger: { each: 0.005, from: 'random' } });
        gsap.delayedCall(1.6, function () {
          hex.classList.add('is-dim');
          gsap.fromTo(me, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(3)', transformOrigin: '50% 50%' });
          gsap.to(tag, { opacity: 1, duration: 0.6, delay: 0.35 });
        });
      }, 'top 80%');
    }

    // optimised : the local solution is extended by Azure ; low maintenance, high return
    var ext = $('#clExt');
    if (ext) onView(ext, function () { ext.classList.add('on'); }, 'top 80%');

    // the third level : a map with three steps to click
    var map = $('#clMap');
    if (map) {
      var steps = $$('.cm-step', map), notes = $$('.cm-note p', map), note = $('.cm-note', map), pk2 = $('.cm-pk', map), dots2 = [], ptl = null, vis = false, cur = 0;
      var paths = ['.cm-p1', '.cm-p2', '.cm-p3'].map(function (s) { return $(s, map); });
      for (k = 0; k < 4; k++) dots2.push(svgEl('circle', { r: 5, cx: -50, cy: -50, opacity: 0 }, pk2));
      var run = function () {
        if (ptl) ptl.kill();
        var p = paths[cur], L = p.getTotalLength();
        ptl = gsap.timeline({ repeat: -1, paused: !vis });
        dots2.forEach(function (d, q) {
          var o = { t: 0 };
          ptl.fromTo(o, { t: 0 }, { t: 1, duration: 2, ease: 'none', immediateRender: false, onUpdate: function () {
            var q2 = p.getPointAtLength(o.t * L);
            d.setAttribute('cx', q2.x.toFixed(1)); d.setAttribute('cy', q2.y.toFixed(1)); d.setAttribute('opacity', Math.min(1, Math.min(o.t, 1 - o.t) * 8).toFixed(2));
          } }, q * 0.5);
        });
      };
      var show = function (i, focus) {
        cur = i; map.dataset.step = i;
        steps.forEach(function (b, q) { b.classList.toggle('is-on', q === i); b.setAttribute('aria-selected', q === i ? 'true' : 'false'); b.tabIndex = q === i ? 0 : -1; });
        var any = false;
        notes.forEach(function (n) { var on = +n.dataset.step === i; n.hidden = !on; if (on) any = true; });
        note.hidden = !any;
        if (any) gsap.fromTo(note, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' });
        dots2.forEach(function (d) { d.setAttribute('opacity', 0); });
        run();
        if (focus) steps[i].focus();
      };
      steps.forEach(function (b, i) {
        b.addEventListener('click', function () { show(i); });
        b.addEventListener('keydown', function (e) {
          var dd = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
          if (dd) { e.preventDefault(); show((i + dd + steps.length) % steps.length, true); }
        });
      });
      ScrollTrigger.create({ trigger: map, start: 'top bottom', end: 'bottom top', onToggle: function (s) { vis = s.isActive; if (ptl) { if (vis) ptl.play(); else ptl.pause(); } } });
      show(0);
    }
  }

  /* =======================================================================
     DATACLONE SAAS page
     ======================================================================= */
  function initSaas() {
    var k, C4 = ['#1e44f0', '#4f6ff5', '#0f2160', '#8fb0ff'];

    // hero : each client has its own private line to its own dedicated instance
    var tun = $('#saTun');
    if (tun) {
      var gl = $('.tn-lines', tun), gs = $('.tn-slots', tun), gc = $('.tn-clients', tun), gp = $('.tn-pk', tun), lines = [], slots = [], cls = [];
      for (k = 0; k < 4; k++) {
        var cy = 108 + k * 84;
        var ln = svgEl('path', { class: 'tn-line', d: 'M84 ' + cy + ' C 180 ' + cy + ', 210 ' + cy + ', 314 ' + cy, stroke: C4[k] }, gl);
        var sl = svgEl('g', { class: 'tn-slot', style: '--c:' + C4[k] }, gs);
        svgEl('rect', { x: 314, y: cy - 28, width: 198, height: 56, rx: 10 }, sl);
        svgEl('use', { href: '#i-lock', x: 328, y: cy - 10, width: 20, height: 20 }, sl);
        var tx = svgEl('text', { x: 356, y: cy + 5 }, sl); tx.textContent = 'serveur Windows dédié';
        var cl = svgEl('g', { class: 'tn-cl', style: '--c:' + C4[k] }, gc);
        svgEl('circle', { cx: 58, cy: cy, r: 26 }, cl);
        svgEl('use', { href: '#i-building', x: 46, y: cy - 12, width: 24, height: 24 }, cl);
        var L = ln.getTotalLength();
        gsap.set(ln, { strokeDasharray: L, strokeDashoffset: L });
        lines.push(ln); slots.push(sl); cls.push(cl);
      }
      var pk = gsap.timeline({ paused: true, repeat: -1 });
      lines.forEach(function (ln, q) {
        var L = ln.getTotalLength(), dot = svgEl('circle', { r: 4.5, cx: -20, cy: -20, fill: C4[q] }, gp), o = { t: 0 };
        pk.fromTo(o, { t: 0 }, { t: 1, duration: 1.6, ease: 'power1.inOut', immediateRender: false, onUpdate: function () { var p = ln.getPointAtLength(o.t * L); dot.setAttribute('cx', p.x.toFixed(1)); dot.setAttribute('cy', p.y.toFixed(1)); dot.style.opacity = o.t > 0.03 && o.t < 0.97 ? 1 : 0; } }, q * 0.45);
      });
      pk.to({}, { duration: 0.6 });
      gsap.timeline({ delay: 1.2 })
        .add(function () { lines.forEach(function (ln, q) {
          gsap.delayedCall(q * 0.3, function () { cls[q].classList.add('on'); });
          gsap.to(ln, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut', delay: q * 0.3 + 0.1, onComplete: function () { slots[q].classList.add('on'); } });
        }); })
        .add(function () { liveWhileVisible(tun, pk); pk.play(); }, 2.2);
    }

    // shared resources (mixed) → total isolation (one box per client)
    var iso = $('#saIso');
    if (iso) {
      var boxes = $$('.is-boxes rect', iso), gd = $('.is-dots', iso), dots = [], la = $('.is-lab--a', iso), lb = $('.is-lab--b', iso);
      var BIG = { x: 30, y: 24, width: 460, height: 250, rx: 18 };
      boxes.forEach(function (b) { gsap.set(b, { attr: BIG }); });
      for (k = 0; k < 28; k++) {
        var c = k % 4, n = Math.floor(k / 4);
        var d = svgEl('circle', { r: 9, fill: C4[c], cx: 60 + (k * 97) % 400, cy: 50 + (k * 61) % 200 }, gd);
        d._a = { cx: 62 + ((k * 137) % 397), cy: 52 + ((k * 89) % 196) };
        d._b = { cx: 30 + c * 118 + 34 + (n % 2) * 34, cy: 60 + Math.floor(n / 2) * 52 };
        gsap.set(d, { attr: d._a });
        dots.push(d);
      }
      var it = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.4 });
      it.to({}, { duration: 1.4 })
        .add('split')
        .to(la, { opacity: 0, duration: 0.3 }, 'split')
        .to(lb, { opacity: 1, duration: 0.4 }, 'split+=0.5');
      boxes.forEach(function (b, q) { it.to(b, { attr: { x: 30 + q * 118, width: 106, rx: 14 }, duration: 1, ease: 'expo.inOut' }, 'split'); });
      dots.forEach(function (d, q) { it.to(d, { attr: d._b, duration: 1.1, ease: 'expo.inOut', delay: (q % 7) * 0.02 }, 'split+=0.1'); });
      it.to({}, { duration: 2.4 }).add('merge');
      boxes.forEach(function (b) { it.to(b, { attr: BIG, duration: 1, ease: 'expo.inOut' }, 'merge'); });
      dots.forEach(function (d) { it.to(d, { attr: d._a, duration: 1, ease: 'expo.inOut' }, 'merge'); });
      it.to(lb, { opacity: 0, duration: 0.3 }, 'merge').to(la, { opacity: 1, duration: 0.4 }, 'merge+=0.5');
      liveWhileVisible(iso, it);
    }

    // pyramidal supervision : what each role sees of the park
    var roles = $('#saRoles');
    if (roles) {
      var park = $('.py-park', roles), scope = $('.py-scope', roles), tabs = $$('.sr-tab', roles), cells = [];
      // 3 resellers × 3 clients × 4 machines
      for (var m = 0; m < 3; m++) for (var c2 = 0; c2 < 3; c2++) {
        var gx = 92 + m * 136 + c2 * 42;
        for (var q = 0; q < 4; q++) {
          var r = svgEl('rect', { x: gx + (q % 2) * 15, y: 362 + Math.floor(q / 2) * 15, width: 11, height: 11, rx: 2.5 }, park);
          r._m = m; r._c = c2; cells.push(r);
        }
        if (c2) svgEl('path', { class: m === 1 ? 'sep' : '', d: 'M' + (gx - 8) + ' 356 V398' }, park);
      }
      var box = function (x1, x2) { return 'M' + x1 + ' 350 H' + x2 + ' V' + 404 + ' H' + x1 + ' Z'; };
      var setRole = function (i) {
        roles.dataset.role = i;
        tabs.forEach(function (t, q) { t.classList.toggle('is-on', q === i); t.setAttribute('aria-selected', q === i ? 'true' : 'false'); });
        cells.forEach(function (r) {
          var on = i === 0 ? false : i === 1 ? r._m === 1 : (r._m === 1 && r._c === 1);
          r.classList.toggle('agg', i === 0);
          r.classList.toggle('on', on);
          r.classList.toggle('off', i > 0 && !on);
        });
        scope.setAttribute('d', i === 0 ? box(82, 486) : i === 1 ? box(220, 344) : box(262, 300));
        gsap.fromTo(scope, { opacity: 0 }, { opacity: 1, duration: 0.5 });
      };
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { setRole(i); });
        t.addEventListener('keydown', function (e) {
          var dd = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
          if (dd) { e.preventDefault(); var n2 = (i + dd + 3) % 3; setRole(n2); tabs[n2].focus(); }
        });
      });
      setRole(0);
    }

    // advantages tick one by one
    var duo = $('#saDuo');
    if (duo) onView(duo, function () { $$('.sd li', duo).forEach(function (li, i) { gsap.delayedCall(0.2 + (i % 5) * 0.16 + Math.floor(i / 5) * 0.08, function () { li.classList.add('on'); }); }); }, 'top 75%');

    // simplicity : zero, 48 h, everything covered
    var three = $('#saThree');
    if (three) onView(three, function () {
      var p = $('.ck-p', three), h = $('.ck-h', three);
      gsap.to(p, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut' });
      gsap.to(h, { rotation: 720, duration: 2, ease: 'power2.inOut', svgOrigin: '60 60' });
      countUp($('.s3-g--clock .v', three), 48, 2, 0);
      $$('.s3-g--all span', three).forEach(function (s, i) { gsap.delayedCall(0.3 + i * 0.22, function () { s.classList.add('on'); }); });
    }, 'top 78%');

    var cases = $('#saCases');
    if (cases) { gsap.set($$('li', cases), { opacity: 0, x: 24 }); onView(cases, function () { gsap.to($$('li', cases), { opacity: 1, x: 0, duration: 0.8, ease: 'expo.out', stagger: 0.12 }); }, 'top 80%'); }

    // business model : add users, the load and the storage follow
    var sim = $('#saSim');
    if (sim) {
      var n = 3, max = 12, num = $('.sm-n', sim), people = $('.sm-people', sim), gauge = $('.sm-gauge i', sim), disk = $('.sm-disk', sim);
      var draw = function () {
        num.textContent = n;
        while (people.children.length < n) { var p2 = people.appendChild(document.createElement('i')); gsap.from(p2, { scale: 0, duration: 0.45, ease: 'back.out(3)' }); }
        while (people.children.length > n) people.lastChild.remove();
        gauge.style.width = (20 + n / max * 80).toFixed(1) + '%';
        var need = Math.ceil(n / 2);
        while (disk.children.length < need) { var dk = disk.appendChild(document.createElement('i')); gsap.from(dk, { scaleY: 0, duration: 0.4, ease: 'back.out(2)', transformOrigin: '50% 100%' }); }
        while (disk.children.length > need) disk.lastChild.remove();
      };
      $$('.sm-btn', sim).forEach(function (b) { b.addEventListener('click', function () { n = clamp(n + (+b.dataset.d), 1, max); draw(); }); });
      draw();
      onView(sim, function () { [4, 5, 6].forEach(function (v, i) { gsap.delayedCall(0.5 + i * 0.45, function () { if (n < v) { n = v; draw(); } }); }); }, 'top 75%');
    }
  }

  /* =======================================================================
     DISASTER RECOVERY TEST page
     ======================================================================= */
  function initDr() {
    var live = function (el) { if (el) ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: function (s) { el.classList.toggle('is-live', s.isActive); } }); };

    // hero : each kind of backup is restored on the bench, then the certificate comes out
    var bench = $('#drBench');
    if (bench) {
      tilt($('.db-win', bench), -8, 4, 5);
      var rows = $$('.db-row', bench), cert = $('.db-cert', bench), bt = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.2 });
      bt.call(function () { rows.forEach(function (r) { r.classList.remove('ok'); }); })
        .set($$('.db-prog b', bench), { width: 0 })
        .to(cert, { opacity: 0, y: 24, duration: 0.3 }, 0);
      rows.forEach(function (r, i) {
        bt.to($('.db-prog b', r), { width: '100%', duration: 1.1, ease: 'power1.inOut' }, 0.4 + i * 0.9)
          .call(function () { r.classList.add('ok'); }, null, 1.5 + i * 0.9);
      });
      bt.to(cert, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, 4.4).to({}, { duration: 2.6 });
      liveWhileVisible(bench, bt);
    }

    // why choose : small graphics
    var bento = $('#drBento');
    if (bento) {
      live(bento);
      onView(bento, function () {
        $$('.drb-g--env span', bento).forEach(function (s, i) { gsap.delayedCall(0.2 + i * 0.35, function () { s.classList.add('on'); }); });
        $$('.sc-checks span', bento).forEach(function (s, i) { gsap.delayedCall(1 + i * 0.6, function () { s.classList.add('on'); }); });
        gsap.delayedCall(1.4, function () { var r = $('.drb-g--report', bento); if (r) r.classList.add('on'); });
        $$('.cl-cal i', bento).forEach(function (c, i) { gsap.delayedCall(0.4 + i * 0.12, function () { c.classList.add('on'); }); });
      }, 'top 75%');
    }

    // how it works : the media follows the route, each stop lights up
    var route = $('#drRoute');
    if (route) {
      var token = $('.rt-token', route), fill = $('.rt-fill', route), track = $('.rt-track', route), steps = $$('.rt-steps li', route);
      var rt = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.4 });
      rt.call(function () { steps.forEach(function (s) { s.classList.remove('on'); }); })
        .set(token, { x: 0 }).set(fill, { scaleX: 0 })
        .call(function () { steps[0].classList.add('on'); }, null, 0.2);
      for (var k = 1; k < steps.length; k++) {
        (function (k) {
          var at = 0.4 + (k - 1) * 1.3;
          rt.to(token, { x: function () { return track.offsetWidth * k / (steps.length - 1); }, duration: 1, ease: 'power2.inOut' }, at)
            .to(fill, { scaleX: k / (steps.length - 1), duration: 1, ease: 'power2.inOut' }, at)
            .call(function () { steps[k].classList.add('on'); }, null, at + 1);
        })(k);
      }
      rt.to({}, { duration: 2 });
      liveWhileVisible(route, rt);
    }

    // testimonial : the figure rises
    var fig = $('#drFig');
    if (fig) { gsap.set(fig.children, { opacity: 0, y: 30 }); onView(fig, function () { gsap.to(fig.children, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.15 }); }, 'top 80%'); }
  }

  /* =======================================================================
     SAUVEGARDE AIR GAP page
     ======================================================================= */
  function initAirgap() {
    var k;
    // hero : attacks leave the network, reach the gap of air and fall
    var vd = $('#agVoid');
    if (vd) {
      var ga = $('.av-atk', vd), at = gsap.timeline({ paused: true, repeat: -1 });
      for (k = 0; k < 6; k++) {
        (function (k) {
          var y = 120 + (k * 47) % 190, c = svgEl('circle', { r: 6, cx: 196, cy: 210, opacity: 0 }, ga), t = k * 0.55;
          at.set(c, { attr: { cx: 196, cy: 210 }, opacity: 0 }, t)
            .to(c, { opacity: 1, duration: 0.15 }, t)
            .to(c, { attr: { cx: 248, cy: y }, duration: 0.7, ease: 'power1.out' }, t)
            .to(c, { attr: { cx: 262 + (k % 3) * 10, cy: y + 150 }, opacity: 0, duration: 0.9, ease: 'power2.in' }, t + 0.7);
        })(k);
      }
      liveWhileVisible(vd, at);
    }

    // physical : the media is unplugged
    var plug = $('#agPlug');
    if (plug) {
      var pt = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.6 });
      pt.to($('.pl-media', plug), { x: 0, duration: 0.01 })
        .to([$('.pl-plug', plug), $('.pl-media', plug)], { x: 0, duration: 0.01 })
        .to($('.pl-media', plug), { x: 26, duration: 0.8, ease: 'power2.inOut' }, 1)
        .to($('.pl-plug', plug), { x: -18, duration: 0.6, ease: 'power2.inOut' }, 1)
        .to({}, { duration: 1.8 })
        .to($('.pl-media', plug), { x: 0, duration: 0.8, ease: 'power2.inOut' })
        .to($('.pl-plug', plug), { x: 0, duration: 0.6, ease: 'power2.inOut' }, '<');
      liveWhileVisible(plug, pt);
    }

    // logical : requests bounce on the wall of air
    var wall = $('#agWall');
    if (wall) {
      var gr = $('.wl-reqs', wall), wt = gsap.timeline({ paused: true, repeat: -1 });
      for (k = 0; k < 5; k++) {
        (function (k) {
          var y = 40 + k * 18, c = svgEl('circle', { r: 5, cx: 60, cy: 75, opacity: 0 }, gr), t = k * 0.5;
          wt.set(c, { attr: { cx: 60, cy: 75 }, opacity: 0 }, t)
            .to(c, { opacity: 1, duration: 0.15 }, t)
            .to(c, { attr: { cx: 220, cy: y + 10 }, duration: 0.8, ease: 'power1.in' }, t)
            .to(c, { attr: { cx: 170, cy: y + 30 }, opacity: 0, duration: 0.6, ease: 'power2.out' }, t + 0.8);
        })(k);
      }
      liveWhileVisible(wall, wt);
    }

    // the double air gap : blocked at the first barrier, the media leaves after the second
    var ch = $('#agChain');
    if (ch) {
      var gp = $('.ch-pk', ch), ct = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.4 });
      for (k = 0; k < 4; k++) {
        (function (k) {
          var c = svgEl('circle', { r: 6, cx: 110, cy: 115, opacity: 0 }, gp), t = k * 0.6;
          ct.set(c, { attr: { cx: 110, cy: 115 }, opacity: 0 }, t)
            .to(c, { opacity: 1, duration: 0.15 }, t)
            .to(c, { attr: { cx: 290 }, duration: 0.8, ease: 'power1.in' }, t)
            .to(c, { attr: { cx: 250, cy: 115 + (k % 2 ? 40 : -40) }, opacity: 0, duration: 0.6, ease: 'power2.out' }, t + 0.8);
        })(k);
      }
      ct.to($('.ch-rdo', ch), { x: 40, opacity: 0.55, duration: 0.9, ease: 'power2.inOut' }, 0.8)
        .to($('.ch-rdo', ch), { x: 0, opacity: 1, duration: 0.9, ease: 'power2.inOut' }, 3);
      liveWhileVisible(ch, ct);
    }

    // comparison : the rows arrive, the restore race runs
    var tb = $('#agTable');
    if (tb) onView(tb, function () {
      $$('.at-row:not(.at-head)', tb).forEach(function (r, i) { gsap.delayedCall(0.2 + i * 0.25, function () { r.classList.add('on'); }); });
      gsap.to($('.at-race b', tb), { width: '100%', duration: 0.7, ease: 'power2.out', delay: 0.4 });
      gsap.to($('.at-race--slow b', tb), { width: '100%', duration: 5, ease: 'none', delay: 0.4 });
    }, 'top 75%');
  }

  /* =======================================================================
     PARTENARIAT CSIRT page
     ======================================================================= */
  function initCsirt() {
    // hero : the threat level, the incident, then a quick return to normal
    var chart = $('#csChart');
    if (chart) {
      tilt($('.cc-win', chart), -8, 4, 5);
      var line = $('.cc-line', chart), area = $('.cc-area', chart), head = $('.cc-head', chart), m1 = $('.cc-mk1', chart), m2 = $('.cc-mk2', chart);
      var P = [[20, 190], [60, 186], [100, 192], [140, 184], [170, 178], [190, 48], [212, 120], [240, 168], [270, 184], [300, 188], [340, 186], [380, 190], [420, 187], [440, 189]];
      var d = 'M' + P.map(function (p) { return p[0] + ' ' + p[1]; }).join(' L');
      line.setAttribute('d', d);
      area.setAttribute('d', d + ' L440 214 L20 214 Z');
      var len = line.getTotalLength(), o = { t: 0 };
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      var ct = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.6 });
      ct.call(function () { m1.classList.remove('on'); m2.classList.remove('on'); })
        .set(area, { opacity: 0 })
        .fromTo(o, { t: 0 }, { t: 1, duration: 3.6, ease: 'none', immediateRender: false, onUpdate: function () {
          var L = o.t * len, p = line.getPointAtLength(L);
          line.style.strokeDashoffset = len - L; head.setAttribute('cx', p.x.toFixed(1)); head.setAttribute('cy', p.y.toFixed(1));
          if (p.x >= 186) m1.classList.add('on');
          if (p.x >= 298) m2.classList.add('on');
        } })
        .to(area, { opacity: 1, duration: 0.8 }, '-=0.6')
        .to({}, { duration: 1.4 });
      liveWhileVisible(chart, ct);
    }

    // why selected : risks go down, teams light up, the response is fast
    var three = $('#csThree');
    if (three) onView(three, function () {
      gsap.to($('.rk-arc--on', three), { strokeDashoffset: 252 * 0.72, duration: 1.4, ease: 'power3.out' });
      gsap.fromTo($('.rk-needle', three), { rotation: -70 }, { rotation: 40, duration: 1.4, ease: 'power3.out', svgOrigin: '110 100' });
      gsap.to($('.rk-needle', three), { rotation: -40, duration: 1.2, ease: 'power3.inOut', svgOrigin: '110 100', delay: 1.6 });
      gsap.to($('.rk-arc--on', three), { strokeDashoffset: 252 * 0.85, duration: 1.2, ease: 'power3.inOut', delay: 1.6 });
      $$('.c3-g--team span', three).forEach(function (s, i) { gsap.delayedCall(0.2 + i * 0.12, function () { s.classList.add('on'); }); });
      gsap.to($('.fz-bar i', three), { width: '100%', duration: 0.6, ease: 'power3.out', delay: 0.4 });
    }, 'top 78%');

    // the alert feed : reports arrive, each one is handled
    var feed = $('#csFeed');
    if (feed) {
      var rows = $('.cf-rows', feed), n = 0;
      var add = function (instant) {
        var r = document.createElement('div'); r.className = 'cf-row';
        r.innerHTML = '<span class="sev' + (n % 3 === 1 ? ' lo' : '') + '"></span><span class="tx"><i style="width:' + (50 + (n * 37) % 45) + '%"></i><i></i></span><span class="cf-st"></span>';
        n++;
        rows.insertBefore(r, rows.firstChild);
        if (!instant) gsap.fromTo(r, { height: 0, opacity: 0 }, { height: 54, opacity: 1, duration: 0.6, ease: 'expo.out' });
        else r.classList.add('done');
        while (rows.children.length > 7) rows.lastChild.remove();
        return r;
      };
      for (var k = 0; k < 5; k++) add(true);
      var ft = gsap.timeline({ paused: true, repeat: -1 });
      ft.call(function () { var r = add(false); gsap.delayedCall(1.1, function () { r.classList.add('done'); }); }, null, 0.3).to({}, { duration: 2 }, 0);
      liveWhileVisible(feed, ft);
    }

    var list = $('#csList');
    if (list) { gsap.set($$('li', list), { opacity: 0, y: 16 }); onView(list, function () { gsap.to($$('li', list), { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.12 }); }, 'top 80%'); }

    var logos = $('.cs-logos');
    if (logos) onView(logos, function () { logos.classList.add('on'); }, 'top 85%');
  }

  /* =======================================================================
     PARTENARIAT CAMPUS CYBER page
     ======================================================================= */
  function initCampus() {
    var k;
    // hero : the members of the campus around it, Hyperion joins and the links light up
    var net = $('#cpNet');
    if (net) {
      var gl = $('.cn-links', net), gn = $('.cn-nodes', net), me = $('.cn-me', net), core = [270, 208], nodes = [], links = [];
      var P = [[60, 70], [170, 40], [300, 52], [430, 80], [500, 190], [470, 320], [360, 395], [220, 400], [90, 350], [40, 230], [130, 140], [420, 260]];
      P.forEach(function (p, i) {
        var l = svgEl('path', { d: 'M' + core[0] + ' ' + core[1] + ' L' + p[0] + ' ' + p[1] }, gl);
        links.push(l);
        nodes.push(svgEl('circle', { cx: p[0], cy: p[1], r: i % 3 ? 9 : 12 }, gn));
      });
      // a few links between the members themselves
      [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 0], [10, 0], [11, 4]].forEach(function (e) {
        svgEl('path', { d: 'M' + P[e[0]][0] + ' ' + P[e[0]][1] + ' L' + P[e[1]][0] + ' ' + P[e[1]][1], 'stroke-dasharray': '3 5' }, gl);
      });
      var target = { x: 470, y: 120 };
      gsap.set(me, { x: 620, y: -60, opacity: 0 });
      var meLink = svgEl('path', { d: 'M' + core[0] + ' ' + core[1] + ' L' + target.x + ' ' + target.y }, gl);
      var ml = meLink.getTotalLength();
      gsap.set(meLink, { strokeDasharray: ml, strokeDashoffset: ml });
      gsap.timeline({ delay: 1.3 })
        .to(me, { x: target.x, y: target.y, opacity: 1, duration: 1.2, ease: 'expo.out' })
        .to(meLink, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.out', onStart: function () { meLink.classList.add('on'); } }, '-=0.3')
        .add(function () {
          var lt = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.8 });
          nodes.forEach(function (nd, i) {
            lt.add(function () { nd.classList.add('on'); links[i].classList.add('on'); }, i * 0.18);
          });
          lt.add(function () { nodes.forEach(function (nd, i) { nd.classList.remove('on'); links[i].classList.remove('on'); }); }, nodes.length * 0.18 + 1.6);
          liveWhileVisible(net, lt); lt.play();
        });
    }

    // why : invisible, caught, compliant
    var three = $('#cpThree');
    if (three) {
      ScrollTrigger.create({ trigger: three, start: 'top bottom', end: 'bottom top', onToggle: function (s) { three.classList.toggle('is-live', s.isActive); } });
      onView(three, function () { gsap.delayedCall(0.8, function () { $('.p3-g--anssi', three).classList.add('on'); }); }, 'top 78%');
    }

    var four = $('#cpFour');
    if (four) onView(four, function () { $$('article', four).forEach(function (a, i) { gsap.delayedCall(0.15 + i * 0.25, function () { a.classList.add('on'); }); }); gsap.from($$('article', four), { opacity: 0, y: 26, duration: 0.9, ease: 'expo.out', stagger: 0.12 }); }, 'top 80%');
  }

  /* =======================================================================
     POURQUOI NOUS CHOISIR page
     ======================================================================= */
  function initPourquoi() {
    // the seven reasons : tabs, each diagram replays when its tab opens
    var tabs = $('#pqTabs'), show = null;
    if (tabs) {
      var tbs = $$('.pq-tab', tabs), ps = $$('.pq-p', tabs), seen = false;
      var play = function (p) { p.classList.remove('is-play'); void p.offsetWidth; p.classList.add('is-play'); };
      show = function (i, focus) {
        tbs.forEach(function (b, q) { b.classList.toggle('is-on', q === i); b.setAttribute('aria-selected', q === i ? 'true' : 'false'); b.tabIndex = q === i ? 0 : -1; });
        ps.forEach(function (p, q) { p.hidden = q !== i; p.classList.toggle('is-on', q === i); if (q !== i) p.classList.remove('is-play'); });
        gsap.fromTo(ps[i], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' });
        if (seen) play(ps[i]);
        if (focus) tbs[i].focus();
        ScrollTrigger.refresh();
      };
      tbs.forEach(function (b, i) {
        b.tabIndex = i ? -1 : 0;
        b.addEventListener('click', function () { show(i); });
        b.addEventListener('keydown', function (e) {
          var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
          if (d) { e.preventDefault(); show((i + d + tbs.length) % tbs.length, true); }
        });
      });
      onView(tabs, function () { seen = true; play(ps[0]); }, 'top 70%');
    }

    // the index in the hero opens the matching reason
    var idx = $('#pqIndex');
    if (idx) {
      gsap.set($$('li', idx), { opacity: 0, x: 30 });
      gsap.to($$('li', idx), { opacity: 1, x: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07, delay: 1.2 });
      $$('a', idx).forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          if (show) show(+a.dataset.i);
          var target = $('#raisons');
          if (lenis) lenis.scrollTo(target, { offset: -40 }); else target.scrollIntoView({ behavior: 'smooth' });
        });
      });
    }

    // the difference : promises crossed out, guarantees ticked
    var vs = $('#pqVs');
    if (vs) onView(vs, function () {
      $$('.pv-a', vs).forEach(function (r, i) { gsap.delayedCall(0.2 + i * 0.35, function () { r.classList.add('on'); }); });
      $$('.pv-b', vs).forEach(function (r, i) { gsap.delayedCall(0.4 + i * 0.35, function () { r.classList.add('on'); }); });
    }, 'top 75%');
  }

  /* =======================================================================
     TÉMOIGNAGES page
     ======================================================================= */
  function initTemoignages() {
    // three figures, three different pictures : 50 dots, 10 years, a 98 % bar
    var figs = $('#tmFigs');
    if (figs) {
      var dots = $('.tf--dots .tf-g', figs), years = $('.tf--years .tf-g', figs), k;
      for (k = 0; k < 50; k++) dots.appendChild(document.createElement('i'));
      for (k = 0; k < 10; k++) years.appendChild(document.createElement('i'));
      onView(figs, function () {
        var v = $$('.v', figs);
        $$('i', dots).forEach(function (d, i) { gsap.delayedCall(0.2 + i * 0.028, function () { d.classList.add('on'); }); });
        countUp(v[0], 50, 1.5, 0.2);
        $$('i', years).forEach(function (y, i) { gsap.delayedCall(0.3 + i * 0.12, function () { y.classList.add('on'); }); });
        countUp(v[1], 10, 1.2, 0.3);
        gsap.to($('.tf--bar .tf-g i', figs), { width: '98%', duration: 1.8, ease: 'power3.out', delay: 0.3 });
        countUp(v[2], 98, 1.8, 0.3);
      }, 'top 85%');
    }

    var wall = $('#tmWall');
    if (wall) { gsap.set($$('.tq', wall), { opacity: 0, y: 30 }); onView(wall, function () { gsap.to($$('.tq', wall), { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 }); }, 'top 80%'); }
  }

  /* =======================================================================
     POLITIQUE DE CONFIDENTIALITÉ page
     ======================================================================= */
  function initRgpd() {
    var toc = $('#rgToc'); if (!toc) return;
    var links = $$('a', toc);
    var mark = function (id) { links.forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('href') === '#' + id); }); };
    $$('.rg-text section').forEach(function (sec) {
      ScrollTrigger.create({ trigger: sec, start: 'top 45%', end: 'bottom 45%', onToggle: function (s) { if (s.isActive) mark(sec.id); } });
    });
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var t = $(a.getAttribute('href'));
        if (lenis) lenis.scrollTo(t, { offset: -100 }); else t.scrollIntoView({ behavior: 'smooth' });
      });
    });
    mark('rg1');
  }

  /* =======================================================================
     Generic reveals + magnetic buttons
     ======================================================================= */
  function initReveals() {
    $$('.bgfx').forEach(function (b) {
      gsap.to(b, { '--bgy': '160px', ease: 'none', scrollTrigger: { trigger: b.parentNode, start: 'top top', end: 'bottom top', scrub: true } });
    });
    $$('.reveal').forEach(function (el) {
      gsap.from(el, { opacity: 0, y: 26, duration: 1.05, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    $$('.reveal-list').forEach(function (list) {
      gsap.from(list.children, { opacity: 0, y: 18, duration: 0.9, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: list, start: 'top 85%', once: true } });
    });
    $$('.prose > p, .prose > h3, .saas-link, .foot-col').forEach(function (el) {
      if (el.hasAttribute('data-intro')) return;
      gsap.from(el, { opacity: 0, y: 20, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });
  }
  function initMagnetic() {
    if (!finePointer || reduced) return;
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.18, y: (e.clientY - r.top - r.height / 2) * 0.28, duration: 0.6, ease: 'power3.out' });
      });
      el.addEventListener('pointerleave', function () { gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.45)' }); });
    });
  }

  initNav();
  initHeroScene();
  initLogos();
  initProof();
  initNews();
  initRisks();
  initTimeline();
  initCarousel();
  initDcUi();
  initSaasVis();
  initButtons();
  initScenes();
  initStealth();
  initAnssi();
  initDattak();
  initContact();
  initSurv();
  initDisque();
  initAppliances();
  initRdo();
  initRentree();
  initVmware();
  initExchange();
  initCloud();
  initSaas();
  initDr();
  initAirgap();
  initCsirt();
  initCampus();
  initPourquoi();
  initTemoignages();
  initRgpd();
  initStatements();
  initReveals();
  initMagnetic();
  runIntro();
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
