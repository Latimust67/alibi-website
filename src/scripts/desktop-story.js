// Slightly settle the printed photographs as their sections pass through view.
// The Home journey has a separate owner. This controller serves inner routes.
(() => {
  const desktop = matchMedia('(min-width: 1000px) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let dispose = () => {};
  function sync() {
    dispose();
    dispose = () => {};
    if (!desktop.matches || reduced.matches || !('ResizeObserver' in window)) return;
    const candidates = [
      ...document.querySelectorAll('.route-hero-media'),
    ];
    if (!candidates.length) return;
    let frame = 0;
    let geometry = [];
    const measure = () => {
      geometry = candidates.map((element, i) => {
        const box = element.getBoundingClientRect();
        return { element, top: box.top + scrollY, height: box.height, tilt: element.classList.contains('company-photo') ? -3 : i % 2 ? 3 : -2 };
      });
      request();
    };
    const paint = () => {
      frame = 0;
      if (document.hidden) return;
      for (const { element, top, height, tilt } of geometry) {
        const progress = Math.max(0, Math.min(1, (scrollY + innerHeight - top) / (innerHeight + height)));
        element.style.transform = `translate3d(0,${(1 - progress) * 18}px,0) rotate(${tilt * (1 - progress * .85)}deg)`;
      }
    };
    const request = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(paint); };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    document.addEventListener('visibilitychange', request);
    const observer = new ResizeObserver(measure);
    candidates.forEach(element => observer.observe(element));
    measure();
    dispose = () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', measure);
      document.removeEventListener('visibilitychange', request);
      candidates.forEach(element => element.style.removeProperty('transform'));
    };
  }
  desktop.addEventListener('change', sync);
  reduced.addEventListener('change', sync);
  window.addEventListener('pagehide', () => dispose());
  window.addEventListener('pageshow', sync);
  sync();
})();
