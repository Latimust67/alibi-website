import { esc, icon, btn, ext } from './components.mjs';
import { readFileSync } from 'node:fs';
const approved=JSON.parse(readFileSync(new URL('../data/house-copy.json',import.meta.url),'utf8'));

// Recovered from incline-demo: label-inspired paintings, untouched official cans,
// and the Public House photo string. A blank first source prevents mobile downloads.
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const originalWorlds = [
  { id: 'kolsch', name: 'Kölsch', notes: ['Crisp', 'Bright', 'Quenching'], line: 'A Sand Harbor afternoon: warm granite, clear shallows, sun on everything.', alt: 'Alibi Kölsch can with orange and sand-colored mountains.' },
  { id: 'ipa', name: 'Alibi IPA', notes: ['Melon', 'Pine sap', 'Passion fruit'], line: 'A grove where the pines drip sap and the boulders are cut melon.', abv: '6.2%', alt: 'Alibi IPA can with sky-blue mountains.' },
  { id: 'lager', name: 'Lager', notes: ['Helles', 'Crisp', 'Refreshing'], line: 'Golden hour on a still lake: striped pines, a pale sun and the water going quiet.', alt: 'Alibi Lager can with a gold sun setting over water.' },
  { id: 'pale-ale', name: 'Pale Ale', notes: ['Citrusy', 'Tropical', 'Refreshing'], line: 'A breezy cove where the sun is an orange slice and the boats never hurry.', abv: '5%', alt: 'Alibi Pale Ale can with teal mountains.' },
  { id: 'contradiction', name: 'Contradiction', notes: ['Golden', 'Mocha', 'Stout'], qualification: 'Contains lactose.', line: 'A golden beer that tastes of coffee and chocolate: a sunrise in a cup.', abv: '6%', alt: 'Alibi Contradiction can with a coffee cup and golden sun rays.' },
  { id: 'porter', name: 'Porter', notes: ['Toasty', 'Chocolaty', 'Nutty'], line: 'Late at the fire: a half moon over the lake, a camp mug and a handful of hazelnuts.', alt: 'Alibi Porter can with purple night-sky mountains.' },
];
const worlds=originalWorlds.map(world=>{
  const copy=approved.beers.items.find(item=>item.id===world.id);
  return {...world,name:copy.name,notes:[copy.style],line:copy.line,abv:undefined};
});
const prints = [
  { key: 'deck-crowd', caption: 'A full deck', drop: .7, rotation: 1.2, phase: -2.6, alt: 'Groups at long high-top tables on a sunny deck beneath the pines.' },
  { key: 'patio-cheers', caption: 'Cheers on the patio', drop: .6, rotation: .8, phase: -2.2, alt: 'Four friends raising Alibi pint glasses on the patio.' },
  { key: 'logo-wall', caption: 'Pints at the pub', drop: .35, rotation: -1.4, phase: -.4, alt: 'Two friends laughing and raising Alibi pints in front of the taproom logo.' },
  { key: 'friends-dining', caption: 'By the window', drop: .8, rotation: 1, phase: -1.9, alt: 'Four friends sharing food and pints at a wooden table by the window.' },
  { key: 'music-indoor', caption: 'Live music, indoors', drop: 1, rotation: -.6, phase: -1.1, alt: 'A costumed band playing indoors beneath the timber beams.' },
  { key: 'tap-pour', caption: 'At the bar', drop: .45, rotation: -.9, phase: -1.5, alt: 'A bartender pulling an Alibi pint from a stainless tap.' },
  { key: 'sandwich-pint', caption: 'A sandwich and a pint', drop: .3, rotation: -1, phase: -.8, alt: 'A chicken sandwich and salad on a timber table beside an Alibi pint.' },
];

function desktopPicture(key, { alt = '', widths, width, height, sizes }) {
  const src = (w, format) => `/assets/img/desktop-${key}-${w}.${format}`;
  const set = format => widths.map(w => `${src(w, format)} ${w}w`).join(', ');
  return `<picture><source media="(max-width: 999px)" srcset="${BLANK}"><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><source type="image/webp" srcset="${set('webp')}" sizes="${sizes}"><img src="${src(widths[0], 'webp')}" alt="${esc(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async"></picture>`;
}

