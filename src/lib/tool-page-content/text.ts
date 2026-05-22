import type { ToolPageContent } from "./_types";

export const pageContentText: Record<string, ToolPageContent> = {
  "text-diff": {
    title: "Text Diff Checker — Compare Text Online",
    metaDescription:
      "Compare two text blocks side by side online. Added and deleted lines highlighted instantly using the Myers diff algorithm. No signup, 100% in your browser.",
    openingParagraph:
      "Text Diff compares two blocks of text and highlights every addition and deletion using the Myers diff algorithm — the same algorithm Git uses. Paste the original text on the left and the updated text on the right, and changes appear instantly with added lines in green and deleted lines in red. Toggle whitespace-only changes, switch between side-by-side and unified views, and copy the diff output as a standard patch.",
  },

  "string-inspector": {
    title: "String Inspector — Analyse Text Online",
    metaDescription:
      "Inspect any string: character count, byte length, Unicode points, line count, entropy, and invisible characters. No signup. Runs 100% in your browser.",
    openingParagraph:
      "String Inspector analyses any text and reports character count, byte length (UTF-8 / UTF-16), word count, line count, unique character count, and Shannon entropy. It lists every Unicode code point with its name, category, and script — making it easy to spot invisible characters, zero-width spaces, or mixed-script homoglyphs that could cause subtle bugs in password or URL handling.",
  },

  "markdown-preview": {
    title: "Markdown Preview Editor — Live GFM Renderer",
    metaDescription:
      "Live side-by-side Markdown editor with GitHub Flavored Markdown rendering. Tables, task lists, code blocks, strikethrough. Copy HTML output. No signup.",
    openingParagraph:
      "Markdown Preview is a split-pane editor that renders GitHub Flavored Markdown (GFM) in real time alongside the source. Write on the left, see the rendered result on the right as you type. Supports all GFM extensions — tables, task lists, strikethrough, fenced code blocks with language tags, and auto-linked URLs. Copy the rendered HTML output for pasting into a CMS, or download the Markdown source as a .md file.",
  },

  "case-converter": {
    title: "Case Converter — camelCase, snake_case, PascalCase Online",
    metaDescription:
      "Convert text between UPPER CASE, lower case, camelCase, PascalCase, snake_case, kebab-case, and Title Case instantly online. Free case conversion tool. No signup.",
    openingParagraph:
      "Case Converter transforms any text between all common naming conventions and text cases — UPPER CASE and lower case for quick text formatting, camelCase for JavaScript variables, PascalCase for class names, snake_case for Python and database columns, kebab-case for CSS and URLs, CONSTANT_CASE for environment variables, and Title Case for headings. Paste a phrase and toggle between all formats in one click. Runs entirely in your browser.",
  },

  "word-counter": {
    title: "Word Counter — Count Words, Characters & Reading Time",
    metaDescription:
      "Count words, characters, sentences, and paragraphs online. Shows reading time and speaking time estimate. Instant. No signup, 100% in your browser.",
    openingParagraph:
      "Word Counter analyses any text and reports word count, character count (with and without spaces), sentence count, paragraph count, and estimated reading time at an average 200 words per minute. Useful for checking essay length, social media character limits, SEO meta description length, and speech duration. Paste your text and all stats update in real time. Runs entirely in your browser.",
  },

  "slug-generator": {
    title: "Slug Generator — URL-Friendly Slugs Online",
    metaDescription:
      "Generate URL-friendly slugs from any text — lowercase, hyphens, accent removal, no special characters. For blog posts, product URLs, IDs. No signup, browser-only.",
    openingParagraph:
      "Slug Generator converts any text to a clean URL-friendly slug by lowercasing, replacing spaces with hyphens, removing special characters and accents, and collapsing multiple hyphens to one. Handles accented characters (é→e, ü→u) for multilingual inputs. Useful for blog post permalinks, product page URLs, database record IDs, and Git branch names. Runs entirely in your browser.",
  },

  "lorem-ipsum": {
    title: "Lorem Ipsum Generator — Placeholder Text Free",
    metaDescription:
      "Generate Lorem Ipsum placeholder text online — choose paragraphs, sentences, or words. Classic or randomised variant. Copy instantly. No signup, browser-only.",
    openingParagraph:
      "Lorem Ipsum Generator creates placeholder text for mockups, wireframes, and design prototypes in seconds. Choose how many paragraphs, sentences, or individual words you need and copy the classical Lorem Ipsum text or a randomised variant. Useful for filling UI layouts before real content is ready, testing typography, and seeding databases. Runs entirely in your browser.",
  },

  "line-sorter": {
    title: "Line Sorter — Sort, Deduplicate & Shuffle Lines Online",
    metaDescription:
      "Sort lines A–Z or Z–A, reverse order, remove duplicates, shuffle randomly, or number lines online. Instant. No signup, 100% in your browser.",
    openingParagraph:
      "Line Sorter processes any block of text line by line — sort alphabetically ascending or descending, reverse the current order, remove duplicate lines, shuffle randomly, or add sequential line numbers. Handles any plain-text list: file paths, names, keywords, CSV rows, or log lines. Paste your list and the result updates instantly. Runs entirely in your browser with no data sent anywhere.",
  },

  "find-replace": {
    title: "Find and Replace Online — Like Word's Ctrl+H, with Regex",
    metaDescription:
      "Find and replace text online — works like Word's Ctrl+H in your browser. Plain text or regex mode, case-sensitive toggle, replace all or first match. No signup.",
    openingParagraph:
      "Find & Replace works like Ctrl+H in Word or Notepad but runs entirely in your browser — no software needed. Search any pasted text for a plain string or regular expression and replace matches with your substitution text. Toggle case-sensitivity, replace the first match or all occurrences, and preview the result before copying. Useful for bulk-editing config files, renaming variables in a pasted code block, and normalising text data.",
  },

  "whitespace-normalizer": {
    title: "Whitespace Normalizer — Clean Up Text Online",
    metaDescription:
      "Trim trailing spaces, collapse multiple spaces, remove blank lines, and normalise line endings online. Clean up copied text instantly. No signup, browser-only.",
    openingParagraph:
      "Whitespace Normalizer cleans up messy text by trimming leading and trailing spaces from each line, collapsing multiple consecutive spaces to one, removing blank lines, and normalising Windows CRLF and mixed line endings to Unix LF. Paste text copied from PDFs, web pages, or legacy tools and get consistently formatted output in one click. Runs entirely in your browser.",
  },

  "string-reverse": {
    title: "String Reverse — Reverse Any Text Online",
    metaDescription:
      "Reverse any string online — character by character with full Unicode and emoji support. Optionally reverse line order. No signup, 100% in your browser.",
    openingParagraph:
      "String Reverse reverses any text character by character, preserving full Unicode including emoji and combined characters. Toggle between reversing characters within each line and reversing the order of lines. Useful for checking palindromes, manipulating encoded strings, and quick text experiments. Runs entirely in your browser — no data is sent to any server.",
  },

  "markdown-to-html": {
    title: "Markdown to HTML Converter — Free Online Tool",
    metaDescription:
      "Convert Markdown to HTML online with GitHub Flavored Markdown — tables, task lists, fenced code blocks. Copy the HTML output. No signup, 100% in your browser.",
    openingParagraph:
      "Markdown to HTML converts any Markdown document to HTML using GitHub Flavored Markdown (GFM) — supporting tables, task lists, fenced code blocks with language tags, strikethrough, and auto-linked URLs. Copy the raw HTML output for pasting into CMS platforms, email templates, or static site generators. Runs entirely in your browser.",
  },

  "html-to-markdown": {
    title: "HTML to Markdown Converter — Free Online Tool",
    metaDescription:
      "Convert HTML to Markdown online — headings, lists, links, bold, italic, code blocks preserved. Clean output. No signup, 100% in your browser.",
    openingParagraph:
      "HTML to Markdown converts any HTML document or fragment back to clean Markdown — preserving headings, bold, italic, inline code, fenced code blocks, ordered and unordered lists, links, images, and blockquotes. Useful for migrating content from HTML-based CMS platforms to Markdown-based documentation systems. Paste HTML and get ready-to-edit Markdown in seconds. Runs in your browser.",
  },

  "html-to-text": {
    title: "HTML to Plain Text — Strip HTML Tags Online",
    metaDescription:
      "Strip all HTML tags from any HTML document online and get clean readable plain text. Preserves paragraph breaks. No signup, 100% in your browser.",
    openingParagraph:
      "HTML to Plain Text removes all HTML tags, attributes, and comments from any HTML document, leaving only the readable text content. Block elements are converted to line breaks to preserve text flow. Useful for extracting readable content from emails, web scraping output, CMS exports, and email template HTML. Paste HTML and copy clean text in one click. Runs entirely in your browser.",
  },

  "strip-markdown": {
    title: "Strip Markdown — Remove Text Formatting Online Free",
    metaDescription:
      "Remove Markdown text formatting online — strip headers, bold, italic, links, code blocks, and lists to get clean plain text instantly. No signup, 100% in your browser.",
    openingParagraph:
      "Strip Markdown removes all Markdown and text formatting syntax from any document — headings (#), bold (**), italic (*_), links, images, inline code, fenced code blocks, blockquotes, and list markers — leaving only the plain text content. Use it to remove formatting before pasting into tools that don't support Markdown, extract readable text for word count or SEO meta descriptions, or feed clean text to search indexes. Runs entirely in your browser.",
  },

  "unicode-checker": {
    title: "Unicode Checker — Inspect Characters & Codepoints Online",
    metaDescription:
      "Inspect every character: Unicode codepoint, name, category, script, UTF-8 bytes, HTML entity. Detects invisible and dangerous characters. No signup, browser-only.",
    openingParagraph:
      "Unicode Checker breaks any string into individual characters and shows each one's Unicode codepoint (U+xxxx), official name, general category, script, UTF-8 byte sequence, and HTML entity. It highlights invisible characters (zero-width space, soft hyphen, directional marks), homoglyph lookalikes, and unexpected scripts — essential for security auditing and debugging encoding issues.",
  },
};
