// Copyright (c) 2026 DevBench contributors. MIT License.
export type { JsonWorkspaceTab } from "@/lib/json-workspace-types";

export type ConvertTarget =
  | "yaml"
  | "csv"
  | "typescript"
  | "env"
  | "base64"
  | "xml"
  | "toml"
  | "urlencoded"
  | "schema"
  | "htmlform"
  | "tableview"
  | "mockdata"
  | "sql"
  | "python"
  | "stringify";

export interface JsonError {
  message: string;
  line: number;
  column: number;
}

export type WizardFilterOp = "==" | "!=" | ">" | "<" | ">=" | "<=" | "contains" | "startsWith";

export interface WizardState {
  filterField: string;
  filterOp: WizardFilterOp;
  filterValue: string;
  sortField: string;
  sortDir: "asc" | "desc";
  pickFields: string[];
  groupByField: string;
  uniq: boolean;
}

export interface ContextMenuState {
  x: number;
  y: number;
  path: (string | number)[];
  value: unknown;
  parentIsArray: boolean;
}

export type DiffLine = { type: "same" | "add" | "remove"; text: string };
