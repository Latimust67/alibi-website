# Alibi Incline Public House — The Long Table

## Repository setup

This repository contains the current website source and its artwork. Uploading it
to GitHub does not publish or launch the website. Local review captures, unused
hero explorations, installed dependencies and generated output are excluded.

After cloning, run `npm ci` to install the locked dependencies. `npm run build`
generates `dist/` without starting a server. Run `npm run serve` only when a local
preview is wanted. Some historical notes below refer to files in the original
design workspace that are not included in this repository.

Private, local owner-presentation concept. This is the current **second draft**. No publication, owner contact, form submissions, analytics, checkout clone, or backend. The old `../incline-demo/` is the retired first draft; its preview is disabled and original entry files are archived for recovery. See [draft status](../DRAFT-STATUS.md).

## Preserved baseline and hero exploration — September 28, 2026

Keep the current “Find your kind of corner” artwork, the current events artwork provisionally, the illustrated beers, the carousel, and the mobile experience. Five generated hero proposals are saved separately in [hero concepts](hero-concepts/index.html), with their [exact prompts](hero-concepts/PROMPTS.md). These images explore a clearer opening for Alibi; none has been applied to the website.

## Desktop expansion — September 28, 2026

The desktop presentation now fills the opening with a larger house illustration
and carries warmer linen, amber, timber and pine chapters through Home, Menu,
What's On and Visit. The earlier six illustrated beer worlds return under
“Made by Alibi. Best with company.” The hanging-photo carousel has its own
full-width hero after the beer section, with a curved rope, lights, dragging
and previous/next/pause controls.

These additions start at 1000px. The existing mobile stylesheet, script and
visible page content are preserved. The desktop photo sources select a tiny
transparent placeholder below that breakpoint. The original three-can section
remains on mobile. Reduced motion keeps the beer scenes in ordinary document
flow and disables the carousel's automatic movement. No JavaScript retains
readable scenes and a horizontally scrollable photo strip.

Changes live in `src/styles/desktop.css`, `src/scripts/desktop-story.js` and the
three `desktop-experiences` files; the original `site.css` and `site.js` remain
unchanged. [Direction and scope](change-notes/desktop-september-28/DIRECTION.md).
The illustrated scenes and carousel received the focused review below;
historical scores later in this document describe the earlier version.

### Illustrated interior and deck rope

“Find your kind of corner” now opens onto an original illustrated interior.
“Good company. Good plans.” pairs its calendar with a matching illustrated deck
and the moving photo rope. Hovering keeps the rope moving; the explicit Pause
control still stops it. The previous standalone bottom carousel was removed.

The initial independent reviewer compared the rope over the interior (7.5/10) with the
rope over the deck (8.4/10). The deck version was selected and retained, then
improved with smaller, more widely spaced photos, one continuous control rail
and a tighter transition to the beer section. That version scored **9.0/10 after two
of the three permitted review rounds**. [Review and evidence](review/scene-comparison/REVIEW.md).

These scene changes remain desktop-only. The phone layout, original shared
stylesheet and shared script are preserved. New scene code is in
`src/templates/scene-composition.mjs` and `src/styles/scene-composition.css`.
[Generated artwork and exact prompts](source-assets/art/scene-comparison/PROMPTS.md).

### Dedicated carousel hero

The carousel now has its own full-width deep-green section, “You’re in good
company,” after the six beer worlds. Its original continuous 26px/s horizontal
loop, sagging rope, moving lights, portrait prints and gentle sway are restored.
Hover never pauses it. Explicit Pause stops autoplay and momentum; dragging,
arrows, keyboard control and reduced-motion support remain available.

The illustrated deck stays in the events section without the carousel overlay.
The original phone sections are unchanged. This revision has not received a
new browser or scored visual review; the 9.0 score above is historical.

## Preview and restart

**New preview: http://localhost:4175/** (loopback only).

```sh
cd '/Users/larsen/Desktop/Alibis wesbite/incline-rework'
npm start
```

If already built, `npm run serve` starts only the server. To select another free port: `PORT=4176 npm run serve`. Ports 4173 and 4174 belong to other previews and were left alone. Requires Node 18+; no dependency install is needed to build or serve. Build output is `dist/`.

## Complete outline

```text
GLOBAL — G1 Navigation and practical status; G2 Footer and source/illustration credits.
HOME / — H1 The Long Table hero; H2 Something good to share; H3 Choose your seat; H4 Good company, on the calendar; H5 Made by Alibi; H6 Come on over.
MENU /menu/ — M1 Come hungry hero; M2 Food menu; M3 Drinks menu; M4 Pickup and practical details.
WHAT'S ON /whats-on/ — W1 Join the house hero; W2 Upcoming events and exceptions; W3 Bring your people.
VISIT /visit/ — V1 Find your Alibi hero; V2 Hours and getting here; V3 The spaces and house notes; V4 Gather here.
404 — A clear route back to Home, Menu and Visit.
```

## What changed

The new version tells a single hospitality story: arrive at the house, share a meal, find a seat, join an event, discover the house beers, and plan a visit. A source-specific original print family replaces the old unrelated painted worlds. Genuine food is the second major visual, and people/events appear before a compact three-can still life.

