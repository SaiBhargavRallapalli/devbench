import Link from "next/link";

const prose = "text-sm sm:text-base text-muted-foreground leading-relaxed";
const h2 = "text-xl font-semibold text-foreground mt-8 mb-3";
const h3 = "text-base font-semibold text-foreground mt-5 mb-2";
const ul = "list-disc list-outside pl-5 space-y-1.5 text-sm sm:text-base text-muted-foreground";
const ol = "list-decimal list-outside pl-5 space-y-1.5 text-sm sm:text-base text-muted-foreground";
const code = "font-mono text-xs bg-muted px-1.5 py-0.5 rounded";
const table = "w-full text-sm border-collapse my-4";
const th = "text-left px-3 py-2 bg-muted font-semibold text-foreground border border-border";
const td = "px-3 py-2 border border-border text-muted-foreground";

function UuidVsUlidVsNanoid() {
  return (
    <div className="space-y-4">
      <p className={prose}>
        Every developer reaches for <code className={code}>UUID v4</code> without thinking — it's in every language's standard library and universally supported. But UUID has real problems: it's 36 characters, not sortable, and can fragment B-tree indexes. ULID and Nano ID solve these. Here's when each one is the right tool.
      </p>

      <h2 className={h2}>UUID v4 — the safe default</h2>
      <p className={prose}>
        UUID v4 is a 128-bit random number formatted as <code className={code}>xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx</code> — 32 hex digits and 4 dashes. The probability of a collision is 1 in 2¹²², which is astronomically small.
      </p>
      <p className={prose}>
        Use UUID v4 when:
      </p>
      <ul className={ul}>
        <li>You need maximum ecosystem compatibility — PostgreSQL has a native <code className={code}>uuid</code> type, MySQL supports it, ORMs know how to handle it</li>
        <li>IDs are not exposed in URLs (so the 36-char length doesn't matter)</li>
        <li>Your database table is append-heavy and you're using <code className={code}>uuid_generate_v4()</code> or <code className={code}>gen_random_uuid()</code> at the DB level</li>
      </ul>
      <p className={prose}>
        <strong>The real problem with UUID v4</strong> is index fragmentation. Because UUIDs are random, each insert lands at a random position in your B-tree index — causing page splits and cache misses at scale. This matters at millions of rows, not thousands.
      </p>

      <h2 className={h2}>ULID — when insertion order matters</h2>
      <p className={prose}>
        ULID (Universally Unique Lexicographically Sortable Identifier) looks like this: <code className={code}>01ARZ3NDEKTSV4RRFFQ69G5FAV</code>. It's 26 characters in Crockford Base32 encoding.
      </p>
      <p className={prose}>
        The key property: the first 10 characters encode a millisecond timestamp. This means ULIDs generated close together sort together — inserts land near the end of the B-tree index rather than scattered randomly. <strong>This is much better for write-heavy workloads.</strong>
      </p>
      <ul className={ul}>
        <li>Time-sortable — rows with adjacent ULIDs were inserted at nearly the same time</li>
        <li>26 characters vs 36 for UUID (no dashes)</li>
        <li>Case-insensitive — the alphabet excludes I, L, O, U to avoid visual ambiguity</li>
        <li>128-bit entropy total (48 bits time + 80 bits random)</li>
      </ul>
      <p className={prose}>
        Use ULID for database primary keys where you care about index performance, or when you want IDs to carry implicit ordering by creation time (e.g., paginating by ID instead of a separate <code className={code}>created_at</code> column).
      </p>

      <h2 className={h2}>Nano ID — compact and URL-safe</h2>
      <p className={prose}>
        Nano ID generates short, URL-safe identifiers: <code className={code}>V1StGXR8_Z5jdHi6B-myT</code>. The default length is 21 characters using a 64-character alphabet (<code className={code}>A-Za-z0-9_-</code>).
      </p>
      <ul className={ul}>
        <li>21 characters by default (configurable down to 6, up to anything)</li>
        <li>URL-safe alphabet — no encoding needed in query strings or paths</li>
        <li>No timestamp component — purely random</li>
        <li>~126 bits of entropy at the default length (comparable to UUID v4)</li>
      </ul>
      <p className={prose}>
        Use Nano ID for short IDs that appear in URLs, API keys, session tokens, share links, and anywhere compact size matters more than sortability.
      </p>

      <h2 className={h2}>Quick comparison</h2>
      <table className={table}>
        <thead>
          <tr>
            <th className={th}>Property</th>
            <th className={th}>UUID v4</th>
            <th className={th}>ULID</th>
            <th className={th}>Nano ID</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className={td}>Length</td><td className={td}>36 chars</td><td className={td}>26 chars</td><td className={td}>21 chars</td></tr>
          <tr><td className={td}>Sortable</td><td className={td}>No</td><td className={td}>Yes (by time)</td><td className={td}>No</td></tr>
          <tr><td className={td}>URL-safe</td><td className={td}>Yes (with dashes)</td><td className={td}>Yes</td><td className={td}>Yes</td></tr>
          <tr><td className={td}>DB index friendly</td><td className={td}>Poor at scale</td><td className={td}>Excellent</td><td className={td}>Poor at scale</td></tr>
          <tr><td className={td}>Ecosystem support</td><td className={td}>Universal</td><td className={td}>Good</td><td className={td}>Good</td></tr>
        </tbody>
      </table>

      <h2 className={h2}>The verdict</h2>
      <p className={prose}>
        Default to UUID v4 if you're unsure — compatibility wins. Switch to ULID if you're building a write-heavy service and B-tree index performance matters. Use Nano ID when IDs appear in user-visible URLs and compactness is a priority.
      </p>
    </div>
  );
}

function JwtExplained() {
  return (
    <div className="space-y-4">
      <p className={prose}>
        A JSON Web Token is three Base64URL-encoded strings joined by dots: <code className={code}>header.payload.signature</code>. The compact format makes JWTs easy to embed in HTTP headers, URL query strings, and cookies. But that compactness hides a lot of nuance — especially around security.
      </p>

      <h2 className={h2}>The header</h2>
      <p className={prose}>
        The header is a JSON object describing the token type and the signing algorithm. Decoded, it typically looks like:
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`{
  "alg": "HS256",
  "typ": "JWT"
}`}
      </pre>
      <p className={prose}>
        The <code className={code}>alg</code> field is critical. Common values:
      </p>
      <ul className={ul}>
        <li><code className={code}>HS256</code> — HMAC-SHA256. Symmetric: the same secret is used to sign and verify. Simple but the secret must be shared between services.</li>
        <li><code className={code}>RS256</code> — RSA-SHA256. Asymmetric: sign with a private key, verify with a public key. Better for microservices — only the auth server needs the private key.</li>
        <li><code className={code}>ES256</code> — ECDSA with P-256. Like RS256 but smaller key sizes and faster operations.</li>
        <li><code className={code}>none</code> — No signature. <strong>Never accept this in production.</strong> Attackers can forge tokens with <code className={code}>"alg": "none"</code> if your library doesn't explicitly reject it.</li>
      </ul>

      <h2 className={h2}>The payload</h2>
      <p className={prose}>
        The payload contains claims — statements about the token subject. Standard registered claims:
      </p>
      <ul className={ul}>
        <li><code className={code}>sub</code> — subject: the user ID or entity this token represents</li>
        <li><code className={code}>iss</code> — issuer: the service that issued the token (e.g. <code className={code}>https://auth.example.com</code>)</li>
        <li><code className={code}>aud</code> — audience: the intended recipient service(s)</li>
        <li><code className={code}>exp</code> — expiry: Unix timestamp after which the token is invalid</li>
        <li><code className={code}>iat</code> — issued at: when the token was created</li>
        <li><code className={code}>nbf</code> — not before: token is invalid before this time</li>
        <li><code className={code}>jti</code> — JWT ID: unique identifier for this token (enables revocation)</li>
      </ul>
      <p className={prose}>
        <strong>Important:</strong> The payload is Base64URL-encoded, not encrypted. Anyone with the token can read the payload — never put passwords, credit card numbers, or other secrets in a JWT payload.
      </p>

      <h2 className={h2}>The signature</h2>
      <p className={prose}>
        The signature prevents tampering. For HS256, it is computed as:
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`HMAC-SHA256(
  base64url(header) + "." + base64url(payload),
  secret
)`}
      </pre>
      <p className={prose}>
        If an attacker changes any bit of the header or payload, the signature won't verify. This is what makes JWTs tamper-evident — not confidential.
      </p>

      <h2 className={h2}>Common JWT pitfalls</h2>
      <ul className={ul}>
        <li><strong>Algorithm confusion attack</strong> — if your library accepts both HS256 and RS256, an attacker can take an RS256 public key (which is public), sign a token with it using HS256, and the library may accept it if it doesn't check the expected algorithm explicitly.</li>
        <li><strong>Not validating expiry</strong> — always check <code className={code}>exp</code>. A valid signature doesn't mean a token is still valid.</li>
        <li><strong>Not validating audience</strong> — a token issued for Service A should be rejected by Service B. Check <code className={code}>aud</code>.</li>
        <li><strong>Weak secrets for HS256</strong> — a short or guessable HMAC secret can be brute-forced. Use at least 256 bits of random entropy.</li>
        <li><strong>Storing in localStorage</strong> — accessible to any JavaScript on the page. Prefer httpOnly cookies for tokens that authorize actions.</li>
      </ul>

      <h2 className={h2}>JWT vs sessions</h2>
      <p className={prose}>
        JWTs are stateless — the server doesn't store anything. Sessions are stateful — the server stores session data and gives the client an opaque ID. JWTs scale horizontally without a shared session store, but can't be individually revoked (you have to wait for <code className={code}>exp</code> or implement a token blocklist — which adds state back anyway). For most applications, server-side sessions with a fast store (Redis) are simpler and more secure.
      </p>
    </div>
  );
}

