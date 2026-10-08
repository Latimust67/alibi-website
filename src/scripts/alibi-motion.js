// Scroll choreography for the October 2026 redesign.
// Desktop (1000px+): pinned scenes — sundown in the hero, the turntable of
// plates, the walk through Inside / the deck / the Beer Forest — plus a forest
// that rises into the footer. Phones get their own, simpler story that only
// ever moves up and down (the rolling pizza excepted): a deck of dish cards,
// a beer shelf, prints that settle, and a pint that fills beside the
// milestones. Reduced motion and no-JS keep the complete still pages. Native
// scrolling is kept on purpose: the beer worlds and the dish deck rely on
// position: sticky.
(() => {
  const MOTION = '(prefers-reduced-motion: no-preference)';
  if (!matchMedia(MOTION).matches) return;
  const load = (src) => new Promise((resolve, reject) => { const s = document.createElement('script'); s.src = src; s.onload = resolve; s.onerror = reject; document.head.append(s); });
  const boot = () => load('/assets/vendor/gsap.min.js')
    .then(() => Promise.all([load('/assets/vendor/ScrollTrigger.min.js'), load('/assets/vendor/SplitText.min.js')]))
    .then(start)
    .catch(() => { /* the static page is complete without motion */ });
  // Wide screens start at once (the hero is a scroll scene); phones wait for the
  // page to finish loading so the first paint stays fast.
  if (matchMedia('(min-width: 1000px)').matches || document.readyState === 'complete') boot();
  else addEventListener('load', () => (window.requestIdleCallback || setTimeout)(boot, { timeout: 600 }), { once: true });

  function start() {
    const { gsap, ScrollTrigger, SplitText } = window;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    ScrollTrigger.config({ ignoreMobileResize: true });
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const headerH = () => $('[data-header]')?.offsetHeight || 76;
    const calm = (els) => els.forEach((el) => { el.removeAttribute('data-reveal'); el.classList.add('is-in'); });
    // ---- come on through: each space opens in its own shape ---------------------------------
    // The shapes come from the places: the timber gable, a shade sail, a pine.
    const SHAPES = [
      [[0.5, 0.06], [0.92, 0.46], [0.8, 0.46], [0.8, 0.94], [0.2, 0.94], [0.2, 0.46], [0.08, 0.46]],
      [[0.06, 0.2], [0.5, 0.25], [0.96, 0.08], [0.74, 0.5], [0.62, 0.94], [0.4, 0.54]],
      [[0.5, 0.02], [0.66, 0.28], [0.58, 0.28], [0.76, 0.52], [0.64, 0.52], [0.86, 0.8], [0.56, 0.8], [0.56, 0.98], [0.44, 0.98], [0.44, 0.8], [0.14, 0.8], [0.36, 0.52], [0.24, 0.52], [0.42, 0.28], [0.34, 0.28]],
    ];
    const OPEN = 14;
    const mm = gsap.matchMedia();

    mm.add({ desk: `(min-width: 1000px) and ${MOTION}`, phone: `(max-width: 999px) and ${MOTION}` }, (ctx) => {
      const desk = !!ctx.conditions.desk;
      document.documentElement.classList.add('a-motion');
      const splits = [];
      const split = (el, type) => { const s = SplitText.create(el, { type, linesClass: 'a-split-line' }); splits.push(s); return s; };
      const cleanups = [];

      if (desk) heroDesk(); else heroPhone();
      counters();
      sectionHeadings();
      foodSpot();
      if (desk) ovenDesk(); else ovenPhone();
      tickets();
      if (!desk) { beersPhone(); printsPhone(); }
      if (desk) tourDesk(); else tourPhone();
      events();
      crew();
      if (desk) storyDesk(); else storyPhone();
      visitBand();
      closing();
      if (desk) { pint(); menuPage(); whatsOnPage(); visitPage(); }

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
      addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
      return () => {
        cleanups.forEach((fn) => fn());
        splits.forEach((s) => s.revert());
        document.documentElement.classList.remove('a-motion');
      };

      // ---- home: golden hour, sundown, the lights come on ----------------------------------
      function lightsOn(tl, svg, at, span) {
        const cores = $$('.a-bulb-core', svg), halos = $$('.a-bulb-halo', svg);
        const gap = span / Math.max(1, cores.length);
        // Each bulb catches, stutters once, then holds — in order from the bar outward.
        tl.to(cores, { keyframes: { opacity: [0, 1, 0.3, 1, 0.75, 1] }, duration: gap * 3, stagger: gap }, at)
          .to(halos, { keyframes: { opacity: [0, 0.9, 0.2, 1] }, duration: gap * 3, stagger: gap }, at + gap * 0.4)
          .to($('.a-pools', svg), { opacity: 1, duration: span * 0.8 }, at + span * 0.3);
      }
      function heroDesk() {
        const hero = $('[data-hero]');
        const stage = hero && $('.a-hero-stage', hero);
        if (!stage) return;
        const L = (n) => $(`[data-layer="${n}"]`, stage), T = (n) => $(`[data-tint="${n}"]`, stage);
        const svg = $('.a-lights--desk', stage);
        // Wrappers, not the copy itself: the copy's own CSS entrance may still be running.
        const copy = $$('.a-hero-top, .a-hero-body, .a-hero-foot', hero);
        const title = $('#home-title', hero), after = $('.a-hero-after', hero);
        // Let the CSS entrance finish, then hand the copy to the scroll timeline.
        setTimeout(() => hero.classList.add('is-settled'), 1300);
        const titleChars = split(title, 'words,chars').chars;
        const afterChars = after ? split($('.a-display', after), 'words,chars').chars : [];
        const afterNote = after && $('.a-hero-after-note', after);
        const tonight = $('.a-hero-tonight', hero), strand = $('.a-hero-strand', hero);
        if (strand) gsap.set(strand, { autoAlpha: 0 });
        if (afterNote) gsap.set(afterNote, { opacity: 0, y: 16 });
        if (tonight) gsap.set(tonight, { autoAlpha: 0, y: 40 });
        gsap.set(afterChars, { yPercent: 110, opacity: 0 });
        const tints = [T('land'), T('deck'), T('table')];
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: hero, start: () => `top ${headerH()}`, end: '+=190%', pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: (self) => strand?.classList.toggle('is-lit', self.progress > 0.44) },
        });
        // The camera eases toward the table the whole way.
        tl.to(L('sky'), { yPercent: -3, scale: 1.04, duration: 1 }, 0)
          .to([L('land'), T('land')], { yPercent: 2, scale: 1.07, duration: 1 }, 0)
          .to([L('deck'), T('deck'), svg], { xPercent: -3, yPercent: 2, scale: 1.16, duration: 1 }, 0)
          .to([L('table'), T('table')], { yPercent: 7, scale: 1.3, duration: 1 }, 0)
          // The sun drops behind the mountains by about 0.42 ...
          .to('.a-hero-sun', { yPercent: 160, scale: 1.12, duration: 0.4, ease: 'power1.in' }, 0.03)
          .to('.a-sky--dusk', { opacity: 1, duration: 0.26 }, 0.06)
          .to(tints, { opacity: 0.5, duration: 0.24 }, 0.12)
          .to('.a-sky--night', { opacity: 1, duration: 0.3 }, 0.36)
          .to(tints, { opacity: 1, duration: 0.28 }, 0.37)
          .to('.a-hero-stars', { opacity: 1, duration: 0.25 }, 0.5)
          .to(hero, { keyframes: [{ backgroundColor: '#efcfae', duration: 0.16 }, { backgroundColor: '#3b2c4a', duration: 0.2 }, { backgroundColor: '#10231A', duration: 0.3 }] }, 0.03)
          .fromTo(titleChars, { yPercent: 0 }, { yPercent: -180, stagger: 0.004, duration: 0.07, ease: 'power1.in', immediateRender: false }, 0.04)
          .fromTo(titleChars, { opacity: 1 }, { opacity: 0, stagger: 0.004, duration: 0.04, immediateRender: false }, 0.04)
          .fromTo(copy, { y: 0, autoAlpha: 1 }, { y: -36, autoAlpha: 0, stagger: 0.015, duration: 0.1, immediateRender: false }, 0.2)
          .to('.a-hero-cue', { opacity: 0, duration: 0.05 }, 0)
          .to('.a-stamp', { rotate: 220, duration: 1 }, 0);
        // ... and as soon as it is gone, the strings light up.
        lightsOn(tl, svg, 0.43, 0.2);
        // The night line rises as the day copy leaves, so the column is never empty.
        // Hand-over: the night line takes the headline's place as soon as it clears, while the
        // day intro stays; each night piece arrives once the day piece in its spot has gone.
        const afterLine = $('.a-display', after), afterEm = $('.a-display em', after);
        const lineChars = afterChars.filter((c) => !c.closest('em')), emChars = afterChars.filter((c) => c.closest('em'));
        // It arrives in ink on the dusk-lit panel and warms to cream and gold as night falls.
        tl.fromTo(afterLine, { color: '#152C23' }, { color: '#FFFDF7', duration: 0.18 }, 0.2)
          .fromTo(afterEm, { color: '#9A4A22' }, { color: '#E9BA63', duration: 0.18 }, 0.24)
          .to(lineChars, { yPercent: 0, opacity: 1, stagger: 0.003, duration: 0.07 }, 0.165)
          .to(emChars, { yPercent: 0, opacity: 1, stagger: 0.003, duration: 0.07 }, 0.29);
        if (afterNote) tl.to(afterNote, { opacity: 1, y: 0, duration: 0.07 }, 0.32);
        if (strand) tl.to(strand, { autoAlpha: 1, duration: 0.07 }, 0.34);
        if (tonight) tl.to(tonight, { autoAlpha: 1, y: 0, duration: 0.1, ease: 'power2.out' }, 0.37);
      }
      function heroPhone() {
        const hero = $('[data-hero]');
        const art = hero && $('.a-hero-art', hero);
        if (!art) return;
        const svg = $$('.a-lights', art).find((s) => getComputedStyle(s).display !== 'none');
        const cap = $('.a-hero-art-cap', art);
        const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 30%', scrub: 0.4 } });
        tl.to($('picture', art), { scale: 1.06, duration: 1 }, 0)
          .to($('.a-hero-flat-night', art), { opacity: 0.88, duration: 0.36 }, 0.04);
        if (svg) lightsOn(tl, svg, 0.18, 0.26);
        if (cap) tl.fromTo(cap, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.14 }, 0.4);
      }

      // ---- counters land on the real figures --------------------------------------------------
      function counters() {
        $$('[data-count]').forEach((el) => {
          const to = +el.dataset.count, from = +(el.dataset.from || 0), suffix = el.dataset.suffix || '';
          const box = { v: from };
          ScrollTrigger.create({
            trigger: el, start: 'top 90%', once: true,
            onEnter: () => gsap.fromTo(box, { v: from }, { v: to, duration: 1.6, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(box.v) + suffix; } }),
          });
        });
      }

      // ---- every new section heading rises line by line ---------------------------------------
      function sectionHeadings() {
        const heads = $$('main .a-h2').filter((h) => !h.closest('.a-kept'));
        calm(heads);
        // No clipping masks: lines rise and fade in whole, so descenders and
        // italic swashes are never cut off mid-way.
        heads.forEach((h) => {
          const { lines } = split(h, 'lines');
          gsap.from(lines, { yPercent: 28, rotationX: -40, opacity: 0, transformOrigin: '50% 100%', duration: desk ? 1.2 : 0.9, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: h, start: 'top 90%', once: true } });
        });
      }

      // ---- the little pizza rolls in beside the food heading ----------------------------------
      function foodSpot() {
        const spot = $('.a-food-spot');
        if (!spot) return;
        gsap.fromTo(spot, { x: desk ? -340 : -160, rotate: desk ? -300 : -220 }, { x: 0, rotate: -8, ease: 'none', scrollTrigger: { trigger: '.a-food', start: 'top 95%', end: 'top 30%', scrub: desk ? 0.8 : 0.4 } });
      }

      // ---- the turntable: real plates are dealt round, one at a time -----------------------
      function ovenDesk() {
        const pin = $('.a-oven-pin');
        if (!pin) return;
        const ring = $('.a-oven-ring', pin), disc = $('.a-oven-disc', pin);
        const plates = $$('.a-course-plate', pin), copies = $$('.a-course-copy', pin), dots = $$('.a-oven-dots i', pin);
        const pics = plates.map((p) => $('img', p));
        const PIVOT = '50% 300%', IN = 36;
        gsap.set(plates, { transformOrigin: PIVOT, visibility: 'visible' });
        gsap.set(plates.slice(1), { rotation: IN, opacity: 0 });
        gsap.set(copies, { opacity: 0, y: 40 });
        gsap.set(copies[0], { opacity: 1, y: 0 });
        // The first plate settles onto the turntable as the section arrives.
        gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: pin, start: 'top bottom', end: () => `top ${headerH()}`, scrub: 0.6, invalidateOnRefresh: true } })
          .fromTo(plates[0], { rotation: 10, y: 120, scale: 0.9 }, { rotation: 0, y: 0, scale: 1, duration: 1 }, 0)
          .fromTo(pics[0], { scale: 1.16 }, { scale: 1, duration: 1 }, 0)
          .fromTo(ring, { rotation: -60, opacity: 0 }, { rotation: 0, opacity: 1, duration: 1 }, 0)
          .fromTo(disc, { scale: 0.86 }, { scale: 1, duration: 1 }, 0);
        let shown = 0;
        const steps = plates.length;
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: pin, start: () => `top ${headerH()}`, end: () => `+=${steps * 64}%`, pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => {
              const i = Math.max(0, Math.min(steps - 1, Math.round(self.progress * (steps - 1))));
              if (i !== shown) { dots[shown]?.classList.remove('is-on'); dots[i]?.classList.add('is-on'); shown = i; }
            },
          },
        });
        // The name ring keeps turning the whole way round.
        tl.to(ring, { rotation: 200, duration: steps - 1 }, 0);
        for (let k = 1; k < steps; k++) {
          const at = k - 0.75;
          // The next plate swings in on the turntable's arc and lands on top ...
          tl.fromTo(plates[k], { rotation: IN, opacity: 0 }, { rotation: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, at)
            .fromTo(pics[k], { scale: 1.18 }, { scale: 1, duration: 0.6, ease: 'power2.out' }, at)
            // ... while the one beneath sinks back and goes.
            .to(plates[k - 1], { scale: 0.9, rotation: -3, opacity: 0, duration: 0.42, ease: 'power2.in' }, at + 0.12)
            .to(copies[k - 1], { opacity: 0, y: -40, duration: 0.25, ease: 'power2.in' }, at)
            .to(copies[k], { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, at + 0.22);
        }
        tl.to({}, { duration: 0.25 }, steps - 1);
      }
      function ovenPhone() {
        // Phones: the dishes are a deck. Each card sticks (CSS) and the next one
        // slides up over it; once it has nearly landed, the card beneath steps back
        // and dims. That is a class with a CSS transition, never a scroll-linked
        // tween: re-transforming stuck cards on every scroll frame shakes in iOS Safari.
        const cards = $$('.a-courses .a-course');
        if (!cards.length) return;
        if (getComputedStyle(cards[0]).position !== 'sticky') {
          // Short screens: a plain list that rises in.
          gsap.from(cards, { y: 50, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.a-courses', start: 'top 88%', once: true } });
          return;
        }
        const stuckAt = (el) => parseFloat(getComputedStyle(el).top) || 0;
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          ScrollTrigger.create({
            trigger: next, start: () => `top ${stuckAt(next) + next.offsetHeight * 0.3}px`, invalidateOnRefresh: true,
            onEnter: () => card.classList.add('is-covered'), onLeaveBack: () => card.classList.remove('is-covered'),
          });
        });
      }

      // ---- phones: the six beers stand up on their shelf as each row arrives -----------------------
      function beersPhone() {
        const tiles = $$('.house-mobile-beers .mobile-beer');
        if (!tiles.length) return;
        gsap.set(tiles.filter((t) => t.getBoundingClientRect().top > innerHeight), { y: 46, opacity: 0 });
        ScrollTrigger.batch(tiles, {
          start: 'top 92%', once: true,
          onEnter: (batch) => {
            gsap.to(batch, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.09, overwrite: true });
            gsap.fromTo(batch.map((t) => $('.mobile-beer-can', t)), { yPercent: 22 }, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.09, delay: 0.12 });
          },
        });
      }

      // ---- phones: the prints drop onto the table and settle ----------------------------------------
      function printsPhone() {
        const prints = $$('.mobile-print figure');
        if (!prints.length) return;
        // GSAP takes over the CSS tilt (--r), so each print settles back onto its own angle.
        const tilt = (el) => parseFloat(getComputedStyle(el).getPropertyValue('--r')) || 0;
        gsap.set(prints.filter((p) => p.getBoundingClientRect().top > innerHeight), { y: 60, rotation: (i, el) => tilt(el) + (tilt(el) < 0 ? -7 : 7), opacity: 0 });
        ScrollTrigger.batch(prints, {
          start: 'top 90%', once: true,
          onEnter: (batch) => gsap.to(batch, { y: 0, rotation: (i, el) => tilt(el), opacity: 1, duration: 1.1, ease: 'back.out(1.4)', stagger: 0.12, overwrite: true }),
        });
      }

      // ---- the three tickets are dealt onto the table ------------------------------------------
      function tickets() {
        const list = $('.a-tickets');
        if (!list) return;
        const items = $$('.a-ticket', list);
        calm(items);
        const trigger = { trigger: list, start: 'top 86%', once: true };
        gsap.from(items, { y: desk ? 120 : 60, rotation: (i) => [-5, 3, -3][i % 3], opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12, scrollTrigger: trigger });
        gsap.fromTo($$('.a-ticket-spot', list), { rotate: -40, scale: 0.5 }, { rotate: 9, scale: 1, duration: 1.4, ease: 'elastic.out(1, 0.5)', stagger: 0.12, delay: 0.2, scrollTrigger: trigger });
      }

      function shapeClip(el, shape, center, zoom, frac) {
        if (zoom >= OPEN) return 'none';
        const w = el.clientWidth, h = el.clientHeight, size = Math.min(w, h) * frac * zoom;
        const cx = center[0] * w, cy = center[1] * h;
        return `polygon(${shape.map(([x, y]) => `${(cx + (x - 0.5) * size).toFixed(1)}px ${(cy + (y - 0.5) * size).toFixed(1)}px`).join(',')})`;
      }
      function tourDesk() {
        const sec = $('[data-tour]');
        if (!sec) return;
        const pin = $('.a-tour-pin', sec), scenes = $$('.a-scene', sec), intro = $('.a-tour-intro', sec);
        const trail = $('.a-tour-trail', sec), fill = $('.a-trail-fill', trail), stops = $$('.a-trail-stop', trail);
        const media = scenes.map((s) => $('.a-scene-media', s)), cards = scenes.map((s) => $('.a-scene-copy', s));
        const imgs = media.map((m) => $('picture img', m));
        const CENTERS = [[0.7, 0.52], [0.66, 0.5], [0.68, 0.56]];
        const z = scenes.map(() => ({ v: 0 }));
        const draw = (i) => { media[i].style.clipPath = shapeClip(media[i], SHAPES[i], CENTERS[i], z[i].v, 0.62); };
        z.forEach((_, i) => draw(i));
        if (fill) { const len = fill.getTotalLength(); gsap.set(fill, { strokeDasharray: len, strokeDashoffset: len }); }
        gsap.set(cards, { autoAlpha: 0, y: 40 });
        const setCurrent = (i) => { scenes.forEach((s, k) => s.classList.toggle('is-current', k === i)); stops.forEach((s, k) => s.classList.toggle('is-on', k <= i)); };
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: pin, start: () => `top ${headerH()}`, end: '+=380%', pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => setCurrent(self.progress < 0.27 ? -1 : self.progress < 0.53 ? 0 : self.progress < 0.8 ? 1 : 2),
            onRefresh: () => z.forEach((_, i) => draw(i)),
          },
        });
        // Each card hands over to the next as its space opens, so a caption is always readable.
        const open = (i, at) => {
          tl.to(z[i], { v: 1, duration: 0.2, ease: 'back.out(1.6)', onUpdate: () => draw(i) }, at)
            .to(z[i], { v: OPEN, duration: 0.45, ease: 'power3.in', onUpdate: () => draw(i) }, at + 0.25)
            .fromTo(imgs[i], { scale: 1.32 }, { scale: 1.04, duration: 0.7 }, at)
            .to(cards[i], { autoAlpha: 1, y: 0, duration: 0.12, ease: 'power2.out' }, at + 0.68);
          if (i > 0) tl.to(cards[i - 1], { autoAlpha: 0, y: -30, duration: 0.1, ease: 'power2.in' }, at + 0.62);
          return tl;
        };
        open(0, 0);
        tl.to(intro, { x: -80, opacity: 0, duration: 0.25, ease: 'power2.in' }, 0.28)
          .to(trail, { opacity: 1, duration: 0.1 }, 0.6)
          .to(imgs[0], { scale: 1, duration: 0.6 }, 0.7);
        open(1, 1.3);
        tl.to(imgs[0], { scale: 1.12, duration: 0.6 }, 1.4)
          .to(fill, { strokeDashoffset: () => fill.getTotalLength() * 0.5, duration: 0.6 }, 1.3)
          .to(imgs[1], { scale: 1, duration: 0.5 }, 2.0);
        open(2, 2.3);
        tl.to(fill, { strokeDashoffset: 0, duration: 0.6 }, 2.3)
          .to($('.a-scene-night', scenes[2]), { opacity: 1, duration: 0.35 }, 3.05)
          .to(imgs[2], { scale: 1, duration: 0.5 }, 3.0)
          .to({}, { duration: 0.15 }, 3.4);
      }
      function tourPhone() {
        // Phones: each space opens in its shape once as it arrives (no scrubbing).
        $$('[data-tour] .a-scene').forEach((scene, i) => {
          const media = $('.a-scene-media', scene), img = $('picture img', media), card = $('.a-scene-copy', scene);
          const z = { v: 1 };
          const draw = () => { media.style.clipPath = shapeClip(media, SHAPES[i], [0.5, 0.5], z.v, 0.78); };
          draw();
          const trigger = { trigger: media, start: 'top 78%', once: true };
          gsap.timeline({ scrollTrigger: trigger })
            .to(z, { v: OPEN, duration: 1.1, ease: 'power3.in', onUpdate: draw }, 0)
            .fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.3, ease: 'expo.out' }, 0);
          gsap.from(card, { y: 40, opacity: 0, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 92%', once: true } });
          const night = $('.a-scene-night', scene);
          if (night) gsap.to(night, { opacity: 1, duration: 1.2, ease: 'power2.inOut', scrollTrigger: { trigger: media, start: 'center 45%', toggleActions: 'play none none reverse' } });
        });
      }

      // ---- what's on: rows slide in with the scroll, the dates flip, the marquee drifts ----------
      function events() {
        const sec = $('.a-events');
        if (!sec) return;
        calm($$('[data-reveal]', sec));
        const list = $('.a-event-list', sec);
        const week = $$('.a-week li', sec), rows = $$('.a-event:not([hidden])', sec);
        if (desk) {
          // Each row is tied to its own place in the scroll, so it reverses on the way back up.
          const tie = (el, from) => gsap.fromTo(el, from, { x: 0, y: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 98%', end: 'top 66%', scrub: 0.5 } });
          week.forEach((li) => tie(li, { x: -28, opacity: 0.15 }));
          rows.forEach((row) => {
            tie(row, { x: 90, opacity: 0.12 });
            const date = $('.a-event-date', row);
            if (date) gsap.fromTo(date, { yPercent: 30, rotation: -4 }, { yPercent: -6, rotation: 0, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom 40%', scrub: 0.5 } });
          });
          rows.forEach((row, n) => flip($('.a-event-date strong', row), 0.12 + n * 0.07, list));
          const moon = $('.a-events-moon', sec);
          if (moon) gsap.fromTo(moon, { y: 70, scale: 0.82 }, { y: -40, scale: 1, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
        } else {
          // Phones: a simple rise as each list arrives.
          gsap.from(week, { y: 24, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: $('.a-week', sec), start: 'top 88%', once: true } });
          gsap.from(rows, { y: 24, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: list, start: 'top 88%', once: true } });
        }
        // The week's regulars drift in two bands, in opposite directions (wide screens; phones hide the band).
        const [a, b] = $$('.a-marquee-row', sec);
        if (desk && a && b) gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: $('.a-marquee', sec), start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
          .fromTo(a, { xPercent: 0 }, { xPercent: -28, duration: 1 }, 0)
          .fromTo(b, { xPercent: -30 }, { xPercent: -4, duration: 1 }, 0);
      }
      function flip(el, delay, trigger) {
        if (!el) return;
        const final = el.textContent;
        ScrollTrigger.create({
          trigger, start: 'top 82%', once: true,
          onEnter: () => {
            const steps = 5, day = parseInt(final, 10);
            const tl = gsap.timeline({ delay, onComplete: () => { el.textContent = final; } });
            for (let i = 0; i < steps; i++) {
              const shown = i === steps - 1 ? final : String(((day - (steps - 1 - i) + 30) % 31) + 1);
              tl.to(el, { rotateX: 90, duration: 0.045, ease: 'power1.in', onComplete: () => { el.textContent = shown; } })
                .to(el, { rotateX: 0, duration: 0.05, ease: 'power1.out' });
            }
          },
        });
      }

      // ---- private events: the hall opens up ----------------------------------------------------
      function crew() {
        const photo = $('.a-crew-photo');
        if (!photo) return;
        const pic = $('picture', photo);
        if (desk) {
          gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: photo, start: 'top 92%', end: 'top 30%', scrub: 0.6 } })
            .fromTo(pic, { clipPath: 'inset(14% 18% 14% 18% round 6px)' }, { clipPath: 'inset(0% 0% 0% 0% round 6px)', duration: 1 }, 0)
            .fromTo($('img', pic), { scale: 1.3 }, { scale: 1, duration: 1 }, 0);
        } else {
          gsap.timeline({ scrollTrigger: { trigger: photo, start: 'top 85%', once: true } })
            .fromTo(pic, { clipPath: 'inset(8% 8% 8% 8% round 20px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.1, ease: 'expo.out' }, 0)
            .fromTo($('img', pic), { scale: 1.2 }, { scale: 1, duration: 1.2, ease: 'expo.out' }, 0);
        }
        gsap.from($$('.a-crew-list li'), { x: desk ? 30 : 0, y: desk ? 0 : 16, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: '.a-crew-list', start: 'top 88%', once: true } });
      }

      // ---- brewed here: a pint pours as you scroll; each milestone lights as the beer passes it --
      function storyDesk() {
        const sec = $('[data-story]');
        if (!sec) return;
        const pin = $('.a-story-pin', sec), glassEl = $('.a-glass', sec), marks = $$('.a-mark', sec);
        if (!pin || !glassEl) return;
        const pours = $$('.a-pour', sec), foam = $('.a-story-foam', sec), hint = $('.a-story-hint', sec), glow = $('.a-story-glow', sec);
        const AT = marks.map((m) => parseFloat(m.style.getPropertyValue('--at')) || 0);
        const TINTS = ['rgb(233 186 99 / .13)', 'rgb(214 120 60 / .17)', 'rgb(110 196 150 / .15)', 'rgb(240 196 110 / .19)'];
        const level = { v: 0.04 };
        let shown = -1;
        const paint = () => {
          glassEl.style.setProperty('--level', level.v.toFixed(4));
          let lit = 0;
          marks.forEach((m, i) => { const on = level.v >= AT[i]; m.classList.toggle('is-lit', on); if (on) lit = i + 1; });
          if (lit !== shown) { shown = lit; gsap.to(sec, { '--story-tint': TINTS[Math.max(0, lit - 1)], duration: 0.6, overwrite: 'auto' }); }
        };
        paint();
        gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: pin, start: () => `top ${headerH()}`, end: '+=240%', pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true } })
          .to(pours, { opacity: 1, duration: 0.04 }, 0)
          .to(level, { v: 1, duration: 0.84, ease: 'power1.inOut', onUpdate: paint }, 0.02)
          .to(pours, { opacity: 0, duration: 0.05 }, 0.84)
          .fromTo(foam, { scaleY: 1 }, { scaleY: 1.6, transformOrigin: '50% 100%', duration: 0.1, ease: 'power2.out' }, 0.86)
          .to(hint, { opacity: 0, y: 10, duration: 0.08 }, 0.06)
          .fromTo(glow, { xPercent: -6 }, { xPercent: 6, duration: 1 }, 0)
          .to({}, { duration: 0.04 }, 0.96);
        // The perks come in under the scene.
        gsap.from($$('.a-member, .a-perk', sec), { y: 60, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: $('.a-perks', sec), start: 'top 86%', once: true } });
        const card = $('.a-member-card', sec);
        if (card) gsap.fromTo(card, { rotation: -16, y: 50 }, { rotation: -5, y: 0, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'center 55%', scrub: 0.6 } });
      }
      function storyPhone() {
        const sec = $('[data-story]');
        if (!sec) return;
        // Phones: the glass and the current milestone hold still mid-screen (CSS sticky) while
        // the milestones scroll through underneath. A stream pours as you scroll; the beer reaches
        // each tick on the glass just as its milestone settles into place, and the stream stops
        // when the glass is full. Short screens keep the plain list beside a full glass.
        const list = $('.a-marks', sec), glassEl = $('.a-glass', sec), marks = $$('.a-mark', sec);
        if (list && glassEl && marks.length && getComputedStyle(marks[0]).position === 'sticky') {
          const AT = marks.map((m) => parseFloat(m.style.getPropertyValue('--at')) || 0);
          const held = () => parseFloat(getComputedStyle(marks[0]).top) || 0;
          const preroll = () => innerHeight * 0.3;
          let settle = [];
          // Progress (0-1) at which each milestone settles into its place under the glass.
          const measure = (self) => {
            const range = self.end - self.start || 1;
            let y = 0;
            settle = marks.map((m) => { const p = (preroll() + y) / range; y += m.offsetHeight; return Math.min(0.98, p); });
          };
          // The pour starts once the glass is in place (the first milestone settling), reaches the
          // first tick a little later, then each later tick as its milestone settles.
          const levelAt = (p) => {
            if (p <= settle[0]) return 0.04;
            const pts = [[settle[0], 0.04], [settle[0] + (settle[1] - settle[0]) * 0.35, AT[0]], ...settle.slice(1).map((st, i) => [st, AT[i + 1]]), [1, 1]];
            for (let k = 1; k < pts.length; k++) if (p <= pts[k][0]) { const [x0, y0] = pts[k - 1], [x1, y1] = pts[k]; return x1 > x0 ? y0 + ((p - x0) / (x1 - x0)) * (y1 - y0) : y1; }
            return 1;
          };
          const state = { v: 0.04 };
          const paint = () => {
            glassEl.style.setProperty('--level', state.v.toFixed(4));
            const lit = AT.filter((a) => state.v >= a - 0.002).length;
            glassEl.dataset.lit = lit;
            glassEl.classList.toggle('is-full', state.v >= 0.995);
            marks.forEach((m, i) => { m.classList.toggle('is-lit', i < lit); m.classList.toggle('is-current', i === Math.max(0, lit - 1)); });
          };
          const copy = $('.a-story-copy', sec);
          const pour = (p) => {
            glassEl.classList.toggle('is-pouring', p >= settle[0] && p < 1);
            // The stream falls from the header, or from just under the text while it is still in view.
            const g = glassEl.getBoundingClientRect().top, from = Math.max(headerH(), copy ? copy.getBoundingClientRect().bottom + 14 : 0);
            glassEl.style.setProperty('--pour-len', `${Math.max(0, Math.round(g - from))}px`);
            gsap.to(state, { v: levelAt(p), duration: 0.35, ease: 'power2.out', overwrite: true, onUpdate: paint });
          };
          ScrollTrigger.create({
            trigger: list, invalidateOnRefresh: true,
            start: () => `top ${held() + preroll()}px`,
            end: () => `bottom ${held() + marks[marks.length - 1].offsetHeight}px`,
            onRefresh: (self) => { measure(self); pour(self.progress); },
            onUpdate: (self) => pour(self.progress),
          });
          paint();
        }
        gsap.from($$('.a-member, .a-perk', sec), { y: 30, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: $('.a-perks', sec), start: 'top 88%', once: true } });
      }

      // ---- find us: the letterboard swings down, the house notes rise -------------------------
      function visitBand() {
        const sec = $('.a-visit');
        if (!sec) return;
        const board = $('.a-board-frame', sec);
        if (board && desk) gsap.fromTo(board, { rotationX: -24, y: 50, transformOrigin: '50% 0%' }, { rotationX: 0, y: 0, ease: 'none', scrollTrigger: { trigger: board, start: 'top bottom', end: 'top 55%', scrub: 0.6 } });
        if (board) gsap.from($$('tr', board), { x: desk ? 18 : 0, y: desk ? 0 : 12, opacity: 0, stagger: 0.05, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: board, start: 'top 75%', once: true } });
        const know = $$('.a-know-item', sec);
        if (know.length) {
          calm(know);
          gsap.from(know, { y: 30, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: $('.a-know', sec), start: 'top 90%', once: true } });
        }
      }

      // ---- every page: the camera settles on Alibi at night, the lights come up -------------
      function closing() {
        const scene = $('.a-closing');
        if (!scene) return;
        const range = { trigger: scene, start: 'top bottom', end: () => (desk ? 'top top' : 'top 10%'), scrub: desk ? 0.7 : 0.4, invalidateOnRefresh: true };
        gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: range })
          .fromTo($('.a-closing-art img', scene), { scale: desk ? 1.2 : 1.1, yPercent: desk ? -7 : -4 }, { scale: 1, yPercent: 0, duration: 1 }, 0)
          .fromTo($('.a-closing-stars', scene), { yPercent: -10 }, { yPercent: 0, duration: 1 }, 0)
          .fromTo($('.a-closing-copy', scene), { y: desk ? 90 : 40 }, { y: 0, duration: 1 }, 0)
          .fromTo($('.a-closing-dim', scene), { opacity: 0.75 }, { opacity: 0, duration: 0.45 }, 0.45)
          .fromTo($('.a-closing-glow', scene), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.55);
        const line = $('.a-closing .a-footer-line');
        if (line) gsap.from(split(line, 'words,chars').chars, { rotationX: -80, opacity: 0, transformOrigin: '50% 100%', stagger: 0.015, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: line, start: 'top 90%', once: true } });
        // The big name rises out of the floor of the page.
        const giant = $('.a-giant-word');
        if (giant && desk) gsap.fromTo(giant, { yPercent: 22 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.a-footer-giant', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 } });
      }

      // ---- menu: prints fan out, spots drop in, cans pop up -----------------------------------
      function menuPage() {
        if (document.body.dataset.page !== 'menu') return;
        heroTitle();
        gsap.from('.a-hero-print--a', { y: 90, rotate: 10, opacity: 0, duration: 1.3, ease: 'expo.out', delay: 0.15 });
        gsap.from('.a-hero-print--b', { x: -110, y: 40, rotate: -18, opacity: 0, duration: 1.3, ease: 'expo.out', delay: 0.35 });
        gsap.to('.a-hero-prints', { y: -70, ease: 'none', scrollTrigger: { trigger: '.a-page-hero', start: 'top top', end: 'bottom top', scrub: 0.6 } });
        $$('.a-cat-spot').forEach((s) => gsap.from(s, { y: -80, rotate: -40, opacity: 0, duration: 1.1, ease: 'bounce.out', scrollTrigger: { trigger: s.closest('.a-menu-cat'), start: 'top 80%', once: true } }));
        gsap.from('.a-can-shelf li', { y: 140, rotate: (i) => (i % 2 ? 9 : -9), opacity: 0, duration: 1, ease: 'back.out(1.8)', stagger: 0.08, scrollTrigger: { trigger: '.a-can-shelf', start: 'top 85%', once: true } });
        $$('.a-menu-photo').forEach((f) => {
          calm([f]);
          gsap.fromTo($('img', f), { scale: 1.18, yPercent: -7 }, { scale: 1.18, yPercent: 7, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
        });
        gsap.from('.a-part-spot', { y: -40, rotate: 30, opacity: 0, duration: 1, ease: 'bounce.out', scrollTrigger: { trigger: '.a-part-spot', start: 'top 85%', once: true } });
      }

      // ---- what's on: a slow push into the night ----------------------------------------------
      function whatsOnPage() {
        if (document.body.dataset.page !== 'whats-on') return;
        heroTitle();
        gsap.fromTo('.a-night-art img', { scale: 1.02 }, { scale: 1.22, ease: 'none', scrollTrigger: { trigger: '.a-page-hero--night', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to('.a-page-hero--night .a-page-hero-copy', { y: -90, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.a-page-hero--night', start: 'top top', end: 'bottom 20%', scrub: true } });
        gsap.from('.a-next', { x: 120, opacity: 0, duration: 1.2, ease: 'expo.out', delay: 0.4 });
        const list = $('.a-calendar .a-months');
        if (list) gsap.from($$('.a-event', list), { x: 70, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: list, start: 'top 80%', once: true } });
        $$('.a-calendar .a-event-date strong').forEach((d, n) => flip(d, 0.12 + n * 0.07, list));
        const regulars = $$('.a-regular');
        calm(regulars);
        gsap.from(regulars, { y: 80, rotate: (i) => (i % 2 ? 3 : -3), opacity: 0, duration: 1, ease: 'back.out(1.5)', stagger: 0.1, scrollTrigger: { trigger: '.a-regular-grid', start: 'top 82%', once: true } });
        calm($$('.a-season'));
        gsap.fromTo('.a-season-spot', { rotate: -50, y: 60 }, { rotate: -6, y: 0, ease: 'none', scrollTrigger: { trigger: '.a-season', start: 'top bottom', end: 'center 55%', scrub: 0.8 } });
      }

      // ---- visit: the deck comes closer, the card slides in -----------------------------------
      function visitPage() {
        if (document.body.dataset.page !== 'visit') return;
        heroTitle();
        gsap.fromTo('.a-visit-art img', { scale: 1.12 }, { scale: 1, duration: 1.8, ease: 'expo.out' });
        gsap.to('.a-visit-art img', { yPercent: 8, scale: 1.06, ease: 'none', scrollTrigger: { trigger: '.a-page-hero--visit', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.from('.a-glance', { x: 140, rotate: 4, opacity: 0, duration: 1.3, ease: 'expo.out', delay: 0.5 });
        const hours = $('.a-visit-facts .a-hours');
        if (hours) { calm([hours]); gsap.from(hours, { rotateX: -70, opacity: 0, transformOrigin: '50% 0%', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: hours, start: 'top 85%', once: true } }); }
        const policies = $$('.a-policy');
        calm(policies);
        gsap.from(policies, { x: 60, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.a-policy-list', start: 'top 82%', once: true } });
        $$('.a-groups picture, .a-arrive-photo picture').forEach((p) => {
          calm([p.closest('[data-reveal]')].filter(Boolean));
          gsap.fromTo($('img', p), { scale: 1.2, yPercent: -6 }, { scale: 1.2, yPercent: 6, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } });
        });
      }

      function heroTitle() {
        const h1 = $('main h1');
        if (!h1) return;
        gsap.from(split(h1, 'words,chars').chars, { yPercent: 110, opacity: 0, duration: 0.75, ease: 'expo.out', stagger: 0.01 });
      }

      // ---- every page: a pint that fills as you read; click it to go back up ------------------
      function pint() {
        const glass = $('#a-pint');
        if (!glass) return;
        const after = () => { const sp = $('[data-hero]')?.closest('.pin-spacer'); return sp ? sp.offsetTop + sp.offsetHeight - innerHeight * 0.4 : innerHeight * 0.6; };
        ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => { glass.style.setProperty('--fill', self.progress.toFixed(3)); glass.classList.toggle('is-shown', self.scroll() > after()); glass.classList.toggle('is-full', self.progress > 0.985); } });
        const top = () => scrollTo({ top: 0, behavior: 'smooth' });
        glass.addEventListener('click', top);
        cleanups.push(() => glass.removeEventListener('click', top));
      }
    });
  }
})();
