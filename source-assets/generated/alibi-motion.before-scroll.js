// Desktop scroll choreography for the October 2026 redesign.
// Loads GSAP only on wide screens with motion allowed; phones, reduced motion
// and no-JS keep the calm, fully composed pages. Native scrolling is kept on
// purpose: the preserved beer worlds rely on position: sticky.
(() => {
  const QUERY = '(min-width: 1000px) and (prefers-reduced-motion: no-preference)';
  if (!matchMedia(QUERY).matches) return;
  const load = (src) => new Promise((resolve, reject) => { const s = document.createElement('script'); s.src = src; s.onload = resolve; s.onerror = reject; document.head.append(s); });
  load('/assets/vendor/gsap.min.js')
    .then(() => Promise.all([load('/assets/vendor/ScrollTrigger.min.js'), load('/assets/vendor/SplitText.min.js')]))
    .then(start)
    .catch(() => { /* the static page is complete without motion */ });

  function start() {
    const { gsap, ScrollTrigger, SplitText } = window;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const headerH = () => $('[data-header]')?.offsetHeight || 76;
    const calm = (els) => els.forEach((el) => { el.removeAttribute('data-reveal'); el.classList.add('is-in'); });
    const mm = gsap.matchMedia();

    mm.add(QUERY, () => {
      document.documentElement.classList.add('a-motion');
      const splits = [];
      const split = (el, type) => { const s = SplitText.create(el, { type, mask: type.includes('lines') ? 'lines' : undefined, linesClass: 'a-split-line' }); splits.push(s); return s; };

      heroStory();
      counters();
      sectionHeadings();
      food();
      seats();
      events();
      visitBand();
      footerForest();
      menuPage();
      whatsOnPage();
      visitPage();
      pint();

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
      addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
      return () => { splits.forEach((s) => s.revert()); document.documentElement.classList.remove('a-motion'); };

      // ---- home: golden hour to lights-on --------------------------------------------------
      function heroStory() {
        const hero = $('[data-hero]');
        const stage = hero && $('.a-hero-stage', hero);
        if (!stage) return;
        const layer = (n) => $(`[data-layer="${n}"]`, stage);
        const copy = $$('.a-hero-eyebrow, .a-hero-lede, .a-hero-actions, .a-hero-meta', hero);
        const title = $('#home-title', hero);
        const after = $('.a-hero-after', hero);
        // Let the CSS entrance finish, then hand the copy to the scroll timeline.
        setTimeout(() => hero.classList.add('is-settled'), 1300);
        const titleChars = split(title, 'words,chars').chars;
        const afterChars = after ? split(after, 'words,chars').chars : [];
        gsap.set(afterChars, { yPercent: 110, opacity: 0 });
        // Explicit start values: the CSS entrance may still be mid-fade when this runs.
        const from = (targets, vars) => ({ ...vars, immediateRender: false });
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: hero, start: () => `top ${headerH()}`, end: '+=130%', pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true },
        });
        tl.to(layer('sky'), { yPercent: -3, scale: 1.04, duration: 1 }, 0)
          .to('.a-hero-sun', { yPercent: 135, scale: 1.12, duration: 0.8 }, 0)
          .to(layer('land'), { yPercent: 2, scale: 1.07, duration: 1 }, 0)
          .to(layer('deck'), { xPercent: -3, yPercent: 2, scale: 1.16, duration: 1 }, 0)
          .to(layer('table'), { yPercent: 7, scale: 1.34, duration: 1 }, 0)
          .to('.a-hero-dusk', { opacity: 1, duration: 0.5 }, 0.12)
          .to('.a-hero-stars', { opacity: 1, duration: 0.3 }, 0.4)
          .to('.a-hero-glow', { opacity: 1, duration: 0.35 }, 0.3)
          .to(hero, { keyframes: [{ backgroundColor: '#efcfae', duration: 0.16 }, { backgroundColor: '#3b2c4a', duration: 0.18 }, { backgroundColor: '#10231A', duration: 0.34 }] }, 0.02)
          .fromTo(titleChars, { yPercent: 0, opacity: 1 }, from(titleChars, { yPercent: -120, opacity: 0, stagger: 0.008, duration: 0.18 }), 0.02)
          .fromTo(copy, { y: 0, opacity: 1 }, from(copy, { y: -36, opacity: 0, stagger: 0.025, duration: 0.16 }), 0.04)
          .to(afterChars, { yPercent: 0, opacity: 1, stagger: 0.0035, duration: 0.09 }, 0.26)
          .to('.a-stamp', { rotate: 220, duration: 1 }, 0);
      }

      // ---- home: counters land on the real figures --------------------------------------------
      function counters() {
        $$('[data-count]').forEach((el) => {
          const to = +el.dataset.count, from = +(el.dataset.from || 0), suffix = el.dataset.suffix || '';
          const box = { v: from };
          ScrollTrigger.create({
            trigger: el, start: 'top 88%', once: true,
            onEnter: () => gsap.fromTo(box, { v: from }, { v: to, duration: 1.6, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(box.v) + suffix; } }),
          });
        });
      }

      // ---- every new section heading rises line by line --------------------------------------
      function sectionHeadings() {
        const heads = $$('main .a-h2').filter((h) => !h.closest('.a-kept'));
        calm(heads);
        heads.forEach((h) => {
          const { lines } = split(h, 'lines');
          gsap.from(lines, { yPercent: 105, duration: 1.1, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
        });
      }

      // ---- home: food opens up, the pizza rolls in, picks are dealt ---------------------------
      function food() {
        const sec = $('.a-food');
        if (!sec) return;
        const main = $('.a-food-main', sec), bao = $('.a-food-bao', sec), picks = $$('.a-pick-list li', sec);
        calm([main, bao, $('.a-picks', sec)].filter(Boolean));
        gsap.fromTo($('picture', main), { clipPath: 'inset(16% 20% 16% 20% round 10px)' }, { clipPath: 'inset(0% 0% 0% 0% round 2px)', ease: 'none', scrollTrigger: { trigger: main, start: 'top 92%', end: 'top 30%', scrub: 0.6 } });
        gsap.fromTo($('img', main), { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: main, start: 'top 92%', end: 'bottom 40%', scrub: 0.6 } });
        gsap.fromTo(bao, { y: 140 }, { y: -30, ease: 'none', scrollTrigger: { trigger: main, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
        gsap.fromTo('.a-food-spot', { x: -340, rotate: -300 }, { x: 0, rotate: -8, ease: 'none', scrollTrigger: { trigger: sec, start: 'top 95%', end: 'top 35%', scrub: 0.8 } });
        gsap.from(picks, { y: 70, rotate: (i) => [-6, 4, -3, 5][i % 4], opacity: 0, duration: 0.9, ease: 'back.out(1.6)', stagger: 0.08, scrollTrigger: { trigger: '.a-picks', start: 'top 85%', once: true } });
        gsap.fromTo('.a-picks-spot', { rotate: -24, scale: 0.6 }, { rotate: 6, scale: 1, duration: 1.4, ease: 'elastic.out(1, 0.45)', scrollTrigger: { trigger: '.a-picks', start: 'top 85%', once: true } });
      }

      // ---- home: the seating section holds while scroll walks through the rooms --------------
      function seats() {
        const sec = $('[data-seats]');
        if (!sec) return;
        const buttons = $$('[data-seat]', sec), panels = $$('[data-seat-panel]', sec);
        const bar = $('.a-seat-progress i', sec);
        calm($$('[data-reveal]', sec));
        let current = buttons.findIndex((b) => b.getAttribute('aria-pressed') === 'true');
        const st = ScrollTrigger.create({
          trigger: sec, start: () => `top ${headerH()}`, end: '+=210%', pin: true, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (self) => {
            const i = Math.min(buttons.length - 1, Math.floor(self.progress * buttons.length * 0.999));
            if (i !== current) { current = i; buttons[i].click(); }
            if (bar) bar.style.transform = `scaleX(${self.progress})`;
            const local = (self.progress * buttons.length) % 1;
            const img = $('img', panels[current]);
            if (img) img.style.transform = `scale(${1.02 + local * 0.06})`;
          },
        });
        if (current !== 0) { current = 0; buttons[0].click(); }
        // A person's click moves the page to that room's stretch of the story.
        buttons.forEach((b, i) => b.addEventListener('click', (e) => {
          if (!e.isTrusted) return;
          const y = st.start + (st.end - st.start) * ((i + 0.5) / buttons.length);
          scrollTo({ top: y, behavior: 'smooth' });
        }));
      }

      // ---- home: dates flip like an arrivals board -------------------------------------------
      function events() {
        const sec = $('.a-events');
        if (!sec) return;
        calm($$('[data-reveal]', sec));
        const rows = $$('.a-event:not([hidden])', sec);
        gsap.from(rows, { x: 90, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: $('.a-event-list', sec), start: 'top 82%', once: true } });
        rows.forEach((row, n) => flip($('.a-event-date strong', row), 0.12 + n * 0.07, $('.a-event-list', sec)));
        gsap.fromTo($('.a-events-photo', sec), { y: 70, rotate: -4 }, { y: -50, rotate: -0.5, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
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

      // ---- home: the address and the hours card ---------------------------------------------
      function visitBand() {
        const card = $('.a-visit .a-hours');
        if (!card) return;
        calm([card]);
        gsap.from(card, { rotateX: -70, y: 40, opacity: 0, transformOrigin: '50% 0%', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 85%', once: true } });
        gsap.from($$('tr', card), { x: 24, opacity: 0, stagger: 0.05, duration: 0.6, ease: 'power3.out', delay: 0.25, scrollTrigger: { trigger: card, start: 'top 85%', once: true } });
      }

      // ---- every page: the forest grows up into the footer -----------------------------------
      function footerForest() {
        const trees = $('.a-footer-trees');
        if (!trees) return;
        const range = { trigger: '.a-footer', start: 'top bottom', end: 'top 35%', scrub: 0.8 };
        gsap.fromTo('.a-tree-back', { yPercent: 70 }, { yPercent: 0, ease: 'none', scrollTrigger: range });
        gsap.fromTo('.a-tree-front', { yPercent: 40 }, { yPercent: 0, ease: 'none', scrollTrigger: range });
        const line = $('.a-footer-line');
        if (line) gsap.from(split(line, 'words,chars').chars, { yPercent: 100, opacity: 0, stagger: 0.015, duration: 0.7, ease: 'expo.out', scrollTrigger: { trigger: line, start: 'top 92%', once: true } });
      }

      // ---- menu: prints fan out, spots drop in, cans pop up ----------------------------------
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

      // ---- what's on: a slow push into the night ---------------------------------------------
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

      // ---- visit: the deck comes closer, the card slides in ----------------------------------
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
        glass.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
      }
    });
  }
})();
