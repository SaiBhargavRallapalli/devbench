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
};