function EncodeUriComponentVsEncodeUri() {
  return (
    <div className="space-y-4">
      <p className={prose}>
        JavaScript has two built-in URL encoding functions and developers mix them up constantly. Using the wrong one either produces broken URLs or silently leaves characters unencoded that should be escaped. Here's the precise rule for each.
      </p>

      <h2 className={h2}>What is percent-encoding?</h2>
      <p className={prose}>
        URLs can only contain a limited set of ASCII characters. Any other character — including spaces, non-Latin letters, and many punctuation marks — must be converted to a <code className={code}>%XX</code> sequence where <code className={code}>XX</code> is the character's hexadecimal UTF-8 byte value. A space becomes <code className={code}>%20</code>, a euro sign € becomes <code className={code}>%E2%82%AC</code>.
      </p>

      <h2 className={h2}>encodeURIComponent — for individual values</h2>
      <p className={prose}>
        <code className={code}>encodeURIComponent()</code> encodes everything <em>except</em>:
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`A-Z a-z 0-9 - _ . ! ~ * ' ( )`}
      </pre>
      <p className={prose}>
        This means it encodes structural URL characters like <code className={code}>/ ? # @ &amp; = + :</code>. That's intentional — you're encoding a <em>value</em>, not a URL, so those characters should be escaped so they can't be misinterpreted as URL structure.
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`const query = encodeURIComponent("hello world & more");
// → "hello%20world%20%26%20more"

const url = \`https://api.example.com/search?q=\${query}\`;
// → "https://api.example.com/search?q=hello%20world%20%26%20more"`}
      </pre>
      <p className={prose}><strong>Use this for:</strong> query parameter values, path segment values, form field data.</p>

      <h2 className={h2}>encodeURI — for complete URLs</h2>
      <p className={prose}>
        <code className={code}>encodeURI()</code> encodes everything <em>except</em> characters that are legal in a complete URL:
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`A-Z a-z 0-9 - _ . ! ~ * ' ( ) ; / ? : @ & = + $ , #`}
      </pre>
      <p className={prose}>
        It deliberately leaves <code className={code}>/ ? # &amp; = + :</code> intact because it assumes those are structural URL characters, not data values.
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`const url = encodeURI("https://example.com/path with spaces?q=hello");
// → "https://example.com/path%20with%20spaces?q=hello"
// Note: the ? and = are preserved (they're structure)
// But the space in the path is encoded`}
      </pre>
      <p className={prose}><strong>Use this for:</strong> encoding a complete URL that may contain spaces or non-ASCII characters, but whose structure (<code className={code}>://</code>, <code className={code}>?</code>, <code className={code}>&amp;</code>, <code className={code}>=</code>) should be preserved.</p>

      <h2 className={h2}>The most common mistake</h2>
      <p className={prose}>
        Using <code className={code}>encodeURI()</code> for query parameter values. If your value contains <code className={code}>&amp;</code> (e.g. a company name "AT&amp;T"), <code className={code}>encodeURI()</code> won't encode it — breaking the query string. Always use <code className={code}>encodeURIComponent()</code> for values.
      </p>

      <h2 className={h2}>The modern alternative: URLSearchParams</h2>
      <p className={prose}>
        In modern JavaScript, you rarely need either function directly. Use <code className={code}>URLSearchParams</code> which handles encoding automatically:
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`const params = new URLSearchParams({
  q: "hello world & more",
  page: "1",
});
const url = \`https://api.example.com/search?\${params}\`;
// → "https://api.example.com/search?q=hello+world+%26+more&page=1"`}
      </pre>
      <p className={prose}>
        Note that <code className={code}>URLSearchParams</code> uses <code className={code}>+</code> for spaces (application/x-www-form-urlencoded) while <code className={code}>encodeURIComponent()</code> uses <code className={code}>%20</code>. Both are valid in query strings; most servers handle both.
      </p>
    </div>
  );
}

function CommonJsonErrors() {
  return (
    <div className="space-y-4">
      <p className={prose}>
        JSON is strict. Patterns that work fine in JavaScript object literals silently break JSON parsers. These are the seven errors that account for the vast majority of "Unexpected token" and "JSON parse error" messages.
      </p>

      <h2 className={h2}>1. Trailing comma</h2>
      <p className={prose}>
        The most common JSON error. JavaScript allows trailing commas; JSON does not.
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`// ❌ Invalid JSON
{
  "name": "Alice",
  "age": 30,   ← trailing comma
}

// ✅ Valid JSON
{
  "name": "Alice",
  "age": 30
}`}
      </pre>

      <h2 className={h2}>2. Single-quoted strings</h2>
      <p className={prose}>
        JSON requires double quotes. Single quotes are a JavaScript convenience, not part of the JSON spec.
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`// ❌ Invalid
{ 'name': 'Alice' }

// ✅ Valid
{ "name": "Alice" }`}
      </pre>

      <h2 className={h2}>3. Unquoted keys</h2>
      <p className={prose}>
        Object keys must be quoted strings in JSON. Unquoted keys are valid in JavaScript (<code className={code}>{`{ name: "Alice" }`}</code>) but invalid in JSON.
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`// ❌ Invalid JSON
{ name: "Alice" }

// ✅ Valid JSON
{ "name": "Alice" }`}
      </pre>

      <h2 className={h2}>4. Comments</h2>
      <p className={prose}>
        JSON has no comment syntax. Neither <code className={code}>// single-line</code> nor <code className={code}>/* block */</code> comments are valid. If you need comments in config files, consider JSONC (JSON with Comments, used by VS Code), YAML, or TOML instead.
      </p>

      <h2 className={h2}>5. NaN, Infinity, and undefined</h2>
      <p className={prose}>
        These are valid JavaScript values but not valid JSON. <code className={code}>JSON.stringify()</code> silently converts them:
      </p>
      <ul className={ul}>
        <li><code className={code}>NaN</code> → <code className={code}>null</code></li>
        <li><code className={code}>Infinity</code> → <code className={code}>null</code></li>
        <li><code className={code}>undefined</code> → key is omitted entirely</li>
      </ul>
      <p className={prose}>This means round-tripping through JSON can silently lose or change data if your objects contain these values.</p>

      <h2 className={h2}>6. Unescaped control characters in strings</h2>
      <p className={prose}>
        Literal newlines, tabs, and other control characters (U+0000 to U+001F) inside string values must be escaped. A raw newline in a string value is invalid.
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`// ❌ Invalid — literal newline in string
{ "message": "line one
line two" }

// ✅ Valid — escaped newline
{ "message": "line one\\nline two" }`}
      </pre>

      <h2 className={h2}>7. Numbers: hex, leading zeros, bare decimal point</h2>
      <p className={prose}>
        JSON numbers must be decimal only. Hexadecimal literals, octal literals, and numbers with a leading decimal point are not valid.
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`// ❌ Invalid JSON numbers
{ "a": 0xFF, "b": 077, "c": .5, "d": 1. }

// ✅ Valid
{ "a": 255, "b": 63, "c": 0.5, "d": 1.0 }`}
      </pre>

      <h2 className={h2}>Quick fix</h2>
      <p className={prose}>
        Paste your broken JSON into the validator below — it highlights the exact line and column of the error and explains what went wrong.
      </p>
    </div>
  );
}

