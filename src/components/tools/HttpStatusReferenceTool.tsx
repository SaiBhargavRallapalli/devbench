"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import ToolPageHero from "@/components/tools/ToolPageHero";
import type { Tool } from "@/lib/tools-registry";

interface StatusCode {
  code: number;
  name: string;
  description: string;
  detail: string;
}

const STATUS_CODES: StatusCode[] = [
  // 1xx
  { code: 100, name: "Continue", description: "Request headers received; client should proceed to send the body.", detail: "The server has received the request headers and the client should proceed to send the request body." },
  { code: 101, name: "Switching Protocols", description: "Server is switching protocols as requested by the client.", detail: "Sent in response to an Upgrade request header indicating the protocol the server is switching to." },
  { code: 102, name: "Processing", description: "Server has received and is processing the request, but no response is available yet.", detail: "WebDAV extension. Indicates the server has received and is processing the request but no response is available yet." },
  { code: 103, name: "Early Hints", description: "Used with the Link header to allow the browser to preload resources.", detail: "Primarily used with the Link header to allow the user agent to start preloading resources while the server prepares a response." },
  // 2xx
  { code: 200, name: "OK", description: "Standard success response for GET, POST, PUT, DELETE.", detail: "The request succeeded. The meaning depends on the HTTP method: GET returns resource, POST returns result of action, PUT/PATCH returns updated resource." },
  { code: 201, name: "Created", description: "A new resource was created. Location header points to the new resource.", detail: "The request succeeded and a new resource was created. Typically sent after POST or PUT requests." },
  { code: 202, name: "Accepted", description: "Request accepted for processing but processing is not complete.", detail: "The request has been accepted for processing, but the processing has not been completed. Often used for async operations." },
  { code: 203, name: "Non-Authoritative Information", description: "Response came from a transforming proxy, not the origin server.", detail: "The returned metadata is not exactly the same as is available from the origin server, but is collected from a local or a third-party copy." },
  { code: 204, name: "No Content", description: "Success — no body returned. Common for DELETE and PATCH.", detail: "There is no content to send for this request, but the headers may be useful. The user agent may update its cached headers for this resource." },
  { code: 205, name: "Reset Content", description: "Tells the client to reset the document view.", detail: "Tells the user agent to reset the document which sent this request. Typically used after a form submission." },
  { code: 206, name: "Partial Content", description: "Partial resource returned due to a Range header in the request.", detail: "Used for range requests. The response body contains the requested range of data." },
  { code: 207, name: "Multi-Status", description: "Multiple status codes for multiple operations (WebDAV).", detail: "WebDAV. The response body is an XML message containing multiple separate response codes." },
  { code: 208, name: "Already Reported", description: "Members of a DAV binding already enumerated (WebDAV).", detail: "WebDAV. Used inside a <dav:propstat> to avoid enumerating the internal members of multiple bindings to the same collection repeatedly." },
  { code: 226, name: "IM Used", description: "The server has fulfilled a GET request for a delta-encoded response.", detail: "The server has fulfilled a GET request for the resource, and the response is a representation of the result of one or more instance-manipulations." },
  // 3xx
  { code: 300, name: "Multiple Choices", description: "Multiple options available for the requested resource.", detail: "The request has more than one possible response. The user agent or user should choose one." },
  { code: 301, name: "Moved Permanently", description: "Resource has permanently moved to a new URL. Use 308 for non-GET.", detail: "The URL of the requested resource has been changed permanently. The new URL is given in the response. Method may change to GET." },
  { code: 302, name: "Found", description: "Resource temporarily at a different URL. Method may change to GET.", detail: "Tells the client to look at another URL. The method may change to GET on redirect. Use 307 to preserve the method." },
  { code: 303, name: "See Other", description: "Redirect to a GET request for another resource (e.g. after a POST).", detail: "Directs the client to a different resource via GET. Commonly used after a POST or PUT to redirect to a confirmation page." },
  { code: 304, name: "Not Modified", description: "Resource unchanged since last request — use cached version.", detail: "Used for conditional requests. If the content is unchanged since the last request (via If-None-Match or If-Modified-Since), the body is not returned." },
  { code: 307, name: "Temporary Redirect", description: "Temporary redirect — preserves the HTTP method.", detail: "Tells the client to repeat the request to another URL using the same method. Unlike 302, the method is guaranteed not to change." },
  { code: 308, name: "Permanent Redirect", description: "Permanent redirect — preserves the HTTP method.", detail: "Permanent redirect. Unlike 301, the method is guaranteed not to change. Use this when permanently redirecting non-GET methods." },
  // 4xx
  { code: 400, name: "Bad Request", description: "Server cannot process the request due to invalid syntax.", detail: "The server cannot or will not process the request due to a client error such as malformed request syntax, invalid request message framing, or deceptive request routing." },
  { code: 401, name: "Unauthorized", description: "Authentication required. A WWW-Authenticate header is returned.", detail: "The client must authenticate itself to get the requested response. Similar to 403 Forbidden but specifically for authentication." },
  { code: 402, name: "Payment Required", description: "Reserved for future use (sometimes used for API quota limits).", detail: "Originally intended for digital payment systems, this status code is rarely used but some APIs use it for quota exhaustion." },
  { code: 403, name: "Forbidden", description: "Client authenticated but not authorised to access this resource.", detail: "The client does not have access rights to the content. Unlike 401, the client's identity is known to the server but lacks permission." },
  { code: 404, name: "Not Found", description: "The server cannot find the requested resource.", detail: "The server cannot find the requested resource. Links which lead to a 404 page are often called broken or dead links." },
  { code: 405, name: "Method Not Allowed", description: "HTTP method is not supported for this resource.", detail: "The request method is known by the server but is not supported by the target resource. Must include an Allow header with supported methods." },
  { code: 406, name: "Not Acceptable", description: "No content matching the Accept headers is available.", detail: "The server cannot produce a response matching the list of acceptable values defined in the request's proactive content negotiation headers." },
  { code: 407, name: "Proxy Authentication Required", description: "Must authenticate with the proxy first.", detail: "Similar to 401, but authentication is needed to be done by a proxy." },
  { code: 408, name: "Request Timeout", description: "Server timed out waiting for the request.", detail: "The server would like to shut down this unused connection. Sent when a server wants to shut down an idle connection." },
  { code: 409, name: "Conflict", description: "Request conflicts with the current state of the resource.", detail: "The request conflicts with the current state of the server. Common in REST APIs for version conflicts or duplicate creation attempts." },
  { code: 410, name: "Gone", description: "Resource has been permanently deleted — no forwarding address.", detail: "The requested content has been permanently deleted from server with no forwarding address. Unlike 404, clients should not request this resource again." },
  { code: 411, name: "Length Required", description: "Content-Length header is required but missing.", detail: "Server rejected the request because the Content-Length header field is not defined and the server requires it." },
  { code: 412, name: "Precondition Failed", description: "Conditional headers (If-Match, etc.) evaluated to false.", detail: "The client has indicated preconditions in its headers which the server does not meet. Used in conditional PUT/DELETE requests." },
  { code: 413, name: "Content Too Large", description: "Request body exceeds the server's size limit.", detail: "Request entity is larger than limits defined by server. The server might close the connection or return a Retry-After header." },
  { code: 414, name: "URI Too Long", description: "The URL is longer than the server is willing to interpret.", detail: "The URI requested by the client is longer than the server is willing to interpret. Rare — can happen with miscoded redirect loops or excessive GET params." },
  { code: 415, name: "Unsupported Media Type", description: "Request body format is not supported (wrong Content-Type).", detail: "The media format of the requested data is not supported by the server. The server is refusing to accept the request." },
  { code: 416, name: "Range Not Satisfiable", description: "Requested range cannot be fulfilled.", detail: "The ranges specified by the Range header field cannot be fulfilled. It's possible that the range is outside the size of the target URI's data." },
  { code: 417, name: "Expectation Failed", description: "Server cannot meet the expectations in the Expect header.", detail: "The expectation indicated by the Expect request header field cannot be met by the server." },
  { code: 418, name: "I'm a Teapot", description: "April Fools RFC 2324 — the server refuses to brew coffee.", detail: "The server refuses the attempt to brew coffee with a teapot. This is an April Fools joke RFC and not expected to be implemented by actual servers." },
  { code: 421, name: "Misdirected Request", description: "Request directed at a server unable to produce a response for this combination.", detail: "The request was directed at a server that is not able to produce a response. This can be sent by a server that is not configured to produce responses for the combination of scheme and authority." },
  { code: 422, name: "Unprocessable Content", description: "Well-formed body but semantic errors (common in REST validation).", detail: "The request was well-formed but was unable to be followed due to semantic errors. Common in REST APIs when the payload has invalid field values." },
  { code: 423, name: "Locked", description: "Resource is locked (WebDAV).", detail: "WebDAV. The resource that is being accessed is locked." },
  { code: 424, name: "Failed Dependency", description: "A dependency of this request failed (WebDAV).", detail: "WebDAV. The method could not be performed on the resource because the requested action depended on another action and that action failed." },
  { code: 425, name: "Too Early", description: "Server is unwilling to risk processing an early data request.", detail: "Indicates that the server is unwilling to risk processing a request that might be replayed — sent in response to TLS early data (0-RTT)." },
  { code: 426, name: "Upgrade Required", description: "Client must switch to a different protocol (e.g. TLS).", detail: "The server refuses to perform the request using the current protocol but will be willing to do so after the client upgrades to a different protocol." },
  { code: 428, name: "Precondition Required", description: "Server requires a conditional request (e.g. If-Match).", detail: "The origin server requires the request to be conditional. Intended to prevent the 'lost update' problem." },
  { code: 429, name: "Too Many Requests", description: "Rate limit exceeded — check Retry-After header.", detail: "The user has sent too many requests in a given amount of time (rate limiting). A Retry-After header may indicate how long to wait." },
  { code: 431, name: "Request Header Fields Too Large", description: "Headers are too large for the server to process.", detail: "The server is unwilling to process the request because its header fields are too large. Reduce or clear cookies for this domain." },
  { code: 451, name: "Unavailable For Legal Reasons", description: "Resource unavailable due to a legal demand (e.g. DMCA).", detail: "The user agent requested a resource that cannot legally be provided, such as a web page censored by a government." },
  // 5xx
  { code: 500, name: "Internal Server Error", description: "Generic server error — something went wrong on the server.", detail: "The server has encountered a situation it does not know how to handle. Catch-all for server-side errors without a more specific code." },
  { code: 501, name: "Not Implemented", description: "Server does not support the functionality required for this request.", detail: "The request method is not supported by the server and cannot be handled. Only GET and HEAD are required; others are optional." },
  { code: 502, name: "Bad Gateway", description: "Upstream server returned an invalid response.", detail: "The server, while working as a gateway to get a response needed to handle the request, got an invalid response from the upstream server." },
  { code: 503, name: "Service Unavailable", description: "Server is down or overloaded. Check Retry-After.", detail: "The server is not ready to handle the request. Common causes are a server that is down for maintenance or is overloaded." },
  { code: 504, name: "Gateway Timeout", description: "Upstream server did not respond in time.", detail: "The server is acting as a gateway and cannot get a response in time from the upstream server." },
  { code: 505, name: "HTTP Version Not Supported", description: "The HTTP version used in the request is not supported.", detail: "The HTTP version used in the request is not supported by the server." },
  { code: 506, name: "Variant Also Negotiates", description: "Circular reference in transparent content negotiation.", detail: "The server has an internal configuration error: during content negotiation, the chosen variant is itself configured to engage in content negotiation." },
  { code: 507, name: "Insufficient Storage", description: "Server cannot store the representation to complete the request (WebDAV).", detail: "WebDAV. The method could not be performed on the resource because the server is unable to store the representation needed to complete the request." },
  { code: 508, name: "Loop Detected", description: "Infinite loop detected while processing the request (WebDAV).", detail: "WebDAV. The server detected an infinite loop while processing the request." },
  { code: 510, name: "Not Extended", description: "Further extensions to the request are required.", detail: "Further extensions to the request are required for the server to fulfill it." },
  { code: 511, name: "Network Authentication Required", description: "Client must authenticate to gain network access (captive portal).", detail: "Indicates that the client needs to authenticate to gain network access. Used by captive portals to intercept HTTP connections." },
];

