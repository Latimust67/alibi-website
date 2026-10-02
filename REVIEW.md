# The Long Table — rendered build review

Independent review of **incline-rework**, not the earlier demo. Target 8.5/10; maximum three complete build/review rounds. Research's 8.9 score is not a build score.

**Final result: round 3 passed at 8.8/10.** Scores: 8.3 → 8.4 → 8.8. The authorized review loop is complete; no fourth round is proposed.

## Round 1 — 8.3/10, revision required

Reviewed September 28, 2026 at `http://127.0.0.1:4175/`. The reviewer inspected actual Chromium renders of all four routes at **1440×900** and **390×844**, full-page images plus section frames, the desktop A/B/C story, and the supporting interaction states. A supplemental **1280×720** opening view confirmed the reported overlap at narrower desktop size. The reviewer viewed the resulting sheets and full-size keyframes. This was one review round; supplemental captures investigated concrete issues from that same baseline.

| Category | Weight | Score | Finding |
|---|---:|---:|---|
| Art direction and craft | 25% | 8.7 | The original print is detailed, recognizable and specific: charcoal pub, rail, shade sails, granite garden and long timber table. The one ink family survives into the rest of the site. Static open-invitation leaves are visually thin; they read more as frame edging than unfolded paper. |
| Narrative and asset coherence | 20% | 8.0 | The actual meal, spaces and people form a clear story before the small beer chapter. The real photograph retains its crop and identity, but its intermediate travel crosses the food copy. |
| Alibi relevance and truth | 15% | 9.2 | Real venue/food/people photos, useful sources, dated finite events and honest illustration credit. Published closures and cancellations are correctly distinguished. No false live taps, lakefront or wood-fired claim observed. |
| Typography and composition | 15% | 7.8 | Strong serif hierarchy and readable menu. Hero's practical line intersects foliage, and the intermediate photo breaks H2's clear text field. |
| Useful CTAs and information | 10% | 8.8 | Food/visit actions are immediate; menu, dates, hours, pickup and inquiries work as ordinary links. Phone decorative route motif partially crosses secondary actions. |
| Responsive behavior | 10% | 7.8 | All four phone routes fit 390px with no horizontal overflow; separate phone art is convincing. Desktop copy needs a protected field and the phone route motif needs repositioning. |
| Interaction quality | 5% | 6.5 | Native scroll, reverse, resize, seats and navigation operate correctly, but the signature's travel path visibly collides with the next headline. |
| **Weighted total** | **100%** | **8.31 → 8.3** | **Below 8.5; do not mark this round passed.** |

### Required fixes, in priority order

1. **Protect the H2 text throughout image travel.** At measured progress **0.70–0.80**, the photograph enters the headline and body column. At 0.75, the image right edge is x1014 while the text column begins x945; the heading and body visibly sit over the pizza photograph. This violates the stated clear-copy path contract even though A/B/C endpoints look good. Move the image into its left column before its growth can reach the text, or otherwise use a measured safe path; do not hide or delay the heading. Evidence: [travel at 75%](review/round-1/desktop-hero-travel75.png), [measured intersections](review/round-1/detail-report.json).
2. **Give the desktop hero actions/status/notice a truly clear paper field.** At 1440px, foliage reaches the house-notes link and reopening text. At 1280px, it also runs behind the Plan a visit arrow and a larger part of the status line. Reposition/scale the scene or reserve a paper clearing without compromising the master or shrinking copy. Evidence: [1440 opening](review/round-1/desktop-home-top.png), [1280 opening](review/round-1/desktop1280-hero.png).
3. **Keep the route detail away from phone buttons.** On Visit, the small sail drawing lies over the Call the pub icon/border; Menu has the same risk over Order pickup. Place the motif outside the action rectangle with deliberate spacing. Evidence: [phone Visit opening](review/round-1/phone-visit-top.png), [phone Menu opening](review/round-1/phone-menu-top.png).

### Polish opportunity within those fixes

The phone/reduced-motion open-invitation sides are only slender outline strips; making a modest, recognizable folded-paper hinge/leaf more visible would strengthen the static midpoint. Keep the real food photo large and unwarped. Evidence: [phone meal](review/round-1/phone-home-section-1.png), [reduced motion](review/round-1/reduced-motion-sequence.png). This is a craft weakness, not a claim that the static food or links are missing.

### Behavior and hard-gate evidence

