// Shared shell for the October 2026 redesign: head, header, exception notice,
// footer and the small markup helpers every page uses.
import { readFileSync } from 'node:fs';
import { esc, picture } from './components.mjs';
import { closures } from './event-rows.mjs';
import { hoursChecked, isFresh } from './hero-today.mjs';

export const copy = JSON.parse(readFileSync(new URL('../data/house-copy.json', import.meta.url), 'utf8'));
const FOOT = JSON.parse(readFileSync(new URL('../data/section-copy.json', import.meta.url), 'utf8')).footer;
const NEW_TAB = '<span class="sr-only"> (opens in a new tab)</span>';
const ARROWS = {
  ne: '<path d="M7 17 17 7M8.5 7H17v8.5"/>',
  right: '<path d="M4 12h15.5M13.5 6l6 6-6 6"/>',
  down: '<path d="M12 4v15.5M6 13.5l6 6 6-6"/>',
  phone: '<path d="M6.6 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.1 6.1l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
};
export const glyph = (name, cls = 'a-glyph') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ARROWS[name]}</svg>`;

/** Button with its arrow nested in its own chip. `tone`: pine | ghost | cream | gold. */
export function button(href, label, { tone = 'pine', external = false, arrow, cls = '' } = {}) {
  const icon = arrow || (external ? 'ne' : 'right');
  const attrs = external ? ' target="_blank" rel="noopener"' : '';
  return `<a class="a-btn a-btn--${tone}${cls ? ' ' + cls : ''}" href="${esc(href)}"${attrs}><span class="a-btn-label">${label}</span><span class="a-btn-chip">${glyph(icon)}</span>${external ? NEW_TAB : ''}</a>`;
}
/** Quiet underlined text action. */
export function textLink(href, label, { external = false, arrow, cls = '' } = {}) {
  const icon = arrow || (external ? 'ne' : 'right');
  return `<a class="a-link${cls ? ' ' + cls : ''}" href="${esc(href)}"${external ? ' target="_blank" rel="noopener"' : ''}><span>${label}</span>${glyph(icon)}${external ? NEW_TAB : ''}</a>`;
}
export const eyebrow = (text, cls = '') => `<p class="a-eyebrow${cls ? ' ' + cls : ''}"><span class="a-eyebrow-dot" aria-hidden="true"></span>${text}</p>`;
export const image = (key, alt, sizes, { max, priority = false, cls = '' } = {}) => picture(key, { alt, sizes, max, priority, eager: priority, cls });
/** Quiet section label: a short rule and small capitals. Heroes keep the pill eyebrow. */
export const kicker = (text, cls = '') => `<p class="a-sec-kicker${cls ? ' ' + cls : ''}"><span class="a-sec-rule" aria-hidden="true"></span>${text}</p>`;
/** Engraved spot illustration (decorative), cut from the generated sheet. */
const SPOT_SIZE = { pizza: [420, 241], pint: [237, 420], pretzel: [420, 155], burger: [420, 386], salad: [420, 288], pine: [420, 407] };
export const spot = (name, cls = '') => `<img class="a-spot a-spot--${name}${cls ? ' ' + cls : ''}" src="/assets/art/spots/${name}.webp" width="${SPOT_SIZE[name][0]}" height="${SPOT_SIZE[name][1]}" alt="" loading="lazy" decoding="async">`;

/** Live "today" line. site.js re-checks it against the pub's own calendar day. */
export function todayLine({ site, events, today, cls = '' }) {
  const checked = hoursChecked(site, events), staleDays = events.staleAfterDays || 14;
  const ranges = closures(events.events);
  const minutes = (t) => { const m = /(\d{1,2})(?::(\d\d))?\s*(am|pm)/i.exec(t); return ((+m[1] % 12) + (m[3].toLowerCase() === 'pm' ? 12 : 0)) * 60 + +(m[2] || 0); };
  const hours = Object.fromEntries(site.hours.map((h) => [h.short, [minutes(h.open), minutes(h.close)]]));
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short' }).format(new Date(`${today}T12:00:00Z`));
  const closed = ranges.find((c) => c.from <= today && today <= c.to);
  const h = site.hours.find((x) => x.short === weekday);
  const status = !isFresh(checked, today, staleDays) || (!closed && !h)
    ? `<a href="${esc(site.links.officialVenue)}">Check today’s hours</a>`
    : closed ? `Closed today${closed.reason ? ` for ${esc(closed.reason)}` : ''}` : `Today: ${h.open}–${h.close}`;
  const shut = isFresh(checked, today, staleDays) && !!closed;
  return `<p class="a-today${cls ? ' ' + cls : ''}${shut ? ' is-closed' : ''}" data-sf-today data-hours="${esc(JSON.stringify(hours))}" data-closures="${esc(JSON.stringify(ranges))}" data-checked="${esc(checked)}" data-stale-days="${staleDays}" data-hours-url="${esc(site.links.officialVenue)}"><span class="a-today-dot" aria-hidden="true"></span><span data-sf-status>${status}</span></p>`;
}

/** Scheduled exception strip. site.js hides it when stale or over. */
export function notice(today) {
  const c = copy.closure;
  const visible = today >= '2026-09-21' && today <= c.through;
  return `<aside class="a-notice" aria-label="Closure notice" data-closure-notice data-from="2026-10-05" data-to="${c.through}" data-checked="2026-10-04" data-stale-days="14"${visible ? '' : ' hidden'}><div class="a-wrap a-notice-in"><p>${esc(c.text).replace(/^(.*?\.)\s/, '<strong>$1</strong> ')}</p><a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.link)}${glyph('ne')}${NEW_TAB}</a></div></aside>`;
}

// The closing scene every page ends on: Alibi at night from the Beer Forest
// (generated in the hero's flat poster style; masters in
// source-assets/generated/closing/). Phones get a portrait version.
function closingArt() {
  const set = (name, ws, fmt) => ws.map((w) => `/assets/art/closing/${name}-${w}.${fmt} ${w}w`).join(', ');
  const tall = [560, 800, 1120], wide = [960, 1280, 1672];
  return `<picture class="a-closing-art"><source media="(max-width: 699px)" type="image/avif" srcset="${set('pub-night-tall', tall, 'avif')}" sizes="100vw"><source media="(max-width: 699px)" type="image/webp" srcset="${set('pub-night-tall', tall, 'webp')}" sizes="100vw"><source type="image/avif" srcset="${set('pub-night-wide', wide, 'avif')}" sizes="100vw"><img src="/assets/art/closing/pub-night-wide-1280.webp" srcset="${set('pub-night-wide', wide, 'webp')}" sizes="100vw" width="1672" height="941" alt="Illustration of Alibi at night, seen from the Beer Forest: the deck under its shade sails, string lights between the pines, a band on the garden stage and the lake beyond." loading="lazy" decoding="async"></picture>`;
}
// A few stars that twinkle over the illustration's own sky.
function closingStars() {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const dots = Array.from({ length: 26 }, () => `<circle cx="${(rnd() * 100).toFixed(1)}%" cy="${(rnd() * 38).toFixed(1)}%" r="${(0.8 + rnd() * 1.3).toFixed(1)}" style="--tw:${(rnd() * 4).toFixed(2)}s"/>`).join('');
  return `<svg class="a-closing-stars" aria-hidden="true" focusable="false">${dots}</svg>`;
}

const NAV = [['/menu/', 'Menu'], ['/whats-on/', 'What’s on'], ['/visit/', 'Visit']];
const FONTS = ['fraunces-soft.woff2', 'fraunces-soft-italic.woff2', 'dm-sans-var.woff2'];

export function layout({ site, events, page, title, description, main, head = '', today, path, siteUrl = '', publicBuild = false }) {
  const L = site.links;
  const canonical = siteUrl && path ? new URL(path, siteUrl).href : '';
  const shareImage = siteUrl ? new URL('/assets/img/friends-dining-1200.jpg', siteUrl).href : '/assets/img/friends-dining-1200.jpg';
  const current = (href) => (href === `/${page}/` ? ' aria-current="page"' : '');
  return `<!doctype html><html lang="en" data-page="${page}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="${publicBuild && page !== 'not-found' ? 'index,follow' : 'noindex,follow'}">${canonical ? `<link rel="canonical" href="${esc(canonical)}"><meta property="og:url" content="${esc(canonical)}">` : ''}<meta name="theme-color" content="#F3EEE3"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:image" content="${esc(shareImage)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="798"><meta property="og:image:alt" content="Friends sharing food and pints beside a window at Alibi Incline Public House"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/assets/favicon.png" sizes="64x64"><link rel="icon" type="image/svg+xml" href="/assets/svg/favicon.svg">${FONTS.map((f) => `<link rel="preload" href="/assets/fonts/${f}" as="font" type="font/woff2" crossorigin>`).join('')}<script>document.documentElement.classList.add('js')</script><link rel="stylesheet" href="/assets/site.css">${head}<link rel="stylesheet" href="/assets/alibi.css"><link rel="stylesheet" href="/assets/alibi-scenes.css"><link rel="stylesheet" href="/assets/alibi-phone.css" media="(max-width: 999px)"><script src="/assets/site.js" defer></script><script src="/assets/alibi.js" defer></script><script src="/assets/alibi-motion.js" defer></script></head><body class="a-body" data-page="${page}"><a class="skip-link" href="#main">Skip to content</a>