const RANGE_COLORS: Record<number, string> = {
  1: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  2: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  3: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  4: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  5: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

const RANGE_LABELS: Record<number, string> = {
  1: "1xx Informational",
  2: "2xx Success",
  3: "3xx Redirection",
  4: "4xx Client Error",
  5: "5xx Server Error",
};

function range(code: number) {
  return Math.floor(code / 100);
}

export default function HttpStatusReferenceTool({ tool }: { tool: Tool }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return STATUS_CODES;
    return STATUS_CODES.filter(
      (s) =>
        String(s.code).includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    );
  }, [query]);

  const groups = useMemo(() => {
    const map = new Map<number, StatusCode[]>();
    for (const s of filtered) {
      const r = range(s.code);
      map.set(r, [...(map.get(r) ?? []), s]);
    }
    return map;
  }, [filtered]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ToolPageHero tool={tool} />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setExpanded(null); }}
            placeholder="Search by code, name, or description…"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 text-sm shadow-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-center py-16 text-muted-foreground">No codes match &ldquo;{query}&rdquo;</p>
        ) : (
          <div className="space-y-10">
            {[1, 2, 3, 4, 5].map((r) => {
              const codes = groups.get(r);
              if (!codes) return null;
              const color = RANGE_COLORS[r];
              return (
                <section key={r}>
                  <h2 className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-full border mb-4 ${color}`}>
                    {RANGE_LABELS[r]}
                  </h2>
                  <div className="space-y-2">
                    {codes.map((s) => (
                      <div
                        key={s.code}
                        className="rounded-xl border border-border bg-card overflow-hidden"
                      >
                        <button
                          onClick={() => setExpanded(expanded === s.code ? null : s.code)}
                          className="w-full flex items-start gap-4 px-4 py-3.5 text-left hover:bg-muted/50 transition-colors"
                        >
                          <span className={`shrink-0 w-12 text-center text-sm font-bold font-mono px-2 py-0.5 rounded-lg border ${color}`}>
                            {s.code}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{s.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                          </div>
                          <span className="text-muted-foreground text-xs mt-0.5 shrink-0">
                            {expanded === s.code ? "▲" : "▼"}
                          </span>
                        </button>
                        {expanded === s.code && (
                          <div className="px-4 pb-4 pt-1 border-t border-border bg-muted/30">
                            <p className="text-sm text-foreground/80 leading-relaxed">{s.detail}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