- **New A1 artwork exists and is used.** This is a purpose-made house/garden/table print, with a separately composed phone scene. It is not the old unrelated can worlds. Real menu/visit actions appear immediately.
- **Meaningful A/B/C transformation exists.** The two cover leaves open and the foreground chair draws back; the same HTML food photograph moves from the table into its H2 figure. Measured start 194.64px, end 786px: **591.36px** active range, within the 480–720 target. [A](review/round-1/desktop-hero-A.png), [B](review/round-1/desktop-hero-B.png), [C](review/round-1/desktop-hero-C.png). This does not excuse the path collision described above.
- **Slow, fast, reverse and resize:** measured 10-step traversal advances monotonically; fast reverse returns to the origin, fast forward returns to the destination, and resizing to 1100×850 recomputes a valid state without horizontal overflow. [Reverse](review/round-1/desktop-hero-reverse.png), [resize](review/round-1/desktop-resize.png), [interaction report](review/round-1/report.json).
- **Seat selection:** Space on the focused Deck button selects only Deck and updates pressed state; rapid Deck/Forest/Inside/Forest selection settles on Forest with no running animation. Phone touch selects Beer Forest. [Keyboard state](review/round-1/desktop-seat-keyboard.png), [phone touch](review/round-1/phone-seat-touch.png).
- **Phone navigation:** opening focuses Home, exposes all links with `aria-expanded=true`; Escape closes and returns focus to the Menu button. [Open state](review/round-1/phone-nav-open.png).
- **Reduced motion:** the story enhancement is absent, photograph transform and clip are `none`, and the composed static sequence is visible. [Reduced view](review/round-1/reduced-motion-sequence.png).
- **No JavaScript:** all three seating panels remain displayed, navigation is readable, and CSS limits the homepage to three event rows. The real meal photo is present after decoding. The first supplemental no-JS capture caught an unfinished async image paint; the loaded capture supersedes that frame. [Loaded no-JS meal](review/round-1/phone-nojs-loaded.png), [loaded image metadata](review/round-1/nojs-loaded-report.json), [static state data](review/round-1/detail-report.json).
- **Date exceptions:** emulating October 5 gives “Closed today for our staff trip,” Monday's hours become “Closed today,” and October 6 trivia is absent. Emulating October 30 gives the stale official-hours link and calendar fallback; it does not treat the pub as closed. The ordinary calendar visibly carries the October 30 dancing cancellation and separate October 5–6 closure. All date evidence is in [report.json](review/round-1/report.json).
- **Routes and anchors:** all four pages rendered; `/menu/#food` and `/visit/#hours` land approximately 98px below the viewport top, clear of the 64px phone header. The 404 route provides Home, Menu and Visit. [404](review/round-1/phone-404.png).
- **Errors:** no script errors or broken images found on the four routes. The only console network error is the deliberately requested `/unavailable/` returning its correct 404 status.

### Route sheets

| Route | Desktop | Phone |
|---|---|---|
| Home | [Sheet](review/round-1/desktop-home-sheet.jpg) | [Sheet](review/round-1/phone-home-sheet.jpg) |
| Menu | [Sheet](review/round-1/desktop-menu-sheet.jpg) | [Sheet](review/round-1/phone-menu-sheet.jpg) |
| What's On | [Sheet](review/round-1/desktop-whats-on-sheet.jpg) | [Sheet](review/round-1/phone-whats-on-sheet.jpg) |
| Visit | [Sheet](review/round-1/desktop-visit-sheet.jpg) | [Sheet](review/round-1/phone-visit-sheet.jpg) |

Each sheet has corresponding full-size section frames and a `*-full.png` capture in [the round-1 evidence folder](review/round-1/). Sources and asset creation method are documented separately in ASSETS.md and DATA-NOTES.md.

### Limitations

Chromium desktop and phone emulation; real-device Safari, low-end performance and owner response remain unmeasured. This is an authorized private concept, not public image-rights clearance. No purchases, inquiries, owner contact or production publication were performed. Network image totals include lazy loading during the full-page inspection and warm browser cache for later routes; they are not a controlled first-load performance benchmark. Existing `incline-demo/` was outside the reviewer's write scope.

## Round 2 — 8.4/10, one regression requires the final revision

Re-rendered all four routes at 1440×900 and 390×844, inspected the updated route sheets and full-size changed frames, and inspected the opening at 1280×720 and 1100×850. The reviewer also rechecked the changed 70/75/80% travel states, reverse/fast traversal, resize, reduced motion, loaded no-JS meal, keyboard/touch seats, phone navigation, a real navigation-link click and browser back. The unchanged date/closure/404 checks from round 1 remain supporting evidence; no redundant broad test suite was run.

