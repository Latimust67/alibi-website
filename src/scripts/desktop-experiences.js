// The original six can worlds and sagging photo string, isolated to desktop.
(() => {
  const desktop = matchMedia('(min-width: 1000px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let dispose;

  function enhance() {
    const cleanups = [];
    const listen = (target, event, handler, options) => {
      target.addEventListener(event, handler, options);
      cleanups.push(() => target.removeEventListener(event, handler, options));
    };
    const worlds = [...document.querySelectorAll('.desktop-world')];
    if (worlds.length && 'ResizeObserver' in window && 'IntersectionObserver' in window) {
      const resize = new ResizeObserver(entries => entries.forEach(({ target }) => target.style.setProperty('--world-height', `${target.offsetHeight}px`)));
      const arrival = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-inview'); arrival.unobserve(entry.target); }
      }), { threshold: .3 });
      worlds.forEach(world => { resize.observe(world); arrival.observe(world); });
      // Make a keyboard-focused action visible even when another sticky panel covers it.
      listen(worlds[0].parentElement, 'focusin', event => {
        const world = event.target.closest('.desktop-world');
        if (!world || !event.target.matches(':focus-visible') || reduced.matches) return;
        const top = parseFloat(getComputedStyle(world).top) || 0;
        let y = worlds[0].parentElement.getBoundingClientRect().top + scrollY;
        for (const previous of worlds) { if (previous === world) break; y += previous.offsetHeight; }
        scrollTo({ top: y - top, behavior: 'auto' });
      });
      cleanups.push(() => { resize.disconnect(); arrival.disconnect(); worlds.forEach(world => world.style.removeProperty('--world-height')); });
    }

    if ('ResizeObserver' in window && 'IntersectionObserver' in window) {
      document.querySelectorAll('.desktop-prints').forEach(gallery => cleanups.push(enhanceGallery(gallery)));
    }
    return () => cleanups.forEach(cleanup => cleanup());
  }

  function enhanceGallery(gallery) {
    const cleanups = [];
    const listen = (target, event, handler, options) => {
      target.addEventListener(event, handler, options);
      cleanups.push(() => target.removeEventListener(event, handler, options));
    };
    const rope = gallery.querySelector('.desktop-prints-rope');
    const paths = [...rope.querySelectorAll('path')];
    const originalPaths = paths.map(path => path.getAttribute('d'));
    const photos = [...gallery.querySelectorAll('.desktop-print')];
    const bulbs = [...gallery.querySelectorAll('.desktop-bulb')];
    const runs = gallery.querySelectorAll('.desktop-prints-row').length;
    const perRun = photos.length / runs;
    const toggle = gallery.querySelector('[data-prints-toggle]');
    const hint = gallery.querySelector('[data-prints-hint]');
    const originalToggleLabel = toggle.getAttribute('aria-label');
    let width = 0, sag = 0, top = 0, step = 0, length = 0;
    let offset = 0, targetOffset = null, velocity = 0, last = 0, raf = 0;
    let swayTime = 0;
    let paused = false, visible = false, active = true, drag = null;
    let rotations = [], durations = [], phases = [];
    const keyboardFocused = () => gallery.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
    const wrap = value => ((value % length) + length) % length;
    const curve = x => {
      const u = Math.max(0, Math.min(1, x / width));
      return top + 4 * sag * u * (1 - u);
    };
    const ambient = () => !paused && !keyboardFocused() && !drag?.live && !reduced.matches && !document.hidden;
    gallery.classList.add('is-live', 'is-offscreen');
    gallery.setAttribute('aria-describedby', hint.id);
    hint.textContent = 'Photos move automatically. Drag, use the arrow keys, or choose Previous or Next to browse. Choose Pause to stop the movement.';
    toggle.setAttribute('aria-label', 'Pause moving photos');
    paths.forEach(path => path.setAttribute('d', 'M0 0 Q500 200 1000 0'));

    function place() {
      if (!length || !width) return;
      // Bulbs and prints travel along the same fixed sagging rope.
      photos.forEach((photo, i) => {
        const x = wrap((i + .5) * step + offset) - step;
        const sway = -.8 * Math.cos((swayTime - phases[i]) * Math.PI / durations[i]);
        const rotation = rotations[i] + (reduced.matches ? 0 : sway);
        photo.style.translate = `${x.toFixed(2)}px ${curve(x).toFixed(2)}px`;
        // CSS sets transform-origin to the rope attachment, above the full cord.
        photo.style.rotate = `${rotation.toFixed(3)}deg`;
      });
      bulbs.forEach((bulb, i) => {
        const x = wrap((i + .5) * length / bulbs.length + offset) - step;
        bulb.style.translate = `${x.toFixed(2)}px ${curve(x).toFixed(2)}px`;
      });
    }
    function measure() {
      if (!desktop.matches || !active) return;
      const previousStep = step;
      width = gallery.clientWidth;
      const bounds = rope.getBoundingClientRect();
      sag = bounds.height;
      top = bounds.top - gallery.getBoundingClientRect().top;
      const photoWidth = photos[0].offsetWidth;
      const spacing = parseFloat(getComputedStyle(photos[0]).getPropertyValue('--print-spacing')) || 1.4;
      step = Math.max(photoWidth * spacing, (width + photoWidth * 1.15) / perRun);
      length = photos.length * step;
      if (previousStep) {
        const ratio = step / previousStep;
        offset *= ratio;
        velocity *= ratio;
        if (targetOffset !== null) targetOffset *= ratio;
      } else {
        offset = step; // The first original photo starts at +half a step, in view.
      }
      rotations = photos.map(photo => parseFloat(getComputedStyle(photo).getPropertyValue('--rotation')) || 0);
      durations = photos.map(photo => 3.4 + (parseFloat(getComputedStyle(photo).getPropertyValue('--drop')) || 0));
      phases = photos.map(photo => parseFloat(getComputedStyle(photo).getPropertyValue('--phase')) || 0);
      const reach = Math.max(...photos.map(photo => photo.offsetTop + photo.offsetHeight));
      gallery.style.height = `${Math.ceil(top + sag + reach + 66 + photoWidth * .025)}px`;
      place();
    }
    function tick(now) {
      raf = 0;
      if (!active || !desktop.matches || !visible || document.hidden) { last = 0; return; }
      const dt = Math.min(.05, (now - (last || now)) / 1000);
      last = now;
      let moved = false;
      if (ambient()) {
        const drift = 26 * dt;
        offset += drift;
        if (targetOffset !== null) targetOffset += drift;
        swayTime += dt;
        moved = true;
      }
      if (!drag?.live && targetOffset !== null) {
        // Critically damped spring: retargeting keeps velocity continuous.
        const omega = 8, displacement = offset - targetOffset;
        const carry = velocity + omega * displacement;
        const decay = Math.exp(-omega * dt);
        offset = targetOffset + (displacement + carry * dt) * decay;
        velocity = (velocity - omega * carry * dt) * decay;
        if (Math.abs(offset - targetOffset) < .1 && Math.abs(velocity) < .5) {
          offset = targetOffset; targetOffset = null; velocity = 0;
        }
        moved = true;
      } else if (!drag?.live && Math.abs(velocity) > 1) {
        const decay = Math.exp(-5 * dt);
        offset += velocity * (1 - decay) / 5;
        velocity *= decay;
        if (Math.abs(velocity) <= 1) velocity = 0;
        moved = true;
      }
      if (moved) place();
      if (ambient() || targetOffset !== null || Math.abs(velocity) > 1) raf = requestAnimationFrame(tick);
      else last = 0;
    }
    const run = () => { if (!raf && active && visible && !document.hidden && desktop.matches) raf = requestAnimationFrame(tick); };
    function state() {
      if (!active) return;
      gallery.classList.toggle('is-paused', paused || keyboardFocused() || Boolean(drag?.live) || reduced.matches || document.hidden);
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; last = 0; }
      else run();
    }
    function advance(direction) {
      if (reduced.matches) {
        offset += direction * step;
        targetOffset = null; velocity = 0;
        place();
      } else {
        targetOffset = (targetOffset ?? offset) + direction * step;
      }
      state();
    }
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(rope);
    resize.observe(photos[0]);
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      gallery.classList.toggle('is-offscreen', !visible);
      if (!visible) { cancelAnimationFrame(raf); raf = 0; last = 0; }
      else run();
    });
    visibility.observe(gallery);
    listen(reduced, 'change', () => {
      if (targetOffset !== null) offset = targetOffset;
      targetOffset = null; velocity = 0; swayTime = 0;
      place(); state();
    });
    listen(document, 'visibilitychange', state);
    listen(gallery, 'focusin', state);
    listen(gallery, 'focusout', () => queueMicrotask(state));
    listen(gallery.querySelector('[data-prints-previous]'), 'click', () => advance(1));
    listen(gallery.querySelector('[data-prints-next]'), 'click', () => advance(-1));
    listen(toggle, 'click', () => {
      paused = !paused;
      if (paused) { targetOffset = null; velocity = 0; }
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.setAttribute('aria-label', paused ? 'Play moving photos' : 'Pause moving photos');
      toggle.querySelector('span').textContent = paused ? 'Play' : 'Pause';
      toggle.querySelector('svg').innerHTML = paused ? '<path d="M8 5.5v13l10-6.5Z"/>' : '<path d="M9 5.5v13M15 5.5v13"/>';
      state();
    });
    listen(gallery, 'keydown', event => {
      state();
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      event.preventDefault();
      advance(event.key === 'ArrowRight' ? -1 : 1);
    });
    listen(gallery, 'pointerdown', event => {
      queueMicrotask(state);
      if (drag || event.button !== 0 || event.target.closest('button')) return;
      drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: event.clientX, live: false, samples: [{ x: event.clientX, time: event.timeStamp }] };
      targetOffset = null; velocity = 0;
    });
    listen(gallery, 'pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      if (!drag.live) {
        const dx = Math.abs(event.clientX - drag.startX), dy = Math.abs(event.clientY - drag.startY);
        if (dy > 10 && dy >= dx) { drag = null; state(); return; }
        if (dx < 6 || dx <= dy) return;
        drag.live = true;
        gallery.setPointerCapture(event.pointerId);
        gallery.classList.add('is-dragging');
        state();
      }
      offset += event.clientX - drag.x;
      drag.x = event.clientX;
      drag.samples.push({ x: event.clientX, time: event.timeStamp });
      while (drag.samples.length > 2 && event.timeStamp - drag.samples[0].time > 100) drag.samples.shift();
      place();
    });
    const release = event => {
      if (!drag || event.pointerId !== drag.id) return;
      const a = drag.samples[0], b = drag.samples.at(-1);
      const fling = drag.live && a && b && event.type === 'pointerup' && !reduced.matches && event.timeStamp - b.time <= 80 && b.time - a.time >= 16;
      velocity = fling ? Math.max(-600, Math.min(600, (b.x - a.x) / (b.time - a.time) * 1000)) : 0;
      const pointerId = drag.id;
      drag = null;
      if (gallery.hasPointerCapture(pointerId)) gallery.releasePointerCapture(pointerId);
      gallery.classList.remove('is-dragging');
      state();
    };
    listen(window, 'pointerup', release);
    listen(window, 'pointercancel', release);
    listen(gallery, 'lostpointercapture', release);
    state();
    cleanups.push(() => {
      active = false;
      cancelAnimationFrame(raf);
      if (drag && gallery.hasPointerCapture(drag.id)) gallery.releasePointerCapture(drag.id);
      drag = null;
      resize.disconnect(); visibility.disconnect();
      gallery.classList.remove('is-live', 'is-paused', 'is-offscreen', 'is-dragging');
      gallery.style.removeProperty('height');
      photos.forEach(photo => { photo.style.removeProperty('translate'); photo.style.removeProperty('rotate'); });
      bulbs.forEach(bulb => bulb.style.removeProperty('translate'));
      paths.forEach((path, i) => path.setAttribute('d', originalPaths[i]));
      toggle.setAttribute('aria-pressed', 'false');
      if (originalToggleLabel === null) toggle.removeAttribute('aria-label');
      else toggle.setAttribute('aria-label', originalToggleLabel);
      toggle.querySelector('span').textContent = 'Pause';
      toggle.querySelector('svg').innerHTML = '<path d="M9 5.5v13M15 5.5v13"/>';
      hint.textContent = 'Scroll sideways to see photos from the Public House.';
    });
    return () => cleanups.forEach(cleanup => cleanup());
  }
  function sync() { dispose?.(); dispose = desktop.matches ? enhance() : null; }
  desktop.addEventListener('change', sync);
  window.addEventListener('pagehide', () => { dispose?.(); dispose = null; });
  window.addEventListener('pageshow', sync);
  sync();
})();
