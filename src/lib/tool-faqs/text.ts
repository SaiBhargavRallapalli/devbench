import type { Faq } from "./_types";

export const faqsText: Record<string, Faq[]> = {
  "case-converter": [
    { q: "What is camelCase and when is it used?", a: "camelCase starts with a lowercase letter and capitalises the first letter of each subsequent word — for example, firstName or getUserById. It is the standard for JavaScript variable names, function names, and JSON property keys in most style guides." },
    { q: "What is the difference between snake_case and kebab-case?", a: "snake_case uses underscores between words (user_first_name) and is standard in Python, Ruby, SQL column names, and environment variables. kebab-case uses hyphens (user-first-name) and is used in CSS class names, HTML attributes, URL slugs, and some CLI flags. Neither allows spaces — both are lowercase by convention." },
    { q: "What is PascalCase used for?", a: "PascalCase capitalises the first letter of every word including the first — UserProfile, HttpRequest. It is the standard naming convention for class names in Java, C#, TypeScript, and Python; React component names; and .NET namespaces." },
    { q: "What is SCREAMING_SNAKE_CASE?", a: "SCREAMING_SNAKE_CASE (also called CONSTANT_CASE or UPPER_SNAKE_CASE) is snake_case with all letters uppercase — MAX_RETRY_COUNT, DATABASE_URL. It is the standard for constants and environment variables in most languages." },
  ],

  "word-counter": [
    { q: "How is a word defined in the counter?", a: "A word is any sequence of non-whitespace characters separated by spaces, tabs, or newlines. Hyphenated words (state-of-the-art) count as one word. Contractions (don't) count as one word. Numbers and punctuation-only tokens count as words." },
    { q: "What is the reading time estimate based on?", a: "The estimate uses an average silent reading speed of 200 words per minute (wpm) for adults — the commonly cited figure for body text. Actual reading speed varies widely (150–350 wpm) based on text complexity and individual reading skill." },
    { q: "How is a sentence counted?", a: "Sentences are delimited by . ! ? followed by whitespace or end of input. Ellipses (…) count as one sentence end. Abbreviations (e.g., U.S.A.) may cause slight over-counting — the counter uses a heuristic that reduces false positives." },
    { q: "Does it count HTML or Markdown formatting?", a: "The counter counts raw characters including tags and markers. If you want to count only visible text, strip the HTML or Markdown first using the Strip Markdown or HTML to Plain Text tools on DevBench, then paste the plain text here." },
    { q: "Is my text safe here?", a: "Yes. Counting runs in your browser. Nothing is sent to a server." },
  ],

  "slug-generator": [
    { q: "What characters are removed from a slug?", a: "All characters except letters, numbers, and hyphens are removed. Spaces and underscores become hyphens, accented characters are transliterated (é→e, ü→u, ç→c), and consecutive hyphens are collapsed to one. The result is lowercase and safe for use in URLs without percent-encoding." },
    { q: "Should a slug end with a hyphen?", a: "No. Trailing and leading hyphens are stripped automatically. A slug like my-blog-post- would become my-blog-post. This is standard behaviour for SEO-friendly URL slugs." },
    { q: "What is the maximum recommended slug length?", a: "Keep slugs under 60–75 characters. Search engines truncate long URLs in their display. Google recommends short, descriptive URLs with 3–5 meaningful keywords. Avoid filler words (the, a, of, and) if the slug becomes too long." },
    { q: "Should I include a date in the slug?", a: "It depends on your content strategy. Date-based slugs (/2024/05/my-post) help with organisation but make evergreen content seem dated. Dateless slugs (/my-post) are cleaner for content you update over time. Most modern blogs and docs use dateless slugs." },
    { q: "Is my text safe here?", a: "Yes. Slug generation runs in your browser. Nothing is sent to a server." },
  ],

  "lorem-ipsum": [
    { q: "What does 'Lorem ipsum' mean?", a: "Lorem ipsum is derived from Cicero's 'de Finibus Bonorum et Malorum' (45 BC), scrambled to produce nonsense text. The phrase 'Lorem ipsum dolor sit amet…' has been used as placeholder text in typesetting since the 1500s. It looks like Latin but is not grammatically correct Latin." },
    { q: "Why use Lorem Ipsum instead of real text?", a: "Placeholder text lets designers evaluate a layout's typography and spacing without the distraction of readable content. Real text draws attention to its meaning; Lorem Ipsum keeps focus on the visual design. It also prevents stakeholders from fixating on unfinished copy." },
    { q: "Can I generate other languages' placeholder text?", a: "This generator produces classical Lorem Ipsum and a randomised Latin-like variant. For designs targeting specific scripts (Arabic, Devanagari, CJK), you should use placeholder text in the target script — classical Lorem Ipsum won't represent text length and line-break behaviour accurately for non-Latin scripts." },
    { q: "Is my generated text safe to use?", a: "Lorem Ipsum is public domain placeholder text and can be used in any project, commercial or otherwise." },
  ],

  "find-replace": [
    { q: "How do I use regex in Find & Replace?", a: "Enable Regex mode and enter a JavaScript regular expression in the Find field (without slashes). The Replace field supports backreferences: $1 for the first capture group, $2 for the second, and $& for the entire match. For example, find (\\w+) and replace with [$1] wraps every word in brackets." },
    { q: "How do I replace a newline character?", a: "In Regex mode, use \\n to match a newline. For Windows CRLF, use \\r\\n. In plain text mode, paste an actual newline into the find field (Shift+Enter in some browsers)." },
    { q: "Can I replace all occurrences at once?", a: "Yes. 'Replace All' replaces every match in the input. 'Replace First' replaces only the first match — useful when you need to verify the replacement looks right before applying it everywhere." },
    { q: "Is my text safe here?", a: "Yes. Find & Replace runs in your browser. Nothing is sent to a server." },
  ],

  "whitespace-normalizer": [
    { q: "What is CRLF and why does it cause problems?", a: "CRLF (Carriage Return + Line Feed, \\r\\n) is the Windows line ending standard. Unix/macOS use LF (\\n) only. Mixed line endings cause issues in git diffs, shell scripts, and tools that expect a single style. The normaliser converts all line endings to LF." },
    { q: "Why does pasted text from PDFs have extra spaces?", a: "PDF text extraction often inserts spaces between characters, words, or columns because it reconstructs text from glyph positions rather than character streams. The Whitespace Normaliser collapses multiple consecutive spaces to one, cleaning up these artefacts." },
    { q: "Will this remove intentional indentation?", a: "It depends on the mode. 'Trim trailing whitespace' removes spaces and tabs at the end of each line only. 'Collapse multiple spaces' collapses runs of spaces inside lines. Indentation at the start of a line is preserved unless you enable 'Trim leading whitespace'." },
    { q: "Is my text safe here?", a: "Yes. Normalisation runs in your browser. Nothing is sent to a server." },
  ],

  "string-reverse": [
    { q: "Does reversing preserve emoji?", a: "Yes. The reversal uses Unicode-aware character iteration, so emoji and multi-codepoint sequences (e.g. family emoji) are treated as single units and not split into individual bytes or code units. 🎉 reversed is still 🎉." },
    { q: "What does 'reverse line order' do?", a: "Instead of reversing characters within lines, it reverses the sequence of lines. If your input has 5 lines, line 5 becomes line 1, line 4 becomes line 2, and so on. Useful for reversing logs or numbered lists." },
    { q: "What is a palindrome?", a: "A palindrome is a word, phrase, or sequence that reads the same forwards and backwards — for example, 'racecar', 'level', and 'A man a plan a canal Panama' (ignoring spaces and capitalisation). Use the reverser to check if a string is a palindrome." },
    { q: "Is my text safe here?", a: "Yes. Reversal runs in your browser. Nothing is sent to a server." },
  ],

  "markdown-to-html": [
    { q: "What is GitHub Flavored Markdown (GFM)?", a: "GFM is GitHub's extension of the original Markdown specification. It adds tables (| col1 | col2 |), task lists (- [x] done), fenced code blocks with syntax highlighting hints (```js), strikethrough (~~text~~), and auto-linked URLs. Most modern Markdown tools support GFM." },
    { q: "Can I use the HTML output directly in a web page?", a: "Yes. Copy the HTML output and paste it inside a <body> or a container div. You will need to add your own CSS for styling — the raw HTML output has semantic tags (h1, p, ul, pre, code) but no inline styles." },
    { q: "How do I add a table in Markdown?", a: "Use pipe characters and dashes: | Header 1 | Header 2 | followed by | --- | --- | and then data rows. Alignment can be specified with colons: | :left | center: | :right: |." },
    { q: "Is my Markdown safe here?", a: "Yes. Rendering runs in your browser. Nothing is sent to a server." },
  ],

  "html-to-markdown": [
    { q: "Why does some HTML not convert cleanly to Markdown?", a: "Markdown is a simpler format than HTML and does not support everything HTML does. Tables with complex spanning, nested lists with mixed content, inline styles (colour, font size), and custom HTML5 elements have no Markdown equivalent and are either simplified or left as raw HTML in the output." },
    { q: "What HTML elements are preserved in Markdown?", a: "Headings (h1-h6), paragraphs, bold/strong, italic/em, inline code, fenced code blocks, links, images, unordered and ordered lists, blockquotes, and horizontal rules all convert cleanly. Tables convert to GFM pipe tables." },
    { q: "Will inline styles be preserved?", a: "No. Markdown has no syntax for text colour, font size, or other visual styles. The converter strips style attributes and keeps only the structural content." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "html-to-text": [
    { q: "What is the difference between 'strip tags' and 'render then extract'?", a: "Stripping tags removes angle-bracket HTML markup but leaves entities like &amp; encoded. Rendering first then extracting (what browsers do) also decodes entities and applies block-level spacing. This tool strips tags and decodes entities, giving clean readable text." },
    { q: "Are links preserved in the plain text output?", a: "Link text is preserved but the URL is discarded unless you enable the 'show URLs' option, which appends the href in parentheses like this: Link text (https://example.com). This matches the output of text-based browsers like Lynx." },
    { q: "Why do some emails look garbled after stripping HTML?", a: "HTML emails often have text in a hidden element alongside an HTML version. Email clients show the HTML; the plain text alternative is a separate MIME part. Copy the HTML source of the email (not the plain text fallback) and strip it here for clean output." },
    { q: "Is my data safe here?", a: "Yes. Processing runs in your browser. Nothing is sent to a server." },
  ],

  "strip-markdown": [
    { q: "What Markdown syntax is removed?", a: "All standard Markdown and GitHub Flavored Markdown syntax is removed: headings (#), bold (**), italic (*_), links ([]()), images (![]()), inline code (`), fenced code blocks (```), blockquotes (>), horizontal rules (---), and list markers (-, *, 1.). The link destination URLs are also discarded." },
    { q: "Is code inside code blocks removed?", a: "The code block syntax markers (backticks or tildes) are removed, but the code content itself is preserved in the plain text output. If you want to remove code entirely, filter the output manually." },
    { q: "Why would I strip Markdown?", a: "Common use cases: generating a word count of actual content, creating a plain-text search index, populating a meta description from Markdown body content, and feeding Markdown content to tools that do not understand Markdown syntax." },
    { q: "Is my data safe here?", a: "Yes. Processing runs in your browser. Nothing is sent to a server." },
  ],

  "unicode-checker": [
    { q: "What is a Unicode codepoint?", a: "A Unicode codepoint is a number assigned to each character in the Unicode standard — over 149,000 characters across 154 scripts. Codepoints are written as U+XXXX (e.g. U+0041 for 'A', U+1F600 for 😀). The checker shows the codepoint, official Unicode name, and category for every character in your input." },
    { q: "What are invisible characters and why are they dangerous?", a: "Invisible characters include zero-width space (U+200B), zero-width non-joiner (U+200C), soft hyphen (U+00AD), byte order mark (U+FEFF), and directional marks (U+200E, U+200F). They are invisible in most editors but present in the string. They can cause string comparison failures, security issues (domain homograph attacks), and unexpected word-boundary behaviour." },
    { q: "What is a homoglyph?", a: "A homoglyph is a character that looks visually similar to another — for example, the Cyrillic 'о' (U+043E) looks identical to the Latin 'o' (U+006F). Homoglyphs are used in phishing (substituting Cyrillic letters in domain names) and obfuscation attacks. The checker flags characters from unexpected scripts." },
    { q: "What does UTF-8 bytes show?", a: "For each character, the checker shows the UTF-8 byte sequence — the actual bytes stored on disk or transmitted over the network. 'A' is one byte (0x41). '€' is three bytes (0xE2 0x82 0xAC). Emoji are typically four bytes. This is useful for calculating byte lengths of strings for database varchar limits and HTTP Content-Length." },
    { q: "Is my text safe here?", a: "Yes. Analysis runs in your browser. Nothing is sent to a server." },
  ],

  "string-inspector": [
    { q: "What is the difference between character count and byte count?", a: "Character count counts Unicode codepoints (visible and invisible). Byte count counts the actual bytes in the string's encoding. For ASCII text they are equal, but for strings with accented characters (é = 2 bytes), emoji (😀 = 4 bytes), or CJK characters (Chinese/Japanese/Korean = 3 bytes) the byte count is higher. Database columns, HTTP headers, and file sizes are measured in bytes." },
    { q: "What is Shannon entropy?", a: "Shannon entropy measures the information density of a string — how unpredictable it is. A string of all the same character ('aaaaaaa') has entropy 0. A random password has high entropy. The inspector shows entropy in bits per character — useful for estimating password strength and detecting encoding anomalies." },
    { q: "Why would I need character frequency analysis?", a: "Frequency analysis is the basis of classical cryptography attacks. It is also useful for detecting which language a text is written in, finding unexpected character distributions in data pipelines, and debugging encoding issues where a specific byte appears more than expected." },
    { q: "Is my text safe here?", a: "Yes. Analysis runs in your browser. Nothing is sent to a server." },
  ],

  "markdown-preview": [
    { q: "What Markdown flavour does this preview use?", a: "The preview renders GitHub Flavored Markdown (GFM) — the same dialect used by GitHub READMEs, issues, and pull requests. This includes tables, task lists (- [x]), fenced code blocks with language tags, strikethrough, and auto-linked URLs." },
    { q: "How do I preview a table in Markdown?", a: "Use pipe characters to define columns: | Col 1 | Col 2 | on the header row, | --- | --- | on the separator row, and | data | data | for each data row. The preview renders it as an HTML table." },
    { q: "Can I export the HTML output?", a: "Yes. Click the 'Copy HTML' button to copy the rendered HTML to your clipboard. You can then paste it into a CMS, email template, or any tool that accepts HTML input." },
    { q: "Is my Markdown safe here?", a: "Yes. Rendering runs in your browser. Nothing is sent to a server." },
  ],

  "text-diff": [
    { q: "What algorithm does the text diff use?", a: "The Myers diff algorithm — the same algorithm used by Git for computing diffs. It finds the shortest edit script (minimum additions and deletions) between two texts. This produces minimal, clean diffs that highlight only genuine changes." },
    { q: "How does the diff handle whitespace-only changes?", a: "By default, whitespace-only changes (extra spaces, blank lines) are shown as additions and deletions. Enable 'Ignore whitespace' to suppress these and see only meaningful text changes." },
    { q: "What is a unified diff?", a: "A unified diff format (used by Git and patch) shows changed lines with context. Added lines are prefixed with +, removed lines with -. It is a compact, standard format readable by most diff tools and code review systems." },
    { q: "Is my data safe here?", a: "Yes. Diff computation runs in your browser. Nothing is sent to a server." },
  ],

  "line-sorter": [
    { q: "What is the difference between sort and deduplicate?", a: "Sort reorders all lines alphabetically (or reverse alphabetically) but keeps duplicates. Deduplicate removes repeated lines while preserving the order of first occurrence. You can combine both — sort first, then deduplicate — to get a sorted unique list." },
    { q: "Is the sort case-sensitive?", a: "By default, sorting is case-insensitive so that 'apple', 'Apple', and 'APPLE' sort together. Enable case-sensitive mode if you need uppercase letters to sort before lowercase (ASCII order: A before a)." },
    { q: "What counts as a line?", a: "A line is any text separated by a newline character (\\n on Unix/macOS, \\r\\n on Windows). Blank lines are treated as empty lines and sorted or deduplicated accordingly. The sorter normalises line endings automatically." },
    { q: "Can I sort numeric values correctly?", a: "Alphabetical sort treats numbers as strings: '10' would sort before '2' (because '1' < '2' as text). Enable numeric sort mode to sort numbers by their actual value so that 2 < 10 < 100." },
  ],

  "diff-checker": [
    { q: "What is a diff and how do I read it?", a: "A diff (difference) highlights what changed between two texts. Lines marked with + exist only in the right/new text (additions); lines marked with - exist only in the left/old text (deletions); unmarked lines are unchanged context. The diff checker shows changes at line level with optional character-level highlighting for precise edit location." },
    { q: "Can I compare code files, not just plain text?", a: "Yes. Paste any text including source code, JSON, YAML, HTML, SQL, or configuration files. The diff is purely text-based — it compares line by line regardless of content type. For structured JSON comparison, the JSON workspace at /json has a dedicated JSON diff mode that understands JSON structure." },
    { q: "What does 'ignore whitespace' do?", a: "When enabled, whitespace-only differences (extra spaces, tab vs space, trailing spaces) are ignored and do not appear as changes. This is useful when comparing code that has been reformatted or when whitespace normalisation differences should not count as meaningful changes." },
    { q: "Is my text private?", a: "Yes. Comparison runs entirely in your browser using JavaScript. Neither the left nor the right text is sent to any server. You can use the diff checker with sensitive content such as config files, credentials, or proprietary code." },
  ],
};
