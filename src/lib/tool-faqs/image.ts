import type { Faq } from "./_types";

export const faqsImage: Record<string, Faq[]> = {
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

  "image-compressor": [
    { q: "What quality level should I choose?", a: "For web images: 70–80% quality typically provides a good balance between visual quality and file size. JPEG at 80% is usually indistinguishable from 100% for most photos. For images with text or sharp lines, use higher quality (85–90%) as JPEG compression artefacts are more visible on edges." },
    { q: "Will I lose quality every time I compress?", a: "Yes. JPEG is a lossy format — each compression introduces artefacts. Never compress an already-compressed JPEG for distribution; always start from the original uncompressed source. Keep a TIFF or PNG master and compress from that for each use." },
    { q: "How much smaller does compression make the file?", a: "At 75% quality, a typical photo JPEG may reduce to 30–50% of its original size. Results vary by image content — photos with lots of detail or noise compress less; photos with large uniform areas compress more." },
    { q: "Is my image safe here?", a: "Yes. Compression runs in your browser using the Canvas API. Your image is never uploaded to a server." },
  ],

  "image-format-converter": [
    { q: "What is the best format for web images?", a: "WebP is generally the best format for web — it provides smaller file sizes than JPEG and PNG at similar quality, supports transparency (like PNG), and is supported by all modern browsers. AVIF is even more efficient but has slower encoding and less universal browser support. PNG is best for screenshots, diagrams, and images with text." },
    { q: "When should I use SVG vs PNG?", a: "SVG (Scalable Vector Graphics) is ideal for logos, icons, illustrations, and anything with flat colour and geometric shapes — it scales without pixelation. PNG is better for photographs, complex gradients, and screenshots. SVG files can be very small for simple shapes; PNG can be smaller for complex photographic content." },
    { q: "Can I convert a PNG to SVG?", a: "A direct raster-to-vector conversion (PNG → SVG) requires tracing the bitmap into vector paths — this is called vectorisation and is not a simple format conversion. Use a dedicated vectorisation tool (Inkscape Trace Bitmap or Adobe Illustrator Live Trace). This converter handles raster-to-raster conversions (PNG ↔ JPEG ↔ WebP) and SVG to raster." },
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
};
