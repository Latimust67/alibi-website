import { picture, btn, arrowLink, eyebrow, ext, esc } from './components.mjs';
import { upcoming, miniRow, closureNotice } from './event-rows.mjs';
import { todayStrip, isFresh } from './hero-today.mjs';
import { desktopDrinks } from './desktop-experiences.mjs';
import { cornerScene, deckScene, carouselHero } from './scene-composition.mjs';
export const homeHead=()=>'<link rel="stylesheet" href="/assets/desktop-experiences.css"><link rel="stylesheet" href="/assets/scene-composition.css"><link rel="stylesheet" href="/assets/home-scroll-story.css"><script src="/assets/desktop-experiences.js" defer></script><script src="/assets/vendor/gsap.min.js" defer></script><script src="/assets/vendor/ScrollTrigger.min.js" defer></script><script src="/assets/home-scroll-story.js" defer></script>';
const art=(file,cls='')=>`<img class="${cls}" src="/assets/art/${file}" alt="" aria-hidden="true">`;
export function home({site,events,today}) {
 const L=site.links;
 const fresh=isFresh(events.checked,today,events.staleAfterDays||14);
 const next=upcoming(events.events,today).filter(e=>!['closure','cancelled'].includes(e.status)&&isFresh(e.checked,today,events.staleAfterDays||14));
 const closed=events.events.filter(e=>e.status==='closure').map(e=>closureNotice(e,today)).join('');
 return `<section class="at-table" aria-labelledby="home-title">
  <div class="at-table-art" aria-hidden="true"><picture><source media="(max-width: 700px)" srcset="/assets/art/at-table-clean-1000.webp"><img src="/assets/art/at-table-clean.webp" width="1672" height="941" alt="" fetchpriority="high" loading="eager"></picture></div>
  <div class="at-table-copy"><h1 id="home-title">Find your Alibi.</h1><p class="at-table-lead">Pizza, house beer, and good company in Incline Village.</p><div class="actions">${btn('/menu/','See the menu')}${btn('/visit/','Plan a visit',{variant:'secondary'})}</div><p class="at-table-address"><a href="/visit/">931 Tahoe Blvd. · Incline Village</a></p></div>
  <a class="at-table-cue" href="#share">See what’s cooking <span aria-hidden="true">↓</span></a>
</section>
<div class="table-practical container">${todayStrip({site,events,today,includeAddress:false})}</div>
<section id="share" class="kitchen-story" aria-labelledby="meal-title">
 <div class="kitchen-stage"><div class="container kitchen-layout">
  <figure class="kitchen-figure"><div class="kitchen-window">
   <div class="kitchen-photo">${picture('pizza-and-pints',{alt:'Alibi pizzas and two branded pints on a shared timber table.',sizes:'(min-width: 1000px) 57vw, 100vw',max:1400,eager:true})}</div>
   <svg class="plate-rim" viewBox="0 0 400 400" fill="none" aria-hidden="true" focusable="false"><g class="plate-turn"><circle class="plate-trace" cx="200" cy="200" r="184" pathLength="1"/><circle class="plate-inner" cx="200" cy="200" r="176"/><circle class="plate-dash" cx="200" cy="200" r="190"/><g class="plate-sprig" transform="translate(200 18)"><path d="M-28 14 Q0 26 30 13 M-18 18L-22 4M-12 20L-8 7M-3 21L0 6M6 20L12 7M17 18L23 4 M-18 18L-27 27M-6 21L-11 32M6 20L9 31M18 17L26 26"/></g></g></svg>
  </div><figcaption>Pizza and pints at Alibi.</figcaption></figure>
  <div class="kitchen-copy"><p class="eyebrow">FROM THE KITCHEN</p><h2 id="meal-title">Something<br>good to <em>share.</em></h2><p>Sourdough pizza and pub favorites for the table.</p><div class="actions">${btn('/menu/#food','See the food menu',{iconName:'arrow-right'})}${ext(L.order,'Order pickup')}</div><p class="pizza-story"><a href="https://alibialeworks.com/2024/02/26/alibis-new-pizza-program-in-incline-village-lake-tahoe/" target="_blank" rel="noopener">The story behind our sourdough pizza <span aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a></p></div>
 </div></div>
 <div class="container kitchen-details"><p class="kitchen-aside">More from<br><em>the kitchen.</em></p><a class="kitchen-detail" href="/menu/#snacks">${picture('food-bao',{alt:'Three pork belly bao with pickled vegetables on an Alibi plate.',sizes:'(min-width: 1000px) 27vw, 45vw',max:800})}<span>Pork Belly Bao <b aria-hidden="true">↗</b></span></a><a class="kitchen-detail" href="/menu/#greens">${picture('food-salad',{alt:'Garden salad with greens and colorful vegetables.',sizes:'(min-width: 1000px) 27vw, 45vw',max:800})}<span>Garden Salad <b aria-hidden="true">↗</b></span></a></div>
</section>
${cornerScene()}
<section class="home-spaces section" aria-labelledby="spaces-title"><div class="container seat-layout" data-seats><div class="seat-copy"><p class="eyebrow">THREE WAYS TO SETTLE IN</p><h2 id="spaces-title">Find your<br>kind of <em>corner.</em></h2><p>Inside, on the deck, or among the pines.</p><div class="seat-controls" aria-label="Choose a seating area">${['Inside','The deck','Beer Forest'].map((name,i)=>`<button type="button" data-seat="${i}" aria-pressed="${i===0}"><span>0${i+1}</span>${name}<b aria-hidden="true">↗</b></button>`).join('')}</div>${arrowLink('/visit/#spaces','Seating and house details')}</div><div class="seat-panels">${[
 ['dining-hall','Inside','Timber beams, shared tables and booths.'],
 ['deck','The deck','A heated deck, when the weather allows.'],
 ['forest-guests','Beer Forest','Our landscaped garden in the warmer months. Leashed dogs are welcome here and on the lower patio.']
 ].map(([key,name,note],i)=>`<figure class="seat-panel" data-seat-panel="${i}">${picture(key,{alt:`${name} at Alibi Incline Public House.`,sizes:'(min-width: 1000px) 56vw, 100vw',max:1200})}<figcaption><strong>${name}</strong><span>${note}</span></figcaption></figure>`).join('')}</div></div></section>
${deckScene({site,events,today})}
<section class="home-events section"><div class="container event-layout"><figure class="company-photo">${picture('friends-dining',{alt:'Friends sharing food and pints at a timber table inside Alibi.',sizes:'(min-width: 1000px) 44vw, 100vw',max:1200})}<figcaption>Around the table at Alibi.</figcaption><svg class="string-lights" viewBox="0 0 600 90" aria-hidden="true"><path d="M0 8Q290 145 600 8"/>${[60,160,260,360,460,550].map((x,i)=>`<path d="M${x} ${[31,56,72,69,49,24][i]}v14"/><ellipse cx="${x}" cy="${[31,56,72,69,49,24][i]+20}" rx="5" ry="8"/>`).join('')}</svg></figure><div class="event-copy"><h2>Good company.<br>Good <em>plans.</em></h2><p>See what’s coming up at the Public House.</p>${closed}<div data-event-list data-checked="${events.checked}" data-stale-days="${events.staleAfterDays||14}" data-limit="3"><ol class="mini-events">${fresh?next.map(miniRow).join(''):''}</ol><p class="event-fallback"${fresh&&next.length?' hidden':''}>See Alibi’s calendar for current events.</p></div><div class="actions">${arrowLink('/whats-on/',"See what's on")}${ext(L.events,'View Alibi’s calendar')}</div></div></div></section>
<section class="home-beer section"><div class="container beer-layout"><div class="can-still"><div class="can-group">${[['can-kolsch','Kölsch'],['can-ipa','IPA'],['can-porter','Porter']].map(([key,name])=>`<figure>${picture(key,{alt:`Alibi ${name} can.`,sizes:'(min-width: 1000px) 170px, 28vw',max:480})}<figcaption>${name}</figcaption></figure>`).join('')}</div><svg class="table-line" viewBox="0 0 680 40" aria-hidden="true"><path d="M5 20Q140 1 310 17T675 11M30 28Q320 42 650 24"/></svg></div><div class="beer-copy"><h2>Made by Alibi.<br>Best with <em>company.</em></h2><p>Get to know our beers. Ask what’s on tap when you visit.</p><div class="actions">${btn('/menu/#drinks','See the drinks menu',{iconName:'arrow-right'})}${ext(L.beers,'Meet our beers')}</div></div></div></section>
${desktopDrinks({site})}
${carouselHero()}
<section class="home-visit section"><div class="container final-layout"><div><h2>Come on <em>over.</em></h2><p class="visit-address">931 Tahoe Blvd.<br>Incline Village, NV 89451</p>${todayStrip({site,events,today,includeAddress:false})}<div class="actions">${btn(L.directions,'Get directions',{external:true})}${arrowLink('/visit/','Plan a visit')}</div></div>${art('closing-fragment.webp','closing-art')}</div></section>
`;
}
