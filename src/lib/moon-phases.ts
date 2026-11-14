// Copyright (c) 2026 DevBench contributors. MIT License.
//
// Lunar phase mathematics ported from SunCalc
// (https://github.com/mourner/suncalc, MIT License —
// Copyright (c) 2014 Vladimir Agafonkin and contributors).
// Positions use the truncated ELP-2000/82 series of Meeus ch. 47 and the
// illumination model of Meeus ch. 48 — the same geometry timeanddate.com
// and the USNO publish phase instants from, so computed phase times land
// within a minute or two of the official ones (asserted in the tests
// against published November 2026 phases).
//
// Only what the tool needs is ported: geocentric ecliptic longitudes of
// Sun and Moon, elongation-based phase, and a bracketed binary search for
// the next new / first-quarter / full / last-quarter instants. No rise-set,
// refraction or observer geometry is involved in phase timing.

const { PI, sin, cos, tan, asin, atan2: atan, acos, abs, ceil } = Math;
const rad = PI / 180;

const dayMs = 1000 * 60 * 60 * 24;
const J1970 = 2440588;
const J2000 = 2451545;

/** Mean synodic month, days — used only to label the moon's age. */
export const SYNODIC_MONTH_DAYS = 29.530588853;

function toDays(date: Date): number {
  return date.valueOf() / dayMs - 0.5 + J1970 - J2000;
}

// ΔT = TT − UT in seconds (Espenak & Meeus polynomial fits, good ~1900–2150).
// The lunar series are defined in Terrestrial Time, so positions run on
// days-since-J2000 shifted by ΔT. ~75 s today; negligible for phase timing
// but kept for fidelity with the source.
function deltaT(d: number): number {
  const y = 2000 + d / 365.2425;
  let t: number;
  if (y < 1920) { t = y - 1900; return -2.79 + t * (1.494119 + t * (-0.0598939 + t * (0.0061966 - t * 0.000197))); }
  if (y < 1941) { t = y - 1920; return 21.20 + t * (0.84493 + t * (-0.076100 + t * 0.0020936)); }
  if (y < 1961) { t = y - 1950; return 29.07 + t * (0.407 + t * (-1 / 233 + t / 2547)); }
  if (y < 1986) { t = y - 1975; return 45.45 + t * (1.067 + t * (-1 / 260 - t / 718)); }
  if (y < 2005) { t = y - 2000; return 63.86 + t * (0.3345 + t * (-0.060374 + t * (0.0017275 + t * (0.000651814 + t * 0.00002373599)))); }
  if (y < 2050) { t = y - 2000; return 62.92 + t * (0.32217 + t * 0.005589); }
  t = (y - 1820) / 100;
  return -20 + 32 * t * t - 0.5628 * (2150 - y);
}

function toDaysTT(d: number): number {
  return d + deltaT(d) / 86400;
}

// Sun's apparent equatorial coordinates, Meeus ch. 25. d = days since J2000 (TT).
function sunCoords(d: number): { ra: number; dec: number; lon: number } {
  const t = d / 36525;
  const L0 = rad * (280.46646 + t * (36000.76983 + t * 0.0003032)); // 25.2 mean longitude
  const M = rad * (357.52911 + t * (35999.05029 - t * 0.0001537)); // 25.3 mean anomaly
  const sinM = sin(M);
  const cosM = cos(M);
  const C = rad * ((1.914602 - t * (0.004817 + t * 0.000014)) * sinM + // equation of center
    (0.019993 - 0.000101 * t) * 2 * sinM * cosM + 0.000289 * sinM * (3 - 4 * sinM * sinM));
  const Om = rad * (125.04 - 1934.136 * t); // longitude of the ascending node
  const L = L0 + C - rad * (0.00569 + 0.00478 * sin(Om)); // apparent longitude (nutation + aberration)

  return {
    ra: atan(cos(rad * (23.439291 - t * (0.0130042 + t * (0.00000016 - t * 0.000000504)))) * sin(L), cos(L)),
    dec: asin(sin(rad * (23.439291 - t * (0.0130042 + t * (0.00000016 - t * 0.000000504)))) * sin(L)),
    lon: L,
  };
}

