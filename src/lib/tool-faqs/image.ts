import type { Faq } from "./_types";

export const faqsImage: Record<string, Faq[]> = {
  "image-crop": [
    { q: "How do I crop an image to an exact size?", a: "Upload the image, then type the exact X, Y, width and height values in pixels into the labeled inputs below the aspect-ratio presets. The selection rectangle, the live output dimensions, and the preview all update immediately — no dragging required, so the tool works fully with a keyboard or screen reader." },
    { q: "What do the aspect ratio presets do?", a: "Presets (1:1, 4:3, 16:9, 3:2 and their portrait variants) lock the crop rectangle to a fixed width-to-height ratio while you drag or type, so the result always matches the target frame. \"Original\" locks to your image's own proportions and \"Free\" removes any constraint. Swapping W/H switches to the matching inverse preset." },
    { q: "How do I make a circular profile picture?", a: "Tick \"Circle crop\" and the tool applies a circular alpha mask to the selection. The output format is automatically forced to PNG, the only format that preserves the transparent corners (JPEG would fill them with a solid color). For the roundest result, pick the 1:1 preset first so the crop is a perfect square." },
    { q: "Is my image uploaded to a server?", a: "No. Cropping runs entirely in your browser using the Canvas API — your file is read from your device, processed locally, and never transmitted or stored. You can disconnect from the internet after the page loads and the tool keeps working." },
  ],

  "image-rotate": [
    { q: "How do I rotate a photo by exactly 90 degrees?", a: "Use the \"Rotate left\" and \"Rotate right\" buttons — each press turns the image a precise quarter turn. At 90°, 180° and 270° the output dimensions are an exact swap of the original (for example 4000×3000 becomes 3000×4000) with no resampling or added background." },
    { q: "Why are there empty corners when I rotate slightly?", a: "Rotating by a non-right angle (e.g. 15°) means the rectangle no longer aligns with the canvas, so the output grows to the rotated bounding box. Fill those corners with the Background fill option — Transparent (PNG/WebP), White, or Black. JPEG has no transparency, so transparent areas are filled white automatically." },
    { q: "What is the difference between flipping and rotating?", a: "Flipping mirrors the image — horizontal flip swaps left and right, vertical flip swaps top and bottom — without changing its dimensions. Rotating turns it around its center: 90° turns swap width and height, while other angles enlarge the canvas. Flips and rotation can be combined freely; flips apply to the final orientation you see in the preview." },
    { q: "Does rotating an image reduce quality?", a: "The image is decoded once and re-encoded once, so quality loss is limited to a single compression step — choose PNG or 100% quality JPEG/WebP to minimize it. Angles that are multiples of 90° simply rearrange pixels without interpolation, while arbitrary angles involve resampling, which slightly softens fine detail." },
  ],

  "signature-maker": [
    { q: "How do I create my signature — do I need to scan or upload anything?", a: "No scanner or upload is needed. Draw directly on the canvas with a mouse, trackpad, or finger, or switch to Type mode and enter your name — Type mode is fully keyboard-operable. Undo removes the last stroke, Clear resets the canvas, and strokes are resampled and smoothed as you draw for cleaner lines." },
    { q: "What file format and sizes does the download use?", a: "PNG with a transparent background — never a white box. Choose Custom PNG for the natural size, or a preset: Standard 60×20mm, Compact 50×20mm, Narrow 70×15mm, or Small 40×15mm. Presets export at exactly 300 DPI (709×236px for standard) with your signature fitted and centered inside the exact target dimensions." },
    { q: "What does the 'Trim to content' option do?", a: "It crops away the transparent margins. The tool computes the bounding box of your strokes (or typed text), pads it by the pen width plus a few pixels, and clamps it to the canvas — so you get a snug signature that drops neatly into documents. Turn it off to export the full 900×300px drawing area instead." },
    { q: "Which size preset should I pick for a form?", a: "Standard 60×20mm matches the typical signature box on contracts, bank forms, and job applications. Use Compact 50×20mm for tighter boxes, Narrow 70×15mm for wide, short fields, and Small 40×15mm for tiny fields. If you are unsure, keep Custom PNG and resize the image in your document — PNGs scale without quality loss." },
  ],

  "remove-image-metadata": [
    { q: "What metadata does this tool remove?", a: "Re-encoding the image strips every metadata block: EXIF (camera make and model, lens, date taken, software), GPS coordinates, IPTC, XMP, and ICC profiles. The tool first shows you a list of what it found, including a prominent location row if GPS data is present, so you know exactly what will be removed." },
    { q: "Does removing metadata change my image quality?", a: "The image is re-encoded through a canvas, so the bytes change even though the visual quality is preserved — at high quality settings differences are imperceptible. The result is usually smaller than the original, and the tool shows a before/after size comparison so you can judge the trade-off yourself." },
    { q: "How can I tell if my photo contains location data?", a: "Upload it and the tool lists every metadata field it finds before you remove anything. GPS coordinates appear as a 📍 Location row. If you see 'No metadata found — image is already clean', the file has no EXIF data — common for PNGs, screenshots, and images that have already been shared through social networks." },
    { q: "Which file formats are supported?", a: "JPEG, PNG, and WebP images are supported. You can keep the original format or choose PNG or JPEG as the output — JPEG output composites a white background because JPEG does not support transparency. Processing happens entirely in your browser." },
  ],

  "favicon-generator": [
    { q: "What sizes are included in the favicon set?", a: "The tool produces 16×16, 32×32, and 48×48 PNGs plus a single favicon.ico that bundles all three images in one file. Each PNG can be downloaded individually, and the .ico is built with proper directory entries and offsets so browsers and Windows pick the right size automatically." },
    { q: "My source image isn't square — what happens?", a: "The image is centered on a square canvas whose side matches the longer edge, so nothing is cropped. Padding is transparent by default; enable Fill background and pick a color if you want a solid backdrop (useful for logos with transparency that need to sit on a colored tile)." },
    { q: "How do I add the favicon to my website?", a: "Download favicon.ico and place it in your site's root directory, then paste the provided snippet — <link rel=\"icon\" href=\"/favicon.ico\"> — into the head of your pages. A Copy button puts the tag on your clipboard. Most modern browsers request /favicon.ico automatically even without the tag, but the link tag is explicit and reliable." },
    { q: "Why are PNG files stored inside the .ico?", a: "PNG-in-ICO is a valid format for 16, 32, and 48 pixel icons and is supported by all modern browsers and Windows Vista and later. It keeps file sizes small and preserves transparency and antialiasing exactly as they appear in the downloaded PNGs, with no quality loss from re-compression." },
  ],

  "image-compress-target": [
    { q: "Why do I need to compress to an exact size?", a: "Many forms and portals reject uploads over a fixed limit (e.g. 50KB for an ID photo or 1MB for a passport scan). This tool automatically finds the quality and dimensions that land on that limit so the upload is accepted on the first try." },
    { q: "How does the tool reach my target size?", a: "It runs a binary search over encoder quality (about 7 attempts), and if quality alone can't hit the target it downscales the image and resumes the search — at most 12 encode attempts in total. You always see the achieved size honestly, even if the exact target isn't reachable." },
    { q: "What does 'Closest achievable' mean?", a: "Some images simply can't get as small as your target without being unreadable. When that happens the tool stops at its minimum reasonable quality and shows the smallest size it could safely reach, along with the target for comparison." },
    { q: "Will my transparent PNG become a black-background JPEG?", a: "No. When outputting JPEG from a PNG or WebP with transparency, the tool composites the image onto a white background first, matching what most design tools do." },
    { q: "Is my image uploaded to a server?", a: "No. All compression happens in your browser using Web Workers and OffscreenCanvas. Your image never leaves your device." },
  ],

  "image-resize-units": [
    { q: "What DPI should I use for printing?", a: "Use 300 DPI for everyday photo prints and 150–200 DPI for large format or posters. 96 DPI is the screen standard and only matters for on-screen use — DPI never changes the visible quality of an on-screen image." },
    { q: "How do I resize an image to exactly 3.5 × 4.5 cm?", a: "Upload your image, choose cm as the unit, set width to 3.5 and height to 4.5, and pick your DPI (300 recommended). The tool shows the pixel equivalent live — 3.5 × 4.5 cm at 300 DPI is 413 × 531 px — and lets you download the resized file." },
    { q: "Does resizing in centimeters change my image quality?", a: "Enlarging beyond the original pixel dimensions doesn't add real detail — the browser interpolates, so very large upscales look soft. Shrinking or matching the original size preserves sharpness." },
    { q: "Is my photo uploaded to a server?", a: "No. All resizing runs in your browser using an off-main-thread worker. Your file is never uploaded, stored, or seen by anyone." },
  ],

  "passport-photo": [
    { q: "What size are passport photos for my country?", a: "The tool includes real-world presets: US and Canada 2×2 inch (50.8×50.8 mm), India, Schengen/EU, UK, Japan, Australia and Russia 35×45 mm, China 33×48 mm, Pakistan 35×45 mm, and Bangladesh 45×55 mm. Always double-check your country's current requirements before printing." },
    { q: "What's the difference between Fit and Fill?", a: "Fit (contain) keeps your whole photo visible and fills the leftover frame area with your chosen background color. Fill (cover) makes the photo fill the entire frame and crops the edges — use it when the subject must occupy the full photo with no border." },
    { q: "Can this tool remove the background behind me?", a: "No — this tool fills the frame behind your photo with a solid color (white, red, blue, green, or a custom color). For a proper cut-out subject, remove the background with our Background Remover tool first, then place the transparent PNG here." },
    { q: "How do I print multiple copies at home?", a: "Enable the 'Print sheet' option to build an A4 print sheet (at 200 DPI) with as many copies as fit, spaced 4 mm apart with a white surround. Print it at 100% / 'actual size' — no scaling — and cut along the edges." },
  ],

  "contrast-checker": [
    { q: "What is the WCAG contrast ratio requirement?", a: "WCAG 2.2 Level AA requires a contrast ratio of at least 4.5:1 for normal text (below 18pt or 14pt bold) and 3:1 for large text (18pt+ or 14pt+ bold). Level AAA is stricter: 7:1 for normal text and 4.5:1 for large text. The contrast checker tests both levels and shows a clear pass/fail badge for each." },
    { q: "How is the contrast ratio calculated?", a: "The contrast ratio is (L1 + 0.05) / (L2 + 0.05), where L1 is the lighter relative luminance and L2 is the darker one. Relative luminance uses linearised sRGB values and is defined by the WCAG. A ratio of 1:1 is no contrast (same colour); 21:1 is maximum contrast (black on white)." },
    { q: "Does this check apply to all text on my site?", a: "WCAG contrast requirements apply to text and images of text, but there are exceptions: large-scale text (≥18pt or ≥14pt bold), incidental text, logotypes, and text in inactive UI components are exempt. The checker tests the specific color pair you enter — you need to check every unique text/background combination on your site." },
    { q: "What is the difference between WCAG AA and AAA compliance?", a: "Level AA is the standard target for most accessibility laws and guidelines (including the EU Web Accessibility Directive and Section 508 in the US). Level AAA provides enhanced accessibility and is recommended for high-importance content such as healthcare and legal documents. Achieving AAA for all text is often impractical due to design constraints." },
    { q: "My text passes AA but still looks hard to read — why?", a: "Contrast ratio is not the only readability factor. Font size, weight, letter spacing, line height, and typeface legibility all affect readability independently of contrast. A 4.5:1 ratio with a thin 10px font can still be hard to read. WCAG also defines minimum font size guidelines separately from contrast requirements." },
  ],

  "background-remover": [
    { q: "How does the AI background removal work?", a: "The tool uses a machine learning segmentation model (running in your browser via WebAssembly) to detect the subject in the image — typically a person, product, or object — and separate it from the background. The model outputs a mask that is applied to produce a transparent PNG. No image is sent to a server." },
    { q: "What image formats are supported?", a: "PNG, JPEG, and WebP are supported as input. The output is always a PNG with a transparent background (alpha channel), regardless of the input format. If you need the result in a different format, convert it with the Image Format Converter on DevBench." },
    { q: "Why does the background removal look rough around the edges?", a: "Edge quality depends on the contrast between the subject and background, image resolution, and the complexity of the subject's boundary (hair, fur, and fine details are harder). For best results, use a high-contrast, well-lit photo. If the edge is rough, try a photo editing tool like Photoshop or Remove.bg for more precise results." },
    { q: "Is my photo uploaded to any server?", a: "No. The ML model runs entirely in your browser — your image is processed locally using WebAssembly and never leaves your device. DevBench does not store, log, or transmit any image you use with this tool." },
    { q: "What types of images work best?", a: "Product photos on plain backgrounds, portrait photos with a clear subject, and images with strong contrast between the subject and background work best. Complex backgrounds, multiple similar-coloured objects, and highly detailed edges (curly hair, fur, foliage) are more challenging for automatic segmentation." },
  ],

  "gradient-generator": [
    { q: "How do I create a gradient in CSS?", a: "Use the linear-gradient() function: background: linear-gradient(angle, color1, color2). Example: background: linear-gradient(135deg, #4f46e5, #7c3aed). The generator creates this for you visually — adjust the angle, color stops, and copy the CSS." },
    { q: "Can I add more than two colours?", a: "Yes. Add multiple colour stops: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%). The percentages define where each colour is placed along the gradient axis." },
    { q: "How do I use a gradient as a background in Tailwind CSS?", a: "Tailwind supports gradients with bg-gradient-to-{direction} and from-{colour} via-{colour} to-{colour} utilities. For custom gradients not in the palette, use a [background:linear-gradient(...)] arbitrary value or add it to your tailwind.config." },
    { q: "Is my data safe here?", a: "Yes. Generation runs in your browser. Nothing is sent to a server." },
  ],

  "color-palette": [
    { q: "What color harmony types does the generator support?", a: "The generator produces complementary (opposite on the color wheel), analogous (adjacent hues), triadic (three equidistant hues), tetradic (four hues forming a rectangle), split-complementary, and monochromatic palettes — all derived from a single seed color. Each harmony follows standard color theory rules." },
    { q: "How do I export the palette to CSS or Tailwind?", a: "After generating a palette, choose an export format from the panel: CSS custom properties (--color-primary: #hex), Tailwind config object (suitable for tailwind.config.js), or a plain JavaScript/JSON array. Click the format button and the output is copied to your clipboard." },
    { q: "How do I choose a seed color?", a: "Enter any valid hex code (#3b82f6), HSL value, or RGB value into the seed input, or use the color picker. You can also paste a CSS color name (e.g. 'tomato') and the tool resolves it to a hex value automatically." },
    { q: "Are the generated palettes accessible (WCAG contrast)?", a: "The palette preview shows WCAG AA and AAA contrast ratios for text placed on each swatch, so you can immediately see whether light or dark text meets accessibility standards. You can adjust lightness or swap colors to hit the required contrast ratios." },
    { q: "Is my data sent anywhere?", a: "No. Palette generation runs entirely in your browser using JavaScript. No color data is sent to a server." },
  ],

  "image-resizer": [
    { q: "Does resizing an image reduce file size?", a: "Usually yes — fewer pixels means less data to store. But a JPEG resized from 4000px to 800px will be much smaller in file size. However, if you resize a small image to a larger size, the file size increases and quality degrades (upscaling interpolates pixels rather than adding real detail)." },
    { q: "What is the maximum resolution I can resize to?", a: "There is no hard limit, but very large outputs (e.g. 10,000 × 10,000 pixels) may be slow or cause memory issues depending on your device. For web use, images rarely need to exceed 2000–3000 pixels on the longest side." },
    { q: "Will resizing change the image format?", a: "No. The output format matches the input format — PNG in, PNG out; JPEG in, JPEG out. To convert format while resizing, use the Image Format Converter on DevBench." },
    { q: "Is my image safe here?", a: "Yes. Resizing runs in your browser using the Canvas API. Your image is never uploaded to a server." },
  ],

  "image-merger": [
    { q: "How many images can I merge?", a: "There is no fixed limit, but very large images or dozens of files may hit browser memory limits. For best results, use a handful of reasonably sized photos (under a few megabytes each). The tool shows an error if the combined output exceeds safe pixel dimensions." },
    { q: "What layout options are available?", a: "Side by side aligns all images to the same height; stacked aligns them to the same width; grid arranges images in two columns left-to-right, top-to-bottom. Reorder thumbnails before merging to control the final sequence." },
    { q: "Can I merge images with transparent backgrounds?", a: "Yes. PNG and WebP images with alpha channels keep transparency where pixels are transparent. The background color fills any gap between images and any letterboxing in grid mode — set it to white or match your design." },
    { q: "What output formats can I download?", a: "PNG (lossless, supports transparency), JPEG (smaller files, no transparency), or WebP (good compression with optional transparency). Use PNG for graphics with transparency; JPEG for photo collages where file size matters." },
    { q: "Is my image uploaded to a server?", a: "No. Merging uses the Canvas API entirely in your browser. Your images never leave your device." },
  ],

  "image-compressor": [
    { q: "What quality level should I choose?", a: "For web images: 70–80% quality typically provides a good balance between visual quality and file size. JPEG at 80% is usually indistinguishable from 100% for most photos. For images with text or sharp lines, use higher quality (85–90%) as JPEG compression artefacts are more visible on edges." },
    { q: "Will I lose quality every time I compress?", a: "Yes. JPEG is a lossy format — each compression introduces artefacts. Never compress an already-compressed JPEG for distribution; always start from the original uncompressed source. Keep a TIFF or PNG master and compress from that for each use." },
    { q: "How much smaller does compression make the file?", a: "At 75% quality, a typical photo JPEG may reduce to 30–50% of its original size. Results vary by image content — photos with lots of detail or noise compress less; photos with large uniform areas compress more." },
    { q: "Is my image safe here?", a: "Yes. Compression runs in your browser using the Canvas API. Your image is never uploaded to a server." },
  ],

  "image-format-converter": [
    { q: "What image formats can I upload?", a: "HEIC/HEIF, SVG, PNG, JPEG, WebP, BMP, GIF, AVIF, and TIFF. Output formats are PNG, JPEG, WebP, and SVG (bitmap tracing). SVG input can be exported to any raster format; raster images can be traced to SVG." },
    { q: "What is the best format for web images?", a: "WebP is generally the best format for web — it provides smaller file sizes than JPEG and PNG at similar quality, supports transparency (like PNG), and is supported by all modern browsers. AVIF is even more efficient but has slower encoding and less universal browser support. PNG is best for screenshots, diagrams, and images with text." },
    { q: "When should I use SVG vs PNG?", a: "SVG (Scalable Vector Graphics) is ideal for logos, icons, illustrations, and anything with flat colour and geometric shapes — it scales without pixelation. PNG is better for photographs, complex gradients, and screenshots. SVG files can be very small for simple shapes; PNG can be smaller for complex photographic content." },
    { q: "Can I convert HEIC photos from my iPhone?", a: "Yes. Upload .heic or .heif files from an iPhone or other Apple device and convert them to PNG, JPEG, WebP, or SVG. HEIC is decoded in your browser — nothing is uploaded to a server." },
    { q: "Can I convert a PNG to SVG?", a: "Yes. Choose SVG as the output format and the tool traces the bitmap into vector paths. This works best for logos, icons, and flat graphics with few colours. Photographs and complex gradients produce large SVGs with many paths — for those, PNG or WebP is usually a better choice." },
    { q: "Is my image safe here?", a: "Yes. Conversion runs in your browser. Your image is never uploaded to a server." },
  ],

  "svg-optimizer": [
    { q: "Why are SVGs exported from Illustrator or Figma so large?", a: "Design tools embed editor metadata: Illustrator adds <sodipodi:*> and <inkscape:*> namespaces, Adobe XMP metadata, author information, and grid settings. Figma embeds layer names and IDs. None of this is needed for rendering. The optimizer strips all of it, keeping only the visual content." },
    { q: "How much can SVG optimisation reduce file size?", a: "Typically 30–70% reduction for Illustrator/Inkscape exports. Simple icons can shrink from 10 KB to 2–3 KB. Complex illustrations see smaller percentage reductions because the actual path data dominates." },
    { q: "Will optimisation change how the SVG looks?", a: "Correctly optimised SVGs render identically to the original. The optimizer uses safe passes: removing metadata, compressing path data numerically, merging redundant elements. Aggressive passes (merging paths, removing IDs) are off by default and can occasionally affect SVGs that rely on CSS targeting." },
    { q: "Is my SVG safe here?", a: "Yes. Optimisation runs in your browser. Your file is never uploaded to a server." },
  ],

  "exif-viewer": [
    { q: "What EXIF data is typically stored in a photo?", a: "Camera model and manufacturer, lens model and focal length, aperture (f-stop), shutter speed, ISO, exposure mode (auto/manual), flash status, white balance, date/time taken, GPS coordinates (latitude, longitude, altitude), and image dimensions. Smartphones add additional data like the direction the phone was facing." },
    { q: "How do I remove EXIF data from a photo?", a: "To strip EXIF before sharing: on Windows, right-click → Properties → Details → Remove Properties and Personal Information. On macOS, use Preview → Tools → Show Inspector, or use exiftool -all= filename.jpg in Terminal. Online privacy tools also strip EXIF." },
    { q: "Can I tell where a photo was taken from EXIF?", a: "If the GPS data was recorded at the time the photo was taken, the EXIF viewer shows the latitude and longitude. Many smartphones record GPS in photos by default. Camera apps often have an option to disable location tagging for privacy." },
    { q: "Is my photo safe here?", a: "Yes. EXIF data is read in your browser using the ExifReader library. Your photo is never uploaded to a server — it is read directly from local memory." },
  ],
  "video-converter": [
    { q: "Which formats can I convert?", a: "The converter reads common video formats like MOV, AVI, MKV, and WebM and exports MP4 (H.264/AAC) or WebM (VP8/Opus) — the two formats that play almost everywhere on the web." },
    { q: "Is my video uploaded to a server?", a: "No. Conversion runs entirely in your browser using FFmpeg compiled to WebAssembly. The file never leaves your device — though large videos need time and memory inside the tab, so keep the tab open until the progress bar finishes." },
    { q: "Why is my converted file larger than the original?", a: "Re-encoding trades size for compatibility. The converter targets web-friendly output, so an already heavily compressed source can come out larger. If size matters more than format, shrink the clip with a shorter segment or lower resolution first." },
  ],
  "gif-maker": [
    { q: "How do I make a smaller GIF?", a: "Lower the frame rate (5 FPS instead of 20) and reduce the output width. GIF file size grows quickly with frames and pixels, so these two controls matter more than anything else." },
    { q: "How long can my GIF be?", a: "The GIF is built from the segment you select. Longer or higher-FPS clips take more time and memory to encode in the tab, so short segments (a few seconds) give the best results." },
    { q: "Does the source video leave my device?", a: "No. Frame extraction and GIF encoding happen locally in your browser via FFmpeg in WebAssembly — the video is never uploaded to a server." },
  ],
};
