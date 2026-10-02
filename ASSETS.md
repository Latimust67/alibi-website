# Asset provenance — The Long Table

Created September 28, 2026 for a private Alibi Incline Public House owner demo. The user authorized use of public Alibi imagery for this private pitch. This record does **not** claim public licensing clearance or photographer permission beyond that authorization. Source photography remains photography; the new hero is explicitly an artistic interpretation of the venue.

## Restored desktop material — September 28, 2026

At the user's request, the desktop drinks section and photo-string carousel
reuse the preserved `../incline-demo/` assets. Files beginning `desktop-` in
`src/assets/img/` are unchanged optimized copies: six label-inspired generated
paintings, the six official can images, and seven existing Public House photos.
The paintings illustrate beer-label worlds, not documentary views of the pub.
Their original source and generation records remain in `../incline-demo/ASSETS.md`.
This does not change the provenance of the Long Table hero described below.
No new image generation or external asset download was performed for this pass.

## Interior and deck illustrations — subsequent scene comparison

The built-in OpenAI image generation tool transformed two actual Alibi venue
photos into new artwork matched to the existing Long Table illustration:
`iph-interior-dining-trusses-booths.jpg` and `iph-deck-outdoor-bar-sunny.jpg`,
both in `../incline-demo/source-assets/official-extra/` (the first under
`building/`). The images retain the characteristic timber trusses, ventilation,
booths, tables, outdoor bar, shade sails and pines, interpreted in the site's
engraved ink style. Neither is presented as a documentary photograph.

The two original PNG files and exact prompts are preserved in
`source-assets/art/scene-comparison/`. `inside-illustration.webp` and
`deck-illustration.webp` are 1800px-wide compressed display derivatives, made
with the existing Sharp installation. Photo cards, rope, pegs and movement are
real HTML/CSS/JavaScript over the artwork, not baked into either illustration.

## A1: original illustration family

The original **The Long Table at Alibi** family was created for this demo using the built-in OpenAI image generation tool, followed by original project-owned SVG drawings for the interaction pieces. The imagegen skill was read before generation. The three actual reference photographs below were opened at full useful size before prompting. No third-party inspiration-site artwork or prior can-world painting was reused.

The original master was generated, refined to remove baked foreground chairs and pseudo-signage, and extracted to true transparency by the image tool. A separate phone composition was then made from the successful master, and also extracted to transparency. No API/CLI image generation path was used. Sharp only performs derivative export, flattening on the exact page paper, scaling and the closing crop. Source masters and generation prompts remain in `source-assets/art/`; only used display derivatives belong in the distribution.

References, relative to sibling `incline-demo/`:

| Input photograph | Source and its influence |
|---|---|
| `source-assets/official-extra/iph-beer-forest-guests.jpg` | [Official Beer Forest photo](https://alibialeworks.com/wp-content/uploads/2022/01/iph-backyard-007.jpg): charcoal low structure, raised timber deck, planting, granite boulders. Photographer not identified in source record. |
| `source-assets/official-extra/iph-deck-outdoor-bar-sunny.jpg` | [Official outdoor bar/deck photo](https://alibialeworks.com/wp-content/uploads/2023/01/IMG_7600.jpg): triangular sails, thin steel structure, timber rails and stools, real outdoor bar configuration. Photographer not identified. |
| `source-assets/official-extra/building/iph-interior-dining-trusses-booths.jpg` | [Official dining room photo](https://alibialeworks.com/wp-content/uploads/2023/01/alibi-iph-007.jpeg): live-edge communal timber surfaces, restrained wood-and-metal chairs. Photographer not identified. |

This is not an architectural survey. Objects were recomposed in a drawn garden scene for the narrative; the outdoor location is not presented as a literal camera view. No lake, mountains, invented portraits, food, product labels or headline typography were generated into the master.

Palette: page paper `#F6F2E8`, charcoal `#172B27`, pine `#173E35`, toasted amber `#C56834`. Generated ink tones vary slightly within the illustration, while the transparent masters are flattened on exact `#F6F2E8` for display. Original masters have useful linework beyond the compressed display sizes.

### Display family

All paths below are relative to `src/assets/art/`.

| File | Dimensions / role |
|---|---|
| `house-scene.webp` | 1296×864; 262,438 bytes. Detailed still house/deck/garden/table poster. Conceptual composition uses an 1800×1200 coordinate space. |
| `house-scene-960.webp` | 960×640; 180,152 bytes. Smaller desktop derivative. |
| `phone-arrival.webp` | 630×770; 159,188 bytes. Independently composed portrait, conceptual 900×1100; includes the standing folded invitation and empty foreground chair. |
| `phone-arrival-450.webp` | 450×550; 97,520 bytes. Smaller phone derivative. |
| `foreground-chair.svg` | 260×355. Original complete wood/metal chair; all legs remain drawn for movement. |
| `invitation-left.svg`, `invitation-right.svg` | Each 240×320. Original paper leaves with drawn pine sprigs, crease edges and no fabricated lettering. |
| `table-invitation-frame.svg` | 600×400. Original transparent hand-drawn edge geometry for the shared 3:2 meal photo. The same three paths are now inline in `src/templates/home.mjs` so their stroke widths can thin during expansion; this SVG remains the editable geometry reference. |
| `open-invitation-static.svg` | 720×180. Two open pine-sprig paper leaves above the shared meal frame; no duplicate food image. Refined after round1 to make the static invitation cue legible. |
| `route-detail.svg` | 640×360. Original pine-sprig/string-light detail repeating the master’s subject vocabulary. |
| `visit-house-detail.svg` | 600×340. Original project-authored SVG detail for Visit: charcoal pub, raised timber deck and garden steps, triangular shade sails, pines and granite edges. Displayed with the label “Illustrated house detail.” |
| `closing-fragment.webp` | 700×501; 108,132 bytes. Derived from the master’s garden steps, planting and beginning of the table; not another illustrated world. |
| `geometry.json` | Machine-readable placement/pivot coordinates. |

`source-assets/art/build-vector-family.mjs` is the editable source of the SVG family. `source-assets/art/PROMPTS.md` records the built-in generation/edit prompt set and method.

The later `visit-house-detail.svg` was drawn directly as editable SVG after viewing `incline-demo/source-assets/official-extra/iph-deck-outdoor-bar-sunny.jpg` and `incline-demo/source-assets/official-extra/iph-beer-forest-guests.jpg`. It uses the actual photographs’ charcoal facade, timber rails, deck steps, shade-sail supports, pines and granite as references, recomposed in the existing pine/ink/amber line style. No image-generation tool, third-party artwork, map geometry or invented geographic setting was used for this detail. The SVG file itself is its editable source; it is not generated by `build-vector-family.mjs`. It is an illustrative interpretation, not a surveyed elevation or wayfinding map; the documentary photo and ordinary directions link remain the arrival references.

### Documented geometry adjustment

The storyboard allows improved actual composition while preserving endpoints. The generated master has a perspective tabletop, so the invitation is interpreted as an **upright folded card resting on that table**. Its 3:2 photograph remains undistorted. The production origin is **x1000, y770, width480, height320** in an 1800×1200 conceptual master, replacing approximate x900/y720/w600/h400 to keep the invitation proportionate. Leaf pivot coordinates are left `(1000,930)` and right `(1480,930)`; each leaf occupies half the aperture. The original SVG chair is placed at **x690, y830, width260, height355**, pivot `(820,1140)`. The phone print includes the same invitation/seat concept in its own composition, so no mobile travel or overlay is required.

The new phone invitation is intentionally a smaller, upright pine-sprig card. Its transition to an open invitation detail around the photograph provides the static narrative cue. Photo content and business facts are never embedded in any illustration.

## Documentary photography and actual packaging

These sources are available in the preserved sibling’s originals; optimized derivatives are reused only when needed by the new routes. Files below are relative to `incline-demo/source-assets/`. Captions must not imply live weather, live tap availability, or that a historic pizza photograph depicts a particular current named pizza.

| Asset | Local original | Official source / credit |
|---|---|---|
| Pizza and pints | `official-extra/pizza-and-pints.jpg` | [Source](https://alibialeworks.com/wp-content/uploads/2024/02/pizza-pints-2_Jeff-Freeman.jpg). Jeff Freeman attribution derives from original filename. Genuine 1920×1277 photograph; shared H1–H2 proof. |
| Dining room | `official-extra/building/iph-interior-dining-trusses-booths.jpg` | [Source](https://alibialeworks.com/wp-content/uploads/2023/01/alibi-iph-007.jpeg). Photographer not identified. |
| Deck | `official-extra/iph-deck-outdoor-bar-sunny.jpg` | [Source](https://alibialeworks.com/wp-content/uploads/2023/01/IMG_7600.jpg). Photographer not identified. |
| Beer Forest | `official-extra/iph-beer-forest-guests.jpg` | [Source](https://alibialeworks.com/wp-content/uploads/2022/01/iph-backyard-007.jpg). Photographer not identified. |
| Friends dining | `official-extra/iph-friends-dining-window.jpg` | [Source](https://alibialeworks.com/wp-content/uploads/2023/03/alibi-IPH-502.jpeg). Photographer not identified. |
| Pork Belly Bao | `official-extra/food-pork-belly-bao.png` | [Source](https://alibialeworks.com/wp-content/uploads/2026/06/alibi-ale-works-incline-public-house-lake-tahoe-best-pork-belly-bao.png). Photographer not identified. |
| Garden Salad | `official-extra/food-garden-salad-champagne-lemon-vinaigrette.png` | [Source](https://alibialeworks.com/wp-content/uploads/2026/06/alibi-ale-works-incline-public-house-lake-tahoe-best-garden-salad-champagne-lemon-vinaigrette.png). Photographer not identified. |
| Pizza detail | `official/pizza.jpg` | [Source](https://alibialeworks.com/wp-content/uploads/2024/02/pepperoni-pizza.jpg). Kevin Drake credit comes from official article. |
| Tap pour | `official-extra/iph-bartender-tap-pour.jpg` | [Source](https://alibialeworks.com/wp-content/uploads/2023/01/alibi-iph-076.jpeg). Photographer not identified. |
| Past concert | `official/music-night.jpg` | [Source](https://alibialeworks.com/wp-content/uploads/2022/01/Alibi-Amphitheater-w-live-music-at-night.jpg). Past atmosphere photo, not future booking evidence. Photographer not identified. |
| Event room | `official-extra/iph-event-hall-stage-can-art.jpg` | [Source](https://alibialeworks.com/wp-content/uploads/2023/01/alibi-iph-016.jpg). Photographer not identified. |
| Winter sign | `official-extra/iph-sign-in-snow.jpg` | [Source](https://alibialeworks.com/wp-content/uploads/2023/03/IMG_2775.jpeg). Winter reference photo, not current conditions. Photographer not identified. |
| Kölsch can | `official-extra/can-kolsch.png` | [Official packaging](https://alibialeworks.com/wp-content/uploads/2026/07/Kolsch-can_graphic.png). Preserve original labels/ratio. |
| IPA can | `official-extra/can-ipa.png` | [Official packaging](https://alibialeworks.com/wp-content/uploads/2026/07/IPA-can_graphic.png). Preserve original labels/ratio. |
| Porter can | `official-extra/can-porter.png` | [Official packaging](https://alibialeworks.com/wp-content/uploads/2026/07/Porter-can_graphic.png). Preserve original labels/ratio. |

The authentic Alibi SVG wordmark and existing local font assets are reused from `incline-demo/src/assets/`; their upstream source and font-license records remain in the preserved `incline-demo/ASSETS.md`. The new build does not repaint official beer labels or import Heirbloom’s artwork, fonts, plants, layout, or source code.

Any sources whose public photography credit is unknown remain explicitly unknown; a public production launch would require the owner’s asset/rights review.
