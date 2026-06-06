# DevBench Embed API (v2)

Embed any supported tool at `https://www.devbench.co.in/embed/{slug}` and control it from your page via `postMessage`.

## Quick start

```html
<iframe
  id="devbench-tool"
  src="https://www.devbench.co.in/embed/base64-encode"
  width="100%"
  height="400"
  style="border:0;border-radius:8px"
></iframe>
<script src="https://www.devbench.co.in/embed-sdk.js"></script>
<script>
  const iframe = document.getElementById("devbench-tool");
  const api = DevBenchEmbed.createEmbedController(iframe);
  api.onEvent((evt) => {
    if (evt.type === "READY") console.log("ready", evt.slug);
    if (evt.type === "OUTPUT") console.log(evt.output);
  });
  api.setInput("Hello world");
  api.run();
</script>
```

For same-origin apps, import from `@/lib/embed-api` instead.

## Message protocol

All messages include `{ source: "devbench-embed" }`.

### Parent → iframe (commands)

| type | payload |
|------|---------|
| `SET_INPUT` | `{ input: string, input2?: string }` |
| `RUN` | — |
| `CLEAR` | — |
| `GET_STATE` | — |
| `CONFIGURE` | `{ config: { theme?: "light"\|"dark"\|"auto", autoRun?: boolean } }` |

### iframe → parent (events)

| type | payload |
|------|---------|
| `READY` | `{ slug, name }` |
| `STATE` | `{ input, input2, output, error }` |
| `OUTPUT` | `{ output, error }` |
| `RESIZE` | `{ height: number }` (reserved — not emitted yet) |

## Limits & security

**Payload caps (enforced on the iframe):**

| Field | Max size |
|-------|----------|
| `SET_INPUT.input` / `input2` | 512 KB each |
| `OUTPUT.output` / `STATE.output` echoed to parent | 512 KB (truncated with notice) |
| `OUTPUT.error` / `STATE.error` | 4 KB |

Oversized or malformed commands are **silently ignored**. The SDK (`embed-sdk.js`) also refuses to send inputs above 512 KB.

**Origin checks:**

- **Parent → iframe:** the embed page accepts commands only from `event.source === window.parent`.
- **iframe → parent:** host pages should accept events only where `event.source === iframe.contentWindow` (built into `createEmbedController` / `DevBenchEmbed.createEmbedController`).

**Auto-run:** when `CONFIGURE.autoRun` is `false`, programmatic `SET_INPUT` does not trigger a run; manual edits inside the iframe still debounce-run after 150 ms. `RUN` always executes immediately.

**Embed routes** use `frame-ancestors *` (see `next.config.ts`).
