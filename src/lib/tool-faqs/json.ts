import type { Faq } from "./_types";

export const faqsJson: Record<string, Faq[]> = {
  "json-formatter": [
    { q: "What is a JSON formatter?", a: "A JSON formatter parses raw JSON text and outputs it with consistent indentation and line breaks, making nested objects and arrays easy to read. It also validates the syntax and reports errors with the exact line and column number." },
    { q: "Why is my JSON invalid?", a: "The most common causes are: trailing commas after the last item in an object or array, single-quoted strings instead of double-quoted, unquoted property keys, or comments (JSON does not support comments). The formatter highlights the exact position of the error." },
    { q: "Can I format minified or compressed JSON?", a: "Yes. Paste any minified JSON — even a single-line blob with no whitespace — and the formatter will expand it into a readable, properly indented structure. You can also go the other way and minify readable JSON to a single line." },
    { q: "Is my JSON data safe to paste here?", a: "Completely. The JSON formatter runs entirely in your browser using JavaScript. No data is sent to any server, stored, or logged. You can verify this by checking the browser Network tab — no requests are made when you format." },
    { q: "What is the difference between pretty-printing and minifying JSON?", a: "Pretty-printing adds whitespace (indentation and newlines) to make the JSON human-readable. Minifying removes all unnecessary whitespace to reduce file size — useful for API responses and production builds where every byte counts." },
  ],

  "json": [
    { q: "What is a JSON formatter?", a: "A JSON formatter takes compact, unindented JSON and adds whitespace, line breaks, and indentation to make it human-readable. It is the opposite of a JSON minifier, which removes all whitespace to reduce file size." },
    { q: "Is my JSON data safe to paste here?", a: "Yes. All processing happens in your browser using JavaScript. Your JSON is never sent to a server, stored, or logged. The DevBench JSON toolkit is 100% client-side." },
    { q: "What is the difference between format and minify?", a: "Format (beautify) adds indentation and newlines — ideal for debugging and reading. Minify removes all whitespace — ideal for production API responses and config files where smaller payload size matters." },
    { q: "What causes \"unexpected token\" errors in JSON?", a: "The most common causes are: trailing commas after the last property or array item, single quotes instead of double quotes, unquoted object keys, JavaScript-style comments (JSON does not support // or /* */), and undefined or NaN values which are not valid JSON." },
  ],

  "json-diff": [
    { q: "How does JSON Diff work?", a: "JSON Diff parses both documents and performs a deep comparison of every key and value. Added keys appear in green, removed keys in red, and changed values show the old and new value side by side. Arrays are compared by index position." },
    { q: "Does the order of keys matter when diffing JSON?", a: "No. JSON objects are unordered by definition, so { a:1, b:2 } and { b:2, a:1 } are considered identical. Array order does matter — [1,2] and [2,1] are different." },
    { q: "Can I diff nested JSON objects?", a: "Yes. The diff is recursive — changes deep inside nested objects and arrays are shown at their exact path. Each change shows the full key path (e.g. user.address.city) so you know exactly where the difference is." },
    { q: "Is my JSON data safe to paste here?", a: "Yes. The diff runs entirely in your browser using JavaScript. No data is sent to any server, stored, or logged. You can confirm this by checking the Network tab in browser DevTools." },
    { q: "Why does my diff show differences when the values look the same?", a: "Common reasons: trailing whitespace in string values, type differences (the string \"1\" vs the number 1), or Unicode normalisation differences (e.g. composed vs decomposed accented characters). The diff treats types strictly — \"true\" (string) differs from true (boolean)." },
  ],

  "json-to-yaml": [
    { q: "What is the difference between JSON and YAML?", a: "JSON (JavaScript Object Notation) uses braces {}, brackets [], quotes for keys, and commas. YAML (YAML Ain't Markup Language) uses indentation, colons, and dashes — it is more human-readable and supports comments, which JSON does not. YAML is a superset of JSON: every valid JSON document is also valid YAML." },
    { q: "Why is YAML used in DevOps tools?", a: "Kubernetes, Docker Compose, GitHub Actions, Ansible, and Helm all use YAML because it is readable without heavy syntax noise (no curly braces everywhere), supports multi-line strings naturally, and allows comments for documentation. These properties make it better for configuration files that humans write and maintain." },
    { q: "Can YAML represent everything JSON can?", a: "Yes, plus more. YAML supports anchors (&) and aliases (*) for reusing values, multi-line strings, and comments. When converting JSON to YAML, nothing is lost — every JSON type (string, number, boolean, null, object, array) has a direct YAML equivalent." },
    { q: "Is my JSON data safe to paste here?", a: "Yes. The JSON to YAML conversion runs entirely in your browser using JavaScript. No data is sent to any server, stored, or logged." },
  ],

  "yaml-to-json": [
    { q: "What is YAML and why convert it to JSON?", a: "YAML is a human-readable data serialisation format used heavily in DevOps tooling (Kubernetes, Docker Compose, GitHub Actions, Ansible). Converting to JSON is useful when you need to process the data with JavaScript, pass it to a JSON-only API, or use jq for querying." },
    { q: "Does YAML support everything JSON does?", a: "Yes, and more. YAML supports comments, anchors & aliases (for reuse), multi-line strings, and additional scalar types. All JSON types map directly to YAML, so conversion is lossless in the JSON → YAML direction. YAML → JSON may strip comments and aliases." },
    { q: "What is a YAML anchor and alias?", a: "An anchor (&name) marks a value for reuse, and an alias (*name) references it. For example: defaults: &defaults timeout: 30 and then service: <<: *defaults. When converting to JSON the alias is expanded to the full value — there are no anchors in JSON." },
    { q: "What does '---' mean in a YAML file?", a: "Three dashes mark the start of a new YAML document within the same file. A file can contain multiple documents separated by ---. When converting to JSON, each document becomes a separate JSON object. The converter shows all documents as an array if more than one is present." },
    { q: "Is my YAML data safe to paste here?", a: "Yes. The conversion runs entirely in your browser. Nothing is sent to a server." },
  ],

  "yaml-formatter": [
    { q: "Why does my YAML fail with 'found a tab character'?", a: "YAML forbids tabs for indentation — only spaces are allowed. This is the most common YAML error. Your editor may have inserted a tab when you pressed the Tab key. The YAML Formatter detects tabs, reports the exact line, and can auto-fix them by replacing tabs with the correct number of spaces." },
    { q: "What causes 'mapping values are not allowed here'?", a: "This error usually means a colon : appears inside a value without being quoted. For example, url: http://example.com needs to be written as url: 'http://example.com' because the colon in the URL confuses the parser." },
    { q: "How do I write a multi-line string in YAML?", a: "Use a block scalar. The pipe | preserves newlines: description: | Line one. Line two. The folded style > folds newlines into spaces. Both are indented under the key." },
    { q: "What is the difference between single and double quotes in YAML?", a: "Single-quoted strings are literal — no escape sequences are processed. Double-quoted strings support escape sequences like \\n, \\t, and Unicode escapes (\\u0041). Use double quotes when you need special characters; use single quotes for strings that contain backslashes you want to be literal." },
    { q: "Can YAML have comments?", a: "Yes. A # character starts a comment and everything after it on that line is ignored. JSON does not support comments, so comments are lost if you convert YAML to JSON." },
  ],

  "json-to-csv": [
    { q: "What JSON structure can be converted to CSV?", a: "CSV represents a flat table, so the converter expects a JSON array of objects where each object has the same keys. Arrays of primitive values and deeply nested structures require flattening first. The converter flattens one level of nesting automatically using dot notation (e.g. user.name becomes a column header)." },
    { q: "What happens if objects in the array have different keys?", a: "Missing keys produce empty cells in that row. Extra keys not present in the first object are added as additional columns. The converter uses the union of all keys across all objects as the column headers." },
    { q: "How do I handle values that contain commas?", a: "The converter automatically wraps any value containing a comma, double quote, or newline in double quotes and escapes internal double quotes by doubling them (\"\"). This produces a valid RFC 4180 CSV that Excel, Google Sheets, and standard parsers handle correctly." },
    { q: "Can I open the output CSV directly in Excel?", a: "Yes. Download the CSV file and open it in Excel. If accented characters appear garbled, save the file as UTF-8 with BOM — the BOM tells Excel to use UTF-8 encoding. In the converter, enable the 'UTF-8 BOM' option before downloading." },
    { q: "Is my JSON data safe to paste here?", a: "Yes. All conversion runs in your browser. No data is sent to any server." },
  ],

  "csv-to-json": [
    { q: "Does the CSV need a header row?", a: "Yes, by default. The first row is used as the property names for each JSON object. If your CSV has no header row, enable 'No header' mode and the converter will use column indices (col0, col1, …) as keys." },
    { q: "What delimiters are supported besides comma?", a: "The converter auto-detects tabs (TSV), semicolons (common in European locales where comma is the decimal separator), and pipes. You can also override the delimiter manually." },
    { q: "How are quoted CSV fields handled?", a: "Fields enclosed in double quotes are unquoted, and doubled double quotes (\"\") inside a quoted field are unescaped to a single double quote. This follows RFC 4180 — the same parsing Excel uses." },
    { q: "Does it infer data types?", a: "Yes. Values that look like integers or floats are converted to JSON numbers, and 'true'/'false' (case-insensitive) become JSON booleans. Empty fields become null. Disable type inference if you want all values as strings." },
    { q: "Is my CSV data safe to paste here?", a: "Yes. All conversion runs in your browser. No data is sent to any server." },
  ],

  "json-to-typescript": [
    { q: "What TypeScript types are generated?", a: "The generator produces interface declarations matching the JSON structure. Strings become string, numbers become number, booleans become boolean, null becomes null, arrays become T[], and nested objects become nested interfaces. Fields that are null in the sample are typed as T | null." },
    { q: "How does the generator handle arrays with mixed types?", a: "If an array contains items of different types (e.g. [1, 'two', true]), the generated type is a union: (number | string | boolean)[]. For arrays with all-identical objects the element type is inferred from the first item." },
    { q: "Are fields marked as optional?", a: "Fields that are null in the sample JSON are generated as optional (?) or as T | null depending on the setting. If a key is missing from some objects in an array, it is also marked optional." },
    { q: "Should I use interface or type for the generated output?", a: "Both work for representing JSON shapes. interface is preferred for objects that may be extended (e.g. by intersection with other interfaces). type alias is preferred for unions and primitive aliases. The generator produces interface by default — you can rename it in your code." },
    { q: "Is my JSON data safe to paste here?", a: "Yes. Generation runs entirely in your browser. Nothing is sent to a server." },
  ],

  "json-to-xml": [
    { q: "How are JSON arrays represented in XML?", a: "Each array element becomes a child element with the same tag name as the array key. For example, {users: ['Alice', 'Bob']} becomes <users>Alice</users><users>Bob</users>. Nested objects inside arrays become elements with child tags." },
    { q: "What should the root element name be?", a: "XML requires a single root element. The converter defaults to <root> but you can change this in the Root Element field. Choose a name that describes your data — for example <response>, <users>, or <config>." },
    { q: "Can JSON null be represented in XML?", a: "XML has no native null type. Null values are represented as empty elements (e.g. <field />) or with an xsi:nil='true' attribute if you are using XML Schema. The converter produces empty elements for null values." },
    { q: "Does JSON to XML support attributes?", a: "Standard JSON does not have a concept of attributes — everything becomes child elements. If you need attribute output, transform your JSON to use a convention like @attribute keys before converting, or post-process the XML." },
    { q: "Is my data safe to paste here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "xml-to-json": [
    { q: "How are XML attributes handled?", a: "XML attributes are captured as properties with an @ prefix — for example, <item id='5'> becomes {item: {'@id': '5'}}. You can customise this behaviour in the options." },
    { q: "What happens with XML namespaces?", a: "Namespace prefixes are preserved as part of the key names (e.g. ns:element becomes 'ns:element'). Namespace declarations (xmlns:...) are included as attributes. Full namespace resolution is not performed." },
    { q: "Can I convert an RSS or Atom feed to JSON?", a: "Yes. RSS and Atom are XML formats. Paste the feed XML and the converter produces a JSON representation of the feed structure, which you can then query with JavaScript or process with jq." },
    { q: "Why do some values become arrays and others strings?", a: "When an XML element appears multiple times at the same level (e.g. multiple <item> tags), the converter makes them a JSON array. When it appears once it becomes a string or object. This is the standard XML-to-JSON convention — to force arrays, enable the 'always use arrays' option." },
    { q: "Is my data safe to paste here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "json-to-tsv": [
    { q: "What is the difference between CSV and TSV?", a: "TSV (Tab-Separated Values) uses tab characters as delimiters instead of commas. It is preferred when your data values often contain commas — with TSV you avoid the quoting complexity that CSV requires for comma-containing fields. Both formats are supported by Excel, Google Sheets, and most data tools." },
    { q: "When should I use TSV over CSV?", a: "Use TSV when your data contains commas (addresses, descriptions, notes), when pasting directly into spreadsheets (paste-as-tab-delimited preserves columns), or when piping to Unix tools like awk, cut, and sort which work naturally with tab-separated data." },
    { q: "Does TSV need quoted fields?", a: "Only if a field contains a tab or newline. Fields with commas do not need quoting in TSV (that is the advantage). The converter quotes and escapes fields that contain tabs or newlines." },
    { q: "Is my data safe to paste here?", a: "Yes. Conversion runs entirely in your browser. Nothing is sent to a server." },
  ],

  "tsv-to-json": [
    { q: "How do I paste TSV from Excel or Google Sheets?", a: "Select the cells in Excel or Google Sheets and copy (Ctrl+C / ⌘+C). When you paste into the TSV input, the tab characters between columns are preserved. The converter will detect them automatically and parse the rows into JSON objects." },
    { q: "What if my data has no header row?", a: "Enable 'No header' mode and the converter will use column indices (col0, col1, …) as JSON keys. You can rename the keys in the output afterwards." },
    { q: "Does it handle quoted fields in TSV?", a: "Yes. Fields containing tabs or newlines will be enclosed in double quotes in the TSV. The converter unquotes them correctly following standard TSV parsing rules." },
    { q: "Is my data safe to paste here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "yaml": [
    { q: "What is YAML and what is it used for?", a: "YAML (YAML Ain't Markup Language) is a human-readable data serialisation format used primarily for configuration files. It is common in Kubernetes manifests, Docker Compose, GitHub Actions workflows, Ansible playbooks, and CI/CD pipelines. Unlike JSON, YAML supports comments, multi-line strings, and anchors for reuse." },
    { q: "Why is my YAML invalid?", a: "The most common YAML errors are: using tabs instead of spaces for indentation (YAML requires spaces only), inconsistent indentation depth, missing quotes around strings containing special characters (: { } [ ] , & * # ? | - < > = ! % @ `), and duplicate keys. The YAML validator reports the exact line and column of the error." },
    { q: "What is the difference between YAML and JSON?", a: "YAML is a superset of JSON — valid JSON is also valid YAML 1.2. Key differences: YAML supports comments (# comment) while JSON does not; YAML uses indentation for structure while JSON uses braces; YAML anchors (&) and aliases (*) allow value reuse; YAML has more data types including timestamps and binary. JSON is safer for machine-to-machine communication; YAML excels in human-edited config files." },
    { q: "How do I convert YAML to JSON?", a: "Paste your YAML into the workspace and switch to the YAML to JSON tab. The converter handles multi-document YAML streams (separated by ---), anchors and aliases, and all standard YAML types. The result is formatted JSON you can copy with one click." },
    { q: "What are YAML anchors and aliases?", a: "Anchors (&name) mark a value so it can be reused; aliases (*name) reference the anchored value. This avoids repetition in config files — define shared defaults once under an anchor and merge them into multiple sections with <<: *anchorName. The YAML formatter preserves anchors and aliases." },
  ],
};
