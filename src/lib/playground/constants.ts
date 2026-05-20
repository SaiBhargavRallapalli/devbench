/** Pin to the installed `monaco-editor` version (see package.json). */
export const PLAYGROUND_MONACO_VERSION = "0.55.1" as const;

/**
 * Packages that may be fetched from PyPI via `micropip.install()` in the
 * Pyodide sandbox. Everything else is blocked at runtime to limit the
 * supply-chain attack surface. Packages already bundled with Pyodide
 * (numpy, pandas, scipy, …) don't need micropip and are always available.
 *
 * Normalization: lowercase, hyphens and underscores are equivalent.
 */
export const PYODIDE_ALLOWED_PACKAGES: ReadonlySet<string> = new Set([
  // Scientific / numeric (micropip fallback for extras)
  "numpy", "pandas", "matplotlib", "scipy", "sympy", "statsmodels",
  "seaborn", "plotly", "bokeh", "networkx",
  // Data formats
  "pyyaml", "toml", "lxml", "beautifulsoup4", "html5lib", "markdown",
  // Validation / typing utilities
  "pydantic", "attrs",
  // Date / time
  "python-dateutil", "pytz", "arrow",
  // Text / output utilities
  "regex", "colorama", "rich", "tqdm", "click",
  // Image processing
  "pillow",
  // Iteration / functional helpers
  "more-itertools", "toolz",
  // HTTP (mostly no-ops in WASM, but harmless for educational snippets)
  "requests", "httpx",
  // Cryptography (educational)
  "cryptography",
]);

export const PLAYGROUND_MONACO_VS_CDN = `https://cdn.jsdelivr.net/npm/monaco-editor@${PLAYGROUND_MONACO_VERSION}/min/vs`;

/** Must match the installed `pyodide` npm version for `checkAPIVersion`. */
export const PLAYGROUND_PYODIDE_VERSION = "0.29.4";

export const PLAYGROUND_PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PLAYGROUND_PYODIDE_VERSION}/full/`;

export const SANDBOX_MESSAGE_SOURCE = "devbench-sandbox" as const;