| Category | Weight | Score | Change |
|---|---:|---:|---|
| Art direction and craft | 25% | 8.6 | Detailed coherent master retained; static open-paper cue now reads clearly. Right cover leaf is visibly clipped at B; Menu introduces a misplaced oversized motif. |
| Narrative and asset coherence | 20% | 8.7 | Photo moves left before expanding, preserving the food-copy field; static story is stronger. |
| Alibi relevance and truth | 15% | 9.2 | No content/fact regression observed. |
| Typography and composition | 15% | 7.5 | Home/Visit improved, but the newly misplaced Menu motif crosses its food heading at desktop. |
| Useful CTAs and information | 10% | 8.1 | Hero actions/status now have clear paper fields; the Menu category rail gets a new decorative collision. |
| Responsive behavior | 10% | 7.5 | Four routes still fit without horizontal overflow, but oversized Menu artwork overlaps the phone category rail. |
| Interaction quality | 5% | 8.6 | Photo-copy collision resolved, controls and navigation/back pass; right leaf cropping remains a small craft defect. |
| **Weighted total** | **100%** | **8.385 → 8.4** | **Below 8.5; one final revision/review remains under the limit.** |

### Resolved

- **H2 path:** no image intersections with H2 eyebrow, headline, body or actions at p0, .35, .70, .75, .80 or 1. At .75 the image ends at x768, safely left of the x945 copy column. [75% frame](review/round-2/desktop-hero-travel75.png), [70%](review/round-2/desktop-hero-travel70.png), [80%](review/round-2/desktop-hero-travel80.png), [measured report](review/round-2/report.json).
- **Hero paper field:** actions, hours, house-notes link and closure notice are visually clear at [1440px](review/round-2/desktop-home-top.png), [1280px](review/round-2/desktop1280-hero.png) and [1100px](review/round-2/desktop1100-hero.png). At 1100px the closure's final date wraps, but remains readable.
- **Visit/What's On route motif:** moved below the real photograph and away from actions. [Phone Visit](review/round-2/phone-visit-top.png), [phone What's On](review/round-2/phone-whats-on-top.png).
- **Static invitation:** the two drawn paper leaves above the real meal provide a recognizable continuation of the hero invitation. The photo stays large, visible and unwarped. [Phone meal](review/round-2/phone-home-section-1.png), [reduced motion](review/round-2/reduced-motion-sequence.png), [no JavaScript](review/round-2/phone-nojs-sequence.png).

### Required final fix

**Move the Menu motif into the actual Menu hero figure.** The attempted placement change inserted `route-detail` into `foodPair()`'s Pork Belly Bao figure instead of the Menu hero figure. Its absolute positioning and the food-pair image rule enlarge it across the category rail on phone and the food heading on desktop. This is a new implementation regression, not an unchanged preference. Remove that misplaced image, insert it in the reserved hero-caption area like Visit/What's On, and keep its dimensions isolated from food-photo selectors. Evidence: [desktop Menu sheet, center top frame](review/round-2/desktop-menu-sheet.jpg), [phone Menu opening](review/round-2/phone-menu-top.png), [phone Menu sheet](review/round-2/phone-menu-sheet.jpg). Source pointer for implementing the fix: `src/templates/menu.mjs`, `foodPair()` near line 34.

### Remaining craft adjustment

The open right leaf is partially cropped at the viewport's right edge in [B](review/round-2/desktop-hero-B.png); the photograph is fully inside the viewport. Bound the right leaf's travel by available space while preserving the opening action. This is a smaller craft issue than the Menu collision. [A](review/round-2/desktop-hero-A.png) and [C](review/round-2/desktop-hero-C.png) remain legible.

### Round-2 behavior record and evidence

[report.json](review/round-2/report.json) reports no console errors, no broken images, and no horizontal overflow on any of the eight route/viewport combinations. Space selects Deck; touch selects Beer Forest. Phone Menu exposes links and focuses Home, Escape closes it and returns focus. Clicking the Menu navigation link loads `/menu/` with the correct active underline; browser back returns to `/`. Reduced motion removes transformation/clipping. No-JS renders the loaded meal and all three space panels.

| Route | Desktop | Phone |
|---|---|---|
| Home | [Sheet](review/round-2/desktop-home-sheet.jpg) | [Sheet](review/round-2/phone-home-sheet.jpg) |
| Menu | [Sheet](review/round-2/desktop-menu-sheet.jpg) | [Sheet](review/round-2/phone-menu-sheet.jpg) |
| What's On | [Sheet](review/round-2/desktop-whats-on-sheet.jpg) | [Sheet](review/round-2/phone-whats-on-sheet.jpg) |
| Visit | [Sheet](review/round-2/desktop-visit-sheet.jpg) | [Sheet](review/round-2/phone-visit-sheet.jpg) |

