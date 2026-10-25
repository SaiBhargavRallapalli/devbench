// Copyright (c) 2026 DevBench contributors. MIT License.
import { getToolBySlug, type Tool } from "@/lib/tools-registry";

/** Hub display order — edit → convert → optimize → metadata */
export const IMAGE_HUB_ORDER = [
  "background-remover",
  "image-resizer",
  "image-resize-units",
  "image-crop",
  "image-rotate",
  "passport-photo",
  "image-merger",
  "image-format-converter",
  "favicon-generator",
  "image-compressor",
  "image-compress-target",
  "image-to-pdf",
  "svg-optimizer",
  "signature-maker",
  "exif-viewer",
  "remove-image-metadata",
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
  "image-resize-units",
  "image-crop",
  "image-rotate",
  "passport-photo",
  "signature-maker",
  "image-merger",
  "color-converter",
  "contrast-checker",
  "color-palette",
]);

const CONVERT_SLUGS = new Set<string>([
  "image-format-converter",
  "image-to-pdf",
  "svg-optimizer",
  "favicon-generator",
  "base64-image",
  "qr-code",
]);

const OPTIMIZE_SLUGS = new Set<string>(["image-compressor", "image-compress-target"]);

const METADATA_SLUGS = new Set<string>(["exif-viewer", "remove-image-metadata"]);

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
