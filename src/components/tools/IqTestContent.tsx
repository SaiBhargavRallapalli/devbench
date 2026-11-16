import Link from "next/link";

const prose = "text-sm text-muted-foreground leading-relaxed";
const h2 = "text-base font-semibold text-foreground mt-6 mb-2";
const ul = "list-disc list-inside space-y-1 text-sm text-muted-foreground";
const ol = "list-decimal list-inside space-y-1.5 text-sm text-muted-foreground";

export default function IqTestContent() {
  return (
    <section
      id="tool-guide"
      aria-label="Tool guide"
      className="max-w-6xl mx-auto px-4 pb-4 w-full border-t border-border pt-8 mt-2 space-y-3 scroll-mt-24"
    >
      <h2 className={h2}>How the IQ test works</h2>
      <ol className={ol}>
        <li>
          Press <strong className="text-foreground">Start the test</strong>. You get 40 questions and 35 minutes, with
          the countdown shown at the top of every question.
        </li>
        <li>
          Answer one question at a time by clicking an option or pressing 1 to 5. You can move back and forth with the
          arrow keys or the question numbers, flag questions to revisit, and change any answer before you submit.
        </li>
        <li>
          Submit early or let the timer run out. You then see an estimated IQ with a likely range, a percentile, a
          result for each skill and an answer review that explains every question.
        </li>
      </ol>
      <h2 className={h2}>What is on the test</h2>
      <ul className={ul}>
        <li>
          <strong className="text-foreground">Matrix reasoning (12)</strong> - 3×3 grids of shapes or dots with one
          figure missing. This is the style used by Raven-type tests and is the closest thing to a pure reasoning
          measure.
        </li>
        <li>
          <strong className="text-foreground">Number and letter series (8)</strong> - sequences built from addition,
          multiplication, alternating or growing rules.
        </li>
        <li>
          <strong className="text-foreground">Verbal reasoning (8)</strong> - analogies, odd-one-out, word meaning and
          short logic puzzles.
        </li>
        <li>
          <strong className="text-foreground">Numerical reasoning (6)</strong> - ratios, percentages, rates, averages
          and ages in short word problems.
        </li>
        <li>
          <strong className="text-foreground">Spatial reasoning (6)</strong> - pick the shape that is the original
          turned around, not flipped over.
        </li>
      </ul>
      <h2 className={h2}>How the score is calculated, and what it means</h2>
      <p className={prose}>
        Questions get harder as you go, and harder questions are worth more points. Your weighted total is compared
        with the total an average adult is assumed to earn, then converted to the usual IQ scale where 100 is average
        and about two thirds of people score between 85 and 115. The percentile shows where that score falls on the
        standard curve. Scores are limited to 70 to 145 because a short online test cannot measure beyond that range.
      </p>
      <p className={prose}>
        The estimate is for practice and curiosity. It is not calibrated against a tested norm group, it is not a
        clinical assessment and it is not a Mensa or professional result. If you need a formal score, ask a
        licensed psychologist. Every attempt generates new puzzles, and nothing you answer leaves your browser.
      </p>
      <p className={prose}>
        Also useful:{" "}
        <Link href="/tools/spin-wheel" className="text-accent hover:underline">
          Spin Wheel
        </Link>
        {", "}
        <Link href="/tools/random-number-generator" className="text-accent hover:underline">
          Random Number Generator
        </Link>
        {", and "}
        <Link href="/tools/stopwatch" className="text-accent hover:underline">
          Stopwatch
        </Link>
        .
      </p>
    </section>
  );
}