function RegexCheatSheet() {
  return (
    <div className="space-y-4">
      <p className={prose}>
        Most developers use regex for the same 15–20 patterns repeatedly. This reference covers the patterns that actually appear in production JavaScript code, with copy-ready snippets and notes on edge cases.
      </p>

      <h2 className={h2}>Syntax quick reference</h2>
      <table className={table}>
        <thead>
          <tr>
            <th className={th}>Pattern</th>
            <th className={th}>Meaning</th>
          </tr>
        </thead>
        <tbody>
          {[
            [".","Any character except newline (use s flag to include newlines)"],
            ["\\d / \\D","Digit / non-digit"],
            ["\\w / \\W","Word char (A-Za-z0-9_) / non-word"],
            ["\\s / \\S","Whitespace / non-whitespace"],
            ["^ / $","Start / end of string (m flag: start/end of line)"],
            ["* + ?","0 or more / 1 or more / 0 or 1"],
            ["{n} {n,} {n,m}","Exactly n / at least n / between n and m"],
            ["(abc)","Capture group — referenced as $1, $2..."],
            ["(?:abc)","Non-capturing group — groups but doesn't capture"],
            ["(?<name>abc)","Named capture group — referenced as $<name>"],
            ["a|b","Alternation: a or b"],
            ["[abc]","Character class: a, b, or c"],
            ["[^abc]","Negated class: anything except a, b, c"],
            ["\\b / \\B","Word boundary / non-word boundary"],
            ["(?=abc)","Positive lookahead: followed by abc"],
            ["(?!abc)","Negative lookahead: not followed by abc"],
          ].map(([pat, desc]) => (
            <tr key={pat}>
              <td className={td}><code className={code}>{pat}</code></td>
              <td className={td}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className={h2}>Common patterns</h2>

      <h3 className={h3}>Email address (practical)</h3>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-2">
{`/^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$/`}
      </pre>
      <p className={prose}>Note: the only truly correct email regex spans thousands of characters. For most apps, validate server-side by sending a confirmation email.</p>

      <h3 className={h3}>URL</h3>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-2">
{`/^https?:\\/\\/[^\\s/$.?#].[^\\s]*$/i`}
      </pre>

      <h3 className={h3}>IPv4 address</h3>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-2">
{`/^(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$/`}
      </pre>

      <h3 className={h3}>ISO 8601 date (YYYY-MM-DD)</h3>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-2">
{`/^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$/`}
      </pre>

      <h3 className={h3}>UUID v4</h3>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-2">
{`/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`}
      </pre>

      <h3 className={h3}>Semantic version (semver)</h3>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-2">
{`/^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$/`}
      </pre>

      <h3 className={h3}>Hex color code</h3>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-2">
{`/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/`}
      </pre>

      <h3 className={h3}>Phone number (E.164 international format)</h3>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-2">
{`/^\\+[1-9]\\d{1,14}$/`}
      </pre>

      <h3 className={h3}>Strong password (min 8 chars, upper + lower + digit + symbol)</h3>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-2">
{`/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d]).{8,}$/`}
      </pre>

      <h3 className={h3}>Slug (URL-safe)</h3>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-2">
{`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`}
      </pre>

      <h2 className={h2}>Flags cheatsheet</h2>
      <ul className={ul}>
        <li><code className={code}>g</code> — global: find all matches (not just first). Required for <code className={code}>String.matchAll()</code>.</li>
        <li><code className={code}>i</code> — case-insensitive</li>
        <li><code className={code}>m</code> — multiline: <code className={code}>^</code> and <code className={code}>$</code> match line boundaries, not string boundaries</li>
        <li><code className={code}>s</code> — dotAll: <code className={code}>.</code> matches <code className={code}>\n</code> too</li>
        <li><code className={code}>u</code> — unicode: enables <code className={code}>\p{"{...}"}</code> property escapes and correct handling of surrogate pairs</li>
        <li><code className={code}>d</code> — indices: adds <code className={code}>.indices</code> to match results with start/end positions</li>
      </ul>

      <h2 className={h2}>Test your patterns interactively</h2>
      <p className={prose}>
        Paste any pattern from above into the regex tester to see live match highlighting, capture group values, and the equivalent Python/Go/PHP code.
      </p>
    </div>
  );
}

function HowToValidateJsonOnline() {
  return (
    <div className="space-y-4">
      <p className={prose}>
        Invalid JSON is one of the fastest ways to break APIs, CI pipelines, and config deploys — often with an error message that points at the wrong line. Validating JSON before you merge or ship catches problems early. Here is what “validate” actually means, how online tools differ, and a repeatable workflow.
      </p>

      <h2 className={h2}>What “valid JSON” means</h2>
      <p className={prose}>
        JSON validation usually means <strong>syntax checking</strong>: the text must follow{" "}
        <Link href="/blog/common-json-errors" className="text-accent hover:underline">
          strict rules
        </Link>{" "}
        — double-quoted keys and strings, no trailing commas, no comments, no{" "}
        <code className={code}>undefined</code>. A validator runs <code className={code}>JSON.parse()</code> (or equivalent) and either succeeds or reports the first parse error with a position.
      </p>
      <p className={prose}>
        That is different from <strong>schema validation</strong> (JSON Schema, OpenAPI), which checks whether the <em>shape</em> of the data matches what your service expects — required fields, types, enums. You need both in mature systems: syntax first, then schema where it matters.
      </p>

      <h2 className={h2}>Why “online” matters for privacy</h2>
      <p className={prose}>
        Many “JSON validator” sites send your paste to a backend or third-party analytics. For internal configs, sample API payloads, or anything proprietary, that is a real leak surface. Before you paste sensitive data anywhere, check whether processing happens <strong>entirely in your browser</strong> (no upload) — or use a local editor / CLI.
      </p>
      <ul className={ul}>
        <li><strong>Browser-only tools</strong> — parsing runs in JavaScript on your machine; nothing should leave the tab except what you explicitly export.</li>
        <li><strong>Server-backed validators</strong> — convenient for huge files or shared links, but assume the text is stored or logged unless the product states otherwise.</li>
        <li><strong>CLI</strong> — <code className={code}>jq . file.json</code> or <code className={code}>python -m json.tool</code> are fine for local files and CI.</li>
      </ul>

      <h2 className={h2}>How to validate JSON online (step by step)</h2>
      <ol className={ol}>
        <li>Copy the raw JSON — not a screenshot, not markdown — from your editor, log, or HTTP client.</li>
        <li>Paste into a validator that runs client-side. You should get either “valid” or a single clear error (line/column or pointer).</li>
        <li>If invalid, fix the first error only; often later errors are cascading artifacts.</li>
        <li>Re-run until parse succeeds. Optionally pretty-print to confirm structure.</li>
        <li>For APIs, paste the same payload into your integration test or schema validator before deploy.</li>
      </ol>

      <h2 className={h2}>Tips that save time</h2>
      <ul className={ul}>
        <li>Watch for smart quotes from Slack or Word — replace with straight <code className={code}>"</code>.</li>
        <li>Large minified blobs: use a formatter after validation so diffs are readable.</li>
        <li>If validation passes but the API still rejects the body, the problem is usually headers, encoding, or schema — not JSON syntax.</li>
      </ul>

      <h2 className={h2}>Try it on DevBench</h2>
      <p className={prose}>
        The JSON Formatter &amp; Validator runs in your browser — paste, validate, and format without sending your payload to our servers. Use it whenever you need a quick sanity check before commit or deploy.
      </p>
    </div>
  );
}

function JwtDecoderWithoutUploading() {
  return (
    <div className="space-y-4">
      <p className={prose}>
        A JWT looks opaque, but the header and payload are only <strong>Base64URL-encoded JSON</strong>. Anyone who has the token string can decode those two parts — no secret required. That is why “decoding” in the browser is straightforward; the security story is about where the token travels, not about magic encryption of the payload.
      </p>

      <h2 className={h2}>What “without uploading to a server” means</h2>
      <p className={prose}>
        Some JWT tools send your token to an API to decode or verify. If you care about operational secrecy — staging tokens, internal user IDs in claims, or compliance — you want a tool where the token never leaves your device in an HTTP request. A proper client-side decoder only runs JavaScript in your tab: split the three JWT segments, Base64URL-decode header and payload, then pretty-print JSON.
      </p>
      <p className={prose}>
        DevBench’s JWT Debugger follows that model: decode and inspect locally in the browser, with no round-trip to decode the header and payload.
      </p>

      <h2 className={h2}>Decoding is not verifying</h2>
      <p className={prose}>
        Reading the payload does <strong>not</strong> prove the token is legitimate. Signature verification (HMAC with a secret, or asymmetric keys) must use the correct key material on a trusted path. A malicious token can still contain arbitrary claims; only verification binds those claims to an issuer.
      </p>
      <p className={prose}>
        For a full tour of header algorithms and pitfalls, see{" "}
        <Link href="/blog/jwt-explained" className="text-accent hover:underline">
          JWT Explained: Header, Payload, and Signature Decoded
        </Link>
        .
      </p>

      <h2 className={h2}>When you should still be careful</h2>
      <ul className={ul}>
        <li><strong>Shared or recorded screens</strong> — claims may include emails, tenant IDs, or session metadata.</li>
        <li><strong>Browser extensions</strong> — treat them like untrusted code with access to page content.</li>
        <li><strong>Refresh tokens and long-lived secrets</strong> — decoding is fine; storing or logging them is not.</li>
      </ul>
      <p className={prose}>
        If a token is highly sensitive, prefer local OpenSSL or <code className={code}>jwt-cli</code> on an air-gapped machine — same math, zero web surface.
      </p>

      <h2 className={h2}>Practical workflow</h2>
      <ol className={ol}>
        <li>Copy the JWT from the <code className={code}>Authorization</code> header or your auth library’s debug output.</li>
        <li>Paste into a client-side decoder and confirm <code className={code}>alg</code>, <code className={code}>iss</code>, <code className={code}>exp</code>, and audience claims match expectations.</li>
        <li>If something looks wrong, rotate credentials and verify signatures on the server — never trust decode output alone for authorization decisions.</li>
      </ol>
    </div>
  );
}

function Base64EncodingExplained() {
  return (
    <div className="space-y-4">
      <p className={prose}>
        Base64 is <strong>encoding</strong>, not encryption. It maps arbitrary bytes to a limited alphabet of 64 printable ASCII characters so binary data can survive channels that only tolerate text — email bodies (MIME), JSON fields, XML, URLs (often Base64URL), and HTML{" "}
        <code className={code}>data:</code> URIs. Understanding the mechanics explains the ~33% size overhead — and why Base64 is the wrong tool whenever you need secrecy or optimal bandwidth.
      </p>

      <h2 className={h2}>How Base64 works</h2>
      <p className={prose}>
        Input bytes are treated as a continuous stream of bits. Those bits are sliced into groups of <strong>six</strong> bits (64 possible values per group). Each sextet indexes a symbol from the alphabet{" "}
        <code className={code}>A–Z</code>, <code className={code}>a–z</code>, <code className={code}>0–9</code>, then typically <code className={code}>+</code> and <code className={code}>/</code> for the standard alphabet (MIME / PEM). Three bytes (24 bits) become four Base64 characters with no waste.
      </p>
      <p className={prose}>
        When the bit length is not divisible by 24, the final quantum is padded so the encoder always outputs full groups of four characters. Padding uses <code className={code}>=</code> (one or two equals signs) so decoders know how many trailing bits were insignificant. That padding is why you sometimes see <code className={code}>==</code> at the end of a string.
      </p>

      <h2 className={h2}>Base64 vs Base64URL</h2>
      <p className={prose}>
        In URLs, <code className={code}>+</code> and <code className={code}>/</code> are awkward without escaping. Base64URL replaces <code className={code}>+</code> → <code className={code}>-</code>, <code className={code}>/</code> → <code className={code}>_</code>, and usually omits padding. JWTs use Base64URL for header and payload segments — same math, URL-safe alphabet.
      </p>

      <h2 className={h2}>When Base64 is the right tool</h2>
      <ul className={ul}>
        <li><strong>Embedding small binaries in text formats</strong> — icons or thumbnails as <code className={code}>data:image/png;base64,...</code> in HTML or CSS.</li>
        <li><strong>Carrying binary inside JSON or XML</strong> — certificate PEM bodies, protobuf in JSON, attachment blobs.</li>
        <li><strong>SMTP and MIME</strong> — historical email attachments before binary transports were universal.</li>
        <li><strong>Checksums and fingerprints as text</strong> — hex is fine too; Base64 is shorter than hex for the same bytes but not human-sortable.</li>
      </ul>

      <h2 className={h2}>When NOT to use Base64</h2>
      <ul className={ul}>
        <li>
          <strong>Never call it “encryption.”</strong> Anyone can decode Base64 instantly — there is no key. If you need confidentiality, use real cryptography (for example TLS for transport, AES-256-GCM for payload protection at rest). Confusing encoding with encryption leads to leaked passwords and compliance failures.
        </li>
        <li>
          <strong>Large payloads without compression first.</strong> Base64 expands size by roughly one third. Encoding gigabytes of raw binary into JSON is slow, cache-unfriendly, and expensive at the edge. Compress or use dedicated blob storage with signed URLs instead.
        </li>
        <li>
          <strong>Secrets you hope to “hide” in URLs or logs.</strong> Obfuscation is not protection. Tokens in query strings end up in referrer headers, analytics, and server logs — Base64 does not change that risk profile.
        </li>
        <li>
          <strong>When hex or plain UTF-8 would work.</strong> If you already have text, encoding again wastes bytes and CPU.
        </li>
      </ul>

      <h2 className={h2}>Quick mental model</h2>
      <p className={prose}>
        Treat Base64 like turning binary into a fax-friendly alphabet: reversible, universal, and visible to everyone. Use it where the transport demands text; use cryptography where the data demands privacy.
      </p>
    </div>
  );
}

function JwtSecurityBestPractices() {
  return (
    <div className="space-y-4">
      <p className={prose}>
        JWTs solve real problems — horizontal scaling without sticky sessions, OAuth/OIDC interop, and signed assertions between services — but they are easy to misuse. Below are ten mistakes teams make repeatedly, with practical fixes. For structure of the token itself, see{" "}
        <Link href="/blog/jwt-explained" className="text-accent hover:underline">
          JWT Explained
        </Link>
        .
      </p>

      <h3 className={h3}>1. Treating the payload as confidential</h3>
      <p className={prose}>
        The middle segment is Base64URL-encoded JSON. Anyone with the JWT can decode it. Never put passwords, API keys, card numbers, or detailed PII in claims unless you also encrypt (JWE) — and most stacks stick to signed JWT (JWS) only.
      </p>

      <h3 className={h3}>2. Skipping signature verification</h3>
      <p className={prose}>
        Decoding is not verifying. Your API must validate the signature with the correct key (HMAC secret or asymmetric public key), check <code className={code}>alg</code> against an allowlist, and reject tokens signed with unexpected algorithms — algorithm confusion between HS256 and RS256 has caused real breaches.
      </p>

      <h3 className={h3}>3. Ignoring expiry and clock skew</h3>
      <p className={prose}>
        Always enforce <code className={code}>exp</code> (and usually <code className={code}>nbf</code>). Allow a small clock skew window (for example ±60 seconds) between issuers and validators so legitimate tokens are not rejected on boundary seconds.
      </p>

      <h3 className={h3}>4. Not constraining audience and issuer</h3>
      <p className={prose}>
        Validate <code className={code}>aud</code> against your API’s identifier and <code className={code}>iss</code> against your identity provider’s issuer URL. A token minted for Service A must not authorize requests to Service B.
      </p>

      <h3 className={h3}>5. Weak secrets for HS256</h3>
      <p className={prose}>
        Symmetric signing puts the entire security on one shared string. Use long, random secrets (≥256 bits of entropy), rotate them with a plan, and never embed secrets in client-side code — browsers cannot hold signing secrets safely for HS256-issued tokens consumed by the same browser.
      </p>

      <h3 className={h3}>6. Storing access tokens in localStorage</h3>
      <p className={prose}>
        Any XSS payload can read <code className={code}>localStorage</code>. Prefer <code className={code}>httpOnly</code>, <code className={code}>Secure</code>, <code className={code}>SameSite</code> cookies for refresh/session flows where your threat model includes XSS — paired with tight CSP and short-lived access tokens.
      </p>

      <h3 className={h3}>7. Long-lived access tokens without rotation</h3>
      <p className={prose}>
        Long expiry reduces traffic but increases blast radius when a token leaks. Prefer short access tokens plus refresh token rotation (one-time use refresh tokens stored server-side or in HttpOnly cookies).
      </p>

      <h3 className={h3}>8. No revocation story</h3>
      <p className={prose}>
        Stateless JWT means validators do not ask a database — until you need instant revoke after compromise. Plan for blocklists, session versions, or rotating signing keys (kid headers). Pure “JWT means no DB” breaks down the moment you must invalidate tokens early.
      </p>

      <h3 className={h3}>9. Logging tokens verbatim</h3>
      <p className={prose}>
        Request logs, APM traces, and error reports often capture Authorization headers. Log that a bearer token was present — never the full string — and scrub proxies accordingly.
      </p>

      <h3 className={h3}>10. Using JWT for everything by default</h3>
      <p className={prose}>
        Server-side sessions with opaque IDs and Redis often simplify revocation, device binding, and logout. JWT shines for federation and cross-service claims; it is not mandatory for every SPA. Pick the model from threat model and ops constraints, not hype.
      </p>

      <h2 className={h2}>Bottom line</h2>
      <p className={prose}>
        Secure JWT usage is mostly boring hygiene: verify signatures, narrow claims, short lifetimes, thoughtful storage, and explicit revocation. Decode in the browser for debugging — authorize only after cryptographic verification on the server.
      </p>
    </div>
  );
}

function YamlVsJsonExplained() {
  return (
    <div className="space-y-4">
      <p className={prose}>
        JSON is the lingua franca of APIs and browsers: strict, easy to parse, and ubiquitous. YAML optimizes for humans writing config: fewer quotes, readable structure, comments — plus features JSON does not have (anchors, aliases, tags). Both serialize structured data; they differ in ergonomics and foot-guns.
      </p>

      <h2 className={h2}>Syntax: noise vs intent</h2>
      <p className={prose}>
        JSON requires double quotes around keys and strings, commas between properties, and no trailing commas — see{" "}
        <Link href="/blog/common-json-errors" className="text-accent hover:underline">
          common JSON mistakes
        </Link>
        . YAML often lets you drop quotes when strings look unambiguous and uses indentation instead of braces for nesting.
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`// JSON — explicit punctuation
{
  "service": "payments",
  "timeout_ms": 3000,
  "regions": ["iad", "pdx"]
}`}
      </pre>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`# YAML — indentation defines scope (use spaces; tabs are messy)
service: payments
timeout_ms: 3000
regions:
  - iad
  - pdx`}
      </pre>

      <h2 className={h2}>Comments</h2>
      <p className={prose}>
        Standard JSON has no comments. YAML supports <code className={code}>#</code> line comments — invaluable for explaining flags in Kubernetes manifests and CI configs. Tools that claim “JSON with comments” are extensions (JSONC), not RFC 8259 JSON.
      </p>

      <h2 className={h2}>Types and surprises</h2>
      <p className={prose}>
        YAML 1.1 treats unquoted <code className={code}>yes</code>/<code className={code}>no</code>/<code className={code}>on</code>/<code className={code}>off</code> as booleans in some parsers — a notorious source of Kubernetes bugs when a country code like NO disappeared into a boolean. JSON only has explicit <code className={code}>true</code>/<code className={code}>false</code>.
      </p>
      <p className={prose}>
        YAML also exposes multiple numeric forms (sexagesimal in older specs, plain integers vs floats). JSON numbers are decimal only. For interoperable configs, quote ambiguous scalars in YAML and validate with a schema (JSON Schema / OpenAPI).
      </p>

      <h2 className={h2}>Anchors and aliases — YAML-only power</h2>
      <p className={prose}>
        YAML can deduplicate structures with anchors (<code className={code}>&amp;</code>) and aliases (<code className={code}>*</code>), reducing repetition in large documents. JSON has no equivalent — you duplicate or generate JSON programmatically.
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`defaults: &defaults
  timeout_ms: 3000
  retries: 2

payments:
  <<: *defaults
  path: /pay

refunds:
  <<: *defaults
  path: /refund`}
      </pre>

      <h2 className={h2}>Streams and documents</h2>
      <p className={prose}>
        YAML can concatenate multiple documents in one file separated by <code className={code}>---</code>. JSON is typically one value per file — joining objects requires JSON Lines or wrapping arrays (unless you use extensions).
      </p>

      <h2 className={h2}>JSON inside YAML</h2>
      <p className={prose}>
        Many pipelines embed JSON strings inside YAML for opaque blobs — Kubernetes annotations, CI matrices — because downstream APIs expect JSON. You still validate twice: YAML structure plus inner JSON text.
      </p>

      <h2 className={h2}>When to choose which</h2>
      <ul className={ul}>
        <li><strong>Prefer JSON</strong> for HTTP APIs, browser <code className={code}>fetch</code>, WebSockets, and anywhere unknown parsers must interoperate without ambiguity.</li>
        <li><strong>Prefer YAML</strong> for hand-written infra and app config where humans iterate daily — after linting and schema validation.</li>
        <li><strong>Machine-generated config</strong> often stays JSON end-to-end to avoid YAML’s implicit typing edge cases.</li>
      </ul>

      <h2 className={h2}>Validate before you ship</h2>
      <p className={prose}>
        Paste YAML into a formatter that rejects tabs and fixes indentation, and keep JSON on the narrow path from editor to CI so trailing commas never reach production parsers.
      </p>
    </div>
  );
}

