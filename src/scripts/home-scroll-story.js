// One owner for the new table → kitchen → corner → deck journey.
// Native document scroll; the existing beer worlds and photo rope are untouched.
(() => {
  const hero = document.querySelector('.at-table');
  if (!hero) return;
  const header = document.querySelector('.site-header');
  const updateHeader = () => header.classList.toggle('is-scrolled', scrollY > 40);
  addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1000px) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    document.documentElement.classList.add('scroll-story-active');
    gsap.to('.at-table-art', { y: -15, scale: 1.018, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    const stage = document.querySelector('.kitchen-stage');
    const photo = document.querySelector('.kitchen-photo');
    const rim = document.querySelector('.plate-rim');
    const trace = document.querySelector('.plate-trace');
    const windowEl = document.querySelector('.kitchen-window');
    const initialRadius = () => 82;
    const fullRadius = () => Math.hypot(windowEl.clientWidth, windowEl.clientHeight) / 2 + 2;
    // The single semantic photograph owns every state, including the final frame.
    const meal = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
      trigger: stage, start: 'top 76px', end: () => '+=' + Math.round(innerHeight * 1.02),
      pin: true, scrub: .32, invalidateOnRefresh: true, anticipatePin: 1
    }});
    meal.fromTo(photo, { clipPath: () => `circle(${initialRadius()}px at 50% 50%)` }, { clipPath: () => `circle(${fullRadius()}px at 50% 50%)`, duration: .69, ease: 'power1.inOut' }, .2)
      .fromTo(trace, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .25 }, 0)
      .fromTo('.plate-inner, .plate-dash, .plate-sprig', { opacity: 0 }, { opacity: 1, duration: .14 }, .08)
      .fromTo(rim, { scale: 1, opacity: 1 }, { scale: () => fullRadius() / initialRadius(), duration: .69, ease: 'power1.inOut' }, .2)
      .fromTo('.plate-turn', { rotation: -50, svgOrigin: '200 200' }, { rotation: 60, duration: .8 }, .08)
      .to(rim, { opacity: 0, duration: .1 }, .77)
      .fromTo('.kitchen-figure figcaption', { opacity: 0 }, { opacity: 1, duration: .1 }, .84)
      .to({}, { duration: .06 });
    // Shallow, distinct movements on the attached dish links, outside the pin.
    gsap.utils.toArray('.kitchen-detail').forEach((el, i) => gsap.fromTo(el,
      { y: 35, rotation: i ? 2 : -2 },
      { y: 0, rotation: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top 94%', end: 'center 65%', scrub: .3 } }));
    const corner = document.querySelector('.corner-reveal');
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: corner, start: 'top 88%', end: 'top 14%', scrub: .35 } })
      .fromTo('.corner-scene-stage', { clipPath: 'inset(0% 11% 0% 11%)', scale: 1.04, y: 22 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, y: 0, duration: 1 }, 0)
      .fromTo('.corner-draw rect', { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .85 }, .1);
    gsap.fromTo('.deck-scene-art', { y: 30, scale: 1.035 }, { y: -5, scale: 1, ease: 'none', scrollTrigger: { trigger: '.deck-experience', start: 'top bottom', end: 'bottom bottom', scrub: .4 } });
    gsap.to('.deck-scene-stage', { '--deck-warmth': .13, ease: 'none', scrollTrigger: { trigger: '.deck-scene-stage', start: 'top 90%', end: 'center 55%', scrub: true } });
    gsap.utils.toArray('.deck-scene-agenda .mini-event').forEach((row, i) => gsap.fromTo(row, { y: 12 }, { y: 0, ease: 'none', scrollTrigger: { trigger: row, start: `top ${92 - i * 3}%`, end: 'top 62%', scrub: true } }));
    return () => document.documentElement.classList.remove('scroll-story-active');
  });
  // Font and image dimensions are reserved; refresh once fonts have settled.
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  const onPageShow = event => { if (event.persisted) { updateHeader(); ScrollTrigger.refresh(); } };
  addEventListener('pageshow', onPageShow);
})();
