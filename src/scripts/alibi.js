// Presentation enhancements for the October 2026 redesign. Content is complete
// without this file: it only adds entrances, header state and menu wayfinding.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // Header gains a hairline once the page moves.
  const header = document.querySelector('[data-header]');
  if (header && 'IntersectionObserver' in window) {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:12px;pointer-events:none';
    document.body.prepend(sentinel);
    new IntersectionObserver(([e]) => header.classList.toggle('is-scrolled', !e.isIntersecting)).observe(sentinel);
  }

  // Home arrival: the headline rises in once the first frame has painted.
  const hero = document.querySelector('[data-hero]');
  if (hero) requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-ready')));

  // Scroll entrances. Siblings that arrive together are staggered slightly.
  const items = [...document.querySelectorAll('[data-reveal]')];
  if (!('IntersectionObserver' in window) || reduce.matches) items.forEach((el) => el.classList.add('is-in'));
  else {
    const io = new IntersectionObserver((entries) => {
      let n = 0;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.style.setProperty('--d', `${Math.min(n++, 3) * 45}ms`);
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
    items.forEach((el) => io.observe(el));
  }

  // String lights switch on when their section comes into view: the festoon
  // over What's on, and the strands in the closing forest.
  const lamps = [[document.querySelector('.a-events--night'), document.querySelector('.a-festoon'), 0.9], [document.querySelector('.a-closing'), document.querySelector('.a-closing'), 0.5]];
  for (const [host, watch, threshold] of lamps) {
    if (!host || !watch) continue;
    if (!('IntersectionObserver' in window)) { host.classList.add('is-lit'); continue; }
    const lit = new IntersectionObserver(([e]) => { if (e.isIntersecting) { host.classList.add('is-lit'); lit.disconnect(); } }, { threshold });
    lit.observe(watch);
  }

  // Footer: a warm light drifts after the pointer across the big name (eased,
  // so it trails like a lamp being carried rather than snapping to the cursor).
  const word = document.querySelector('.a-giant-word');
  if (word && matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce.matches) {
    const area = word.closest('.a-footer-body');
    const at = { x: 0, y: -400 }, to = { x: 0, y: -400 };
    let raf = 0;
    const step = () => {
      at.x += (to.x - at.x) * 0.14; at.y += (to.y - at.y) * 0.14;
      word.style.setProperty('--mx', `${at.x.toFixed(1)}px`);
      word.style.setProperty('--my', `${at.y.toFixed(1)}px`);
      raf = Math.abs(to.x - at.x) + Math.abs(to.y - at.y) > 0.5 ? requestAnimationFrame(step) : 0;
    };
    const go = () => { if (!raf) raf = requestAnimationFrame(step); };
    area.addEventListener('pointermove', (e) => { const r = word.getBoundingClientRect(); to.x = e.clientX - r.left; to.y = e.clientY - r.top; go(); }, { passive: true });
    area.addEventListener('pointerleave', () => { to.y = -400; go(); });
  }

  // Menu wayfinding: mark the last section whose top has passed a line a third
  // of the way down the screen (none above the first), and keep the phone
  // rail's active pill in view without moving the page.
  const rail = document.querySelector('[data-menu-rail]');
  if (rail) {
    const links = [...rail.querySelectorAll('[data-rail-link]')];
    const pairs = links.map((a) => [a, document.getElementById(a.getAttribute('href').slice(1))]).filter(([, t]) => t);
    const scroller = rail.querySelector('.a-menu-rail-in');
    let frame = 0, active = null;
    const update = () => {
      frame = 0;
      const line = innerHeight * 0.34;
      let current = null;
      for (const [a, t] of pairs) if (t.getBoundingClientRect().top <= line) current = a;
      if (current === active) return;
      active?.removeAttribute('aria-current');
      active = current;
      if (!current) return;
      current.setAttribute('aria-current', 'location');
      if (scroller.scrollWidth > scroller.clientWidth) {
        const left = current.offsetLeft - (scroller.clientWidth - current.offsetWidth) / 2;
        scroller.scrollTo({ left, behavior: reduce.matches ? 'auto' : 'smooth' });
      }
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(update); };
    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', request, { passive: true });
    update();
  }
})();