Full-page and original section frames sit alongside those sheets. The round-1 limitations still apply: Chromium emulation, not real-device Safari or low-end benchmarking; no transactions, owner contact or public publication; no claim of public photography rights clearance.

## Round 3 — 8.8/10, PASS — final allowed round

The reviewer independently rendered and viewed all four final routes at **1440×900** and **390×844**, including full-page captures and section sheets. Renewed full-size evidence covers the Menu hero/category boundary, invitation A/B/C and 70/75/80% travel, 1280px and 1100px openings, the phone/static meal and reduced motion. Final interaction evidence rechecks reversal, fast scrolling, resize, keyboard/touch seat selection, navigation Escape/focus, clicking a route link and browser back. Stable date exceptions, stale fallbacks, anchors and 404 retain their round-1 recorded checks; those unchanged behaviors were not put through another broad test loop.

| Category | Weight | Score | Final assessment |
|---|---:|---:|---|
| Art direction and craft | 25% | 8.7 | The detailed house/table print and its restrained companion details form a recognizable, cohesive visual language. Real food and room photographs remain clear evidence. |
| Narrative and asset coherence | 20% | 8.8 | Arrival, the opening invitation and the same real meal are legible; food, seating and people precede the compact beer chapter. The static phone sequence has a recognizable paper-leaf cue. |
| Alibi relevance and truth | 15% | 9.2 | Useful actual offerings and spaces, honest published snapshots, correct closure/cancellation distinctions and explicit private-demo provenance. |
| Typography and composition | 15% | 8.7 | Strong hierarchy and varying chapter proportions. Both the moving image and decorative details now respect the principal text/action fields. |
| Useful CTAs and information | 10% | 9.0 | Menu/visit actions appear immediately; food/drink anchors, practical information, official event details and group inquiries have real destinations. |
| Responsive behavior | 10% | 8.6 | Separate phone artwork, readable single-column content and all four routes without horizontal overflow. Minor utility text remains small and the full menu is lengthy. |
| Interaction quality | 5% | 8.5 | Bounded reversible transformation, stable target links, useful seat selection, accessible phone navigation and working static/reduced paths. Motion is purposeful rather than decorative excess. |
| **Weighted total** | **100%** | **8.805 → 8.8** | **Genuine pass against the 8.5 target. No additional review round.** |

### Final corrections confirmed in rendered pixels

- **Menu motif is correctly contained.** One 80×45 motif is inside the Menu hero figure's caption area; none remain inside the food-photo pair. The category rail and food heading are clear at both sizes. [Desktop Menu opening](review/round-3/desktop-menu-top.png), [desktop Menu sheet](review/round-3/desktop-menu-sheet.jpg), [phone Menu sheet](review/round-3/phone-menu-sheet.jpg). Final browser metadata records `heroMotifs: 1`, `foodPairMotifs: 0`.
- **The open right invitation leaf stays in-frame.** At B, its measured right edge is **1422.81px in a 1440px viewport**, leaving about 17px. The full real meal remains visible and the leaves settle behind its frame. [B](review/round-3/desktop-hero-B.png), [A](review/round-3/desktop-hero-A.png), [C](review/round-3/desktop-hero-C.png).
- **Safe food-photo path remains intact.** Final A/B/C and 70/75/80% samples have no intersection with the H2 eyebrow, headline, body or action group. [75% travel](review/round-3/desktop-hero-travel75.png), [70%](review/round-3/desktop-hero-travel70.png), [80%](review/round-3/desktop-hero-travel80.png). The active range remains **591.36px**.
- **Clear hero utility field remains intact.** [1440 opening](review/round-3/desktop-home-top.png), [1280 opening](review/round-3/desktop1280-hero.png), [1100 opening](review/round-3/desktop1100-hero.png).
- **Static story remains complete.** [Phone meal](review/round-3/phone-home-section-1.png), [reduced-motion meal](review/round-3/reduced-motion-sequence.png), [no-JS meal](review/round-3/phone-nojs-sequence.png).

### Acceptance gates

**Passed within the rendered review's scope:** original A1 exists and is used; desktop A/B/C communicates arrival → invitation → real meal; phone/static story preserves the relationship; useful menu/visit actions are immediate; real photos and currentness wording avoid the prohibited geography/tap/ABV claims; four routes and their navigation work; closure precedence and cancellation distinctions are supported by the dated round-1 behavior evidence; content remains usable without motion/JavaScript; no console error blocks a primary behavior.