// Nutation in longitude (Δψ) and true obliquity, degrees/radians from the
// abridged series of Meeus ch. 22 (sub-arcsecond, ample for phase work).
function nutationObliquity(t: number): { dpsi: number; eps: number } {
  const om = rad * (125.04452 - 1934.136261 * t);
  const ls = rad * (280.4665 + 36000.7698 * t);
  const lm = rad * (218.3165 + 481267.8813 * t);
  const dpsi = (-17.20 * sin(om) - 1.32 * sin(2 * ls) - 0.23 * sin(2 * lm) + 0.21 * sin(2 * om)) / 3600;
  const deps = (9.20 * cos(om) + 0.57 * cos(2 * ls) + 0.10 * cos(2 * lm) - 0.09 * cos(2 * om)) / 3600;
  const eps0 = 23.439291 - t * (0.0130042 + t * (0.00000016 - t * 0.000000504));
  return { dpsi, eps: rad * (eps0 + deps) };
}

// Meeus table 47.A — periodic terms for the Moon's longitude (Σl, ×1e-6 deg)
// and distance (Σr, ×1e-3 km). Flat rows of 6: D, M, M', F, Σl, Σr.
const MOON_LON = [
  0, 0, 1, 0, 6288774, -20905355,
  2, 0, -1, 0, 1274027, -3699111,
  2, 0, 0, 0, 658314, -2955968,
  0, 0, 2, 0, 213618, -569925,
  0, 1, 0, 0, -185116, 48888,
  0, 0, 0, 2, -114332, -3149,
  2, 0, -2, 0, 58793, 246158,
  2, -1, -1, 0, 57066, -152138,
  2, 0, 1, 0, 53322, -170733,
  2, -1, 0, 0, 45758, -204586,
  0, 1, -1, 0, -40923, -129620,
  1, 0, 0, 0, -34720, 108743,
  0, 1, 1, 0, -30383, 104755,
  2, 0, 0, -2, 15327, 10321,
  0, 0, 1, 2, -12528, 0,
  0, 0, 1, -2, 10980, 79661,
  4, 0, -1, 0, 10675, -34782,
  0, 0, 3, 0, 10034, -23210,
  4, 0, -2, 0, 8548, -21636,
  2, 1, -1, 0, -7888, 24208,
  2, 1, 0, 0, -6766, 30824,
  1, 0, -1, 0, -5163, -8379,
  1, 1, 0, 0, 4987, -16675,
  2, -1, 1, 0, 4036, -12831,
  2, 0, 2, 0, 3994, -10445,
  4, 0, 0, 0, 3861, -11650,
  2, 0, -3, 0, 3665, 14403,
  0, 1, -2, 0, -2689, -7003,
  2, 0, -1, 2, -2602, 0,
  2, -1, -2, 0, 2390, 10056,
  1, 0, 1, 0, -2348, 6322,
  2, -2, 0, 0, 2236, -9884,
  0, 1, 2, 0, -2120, 5751,
  0, 2, 0, 0, -2069, 0,
  2, -2, -1, 0, 2048, -4950,
  2, 0, 1, -2, -1773, 4130,
  2, 0, 0, 2, -1595, 0,
  4, -1, -1, 0, 1215, -3958,
  0, 0, 2, 2, -1110, 0,
  3, 0, -1, 0, -892, 3258,
  2, 1, 1, 0, -810, 2616,
  4, -1, -2, 0, 759, -1897,
  0, 2, -1, 0, -713, -2117,
  2, 2, -1, 0, -700, 2354,
  2, 1, -2, 0, 691, 0,
  2, -1, 0, -2, 596, 0,
  4, 0, 1, 0, 549, -1423,
  0, 0, 4, 0, 537, -1117,
  4, -1, 0, 0, 520, -1571,
  1, 0, -2, 0, -487, -1739,
  2, 1, 0, -2, -399, 0,
  0, 0, 2, -2, -381, -4421,
  1, 1, 1, 0, 351, 0,
  3, 0, -2, 0, -340, 0,
  4, 0, -3, 0, 330, 0,
  2, -1, 2, 0, 327, 0,
  0, 2, 1, 0, -323, 1165,
  1, 1, -1, 0, 299, 0,
  2, 0, 3, 0, 294, 0,
  2, 0, -1, -2, 0, 8752,
];

