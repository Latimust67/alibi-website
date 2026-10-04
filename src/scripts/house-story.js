/* A bounded camera passage, driven only by native document scrolling. */
(() => {
 const root=document.querySelector('.house-home');
 if(!root||!window.gsap||!window.ScrollTrigger)return;
 gsap.registerPlugin(ScrollTrigger);
 const media=gsap.matchMedia();
 let activeSequence;
 media.add('(min-width:1000px) and (prefers-reduced-motion:no-preference)',()=>{
  const arrival=root.querySelector('[data-arrival]');
  if(!arrival)return;
  arrival.classList.add('arrival-enhanced');
  const sequence=window.createAlibiSignSequence?.(root.querySelector('.sign-sequence'),root.querySelector('.sign-poster'));
  activeSequence=sequence;
  const frame={value:0};
  const story=gsap.timeline({scrollTrigger:{trigger:arrival,start:'top top+=76',end:'bottom bottom',scrub:.32,invalidateOnRefresh:true}});
  // Establish the room, then make one deliberate photographic cut. The two
  // native photos have different viewpoints; no intermediate composite pretends otherwise.
  const roomScale=()=>Math.max(1.03,Math.min(1.22,1920/innerWidth));
  story.to(frame,{value:60,ease:'none',duration:.4,onUpdate:()=>sequence?.request(frame.value)},0)
   .to('.sign-poster',{xPercent:-85,scale:1.2,ease:'none',duration:.4},0)
   .to('.arrival-room',{clipPath:'polygon(0% 0%,100% 0%,100% 100%,0% 100%)',ease:'none',duration:.38},0)
   .fromTo('.arrival-room img',{scale:1.06,xPercent:5},{scale:1,xPercent:0,ease:'none',duration:.38},0)
   .to('.arrival-caption',{autoAlpha:0,y:-20,duration:.12},.22)
   .to('.arrival-room img',{scale:roomScale,yPercent:0,transformOrigin:'50% 88%',ease:'power1.in',duration:.24},.43)
   .set('.arrival-meal',{autoAlpha:1},.67)
   .fromTo('.arrival-meal img',{scale:1.035,yPercent:1.5},{scale:1,yPercent:0,ease:'power1.out',duration:.2},.67)
   .fromTo('.arrival-food-copy',{autoAlpha:0,y:14},{autoAlpha:1,y:0,ease:'power1.out',duration:.1},.82)
   .to({}, {duration:.08});
  gsap.fromTo('.food-bao',{y:35},{y:0,ease:'none',scrollTrigger:{trigger:'.food-composition',start:'top 90%',end:'center 55%',scrub:.5}});
  gsap.fromTo('.food-salad',{y:55},{y:0,ease:'none',scrollTrigger:{trigger:'.food-composition',start:'top 75%',end:'bottom 90%',scrub:.5}});
  return()=>{sequence?.dispose();if(activeSequence===sequence)activeSequence=undefined;arrival.classList.remove('arrival-enhanced');};
 });
 document.fonts.ready.then(()=>ScrollTrigger.refresh());
 window.addEventListener('pageshow',()=>ScrollTrigger.refresh());
 // Reverting a GSAP timeline can invoke its frame update. Dispose first so
 // that callback cannot start a new fetch while WebKit unloads the document.
 window.addEventListener('pagehide',event=>{if(!event.persisted){activeSequence?.dispose();media.revert();}});
})();
