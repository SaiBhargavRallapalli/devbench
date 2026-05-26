// Copyright (c) 2026 DevBench contributors. MIT License.
/** JSON formatter presets — free starter toolkit download. */
export const STARTER_TOOLKIT_FILENAME = "devbench-json-formatter-presets.json";

export const STARTER_TOOLKIT_PRESETS = {
  name: "DevBench JSON Formatter Presets",
  version: 1,
  description:
    "Sample payloads for DevBench JSON formatter — paste into /json or any JSON tool.",
  presets: [
    {
      id: "api-response",
      label: "REST API response",
      json: '{"data":{"id":"usr_42","email":"dev@example.com","roles":["admin","editor"]},"meta":{"page":1,"total":128}}',
    },
    {
      id: "config",
      label: "App config",
      json: '{"env":"production","features":{"darkMode":true,"betaApi":false},"limits":{"ratePerMinute":120}}',
    },
    {
      id: "nested-array",
      label: "Nested array",
      json: '[{"sku":"A-1","qty":2,"tags":["sale"]},{"sku":"B-9","qty":1,"tags":["new","featured"]}]',
    },
    {
      id: "invalid-trailing-comma",
      label: "Repair exercise (trailing comma)",
      json: '{"ok":true,"items":[1,2,3,],}',
    },
  ],
} as const;

export function starterToolkitBlob(): Blob {
  const body = JSON.stringify(STARTER_TOOLKIT_PRESETS, null, 2);
  return new Blob([body], { type: "application/json;charset=utf-8" });
}

export const TOOLKIT_UNLOCK_KEY = "devbench:starter-toolkit-unlocked";

export function isToolkitUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(TOOLKIT_UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

export function unlockToolkit(): void {
  try {
    localStorage.setItem(TOOLKIT_UNLOCK_KEY, "1");
    window.dispatchEvent(new Event("devbench:toolkit-unlocked"));
  } catch {
    /* storage blocked */
  }
}

export function downloadStarterToolkit(): void {
  const url = URL.createObjectURL(starterToolkitBlob());
  const a = document.createElement("a");
  a.href = url;
  a.download = STARTER_TOOLKIT_FILENAME;
  a.click();
  URL.revokeObjectURL(url);
}
