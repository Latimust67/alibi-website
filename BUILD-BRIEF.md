# Alibi private redesign prototype

Authorized October4,2026 through coordinating task01a0f926-4c65-7052-ab60-e08e974ff03e. Worktree is an isolated local clone on `design/sign-camera-proof`, based on3f7995d00587a760ab278cd71595012bad53fbee. Original Desktop checkout remains untouched; no configured remote in this clone. Existing dependencies are read through a symlink; no installation.

## Accepted direction

Revised Expressive: an original shallow matte green sign on a plausible upright support, based on actual sign-snow photograph construction. A controlled camera move passes its edge into a full-scale actual room photograph. A restrained room/table push ends in a deliberate full-frame cut to the actual pizza-and-pints photograph; unequal food/tap-pour details; deck diagonals lead into real places; actual concert image creates the dark interval. Then a clean break into the six protected beer worlds, followed by the human-scale original photo rope. No hanging/pendulum sign, tiny aperture, rotating plate, glossy floating slab, invented venue, fake food or generic equal grid.

Visual thesis: the real sign, timber perspective, food and people determine geometry, scale and rhythm. Interaction thesis: a short native-scroll camera passage brings a visitor from the recognizable Alibi sign into the real room and meal, then direct place controls support choosing where to sit. Intensity expressive; phone separately composed and normal-scrolling.

Home is one continuous story with direct links to the existing substantive `/menu/`, `/whats-on/` and `/visit/` routes. Site shell remains familiar. Primary audience: pub visitors deciding about food, place, events and a visit; no demographic assumptions. User-authorized private owner presentation only. No public push/deploy, external messages, accounts, forms or reservations.

## Palette and type contract

New composition uses warm paper from timber/food photography, dark green from the pub's surroundings, and a brighter sign green derived from the actual green sign. Restrict strong green to sign and selected place controls. Use actual photography without blanket tinting. Evening surface comes from the concert image; it is a single interval. Existing beer-world palettes and rope materials are protected exceptions.

Paper `#f3eee3`, ink `#152c23`, muted `#4e6055`, sign artwork green `#35b52c`, sign edge `#163722`, timber `#7b6448`, evening `#101c18`, rule `#b5b8a6`, focus `#b66a25`, white `#fffdf7`. Colors flow through explicit new `--house-*` tokens. Photograph-overlay gradients are declared media roles. Existing semantic warnings/closure and all beer/rope tokens remain inherited until reviewed.

Use existing local DM Sans for new display/body/utility with deliberate size and weight; the authentic SVG mark provides character. Do not repeat the previous italic serif heading/eyebrow/button pattern. Protected beer/rope typography retains its identity. No new font or library.

## Reuse verdict

Wrap installed GSAP3.14.2/ScrollTrigger for bounded desktop scroll orchestration. Use one original Blender sign asset rendered as 61 transparent WebP frames with a separately served phone poster. Preserve its 8:5 coordinate system in a responsive wrapper. Reuse the current responsive picture helper, route shell and normal navigation. Preserve original beer/rope mechanics rather than adopting another carousel. Sharp0.35.5 is available only for local asset derivatives/QA. No new subsystem justifies package installation. Blender5.2.2 produced the shallow supported sign and camera truck. Two editable packed .blend files and generation scripts are in asset-work/sign/. No modeled venue or separate decorative object was made. The real venue, food and people use existing Alibi photography.

## Interaction contract and acceptance

- Arrival: static sign+real room+identity/actions immediately visible. Desktop≥1000px and no reduced-motion preference enhance to sticky native-scroll stage; bounded perspective/occlusion leads to unobstructed room. Reverse retraces scene, fast scroll reaches stable endpoint, no wheel interception. Resize/matchMedia teardown restores ordinary document flow.
- Food: large real meal image and bold direct heading; modest native-scroll perspective/image movement only. Copy/actions remain readable. Unequal-sized real food and tap-pour details connect the room/table rather than becoming equal cards.
- Places: real Inside/Deck/Beer Forest photographs; explicit named buttons with pressed-state semantics; keyboard/touch equivalence. No fictional spatial map. Outdoor seasonal/weather qualification remains visible.
- Phone: custom sign/mark crop paired with visible real room; no long pin, no desktop canvas. Main actions near top; intentional asymmetric food sequence; usable place selector. Show all six beer identities with lightweight actual can assets and a static human photo sequence. Verified phone loading requests neither desktop scene assets nor sign sequence frames.
- No JS/reduced motion: readable full content, native links and static photography. System preference honored automatically; no nonfunctional motion toggle.
- Preserve six desktop beer worlds, official can proportions, stacking, focus handling and reduced-motion behavior. Preserve original rope geometry/controller/assets, drag, explicit controls and pauses. Copy changes may use only the supplied6.1Sol handoff; mechanically significant changes require explicit evidence.
- Full prototype proof includes opening→food→place and phone opening, not an isolated object render. Desktop pointer, slow/fast/reverse scroll, resize, phone touch, keyboard, system reduced motion and static path are the focused checks. Build and checks are separate from visual acceptance; fresh independent reviewer is coordinated by parent.

## Copy and factual authority

Use exact6.1Sol revised Expressive handoff received in this task on October4. No alternate slogans. Hero artwork carries name; descriptor/location/actions only. Required visible closure: Closed October5 and6; back WednesdayOctober7. Final visible dates and hours rechecked against official sources before final review. Protected private-concept credits retained. Six beers are a selection, not the entire lineup; no ABVs or live-tap claim. User authorizes current Alibi photographs for private owner presentation; preserve provenance.

## Limits

