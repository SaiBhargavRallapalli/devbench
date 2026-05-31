import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="mx-auto flex-1 w-full max-w-2xl px-4 py-10 sm:px-6">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">About DevBench</h1>
        <div className="mt-6 space-y-6 text-muted-foreground leading-relaxed">

          <p>
            DevBench is a free, browser-based toolkit built for developers, DevOps engineers,
            data teams, and anyone who works with code and data every day. It brings together
            130+ carefully crafted utilities — from JSON formatting and Base64 encoding to PDF
            tools, finance calculators, and regex testing — in one place, with no account
            required and nothing uploaded to a server.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-2">Why we built it</h2>
          <p>
            Every developer knows the feeling: you need to quickly decode a JWT, prettify some
            JSON, or convert a Unix timestamp — and you end up bouncing between browser tabs,
            sketchy websites with intrusive ads, or spinning up a local REPL just for a 10-second
            task. DevBench was built to fix that. One URL, all the tools, no friction.
          </p>
          <p>
            We also cared deeply about privacy from day one. Most online tools silently send your
            input to a backend server. When you paste an API key, a JWT, or a customer&apos;s
            data into one of those tools, you are sharing it with a third party. DevBench
            processes everything locally using your browser&apos;s JavaScript engine, Web Crypto
            API, and Web Workers. Open DevTools, go to the Network tab, and you will see no
            outbound request when you format JSON, encode text, or run a hash — because there
            isn&apos;t one.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-2">What&apos;s inside</h2>
          <p>DevBench organises its tools into focused categories so you can find what you need quickly:</p>
          <ul className="list-disc list-inside space-y-1.5 text-sm">
            <li><strong className="text-foreground">JSON &amp; Data</strong> — formatter, validator, diff, JSON↔YAML, JSON↔CSV, JSON↔TypeScript, XML tools</li>
            <li><strong className="text-foreground">Encoding &amp; Decoding</strong> — Base64, URL encoding, HTML entities, hex, binary, ROT13, Morse code, AES-256 encryption</li>
            <li><strong className="text-foreground">Text Utilities</strong> — regex tester, case converter, diff checker, word counter, Markdown preview, string inspector, Unicode checker</li>
            <li><strong className="text-foreground">Developer Tools</strong> — JWT debugger, hash generator, UUID/ULID/Nano ID, cron editor, API tester, webhook simulator, AWS Lambda sandbox, colour converter, SQL formatter</li>
            <li><strong className="text-foreground">PDF Tools</strong> — merge, split, rotate, compress, watermark, page editor, image-to-PDF, PDF-to-JPG</li>
            <li><strong className="text-foreground">Image Tools</strong> — background remover, image resizer, image merger, compressor, format converter, SVG optimizer, EXIF viewer</li>
            <li><strong className="text-foreground">Math &amp; Science</strong> — graph calculator, quadratic solver, Pythagorean theorem, GCD &amp; LCM, astronomy tools</li>
            <li><strong className="text-foreground">Finance &amp; Health</strong> — compound interest, EMI calculator, GST/VAT, BMI, BMR, TDEE, body fat estimator</li>
            <li><strong className="text-foreground">Date &amp; Time</strong> — Unix timestamp converter, date calculator, age calculator, countdown, timezone converter, world clock</li>
            <li><strong className="text-foreground">Conversion</strong> — temperature, units, bytes, Roman numerals, number-to-words, aspect ratio, currency, percentage</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground pt-2">How it works</h2>
          <p>
            Every tool in DevBench runs in your browser. When you paste text, upload a file, or
            type into a form, the computation happens locally using JavaScript APIs that ship
            with every modern browser — the Web Crypto API for hashing and encryption, the File
            API for PDFs and images, Web Workers for CPU-intensive tasks like background removal
            and Pyodide (Python in the browser) for the code playground.
          </p>
          <p>
            The only exceptions are requests you explicitly initiate: the API Tester sends HTTP
            requests through a CORS proxy so you can reach external endpoints, and the Webhook
            Simulator lets you fire test payloads to URLs you specify. Everything else stays on
            your device.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-2">Who uses DevBench</h2>
          <p>
            DevBench is used by backend engineers formatting API responses, frontend developers
            debugging tokens and encodings, DevOps teams decoding logs and writing cron
            schedules, security researchers validating hashes, data analysts cleaning CSVs,
            students learning about algorithms, and anyone who just needs a quick converter
            without installing software.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-2">The blog</h2>
          <p>
            Beyond the tools, DevBench publishes in-depth technical guides covering topics like
            JWT security, Base64 encoding internals, regex patterns, Unix timestamps, SHA-256 vs
            MD5, and more. The{" "}
            <Link href="/blog" className="text-accent hover:underline">
              blog
            </Link>{" "}
            aims to explain not just how to use each tool, but why the underlying technology
            works the way it does.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-2">Get in touch</h2>
          <p>
            Have a bug to report, a tool suggestion, or just want to say hello?{" "}
            <Link href="/contact" className="text-accent hover:underline">
              Use the contact form
            </Link>{" "}
            — we read every message. If you spot something broken or have an idea for a new
            utility, we genuinely want to hear it.
          </p>

        </div>
      </main>
      <Footer />
    </>
  );
}