function BrowserCodePlaygroundPrivacy() {
  return (
    <div className="space-y-4">
      <p className={prose}>
        Not every &quot;Run&quot; button means the same thing. Some playgrounds execute entirely in your browser tab; others forward source to a remote compiler farm. The difference matters the moment you paste an API key, a JWT from production, or proprietary business logic.
      </p>

      <h2 className={h2}>Three execution patterns you should recognise</h2>
      <ol className={ol}>
        <li>
          <strong className="text-foreground">Sandboxed JavaScript in an iframe.</strong> User code runs in an isolated browsing context with no direct access to your cookies or DevBench DOM. Console output is bridged back to the parent page. There is still a trust boundary: malicious code could try CPU-heavy loops or annoy you — but it cannot open arbitrary network sockets from classic sandbox rules.
        </li>
        <li>
          <strong className="text-foreground">WebAssembly interpreters (Pyodide).</strong> CPython and wheels are shipped to the client and run locally. First load can be large, but after that your Python source stays in-memory in the tab unless you explicitly fetch data. Stdin can be simulated line-by-line from a text area — useful for teaching and quick scripts.
        </li>
        <li>
          <strong className="text-foreground">Remote compile or run APIs.</strong> Some languages proxy to an official or vendor-hosted service (for example the Go Playground). Your source crosses the network under that provider&apos;s policy. Read their terms before shipping internal code.
        </li>
      </ol>

      <h2 className={h2}>Stdin and &quot;feels like a terminal&quot;</h2>
      <p className={prose}>
        Browser playgrounds cannot give you a real TTY. They approximate stdin with buffered lines or shims around small subsets of Node APIs. That is enough for exercises and many algorithms, but not for interactive ncurses apps or programs that expect binary stdin. When behaviour diverges, run the same snippet locally with your real toolchain.
      </p>

      <h2 className={h2}>Practical rules</h2>
      <ul className={ul}>
        <li>Treat every hosted editor as <strong className="text-foreground">public</strong> unless you have verified end-to-end where bytes go.</li>
        <li>Use browser-first tools for <strong className="text-foreground">shape checks</strong> and learning; use locked-down CI or laptops for secrets.</li>
        <li>Open DevTools → Network once per product so you know which requests fire on Run.</li>
      </ul>

      <p className={prose}>
        DevBench&apos;s{" "}
        <Link href="/playground" className="text-accent hover:underline">
          code playground
        </Link>{" "}
        keeps JS/TS and Pyodide paths in the tab and documents Go&apos;s remote compile path in-page — match the tool to your threat model, then get back to shipping.
      </p>
    </div>
  );
}