export function desktopDrinks({ site }) {
  return `<section class="desktop-experience desktop-drinks" aria-labelledby="desktop-drinks-title">
    <div class="desktop-drinks-intro container"><div><h2 id="desktop-drinks-title">${approved.beers.heading}</h2></div><div class="desktop-drinks-lead"><p>${approved.beers.line}</p>${btn('/menu/#drinks',approved.beers.action)}<p class="fine">Illustrations inspired by Alibi’s labels.</p><span class="desktop-drinks-cue" aria-hidden="true">${icon('arrow-down')}</span></div></div>
    <ol class="desktop-worlds" aria-label="Six Alibi beers">
      ${worlds.map((world, i) => `<li class="desktop-world desktop-world-${world.id}" style="--world-index:${i}">
        <div class="desktop-world-art" aria-hidden="true">${desktopPicture(`scene-${world.id}-wide`, { widths: [960, 1536], width: 1536, height: 1024, sizes: '100vw' })}</div>
        <div class="desktop-world-copy"><p class="desktop-world-count">${String(i + 1).padStart(2, '0')} <span>/ 06 · ALIBI ALE WORKS</span></p><h3 style="--name-length:${world.name.length}">${world.name}</h3><ul class="desktop-world-notes" aria-label="Beer style">${world.notes.map(note => `<li>${esc(note)}</li>`).join('')}</ul><p class="desktop-world-line">${esc(world.line)}</p>${world.abv ? `<p class="desktop-world-abv">${world.abv} ABV</p>` : ''}${world.qualification ? `<p class="desktop-world-abv">${esc(world.qualification)}</p>` : ''}${btn('/menu/#drinks', `${approved.beers.action}<span class="sr-only">: ${world.name}</span>`, { iconName: 'arrow-right' })}</div>
        <div class="desktop-world-can">${desktopPicture(`can-${world.id}`, { alt: world.alt, widths: [360, 640], width: 740, height: 1834, sizes: 'min(23vw, 300px)' })}</div>
      </li>`).join('')}
    </ol>
    <div class="desktop-drinks-outro container"><p>Beer, cocktails, wine and non-alcoholic drinks.</p>${ext(site.links.officialMenu, 'Open the full menu')}${btn('/menu/#drinks', 'See the beer menu', { iconName: 'arrow-right' })}</div>
  </section>`;
}

function printRow(copy = false) {
  const bulbs = Array.from({ length: prints.length * 4 }, (_, i) => `<span class="desktop-bulb" style="--bulb-x:${(i + .5) / (prints.length * 4)}"></span>`).join('');
  return `<ul class="desktop-prints-row"${copy ? ' aria-hidden="true" inert' : ''}><li class="desktop-prints-bulbs" aria-hidden="true">${bulbs}</li>${prints.map(print => `<li class="desktop-print" style="--drop:${print.drop};--rotation:${print.rotation}deg;--phase:${print.phase}s"><span class="desktop-print-peg" aria-hidden="true"></span><figure>${desktopPicture(print.key, { alt: copy ? '' : print.alt, widths: print.key === 'patio-cheers' ? [640, 960] : [480, 800], width: 800, height: 1000, sizes: 'min(17vw, 250px)' })}<figcaption>${print.caption}</figcaption></figure></li>`).join('')}</ul>`;
}

export function photoRope({ id = 'desktop-prints', label = 'Photos from the Public House' } = {}) {
  const hintId = `${id}-hint`;
  return `<div class="desktop-prints" id="${esc(id)}" role="region" aria-label="${esc(label)}" aria-describedby="${esc(hintId)}" tabindex="0"><p class="sr-only" data-prints-hint id="${esc(hintId)}">Scroll sideways to see photos from the Public House.</p><svg class="desktop-prints-rope" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 0 Q500 200 1000 0"/><path class="desktop-prints-rope-highlight" d="M0 0 Q500 200 1000 0"/></svg><div class="desktop-prints-controls"><button type="button" data-prints-previous aria-label="Previous photo">←</button><button type="button" data-prints-toggle aria-pressed="false" aria-label="Pause photos">${icon('pause')}<span>Pause photos</span></button><button type="button" data-prints-next aria-label="Next photo">→</button></div><div class="desktop-prints-track">${printRow()}${printRow(true)}${printRow(true)}</div></div>`;
}
