// Copyright (c) 2026 DevBench contributors. MIT License.
import Ajv, { type ErrorObject } from "ajv";

export type SchemaValidationError = {
  path: string;
  message: string;
};

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  validateSchema: false,
});

function formatAjvPath(err: ErrorObject): string {
  const p = err.instancePath || "";
  return p.length === 0 ? "/" : p;
}

function formatAjvMessage(err: ErrorObject): string {
  const parts = [err.message];
  if (err.params && Object.keys(err.params).length > 0) {
    const extra = Object.entries(err.params)
      .filter(([k]) => k !== "errors")
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join(", ");
    if (extra) parts.push(`(${extra})`);
  }
  return parts.filter(Boolean).join(" ");
}

/** Validate JSON data against a JSON Schema (draft-07+) using Ajv. */
export function validateJsonSchema(data: unknown, schema: unknown): SchemaValidationError[] {
  if (typeof schema !== "object" || schema === null) {
    return [{ path: "/", message: "Schema must be a JSON object." }];
  }

  let validate: ReturnType<Ajv["compile"]>;
  try {
    validate = ajv.compile(schema as object);
  } catch (e) {
    return [{ path: "/", message: `Invalid JSON Schema: ${(e as Error).message}` }];
  }

  if (validate(data)) return [];

  return (validate.errors ?? []).map((err) => ({
    path: formatAjvPath(err),
    message: formatAjvMessage(err),
  }));
}
