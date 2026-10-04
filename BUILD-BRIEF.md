# Alibi private redesign prototype

Authorized October4,2026 through coordinating task01a0f926-4c65-7052-ab60-e08e974ff03e. Worktree is an isolated local clone on `design/alibi-seam-refinements`, based on local checkpoint a572a1cfc8a611d8efbb24ae0ed0b568c0ad423b (original source3f7995d00587a760ab278cd71595012bad53fbee). Original Desktop checkout remains untouched; no configured remote in this clone. Existing dependencies are read through a symlink; no installation.

## Accepted direction

Revised Expressive: an original shallow matte green sign on a plausible upright support, based on actual sign-snow photograph construction. A controlled camera move passes its edge into a full-scale actual room photograph. A restrained room/table push ends in a deliberate full-frame cut to the actual pizza-and-pints photograph; unequal food/tap-pour details; deck diagonals lead into real places; actual concert image creates the dark interval. Then a clean break into the six protected beer worlds, followed by the human-scale original photo rope. No hanging/pendulum sign, tiny aperture, rotating plate, glossy floating slab, invented venue, fake food or generic equal grid.

Visual thesis: the real sign, timber perspective, food and people determine geometry, scale and rhythm. Interaction thesis: a short native-scroll camera passage brings a visitor from the recognizable Alibi sign into the real room and meal, then direct place controls support choosing where to sit. Intensity expressive; phone separately composed and normal-scrolling.

Home is one continuous story with direct links to the existing substantive `/menu/`, `/whats-on/` and `/visit/` routes. Site shell remains familiar. Primary audience: pub visitors deciding about food, place, events and a visit; no demographic assumptions. User-authorized private owner presentation only. No public push/deploy, external messages, accounts, forms or reservations.

## Palette and type contract

New composition uses warm paper from timber/food photography, dark green from the pub's surroundings, and a brighter sign green derived from the actual green sign. Restrict strong green to sign and selected place controls. Use actual photography without blanket tinting. Evening surface comes from the concert image; it is a single interval. Existing beer-world palettes and rope materials are protected exceptions.

Paper `#f3eee3`, ink `#152c23`, muted `#4e6055`, sign artwork green `#35b52c`, sign edge `#163722`, timber `#7b6448`, evening `#101c18`, rule `#b5b8a6`, focus `#b66a25`, white `#fffdf7`. Colors flow through explicit new `--house-*` tokens. Photograph-overlay gradients are declared media roles. Existing semantic warnings/closure and all beer/rope tokens remain inherited until reviewed.

Use existing local DM Sans for body/utility and most new display headings; the beer introduction and static phone beer names use existing Fraunces with deliberate size and weight; the authentic SVG mark provides character. Do not repeat the previous italic serif heading/eyebrow/button pattern. Protected beer/rope typography retains its identity. No new font or library.

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

All research screenshots stay on this Mac. Reference research is still partial:3 fully inspected supporting keepers, one verified motion anchor; desktop-only references are not passed as full phone evidence. Blender render/bake cumulative limit600seconds for this coherent asset, includes all failed/preview jobs; one worker, hard project deadline15:00UTC. Metered Blender runtime is 30.76084275 seconds total across six jobs (including previews and failures) of the authorized 600 seconds. All render jobs have ended; no further render is planned.


## Current refinement candidate — October 4, 10:12 UTC

Private local preview: http://127.0.0.1:4176/ and /menu/, /whats-on/, /visit/. The task owns this server; the original port4175 preview is untouched. From this clone, `node build.mjs` rebuilds dist and `PORT=4176 node tools/serve.mjs` starts the server when that port is free.

Source frozen at SHA256 `999c9517989281cbfa26e2be6c5dcd472e87073a548f0fe525bf8df240242256`, covering393 files (build.mjs and every src file). This is a tree fingerprint, not a Git commit. Exact algorithm/time/protected hashes: review/seam-refinements/baseline.json. Fresh independent review is coordinated by the parent; its conclusion must be recorded before calling this candidate independently accepted.

