import type { ToolPageContent } from "./_types";

export const pageContentImage: Record<string, ToolPageContent> = {
  "contrast-checker": {
    title: "WCAG Contrast Checker — AA & AAA Ratio Online",
    metaDescription:
      "Check foreground/background color contrast for WCAG 2.2 AA and AAA compliance. Instant pass/fail for normal and large text. Free, client-side. No signup.",
    openingParagraph:
      "Contrast Checker calculates the luminance contrast ratio between any two colors and tests against WCAG 2.2 requirements: Level AA requires 4.5:1 for normal text and 3:1 for large text (18px+ or 14px+ bold); Level AAA requires 7:1. Enter hex codes or use the color pickers, and the ratio and pass/fail badges update in real time. Essential for accessible web design. Runs in your browser.",
  },

  "gradient-generator": {
    title: "CSS Gradient Generator — Linear Gradient Builder Online",
    metaDescription:
      "Build CSS linear gradients visually online. Adjust angle, color stops, and opacity. Copy the CSS code. Live preview. No signup, 100% in your browser.",
    openingParagraph:
      "CSS Gradient Generator creates linear-gradient CSS rules with a visual editor — drag color stops, adjust angle, and preview the gradient in real time. Copy the ready-to-use CSS background property value and paste it directly into your stylesheet or Tailwind class. Supports multiple color stops with full opacity control. Runs entirely in your browser.",
  },

  "background-remover": {
    title: "Background Remover — AI Remove Background Free Online",
    metaDescription:
      "Remove image backgrounds with AI — runs 100% in your browser, no uploads, no API key. Supports PNG, JPG, WebP. Instant transparent PNG output. No signup.",
    openingParagraph:
      "Background Remover uses a machine learning model running entirely in your browser to detect and remove backgrounds from any photo — no file is uploaded to a server and no API key is needed. Upload a PNG, JPEG, or WebP image and get a clean transparent-background PNG in seconds. Works best on product images, portraits, and subjects with clear background separation. Free, no account required.",
  },

  "image-resizer": {
    title: "Image Resizer — Resize JPG, PNG, WebP Online Free",
    metaDescription:
      "Resize images online — set exact width and height, lock aspect ratio. Supports JPG, PNG, WebP. Instant download. No upload to server, no signup.",
    openingParagraph:
      "Image Resizer lets you set exact pixel dimensions for any JPEG, PNG, or WebP image directly in your browser. Lock the aspect ratio to scale proportionally, or set width and height independently. The resized image downloads instantly at the same file format as the input. Useful for social media sizing, thumbnail generation, and profile photo resizing. Runs entirely in your browser — no file is uploaded.",
  },

  "image-compressor": {
    title: "Image Compressor — Reduce Image File Size Online",
    metaDescription:
      "Compress JPEG and WebP images online with quality slider. Before/after file size comparison shown. No upload, no signup, 100% in your browser.",
    openingParagraph:
      "Image Compressor reduces JPEG and WebP file sizes by re-encoding at a lower quality level — a slider lets you balance quality vs file size. Shows original and compressed sizes and the percentage reduction so you can find the right trade-off. Everything runs in your browser — no file is uploaded to a server. Download the compressed image with one click.",
  },

  "image-format-converter": {
    title: "Image Format Converter — SVG, PNG, JPG, WebP Online",
    metaDescription:
      "Convert images between SVG, PNG, JPEG, WebP, BMP, and GIF online. Quality slider, size comparison. No signup, 100% client-side in your browser.",
    openingParagraph:
      "Image Format Converter converts between SVG, PNG, JPEG, WebP, BMP, and GIF formats in your browser. Adjust JPEG/WebP quality with a slider and compare original vs converted file sizes before downloading. Useful for optimising images for the web, converting SVG exports to raster formats, and preparing images for platforms with specific format requirements. No files are uploaded.",
  },

  "svg-optimizer": {
    title: "SVG Optimizer — Clean & Minify SVG Online Free",
    metaDescription:
      "Optimize SVG files online — strip editor metadata, comments, and whitespace. Shows size reduction. Paste or upload SVG. No signup, 100% in your browser.",
    openingParagraph:
      "SVG Optimizer cleans up SVG files exported from Inkscape, Illustrator, Sketch, and Figma by removing editor metadata, comments, unused definitions, redundant attributes, and whitespace. Shows before and after byte sizes and the percentage reduction. Paste SVG code or upload an SVG file — smaller SVGs load faster and are easier to version-control. Runs entirely in your browser.",
  },

  "exif-viewer": {
    title: "EXIF Viewer — Read Camera Metadata from Photos Online",
    metaDescription:
      "Read EXIF metadata from JPEG and TIFF photos online — camera model, lens, aperture, shutter, ISO, GPS location. No upload, client-side only. No signup.",
    openingParagraph:
      "EXIF Viewer reads the embedded EXIF metadata from JPEG and TIFF photos — camera model, lens, focal length, aperture, shutter speed, ISO, exposure mode, GPS coordinates, and timestamp. Useful for checking photo provenance, reviewing geotag data, and understanding camera settings. Drop an image and all EXIF fields display instantly. Your photo stays on your device — nothing is uploaded.",
  },
};
