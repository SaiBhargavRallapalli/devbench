import type { Faq } from "./_types";

export const faqsFun: Record<string, Faq[]> = {
  "spin-wheel": [
    { q: "Are the spins fair?", a: "Each spin draws a weighted random winner: every option's chance of winning equals its weight divided by the total of all weights. Because slice size is drawn from the same weights, what you see is exactly what you get — a weight-3 option occupies three times the wheel and wins three times as often. That's plenty fair for games, classrooms and party raffles." },
    { q: "What does the weight number do?", a: "Weight controls both the slice size and the odds. All options at weight 1 are equal. Give one option weight 2 and it becomes twice as likely to win (and its slice doubles). Weights can be any whole number from 1 to 999 — for example, in a giveaway where 1 entry deserves 5 chances, set that entrant's weight to 5." },
    { q: "How does elimination mode work?", a: "Turn it on and each winner is removed from the wheel after their spin (marked \"Out\" in the list). Keep spinning and the field narrows until one option remains — that option is declared the round winner. \"New round\" restores every option for the next game." },
    { q: "Where are my options and history stored?", a: "Everything stays in your browser's localStorage — options, weights, sound preference, duration and the last 30 results. Nothing is uploaded to DevBench or any server, and the wheel works fully offline once the page has loaded. Clearing site data for this site resets the wheel to its defaults." },
    { q: "Can I save or share the wheel?", a: "Yes — the PNG button exports the wheel as an image (pointer and current slices included), ready to drop into a slide, chat or social post. Your live options and history persist across visits automatically." },
    { q: "Does it respect reduced-motion settings?", a: "Yes. If your operating system or browser requests reduced motion, the wheel skips the spin animation entirely and jumps straight to the result — you still get the winner, history and sound cues without any movement." },
  ],

  "fun-holidays": [
    { q: "How is today's holiday chosen?", a: "The collection is keyed by month and day, so the page simply looks up the MM-DD of the date you have selected and shows every entry stored against it. If the day has nothing in the collection, it offers the next three holidays coming up instead — the tool never invents a holiday for a bare date." },
    { q: "Why only fixed-date holidays?", a: "Floating observances like Mother's Day, Diwali or Thanksgiving move every year, so a static dataset would be wrong in most years. Only days that fall on the same date annually are included — that way what you read is never out of date, and the list stays honest." },
    { q: "What does the Surprise me button do?", a: "It picks one of the holidays in the collection at random and shows it as a dismissible card with its date and blurb. From the card you can jump the date picker straight to that day and see everything else stored around it." },
    { q: "Can I browse a whole month at once?", a: "Yes — the Every holiday in [month] list shows every entry for the currently selected month in date order, with the current date highlighted. Clicking any row moves the date picker to that day, so it doubles as a month-at-a-glance view." },
    { q: "Is my data sent anywhere?", a: "No. The holiday collection ships with the page as a plain dataset and every lookup happens locally — no requests, no accounts, nothing stored." },
  ],
};
