"use client";

import { useState } from "react";
import { ImageIcon, MapPin } from "lucide-react";
import ToolPageHero from "@/components/tools/ToolPageHero";
import type { Tool } from "@/lib/tools-registry";

interface ExifEntry {
  key: string;
  value: string;
}

interface ExifGroup {
  name: string;
  entries: ExifEntry[];
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "number") return Number.isFinite(val) ? String(val) : "—";
  if (val instanceof Date) return val.toLocaleString();
  if (Array.isArray(val)) {
    if (val.length === 2 && typeof val[0] === "number") {
      // Lat/lon fraction arrays
      return val.map((v) => (typeof v === "number" ? v.toFixed(6) : String(v))).join(", ");
    }
    return val.join(", ");
  }
  return String(val);
}

// Curated field maps for display
const CAMERA_FIELDS = [
  "Make", "Model", "Software", "LensModel", "LensMake",
  "FocalLength", "FocalLengthIn35mmFormat", "MaxApertureValue",
];
const SETTINGS_FIELDS = [
  "ExposureTime", "FNumber", "ISO", "ISOSpeedRatings",
  "ShutterSpeedValue", "ApertureValue", "ExposureCompensation",
  "ExposureMode", "ExposureProgram", "MeteringMode",
  "Flash", "WhiteBalance", "SceneCaptureType", "Contrast",
  "Saturation", "Sharpness",
];
const TIME_FIELDS = [
  "DateTime", "DateTimeOriginal", "DateTimeDigitized",
  "GPSDateStamp", "GPSTimeStamp",
];
const IMAGE_FIELDS = [
  "ImageWidth", "ImageHeight", "PixelXDimension", "PixelYDimension",
  "Orientation", "XResolution", "YResolution", "ResolutionUnit",
  "ColorSpace", "BitsPerSample", "Compression",
];
const GPS_FIELDS = [
  "GPSLatitude", "GPSLongitude", "GPSLatitudeRef", "GPSLongitudeRef",
  "GPSAltitude", "GPSAltitudeRef", "GPSSpeed", "GPSSpeedRef",
  "GPSImgDirection", "GPSImgDirectionRef",
];
const OTHER_FIELDS = [
  "Artist", "Copyright", "ImageDescription", "UserComment",
  "OwnerName", "SerialNumber", "LensSerialNumber",
];

function extractGroup(data: Record<string, unknown>, fields: string[], name: string): ExifGroup | null {
  const entries = fields
    .filter((k) => data[k] !== undefined && data[k] !== null)
    .map((k) => ({ key: k, value: formatValue(data[k]) }));
  if (entries.length === 0) return null;
  return { name, entries };
}

export default function ExifViewerTool({ tool }: { tool: Tool }) {
  const [imgSrc, setImgSrc]   = useState<string | null>(null);
  const [groups, setGroups]   = useState<ExifGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [noExif, setNoExif]   = useState(false);
  const [gpsUrl, setGpsUrl]   = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setLoading(true);
    setError(null);
    setNoExif(false);
    setGroups([]);
    setGpsUrl(null);

    const preview = URL.createObjectURL(file);
    setImgSrc(preview);

    try {
      // Dynamically import exifr to keep it out of the initial bundle
      const exifr = (await import("exifr")).default;
      const data: Record<string, unknown> | null = await exifr.parse(file, {
        tiff: true, exif: true, gps: true, iptc: false, xmp: false, icc: false,
        mergeOutput: true,
      });

      if (!data || Object.keys(data).length === 0) {
        setNoExif(true);
        setLoading(false);
        return;
      }

      const all = data as Record<string, unknown>;

      // Build GPS Maps link if available
      if (all.GPSLatitude && all.GPSLongitude) {
        const lat = all.GPSLatitude as number;
        const lon = all.GPSLongitude as number;
        const latRef = (all.GPSLatitudeRef as string ?? "N") === "S" ? -1 : 1;
        const lonRef = (all.GPSLongitudeRef as string ?? "E") === "W" ? -1 : 1;
        const latD = Array.isArray(lat)
          ? (lat[0] + lat[1] / 60 + lat[2] / 3600) * latRef
          : (lat as number) * latRef;
        const lonD = Array.isArray(lon)
          ? (lon[0] + lon[1] / 60 + lon[2] / 3600) * lonRef
          : (lon as number) * lonRef;
        setGpsUrl(`https://www.google.com/maps?q=${latD.toFixed(6)},${lonD.toFixed(6)}`);
      }

      const built = [
        extractGroup(all, CAMERA_FIELDS,   "Camera"),
        extractGroup(all, SETTINGS_FIELDS, "Settings"),
        extractGroup(all, TIME_FIELDS,     "Timestamps"),
        extractGroup(all, IMAGE_FIELDS,    "Image"),
        extractGroup(all, GPS_FIELDS,      "GPS"),
        extractGroup(all, OTHER_FIELDS,    "Other"),
      ].filter((g): g is ExifGroup => g !== null);

      // Catch any remaining fields not in any group
      const known = new Set([
        ...CAMERA_FIELDS, ...SETTINGS_FIELDS, ...TIME_FIELDS,
        ...IMAGE_FIELDS, ...GPS_FIELDS, ...OTHER_FIELDS,
      ]);
      const extra: ExifEntry[] = Object.keys(all)
        .filter((k) => !known.has(k))
        .slice(0, 30)
        .map((k) => ({ key: k, value: formatValue(all[k]) }));
      if (extra.length > 0) built.push({ name: "Additional", entries: extra });

      setGroups(built);
    } catch {
      setError("Could not read EXIF data from this file. The image may not contain embedded metadata.");
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ToolPageHero tool={tool} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">

          {/* Left: upload + preview */}
          <div className="space-y-4">
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-accent/50 hover:bg-muted/30 transition-colors">
                {imgSrc ? (
                  <img src={imgSrc} alt="Preview" className="max-h-52 mx-auto rounded-xl object-contain" />
                ) : (
                  <>
                    <ImageIcon className="mx-auto w-9 h-9 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium">Drop or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">JPEG · TIFF · HEIC · PNG</p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </label>

            {gpsUrl && (
              <a
                href={gpsUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm hover:bg-muted transition-colors"
              >
                <MapPin className="w-4 h-4 text-accent" />
                View on Google Maps
              </a>
            )}
          </div>

          {/* Right: EXIF data */}
          <div>
            {loading && (
              <div className="text-center py-20 text-muted-foreground">Reading metadata…</div>
            )}
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {noExif && (
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                No EXIF metadata found in this image.
                <p className="mt-1 text-xs">PNGs and screen-captures typically don&apos;t contain EXIF data.</p>
              </div>
            )}
            {!loading && !error && !noExif && groups.length === 0 && !imgSrc && (
              <div className="text-center py-20 text-muted-foreground text-sm">
                Upload a JPEG or TIFF photo to see its embedded metadata.
              </div>
            )}
            {groups.length > 0 && (
              <div className="space-y-6">
                {groups.map((group) => (
                  <section key={group.name}>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {group.name}
                    </h2>
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                      {group.entries.map((entry, i) => (
                        <div
                          key={entry.key}
                          className={`flex gap-4 px-4 py-2.5 text-xs ${i % 2 === 0 ? "" : "bg-muted/30"}`}
                        >
                          <span className="shrink-0 w-44 text-muted-foreground font-medium">{entry.key}</span>
                          <span className="font-mono text-foreground break-all">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