function HowToGenerateSecurePasswords() {
  return (
    <div className="space-y-4">
      <p className={prose}>
        Passwords fail for two reasons: they are too short to withstand brute force, or they come from a predictable source. A truly secure password is long, drawn from a large character set, and generated by a cryptographically strong random number generator — not <code className={code}>Math.random()</code>, a human brain, or a pattern like <code className={code}>P@ssword1!</code>.
      </p>

      <h2 className={h2}>What makes a password secure: entropy</h2>
      <p className={prose}>
        Password strength is measured in bits of entropy — the number of equally likely possibilities an attacker must search. A brute-force attacker tries possibilities at a rate determined by their hardware; entropy determines how large the search space is.
      </p>
      <table className={table}>
        <thead>
          <tr>
            <th className={th}>Length</th>
            <th className={th}>Character set</th>
            <th className={th}>Entropy (bits)</th>
            <th className={th}>Verdict</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className={td}>8 chars</td><td className={td}>lowercase only (26)</td><td className={td}>~37.6</td><td className={td}>Crackable in seconds</td></tr>
          <tr><td className={td}>8 chars</td><td className={td}>upper + lower + digits (62)</td><td className={td}>~47.6</td><td className={td}>Hours to days</td></tr>
          <tr><td className={td}>12 chars</td><td className={td}>upper + lower + digits + symbols (94)</td><td className={td}>~78.7</td><td className={td}>Years on current hardware</td></tr>
          <tr><td className={td}>16 chars</td><td className={td}>same 94-char set</td><td className={td}>~105</td><td className={td}>Astronomically large</td></tr>
          <tr><td className={td}>5 words</td><td className={td}>diceware (7776 word list)</td><td className={td}>~64.6</td><td className={td}>Strong and memorable</td></tr>
        </tbody>
      </table>
      <p className={prose}>
        Entropy formula: <code className={code}>bits = length × log₂(charsetSize)</code>. Aim for at least 80 bits for standard accounts; 128 bits or more for critical credentials.
      </p>

      <h2 className={h2}>Why Math.random() is wrong for passwords</h2>
      <p className={prose}>
        JavaScript's <code className={code}>Math.random()</code> is a pseudo-random number generator (PRNG) seeded from a predictable source. An attacker who knows the seed can reproduce your entire output. For password generation you need a <strong>cryptographically secure</strong> PRNG (CSPRNG) backed by the operating system's entropy pool.
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`// ❌ Never use for passwords
const random = Math.random(); // not cryptographically secure

// ✅ Use the Web Crypto API
const array = new Uint32Array(1);
crypto.getRandomValues(array);
const randomValue = array[0];`}
      </pre>

      <h2 className={h2}>Generating a secure password in JavaScript</h2>
      <p className={prose}>
        The Web Crypto API is available in all modern browsers and Node.js 15+. Here is a clean, unbiased implementation:
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`function generatePassword(length = 16, options = {}) {
  const { upper = true, lower = true, digits = true, symbols = true } = options;
  let charset = "";
  if (upper)   charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (lower)   charset += "abcdefghijklmnopqrstuvwxyz";
  if (digits)  charset += "0123456789";
  if (symbols) charset += "!@#$%^&*()-_=+[]{}|;:,.<>?";

  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);

  // Modulo bias fix: rejection sampling
  const max = Math.floor(0xFFFFFFFF / charset.length) * charset.length;
  const chars: string[] = [];
  let i = 0;
  while (chars.length < length) {
    const val = bytes[i % length];
    if (val < max) chars.push(charset[val % charset.length]);
    i++;
    if (i >= length && chars.length < length) {
      crypto.getRandomValues(bytes); i = 0;
    }
  }
  return chars.join("");
}`}
      </pre>
      <p className={prose}>
        The rejection-sampling step avoids modulo bias — a subtle flaw where values near the end of the character set are slightly more likely when the charset size does not evenly divide the random range.
      </p>

      <h2 className={h2}>Generating a secure password in Python</h2>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`import secrets
import string

def generate_password(length=16):
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return "".join(secrets.choice(alphabet) for _ in range(length))

print(generate_password(20))`}
      </pre>
      <p className={prose}>
        Python's <code className={code}>secrets</code> module (added in 3.6) is the correct tool for security-sensitive random generation. <code className={code}>random.choice()</code> is the Python equivalent of <code className={code}>Math.random()</code> — do not use it for credentials.
      </p>

      <h2 className={h2}>On the command line</h2>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`# macOS / Linux — openssl
openssl rand -base64 24

# Linux — /dev/urandom
head -c 32 /dev/urandom | base64

# Cross-platform — pwgen
pwgen -s 20 1`}
      </pre>

      <h2 className={h2}>Passphrases vs random strings</h2>
      <p className={prose}>
        A five-word diceware passphrase like <code className={code}>correct-horse-battery-staple-bridge</code> has ~65 bits of entropy, is more memorable than a random string, and survives dictionary attacks if words are chosen from a large enough wordlist (7776+ words from physical dice rolls, not a guessable pattern). Use passphrases for human-typed credentials; use random strings for API keys and machine credentials.
      </p>

      <h2 className={h2}>Where not to store passwords</h2>
      <ul className={ul}>
        <li><strong>Plain text files or spreadsheets</strong> — if the file leaks, every credential is exposed instantly.</li>
        <li><strong>Environment variables in version control</strong> — <code className={code}>.env</code> files with real secrets should never be committed.</li>
        <li><strong>Sticky notes or browser autofill for shared credentials</strong> — use a team password manager with audit logs.</li>
      </ul>
      <p className={prose}>
        For server-side storage of user passwords, never store plaintext or reversible encryption. Hash with a purpose-built password hashing function: <code className={code}>bcrypt</code>, <code className={code}>scrypt</code>, or <code className={code}>Argon2id</code>.
      </p>
    </div>
  );
}