// Meeus table 47.B — periodic terms for the Moon's latitude (Σb, ×1e-6 deg).
// Flat rows of 5: D, M, M', F, Σb.
const MOON_LAT = [
  0, 0, 0, 1, 5128122,
  0, 0, 1, 1, 280602,
  0, 0, 1, -1, 277693,
  2, 0, 0, -1, 173237,
  2, 0, -1, 1, 55413,
  2, 0, -1, -1, 46271,
  2, 0, 0, 1, 32573,
  0, 0, 2, 1, 17198,
  2, 0, 1, -1, 9266,
  0, 0, 2, -1, 8822,
  2, -1, 0, -1, 8216,
  2, 0, -2, -1, 4324,
  2, 0, 1, 1, 4200,
  2, 1, 0, -1, -3359,
  2, -1, -1, 1, 2463,
  2, -1, 0, 1, 2211,
  2, -1, -1, -1, 2065,
  0, 1, -1, -1, -1870,
  4, 0, -1, -1, 1828,
  0, 1, 0, 1, -1794,
  0, 0, 0, 3, -1749,
  0, 1, -1, 1, -1565,
  1, 0, 0, 1, -1491,
  0, 1, 1, 1, -1475,
  0, 1, 1, -1, -1410,
  0, 1, 0, -1, -1344,
  1, 0, 0, -1, -1335,
  0, 0, 3, 1, 1107,
  4, 0, 0, -1, 1021,
  4, 0, -1, 1, 833,
  0, 0, 1, -3, 777,
  4, 0, -2, 1, 671,
  2, 0, 0, -3, 607,
  2, 0, 2, -1, 596,
  2, -1, 1, -1, 491,
  2, 0, -2, 1, -451,
  0, 0, 3, -1, 439,
  2, 0, 2, 1, 422,
  2, 0, -3, -1, 421,
  2, 1, -1, 1, -366,
  2, 1, 0, 1, -351,
  4, 0, 0, 1, 331,
  2, -1, 1, 1, 315,
  2, -2, 0, -1, 302,
  0, 0, 1, 3, -283,
  2, 1, 1, -1, -229,
  1, 1, 0, -1, 223,
  1, 1, 0, 1, 223,
  0, 1, -2, -1, -220,
  2, 1, -1, -1, -220,
  1, 0, 1, 1, -185,
  2, -1, -2, -1, 181,
  0, 1, 2, 1, -177,
  4, 0, -2, -1, 176,
  4, -1, -1, -1, 166,
  1, 0, 1, -1, -164,
  4, 0, 1, -1, 132,
  1, 0, -1, -1, -119,
  4, -1, 0, -1, 115,
  2, -2, 0, 1, 107,
];

