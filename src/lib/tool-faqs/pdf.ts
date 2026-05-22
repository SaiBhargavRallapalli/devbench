import type { Faq } from "./_types";

export const faqsPdf: Record<string, Faq[]> = {
  "image-to-pdf": [
    { q: "What image formats can be converted to PDF?", a: "JPEG, PNG, WebP, and GIF are supported. Each image becomes one page in the resulting PDF, sized to fit an A4 page with margins. For best quality, use high-resolution source images." },
    { q: "Can I control the order of pages?", a: "Yes. After adding images, drag them to reorder before generating the PDF. The PDF pages will follow the order shown in the preview." },
    { q: "What is the output PDF page size?", a: "Pages are sized to A4 (210 × 297 mm) by default, with each image scaled to fit within the margins. Images are centred on the page. If you need a different page size, convert on-device with a tool like ImageMagick or Adobe Acrobat." },
    { q: "Is my image data safe here?", a: "Yes. PDF generation runs in your browser using pdf-lib. Your images are never uploaded to a server." },
  ],

  "merge-pdf": [
    { q: "Is there a limit on how many PDFs I can merge?", a: "There is no enforced limit. Very large files or many files may be slow on lower-powered devices, but the processing runs in your browser without any server-side constraints." },
    { q: "Does merging preserve bookmarks and annotations?", a: "Bookmarks (outline/table of contents) from individual PDFs are merged into the combined document. Annotations (comments, highlights) are preserved. Form fields are included but may not be fillable in the merged PDF depending on the original PDF format." },
    { q: "Can I merge password-protected PDFs?", a: "No. Password-protected (encrypted) PDFs cannot be opened or merged without the password. Decrypt the PDF first using the appropriate tool, then merge." },
    { q: "Is my PDF data safe here?", a: "Yes. Merging runs in your browser using pdf-lib. Your files are never uploaded to a server." },
  ],

  "split-pdf": [
    { q: "How are the split pages packaged?", a: "Each page is saved as a separate single-page PDF, and all pages are packaged together in a ZIP archive for download. The files are named page-1.pdf, page-2.pdf, etc." },
    { q: "Can I extract just specific pages instead of all pages?", a: "To extract specific pages, use the PDF Page Editor tool on DevBench — it lets you select individual pages to keep or remove and download the result as a new PDF." },
    { q: "Will the split PDFs be the same quality as the original?", a: "Yes. The pages are extracted, not re-rendered — there is no re-encoding or quality loss. The split PDFs are identical copies of the corresponding pages from the original." },
    { q: "Is my PDF data safe here?", a: "Yes. Splitting runs in your browser using pdf-lib. Your file is never uploaded to a server." },
  ],

  "organize-pdf": [
    { q: "Can I also delete pages in the organiser?", a: "The organiser is focused on reordering. To delete pages, use the PDF Page Editor on DevBench, which lets you mark pages for removal before downloading." },
    { q: "What if my PDF has many pages?", a: "The organiser shows thumbnail previews for each page. For large PDFs (100+ pages), thumbnail generation may take a few seconds. Drag-and-drop reordering works for any number of pages." },
    { q: "Is my PDF data safe here?", a: "Yes. Reordering runs in your browser using pdf-lib. Your file is never uploaded to a server." },
  ],

  "rotate-pdf": [
    { q: "Can I rotate only specific pages?", a: "The current tool rotates all pages by the same angle. To rotate individual pages by different amounts, open the PDF in Adobe Acrobat Reader (free) or use a tool that supports per-page rotation." },
    { q: "Why was my PDF scanned sideways?", a: "Scanners sometimes produce landscape-oriented output when the document was fed sideways, or when a flatbed scanner lid is not closed fully. The rotation tool lets you correct the orientation in one click without re-scanning." },
    { q: "Is my PDF data safe here?", a: "Yes. Rotation runs in your browser using pdf-lib. Your file is never uploaded to a server." },
  ],

  "compress-pdf": [
    { q: "Why is compression less effective on scanned PDFs?", a: "Scanned PDFs store pages as images (JPEG or PNG) embedded in the PDF wrapper. Most of the file size is already the compressed image data. The PDF object-stream compression mostly affects the PDF metadata and structure, which is small relative to the image data." },
    { q: "What compression method is used?", a: "The compressor applies PDF object stream compression (FlateDecode/Deflate on the PDF structure). This is safe and standards-compliant — the output is a valid PDF readable by any PDF viewer." },
    { q: "Is my PDF data safe here?", a: "Yes. Compression runs in your browser using pdf-lib. Your file is never uploaded to a server." },
  ],

  "watermark-pdf": [
    { q: "Can I add an image watermark instead of text?", a: "The current tool adds a text watermark. For image watermarks (e.g. a semi-transparent logo), use Adobe Acrobat or LibreOffice, which support image overlays." },
    { q: "Will the watermark cover the existing content?", a: "The watermark is added as a semi-transparent diagonal overlay — the opacity slider controls how visible it is. At 20–30% opacity, the original text remains readable. At 50%+ it becomes more prominent." },
    { q: "Is my PDF data safe here?", a: "Yes. Watermarking runs in your browser using pdf-lib. Your file is never uploaded to a server." },
  ],

  "pdf-page-numbers": [
    { q: "Where is the page number placed?", a: "Page numbers are added at the bottom centre of each page (footer position) using pdf-lib's text drawing API. The font size and margin can be adjusted before downloading." },
    { q: "Can I start numbering from a page other than 1?", a: "Yes. Set the start number offset — for example, if the first 3 pages are a cover and table of contents, set the offset to -2 so the first numbered page shows '1' on what is physically page 4 of the PDF." },
    { q: "Is my PDF data safe here?", a: "Yes. Page numbering runs in your browser using pdf-lib. Your file is never uploaded to a server." },
  ],

  "pdf-page-editor": [
    { q: "Can I preview individual pages before removing them?", a: "Yes. The page editor shows thumbnail previews of each page. Click a thumbnail to mark it for removal — it will be greyed out. Review the selection before downloading the edited PDF." },
    { q: "What happens if I mark all pages for removal?", a: "The download is blocked and you will see a validation error. A PDF must have at least one page. Deselect at least one page to proceed." },
    { q: "Is my PDF data safe here?", a: "Yes. Editing runs in your browser using pdf-lib. Your file is never uploaded to a server." },
  ],

  "text-to-pdf": [
    { q: "What formatting is applied to the text?", a: "The text is rendered in a standard serif or sans-serif font at a readable size with automatic line wrapping to fit within the A4 page margins. Blank lines between paragraphs are preserved as paragraph breaks. There is no Markdown or HTML rendering." },
    { q: "Can I control the font or page size?", a: "Font and page size options (A4, Letter) are available in the settings. For more advanced formatting, use the HTML to PDF tool — paste HTML with inline CSS for full control over typography, headings, and layout." },
    { q: "Is my text data safe here?", a: "Yes. PDF generation runs in your browser using pdf-lib. Your text is never uploaded to a server." },
  ],

  "html-to-pdf": [
    { q: "Why does the PDF look different from the screen preview?", a: "The browser's print engine applies print stylesheets and ignores some screen-only styles. Backgrounds may not print by default (enable 'Background graphics' in the print dialog). Also, some CSS features (viewport units, CSS animations) behave differently in print mode." },
    { q: "How do I force backgrounds to print?", a: "In the browser print dialog: Chrome → 'More settings' → enable 'Background graphics'. Firefox → 'Page Setup' → Formatting → enable 'Print Background Colors and Images'. Safari → hold Option/Alt when clicking the print button." },
    { q: "Can I include external fonts?", a: "Yes. Include a <link> to Google Fonts or another font CDN in the HTML head. The preview iframe will load the font. Whether it appears in the PDF depends on the browser's print renderer — most modern browsers embed web fonts correctly." },
    { q: "Is my HTML data safe here?", a: "Yes. The HTML renders in a local sandboxed iframe. Nothing is uploaded to a server." },
  ],

  "ipynb-to-pdf": [
    { q: "What notebook cell types are rendered?", a: "Markdown cells are rendered as formatted HTML (headings, bold, lists, code blocks). Code cells show the source with styled input boxes and output — stream output (print statements), error tracebacks, and base64-encoded PNG figures are all preserved. Other output types (DataFrames, widgets) may appear as plain text." },
    { q: "Do I need nbconvert or LaTeX installed?", a: "No. This converter runs entirely in your browser — no server, no nbconvert, no LaTeX, no Python installation required. The .ipynb JSON is parsed client-side and rendered to HTML, then printed to PDF via the browser's print dialog." },
    { q: "Why are some outputs missing in the PDF?", a: "If the notebook was not saved with output (outputs: [] in the cell), those outputs will not appear. Re-run the notebook in JupyterLab and save it with outputs before converting. Also, rich interactive outputs (Plotly, ipywidgets) are not rendered — only static PNG images embedded in the output." },
    { q: "Is my notebook data safe here?", a: "Yes. The .ipynb file is parsed in your browser. Nothing is uploaded to a server." },
  ],

  "pdf-to-jpg": [
    { q: "What scale factor should I use?", a: "Scale 1.0 renders each page at 96 DPI (standard screen resolution). Scale 2.0 gives 192 DPI — good for printing and presentations. Scale 3.0 gives 288 DPI — high quality but larger file sizes. For screen use, scale 1.5 is a good balance." },
    { q: "Are all pages exported?", a: "Yes. All pages are rendered and included in the ZIP archive. File names follow the pattern page-001.jpg, page-002.jpg, etc. with zero-padded numbers for correct sort order." },
    { q: "Why does text look blurry in the exported JPEGs?", a: "Increase the scale factor before exporting — higher scale means more pixels per page. Also, JPEG compression can soften sharp edges; for text-heavy PDFs, consider using a PNG output instead (not available in this tool, but available via PDF to image tools in other software)." },
    { q: "Is my PDF data safe here?", a: "Yes. Rendering runs in your browser using PDF.js. Your file is never uploaded to a server." },
  ],

  "pdf-compare": [
    { q: "Why does the diff show text in the wrong order?", a: "PDF does not store text in reading order — text extraction follows the order objects appear in the PDF file, which may differ from visual reading order for multi-column layouts, tables, and rotated text. The diff is most reliable on simple, single-column digitally-created PDFs." },
    { q: "Does this work with scanned PDFs?", a: "Scanned PDFs store pages as images with no embedded text. There is no text to extract and compare. For scanned document comparison you would need OCR (Optical Character Recognition) first. Use Adobe Acrobat's OCR feature or an online OCR tool, then compare the extracted text." },
    { q: "What diff format is shown?", a: "A unified diff format: lines starting with + are present in the second PDF but not the first (additions); lines starting with - are in the first PDF but not the second (deletions); lines with no prefix are unchanged context." },
    { q: "Is my PDF data safe here?", a: "Yes. Text extraction and diffing run in your browser. Your PDFs are never uploaded to a server." },
  ],

  "pdf": [
    { q: "What PDF tools are available?", a: "The PDF workspace includes: merge PDFs (combine multiple files), split PDF (extract a range of pages), rotate pages, compress PDF to reduce file size, add page numbers, add a watermark, remove pages, reorder pages, convert images to PDF, convert HTML to PDF, convert PDF pages to JPG images, and compare two PDFs." },
    { q: "Are my PDFs uploaded to a server?", a: "No. All PDF operations run in your browser using pdf-lib and PDF.js. Your files are never sent to DevBench servers. This makes the tools safe to use with confidential documents, contracts, or personal files." },
    { q: "What is the maximum file size?", a: "There is no hard server-side limit since processing is client-side. Practical limits depend on your device's available memory. Very large PDFs (over 100 MB) may be slow on devices with limited RAM. For most documents under 20 MB, processing is near-instant." },
    { q: "Can I combine more than two PDFs?", a: "Yes. The merge tool accepts multiple files — add as many PDFs as you need, reorder them by dragging, and merge them into a single file." },
  ],
};