The protected previous passing checkpoint is commit `a572a1cfc8a611d8efbb24ae0ed0b568c0ad423b`, branch `checkpoint/alibi-presentation-20261004-0928`. A verified source bundle and built-preview/evidence archive live beside the clone in `../checkpoints/alibi-presentation-20261004-0928/`. That checkpoint had an independent108-check technical pass. Its tree fingerprint was06c6da0925b7d2d7046d47a7d4603df9b7f9f86b303592ca028d935bd7606caa. Do not confuse that acceptance with the refinement candidate.

Refinement changes:
- Arrival now uses the actual friends/food/pints window photograph. Desktop aperture/sign departure remains, followed by a restrained3.5% push and the existing full-frame meal cut. Native photo detail is preserved through1920px derivatives. Phone uses a3:2 photo, small sign upper-left, photo occluding the support, and actions below.
- Phone has six distinct static illustrated beer spreads, made from the original six world artworks plus exact official can art. The12 requested AVIF derivatives total168,912 encoded bytes (six720px worlds101,576; six180px cans67,336). Full desktop scene files and the sign sequence remain excluded from phone requests. Source provenance, crops, dimensions and all format bytes are in asset-work/refinement/media-manifest.json.
- Only the desktop beer introduction wrapper changed: Fraunces heading with explicit word spacing, aligned blocks, visible14px illustration disclosure; height at1440 is303px instead of437.6px. All protected world and rope mechanics are unchanged.
- Exact6.1Sol private-preview titles/descriptions and404 copy replace inherited metadata. Local preview-image metadata references the real group photograph and exact authored alt. No public canonical, social URL/domain/account tag, public deployment or external unfurl claim. The exact brand mark has a cream favicon field and existing dark-ink fill for visibility on light/dark backgrounds. Private-concept footer credits and noindex/nofollow+robots blocking remain.
- One matte-sign comparison was rendered within the same budget and rejected by independent art review: flattening reduced material depth. Original production sign frames/posters remain byte-identical to the checkpoint. No further renders planned.

## Refinement verification and limits

Author checks:176 targeted checks in Chromium/WebKit (coverage/cut/reverse, JS/no-JS anchors, exact copy and route accessibility),37 broader functional checks (worlds, original rope drag/arrows/pause/keyboard, places, phone nav, responsive cleanup, reduced motion/no JS/frame failure and date expiry),90 responsive/media checks across both engines at320/390/768/1024/1440/1920, plus60 presentation details checks. Evidence is in review/seam-refinements/verification/. These are author checks, not independent acceptance, physical-device testing, full WCAG conformance or measured resident memory.

Native image loading varies by engine and scheduling. Chromium prefetched some of the small phone spreads at initial load despite correct native loading=lazy; WebKit did not in the captured runs. The first strict no-prefetch assertion was a harness assumption, not a product defect; original evidence is retained in media-responsive-initial-prefetch.json. No artificial image loader was added. Final measured opening resources and each selected derivative are listed in media-responsive.json. The recorded390px Chromium opening was31 resource entries,653,081 encoded bytes /662,381 transfer bytes; performance-resource sums exclude the navigation document. Desktop resource counts vary with native lazy-image prefetch; use the recorded per-run entries rather than treating a single sum as a fixed budget.

67 protected files (desktop experience CSS/JS/template plus all sign deliverables) match the checkpoint byte-for-byte. Original sign61-frame encoded total897,986 bytes; decoded cache maximum8. RawRGBA cache estimate41,472,000 bytes; one pending decode can transiently reach46,656,000 bytes. These are estimates, not browser-memory measurements.

History lifecycle: true persisted BFCache restoration was not observed in either headless engine; both real navigations returned persisted:false, recovered a working stage and reversed to frame0 with zero errors. Source intentionally retains active timeline/cache when persisted:true. Synthetic persisted event tests preserved the stage in both engines, but are not proof of an actual BFCache restoration. Evidence: review/seam-refinements/bfcache.json. No additional product change justified.

External-link limitations remain from the prior independent review: Google Maps and Instagram browser destinations verified; Toast correct venue/menu confirmed by read-only retrieval, but interactive browser access was Cloudflare403. No bypass, order or external write occurred. All screenshots and review artifacts remain on this Mac; none uploaded.