// Geocentric apparent coordinates of the Moon, Meeus ch. 47: ecliptic
// longitude/latitude for phase geometry, equatorial for the Sun–Moon
// separation, distance (km) for the illumination angle.
function moonCoords(d: number): { ra: number; dec: number; lon: number; lat: number; dist: number } {
  const t = d / 36525;

  // fundamental arguments (degrees), Meeus 47.1–47.6
  const Lp = 218.3164477 + t * (481267.88123421 + t * (-0.0015786 + t * (1 / 538841 - t / 65194000)));
  const D = 297.8501921 + t * (445267.1114034 + t * (-0.0018819 + t * (1 / 545868 - t / 113065000)));
  const M = 357.5291092 + t * (35999.0502909 + t * (-0.0001536 + t / 24490000));
  const Mp = 134.9633964 + t * (477198.8675055 + t * (0.0087414 + t * (1 / 69699 - t / 14712000)));
  const F = 93.2720950 + t * (483202.0175233 + t * (-0.0036539 + t * (-1 / 3526000 + t / 863310000)));
  const A1 = 119.75 + 131.849 * t;
  const A2 = 53.09 + 479264.290 * t;
  const A3 = 313.45 + 481266.484 * t;
  const E = 1 - t * (0.002516 + t * 0.0000074); // eccentricity factor for solar-anomaly terms

  const Dr = rad * D, Mr = rad * M, Mpr = rad * Mp, Fr = rad * F;
  let sl = 0, sr = 0, sb = 0;
  for (let i = 0; i < MOON_LON.length; i += 6) {
    const m = MOON_LON[i + 1];
    const arg = MOON_LON[i] * Dr + m * Mr + MOON_LON[i + 2] * Mpr + MOON_LON[i + 3] * Fr;
    const f = m === 1 || m === -1 ? E : m === 2 || m === -2 ? E * E : 1;
    sl += MOON_LON[i + 4] * f * sin(arg);
    sr += MOON_LON[i + 5] * f * cos(arg);
  }
  for (let i = 0; i < MOON_LAT.length; i += 5) {
    const m = MOON_LAT[i + 1];
    const arg = MOON_LAT[i] * Dr + m * Mr + MOON_LAT[i + 2] * Mpr + MOON_LAT[i + 3] * Fr;
    const f = m === 1 || m === -1 ? E : m === 2 || m === -2 ? E * E : 1;
    sb += MOON_LAT[i + 4] * f * sin(arg);
  }

  // additive terms (Venus, Jupiter, Earth flattening), Meeus p. 342
  const A1r = rad * A1, Lpr = rad * Lp;
  sl += 3958 * sin(A1r) + 1962 * sin(Lpr - Fr) + 318 * sin(rad * A2);
  sb += -2235 * sin(Lpr) + 382 * sin(rad * A3) + 175 * sin(A1r - Fr) + 175 * sin(A1r + Fr) +
    127 * sin(Lpr - Mpr) - 115 * sin(Lpr + Mpr);

  const { dpsi, eps } = nutationObliquity(t);
  const l = rad * (Lp + sl / 1e6 + dpsi); // apparent ecliptic longitude
  const b = rad * (sb / 1e6);             // ecliptic latitude

  return {
    ra: atan(sin(l) * cos(eps) - tan(b) * sin(eps), cos(l)),  // Meeus 13.3
    dec: asin(sin(b) * cos(eps) + cos(b) * sin(eps) * sin(l)), // Meeus 13.4
    lon: l,
    lat: b,
    dist: 385000.56 + sr / 1000, // geocentric distance in km
  };
}

export interface MoonState {
  /** Phase angle along the lunar month, 0 → 1: 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter. */
  phase: number;
  /** Illuminated fraction of the disc, 0 → 1. */
  fraction: number;
  /** True while the Moon is waxing (new → full). */
  waxing: boolean;
  /** Geocentric distance in km (≈ 356 000 – 406 000). */
  distanceKm: number;
}

/** Sun–Moon elongation in degrees, unwrapped (grows ~12.19°/day, strictly increasing). */
function elongationDeg(ms: number): number {
  const d = toDaysTT(toDays(new Date(ms)));
  return (moonCoords(d).lon - sunCoords(d).lon) / rad;
}

/** Phase state at an instant — Meeus ch. 48 illumination geometry. */
export function moonStateAt(date: Date): MoonState {
  const d = toDaysTT(toDays(date));
  const s = sunCoords(d);
  const m = moonCoords(d);
  const sdist = 149598000; // Earth–Sun distance, km

  // angular separation of Sun and Moon as seen from Earth
  const phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra));
  // phase angle (Sun–Moon–Earth), Meeus 48.2–48.4
  const inc = atan(sdist * sin(phi), m.dist - sdist * cos(phi));

  // elongation in ecliptic longitude defines the named phases (Meeus ch. 49)
  const phase = (((m.lon - s.lon) / (2 * PI)) % 1 + 1) % 1;

  return {
    phase,
    fraction: (1 + cos(inc)) / 2,
    waxing: phase < 0.5,
    distanceKm: m.dist,
  };
}

export type PhaseName =
  | "New Moon"
  | "Waxing Crescent"
  | "First Quarter"
  | "Waxing Gibbous"
  | "Full Moon"
  | "Waning Gibbous"
  | "Last Quarter"
  | "Waning Crescent";

/**
 * The common name for a phase value. The four principal phases get a
 * ±0.0225 window (~±0.66 day) so "Full Moon" covers the day it is
 * listed on, with the crescent/gibbous names between them.
 */
export function phaseName(phase: number): PhaseName {
  const p = ((phase % 1) + 1) % 1;
  if (p < 0.0225 || p >= 0.9775) return "New Moon";
  if (p < 0.2275) return "Waxing Crescent";
  if (p < 0.2725) return "First Quarter";
  if (p < 0.4775) return "Waxing Gibbous";
  if (p < 0.5225) return "Full Moon";
  if (p < 0.7275) return "Waning Gibbous";
  if (p < 0.7725) return "Last Quarter";
  return "Waning Crescent";
}

