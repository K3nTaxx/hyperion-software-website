/* =========================================================================
   Hyperion Software — the shield in 3D
   play()  : first visit intro
     1. the four pieces of the shield (from the vector logo) rush in from deep space
        and from behind the viewer, and lock together : impact, flash of the edges ;
     2. the shield makes one full turn, the polished metal and its thickness catch the light ;
     3. boom : it bursts open, the pieces fly past the camera and the site appears behind.
   mount() : the same shield in a block of the home page, it assembles piece by piece
     when the block comes into view, then leans towards the mouse.
   Everything heavy (libraries, geometry, shaders, environment) is prepared before
   the first frame is shown, so the animation starts smoothly.
   ========================================================================= */
(function () {
  'use strict';

  var LIBS = [
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/SVGLoader.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/environments/RoomEnvironment.js'
  ];
  var SHIELD = 'assets/brand/hyperion-shield.svg';
  var SW = 94.5, SH = 120.2, CX = SW / 2, CY = SH / 2, DEPTH = 13, BEVEL = 1.6;

  function load(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  function timeout(ms) { return new Promise(function (res, rej) { setTimeout(function () { rej(new Error('timeout')); }, ms); }); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  var libsP = null, dataP = {};
  function libs() {
    if (window.THREE && THREE.SVGLoader) return Promise.resolve();
    if (!libsP) libsP = load(LIBS[0]).then(function () { return Promise.all([load(LIBS[1]), load(LIBS[2]).catch(function () {})]); });
    return libsP;
  }
  function shieldData(url) {
    if (!dataP[url]) dataP[url] = new Promise(function (res, rej) { new THREE.SVGLoader().load(url, res, undefined, rej); });
    return dataP[url];
  }
  // the next painted frame (or a short delay when the tab is hidden and frames are paused)
  function frame() {
    return new Promise(function (r) {
      var done = false, go = function () { if (!done) { done = true; r(); } };
      requestAnimationFrame(go); setTimeout(go, 60);
    });
  }

  // renderer + scene with a studio environment for the reflections
  function makeRenderer(cv, W, H, dpr) {
    var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dpr));
    renderer.setSize(W, H, false);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    var scene = new THREE.Scene(), pmrem = null;
    if (THREE.RoomEnvironment) {
      pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
    }
    return { renderer: renderer, scene: scene, pmrem: pmrem };
  }

  // the shield, piece by piece : polished caps, darker metal on the thickness
  function buildShield(data, scene) {
    var lin = function (hex) { return new THREE.Color(hex).convertSRGBToLinear(); };
    var shield = new THREE.Group(), inner = new THREE.Group();
    inner.scale.set(1, -1, 1);
    inner.position.set(-CX, CY, -DEPTH / 2);
    shield.add(inner); scene.add(shield);
    var ext = { depth: DEPTH, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: 1.1, bevelSegments: 3, curveSegments: 18 };
    var S = { shield: shield, pieces: [], geos: [], mats: [], sides: [] };
    data.paths.forEach(function (p) {
      var hex = p.color.getHex();
      if (hex === 0x29a5dc) return; // a stray point of the vector file
      THREE.SVGLoader.createShapes(p).forEach(function (shape) {
        var g = new THREE.ExtrudeGeometry(shape, ext), c = new THREE.Vector3();
        g.computeBoundingBox(); g.boundingBox.getCenter(c);
        g.translate(-c.x, -c.y, 0);
        var cap = new THREE.MeshPhysicalMaterial({ color: lin(hex), metalness: 0.62, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.95, transparent: true });
        var side = new THREE.MeshStandardMaterial({ color: lin(hex).multiplyScalar(0.5), metalness: 0.95, roughness: 0.22, envMapIntensity: 1.25, emissive: lin(0x8fb0ff), emissiveIntensity: 0, transparent: true });
        var m = new THREE.Mesh(g, [cap, side]);
        m.position.set(c.x, c.y, 0);
        m.userData.home = new THREE.Vector3(c.x, c.y, 0);
        m.userData.dir = new THREE.Vector2(c.x - CX, c.y - CY).normalize();
        inner.add(m); S.pieces.push(m); S.geos.push(g); S.mats.push(cap, side); S.sides.push(side);
      });
    });
    S.dispose = function () {
      S.geos.forEach(function (g) { g.dispose(); });
      S.mats.forEach(function (m) { m.dispose(); });
    };
    return S;
  }
  function lights(scene, reach) {
    scene.add(new THREE.AmbientLight(0x22388a, 0.35));
    var key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(-220, 280, 320); scene.add(key);
    var rim = new THREE.DirectionalLight(0x8fb0ff, 1.5); rim.position.set(260, -120, -260); scene.add(rim);
    var orbit = new THREE.PointLight(0xffffff, 0, reach, 1.4); scene.add(orbit);
    return orbit;
  }

  /* -----------------------------------------------------------------------
     INTRO
     ----------------------------------------------------------------------- */
  function run(data, opts) {
    var stage = null;
    return new Promise(function (resolve, reject) {
     try {
      var W = window.innerWidth, H = window.innerHeight;

      // ---------- stage (DOM) : the background is visible at once, the canvas fades in when ready ----------
      stage = document.createElement('div');
      stage.className = 'i3d';
      stage.setAttribute('aria-hidden', 'true');
      stage.innerHTML = '<div class="i3d-bg"></div><div class="i3d-glow"></div><canvas class="i3d-cv"></canvas><i class="i3d-flare"></i><span class="i3d-skip">Passer l\'intro</span>';
      document.body.appendChild(stage);
      var bg = stage.querySelector('.i3d-bg'), glow = stage.querySelector('.i3d-glow'), cv = stage.querySelector('.i3d-cv'), flare = stage.querySelector('.i3d-flare');
      gsap.set(cv, { opacity: 0 });

      // ---------- renderer, scene, camera ----------
      var R = makeRenderer(cv, W, H, 1.75), renderer = R.renderer, scene = R.scene;
      var camera = new THREE.PerspectiveCamera(30, W / H, 1, 6000);
      // the shield takes ~44 % of the height on a wide screen, ~62 % of the width on a phone
      var t2 = 2 * Math.tan(THREE.MathUtils.degToRad(15));
      var zEnd = Math.max(SH / (0.44 * t2), SW / (0.62 * (W / H) * t2)), zStart = zEnd * 1.55;
      camera.position.set(0, 0, zStart);
      var orbit = lights(scene, zEnd * 2.2);

      var S = buildShield(data, scene), shield = S.shield, pieces = S.pieces;

      // ---------- starting positions : deep in space, or behind the viewer ----------
      pieces.forEach(function (m, n) {
        var h = m.userData.home, d = m.userData.dir;
        var behind = n % 2 === 1;
        m.position.set(h.x + d.x * rand(260, 380), h.y + d.y * rand(200, 300), behind ? zStart * 0.72 : -rand(700, 1100));
        m.rotation.set(rand(-2.2, 2.2), rand(-2.2, 2.2), rand(-1.2, 1.2));
      });
      shield.rotation.set(0.28, -1.15, 0.12);

      var running = true;
      var render = function () { if (running) renderer.render(scene, camera); };
      var onResize = function () {
        W = window.innerWidth; H = window.innerHeight;
        renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', onResize);

      // ---------- compile every shader and draw one frame before showing anything ----------
      renderer.compile(scene, camera);
      render();

      frame().then(function () {
        gsap.ticker.add(render);
        var EXIT = 3.5, exited = false;
        var tl = gsap.timeline();
        tl.to(cv, { opacity: 1, duration: 0.35, ease: 'power1.out' }, 0)
          .to(camera.position, { z: zEnd, duration: 2.1, ease: 'power3.out' }, 0)
          .to(shield.rotation, { x: 0.06, y: 0.26, z: 0, duration: 1.75, ease: 'power3.out' }, 0);

        // 1. the pieces rush in and lock
        pieces.forEach(function (m, n) {
          var h = m.userData.home, t = 0.05 + n * 0.11;
          tl.to(m.position, { x: h.x, y: h.y, z: 0, duration: 1.38, ease: 'expo.out' }, t)
            .to(m.rotation, { x: 0, y: 0, z: 0, duration: 1.38, ease: 'expo.out' }, t);
        });
        var IMPACT = 1.58;
        tl.to(shield.scale, { x: 1.05, y: 1.05, z: 1.05, duration: 0.14, ease: 'power2.out', yoyo: true, repeat: 1 }, IMPACT)
          .to(camera.position, { keyframes: [{ x: 1.6, duration: 0.05 }, { x: -1.2, duration: 0.06 }, { x: 0.6, duration: 0.06 }, { x: 0, duration: 0.08 }] }, IMPACT);
        S.sides.forEach(function (s) { tl.to(s, { keyframes: [{ emissiveIntensity: 1.6, duration: 0.12 }, { emissiveIntensity: 0, duration: 0.7, ease: 'power2.out' }] }, IMPACT); });
        tl.fromTo(glow, { opacity: 0, scale: 0.6 }, { keyframes: [{ opacity: 1, scale: 1.05, duration: 0.25, ease: 'power2.out' }, { opacity: 0.45, scale: 1, duration: 0.9, ease: 'power2.inOut' }] }, IMPACT)
          .fromTo(flare, { scaleX: 0, opacity: 0 }, { keyframes: [{ scaleX: 1, opacity: 1, duration: 0.35, ease: 'expo.out' }, { opacity: 0, duration: 0.7, ease: 'power2.in' }] }, IMPACT);

        // 2. one full turn, the metal catches the light that goes round with it
        var TURN = 1.95, orb = { a: 0 };
        tl.to(shield.rotation, { y: -Math.PI * 2, duration: 1.7, ease: 'power3.inOut' }, TURN)
          .to(shield.rotation, { keyframes: [{ x: -0.14, duration: 0.85, ease: 'sine.inOut' }, { x: 0, duration: 0.85, ease: 'sine.inOut' }] }, TURN)
          .fromTo(orb, { a: -Math.PI * 0.6 }, { a: Math.PI * 1.6, duration: 1.8, ease: 'power2.inOut', onUpdate: function () {
            var r = zEnd * 0.55;
            orbit.position.set(Math.cos(orb.a) * r, Math.sin(orb.a * 0.5) * r * 0.35, Math.sin(orb.a) * r);
          } }, TURN)
          .to(orbit, { keyframes: [{ intensity: 2.6, duration: 0.5 }, { intensity: 1.8, duration: 0.8 }, { intensity: 0, duration: 0.25 }] }, TURN);

        // 3. boom : it bursts open towards the viewer, the site appears behind
        var exit = function () {
          if (exited) return; exited = true;
          stage.classList.add('is-exit');
          if (opts.onExit) opts.onExit();
          var B = 0.16, out = gsap.timeline({ onComplete: finish });
          out.to(shield.scale, { x: 0.9, y: 0.9, z: 0.9, duration: B, ease: 'power3.in' }, 0)
            .to(glow, { opacity: 0.85, scale: 0.8, duration: B, ease: 'power3.in' }, 0)
            .to(camera.position, { keyframes: [{ x: 2.4, y: -1.2, duration: 0.04 }, { x: -2, y: 1, duration: 0.05 }, { x: 1, y: -0.4, duration: 0.05 }, { x: 0, y: 0, duration: 0.07 }] }, B);
          pieces.forEach(function (m) {
            var h = m.userData.home, d = m.userData.dir;
            out.to(m.position, { x: h.x + d.x * rand(440, 620), y: h.y + d.y * rand(340, 480), z: zEnd * rand(0.6, 0.9), duration: 0.9, ease: 'expo.out' }, B)
              .to(m.rotation, { x: rand(-3, 3), y: rand(-3, 3), z: rand(-1.5, 1.5), duration: 0.9, ease: 'expo.out' }, B);
          });
          S.mats.forEach(function (mt) { out.to(mt, { opacity: 0, duration: 0.32, ease: 'power1.in' }, B + 0.14); });
          out.to(glow, { keyframes: [{ opacity: 1, scale: 1.25, duration: 0.08 }, { opacity: 0, scale: 1.9, duration: 0.45, ease: 'power2.out' }] }, B)
            .fromTo(flare, { scaleX: 0, opacity: 0 }, { keyframes: [{ scaleX: 1, opacity: 1, duration: 0.18, ease: 'expo.out' }, { opacity: 0, duration: 0.35 }] }, B)
            .to(bg, { opacity: 0, duration: 0.5, ease: 'power2.out' }, B + 0.06)
            .to(cv, { opacity: 0, duration: 0.2 }, B + 0.5);
        };
        tl.call(exit, null, EXIT);

        // skipping : a click, a key, the wheel or a touch goes straight to the end
        var skip = function () { if (!exited) tl.progress(1, false); };
        stage.addEventListener('click', skip);
        window.addEventListener('keydown', skip);
        window.addEventListener('wheel', skip, { passive: true });
        window.addEventListener('touchstart', skip, { passive: true });

        function finish() {
          running = false;
          gsap.ticker.remove(render);
          window.removeEventListener('resize', onResize);
          window.removeEventListener('keydown', skip);
          window.removeEventListener('wheel', skip);
          window.removeEventListener('touchstart', skip);
          S.dispose();
          if (R.pmrem) R.pmrem.dispose();
          renderer.dispose();
          stage.remove();
          resolve();
        }
      });
     } catch (e) {
      if (stage) stage.remove();
      reject(e);
     }
    });
  }

  /* -----------------------------------------------------------------------
     SHIELD IN A BLOCK OF THE PAGE
     el : the box (its size gives the canvas size). Returns a controller :
       assemble(onPiece(i, n), onDone) : the pieces come together one by one
     ----------------------------------------------------------------------- */
  function mount(el, data) {
    var cv = document.createElement('canvas');
    cv.className = 'sh3d-cv';
    el.appendChild(cv);
    var W = Math.max(el.clientWidth, 10), H = Math.max(el.clientHeight, 10);
    var R = makeRenderer(cv, W, H, 1.5), renderer = R.renderer, scene = R.scene;
    var camera = new THREE.PerspectiveCamera(30, W / H, 1, 4000);
    var t2 = 2 * Math.tan(THREE.MathUtils.degToRad(15));
    var fit = function () { camera.position.z = Math.max(SH / (0.74 * t2), SW / (0.7 * (W / H) * t2)); };
    fit();
    var orbit = lights(scene, 900);
    var S = buildShield(data, scene), shield = S.shield, pieces = S.pieces;

    // apart : the pieces float in an exploded view, almost invisible
    pieces.forEach(function (m, n) {
      var h = m.userData.home, d = m.userData.dir;
      m.position.set(h.x + d.x * rand(70, 110), h.y + d.y * rand(60, 90), rand(-160, 60));
      m.rotation.set(rand(-1.4, 1.4), rand(-1.4, 1.4), rand(-0.8, 0.8));
    });
    S.mats.forEach(function (mt) { mt.opacity = 0; });
    shield.rotation.set(0.12, -0.7, 0);

    var visible = false, assembled = false, t0 = performance.now();
    var pt = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    var onMove = function (e) {
      var r = el.getBoundingClientRect();
      pt.x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
      pt.y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    var base = { y: -0.7 };
    var tick = function () {
      if (!visible) return;
      var t = (performance.now() - t0) / 1000;
      cur.x += (pt.x - cur.x) * 0.05; cur.y += (pt.y - cur.y) * 0.05;
      if (assembled) {
        shield.rotation.y = base.y + cur.x * 0.42 + Math.sin(t * 0.6) * 0.06;
        shield.rotation.x = 0.04 + cur.y * 0.22;
        shield.position.y = Math.sin(t * 0.9) * 1.4;
        orbit.position.set(-cur.x * 160 + 40, 60 - cur.y * 80, 180);
      }
      renderer.render(scene, camera);
    };
    renderer.compile(scene, camera);
    gsap.ticker.add(tick);
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(el);
    else visible = true;
    var ro = window.ResizeObserver ? new ResizeObserver(function () {
      W = Math.max(el.clientWidth, 10); H = Math.max(el.clientHeight, 10);
      renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); fit();
    }) : null;
    if (ro) ro.observe(el);

    return {
      assemble: function (onPiece, onDone) {
        var tl = gsap.timeline({ onComplete: function () { assembled = true; if (onDone) onDone(); } });
        tl.to(base, { y: 0, duration: 2.6, ease: 'power3.inOut', onUpdate: function () { if (!assembled) shield.rotation.y = base.y; } }, 0);
        pieces.forEach(function (m, n) {
          var h = m.userData.home, t = 0.15 + n * 0.42;
          tl.to(m.material, { opacity: 1, duration: 0.5, ease: 'power1.out' }, t)
            .to(m.position, { x: h.x, y: h.y, z: 0, duration: 1.1, ease: 'expo.inOut' }, t)
            .to(m.rotation, { x: 0, y: 0, z: 0, duration: 1.1, ease: 'expo.inOut' }, t)
            .to(S.sides[n], { keyframes: [{ emissiveIntensity: 1.3, duration: 0.1 }, { emissiveIntensity: 0, duration: 0.6, ease: 'power2.out' }] }, t + 1)
            .call(function () { if (onPiece) onPiece(n, pieces.length); }, null, t + 1);
        });
        orbit.position.set(40, 60, 180);
        tl.to(orbit, { keyframes: [{ intensity: 1.6, duration: 0.6 }, { intensity: 0.9, duration: 1.2 }] }, 0.4);
        return tl;
      },
      pieces: function () { return pieces.length; }
    };
  }

  window.HyperionIntro3D = {
    // opts : { shield: url of the vector shield, onExit(): reveal the page }
    play: function (opts) {
      opts = opts || {};
      return Promise.race([libs(), timeout(4500)])
        .then(function () { return shieldData(opts.shield || SHIELD); })
        .then(function (data) { return run(data, opts); });
    },
    // the shield in a block of the page (resolves with its controller)
    mount: function (el, opts) {
      opts = opts || {};
      return Promise.race([libs(), timeout(9000)])
        .then(function () { return shieldData(opts.shield || SHIELD); })
        .then(function (data) { return mount(el, data); });
    }
  };
})();
