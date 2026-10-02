import { picture, icon, btn, eyebrow, ext, esc } from './components.mjs';
import { upcoming, closureNotice } from './event-rows.mjs';
import { freshnessAttrs, hoursChecked, kitchenCutoff } from './hero-today.mjs';

function marks(m = []) {
  const out = [];
  if (m.includes('favorite')) out.push(`<span class="mark mark-fav">${icon('star')}<span class="sr-only">, </span>Fan favorite</span>`);
  if (m.includes('spicy')) out.push(`<span class="mark mark-spicy">${icon('chili')}<span class="sr-only">, </span>Spicy</span>`);
  return out.length ? `<span class="marks">${out.join('')}</span>` : '';
}
const DIET = { V: 'Vegetarian', VG: 'Vegan', GF: 'Gluten-free' };
function diet(list = []) {
  return list.length ? `<span class="diet">${list.map((t) => `<span class="diet-tag"><span aria-hidden="true">${esc(t)}</span><span class="sr-only">, ${esc((DIET[t] || t).toLowerCase())}</span></span>`).join('')}</span>` : '';
}
function dish(d) {
  const tags = d.name === 'Watermelon Salad' ? (d.diet || []).filter((t) => t !== 'VG') : d.diet;
  return `<div class="dish"><dt class="dish-name">${esc(d.name)}${diet(tags)}${marks(d.marks)}</dt>${d.desc ? `<dd class="dish-desc">${esc(d.desc)}</dd>` : ''}${d.note ? `<dd class="dish-note">${esc(d.note)}</dd>` : ''}</div>`;
}
function category(c) {
  return `<section class="menu-cat" id="${esc(c.id)}" aria-labelledby="${esc(c.id)}-title" data-menu-section>
    <div class="menu-cat-head"><h3 class="cat-title" id="${esc(c.id)}-title">${esc(c.title)}</h3>${c.intro ? `<p class="cat-intro">${esc(c.intro)}</p>` : ''}${c.promo ? `<p class="cat-promo">${esc(c.promo)}</p>` : ''}</div>
    <dl class="dish-list">${c.items.map(dish).join('')}</dl>
  </section>`;
}
function beer(b) {
  const disputed = /^(Kölsch|Alibi Lager|Lager|Porter)$/i.test(b.name);
  const meta = [b.style, disputed ? '' : b.abv].filter(Boolean).join(' · ');
  return `<div class="beer"><dt class="beer-name">${esc(b.name)}</dt><dd class="beer-meta">${esc(meta)}</dd>${b.notes ? `<dd class="beer-notes">${esc(b.notes)}</dd>` : ''}${b.qualification ? `<dd class="beer-notes"><strong>${esc(b.qualification)}</strong></dd>` : ''}</div>`;
}
function drinkItem(d) {
  return `<div class="drink"><dt class="drink-name">${esc(d.name)}${marks(d.marks)}</dt>${d.desc ? `<dd class="drink-desc">${esc(d.desc)}</dd>` : ''}</div>`;
}
const foodPair = () => `<div class="menu-food-pair">
  <figure>${picture('food-bao', { alt: 'Alibi pork belly bao with pickled onion and peppers on a dark plate', sizes: '(min-width: 800px) 42vw, 90vw', max: 1000 })}<figcaption>Pork Belly Bao</figcaption></figure>
  <figure>${picture('food-salad', { alt: 'Garden Salad with greens, tomatoes, carrot and watermelon radish', sizes: '(min-width: 800px) 42vw, 90vw', max: 1000 })}<figcaption>Garden Salad</figcaption></figure>
</div>`;

