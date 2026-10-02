import { esc, icon, dateParts, startMinutes } from './components.mjs';

/** Sort by date, then start time (all-day closures first on their day). */
export function sortEvents(list) {
  return [...list].sort((a, b) => (a.date === b.date ? startMinutes(a.time) - startMinutes(b.time) : a.date < b.date ? -1 : 1));
}

/** Events that have not ended before `todayIso` (multi-day closures count until their last day). */
export function upcoming(list, todayIso) {
  const closures = list.filter((e) => e.status === 'closure');
  return sortEvents(list).filter((e) => (e.endDate || e.date) >= todayIso
    && (e.status === 'closure' || !closures.some((c) => c.date <= e.date && e.date <= (c.endDate || c.date))));
}

const DAY = 864e5;
const daysBetween = (a, b) => (Date.parse(b) - Date.parse(a)) / DAY;

function status(e) {
  if (e.status === 'closure') return `<span class="tag tag-closed">Pub closed</span>`;
  if (e.status === 'cancelled') return `<span class="tag tag-cancelled">Cancelled</span>`;
  return '';
}

function dateBlock(e) {
  const p = dateParts(e.date);
  if (e.endDate) {
    const q = dateParts(e.endDate);
    return `<span class="event-date is-range"><span class="ed-dow">${p.dow}–${q.dow}</span><span class="ed-day"><time datetime="${e.date}">${p.d}</time>–<time datetime="${e.endDate}">${q.d}</time></span><span class="ed-mon">${p.mon}</span></span>`;
  }
  return `<time class="event-date" datetime="${e.date}"><span class="ed-dow">${p.dow}</span><span class="ed-day">${p.d}</span><span class="ed-mon">${p.mon}</span></time>`;
}

/** Full calendar row (What's On). */
export function eventRow(e) {
  const p = dateParts(e.date);
  const end = e.endDate ? dateParts(e.endDate) : null;
  const when = end ? `${p.dowLong}, ${p.monLong} ${p.d} to ${end.dowLong}, ${end.monLong} ${end.d}` : `${p.dowLong}, ${p.monLong} ${p.d}`;
  const cls = ['event', e.status ? `is-${e.status}` : '', e.special ? 'is-special' : '', e.recurring ? 'is-recurring' : ''].filter(Boolean).join(' ');
  return `<li class="${cls}" data-event data-date="${e.date}" data-end="${e.endDate || e.date}" data-checked="${esc(e.checked || '')}">
  ${dateBlock(e)}
  <div class="event-body">
    <h4 class="event-title"><span class="event-name">${esc(e.title)}</span>${e.subtitle ? ` <span class="event-sub">${esc(e.subtitle)}</span>` : ''}</h4>
    <p class="event-meta">${status(e)}${e.status === 'cancelled' ? '' : `<span class="event-time">${icon('clock')}${esc(e.time)}</span>`}</p>
    <p class="event-detail">${esc(e.detail)}</p>
  </div>
  <a class="event-link" href="${esc(e.url)}" target="_blank" rel="noopener"><span>${e.status === 'closure' ? 'Closure details' : 'Event details'}</span>${icon('arrow-ne')}<span class="sr-only">: ${esc(e.title)}${e.status === 'cancelled' ? ', cancelled' : e.status === 'closure' && !/closed/i.test(e.title) ? ', closed' : ''}, ${when}, ${p.y} (opens in a new tab)</span></a>
</li>`;
}

const keyOf = (e) => `${e.date}-${e.title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const trimStop = (t = '') => t.replace(/[.\s]+$/, '');

/** Compact row for the Home strip (closures are shown as a separate notice). */
export function miniRow(e) {
  const p = dateParts(e.date);
  const cancelled = e.status === 'cancelled';
  const cls = ['mini-event', cancelled ? 'is-cancelled' : '', e.special ? 'is-special' : ''].filter(Boolean).join(' ');
  return `<li class="${cls}" data-event data-date="${e.date}" data-end="${e.endDate || e.date}" data-checked="${esc(e.checked || '')}" data-key="${keyOf(e)}">
  <time datetime="${e.date}"><span>${p.dow}</span> ${p.mon} ${p.d}</time>
  <a class="mini-title" href="${esc(e.url)}" target="_blank" rel="noopener" aria-label="Event details for ${esc(e.title)}, ${p.dowLong}, ${p.monLong} ${p.d}, ${p.y} (opens in a new tab)">${esc(e.title)}</a>
  <span class="mini-time">${cancelled ? '<span class="mini-flag">Cancelled</span>' : esc(e.time)}</span>
</li>`;
}

/** A dated closure notice; reopening is explicit source data, never inferred. */
export function closureNotice(e, todayIso, cls = 'closure-heads') {
  const from = dateParts(e.date), to = e.endDate ? dateParts(e.endDate) : null;
  const span = to ? `${from.monLong} ${from.d}–${from.m === to.m ? '' : to.monLong + ' '}${to.d}` : `${from.monLong} ${from.d}`;
  const end = e.endDate || e.date;
  const age = daysBetween(e.checked, todayIso);
  const fresh = Number.isFinite(age) && age >= 0 && age <= 14;
  const visible = fresh && todayIso <= end && daysBetween(todayIso, e.date) <= 14;
  const reopeningAge = daysBetween(e.reopeningChecked, todayIso);
  const reopening = e.reopens && Number.isFinite(reopeningAge) && reopeningAge >= 0 && reopeningAge <= 14 ? dateParts(e.reopens) : null;
  const next = reopening ? `Reopening ${reopening.dowLong}, ${reopening.monLong} ${reopening.d}.` : 'Check Alibi’s hours before visiting.';
  return `<p class="${cls}" data-closure-notice data-from="${e.date}" data-to="${end}" data-checked="${esc(e.checked || '')}" data-stale-days="14"${visible ? '' : ' hidden'}>${icon('moon')}<span><strong>Closed ${span}${e.reason ? ` for ${esc(e.reason)}` : ''}.</strong> ${esc(next)}</span></p>`;
}

/** Points out a special event that falls just beyond the three rows shown. */
export function specialNotice(list, todayIso) {
  const shown = new Set(list.slice(0, 3).map(keyOf));
  const s = list.find((e) => e.special && !shown.has(keyOf(e)) && daysBetween(todayIso, e.date) <= 14);
  const any = s || list.find((e) => e.special && daysBetween(todayIso, e.date) <= 14);
  if (!any) return '';
  const p = dateParts(any.date);
  return `<p class="mini-special" data-special-notice data-date="${any.date}" data-key="${keyOf(any)}"${s ? '' : ' hidden'}>${icon('star')}<span>Also coming up: <a class="link" href="/whats-on/">${esc(any.title)}</a>, ${p.dow} ${p.mon} ${p.d}, ${esc(any.time)}</span></p>`;
}

/** Closure date ranges, for the Visit hours table. */
export function closures(list) {
  return list.filter((e) => e.status === 'closure')
    .map((e) => ({ from: e.date, to: e.endDate || e.date, reason: e.reason || '', checked: e.checked, note: trimStop(e.closedNote || e.detail) }))
    .sort((a, b) => (a.from < b.from ? -1 : 1));
}