All research screenshots stay on this Mac. Reference research is still partial:3 fully inspected supporting keepers, one verified motion anchor; desktop-only references are not passed as full phone evidence. Blender render/bake cumulative limit600seconds for this coherent asset, includes all failed/preview jobs; one worker, hard project deadline15:00UTC. Metered Blender runtime is 29.765272 seconds total across five jobs (including previews and failures) of the authorized 600 seconds. All render jobs have ended; no further render is planned.


## Current review baseline — October 4, 09:28 UTC

Private localhost preview: http://127.0.0.1:4176/; routes /menu/, /whats-on/, /visit/. The local server is owned by this task. The earlier original preview on port 4175 remains untouched. From this clone, `node build.mjs` rebuilds the static dist; `PORT=4176 node tools/serve.mjs` starts the preview when the port is free.

Source is frozen for fresh independent review at SHA256 `06c6da0925b7d2d7046d47a7d4603df9b7f9f86b303592ca028d935bd7606caa`. This is a source-tree fingerprint, not a Git commit. Algorithm and time are in review/final-pass/baseline.json. No new Git commit, remote, push or deployment has been created. Independent visual and technical rechecks of the final correction batch are pending. The requested 6.1Sol author copy audit is complete and its seven exact patches plus neutral concert alt text have been applied.

The latest bounded review batch fixes sign stretching, removes the trapezoid meal reveal, shortens the arrival from 3.4 to 2.8 viewport heights, moves Menu categories above its hero photograph, uses one header-plus-rail anchor offset, simplifies the phone Beer photograph, tightens phone route headings/spacing, restores practical-fact freshness, adds the closure notice to Menu, fixes no-JS phone header overlap, and closes late decoded bitmaps after simulated canvas context loss.

Latest author verification: 176/176 targeted checks across Chromium and WebKit for room coverage, JS/no-JS anchors, copy and route accessibility; 37/37 broader checks rerun after the unload lifecycle fix covering six desktop beer worlds, photo-rope drag/arrows/pause/keyboard, place selector, responsive teardown/re-entry, phone navigation, reduced motion, no JS, failed-frame fallback, date expiry and route accessibility scans. No page errors. These are author checks, not a claim of independent approval, physical-device testing, measured resident memory or complete WCAG conformance.

Latest local evidence and refreshed per-route rendered text are in review/final-pass/. The previous complete copy inventory remains in review/cut-pass/content-audit.txt; the final-copy-changes.txt records the approved deltas. The larger reviewer reports are in the coordinating task's separate local directories. Screenshots stay on this Mac.

## Asset and behavior preservation

The original source /Users/larsen/Desktop/Alibis wesbite/incline-rework remains clean at 3f7995d00587a760ab278cd71595012bad53fbee and has no remote. Original desktop-experiences.css is byte-identical (SHA256 76d20667411a1ca6143ca3ee7d90622d875fa181f6b762347a313c0c5fc8857c). Changes to the protected desktop-experiences.js are limited to the approved Pause photos/Play photos labels; the photo-rope controller is preserved. Beer templates use the approved six name/style/description triplets while retaining original can artwork, shapes and ordering.

Sign delivery: 61 frames total 897,986 bytes on disk; phone poster 22,506 bytes; desktop poster 24,915 bytes. At most eight decoded bitmaps retained plus one in-flight decode. Frame dimensions are 1440×900. Context loss, failed fetch, media-query teardown and reduced-motion switching release the sequence and restore a static poster. Raw pixel arithmetic is approximately 41.5 MB for eight RGBA frames; this is an estimate, not resident memory measurement, and excludes canvas/GPU overhead.

The actual dining room, pizza/pints and deck have derivatives up to 1920px from native photographs; no source upscaling. The dining room uses iph-dining-hall-long-tables.jpg, matching the lower-resolution variants. Sign, food, place, music and guest photos come from the original project's Alibi website source-asset folders. The modeled sign adapts the official mark as a new shallow boxed interpretation; it is not represented as an exact reproduction of the ornamented physical sign. Photo credits and any public-use permissions remain to be confirmed before public use.

## Content maintenance

Venue hours, kitchen cutoff, October 5–6 closure/reopening, family/dog/outdoor policies and displayed event detail pages were rechecked against Alibi's official pages October 4. Facts expire after the inherited 14-day verification window; event cards also expire at their explicit Pacific end instant. Closure takes precedence over regular hours. Menu recipe descriptions remain a visibly dated September 26 snapshot. Official menu, ordering, calendar, directions, phone and group-event links remain the source of current operational details.


## Final corrections and navigation diagnosis

The room now zooms around its existing origin without the upward pan; the lower edge stays beyond the stage at 58%, 65%, 66.5% and on reversal at 1024, 1440 and 1920 widths. No extra zoom or new render was introduced. No-JS Menu anchors use the 76px sticky header plus 24px clearance above 700px; phones retain 24px because their no-JS header is in normal document flow.

The separate WebKit navigation observation was reproduced and repaired. GSAP reversion during pagehide called the sign frame update before sequence cleanup, initiating a new fetch on the unloading document. The active sequence now disposes before media.revert, and disposal is idempotent. The before trace retains the original access-control error and stack; the after trace has no new unload fetch or page error. Four repeated Home→Menu→Back WebKit rounds restore the active sequence and bounded cache without page errors, unhandled rejections, console errors or cancelled requests. See navigation-settled-before-fix.json, navigation-settled.json and webkit-history.json in review/final-pass/.

No error messages were filtered or suppressed in production. Ordinary navigation may still cancel a request that was legitimately pending before navigation; that rejection is caught by the existing fallback/cleanup path. This is distinct from initiating a new request during teardown.