export interface PhaseEvent {
  name: "New Moon" | "First Quarter" | "Full Moon" | "Last Quarter";
  date: Date;
}

/** Mean elongation rate, degrees/day (445 267.11°/century ÷ 365.2425). */
const MEAN_ELONGATION_RATE = 445267.1114034 / 365.2425;

const EVENT_TARGETS: { tau: number; name: PhaseEvent["name"] }[] = [
  { tau: 0, name: "New Moon" },
  { tau: 0.25, name: "First Quarter" },
  { tau: 0.5, name: "Full Moon" },
  { tau: 0.75, name: "Last Quarter" },
];

/**
 * First instant strictly after `fromMs` at which the unwrapped elongation
 * reaches `targetDeg`. Elongation increases monotonically (~12.19°/day), so
 * a linear estimate + bracket expansion + bisection converges to the true
 * crossing without ever skipping one. Resolution ~50 ms.
 */
function firstCrossingAfter(fromMs: number, targetDeg: number): number {
  const e0 = elongationDeg(fromMs);
  let target = targetDeg + 360 * ceil((e0 - targetDeg) / 360);
  if (target - e0 < 1e-9) target += 360;

  const est = fromMs + ((target - e0) / MEAN_ELONGATION_RATE) * dayMs;
  let lo = est - dayMs;
  let hi = est + dayMs;
  let step = dayMs;
  for (let i = 0; i < 10 && elongationDeg(lo) > target; i++) {
    step *= 2;
    lo = est - step;
  }
  step = dayMs;
  for (let i = 0; i < 10 && elongationDeg(hi) < target; i++) {
    step *= 2;
    hi = est + step;
  }
  while (hi - lo > 1) {
    const mid = lo + (hi - lo) / 2;
    if (elongationDeg(mid) < target) lo = mid;
    else hi = mid;
  }
  return lo + (hi - lo) / 2;
}

/**
 * The next `count` principal phase instants after `from`, in order.
 * Spacing is ~7.4 days (a quarter of the synodic month).
 */
export function nextPhaseEvents(from: Date, count = 4): PhaseEvent[] {
  const out: PhaseEvent[] = [];
  let cursor = from.valueOf();
  for (let i = 0; i < count; i++) {
    let best = Infinity;
    let bestName: PhaseEvent["name"] = "New Moon";
    for (const { tau, name } of EVENT_TARGETS) {
      const crossing = firstCrossingAfter(cursor, tau * 360);
      if (crossing < best) {
        best = crossing;
        bestName = name;
      }
    }
    out.push({ name: bestName, date: new Date(best) });
    // 1 s past the returned instant (which is exact to ~0.5 ms) so the next
    // round's searches start strictly beyond this crossing, never on it
    cursor = best + 1000;
  }
  return out;
}

/**
 * SVG path for the illuminated part of a phase disc.
 *
 * The terminator is an ellipse with semi-minor axis |cos(2πp)|·r along the
 * sun direction: a straight line at quarter phases, the full limb at new
 * and full. The lit half is on the right while waxing (Northern-Hemisphere
 * view) — first arc follows the limb on the lit side, second arc doubles
 * back along the terminator.
 */
export function phaseDiscPath(phase: number, cx: number, cy: number, r: number): string {
  const p = ((phase % 1) + 1) % 1;
  const waxing = p < 0.5;
  const k = cos(2 * PI * p);
  const rx = abs(k) * r;
  // limb: right side when waxing (clockwise on screen), left when waning
  const limbSweep = waxing ? 1 : 0;
  // terminator from bottom back to top: passes +x when |lit| is a crescent
  // on the waxing side, −x when gibbous (mirrored for waning)
  const termSweep = waxing ? (k > 0 ? 0 : 1) : (k > 0 ? 1 : 0);
  return (
    `M ${cx} ${cy - r} ` +
    `A ${r} ${r} 0 0 ${limbSweep} ${cx} ${cy + r} ` +
    `A ${rx.toFixed(3)} ${r} 0 0 ${termSweep} ${cx} ${cy - r} Z`
  );
}

/** Days of moon age for a phase value (≈ phase × synodic month). */
export function moonAgeDays(phase: number): number {
  return (((phase % 1) + 1) % 1) * SYNODIC_MONTH_DAYS;
}
