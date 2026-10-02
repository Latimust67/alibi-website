# The Long Table generation record

Method: built-in `image_gen.imagegen`; no API/CLI path. Original Alibi public photographs were viewed before use. The editable interaction pieces are original SVG, authored in `build-vector-family.mjs`. Sharp is used for display derivatives, exact page-background flattening, resizing and a documented closing crop.

## Master generation

Use case: style-transfer and illustration-story. Create an original exceptional editorial linocut / handcut-print illustration titled internally The Long Table at Alibi, for a hospitality website. Interpret the supplied real Alibi Incline Public House photographs. Image 1 supplies actual garden boulders, charcoal low pub and raised timber deck/rails; image 2 supplies charcoal low shed roof, outdoor bar, steel posts, characteristic triangular suspended shade sails and pine trees; image 3 supplies substantial pale live-edge communal tabletops and simple metal/wood chairs. Clearly an illustration inspired by the venue, not documentary photography. Wide 3:2 canvas designed on 1800×1200 coordinates. Slightly elevated three-quarter composition, detailed asymmetric print. Actual pub/deck occupy upper right half, behind garden and an inviting broad amber timber table extending diagonally toward lower foreground. Leave its tabletop blank for composited invitation and chair. Upper left 42% remains empty paper for live website typography; scene gently reaches left across bottom only. Outer edges are irregular with paper around branches. Structurally plausible deck, stools, steps, boulders and irregular pines. Three inks, charcoal/pine/toasted amber on warm paper. Tapered hand-cut contours, intentional crosshatching and flat block-print color separations. No photographs, gradients, glossy 3D, generic chalet, mountains, lake, sunset, people, faces, words, logos or invented products.

Inputs: `incline-demo/source-assets/official-extra/iph-beer-forest-guests.jpg`; `incline-demo/source-assets/official-extra/iph-deck-outdoor-bar-sunny.jpg`; `incline-demo/source-assets/official-extra/building/iph-interior-dining-trusses-booths.jpg`.

## Master refinement

Preserve original composition, source-specific modern low pub outdoor bar, triangular sails, boulder garden, table geometry and print detail. Change background to flat #F6F2E8; match inks #172B27, #173E35, #C56834. Remove only the two closest chairs on the near-left side of foreground table, completing the obscured legs/ground. Those movable chairs are separate animation pieces. Remove tiny fake bar menu signs/lettering. Keep table blank apart from grain. No new geography, faces, lettering or props. Deliver edited master only.

Saved result: `house-scene-master.png` (1536×1024 native). Conceptual coordinates scale to 1800×1200.

## Phone companion

Use successful master as one consistent reference. Make separately composed portrait at 900×1100 proportions, same pub, actual outdoor bar, thin posts, triangular sails, timber rails/stools, pine forms, granite garden and amber live-edge table in same detailed print language. Recompose with pub/sails upper half, garden middle, table toward lower viewer, one complete empty foreground chair at left. On table include blank two-leaf folded paper invitation standing upright with visible center fold and subtle pine-sprig drawing, no words/photos. Fill portrait intelligently rather than crop panorama. Preserve inks and flat #F6F2E8 page paper. No lake, mountains, invented portraits, food, bottles, signage or logos.

Saved result: `phone-arrival-master.png` (1134×1387 native; display exported to exact 9:11).

## Transparent extraction — applied separately to both masters

Precise background extraction of completed original linocut. Preserve colored ink, composition, geometry, fine lines and proportions. Remove warm paper background to genuinely transparent alpha PNG: paper between branches, around garden, behind table legs and exterior becomes transparent. Pale carved unprinted cuts may also be transparent so effect is ink directly on webpage. Keep charcoal/pine/amber drawing unaltered. Preserve the phone invitation object itself as paper. No white/colored substitute or checkerboard painted into pixels. No additions/movement/redrawing. Same canvas. Return transparent image.

Saved results: `house-scene-transparent.png`, `phone-arrival-transparent.png`. Real alpha confirmed, then display exports flattened on exact #F6F2E8.

## Original vector companion drawings

`build-vector-family.mjs` authors a complete wood/metal chair from visible source chair construction; two hinged paper leaves with dense pine-sprig drawing; irregular 3:2 photo/frame contour; already-open invitation detail; and pine/string-light route detail. These are geometry and linework, not downloaded stock icons or traced protected reference-site artwork. All colors match the master palette. The frame has an empty center for genuine Alibi food; no raster food is regenerated or repainted.
