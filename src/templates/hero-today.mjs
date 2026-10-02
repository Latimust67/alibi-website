/** Pacific-date hours, dated static output and independently verified closures. */
import { esc } from './components.mjs';
import { closures, closureNotice } from './event-rows.mjs';

const DAY = 864e5;
export const dateLabel = (iso) => /^\d{4}-\d\d-\d\d$/.test(String(iso))
  ? new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(`${iso}T12:00:00Z`))
  : 'date unavailable';
export function isFresh(checked, today, days = 14) {
  const age = (Date.parse(today) - Date.parse(checked)) / DAY;
  return Number.isFinite(age) && age >= 0 && age <= days;
}
/** Hours depend on the routine schedule and its exceptions both being current. */
export function hoursChecked(site, events) {
  const dates = [site.hoursChecked, events.exceptionsChecked];
  return dates.every((d) => /^\d{4}-\d\d-\d\d$/.test(String(d))) ? dates.sort()[0] : '';
}
export function freshnessAttrs(checked, today, days = 14) {
  return `data-current-fact data-checked="${esc(checked)}" data-stale-days="${days}"${isFresh(checked, today, days) ? '' : ' hidden'}`;
}
function timeFrom(text) {
  return /(\d{1,2}(?::\d\d)?\s*(?:am|pm))/i.exec(String(text))?.[1] || '';
}
export function kitchenCutoff(site) {
  const kitchen = timeFrom(site.kitchen), pickup = timeFrom(site.toGo);
  return [kitchen && `Kitchen closes at ${kitchen}.`, pickup && `Last pickup order: ${pickup}.`].filter(Boolean).join(' ');
}
function minutes(text) {
  const m = /(\d{1,2})(?::(\d\d))?\s*(am|pm)/i.exec(String(text));
  if (!m) throw new Error(`todayStrip: no time in "${text}"`);
  return ((Number(m[1]) % 12) + (m[3].toLowerCase() === 'pm' ? 12 : 0)) * 60 + Number(m[2] || 0);
}
export function todayStrip({ site, events, today, includeAddress = true }) {
  if (!/^\d{4}-\d\d-\d\d$/.test(String(today))) throw new Error('todayStrip needs a Pacific calendar date');
  const checked = hoursChecked(site, events), staleDays = events.staleAfterDays || 14;
  const ranges = closures(events.events);
  const currentClosure = ranges.find((c) => c.from <= today && today <= c.to);
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short' }).format(new Date(`${today}T12:00:00Z`));
  const dayLabel = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(`${today}T12:00:00Z`));
  const h = site.hours.find((entry) => entry.short === weekday);
  const staticStatus = currentClosure ? `Closed ${dayLabel}${currentClosure.reason ? ` for ${currentClosure.reason}` : ''}` : h ? `Hours for ${dayLabel}: ${h.open}–${h.close}` : '';
  const status = isFresh(checked, today, staleDays) && staticStatus ? esc(staticStatus) : `<a href="${esc(site.links.officialVenue)}">Check today’s hours</a>`;
  const nextClosure = events.events.filter((e) => e.status === 'closure' && (e.endDate || e.date) >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
  const hours = Object.fromEntries(site.hours.map((entry) => [entry.short, [minutes(entry.open), minutes(entry.close)]]));
  return `<div class="sf-today" data-sf-today data-hours="${esc(JSON.stringify(hours))}" data-closures="${esc(JSON.stringify(ranges))}" data-checked="${esc(checked)}" data-stale-days="${staleDays}" data-hours-url="${esc(site.links.officialVenue)}">
    <p class="sf-practical-line"><span class="sf-dot" aria-hidden="true"></span><span data-sf-status>${status}</span>${includeAddress ? `<span aria-hidden="true"> · </span><a href="${esc(site.links.directions)}" target="_blank" rel="noopener">${esc(site.address.street)}<span class="sr-only">, ${esc(site.address.city)} — directions (opens in a new tab)</span></a>` : ''}<a class="sf-house-notes" href="/visit/#hours">Hours &amp; house details</a></p>
    ${nextClosure ? closureNotice(nextClosure, today, 'sf-notice') : ''}
  </div>`;
}
