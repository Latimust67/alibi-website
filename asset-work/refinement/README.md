# Bounded Alibi refinement assets

Approved October4 through coordinating thread01a0f926-4c65-7052-ab60-e08e974ff03e. All work stays local.

`prepare-media.cjs` derives phone art from the six original illustrated world PNGs, respecting each distinctive motif, and can art from the existing official can derivatives. It also derives1200/1920 versions of the actual friends-dining photograph. `media-manifest.json` records exact source path, crop, dimensions and encoded bytes. No new art generation or external asset purchase.

Phone art naming is deliberately separate from full desktop scenes: mobile-world-*-480/720 and mobile-can-*-180. Native pictures select blank data on desktop and small AVIF/WebP sources on phone. All are normal-flow static content with native lazy loading. The six720AVIF worlds total101,576bytes; six180AVIF cans67,336bytes.

`sign-material.py` produced one representative frame and an editable comparison scene in sign-material/. Independent art review rejected it because uniform bright-green lighting lost material depth beside the photograph. These comparison outputs are research only and are not copied into src/assets/art/sign. Original production61frames and posters remain unchanged. The comparison charged0.99557075seconds to the existing alibi-sign-camera budget; cumulative30.76084275 of600seconds. No further render is planned.

Visual before/after evidence, live browser QA and exact source fingerprints are in the ignored local review/seam-refinements directory. All screenshots stay on this Mac.
