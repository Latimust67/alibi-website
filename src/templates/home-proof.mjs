import { readFileSync } from 'node:fs';
import {closure} from './house-components.mjs';
import { picture, esc } from './components.mjs';
import { desktopDrinks, photoRope } from './desktop-experiences.mjs';
const copy=JSON.parse(readFileSync(new URL('../data/house-copy.json',import.meta.url),'utf8'));
const link=(href,text,cls='')=>`<a class="house-link ${cls}" href="${href}">${text}<span aria-hidden="true">↗</span></a>`;
const image=(key,alt,sizes='100vw',max=1400,eager=false)=>picture(key,{alt,sizes,max,eager,priority:eager});
export const homeHead=()=>'<link rel="stylesheet" href="/assets/desktop-experiences.css"><link rel="stylesheet" href="/assets/house-story.css"><script src="/assets/desktop-experiences.js" defer></script><script src="/assets/vendor/gsap.min.js" defer></script><script src="/assets/vendor/ScrollTrigger.min.js" defer></script><script src="/assets/sign-sequence.js" defer></script><script src="/assets/house-story.js" defer></script>';
export function home({site,today}){
 return `<div class="house-home">
 ${closure(today)}
 <section class="house-arrival" aria-labelledby="home-title" data-arrival>
  <h1 class="sr-only" id="home-title">${copy.hero.heading}</h1>
  <div class="arrival-stage"><div class="arrival-intro">
   <div class="arrival-room">${image('dining-hall','The timber-beamed dining room and shared tables at Alibi Incline Public House.','100vw',1920,true)}</div>
   <div class="arrival-sign-stage" aria-hidden="true"><div class="sign-frame"><picture class="sign-poster"><source media="(min-width:1000px)" srcset="/assets/art/sign/poster-desktop.webp"><img src="/assets/art/sign/poster-phone.webp" width="1440" height="900" alt="" loading="eager" decoding="async"></picture><canvas class="sign-sequence" data-frames="61" hidden></canvas></div></div>
   <div class="arrival-caption"><p>${copy.hero.descriptor}</p><span>${copy.hero.location}</span><div class="arrival-actions">${link('/menu/',copy.hero.primary,'house-link-filled')}${link('/visit/',copy.hero.secondary)}</div></div>
   </div>
   <section class="arrival-meal" id="food" aria-labelledby="food-title">
    <figure class="food-table" data-meal>${image('pizza-and-pints','Pizza and two Alibi pints on a wooden table.','100vw',1920)}</figure>
    <div class="arrival-food-copy"><h2 id="food-title">From the<br>Incline kitchen</h2><p>${copy.food.line}</p>${link('/menu/#food',copy.food.action)}</div>
   </section>
  </div>
 </section>
 <section class="house-food" aria-labelledby="food-title">
  <div class="food-composition">
   <figure class="food-pour">${image('tap-pour','A bartender pouring an Alibi pint.','(min-width:1000px) 25vw, 45vw',800)}</figure>
   <a class="food-bao" href="/menu/#snacks">${image('food-bao','Three pork belly bao with pickled vegetables.','(min-width:1000px) 43vw, 75vw',1200)}<span>${copy.food.labels[1]} <b aria-hidden="true">↗</b></span></a>
   <a class="food-salad" href="/menu/#greens">${image('food-salad','A salad with greens and colorful vegetables.','(min-width:1000px) 28vw, 62vw',800)}<span>${copy.food.labels[2]} <b aria-hidden="true">↗</b></span></a>
   
  </div>
 </section>
 <section class="house-places" id="places" aria-labelledby="places-title" data-seats data-seat-default="1">
  <div class="places-heading"><h2 id="places-title">Inside or outside?</h2><p>${copy.places.qualification}</p></div>
  <div class="places-stage">
   <div class="places-panels">${copy.places.items.map((p,i)=>`<figure data-seat-panel="${i}">${image(p.key,p.text+' at Alibi Incline Public House.','100vw',1920)}<figcaption>${p.text}</figcaption></figure>`).join('')}</div>
   <div class="places-controls">${copy.places.items.map((p,i)=>`<button type="button" data-seat="${i}" aria-label="${p.accessible}" aria-pressed="${i===1}"><span>${p.name}</span><span aria-hidden="true">↗</span></button>`).join('')}</div>
  </div>
 </section>
 <section class="house-evening" aria-labelledby="evening-title"><figure>${image('music-night','Live music at Alibi Incline Public House','(min-width:1000px) 100vw, 190vw',1400)}</figure><div><h2 id="evening-title">What's on<br>at Incline</h2>${link('/whats-on/',copy.events.action)}</div></section>
 ${desktopDrinks({site})}
 <section class="house-mobile-beers" aria-labelledby="mobile-beers-title"><div><h2 id="mobile-beers-title">${copy.beers.heading}</h2><p>${copy.beers.line}</p></div><ol>${copy.beers.items.map(b=>`<li><img src="/assets/img/desktop-can-${b.id}-360.webp" width="360" height="892" loading="lazy" decoding="async" alt="${esc(b.name)} can"><div><h3>${esc(b.name)}</h3><p>${b.style}</p><span>${b.line}</span>${b.id==='contradiction'?'<span class="beer-qualification">Contains lactose.</span>':''}</div></li>`).join('')}</ol>${link('/menu/#drinks',copy.beers.action)}</section>
 <section class="house-company desktop-experience" aria-labelledby="company-title"><h2 id="company-title">${copy.gallery.heading}</h2>${photoRope({id:'company-rope',label:copy.gallery.heading})}<p class="company-instruction">${copy.gallery.instruction}</p></section>
 <section class="house-mobile-company" aria-labelledby="mobile-company-title"><h2 id="mobile-company-title">${copy.gallery.heading}</h2><figure>${image('friends-dining','Friends sharing food and pints by a window at Alibi.','85vw',800)}</figure><figure>${image('forest-guests','Guests seated among plants and pines in the Beer Forest.','85vw',800)}</figure></section>
 <section class="house-visit" aria-labelledby="visit-title"><div><h2 id="visit-title">931 Tahoe Boulevard</h2><p>${copy.visit.location}</p><div class="visit-actions">${link(site.links.directions,copy.visit.primary,'house-link-filled')}${link('tel:'+site.phone.tel,copy.visit.secondary)}</div><p class="visit-phone">${site.phone.display}</p></div></section>
 </div>`;
}
