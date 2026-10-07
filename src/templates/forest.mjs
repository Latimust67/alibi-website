// The closing scene every page ends on: a night forest in five depth layers,
// drawn as SVG at build time from a fixed seed so every build is identical.
// Each layer shares one 1600 x 800 coordinate space and is anchored to the
// bottom (xMidYMax slice), so the layers can slide independently and still
// line up. Taller pines stand at the edges and frame the open sky in the
// middle, where the closing line sits.

const W = 1600, H = 800;

function rng(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

// One pine: drooping tiers, each tip lower than the notch above it.
function pine(cx, base, h, w, tiers, rnd) {
  const top = base - h, crown = h * 0.9, trunkW = Math.max(2, w * 0.07);
  const left = [], right = [];
  for (let k = 1; k <= tiers; k++) {
    const t = k / tiers;
    const y = top + Math.pow(t, 0.92) * crown;
    const half = (w / 2) * Math.pow(t, 0.86) * (0.9 + rnd() * 0.2);
    const step = crown / tiers;
    left.push(`${(cx - half).toFixed(0)} ${y.toFixed(0)}`, `${(cx - half * 0.42).toFixed(0)} ${(y - step * 0.28).toFixed(0)}`);
    right.unshift(`${(cx + half * 0.42).toFixed(0)} ${(y - step * 0.28).toFixed(0)}`, `${(cx + half).toFixed(0)} ${y.toFixed(0)}`);
  }
  left.pop(); right.shift(); // the lowest tier ends at its tips
  const tb = (base + 2).toFixed(0), tt = (top + crown - 2).toFixed(0);
  return `M${cx.toFixed(0)} ${top.toFixed(0)}L${left.join('L')}L${(cx - trunkW).toFixed(0)} ${tt}L${(cx - trunkW).toFixed(0)} ${tb}L${(cx + trunkW).toFixed(0)} ${tb}L${(cx + trunkW).toFixed(0)} ${tt}L${right.join('L')}Z`;
}

// A band of night mist at the foot of a layer, for depth.
const mist = (id, y, color, alpha) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset="1" stop-color="${color}" stop-opacity="${alpha}"/></linearGradient></defs><rect x="0" y="${y - 150}" width="${W}" height="${H - y + 150}" fill="url(#${id})"/>`;

function trees({ seed, count, minH, maxH, base, jitter, aspect, valley, color }) {
  const rnd = rng(seed);
  const paths = [];
  for (let i = 0; i < count; i++) {
    const cx = (i + 0.15 + rnd() * 0.7) * (W + 120) / count - 60;
    const edge = Math.min(1, Math.abs(cx - W / 2) / (W / 2));
    const lift = 1 - valley + valley * Math.pow(edge, 0.8);
    const h = (minH + rnd() * (maxH - minH)) * lift;
    const b = base + rnd() * jitter;
    paths.push(pine(cx, b, h, h * aspect * (0.85 + rnd() * 0.3), Math.round(7 + rnd() * 4), rnd));
  }
  // Shuffle draw order a little so overlaps look natural, then merge into one path.
  return `<path fill="${color}" d="${paths.join('')}M0 ${base + jitter * 0.5}H${W}V${H}H0Z"/>`;
}

function ridge(seed, y, amp, color) {
  const rnd = rng(seed);
  let d = `M0 ${H}L0 ${y}`;
  let x = 0;
  while (x < W) {
    const peak = x + 60 + rnd() * 120;
    d += `L${peak.toFixed(0)} ${(y - amp * (0.35 + rnd() * 0.65)).toFixed(0)}`;
    x = peak + 50 + rnd() * 130;
    d += `L${Math.min(W, x).toFixed(0)} ${(y - rnd() * amp * 0.25).toFixed(0)}`;
  }
  return `<path fill="${color}" d="${d}L${W} ${H}Z"/>`;
}

// A strand of festoon lights draped between two of the near pines.
function strand(seed, x0, y0, x1, y1, sag, n) {
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    pts.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + sag * 4 * t * (1 - t)]);
  }
  const wire = `<path class="a-forest-wire" d="M${pts.map(([x, y]) => `${x.toFixed(0)} ${y.toFixed(0)}`).join('L')}" fill="none"/>`;
  const bulbs = Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + sag * 4 * t * (1 - t) + 7;
    return `<g class="a-fbulb" style="--n:${i}"><circle class="a-fbulb-halo" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="26" fill="url(#a-fhalo)"/><circle class="a-fbulb-core" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="4.2" fill="url(#a-fcore)"/></g>`;
  }).join('');
  return wire + bulbs;
}

function stars(seed) {
  const rnd = rng(seed);
  return Array.from({ length: 110 }, (_, i) => {
    const x = rnd() * W, y = rnd() * H * 0.62, r = 0.7 + rnd() * 1.6, o = 0.3 + rnd() * 0.7;
    return `<circle${i % 5 === 0 ? ` class="a-tw" style="--tw:${(rnd() * 4).toFixed(2)}s"` : ''} cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(0)}" fill="#fff6dc" opacity="${o.toFixed(2)}"/>`;
  }).join('');
}

