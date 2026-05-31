// Copyright (c) 2026 DevBench contributors. MIT License.
import { getToolBySlug, type Tool } from "@/lib/tools-registry";

/** Hub display order — edit → convert → optimize → metadata */
export const IMAGE_HUB_ORDER = [
  "background-remover",
  "image-resizer",
  "image-merger",
  "image-format-converter",
  "image-compressor",
  "image-to-pdf",
  "svg-optimizer",
  "exif-viewer",
  "base64-image",
  "color-palette",
  "contrast-checker",
  "color-converter",
  "qr-code",
] as const;

export type ImageHubFilter =
  | "all"
  | "edit"
  | "convert"
  | "optimize"
  | "metadata";

const EDIT_SLUGS = new Set<string>([
  "background-remover",
  "image-resizer",
  "image-merger",
  "color-converter",
  "contrast-checker",
  "color-palette",
]);

const CONVERT_SLUGS = new Set<string>([
  "image-format-converter",
  "image-to-pdf",
  "svg-optimizer",
  "base64-image",
  "qr-code",
]);

const OPTIMIZE_SLUGS = new Set<string>(["image-compressor"]);

const METADATA_SLUGS = new Set<string>(["exif-viewer"]);

export function getImageHubTools(): Tool[] {
  return IMAGE_HUB_ORDER.map((slug) => getToolBySlug(slug)).filter(
    (t): t is Tool => Boolean(t),
  );
}

export function imageHubFilterForSlug(
  slug: string,
): Exclude<ImageHubFilter, "all"> | null {
  if (EDIT_SLUGS.has(slug)) return "edit";
  if (CONVERT_SLUGS.has(slug)) return "convert";
  if (OPTIMIZE_SLUGS.has(slug)) return "optimize";
  if (METADATA_SLUGS.has(slug)) return "metadata";
  return null;
}
