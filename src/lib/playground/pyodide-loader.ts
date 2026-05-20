import type { PyodideInterface } from "pyodide";
import { PLAYGROUND_PYODIDE_INDEX_URL, PYODIDE_ALLOWED_PACKAGES } from "@/lib/playground/constants";

export type PyodideHandle = PyodideInterface;

let pyodidePromise: Promise<PyodideHandle> | null = null;

/**
 * Patches micropip.install inside the Pyodide interpreter to only allow
 * packages in PYODIDE_ALLOWED_PACKAGES. Called once after first load.
 */
async function applyMicropipGuard(py: PyodideHandle): Promise<void> {
  // Pass the allowlist into Python via globals to avoid any JSON-escaping issues.
  py.globals.set("_devbench_allowed_raw", py.toPy([...PYODIDE_ALLOWED_PACKAGES]));
  await py.runPythonAsync(`
import re as _re

def _norm(name: str) -> str:
    return _re.sub(r"[-_.]+", "-", name.lower())

_devbench_allowed = {_norm(p) for p in _devbench_allowed_raw}
del _devbench_allowed_raw, _re

try:
    import micropip as _mp
    _orig = _mp.install

    async def _guarded(requirements, *args, **kwargs):
        pkgs = [requirements] if isinstance(requirements, str) else list(requirements)
        blocked = [
            p for p in pkgs
            if isinstance(p, str) and _norm(p.split("[")[0]) not in _devbench_allowed
        ]
        if blocked:
            raise ImportError(
                "Package not in DevBench allowlist: " + ", ".join(blocked) + ".\\n"
                "Allowed: " + ", ".join(sorted(_devbench_allowed))
            )
        return await _orig(requirements, *args, **kwargs)

    _mp.install = _guarded
except ImportError:
    pass
`);
}

/** Single shared interpreter; first call downloads WASM (~10–20 MB from jsDelivr). */
export function ensurePyodide(): Promise<PyodideHandle> {
  if (!pyodidePromise) {
    pyodidePromise = import("pyodide")
      .then(({ loadPyodide }) =>
        loadPyodide({
          indexURL: PLAYGROUND_PYODIDE_INDEX_URL,
          fullStdLib: false,
        }),
      )
      .then(async (py) => {
        await applyMicropipGuard(py);
        return py;
      });
  }
  return pyodidePromise;
}
