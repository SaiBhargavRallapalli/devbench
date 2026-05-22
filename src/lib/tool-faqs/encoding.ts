import type { Faq } from "./_types";

export const faqsEncoding: Record<string, Faq[]> = {
  "base64-encode": [
    { q: "What is Base64 encoding?", a: "Base64 is an encoding scheme that converts binary data (or any text) into a string of 64 ASCII characters (A–Z, a–z, 0–9, +, /). It is used to safely transmit binary data over channels that only support text, such as email bodies or JSON payloads." },
    { q: "Is Base64 the same as encryption?", a: "No. Base64 is encoding, not encryption — it is fully reversible without any key. Anyone who sees a Base64 string can decode it instantly. Never use Base64 to hide sensitive data; use a proper encryption algorithm like AES-256 instead." },
    { q: "When is Base64 commonly used?", a: "Base64 is used for: embedding images in HTML/CSS as data URIs (data:image/png;base64,...), storing binary data in JSON, encoding email attachments (MIME), passing binary payloads in URLs, and storing cryptographic keys in PEM format." },
    { q: "How do I decode a Base64 string in JavaScript?", a: "Use the built-in `atob()` function: `atob('SGVsbG8=')` returns 'Hello'. To encode, use `btoa('Hello')`. For binary files or non-ASCII text, use a Uint8Array and TextDecoder for correct Unicode handling." },
    { q: "What is the difference between Base64 and Base64URL?", a: "Base64URL is a URL-safe variant that replaces + with - and / with _ and omits the = padding character. It is used in JWTs, OAuth tokens, and anywhere the standard + and / characters would need percent-encoding in a URL." },
  ],

  "base64-decode": [
    { q: "Is Base64 a form of encryption?", a: "No. Base64 is an encoding scheme, not encryption. Anyone with the encoded string can decode it instantly without a key. For actual encryption, use the AES-256-GCM Encryptor tool on DevBench." },
    { q: "Why does Base64 output end with == or =?", a: "Base64 encodes groups of 3 bytes into 4 characters. When the input length is not divisible by 3, one or two padding characters (=) are added to complete the final group to a multiple of 4." },
    { q: "What is the difference between Base64 and Base64URL?", a: "Standard Base64 uses + and / characters which have special meaning in URLs. Base64URL replaces + with -, / with _, and removes padding (=). It is safe to use in URLs, query strings, and JWT tokens without percent-encoding." },
  ],

  "base64-image": [
    { q: "What is a Base64 image data URI?", a: "A data URI embeds the image data directly in an HTML or CSS attribute using the format data:image/png;base64,<encoded-data>. The browser decodes it without making an HTTP request — useful for small icons, inline email images, and single-file HTML pages." },
    { q: "Should I use Base64 data URIs for all images?", a: "No. Base64 encoding increases file size by ~33%, and the browser cannot cache data URIs the way it caches external image URLs. Reserve them for very small images (icons, spacers <4 KB) and inline email images. For larger images, serve them as files." },
    { q: "What image formats are supported?", a: "PNG, JPEG, WebP, GIF, and SVG for encoding. For decoding, any valid Base64-encoded image data URI can be decoded back to a downloadable file." },
    { q: "How do I use a Base64 image in CSS?", a: "Set it as the background-image value: background-image: url('data:image/png;base64,iVBORw0...'); The same syntax works in HTML img src attributes and <source> elements." },
    { q: "Is my image safe to encode here?", a: "Yes. The encoding runs entirely in your browser using the FileReader API. Your image is never uploaded to a server." },
  ],

  "url-encode": [
    { q: "What is URL encoding (percent-encoding)?", a: "URL encoding converts characters that are not allowed or have special meaning in a URL into a %XX format, where XX is the UTF-8 byte value in hexadecimal. For example, a space becomes %20, & becomes %26, and the euro sign becomes %E2%82%AC. This ensures the URL is valid and unambiguous for any HTTP parser." },
    { q: "When do I need to URL-encode a string?", a: "Any time you're building a URL dynamically and embedding untrusted or user-supplied values. Examples: constructing a search query string (?q=user+input), embedding a redirect URL as a parameter (?next=/some/path?key=val), or passing OAuth state parameters. Forgetting to encode can break the URL or introduce security issues." },
    { q: "What is the difference between encodeURIComponent and encodeURI?", a: "encodeURIComponent encodes everything except A-Z a-z 0-9 and - _ . ! ~ * ' ( ). Use it for individual query parameter values. encodeURI encodes everything except those characters plus the structural URL characters : / ? # [ ] @ ! $ & ' ( ) * + , ; =. Use it for a complete URL that may contain spaces but whose structure should be preserved." },
    { q: "Does the + sign mean a space?", a: "In application/x-www-form-urlencoded encoding (HTML form data), + represents a space. In standard percent-encoding (RFC 3986), a space is %20 and + is a literal plus sign. This tool uses standard percent-encoding (%20 for space) unless you choose the form-encoded mode." },
    { q: "How do I decode a percent-encoded string?", a: "Use the URL Decode tool (linked in the toolbar). In JavaScript, use decodeURIComponent() for component values or decodeURI() for a full URL. These are the exact inverses of their encode counterparts." },
  ],

  "url-decode": [
    { q: "What does URL decoding do?", a: "URL decoding reverses percent-encoding — it converts %20 back to a space, %26 back to &, %2F back to /, and so on. It also optionally converts + signs back to spaces, which is needed for application/x-www-form-urlencoded data submitted by HTML forms." },
    { q: "Why are URLs percent-encoded in the first place?", a: "URLs can only legally contain a limited ASCII subset. Characters outside that set — spaces, non-Latin letters, and some punctuation — must be encoded to avoid ambiguity. The browser encodes URLs automatically when you type them, but when you copy a URL from a database column or API response, you often get the raw encoded string." },
    { q: "What is double-encoding and how do I fix it?", a: "Double-encoding happens when a URL is encoded twice — %20 becomes %2520 (the % is itself encoded to %25). To fix it, decode twice: first pass through decodes %2520 to %20, second pass decodes %20 to a space. The URL Decoder handles this automatically if you enable the 'Double-decode' option." },
    { q: "Is there a difference between decodeURI and decodeURIComponent in JavaScript?", a: "Yes. decodeURI leaves structural characters (:, /, ?, #, etc.) encoded because they form the URL structure. decodeURIComponent decodes everything — use it for individual query parameter values. Calling decodeURIComponent on a full URL will decode structural separators and likely break the URL." },
  ],

  "aes-encrypt-decrypt": [
    { q: "What encryption algorithm is used?", a: "AES-256-GCM — the same algorithm used by TLS 1.3, Signal, and most modern secure systems. The 256 means a 256-bit key; GCM (Galois/Counter Mode) provides authenticated encryption, meaning any tampering with the ciphertext is detected on decryption. A 256-bit key derived from your password via PBKDF2 with 310,000 iterations is used." },
    { q: "Is my data safe to encrypt here?", a: "Yes. All encryption and decryption runs in your browser using the Web Crypto API — your plaintext, password, and ciphertext never leave your device. You can verify this by checking the browser Network tab while encrypting." },
    { q: "What should I use as a password?", a: "Use a long, random password (20+ characters). The tool uses PBKDF2 with 310,000 iterations to derive the encryption key — this slows down dictionary attacks on the password. But a weak password (common words, short strings) can still be brute-forced. Generate a strong password with the Password Generator tool." },
    { q: "Can I decrypt a ciphertext from another AES tool?", a: "Only if the other tool uses the same algorithm (AES-256-GCM), key derivation method (PBKDF2-SHA-256 with the same iteration count), and the same output format for the salt and IV. The ciphertext format is not standardised across tools, so cross-tool decryption is generally not possible without knowing the exact implementation." },
    { q: "What is GCM mode and why does it matter?", a: "GCM (Galois/Counter Mode) provides authenticated encryption — it produces a ciphertext plus an authentication tag. When decrypting, the tag is verified first. If even one byte of the ciphertext has been tampered with, decryption fails before any data is returned. This protects against ciphertext manipulation attacks that affect unauthenticated modes like AES-CBC." },
  ],

  "html-entity-encode": [
    { q: "Why do I need to encode HTML entities?", a: "Characters like < and > have special meaning in HTML — they open and close tags. If you want to display a literal < in a web page without the browser treating it as a tag, you must encode it as &lt;. This is also critical for security: failing to encode user input before inserting it into HTML can cause XSS (cross-site scripting) attacks." },
    { q: "Which characters must always be encoded?", a: "The five essential characters: & (encode first, as &amp;), < (as &lt;), > (as &gt;), \" (as &quot; in attributes), and ' (as &#39; or &apos; in attributes). Everything else is optional to encode but can be encoded for safety." },
    { q: "What is the difference between &amp; &lt; and their numeric equivalents?", a: "Named entities (&amp;, &lt;) and numeric entities (&#38;, &#60;) produce identical results in browsers. Named entities are more readable. Numeric entities are useful in contexts where named entities might not be recognised (some older XML parsers)." },
    { q: "Is this tool safe for preventing XSS?", a: "Encoding HTML entities is the correct technique for preventing XSS when displaying user content as text in HTML. However, it should be applied in code (your templating system or framework) at render time — not as a manual step. Always use your framework's built-in escaping (e.g. React auto-escapes JSX expressions, Django's template language auto-escapes by default)." },
    { q: "Is my data safe to encode here?", a: "Yes. Encoding runs in your browser. Nothing is sent to a server." },
  ],

  "html-entity-decode": [
    { q: "When would HTML entities appear in text I need to decode?", a: "Common sources: CMS databases that store HTML-escaped content, RSS/Atom feed descriptions (which are often HTML-escaped), email body text extracted from MIME, API responses from legacy systems, and clipboard content pasted from web pages." },
    { q: "What is &nbsp; and why does it appear so often?", a: "&nbsp; is the non-breaking space entity (Unicode U+00A0). It is used in HTML to prevent line breaks between words and to add extra spacing. When extracting text from HTML, &nbsp; appears wherever non-breaking spaces were used for layout." },
    { q: "Why doesn't decode work on my text?", a: "Check that the & is not itself encoded — double-encoded text like &amp;lt; needs to be decoded twice to get <. Also ensure the entity names are correct: HTML entities are case-sensitive (&Agrave; ≠ &agrave;)." },
    { q: "Is my data safe to decode here?", a: "Yes. Decoding runs in your browser. Nothing is sent to a server." },
  ],

  "text-to-hex": [
    { q: "Why would I convert text to hex?", a: "Hex is used in network protocols, binary file formats, cryptography (hash values, keys), colour codes in CSS, memory address debugging, and anywhere bytes need to be human-readable without ambiguity about encoding." },
    { q: "What encoding is used for the hex output?", a: "Each character is encoded to its UTF-8 byte sequence and each byte is represented as two hex digits. ASCII characters produce one byte each (e.g. 'A' → 41). Non-ASCII characters produce 2–4 bytes (e.g. '€' → E2 82 AC in UTF-8)." },
    { q: "How do I convert hex back to text?", a: "Use the Hex to Text converter on DevBench (linked in the toolbar). In JavaScript: Buffer.from('48656c6c6f', 'hex').toString('utf8') (Node.js) or new TextDecoder().decode(new Uint8Array(hex.match(/.{2}/g).map(b => parseInt(b, 16)))) in the browser." },
    { q: "Is my data safe to convert here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "hex-to-text": [
    { q: "What hex formats are accepted?", a: "Both continuous (48656c6c6f) and delimited formats (48 65 6c 6c 6f or 48:65:6c:6c:6f) are accepted. The converter strips whitespace and common delimiters automatically before decoding." },
    { q: "Why does my decoded text contain strange characters?", a: "The hex may represent bytes in a non-UTF-8 encoding (Latin-1, Windows-1252, etc.). Try selecting a different output encoding in the options. If the hex represents binary data rather than text, the output will appear garbled — that is expected." },
    { q: "How do I convert a hex colour code to its name?", a: "CSS hex colour codes (like #4f46e5) are not text hex — they are three RGB byte values. Use the Colour Converter on DevBench to look up colour names and convert between hex, RGB, and HSL formats." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "text-to-binary": [
    { q: "Is this the same binary used in computers?", a: "Yes. Each character is converted to its UTF-8 byte value and that byte is represented as an 8-bit binary number (e.g. 'A' = ASCII 65 = 01000001). This is the actual binary representation of the character in memory." },
    { q: "Why does 'A' convert to 01000001?", a: "'A' has ASCII (and Unicode) code point 65. 65 in binary is 1000001 — padded to 8 bits it becomes 01000001. You can verify: 64+1 = 65, and 64 = 2^6 = bit 7, 1 = 2^0 = bit 1." },
    { q: "How do I convert binary back to text?", a: "Use the Binary to Text converter on DevBench. In JavaScript: String.fromCharCode(parseInt('01000001', 2)) converts one byte. For a full string, split on spaces and map each 8-bit group." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "binary-to-text": [
    { q: "What format should the binary input be in?", a: "Groups of 8 bits (one byte) separated by spaces: 01001000 01100101 01101100 01101100 01101111. The converter also accepts continuous binary without spaces as long as the total length is a multiple of 8." },
    { q: "Why do I get garbage characters?", a: "If each binary group does not correspond to a valid UTF-8 byte sequence, the decoded characters will be replacement characters (?) or strange symbols. Ensure the binary was originally produced from UTF-8 text, not a different encoding." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "rot13": [
    { q: "Is ROT13 a cipher or just an encoding?", a: "ROT13 is a trivially simple substitution cipher — it provides no meaningful security because it is widely known and requires no key. It is used for obfuscation (spoilers, puzzle answers) rather than secrecy. Anyone who sees ROT13 text and knows it is ROT13 can decode it instantly." },
    { q: "How do I decode ROT13?", a: "Apply ROT13 again. Because the alphabet has 26 letters and ROT13 shifts by 13, applying it twice brings you back to the original. There is no separate decode step — encoding and decoding are the same operation." },
    { q: "Does ROT13 affect numbers and punctuation?", a: "No. Only the 26 Latin letters (A–Z, a–z) are shifted. Numbers, spaces, punctuation, and non-Latin characters are passed through unchanged." },
    { q: "Is my data safe here?", a: "Yes. ROT13 runs in your browser. Nothing is sent to a server." },
  ],

  "morse-code": [
    { q: "What is International Morse Code?", a: "International Morse Code encodes text as sequences of short signals (dots •) and long signals (dashes −). Originally designed for telegraph communication, it is still used in amateur radio (required for some licences), aviation, and accessibility contexts. Each letter and digit has a unique dot-dash sequence." },
    { q: "How do I use this Morse code generator?", a: "Type or paste any text in the left field and the Morse code output appears instantly — dots and dashes separated by spaces, with words separated by slashes (/). To decode Morse, paste the dots and dashes in the Morse field and the plain text appears on the right. Both directions work simultaneously." },
    { q: "What is SOS in Morse code?", a: "SOS is ... --- ... (three dots, three dashes, three dots). It is the international distress signal chosen because it is easy to transmit and distinguish in Morse. Despite the common folk etymology, SOS does not officially stand for 'Save Our Ship' or 'Save Our Souls' — it was chosen purely for its simplicity." },
    { q: "How are spaces and word boundaries represented?", a: "Letters within a word are separated by a single space. Words are separated by a slash (/). For example, 'HELLO WORLD' in Morse is: .... . .-.. .-.. --- / .-- --- .-. .-.. -.. The converter follows standard International Morse Code spacing." },
    { q: "Does Morse Code support numbers and punctuation?", a: "Yes. All digits 0–9 have Morse representations (1 = .----, 2 = ..---, 0 = -----). Common punctuation is also defined: period (.-.-.-), comma (--..--), question mark (..--..),  and more. Enter numbers or punctuation in the text field and the generator encodes them." },
    { q: "Is my text safe here?", a: "Yes. Translation runs in your browser. Nothing is sent to a server." },
  ],
};