export function menuPage({ site, menu, events, today }) {
  const L = site.links;
  const [tap, na, cocktails, wine, bottles] = menu.drinks;
  const hh = menu.happyHour;
  const br = menu.brunch;
  const nextClosure = upcoming(events.events, today).find((e) => e.status === 'closure');
  const navLink = (c) => `<li><a class="menu-nav-link" href="#${esc(c.id)}" data-menu-link>${esc(c.nav)}</a></li>`;
  return `
<section class="route-hero menu-hero" aria-labelledby="menu-title">
  <div class="container route-hero-grid">
    <div class="route-hero-copy">
      <h1 class="page-title" id="menu-title">Menu</h1>
      <p class="page-lead">Sourdough pizza, pub favorites, and something good to drink.</p>
      <div class="actions">${btn('#food', 'Browse food', { iconName: 'arrow-down' })}${btn(L.order, 'Order pickup', { variant: 'secondary', external: true })}</div>
    </div>
    <figure class="route-hero-media menu-hero-photo">
      ${picture('pizza-and-pints', { alt: 'Sourdough pizzas and Alibi pint glasses on a shared wooden table', sizes: '(min-width: 900px) 52vw, 100vw', priority: true, max: 1400 })}
      <figcaption>Pizza and pints at Alibi.</figcaption>
      <img class="route-detail" src="/assets/art/route-detail.svg" width="300" height="150" alt="" aria-hidden="true">
    </figure>
  </div>
</section>

<nav class="menu-nav" aria-label="Menu sections" data-menu-nav>
  <div class="container menu-nav-inner">
    <div class="menu-nav-set"><span class="menu-nav-group" aria-hidden="true">Food</span><ul aria-label="Food categories">${[...menu.food, hh, br].map(navLink).join('')}</ul></div>
    <div class="menu-nav-set"><span class="menu-nav-group" aria-hidden="true">Drinks</span><ul aria-label="Drinks categories">${[...menu.drinks, menu.cans].map(navLink).join('')}</ul></div>
  </div>
</nav>

<section class="section menu-group menu-food" id="food" aria-labelledby="food-title" data-menu-alias="snacks">
  <div class="container">
    <div class="section-heading menu-group-head">
      <h2 class="section-title" id="food-title">Food</h2>
      <p class="group-note">${esc(menu.kitchen)}</p>
      <p class="fine">${esc(menu.menuNote)} ${ext(L.officialMenu, 'View Alibi’s menu')}</p>
      <p class="diet-legend">${esc(menu.dietLegend)}</p><p class="fine">${esc(menu.dietary)}</p>
    </div>
    ${menu.food.map((c, i) => category(c) + (i === 1 ? foodPair() : '')).join('')}
    <section class="menu-cat menu-hh" id="${esc(hh.id)}" aria-labelledby="${esc(hh.id)}-title" data-menu-section>
      <div class="menu-cat-head"><h3 class="cat-title" id="${esc(hh.id)}-title">${esc(hh.title)}</h3><p class="cat-intro" ${freshnessAttrs(menu.checked, today, events.staleAfterDays)}>${esc(hh.when)}</p></div>
      <div class="hh-body"><div class="hh-cols"><div><h4 class="menu-subheading">Snacks</h4><dl class="dish-list">${hh.snacks.map(dish).join('')}</dl></div><div><h4 class="menu-subheading">Drinks</h4><dl class="dish-list">${hh.drinks.map(dish).join('')}</dl></div></div><p class="hh-beers">${esc(hh.beers)}</p></div>
    </section>
    <section class="menu-cat menu-brunch" id="${esc(br.id)}" aria-labelledby="${esc(br.id)}-title" data-menu-section>
      <div class="menu-cat-head"><h3 class="cat-title" id="${esc(br.id)}-title">${esc(br.title)}</h3><p class="cat-intro" ${freshnessAttrs(menu.checked, today, events.staleAfterDays)}>${esc(br.when)}</p><p class="cat-aside">${esc(br.note)}</p></div>
      <div><dl class="dish-list">${br.items.map(dish).join('')}</dl><p class="brunch-drinks"><strong>Brunch drinks:</strong> ${esc(br.drinks)}</p></div>
    </section>
    <p class="dietary">${esc(menu.dietary)}</p>
  </div>
</section>

<section class="section menu-group menu-drinks" id="drinks" aria-labelledby="drinks-title" data-menu-alias="on-tap">
  <div class="container">
    <div class="section-heading menu-group-head">
      <h2 class="section-title" id="drinks-title">Drinks</h2>
      <p>${esc(menu.drinksNote)} ${ext(L.beers, 'Meet our beers')}</p>
    </div>
    <section class="menu-cat tap" id="${esc(tap.id)}" aria-labelledby="${esc(tap.id)}-title" data-menu-section>
      <div class="menu-cat-head"><h3 class="cat-title" id="${esc(tap.id)}-title">${esc(tap.title)}</h3><p class="cat-intro">${esc(tap.intro)}</p><figure class="cat-photo cat-photo-tall">${picture('tap-pour', { alt: 'A bartender pouring beer into a branded Alibi pint glass', sizes: '(min-width: 900px) 22vw, 65vw', max: 800 })}<figcaption>At the Alibi bar.</figcaption></figure></div>
      <div class="tap-body"><div class="flight"><h4 class="flight-name">${esc(tap.feature.name)}${marks(tap.feature.marks)}</h4><p>${esc(tap.feature.desc)}</p></div><dl class="beer-list">${tap.items.map(beer).join('')}</dl><p class="gluten">${esc(tap.gluten)} ${ext(L.glutenReduced, 'Read Alibi’s gluten information')}</p></div>
    </section>
    <section class="menu-cat" id="${esc(na.id)}" aria-labelledby="${esc(na.id)}-title" data-menu-section>
      <div class="menu-cat-head"><h3 class="cat-title" id="${esc(na.id)}-title">${esc(na.title)}</h3><p class="cat-intro">${esc(na.intro)}</p><p>${ext(L.hoppyHour, 'Meet Hoppy Hour')}</p></div><dl class="drink-list">${na.items.map(drinkItem).join('')}</dl>
    </section>
    <section class="menu-cat" id="${esc(cocktails.id)}" aria-labelledby="${esc(cocktails.id)}-title" data-menu-section>
      <div class="menu-cat-head"><h3 class="cat-title" id="${esc(cocktails.id)}-title">${esc(cocktails.title)}</h3></div><dl class="drink-list">${cocktails.items.map(drinkItem).join('')}</dl>
    </section>
    <section class="menu-cat" id="${esc(wine.id)}" aria-labelledby="${esc(wine.id)}-title" data-menu-section>
      <div class="menu-cat-head"><h3 class="cat-title" id="${esc(wine.id)}-title">${esc(wine.title)}</h3><p class="cat-intro">${esc(wine.intro)}</p></div><div class="wine-groups">${wine.groups.map((g) => `<div class="wine-group"><h4 class="menu-subheading">${esc(g.label)}</h4><ul>${g.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('')}</div>
    </section>
    <section class="menu-cat" id="${esc(bottles.id)}" aria-labelledby="${esc(bottles.id)}-title" data-menu-section>
      <div class="menu-cat-head"><h3 class="cat-title" id="${esc(bottles.id)}-title">${esc(bottles.title)}</h3><p class="cat-intro">${esc(bottles.intro)}</p></div><dl class="beer-list">${bottles.items.map(beer).join('')}</dl>
    </section>
    <section class="menu-cat" id="${esc(menu.cans.id)}" aria-labelledby="cans-title" data-menu-section>
      <div class="menu-cat-head"><h3 class="cat-title" id="cans-title">${esc(menu.cans.title)}</h3><p class="cat-intro">${esc(menu.cans.intro)}</p><p class="fine">${esc(menu.cans.note)}</p></div>
      <div><ul class="can-menu-list">${menu.cans.items.map((c) => `<li>${esc(c.name)}</li>`).join('')}</ul><p>${esc(menu.cans.more)}</p></div>
    </section>
  </div>
</section>

<section class="section pickup-strip" aria-labelledby="pickup-title">
  <div class="container split">
    <div><h2 class="section-title" id="pickup-title">Order pickup</h2><p>Order food to take with you. Choose an available pickup time when you order.</p><p class="fine" ${freshnessAttrs(hoursChecked(site, events), today, events.staleAfterDays)}>${esc(kitchenCutoff(site))}</p>${nextClosure ? closureNotice(nextClosure, today, 'closure-note') : ''}</div>
    <div class="actions">${btn(L.order, 'Order pickup', { external: true })}${btn('/visit/', 'Plan a visit', { variant: 'secondary' })}</div>
  </div>
</section>`;
}
