// Shared markup helpers. Everything returns plain HTML strings.
import { readFileSync } from 'node:fs';

export const images = JSON.parse(readFileSync(new URL('../data/images.json', import.meta.url), 'utf8'));

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const asset = (p) => `/assets/${p}`;

/**
 * Responsive <picture> with reserved dimensions and a placeholder colour.
 * sizes: the CSS width hint; priority: eager + high fetch priority (LCP only).
 */
export function picture(key, { alt = '', sizes = '100vw', cls = '', imgCls = '', priority = false, eager = false, max } = {}) {
  const img = images[key];
  if (!img) throw new Error(`Unknown image: ${key}`);
  const list = (fmt) => img[fmt].filter(([w]) => !max || w <= max).map(([w, p]) => `${asset(p)} ${w}w`).join(', ');
  const fallbackSet = img.alpha ? img.webp : img.jpg;
  const fallback = fallbackSet.filter(([w]) => !max || w <= max);
  const src = asset((fallback[Math.min(1, fallback.length - 1)] || fallbackSet[0])[1]);
  const load = priority ? 'loading="eager" fetchpriority="high"' : eager ? 'loading="eager"' : 'loading="lazy"';
  return `<picture${cls ? ` class="${cls}"` : ''}>` +
    `<source type="image/avif" srcset="${list('avif')}" sizes="${sizes}">` +
    `<source type="image/webp" srcset="${list('webp')}" sizes="${sizes}">` +
    (img.alpha ? '' : `<source type="image/jpeg" srcset="${list('jpg')}" sizes="${sizes}">`) +
    `<img src="${src}" alt="${esc(alt)}" width="${img.width}" height="${img.height}" ${load} decoding="async"` +
    `${imgCls ? ` class="${imgCls}"` : ''} style="--ph:${img.alpha ? 'transparent' : img.color}"></picture>`;
}

// Icons: 24px grid line icons + small botanical marks, drawn for this site.
const ICONS = {
  'arrow-right': '<path d="M4 12h15M13 6l6 6-6 6"/>',
  'arrow-ne': '<path d="M7 17 17 7M8 7h9v9"/>',
  'arrow-down': '<path d="M12 4v15M6 13l6 6 6-6"/>',
  phone: '<path d="M6.6 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.1 6.1l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  pause: '<path d="M9 5.5v13M15 5.5v13"/>',
  play: '<path d="M8 5.5v13l10-6.5Z"/>',
  bag: '<path d="M5.5 8h13l-1 12h-11l-1-12Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  // botanical marks (drawn with the same stroke, read as ink sketches)
  sprig: '<path d="M12 21V4"/><path d="M12 7 8 4.5M12 7l4-2.5M12 10.5 7.5 7.5M12 10.5l4.5-3M12 14 7 10.5M12 14l5-3.5M12 17.5l-5.5-4M12 17.5l5.5-4"/>',
  cone: '<path d="M12 3c3.2 2.4 4.6 6 4.6 9.3 0 4-2.1 7.7-4.6 8.7-2.5-1-4.6-4.7-4.6-8.7C7.4 9 8.8 5.4 12 3Z"/><path d="M8.2 9.5 12 12l3.8-2.5M7.5 13.5 12 16.5l4.5-3M9 17.5l3 2 3-2"/>',
  fern: '<path d="M6 21c3-5 5.5-10.5 11-17"/><path d="M8.6 16.5 5 15.6M10.2 13.6 6.4 12M12 10.9 8.6 8.7M13.8 8.4l-2.5-3M9.9 17.4l2.9 1.4M11.6 14.6l3.4.9M13.4 11.9l3.4.2M15.1 9.3l3.1-.6"/>',
  moon: '<circle cx="12" cy="12" r="7.5"/>',
  star: '<path d="m12 3.5 2.3 5.6 6 .5-4.6 3.9 1.4 5.9L12 16.3l-5.1 3.1 1.4-5.9-4.6-3.9 6-.5Z"/>',
  chili: '<path d="M15.5 6.5c-4.5 1.5-5 7.5-10.5 12 7.5 1 12.5-5 12.5-10.5"/><path d="M15.5 6.5c.2-1.4 1-2.5 2.5-3"/>',
};

export function icon(name, cls = '') {
  return `<svg class="icon${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
}

const NEW_TAB = '<span class="sr-only"> (opens in a new tab)</span>';

/** External link: new tab, visible ↗ and a screen-reader note. */
export function ext(href, label, cls = 'link') {
  return `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener">${label}${icon('arrow-ne', 'icon-ext')}${NEW_TAB}</a>`;
}

export function btn(href, label, { variant = 'primary', external = false, iconName } = {}) {
  const i = external ? icon('arrow-ne') : iconName ? icon(iconName) : '';
  const attrs = external ? ' target="_blank" rel="noopener"' : '';
  return `<a class="btn btn-${variant}" href="${esc(href)}"${attrs}><span>${label}</span>${i}${external ? NEW_TAB : ''}</a>`;
}

export function arrowLink(href, label, { dir = 'right', cls = '' } = {}) {
  return `<a class="link-arrow${cls ? ' ' + cls : ''}" href="${esc(href)}"><span>${label}</span>${icon(dir === 'down' ? 'arrow-down' : 'arrow-right')}</a>`;
}

export function eyebrow(text, mark = 'sprig') {
  return `<p class="eyebrow">${icon(mark, 'eyebrow-mark')}<span>${text}</span></p>`;
}

/** Decorative printed treeline, masked from the site's authored pine contour. */
export function treeline(cls, rows = ['back', 'front']) {
  return `<div class="treeline ${cls}" aria-hidden="true">${rows.map((r) => `<span class="treeline-row treeline-${r}"></span>`).join('')}</div>`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DOW_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function dateParts(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay();
  return { y, m, d, dow: DOW[dow], dowLong: DOW_LONG[dow], mon: MONTHS[m - 1], monLong: MONTHS_LONG[m - 1] };
}

export function startMinutes(time = '') {
  // "10am–3pm", "7–9pm", "12–4pm", "From 9pm", "All day" -> minutes after midnight of the start
  if (/all day/i.test(time)) return -1;
  const range = time.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*[–-]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  const single = time.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  const m = range || single;
  if (!m) return 0;
  let h = +m[1];
  // A start without am/pm shares the end's suffix ("7–9pm" starts at 7pm).
  const suffix = (m[3] || (range ? m[6] : '')).toLowerCase();
  if (suffix === 'pm' && h !== 12) h += 12;
  if (suffix === 'am' && h === 12) h = 0;
  return h * 60 + (+m[2] || 0);
}

/** The shared shoreline edge: an ink curve with a fine mist contour line beside it. */
export function shoreEdge(cls = '') {
  return `<svg class="shore-edge${cls ? ' ' + cls : ''}" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path class="shore-fill" d="M0,0 H46 C30,110 62,230 44,360 C28,470 18,560 40,660 C58,745 50,860 30,940 C26,965 28,985 34,1000 H0 Z"/>
      <path class="shore-line" d="M52,0 C38,110 70,230 52,360 C36,470 26,560 48,660 C66,745 58,860 38,940 C34,965 36,985 42,1000"/>
    </svg>`;
}