<header class="a-header" data-header><div class="a-header-in">
<a class="a-brand" href="/" aria-label="Alibi Incline Public House, home"><img src="/assets/svg/alibi-wordmark-ink.svg" width="147" height="173" alt=""><span class="a-brand-text"><span class="a-brand-name">Alibi</span><span class="a-brand-sub">Incline Public House</span></span></a>
<nav class="a-nav" id="a-site-nav" aria-label="Main navigation">${NAV.map(([href, label], i) => `<a href="${href}"${current(href)} style="--i:${i}"><span>${label}</span></a>`).join('')}<a class="a-nav-extra" href="tel:${site.phone.tel}" style="--i:3"><span>Call ${site.phone.display}</span></a><a class="a-nav-extra" href="${esc(L.directions)}" target="_blank" rel="noopener" style="--i:4"><span>Directions</span>${NEW_TAB}</a></nav>
<div class="a-header-actions">${button(L.order, '<span class="a-hide-xs">Order</span><span class="a-hide-phone"> pizza to go</span><span class="sr-only a-show-xs"> Order pizza to go</span>', { external: true, cls: 'a-btn--sm a-header-order' })}<a class="a-nojs-menu" href="#footer-nav">Menu</a><button class="a-nav-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="a-site-nav"><span class="a-burger" aria-hidden="true"><i></i><i></i></span></button></div>
</div></header>
<main id="main">${notice(today)}${main}</main>
<footer class="a-footer">
 <div class="a-closing" data-closing>
  ${closingArt()}
  <div class="a-closing-dim" aria-hidden="true"></div>
  <div class="a-closing-glow" aria-hidden="true"></div>
  ${closingStars()}
  <div class="a-wrap a-closing-copy">
   <p class="a-closing-k">${esc(FOOT.closingKicker.toLowerCase().replace(/(^|· )\S/g, (c) => c.toUpperCase()).replace(/9pm/i, '9pm'))}</p>
   <p class="a-footer-line">${esc(FOOT.closingLine.a.trim())} <em>${esc(FOOT.closingLine.b)}</em></p>
   <div class="a-actions">${button(L.directions, 'Get directions', { external: true, tone: 'gold' })}${button('/menu/', 'See the menu', { tone: 'cream' })}</div>
  </div>
 </div>
 <div class="a-footer-body">
  <div class="a-wrap">
   <div class="a-footer-top">
    <a class="a-footer-brand" href="/" aria-label="Alibi Incline Public House, home"><img src="/assets/svg/alibi-wordmark-cream.svg" width="147" height="173" alt=""><span><span class="a-footer-name">Alibi</span><span class="a-footer-sub">Incline Public House</span></span></a>
    <p class="a-footer-tag">${esc(FOOT.tagline)}</p>
    <div class="a-footer-now">${todayLine({ site, events, today, cls: 'a-today--foot' })}<span class="a-footer-now-note">Kitchen until 9pm · Last to-go order 8:45pm</span></div>
   </div>
   <div class="a-footer-cols">
    <div><h2 class="a-footer-h">Find us</h2><address>931 Tahoe Blvd.<br>Incline Village, NV 89451</address><a class="a-footer-strong" href="tel:${site.phone.tel}">${site.phone.display}</a><a href="${esc(L.directions)}" target="_blank" rel="noopener">Directions ↗${NEW_TAB}</a></div>
    <div><h2 class="a-footer-h">Hours</h2><p>${esc(site.hoursSummary).replace(/(\d{1,2}[ap]m–\d{1,2}[ap]m)/g, '<span class="a-nowrap">$1</span>').replace(/ · /g, '<br>')}</p><a href="/visit/#hours">Hours &amp; house details</a></div>
    <nav id="footer-nav" aria-label="Footer navigation"><h2 class="a-footer-h">The pub</h2>${NAV.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}<a href="${esc(L.order)}" target="_blank" rel="noopener">Order pizza to go ↗${NEW_TAB}</a></nav>
    <div><h2 class="a-footer-h">Follow</h2><a href="${esc(L.instagram)}" target="_blank" rel="noopener">Instagram ↗${NEW_TAB}</a><a href="${esc(L.facebook)}" target="_blank" rel="noopener">Facebook ↗${NEW_TAB}</a><a href="${esc(L.home)}" target="_blank" rel="noopener">alibialeworks.com ↗${NEW_TAB}</a></div>
   </div>
  </div>
  <div class="a-footer-giant" aria-hidden="true"><div class="a-footer-giant-in"><span class="a-giant-word">Alibi</span></div></div>
  <div class="a-wrap a-footer-notes"><p>An unofficial design concept for Alibi Ale Works.</p><p class="a-footer-signoff">${esc(FOOT.signoff)}</p><details class="a-credits"><summary>About this concept &amp; credits</summary><div><p>This is a design preview, not Alibi’s official website. For current menus, hours and events, follow the links to Alibi.</p><p>The illustrations, including the arrival scene, the closing night scene and the beer worlds, are artistic interpretations, not exact views of the venue.</p><p>Photos and can artwork were sourced from Alibi’s website for this design concept. Public-use permissions and complete photo credits still need confirmation.</p><p><a href="${esc(L.officialVenue)}" target="_blank" rel="noopener">Alibi’s venue details ↗</a> · <a href="${esc(L.officialMenu)}" target="_blank" rel="noopener">Alibi’s menu ↗</a> · <a href="${esc(L.events)}" target="_blank" rel="noopener">Alibi’s calendar ↗</a></p></div></details></div>
 </div>
</footer>
<button id="a-pint" class="a-pint" type="button" aria-label="Back to top"><svg viewBox="0 0 44 60" width="44" height="60" aria-hidden="true" focusable="false"><defs><clipPath id="a-pint-clip"><path d="M5 6H39L35.5 55Q35.2 57 33 57H11Q8.8 57 8.5 55Z"/></clipPath></defs><g clip-path="url(#a-pint-clip)"><rect class="a-pint-beer" x="0" y="6" width="44" height="51"/><g class="a-pint-top"><rect class="a-pint-foam" x="0" y="2" width="44" height="7" rx="3.5"/></g><circle class="a-pint-bubble" cx="15" cy="52" r="1.3"/><circle class="a-pint-bubble" cx="24" cy="54" r="1"/><circle class="a-pint-bubble" cx="30" cy="51" r="1.4"/></g><path class="a-pint-glass" d="M5 6H39L35.5 55Q35.2 57 33 57H11Q8.8 57 8.5 55Z"/></svg><span class="a-pint-label" aria-hidden="true">Cheers</span></button></body></html>`;
}