The desktop signature reveals the real pizza-and-pints photograph inside a folded illustrated invitation. That same image and frame expand into the next section. Scroll stays native; headings and links remain in normal flow. It is a pure scroll-position transformation, reversible and safe to enter mid-page, recomputed after resize/font load. Enablement needs a fine pointer, width at least 1000px, motion preference allowing animation, decoded art/food images and valid anchors. Failure leaves the static sequence.

Phone, coarse-pointer, reduced-motion and no-JavaScript views show the composed arrival illustration, then an already-open invitation edge around the full-size genuine meal photograph. The separate Inside / The deck / Beer Forest buttons show actual venue photographs and practical guidance. With no JavaScript, all three panels remain readable. Menu content, routes and official links work without JavaScript.

## Necessary art adjustment

The master remains 1800×1200 in conceptual coordinates. Its invitation aperture is `(1000,770,480,320)` instead of the storyboard's approximate `(900,720,600,400)`. A standing folded invitation fits the generated tabletop and keeps the photographic rectangle undistorted. Chair is `(690,830,260,355)`. Exact geometry and hinges are in `src/assets/art/geometry.json`. The phone composition has its own drawn invitation and chair. Following round1, lateral photo travel leads its growth to protect the next text column; the static open-paper cue is separately reserved above the photo. Full provenance and file roles: [ASSETS.md](ASSETS.md).

## Content and date handling

- Address: 931 Tahoe Blvd., Incline Village, NV 89451; phone (775) 831-8300.
- Mon–Thu and Sat 11am–9pm, Fri 11am–10pm, Sun 10am–9pm; kitchen until 9pm, last to-go 8:45pm.
- October 5–6 closure overrides conflicting calendar items and regular hours. October 30 cancels dancing only.
- Pacific dates control expiry and today's hours. Snapshots older than 14 days use official-source fallback links.
- The full menu is a published selection, with no prices and no disputed textual Kölsch/Lager/Porter ABVs or disputed vegan Watermelon Salad tag. It makes no live tap promise.
- Aggregate menu/event source dates remain September 26. Individually rechecked near-term events and hours/exceptions are dated September 28. See [DATA-NOTES.md](DATA-NOTES.md).

## Implementation and review

Existing zero-dependency static Node templates/data foundation, local Fraunces and DM Sans, responsive AVIF/WebP photographs and original raster/SVG art. No new frontend framework or animation library. All official external actions remain ordinary links.

Build succeeded for all four routes plus 404. One narrow internal-target/private-path check passed. Before the finishing pass, client JavaScript was 7.5KB raw / 3.1KB gzip and the stylesheet was 31.7KB raw / 7.4KB gzip. These are file sizes, not a real-device performance benchmark. Hero derivatives are 262KB desktop and 159KB phone. Later photographs are lazy-loaded; the shared early-reveal food image is eager.

Independent rendered review finished: **8.3 → 8.4 → 8.8/10 — PASS**. All three authorized rounds are complete; no further review loop was run. Final desktop/phone evidence for all four routes, motion keyframes, static states, tests and material limitations: [REVIEW.md](REVIEW.md) and [round-3 captures](review/round-3/). Research score 8.9/10 describes the prior research packet only.

Round1 identified moving-photo/text collisions, foreground ink over practical text, and phone motif/button overlap. Round2 resolved the home issues but caught a Menu-only motif placement regression. Round3 confirms the corrected Menu motif, bounded paper-leaf opening, clear H2 travel path and all core behavior. The later authorized finishing pass resolves the compact utility text and decorative-cue intersection; the long reference menu remains a known tradeoff. The historical scores above have not been reassessed.

## Four-item finishing pass — September 28, 2026

Practical and source text now has a 14px minimum, with 44px-tall standalone practical, menu-category, event-detail, footer and credits controls. The desktop illustration caption and scroll cue occupy the hero’s clear top strip; the phone caption remains below the art. The original meal-frame contours are now inline SVG: their visible outer stroke eases from 3.5px to 1.5px during photo expansion, compensating for the SVG and photo scales. Static views use the thin frame. Visit has its own editable house/deck/sails/pines SVG, labelled “Illustrated house detail,” at 180px desktop and 140px phone.

One build passed. The focused visual pass inspected Home at 1440×900, 1024×768 and 390×844, forward/reverse photo travel and resize, and Visit at desktop and phone sizes. Menu-category, event-detail, footer and credits controls measured 14px text and 44px height on phone. Reduced-motion and no-JavaScript fallback logic was inspected in source; those two browser modes were not rerun because the available browser controls do not expose them. This was not another scored review round. Evidence and limits: [finishing pass](REVIEW.md#four-item-finishing-pass--september-28-2026).

## Material limitations

A private illustrative proposal, not owner-approved branding or live operating data. Published information can change. Historic photographs do not establish current dishes, weather or tap availability. Public reuse rights and several photo credits remain unconfirmed. Chrome desktop/phone emulation is not physical-device Safari or low-end hardware testing. No external checkout, group inquiry or newsletter submission is exercised. Asset originals and production work stay outside `dist/`.