const svg = (cls, body, depth) => `<svg class="a-forest-layer ${cls}"${depth != null ? ` data-depth="${depth}"` : ''} viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" focusable="false">${body}</svg>`;

let cache;
export function forestScene() {
  if (cache) return cache;
  const defs = `<defs><radialGradient id="a-fhalo"><stop offset="0" stop-color="#ffd793" stop-opacity=".75"/><stop offset=".35" stop-color="#ffb35c" stop-opacity=".28"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient><radialGradient id="a-fcore"><stop offset="0" stop-color="#fffdf2"/><stop offset=".6" stop-color="#ffe2a0"/><stop offset="1" stop-color="#f6b45a"/></radialGradient><radialGradient id="a-fdusk" cx=".5" cy="1" r=".75"><stop offset="0" stop-color="#d07a46" stop-opacity=".34"/><stop offset=".45" stop-color="#6c4a5a" stop-opacity=".16"/><stop offset="1" stop-color="#1b2a44" stop-opacity="0"/></radialGradient><radialGradient id="a-fmoon"><stop offset="0" stop-color="#fff8e4" stop-opacity=".55"/><stop offset="1" stop-color="#fff8e4" stop-opacity="0"/></radialGradient></defs>`;
  const sky = svg('a-forest-sky', `${defs}<rect x="0" y="180" width="${W}" height="420" fill="url(#a-fdusk)"/><circle cx="1210" cy="150" r="120" fill="url(#a-fmoon)"/><circle cx="1210" cy="150" r="30" fill="#f6efd9"/><circle cx="1198" cy="142" r="6" fill="#e7dec4"/><circle cx="1222" cy="160" r="4" fill="#e7dec4"/>${stars(11)}`);
  const layers = [
    svg('a-forest-ridge', ridge(5, 470, 150, '#2a4058') + ridge(9, 520, 110, '#22384d') + mist('a-fog0', 560, '#3b5468', 0.55), 0),
    svg('a-forest-far', trees({ seed: 21, count: 74, minH: 70, maxH: 140, base: 590, jitter: 26, aspect: 0.42, valley: 0.25, color: '#244553' }) + mist('a-fog1', 640, '#2f4f5a', 0.6), 1),
    svg('a-forest-mid', trees({ seed: 33, count: 46, minH: 130, maxH: 230, base: 660, jitter: 30, aspect: 0.44, valley: 0.4, color: '#1a3839' }) + mist('a-fog2', 720, '#21403f', 0.5), 2),
    svg('a-forest-near', trees({ seed: 47, count: 24, minH: 230, maxH: 400, base: 735, jitter: 26, aspect: 0.46, valley: 0.55, color: '#11292a' })
      + strand(3, 250, 470, 820, 455, 110, 14) + strand(4, 820, 455, 1360, 485, 120, 13), 3),
    svg('a-forest-front', trees({ seed: 59, count: 13, minH: 380, maxH: 640, base: 790, jitter: 14, aspect: 0.5, valley: 0.72, color: '#0b1d16' }), 4),
  ];
  cache = `<div class="a-forest" aria-hidden="true">${sky}${layers.join('')}</div>`;
  return cache;
}