function Sha256VsMd5() {
  return (
    <div className="space-y-4">
      <p className={prose}>
        MD5 and SHA-1 are dead as security tools — collision attacks exist, and GPU clusters can compute billions of hashes per second. SHA-256 is today's minimum for integrity and digital signatures. But even SHA-256 is the wrong choice when you are hashing passwords. Here is the full picture.
      </p>

      <h2 className={h2}>What a hash function does</h2>
      <p className={prose}>
        A cryptographic hash function takes arbitrary-length input and produces a fixed-length digest. Three properties define a secure hash:
      </p>
      <ul className={ul}>
        <li><strong>Pre-image resistance</strong> — given a digest, you cannot find the original input.</li>
        <li><strong>Second pre-image resistance</strong> — given an input, you cannot find a different input with the same digest.</li>
        <li><strong>Collision resistance</strong> — you cannot find any two inputs that produce the same digest.</li>
      </ul>
      <p className={prose}>
        MD5 fails on collision resistance. SHA-1 is practically broken for collision attacks. SHA-256 passes all three for currently known attacks.
      </p>

      <h2 className={h2}>MD5 — fast and broken</h2>
      <p className={prose}>
        MD5 produces a 128-bit (32 hex character) digest and is extremely fast — around 10 GB/s on modern hardware. That speed is a liability for security applications: an attacker can precompute rainbow tables or brute-force password hashes rapidly.
      </p>
      <p className={prose}>
        The practical verdict: MD5 collisions are trivially producible. Two different files can share the same MD5 hash. A certificate authority was forged using MD5 collision attacks in 2008. <strong>Do not use MD5 for anything security-sensitive.</strong>
      </p>
      <p className={prose}>
        MD5 is still fine for non-security use cases: checksums for detecting accidental corruption (not tampering), cache keys, deduplication identifiers, and content-addressable storage where an adversary cannot craft inputs.
      </p>

      <h2 className={h2}>SHA-256 — the modern baseline</h2>
      <p className={prose}>
        SHA-256 is part of the SHA-2 family. It produces a 256-bit (64 hex character) digest and has no known practical attacks against its collision resistance. It is the hash function used in TLS certificates, code signing, Bitcoin's proof-of-work, and HMAC-SHA256 (used in JWT signing and HMAC authentication headers).
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`// SHA-256 in the browser (Web Crypto API)
async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

const digest = await sha256("hello world");
// → "b94d27b9934d3e08a52e52d7da7dabfac484efe04294e576..."`}
      </pre>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`# Python
import hashlib
digest = hashlib.sha256(b"hello world").hexdigest()
print(digest)`}
      </pre>

      <h2 className={h2}>SHA-512 and SHA-3</h2>
      <p className={prose}>
        SHA-512 doubles the digest size (512 bits / 128 hex chars) and is faster than SHA-256 on 64-bit hardware due to wider native word operations. Use it when you need a larger digest or are operating on 64-bit architectures. SHA-3 (Keccak) uses an entirely different internal construction (sponge function) and is the correct fallback if SHA-2 were ever broken — but SHA-2 breakage is not a realistic near-term threat.
      </p>

      <h2 className={h2}>Comparison table</h2>
      <table className={table}>
        <thead>
          <tr>
            <th className={th}>Algorithm</th>
            <th className={th}>Digest size</th>
            <th className={th}>Collision resistance</th>
            <th className={th}>Speed</th>
            <th className={th}>Use today?</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className={td}>MD5</td><td className={td}>128-bit</td><td className={td}>Broken</td><td className={td}>Very fast</td><td className={td}>Non-security only</td></tr>
          <tr><td className={td}>SHA-1</td><td className={td}>160-bit</td><td className={td}>Broken</td><td className={td}>Fast</td><td className={td}>No</td></tr>
          <tr><td className={td}>SHA-256</td><td className={td}>256-bit</td><td className={td}>Strong</td><td className={td}>Fast</td><td className={td}>Yes — baseline</td></tr>
          <tr><td className={td}>SHA-512</td><td className={td}>512-bit</td><td className={td}>Strong</td><td className={td}>Fast on 64-bit</td><td className={td}>Yes</td></tr>
          <tr><td className={td}>SHA-3-256</td><td className={td}>256-bit</td><td className={td}>Strong</td><td className={td}>Moderate</td><td className={td}>Yes (future-proof)</td></tr>
        </tbody>
      </table>

      <h2 className={h2}>Why you should not hash passwords with SHA-256</h2>
      <p className={prose}>
        General-purpose hash functions are designed to be fast. Password hashing needs to be deliberately slow to resist brute-force attacks. Use a purpose-built password hashing function:
      </p>
      <ul className={ul}>
        <li><strong>bcrypt</strong> — work factor configurable; well-supported across languages; 72-byte input limit.</li>
        <li><strong>scrypt</strong> — memory-hard; harder to parallelize on ASICs.</li>
        <li><strong>Argon2id</strong> — winner of the Password Hashing Competition; recommended by OWASP; tunable memory, time, and parallelism.</li>
      </ul>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`// Node.js — argon2 package
const argon2 = require("argon2");
const hash = await argon2.hash("user_password");
const valid = await argon2.verify(hash, "user_password"); // true`}
      </pre>

      <h2 className={h2}>HMAC — keyed hashing for authentication</h2>
      <p className={prose}>
        If you want to verify that a message came from someone who knows a secret key, use HMAC (Hash-based Message Authentication Code). HMAC-SHA256 is used in AWS Signature V4, JWT HS256, and webhook verification. A plain SHA-256 hash without a key does not authenticate the sender.
      </p>
    </div>
  );
}

