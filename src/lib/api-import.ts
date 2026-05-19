/**
 * Import HTTP requests from HAR, OpenAPI 3, or cURL — client-side only.
 */

export type ImportedRequest = {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  bodyType: "none" | "json" | "raw";
  label?: string;
};

export type HarRoot = {
  log?: {
    entries?: Array<{
      request?: {
        method?: string;
        url?: string;
        headers?: Array<{ name: string; value: string }>;
        postData?: { mimeType?: string; text?: string };
      };
    }>;
  };
};

export function parseHar(text: string): ImportedRequest[] {
  const har = JSON.parse(text) as HarRoot;
  const entries = har.log?.entries ?? [];
  const out: ImportedRequest[] = [];
  for (const e of entries) {
    const req = e.request;
    if (!req?.url) continue;
    const headers: Record<string, string> = {};
    for (const h of req.headers ?? []) {
      if (h.name.toLowerCase() === "content-length") continue;
      headers[h.name] = h.value;
    }
    const body = req.postData?.text ?? "";
    const mime = req.postData?.mimeType ?? "";
    out.push({
      method: (req.method ?? "GET").toUpperCase(),
      url: req.url,
      headers,
      body,
      bodyType: body ? (mime.includes("json") ? "json" : "raw") : "none",
      label: `${req.method} ${new URL(req.url).pathname}`,
    });
  }
  if (!out.length) throw new Error("No requests found in HAR file");
  return out;
}

export function parseCurlCommand(curl: string): ImportedRequest {
  const args = curl.trim();
  if (!args.toLowerCase().startsWith("curl")) {
    throw new Error("Input must start with curl");
  }

  let url = "";
  const urlMatch = args.match(/curl\s+(?:(?:-[A-Za-z]+\s+\S+\s+)*?)['"]?(https?:\/\/[^\s'"]+)['"]?/i);
  if (urlMatch) url = urlMatch[1];
  else {
    const fallback = args.match(/['"]?(https?:\/\/[^\s'"]+)['"]?/i);
    if (fallback) url = fallback[1];
  }
  if (!url) throw new Error("Could not find URL in cURL command");

  let method = "GET";
  const methodMatch = args.match(/-X\s+(\w+)/i);
  if (methodMatch) method = methodMatch[1].toUpperCase();

  const headers: Record<string, string> = {};
  for (const m of args.matchAll(/-H\s+['"]([^'"]+)['"]/gi)) {
    const [key, ...val] = m[1].split(":");
    headers[key.trim()] = val.join(":").trim();
  }

  let body = "";
  const singleQuoted = args.match(/(?:-d|--data|--data-raw|--data-binary)\s+'([^']*)'/i);
  const doubleQuoted = args.match(
    /(?:-d|--data|--data-raw|--data-binary)\s+"((?:\\.|[^"\\])*)"/i,
  );
  const bare = args.match(/(?:-d|--data|--data-raw)\s+(\S+)/i);
  if (singleQuoted) {
    body = singleQuoted[1];
  } else if (doubleQuoted) {
    body = doubleQuoted[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  } else if (bare) {
    body = bare[1];
  }
  if (body) {
    if (method === "GET") method = "POST";
  }

  const bodyType: ImportedRequest["bodyType"] = !body
    ? "none"
    : body.trim().startsWith("{") || body.trim().startsWith("[")
      ? "json"
      : "raw";

  return { method, url, headers, body, bodyType };
}

type OpenApiSpec = {
  openapi?: string;
  swagger?: string;
  servers?: Array<{ url: string }>;
  host?: string;
  basePath?: string;
  schemes?: string[];
  paths?: Record<
    string,
    Record<string, { summary?: string; operationId?: string; requestBody?: unknown }>
  >;
};

export function parseOpenApi(text: string): ImportedRequest[] {
  const spec = JSON.parse(text) as OpenApiSpec;
  const paths = spec.paths ?? {};
  const base =
    spec.servers?.[0]?.url ??
    (spec.host
      ? `${spec.schemes?.[0] ?? "https"}://${spec.host}${spec.basePath ?? ""}`
      : "");

  const out: ImportedRequest[] = [];
  const methods = ["get", "post", "put", "patch", "delete", "head", "options"] as const;

  for (const [path, ops] of Object.entries(paths)) {
    for (const m of methods) {
      const op = ops[m];
      if (!op) continue;
      const fullUrl = base ? `${base.replace(/\/$/, "")}${path}` : path;
      out.push({
        method: m.toUpperCase(),
        url: fullUrl,
        headers: { "Content-Type": "application/json" },
        body: "{}",
        bodyType: ["post", "put", "patch"].includes(m) ? "json" : "none",
        label: op.summary ?? op.operationId ?? `${m.toUpperCase()} ${path}`,
      });
    }
  }

  if (!out.length) throw new Error("No operations found in OpenAPI spec");
  return out.slice(0, 50);
}

export function parsePostmanCollection(text: string): ImportedRequest[] {
  const col = JSON.parse(text) as {
    item?: Array<{
      name?: string;
      request?: {
        method?: string;
        url?: string | { raw?: string };
        header?: Array<{ key: string; value: string }>;
        body?: { mode?: string; raw?: string };
      };
    }>;
  };
  const out: ImportedRequest[] = [];
  for (const item of col.item ?? []) {
    const req = item.request;
    if (!req) continue;
    const url =
      typeof req.url === "string" ? req.url : req.url?.raw ?? "";
    if (!url) continue;
    const headers: Record<string, string> = {};
    for (const h of req.header ?? []) {
      headers[h.key] = h.value;
    }
    const body = req.body?.raw ?? "";
    out.push({
      method: (req.method ?? "GET").toUpperCase(),
      url,
      headers,
      body,
      bodyType: body ? "json" : "none",
      label: item.name,
    });
  }
  if (!out.length) throw new Error("No requests in Postman collection");
  return out;
}