The final [browser report](review/round-3/report.json) records **zero console errors, zero broken images and zero horizontal overflow** across all eight desktop/phone route combinations. Keyboard Space selects Deck, a touch selects Beer Forest, Escape returns focus to Menu, clicking Menu navigates correctly, and browser back returns Home. The final reduced-motion view has no story transform/clip; no-JS retains the loaded food photo, readable navigation and all three space panels. The old `incline-demo/` was not in the reviewer's write scope; old-demo preservation and the successful build are the implementer's file/build record, not an invented browser assertion.

### Final evidence by route

| Route | Desktop | Phone |
|---|---|---|
| Home | [Sheet](review/round-3/desktop-home-sheet.jpg) | [Sheet](review/round-3/phone-home-sheet.jpg) |
| Menu | [Sheet](review/round-3/desktop-menu-sheet.jpg) | [Sheet](review/round-3/phone-menu-sheet.jpg) |
| What's On | [Sheet](review/round-3/desktop-whats-on-sheet.jpg) | [Sheet](review/round-3/phone-whats-on-sheet.jpg) |
| Visit | [Sheet](review/round-3/desktop-visit-sheet.jpg) | [Sheet](review/round-3/phone-visit-sheet.jpg) |

Original full-size section images and full-page `*-full.png` files are adjacent to the sheets in `review/round-3/`. They document the actual final local build, not design promises or inherited scores.

### Remaining weaknesses and limits

- The complete Menu page is long, particularly on phone. Its category anchors provide access, but it remains a dense reference rather than a short browsing experience.
- Practical/source text is smaller than the main body copy; the closure's return date wraps onto a second line at 1100px. Both remain readable in the inspected renders.
- The traveling photograph briefly passes through the small decorative art-caption/cue area after the main hero controls have scrolled upward. It does not cross the H2 copy or primary actions; this remains a minor staging imperfection.
- Chromium desktop and phone emulation are the tested environments. Real-device Safari, low-end hardware performance, owner response and public photography-rights clearance remain unmeasured/unconfirmed. No checkout, event inquiry, owner contact or production publication was performed. The score is a reasoned assessment of this private demo, not a performance or conversion guarantee.

**Stop here: three complete build/review rounds have been used, and the final build genuinely exceeds the requested 8.5 threshold.**


## Four-item finishing pass — September 28, 2026

User-authorized implementation of four findings from the later plan comparison. This focused check does not restart the three-round scored review or change its historical 8.8/10 result.

- **Readability and controls:** practical hours, closures, dates, captions, source notes, secondary action labels and footer text use a 14px minimum. At 390px, every measured menu category, visible event-detail, footer-navigation and credits-summary control is 44px tall with 14px text. Home address and house-notes links also measure 44px. Inline prose links retain their normal text flow.
- **Hero staging:** the cue and caption occupy the clear top strip at 1440×900 and 1024×768. Forward and reverse photo travel kept that strip clear; the food heading remains outside the travel path. At 390×844, the cue is hidden and the caption sits below the arrival art.
- **Frame:** the existing three contours are inline SVG. Measured outer screen stroke is 3.500015px at progress .325 and 1.500001px at progress 1, including both scales. Reverse travel visibly restores the heavier small-frame treatment. The phone uses the thin, static open-invitation composition.
- **Visit art:** the new labelled house detail rendered at 180×102px on desktop and 140×79.33px on phone, below the photo in normal flow. It does not intersect the caption or actions. Provenance is recorded in ASSETS.md.
- **Build:** one successful build emitted all four routes plus 404. No new runtime dependency was introduced. No correction round was needed.

Screenshots: [expanded food frame](review/finishing-pass/desktop-food.png), [phone static story](review/finishing-pass/phone-home.png), [desktop Visit](review/finishing-pass/desktop-visit.png), [phone Visit](review/finishing-pass/phone-visit.png).

**Limits:** Home and Visit had no horizontal overflow in the inspected phone states. The source still gates motion on a fine pointer, width and motion preference, resets inline styles on fallback, and supplies thin non-scaling default SVG strokes. Reduced-motion and disabled-JavaScript modes were not independently rerun in this pass: the available browser API exposes neither setting. Prior round-3 captures establish their earlier behavior, not fresh verification of this change. Physical-device Safari and performance remain untested. No broad interaction suite, external action or publication was performed.
