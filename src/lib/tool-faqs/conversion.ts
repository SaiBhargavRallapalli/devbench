import type { Faq } from "./_types";

export const faqsConversion: Record<string, Faq[]> = {
  "number-to-words": [
    { q: "How do I convert a number to words in English?", a: "Paste or type any number into the input field and the English word form appears instantly — for example, 1234567 becomes 'one million two hundred thirty-four thousand five hundred sixty-seven'. The converter handles integers up to the quadrillions and can also handle decimal fractions." },
    { q: "How does the Indian numbering system (lakh/crore) work?", a: "In the Indian numbering system, 100,000 is written as 1 lakh (1,00,000) and 10,000,000 is written as 1 crore (1,00,00,000). Numbers are grouped differently from the international system: after the first three digits, groupings are in pairs of two — so 12,34,567 reads as 'twelve lakh thirty-four thousand five hundred sixty-seven'. Enable Indian mode in the converter for this output." },
    { q: "Can I convert numbers to words for cheques or bank drafts?", a: "Yes. Enable currency mode to get the format used on cheques: 'Rupees One Million Two Hundred Thirty-Four Thousand Five Hundred Sixty-Seven Only' (or the equivalent in Indian lakh/crore notation). This is the standard format accepted by banks in India and internationally." },
    { q: "What is the difference between cardinal and ordinal numbers?", a: "Cardinal numbers count quantity: one, two, three. Ordinal numbers indicate position: first, second, third. The converter supports both — toggle to ordinal mode to get 'first', 'second', 'twenty-first', etc. Ordinals are used for rankings, dates, and lists." },
    { q: "What is the largest number this converter handles?", a: "The converter handles numbers up to the quadrillions (10^15). For scientific or engineering purposes requiring larger numbers, you may need a dedicated arbitrary-precision library. Numbers with decimal parts are supported — 3.14 converts to 'three point one four'." },
  ],

  "temperature-converter": [
    { q: "What is the formula for Celsius to Fahrenheit?", a: "°F = (°C × 9/5) + 32. Examples: 0°C = 32°F (water freezes), 20°C = 68°F (room temperature), 35°C = 95°F, 37°C = 98.6°F (body temp), 100°C = 212°F (water boils). Reverse: °C = (°F − 32) × 5/9. Quick mental trick: double the °C and add 30 for an approximation." },
    { q: "What is 35 degrees Celsius in Fahrenheit?", a: "35°C = (35 × 9/5) + 32 = 63 + 32 = 95°F. Similarly: 36°C = 96.8°F, 37°C = 98.6°F, 38°C = 100.4°F, 40°C = 104°F. The calculator converts any value instantly — just type in the Celsius field." },
    { q: "What is Kelvin and when is it used?", a: "Kelvin (K) is the absolute temperature scale used in physics and chemistry. 0 K is absolute zero (−273.15°C) — the coldest possible temperature. Water freezes at 273.15 K and boils at 373.15 K. Kelvin is used in thermodynamics, gas laws, blackbody radiation, and the colour temperature of light sources (e.g. 6500 K = daylight)." },
    { q: "What is normal human body temperature in Celsius and Fahrenheit?", a: "The traditional value is 37°C (98.6°F), but research shows the average adult temperature is closer to 36.4°C (97.5°F) and varies by person, age, and time of day. A temperature above 38°C (100.4°F) is generally considered a fever." },
    { q: "What are common temperature reference points?", a: "Absolute zero: −273.15°C / −459.67°F / 0 K. Water freezes: 0°C / 32°F / 273.15 K. Room temperature: ~20°C / 68°F. Body temperature: 37°C / 98.6°F. Water boils: 100°C / 212°F. Oven (moderate): ~180°C / 356°F. The converter includes a reference table for these common values." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "byte-converter": [
    { q: "What is the difference between KB and KiB?", a: "1 KB (kilobyte, SI standard) = 1000 bytes. 1 KiB (kibibyte, IEC standard) = 1024 bytes. Hard drive manufacturers use SI (so a '1 TB' drive has 1,000,000,000,000 bytes). Operating systems traditionally use binary prefixes (so Windows shows it as ~931 GiB). This discrepancy is the source of the apparent 'missing' space on drives." },
    { q: "How much is 1 gigabyte?", a: "1 GB (SI) = 1,000,000,000 bytes (10^9). 1 GiB (binary) = 1,073,741,824 bytes (2^30). For networking (ISP speeds) SI is used. For RAM and operating system file sizes, binary prefixes are standard. Always check which convention is being used when comparing storage or network capacities." },
    { q: "What is the largest common unit?", a: "The converter goes up to petabytes (PB, 10^15 bytes) and pebibytes (PiB, 2^50 bytes). Above that are exabytes, zettabytes, and yottabytes — relevant for global internet traffic and data centre storage at scale." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "unit-converter": [
    { q: "What unit categories are supported?", a: "Length (millimetres to miles), weight/mass (milligrams to tonnes and imperial pounds), area (square millimetres to square miles and acres), volume (millilitres to cubic metres and gallons), and speed (metres per second to miles per hour)." },
    { q: "What is the difference between mass and weight?", a: "Mass is the amount of matter in an object (measured in kg, grams, pounds) and does not change with gravity. Weight is the force exerted by gravity on that mass (measured in Newtons). In everyday usage, 'weight' usually means mass — the converter uses mass units (kg, lb)." },
    { q: "How many teaspoons are in a tablespoon?", a: "3 teaspoons = 1 tablespoon (US). 1 US tablespoon = 14.787 ml. 1 UK tablespoon = 15 ml. The unit converter covers cooking volumes — switch to the volume category and look for teaspoon/tablespoon." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "roman-numerals": [
    { q: "What are the basic Roman numeral symbols?", a: "I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000. Subtractive notation: IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900. Only six subtractive combinations are valid — all others are additive (e.g. VIII = 8)." },
    { q: "What is the largest number representable in standard Roman numerals?", a: "3999 (MMMCMXCIX). Standard Roman numerals cannot represent zero or numbers above 3999 without using a bar over a numeral (vinculum) to multiply by 1000, which is non-standard in most modern use." },
    { q: "Where are Roman numerals still used today?", a: "Clock faces, movie copyright years (e.g. MMXXIV), Super Bowl numbering (Super Bowl LVIII), chapter and page numbering in books, names of monarchs and popes (King Charles III), academic outlines, and film/TV sequel numbering (Rocky IV)." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "percentage-calc": [
    { q: "How do I calculate a 20% discount on a price?", a: "Discounted price = original × (1 − 0.20) = original × 0.80. For example, 20% off ₹500 = ₹500 × 0.80 = ₹400. The savings amount = original × 0.20 = ₹100. Use the 'X% of Y' mode in the calculator." },
    { q: "How do I calculate percentage change?", a: "Percentage change = ((New − Old) / Old) × 100. If sales went from 80 to 92: ((92 − 80) / 80) × 100 = +15%. A negative result is a percentage decrease. Use the '% change from A to B' mode." },
    { q: "What is the difference between percentage points and percent?", a: "Percentage points are absolute differences: if interest rates rise from 2% to 5%, that is a 3 percentage-point increase. Percent change is relative: 2% to 5% is a 150% increase (3 / 2 × 100). The distinction matters greatly in finance and statistics reporting." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "aspect-ratio": [
    { q: "What does '16:9' mean?", a: "16:9 means for every 16 units of width, there are 9 units of height. This is the standard widescreen aspect ratio used for HDTV (1920×1080, 2560×1440, 3840×2160 — all 16:9). The ratio can be any consistent unit — pixels, centimetres, or inches." },
    { q: "How do I maintain aspect ratio when resizing an image?", a: "Use the calculator: enter the original width and height, then enter the new width — the calculator computes the height that preserves the original ratio. For CSS: use aspect-ratio: 16/9 on the element, or padding-bottom trick for older browsers." },
    { q: "What are common social media aspect ratios?", a: "Instagram feed: 1:1 (square) or 4:5 portrait. Instagram Stories / Reels: 9:16 vertical. YouTube thumbnails: 16:9. Twitter/X card images: 2:1. LinkedIn banner: ~4:1. Facebook cover: ~2.7:1. Enter the pixel dimensions of any platform into the calculator to find its exact ratio." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "currency-converter": [
    { q: "Where do the exchange rates come from?", a: "Rates are sourced from the European Central Bank (ECB) reference rates, which are published daily on business days. They are indicative mid-market rates and not the rates you will get at a bank or currency exchange (which include a spread)." },
    { q: "How often are the rates updated?", a: "ECB rates are updated once per business day, typically around 16:00 CET. The converter fetches the latest available rates when you load the page. Rates are not real-time tick-by-tick quotes." },
    { q: "Why is the rate different from what my bank shows?", a: "Banks and currency exchanges add a margin (spread) on top of the mid-market rate — typically 1–5% for consumer transactions. The mid-market rate (what this tool shows) is the midpoint between buy and sell rates." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],
};
