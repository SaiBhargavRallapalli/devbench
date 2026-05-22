// Copyright (c) 2026 DevBench contributors. MIT License.
/** JSON workspace Web Worker client — format, repair, transforms, and parse. */
export {
  JSON_WORKER_THRESHOLD,
  canUseJsonWorker,
  shouldUseJsonWorker,
  runJsonWorkspaceOp,
  formatJsonInWorker,
} from "@/lib/json-workspace-worker-client";
export type { JsonWorkspaceOpResultWithWorker } from "@/lib/json-workspace-worker-client";
