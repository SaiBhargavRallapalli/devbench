import type { Faq } from "./_types";

export const faqsDatetime: Record<string, Faq[]> = {
  "epoch": [
    { q: "What is a Unix epoch timestamp?", a: "A Unix epoch timestamp is the number of seconds (or milliseconds) elapsed since 00:00:00 UTC on 1 January 1970 — known as the Unix epoch. It is the standard time representation in most programming languages, databases, and APIs because it is timezone-independent, compact, and easy to compare and calculate with." },
    { q: "How do I convert a Unix timestamp to a human-readable date?", a: "Paste the timestamp into the converter and the date and time appear instantly. In JavaScript: new Date(timestamp * 1000).toISOString() for seconds, or new Date(timestamp).toISOString() for milliseconds. In Python: datetime.utcfromtimestamp(ts). In shell: date -d @timestamp (Linux) or date -r timestamp (macOS)." },
    { q: "How do I tell if a timestamp is in seconds or milliseconds?", a: "A 10-digit number is almost certainly seconds (e.g. 1715000000 = May 2024). A 13-digit number is milliseconds (e.g. 1715000000000). The converter auto-detects the precision based on the digit count." },
    { q: "What is the Year 2038 problem?", a: "Systems that store Unix timestamps as a signed 32-bit integer overflow on 19 January 2038 at 03:14:07 UTC. The maximum value of a signed 32-bit integer (2,147,483,647) corresponds to that moment. Modern 64-bit systems are not affected — they can represent times hundreds of billions of years into the future." },
    { q: "What is the current Unix timestamp?", a: "The live clock at the top of the Epoch Converter page shows the current Unix timestamp in seconds and milliseconds, updated every second. In JavaScript: Math.floor(Date.now() / 1000) for seconds, or Date.now() for milliseconds. In Python: import time; int(time.time())." },
  ],

  "cron-editor": [
    { q: "What is a cron expression?", a: "A cron expression is a five-field string that defines a recurring schedule for automated tasks. The fields, left to right, represent: minute (0–59), hour (0–23), day of month (1–31), month (1–12), and day of week (0–7, where 0 and 7 are Sunday). A star (*) means 'every value'. For example, '0 9 * * 1' means every Monday at 09:00." },
    { q: "What do the special characters in a cron expression mean?", a: "* means 'every'. / means step: */5 in the minute field means every 5 minutes. - defines a range: 1-5 in day-of-week means Monday through Friday. , separates a list: 1,3,5 means Monday, Wednesday, Friday. ? is used in some implementations to mean 'no specific value' — the DevBench editor uses * for this purpose." },
    { q: "How do I run a cron job every 5 minutes?", a: "Use */5 * * * * — this means 'at minute 0, 5, 10, 15 … of every hour, every day'. Enter it in the Cron Editor and the plain-English description and next 10 run times will confirm it." },
    { q: "What is the difference between cron and GitHub Actions schedule syntax?", a: "GitHub Actions uses the same 5-field cron syntax with one difference: all times are in UTC. A cron of '0 9 * * 1' in GitHub Actions fires at 09:00 UTC on Mondays. On a server, the timezone depends on the system's locale. The Cron Editor shows run times in your local browser timezone." },
    { q: "Why did my cron job not run at the expected time?", a: "Common reasons: the server clock is in UTC but you wrote the expression in local time; the cron daemon was not running; a syntax error prevented the expression from being parsed; or the job ran but exited silently. Paste the expression into the Cron Editor and verify the next run times match your intent." },
  ],

  "cron-parser": [
    { q: "What is a cron expression used for?", a: "Cron expressions schedule recurring tasks on Unix-based systems. They are used in crontab files, GitHub Actions workflow schedules, Kubernetes CronJobs, AWS EventBridge rules, Vercel cron jobs, and Node.js schedulers like node-cron and cron." },
    { q: "How do I run a job every weekday at 9am?", a: "Use 0 9 * * 1-5. This means: minute 0, hour 9, every day of month, every month, Monday through Friday (1–5). Enter it in the parser to confirm the plain-English description and next run times." },
    { q: "What is the difference between 0 0 * * 0 and @weekly?", a: "@weekly is a shorthand supported by many cron implementations and is equivalent to 0 0 * * 0 — midnight on Sunday. Other shorthands: @daily (0 0 * * *), @hourly (0 * * * *), @monthly (0 0 1 * *), @yearly (0 0 1 1 *)." },
    { q: "Is my cron expression data safe here?", a: "Yes. Parsing runs in your browser. Nothing is sent to a server." },
  ],

  "unix-timestamp": [
    { q: "What is the difference between a Unix timestamp and epoch time?", a: "They are the same thing. 'Unix timestamp', 'epoch timestamp', 'POSIX time', and 'Unix time' all refer to the number of seconds elapsed since the Unix epoch (00:00:00 UTC, 1 January 1970). The terms are interchangeable." },
    { q: "How do I get the current Unix timestamp in JavaScript?", a: "Math.floor(Date.now() / 1000) gives the current timestamp in seconds. Date.now() gives milliseconds. new Date().getTime() also gives milliseconds." },
    { q: "What is a 13-digit timestamp?", a: "A 13-digit timestamp is in milliseconds rather than seconds. JavaScript's Date.now() returns milliseconds. To convert to seconds divide by 1000. The converter auto-detects whether your input is seconds or milliseconds based on digit count." },
    { q: "What timezone is a Unix timestamp in?", a: "Unix timestamps are always in UTC (Coordinated Universal Time) — they have no timezone. When you display them as a date, you apply a timezone offset. The converter shows the time in your browser's local timezone and also in UTC." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "timezone-converter": [
    { q: "What time zones are available?", a: "All 600+ IANA time zones are available — from Pacific/Apia to Pacific/Auckland. Both canonical names (America/New_York) and common abbreviations (EST, IST, JST) can be searched. IANA zones automatically handle Daylight Saving Time transitions." },
    { q: "What is the difference between UTC and GMT?", a: "For practical purposes they are the same. UTC (Coordinated Universal Time) is the international standard time reference. GMT (Greenwich Mean Time) is the timezone of the UK in winter. Modern usage treats them interchangeably, though technically UTC is defined by atomic clocks and GMT by solar time." },
    { q: "How do I schedule a meeting across time zones?", a: "Enter the meeting date and time in your local zone, add the zones of all participants, and the converter shows the local time for each. Share the link — it encodes the zones and time so recipients can open it and see the conversion for their own context." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "duration-converter": [
    { q: "How do I convert 3600 seconds to HH:MM:SS?", a: "3600 seconds = 1 hour = 01:00:00. The formula: hours = floor(seconds / 3600), minutes = floor((seconds % 3600) / 60), seconds = seconds % 60. In JavaScript: new Date(3600 * 1000).toISOString().substring(11, 19)." },
    { q: "What is the difference between HH:MM:SS and HH:MM:SS.mmm?", a: "HH:MM:SS shows whole seconds. HH:MM:SS.mmm includes milliseconds (three decimal places). For video timecodes, audio editing, and performance profiling, millisecond precision is often needed. Enable milliseconds mode in the converter." },
    { q: "How many seconds are in a day?", a: "86,400 seconds (60 × 60 × 24). In a week: 604,800 seconds. In a 30-day month: 2,592,000 seconds. In a 365-day year: 31,536,000 seconds." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "world-clock": [
    { q: "How do I know if a city is currently in standard time or DST?", a: "The World Clock shows the current UTC offset for each city — if a city normally observes DST, its offset during summer (e.g. UTC+5:30 → UTC+6:30) indicates whether DST is active. The displayed time already accounts for the current DST status." },
    { q: "What is UTC and why is it used as the reference?", a: "UTC (Coordinated Universal Time) is the international standard time reference, maintained by atomic clocks. It does not observe Daylight Saving Time. All other time zones are expressed as UTC+X or UTC−X offsets. Using UTC avoids ambiguity when coordinating across time zones." },
    { q: "What is the time difference between India and the US (Eastern)?", a: "India (IST, UTC+5:30) is 10.5 hours ahead of US Eastern Standard Time (EST, UTC−5) and 9.5 hours ahead of Eastern Daylight Time (EDT, UTC−4). Use the Timezone Converter for exact scheduling." },
    { q: "Is my data safe here?", a: "Yes. The clock runs in your browser. Nothing is sent to a server." },
  ],

  "age-calculator": [
    { q: "How is exact age calculated?", a: "The calculator subtracts the birth date from the target date (default: today) using calendar-accurate arithmetic — accounting for leap years, varying month lengths, and the exact day of birth. The result shows years, months, and days as separate components." },
    { q: "Why might my age calculation differ by a day from other tools?", a: "Different tools handle the boundary differently: some count the birthday itself, others count the day after. This calculator counts complete calendar days elapsed, which is the standard for age-of-majority calculations." },
    { q: "Can I calculate someone's age on a future date?", a: "Yes. Set the 'As of' date to any future date and the calculator will show the age at that point — useful for checking whether someone will be of legal age by a specific deadline." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "days-between-dates": [
    { q: "Does the count include both the start and end dates?", a: "The default counts the difference as the number of full days between the two dates — not including the start date but including the end date (standard calendar convention). Toggle 'inclusive' mode to count both endpoints if your use case requires it." },
    { q: "How do I calculate a deadline?", a: "Enter today as the start date and the due date as the end date. The result shows how many days remain. For business day counting (excluding weekends), enable the 'Exclude weekends' option." },
    { q: "What is the date difference between two dates in months?", a: "The calculator shows the difference in calendar months alongside the day count. Note that months are not uniform in length, so 2 months could be 59, 60, or 62 days depending on which months are involved." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "countdown-calculator": [
    { q: "Does the countdown update in real time?", a: "Yes. The remaining time updates every second while the page is open. The display shows days, hours, minutes, and seconds counting down live." },
    { q: "What happens when the countdown reaches zero?", a: "The counter displays 0 days, 0 hours, 0 minutes, 0 seconds and may show a 'reached' indicator. For past dates, the calculator shows elapsed time since the date instead." },
    { q: "Can I share a countdown link?", a: "Yes. The target date is encoded in the URL — copy the address bar to share the countdown with anyone. When they open it they will see the same target date counting down in their browser's timezone." },
    { q: "Is my data safe here?", a: "Yes. The countdown runs in your browser. Nothing is sent to a server." },
  ],

  "week-number-calculator": [
    { q: "Why does the ISO week number sometimes show a different year?", a: "ISO 8601 defines weeks as starting on Monday and week 1 as the week containing the first Thursday of the year. This means the last few days of December can belong to week 1 of the next year, and the first few days of January can belong to week 52 or 53 of the previous year." },
    { q: "What countries use ISO week numbers?", a: "ISO week numbers are standard across Europe and widely used in Scandinavia, Germany, France, and the Netherlands for business and logistics. The US and UK more commonly use simple week-of-year counting (January 1 = week 1)." },
    { q: "How many weeks are in a year?", a: "Most years have 52 ISO weeks. Long years (ISO years with 53 weeks) occur when January 1 falls on Thursday, or when it falls on Wednesday in a leap year. Use the calculator to check any specific year." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "due-date-calculator": [
    { q: "What is Naegele's rule?", a: "Naegele's rule calculates the expected due date by adding 280 days (40 weeks) to the first day of the last menstrual period (LMP). This is the standard method used by most healthcare providers worldwide, though it assumes a regular 28-day cycle." },
    { q: "How accurate is the calculated due date?", a: "Only about 5% of babies are born exactly on their estimated due date. The typical delivery window is 37–42 weeks of gestation. Ultrasound dating (especially in the first trimester) can provide more accurate gestational age estimates." },
    { q: "What are the trimester dates?", a: "First trimester: weeks 1–12. Second trimester: weeks 13–26. Third trimester: weeks 27–40+. The calculator shows these milestone weeks based on your LMP date." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server. This tool is for informational purposes — consult your healthcare provider for medical advice." },
  ],

  "date-calculator": [
    { q: "How do I add days to a date?", a: "Enter your start date and type the number of days to add in the Days field, then click Calculate. The result date appears instantly with the weekday name. Enter a negative number to subtract days instead." },
    { q: "How does adding months work when the result month has fewer days?", a: "When you add months and the resulting month is shorter than the start month, the date is clamped to the last day of that month. For example, 31 January + 1 month = 28 February (or 29 in a leap year). This is standard calendar-safe month arithmetic — the same behaviour as most date libraries." },
    { q: "Can I add negative values to subtract time?", a: "Yes. Enter a negative number in any field to subtract that unit. -7 days subtracts a week, -1 year subtracts a year. The result is the same as using the subtraction direction." },
    { q: "How are years and months different from weeks and days?", a: "Years and months are calendar units — their exact length varies (months have 28–31 days, years have 365 or 366). Weeks and days are fixed durations. The calculator applies year/month arithmetic on the calendar first, then adds any day offset — matching the behaviour of most programming date libraries." },
    { q: "What day of the week will a date fall on?", a: "The result date shows the full weekday name (Monday, Tuesday, etc.) so you can instantly check whether a deadline, meeting, or event lands on a weekend or a working day." },
    { q: "Is my data safe here?", a: "Yes. Date arithmetic runs in your browser. Nothing is sent to a server." },
  ],

  "astronomy": [
    { q: "How accurate are the sunrise and sunset times?", a: "Times are computed using standard astronomical algorithms (the SunCalc library). Accuracy is typically within 1–2 minutes for locations at normal latitudes. The calculation assumes a flat horizon at sea level — actual times vary with terrain elevation, atmospheric refraction, and obstructions on the horizon." },
    { q: "What is golden hour?", a: "Golden hour is the period shortly after sunrise and before sunset when sunlight is soft, warm, and directional — ideal for photography. It typically lasts 20–60 minutes depending on your latitude and season. The closer you are to the equator, the shorter and more abrupt the golden hour." },
    { q: "What does moon illumination percentage mean?", a: "Moon illumination is the percentage of the Moon's visible disc that is lit by the Sun from Earth's perspective. 0% is a new moon (invisible), 50% is a quarter moon (half-lit disc), 100% is a full moon. The illumination grows (waxing) from new to full and shrinks (waning) back to new over approximately 29.5 days." },
    { q: "Why does the tool show 'always up' for the moon?", a: "Near the Arctic and Antarctic circles, the Moon can remain above or below the horizon for multiple days depending on the season and the Moon's orbital position. The calculator correctly shows this as 'always up' or 'always down' rather than fabricating a rise/set time." },
    { q: "Does the tool need my location?", a: "You can grant location access for automatic coordinates, or type any city name or latitude/longitude manually. All calculations run in your browser — your location is not sent to any server." },
  ],
};
