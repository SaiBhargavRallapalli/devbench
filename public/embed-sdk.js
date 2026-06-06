/**
 * DevBench Embed SDK v2 — load on any page to control /embed/[slug] iframes.
 * @see https://www.devbench.co.in/docs/EMBED-API.md
 */
(function (root) {
  var SOURCE = "devbench-embed";
  var MAX_INPUT_CHARS = 512 * 1024;

  function post(target, cmd) {
    if (!target || !target.postMessage) return;
    if (cmd.type === "SET_INPUT") {
      if (typeof cmd.input !== "string" || cmd.input.length > MAX_INPUT_CHARS) return;
      if (cmd.input2 !== undefined && (typeof cmd.input2 !== "string" || cmd.input2.length > MAX_INPUT_CHARS)) {
        return;
      }
    }
    target.postMessage(Object.assign({ source: SOURCE }, cmd), "*");
  }

  function createEmbedController(iframe) {
    return {
      setInput: function (input, input2) {
        post(iframe.contentWindow, { type: "SET_INPUT", input: input, input2: input2 });
      },
      run: function () {
        post(iframe.contentWindow, { type: "RUN" });
      },
      clear: function () {
        post(iframe.contentWindow, { type: "CLEAR" });
      },
      getState: function () {
        post(iframe.contentWindow, { type: "GET_STATE" });
      },
      configure: function (config) {
        if (!config || typeof config !== "object") return;
        if (config.theme !== undefined && ["light", "dark", "auto"].indexOf(config.theme) === -1) return;
        if (config.autoRun !== undefined && typeof config.autoRun !== "boolean") return;
        post(iframe.contentWindow, { type: "CONFIGURE", config: config });
      },
      onEvent: function (handler) {
        function fn(ev) {
          var d = ev.data;
          if (!d || d.source !== SOURCE || !d.type) return;
          if (ev.source !== iframe.contentWindow) return;
          handler(d);
        }
        root.addEventListener("message", fn);
        return function () {
          root.removeEventListener("message", fn);
        };
      },
    };
  }

  root.DevBenchEmbed = {
    SOURCE: SOURCE,
    MAX_INPUT_CHARS: MAX_INPUT_CHARS,
    createEmbedController: createEmbedController,
  };
})(typeof window !== "undefined" ? window : globalThis);
