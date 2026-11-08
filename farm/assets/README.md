# Original farm artwork · A direction

These four WebP images were created for 风里农场 with the built-in image generation tool, using the user's selected A concept as a visual reference. No third-party game sprites were copied. Assets are bundled locally; no runtime image host is used.

Files:
- garden.webp: portrait illustrated background, no baked-in crops or farm UI. Warm red-roof farmhouse, forest, open earth clearing, irrigation stream.
- crops-a.webp: 4×5 mature plant atlas. Rooted vegetable, grain, berry and vine plants; slots are mapped explicitly in ../assets.js.
- crops-b.webp: 4×5 mature plant atlas. Fruit trees, other vegetables and flowers; unused concepts are never mapped to player crops.
- crops-c.webp: 4×2 supplemental atlas, purple onion, rice, moonflower, banana, zinnia, asparagus, kiwi and a general leafy growing clump. A background-removal edit preserved the grid and plant positions.

Prompt set: polished warm 2D illustrated cartoon farm, consistent top-left sunlight; no text/UI/soil backgrounds in plant sprites; regular isolated transparent cells; complete rooted plants rather than loose produce icons. The background prompt reserves the central lower terrain for dynamically rendered plots. See assets.js for exact crop-to-cell mapping; every one of the 40 crops uses a distinct mature slot.

Generated originals were converted to WebP with ImageMagick (quality84 background / quality88 atlases), without changing composition. Total image payload about2.3MiB. Rendering uses a small cell inset to avoid adjacent sprite fragments. Assets failing to load fall back to the original Canvas plant renderer. Development gallery: ../../qa/farm-gallery.html.