function CronExpressionSyntaxGuide() {
  return (
    <div className="space-y-4">
      <p className={prose}>
        Cron is the original Unix job scheduler, and its expression syntax has become a cross-platform standard for describing recurring schedules in CI/CD pipelines, cloud functions, database maintenance windows, and task queues. The syntax is compact but easy to misread — a single character mistake can cause a job to run every minute instead of once a day.
      </p>

      <h2 className={h2}>The five standard fields</h2>
      <p className={prose}>
        A standard cron expression has five space-separated fields:
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`┌─────────────── minute        (0–59)
│ ┌───────────── hour          (0–23)
│ │ ┌─────────── day of month  (1–31)
│ │ │ ┌───────── month         (1–12 or JAN–DEC)
│ │ │ │ ┌─────── day of week   (0–6, 0=Sunday, or SUN–SAT)
│ │ │ │ │
* * * * *`}
      </pre>

      <h2 className={h2}>Field values and special characters</h2>
      <table className={table}>
        <thead>
          <tr>
            <th className={th}>Character</th>
            <th className={th}>Meaning</th>
            <th className={th}>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className={td}><code className={code}>*</code></td><td className={td}>Every value in the field</td><td className={td}><code className={code}>* * * * *</code> — every minute</td></tr>
          <tr><td className={td}><code className={code}>,</code></td><td className={td}>List of values</td><td className={td}><code className={code}>0 9,17 * * *</code> — 9 AM and 5 PM</td></tr>
          <tr><td className={td}><code className={code}>-</code></td><td className={td}>Range of values</td><td className={td}><code className={code}>0 9-17 * * *</code> — every hour 9 AM–5 PM</td></tr>
          <tr><td className={td}><code className={code}>/</code></td><td className={td}>Step / interval</td><td className={td}><code className={code}>*/15 * * * *</code> — every 15 minutes</td></tr>
          <tr><td className={td}><code className={code}>?</code></td><td className={td}>No specific value (day fields only, Quartz/AWS)</td><td className={td}><code className={code}>0 12 15 * ?</code></td></tr>
          <tr><td className={td}><code className={code}>L</code></td><td className={td}>Last day of month or week (Quartz)</td><td className={td}><code className={code}>0 0 L * ?</code> — last day of month</td></tr>
          <tr><td className={td}><code className={code}>W</code></td><td className={td}>Nearest weekday (Quartz)</td><td className={td}><code className={code}>0 9 15W * ?</code></td></tr>
          <tr><td className={td}><code className={code}>#</code></td><td className={td}>Nth weekday of month (Quartz)</td><td className={td}><code className={code}>0 9 ? * 2#1</code> — first Monday</td></tr>
        </tbody>
      </table>

      <h2 className={h2}>Common schedule patterns</h2>
      <table className={table}>
        <thead>
          <tr>
            <th className={th}>Expression</th>
            <th className={th}>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className={td}><code className={code}>* * * * *</code></td><td className={td}>Every minute</td></tr>
          <tr><td className={td}><code className={code}>0 * * * *</code></td><td className={td}>Every hour (on the hour)</td></tr>
          <tr><td className={td}><code className={code}>0 0 * * *</code></td><td className={td}>Daily at midnight</td></tr>
          <tr><td className={td}><code className={code}>0 9 * * 1-5</code></td><td className={td}>Weekdays at 9 AM</td></tr>
          <tr><td className={td}><code className={code}>0 0 * * 0</code></td><td className={td}>Every Sunday at midnight</td></tr>
          <tr><td className={td}><code className={code}>0 0 1 * *</code></td><td className={td}>First day of every month</td></tr>
          <tr><td className={td}><code className={code}>0 0 1 1 *</code></td><td className={td}>Once a year, Jan 1st at midnight</td></tr>
          <tr><td className={td}><code className={code}>*/5 * * * *</code></td><td className={td}>Every 5 minutes</td></tr>
          <tr><td className={td}><code className={code}>30 8,20 * * *</code></td><td className={td}>8:30 AM and 8:30 PM daily</td></tr>
          <tr><td className={td}><code className={code}>0 2 * * 6,0</code></td><td className={td}>Weekends at 2 AM (Sat and Sun)</td></tr>
        </tbody>
      </table>

      <h2 className={h2}>Six-field cron (with seconds)</h2>
      <p className={prose}>
        Some schedulers (Quartz, AWS EventBridge, GitHub Actions) add a sixth field for seconds or year. The order varies by platform:
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`# Quartz (seconds first)
0 0 12 * * ?        → every day at noon

# AWS EventBridge (seconds first, year last)
0 0 12 * * ? *      → every day at noon`}
      </pre>
      <p className={prose}>
        Always check which variant your platform uses — mixing up the field order is a common source of confusion.
      </p>

      <h2 className={h2}>Special strings (vixie cron and systemd)</h2>
      <p className={prose}>
        Many cron implementations support named shortcuts instead of numeric expressions:
      </p>
      <ul className={ul}>
        <li><code className={code}>@yearly</code> / <code className={code}>@annually</code> — equivalent to <code className={code}>0 0 1 1 *</code></li>
        <li><code className={code}>@monthly</code> — equivalent to <code className={code}>0 0 1 * *</code></li>
        <li><code className={code}>@weekly</code> — equivalent to <code className={code}>0 0 * * 0</code></li>
        <li><code className={code}>@daily</code> / <code className={code}>@midnight</code> — equivalent to <code className={code}>0 0 * * *</code></li>
        <li><code className={code}>@hourly</code> — equivalent to <code className={code}>0 * * * *</code></li>
        <li><code className={code}>@reboot</code> — run once at startup (vixie cron only)</li>
      </ul>

      <h2 className={h2}>Platform differences to watch for</h2>
      <ul className={ul}>
        <li><strong>Sunday is 0 or 7</strong> — vixie cron accepts both 0 and 7 as Sunday; some platforms only accept 0.</li>
        <li><strong>Day of month + day of week interaction</strong> — in most cron implementations, if both are non-<code className={code}>*</code>, the job runs when either condition is true (OR logic), not when both are true (AND). Quartz uses <code className={code}>?</code> to say "don't care" for one of them.</li>
        <li><strong>Timezone</strong> — cron traditionally runs in the server's local timezone. Cloud schedulers (AWS, GCP, GitHub Actions) let you specify a timezone explicitly — always do this for production jobs.</li>
        <li><strong>GitHub Actions</strong> — uses UTC and the standard five-field format. Minimum interval is every 5 minutes.</li>
      </ul>

      <h2 className={h2}>Debugging tips</h2>
      <p className={prose}>
        Before deploying a cron expression, run it through a parser that shows the next N execution times. A schedule that looks right in your head often has off-by-one errors in the day-of-week field (0 vs 7 for Sunday) or in step expressions (<code className={code}>*/30</code> in the minute field runs at :00 and :30, not 30 minutes after the last run).
      </p>
    </div>
  );
}

function UnixTimestampsExplained() {
  return (
    <div className="space-y-4">
      <p className={prose}>
        A Unix timestamp is the number of seconds elapsed since the Unix epoch — <strong>1970-01-01T00:00:00Z</strong> (midnight UTC on January 1st, 1970). It is the standard representation of a point in time in operating systems, databases, log files, and APIs. Understanding how timestamps work prevents the most common datetime bugs: timezone confusion, milliseconds vs seconds mismatches, and the 2038 problem.
      </p>

      <h2 className={h2}>The Unix epoch</h2>
      <p className={prose}>
        The epoch is an agreed-upon origin point. Time before it produces negative timestamps (e.g., 1969-12-31 is timestamp <code className={code}>-86400</code>). The number is always expressed in UTC, meaning it has no timezone. Converting to a human-readable date requires knowing what timezone to display — the timestamp itself carries no timezone information.
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`// Current timestamp in JavaScript
const seconds = Math.floor(Date.now() / 1000);  // seconds
const millis  = Date.now();                       // milliseconds

// From timestamp to date
new Date(1_700_000_000 * 1000).toISOString();
// → "2023-11-14T22:13:20.000Z"`}
      </pre>

      <h2 className={h2}>Seconds vs milliseconds</h2>
      <p className={prose}>
        This is the most common source of timestamp bugs. Unix time is canonically in <strong>seconds</strong>, but JavaScript's <code className={code}>Date.now()</code> and many APIs return <strong>milliseconds</strong>. At the time of writing, the current Unix timestamp in seconds is around 1.7 billion; in milliseconds it is 1.7 trillion. If you store a millisecond value where seconds are expected, dates will show up in the year 56,000.
      </p>
      <table className={table}>
        <thead>
          <tr>
            <th className={th}>Language / API</th>
            <th className={th}>Default unit</th>
            <th className={th}>How to get seconds</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className={td}>JavaScript <code className={code}>Date.now()</code></td><td className={td}>Milliseconds</td><td className={td}><code className={code}>Math.floor(Date.now() / 1000)</code></td></tr>
          <tr><td className={td}>Python <code className={code}>time.time()</code></td><td className={td}>Seconds (float)</td><td className={td}><code className={code}>int(time.time())</code></td></tr>
          <tr><td className={td}>Unix shell <code className={code}>date +%s</code></td><td className={td}>Seconds</td><td className={td}>Native</td></tr>
          <tr><td className={td}>PostgreSQL <code className={code}>extract(epoch from now())</code></td><td className={td}>Seconds</td><td className={td}>Native</td></tr>
          <tr><td className={td}>MySQL <code className={code}>UNIX_TIMESTAMP()</code></td><td className={td}>Seconds</td><td className={td}>Native</td></tr>
        </tbody>
      </table>

      <h2 className={h2}>Working with timestamps in JavaScript</h2>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`// Current timestamp (seconds)
const now = Math.floor(Date.now() / 1000);

// Parse a timestamp into a Date
const date = new Date(1_700_000_000 * 1000);
console.log(date.toISOString());    // UTC string
console.log(date.toLocaleString()); // Local timezone string

// Future timestamp (24 hours from now)
const tomorrow = Math.floor(Date.now() / 1000) + 86400;

// Check if a timestamp is expired
function isExpired(ts) {
  return ts < Math.floor(Date.now() / 1000);
}`}
      </pre>

      <h2 className={h2}>Working with timestamps in Python</h2>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`import time
from datetime import datetime, timezone

# Current timestamp
now = int(time.time())

# Parse timestamp to datetime (always UTC-aware)
dt = datetime.fromtimestamp(1_700_000_000, tz=timezone.utc)
print(dt.isoformat())  # 2023-11-14T22:13:20+00:00

# datetime to timestamp
ts = int(dt.timestamp())`}
      </pre>

      <h2 className={h2}>Timezones and timestamps</h2>
      <p className={prose}>
        A Unix timestamp is always UTC — there is no such thing as "a Unix timestamp in Eastern time." Timezone only matters when converting to or from a human-readable string. The two main mistakes:
      </p>
      <ul className={ul}>
        <li><strong>Storing local time as if it were UTC</strong> — a timestamp generated on a machine set to UTC-5 will be off by 5 hours if naively treated as UTC.</li>
        <li><strong>Displaying UTC timestamps without conversion</strong> — users see the wrong hour unless you convert to their local timezone in the UI.</li>
      </ul>
      <p className={prose}>
        Best practice: store and transmit UTC timestamps everywhere. Convert to the user's local timezone only at display time, using the browser's <code className={code}>Intl.DateTimeFormat</code> or a library like <code className={code}>date-fns-tz</code>.
      </p>

      <h2 className={h2}>The Year 2038 problem</h2>
      <p className={prose}>
        On January 19, 2038 at 03:14:07 UTC, 32-bit signed integer Unix timestamps will overflow from <code className={code}>2147483647</code> to <code className={code}>-2147483648</code>, wrapping clocks back to 1901. This affects legacy embedded systems, 32-bit C code, and old database schemas using <code className={code}>INT</code> for timestamps. Modern 64-bit systems can represent dates billions of years into the future. The fix is to use 64-bit integers for timestamps — which all modern languages and databases already do by default.
      </p>
    </div>
  );
}

