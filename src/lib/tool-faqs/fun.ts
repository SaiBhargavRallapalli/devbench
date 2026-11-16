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

  "coin-flip": [
    { q: "Is the coin flip really fair?", a: "Yes. Each flip draws one value from your browser's random number generator and maps the lower half to heads, the upper half to tails — a 50/50 split with no weighting, no memory and no pattern. The coin does not try to balance your recent results, because a coin has no idea what they were." },
    { q: "Can I use it for best-of-three or best-of-five?", a: "That is exactly what the history strip is for — the last twenty flips stay on screen as H/T chips with a running heads-versus-tails tally, so the score of an ongoing series is always visible. Press Clear when the match is over." },
    { q: "Does it work on a phone?", a: "Yes — the coin, button and history all resize to a narrow screen, and the flip animation is a single quick spin that respects your operating system's reduced-motion setting (with reduced motion on, the result simply appears)." },
    { q: "Are my flips saved or sent anywhere?", a: "No. Results live in the page's memory only: reload or leave and the history is gone. There is no account, no server-side record and nothing to reset — refreshing gives you a completely fresh coin." },
    { q: "Heads or tails — which should I pick?", a: "Pick whichever side you would have chosen anyway; the coin exists to end the discussion, not to improve the odds. For multi-option decisions the Spin Wheel is the grown-up version of this tool." },
  ],

  "dice-roller": [
    { q: "Are the rolls fair?", a: "Each die draws an independent integer from your browser's random number generator, uniform across 1–6, and dice never influence each other — rolling six at once is the same as rolling one six times. No server is involved, so nothing can seed or tamper with the outcome." },
    { q: "How many dice can I roll at once?", a: "One to six in a single click — one for a binary decision, two for most board games, four to six for games like Yahtzee or Farkle. The dice count buttons switch the roll instantly; the total and the per-die breakdown update together." },
    { q: "What does the history keep?", a: "The last ten rolls, newest first, each showing the dice count, every individual face and the total — so a long session never loses track of who rolled what. Clear empties it whenever the table wants a fresh start." },
    { q: "Can I roll other dice, like a d20?", a: "Not yet — this roller ships with classic six-sided dice with pips, which covers board games, classroom use and most party games. Tabletop systems needing d8/d12/d20 sets are a natural next step for the tool." },
    { q: "Do my rolls get stored anywhere?", a: "No. Rolls and history live in the page's memory only — nothing is written to local storage, sent to a server or recorded. Reload the page and the slate is clean." },
  ],

  "magic-8-ball": [
    { q: "How many answers does the 8-Ball have?", a: "Twenty — the canonical deck: ten affirmative replies ('It is certain', 'Yes', 'Signs point to yes'), five negative ('Don't count on it', 'Very doubtful') and five hazy non-answers ('Reply hazy — try again', 'Concentrate and ask again'). One is drawn uniformly at random on every ask." },
    { q: "What kind of questions should I ask?", a: "Yes-or-no questions — that is what the deck is built for. Decisions, dares, 'should I have dessert', 'will it ship today': the ball commits to an answer or pointedly refuses to. Open-ended questions get one of the same twenty replies, which is part of the charm." },
    { q: "Why are some answers vague?", a: "Five of the twenty are deliberate non-answers that bounce the question back to you — the ball's way of saying the decision is still yours. They appear in amber, with green for yes-leaning and red for no-leaning replies, so the outlook is readable at a glance." },
    { q: "Does the ball remember my previous questions?", a: "Only on screen: the last eight exchanges are listed under the ball so you can look back at its guidance. The deck itself is stateless — every draw is independent, and clearing the history forgets everything the ball has ever said." },
    { q: "Is anything I ask stored or sent anywhere?", a: "No. Questions and answers stay in the page's memory; nothing leaves your browser, nothing is written to local storage and there is no account. It is a toy, and it behaves like one." },
  ],

  "random-number-generator": [
    { q: "How does the random number generator work?", a: "It draws integers uniformly from the range you set — every value between min and max is equally likely. Numbers are produced by your browser's built-in random source, so results are unpredictable and there is no pattern to exploit. Choose how many numbers you want and whether repeats are allowed." },
    { q: "Can I generate numbers without repeats?", a: "Yes — turn on No repeats and the tool picks a unique set, which is exactly what a raffle, giveaway, lottery pick or classroom group draw needs. If you ask for more unique numbers than the range contains, it tells you instead of quietly duplicating values." },
    { q: "What ranges and presets are available?", a: "Any range where the maximum is at least the minimum, including negative numbers and single-value ranges. Presets cover the popular 1–10, 1–50, 1–100 and 1–1000 spans, and you can draw up to 100 numbers in one go. Sort ascending if you want the output ordered instead of in draw order." },
    { q: "Are the numbers truly random and fair?", a: "They come from the same cryptographically secure random number generator your browser uses for session tokens — uniform, independent and not predictable from previous draws. That makes the tool suitable for raffles and draws as well as games, sampling and test data." },
    { q: "Can I copy the results or keep previous draws?", a: "Copy puts every number from the current draw on your clipboard as a comma-separated list, ready for a spreadsheet or form. The twelve most recent draws stay in the history panel below with a one-click clear, and each result shows the lowest, highest and total of the set." },
  ],

  "iq-test": [
    { q: "Is this a real IQ test?", a: "No. It is a practice test that estimates your score on the usual IQ scale. It uses the same kinds of puzzles as well-known online tests, but its scoring rests on assumed average performance, not on a tested norm group. It is not a clinical assessment, a diagnosis or an official Mensa or psychologist-administered result." },
    { q: "How many questions are there and how long do I get?", a: "There are 40 questions and a 35-minute limit: 12 matrix puzzles, 8 number and letter series, 8 verbal reasoning questions, 6 numerical word problems and 6 spatial rotation questions. The timer cannot be paused, and anything unanswered when it ends counts as wrong." },
    { q: "How is my IQ score calculated?", a: "Each correct answer earns points equal to its difficulty, from 1 to 5. Your weighted total is compared with the total an average adult is assumed to earn and converted to a scale with an average of 100 and a spread of 15. Scores are limited to 70 to 145, and a likely range of about 7 points either way is shown beside the estimate." },
    { q: "What does the percentile mean?", a: "It shows where your estimated IQ falls on the standard bell curve: an IQ of 100 is the 50th percentile, 115 is about the 84th and 130 is about the 98th. Because the score itself is an estimate, treat the percentile as a rough guide too." },
    { q: "Can I go back, skip questions or change answers?", a: "Yes. Use Previous and Next or the arrow keys, click any number in the question navigator, flag questions to revisit and click a chosen answer again to clear it. You can submit early from any question once you are done." },
    { q: "Will I get the same questions if I retake it?", a: "No. The matrix, series, numerical and spatial puzzles are generated fresh for each attempt, and the verbal questions are drawn from a pool. You can retake the test any time, but results shift with practice, sleep, stress and distractions, so do not read too much into small changes." },
    { q: "Is my data stored or sent anywhere?", a: "No. The questions are generated in your browser, your answers stay in the page's memory and nothing is uploaded or saved. Reloading the page ends the attempt and clears it." },
  ],
};