function HexRgbHslCssColors() {
  return (
    <div className="space-y-4">
      <p className={prose}>
        CSS gives you multiple ways to express the same color — HEX, RGB, RGBA, HSL, HSLA, and newer formats like <code className={code}>oklch</code>. Each format has a job: HEX is what you copy from design tools, RGB maps to hardware, and HSL makes programmatic color manipulation readable. Knowing how they relate saves time when converting between design files, code, and accessibility tools.
      </p>

      <h2 className={h2}>HEX — the design-tool default</h2>
      <p className={prose}>
        Hexadecimal colors encode red, green, and blue channels as two hex digits each, prefixed with <code className={code}>#</code>. The range per channel is <code className={code}>00</code>–<code className={code}>FF</code> (0–255 decimal).
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`#RRGGBB       → 6-digit standard
#RGB          → 3-digit shorthand (each digit doubled: #ABC = #AABBCC)
#RRGGBBAA     → 8-digit with alpha channel (CSS Colors Level 4)
#RGBA         → 4-digit shorthand with alpha

/* Examples */
#ff0000       → red
#00ff00       → green
#0000ff       → blue
#ffffff       → white
#000000       → black
#ff000080     → red at ~50% opacity`}
      </pre>
      <p className={prose}>
        HEX is compact and universally supported but not human-readable — you cannot intuit what <code className={code}>#3a7bd5</code> looks like without a color picker. It is the format Figma, Sketch, and most design tools export by default.
      </p>

      <h2 className={h2}>RGB and RGBA — the hardware model</h2>
      <p className={prose}>
        RGB expresses each channel as a decimal 0–255 (or 0–100% in newer CSS). RGBA adds an alpha channel for opacity as a 0–1 float.
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`rgb(255, 0, 0)          → red
rgb(58, 123, 213)       → a medium blue
rgba(58, 123, 213, 0.5) → same blue at 50% opacity

/* CSS Colors Level 4 — space-separated, optional alpha */
rgb(58 123 213)
rgb(58 123 213 / 50%)`}
      </pre>
      <p className={prose}>
        RGB maps directly to how monitors display color (additive mixing). It is the format used by canvas APIs, WebGL, and image processing code. <code className={code}>rgb(0,0,0)</code> is black; <code className={code}>rgb(255,255,255)</code> is white. Equal values of R, G, B always produce a grey.
      </p>

      <h2 className={h2}>HSL and HSLA — the intuitive model</h2>
      <p className={prose}>
        HSL stands for Hue, Saturation, Lightness. It describes color in terms that match how humans think about it:
      </p>
      <ul className={ul}>
        <li><strong>Hue</strong> — the color angle on a color wheel, 0–360°. 0° = red, 120° = green, 240° = blue.</li>
        <li><strong>Saturation</strong> — 0% is grey; 100% is the full color.</li>
        <li><strong>Lightness</strong> — 0% is black; 50% is the pure color; 100% is white.</li>
      </ul>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`hsl(0, 100%, 50%)       → red
hsl(120, 100%, 50%)     → green
hsl(240, 100%, 50%)     → blue
hsl(240, 100%, 25%)     → dark blue
hsl(240, 100%, 75%)     → light blue
hsl(0, 0%, 50%)         → medium grey

hsla(240, 100%, 50%, 0.3)  → blue at 30% opacity`}
      </pre>
      <p className={prose}>
        HSL shines for programmatic color manipulation. To darken a button on hover, subtract lightness. To create a color palette, vary hue while keeping saturation and lightness constant. To generate accessible text colors, check lightness against the background.
      </p>

      <h2 className={h2}>Conversion formulas</h2>
      <p className={prose}>
        HEX and RGB are the same data in different notation — converting between them is simple arithmetic. HEX <code className={code}>FF</code> = decimal <code className={code}>255</code>. HSL requires trigonometry to convert to/from RGB, but any color picker or CSS library handles this.
      </p>
      <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-3">
{`// HEX → RGB in JavaScript
function hexToRgb(hex) {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

hexToRgb("#3a7bd5") // → { r: 58, g: 123, b: 213 }`}
      </pre>

      <h2 className={h2}>Modern CSS color formats</h2>
      <p className={prose}>
        CSS Colors Level 4 and 5 introduce additional formats now widely supported in modern browsers:
      </p>
      <ul className={ul}>
        <li><code className={code}>oklch(L C H)</code> — perceptual lightness, chroma, hue. Changing hue does not shift perceived brightness, making it ideal for accessible design systems.</li>
        <li><code className={code}>color(display-p3 R G B)</code> — the Display P3 wide-gamut color space used by modern Apple and Samsung displays. Covers more saturated reds and greens than sRGB.</li>
        <li><code className={code}>color-mix(in srgb, red 50%, blue)</code> — mix two colors in CSS without JavaScript.</li>
      </ul>

      <h2 className={h2}>When to use which format</h2>
      <table className={table}>
        <thead>
          <tr>
            <th className={th}>Format</th>
            <th className={th}>Best for</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className={td}><code className={code}>HEX</code></td><td className={td}>Copying from design tools; static design tokens</td></tr>
          <tr><td className={td}><code className={code}>RGB / RGBA</code></td><td className={td}>Canvas, WebGL, image processing, dynamic opacity in JS</td></tr>
          <tr><td className={td}><code className={code}>HSL / HSLA</code></td><td className={td}>Programmatic theming, hover states, color scales in CSS variables</td></tr>
          <tr><td className={td}><code className={code}>oklch</code></td><td className={td}>Design systems needing perceptual uniformity; accessible palettes</td></tr>
          <tr><td className={td}><code className={code}>color(display-p3)</code></td><td className={td}>High-fidelity visuals targeting wide-gamut displays</td></tr>
        </tbody>
      </table>

      <h2 className={h2}>Accessibility: contrast and color</h2>
      <p className={prose}>
        WCAG 2.1 defines contrast ratio requirements: 4.5:1 for normal text (AA), 3:1 for large text (AA), and 7:1 for enhanced contrast (AAA). Contrast ratio is calculated from relative luminance — a function of the linear RGB values. HSL lightness is a shortcut heuristic, not a precise predictor of WCAG contrast. Use a dedicated contrast checker and favor <code className={code}>oklch</code> for color systems where consistent perceived contrast matters.
      </p>
    </div>
  );
}

export const POST_CONTENT: Record<string, React.ReactNode> = {
  "browser-code-playground-privacy": <BrowserCodePlaygroundPrivacy />,
  "how-base64-encoding-works-and-when-not-to-use-it": <Base64EncodingExplained />,
  "jwt-security-best-practices-10-things-developers-get-wrong": <JwtSecurityBestPractices />,
  "yaml-vs-json-key-differences-with-real-examples": <YamlVsJsonExplained />,
  "how-to-validate-json-online": <HowToValidateJsonOnline />,
  "jwt-decoder-without-uploading-to-server": <JwtDecoderWithoutUploading />,
  "uuid-vs-ulid-vs-nanoid": <UuidVsUlidVsNanoid />,
  "jwt-explained": <JwtExplained />,
  "encodeuricomponent-vs-encodeuri": <EncodeUriComponentVsEncodeUri />,
  "common-json-errors": <CommonJsonErrors />,
  "regex-cheat-sheet-javascript": <RegexCheatSheet />,
  "how-to-generate-secure-passwords": <HowToGenerateSecurePasswords />,
  "sha256-vs-md5-hash-functions": <Sha256VsMd5 />,
  "cron-expression-syntax-guide": <CronExpressionSyntaxGuide />,
  "unix-timestamps-explained": <UnixTimestampsExplained />,
  "hex-rgb-hsl-css-colors-explained": <HexRgbHslCssColors />,
};
