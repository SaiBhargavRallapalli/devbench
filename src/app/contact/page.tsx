"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  Send,
  Clock,
  Bug,
  Lightbulb,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  SITE_CONTACT_EMAIL,
  SITE_PRIVACY_EMAIL,
  SITE_PARTNER_EMAIL,
} from "@/lib/site-config";
import { TOOLS } from "@/lib/tools-registry";

const TOPICS = [
  { id: "bug", label: "Bug report" },
  { id: "tool", label: "Tool suggestion" },
  { id: "feedback", label: "General feedback" },
  { id: "partnership", label: "Partnership / collaboration" },
  { id: "privacy", label: "Privacy concern" },
  { id: "ads", label: "Advertising / monetization" },
  { id: "other", label: "Other" },
] as const;

const SUBJECT_PRESETS = [
  "Bug report",
  "Tool suggestion",
  "General feedback",
  "Partnership / collaboration",
  "Privacy concern",
  "Advertising / monetization",
  "Other",
] as const;

const MSG_MAX = 2000;

export default function ContactPage() {
  const [topic, setTopic] = useState<(typeof TOPICS)[number]["id"]>("feedback");
  const [subjectPreset, setSubjectPreset] =
    useState<(typeof SUBJECT_PRESETS)[number]>("General feedback");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subjectLine, setSubjectLine] = useState("");
  const [toolHint, setToolHint] = useState("");
  const [message, setMessage] = useState("");
  const [sentHint, setSentHint] = useState(false);
  const [formError, setFormError] = useState("");

  const submitMailto = useCallback(() => {
    setFormError("");
    setSentHint(false);

    const n = name.trim();
    const em = email.trim();
    const sub = subjectLine.trim();
    const msg = message.trim();

    if (!n || !em || !sub || !msg) {
      setFormError("Please fill in name, email, subject summary, and message.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (msg.length > MSG_MAX) {
      setFormError(`Message must be ${MSG_MAX} characters or fewer.`);
      return;
    }

    const topicLabel = TOPICS.find((t) => t.id === topic)?.label ?? topic;
    const toolLine = toolHint.trim()
      ? `\nRelated tool / page: ${toolHint.trim()}`
      : "";

    const body = [
      `From: ${n} <${em}>`,
      `Topic: ${topicLabel}`,
      `Subject category: ${subjectPreset}`,
      `${toolLine}`,
      "",
      msg,
      "",
      "---",
      "Sent via DevForge contact form (mailto — not uploaded to our servers)",
    ].join("\n");

    const subject = `[DevForge] ${subjectPreset}: ${sub}`;
    const url = `mailto:${SITE_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = url;
    setSentHint(true);
  }, [topic, subjectPreset, name, email, subjectLine, toolHint, message]);

  const configured = SITE_CONTACT_EMAIL !== "your-email@example.com";

  return (
    <>
      <Header />
      <main className="mx-auto flex-1 w-full max-w-3xl px-4 py-10 sm:px-6 lg:max-w-6xl lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-12 lg:items-start">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5 text-accent" />
              Contact us
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              We&apos;d love to hear from you
            </h1>
            <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
              Questions, bugs, or ideas for new tools? Use the form below — your mail app opens with
              a pre-filled message, similar to{" "}
              <a
                href="https://bytekit.in/contact"
                className="text-accent hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                ByteKit&apos;s contact flow
              </a>
              . Nothing is uploaded to our servers.
            </p>

            {!configured && (
              <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
                Set{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                  NEXT_PUBLIC_CONTACT_EMAIL
                </code>{" "}
                in{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                  .env.local
                </code>{" "}
                so mailto reaches your real inbox (currently placeholder).
              </p>
            )}

            <div className="mt-10 space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  What is this about?
                </label>
                <select
                  value={topic}
                  onChange={(e) =>
                    setTopic(e.target.value as (typeof TOPICS)[number]["id"])
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                >
                  {TOPICS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Full name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Subject <span className="text-destructive">*</span>
                </label>
                <select
                  value={subjectPreset}
                  onChange={(e) =>
                    setSubjectPreset(e.target.value as (typeof SUBJECT_PRESETS)[number])
                  }
                  className="mb-3 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                >
                  {SUBJECT_PRESETS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={subjectLine}
                  onChange={(e) => setSubjectLine(e.target.value)}
                  placeholder="Short summary (e.g. JWT debugger export bug)"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Related tool (optional)
                </label>
                <input
                  list="tool-suggestions"
                  value={toolHint}
                  onChange={(e) => setToolHint(e.target.value)}
                  placeholder="e.g. Image Resizer, /tools/xml-suite"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
                <datalist id="tool-suggestions">
                  {TOOLS.map((t) => (
                    <option key={t.slug} value={`${t.name} (/tools/${t.slug})`} />
                  ))}
                  <option value="/api-tester" />
                  <option value="/code-beautify" />
                  <option value="/graph-calculator" />
                  <option value="/jwt-debugger" />
                  <option value="/diff-checker" />
                </datalist>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Message <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  maxLength={MSG_MAX}
                  placeholder="What happened? What did you expect? For bugs: browser, OS, and steps help."
                  className="w-full resize-y rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {message.length} / {MSG_MAX}
                </p>
              </div>

              {formError && (
                <p className="text-sm text-destructive" role="alert">
                  {formError}
                </p>
              )}
              {sentHint && !formError && (
                <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
                  Thank you! If your mail app didn&apos;t open, email{" "}
                  <a
                    href={`mailto:${SITE_CONTACT_EMAIL}`}
                    className="font-medium text-accent hover:underline"
                  >
                    {SITE_CONTACT_EMAIL}
                  </a>{" "}
                  directly.
                </p>
              )}

              <button
                type="button"
                onClick={submitMailto}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 sm:w-auto"
              >
                <Send className="h-4 w-4" />
                Send message (open email app)
              </button>

              <p className="text-xs text-muted-foreground leading-relaxed">
                By sending, you agree we may use your email only to reply. See{" "}
                <Link href="/privacy" className="text-accent hover:underline">
                  Privacy
                </Link>
                .
              </p>
            </div>

            <section className="mt-14 border-t border-border pt-10">
              <h2 className="text-lg font-semibold text-foreground">
                Frequently asked questions
              </h2>
              <dl className="mt-6 space-y-6">
                <div>
                  <dt className="font-medium text-foreground">How do I report a bug?</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">
                    Pick &quot;Bug report&quot;, choose the subject category, name the tool, and
                    describe expected vs actual behavior. Browser and OS speed things up.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Can I suggest a new tool?</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">
                    Yes — we prioritize ideas that run fully in the browser without accounts or
                    server-side data storage.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Do you store my message?</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">
                    No. The form only builds a mailto link; your email client sends the message.
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <aside className="mt-12 space-y-8 lg:mt-0">
            <section className="rounded-2xl border border-border bg-muted/25 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Contact information
              </h2>
              <ul className="mt-4 space-y-4 text-sm">
                <li>
                  <span className="font-medium text-foreground">General</span>
                  <br />
                  <a
                    href={`mailto:${SITE_CONTACT_EMAIL}`}
                    className="text-accent hover:underline break-all"
                  >
                    {SITE_CONTACT_EMAIL}
                  </a>
                </li>
                <li>
                  <span className="font-medium text-foreground">Privacy</span>
                  <br />
                  <a
                    href={`mailto:${SITE_PRIVACY_EMAIL}`}
                    className="text-accent hover:underline break-all"
                  >
                    {SITE_PRIVACY_EMAIL}
                  </a>
                </li>
                <li>
                  <span className="font-medium text-foreground">Partnership</span>
                  <br />
                  <a
                    href={`mailto:${SITE_PARTNER_EMAIL}`}
                    className="text-accent hover:underline break-all"
                  >
                    {SITE_PARTNER_EMAIL}
                  </a>
                </li>
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Optional{" "}
                <code className="rounded bg-muted px-1 font-mono text-[10px]">
                  NEXT_PUBLIC_PRIVACY_EMAIL
                </code>{" "}
                and{" "}
                <code className="rounded bg-muted px-1 font-mono text-[10px]">
                  NEXT_PUBLIC_PARTNER_EMAIL
                </code>{" "}
                split inboxes; otherwise these route to your main contact address.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <h2 className="font-semibold text-foreground">Response time</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We aim to reply within <strong className="text-foreground">two business days</strong>
                    . Privacy-related requests may take longer depending on volume.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 font-semibold text-foreground">
                <Bug className="h-4 w-4 text-accent" />
                Reporting a bug?
              </h2>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Which tool or URL</li>
                <li>Expected vs actual behavior</li>
                <li>Browser name and version</li>
                <li>Sample input if safe to share</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 font-semibold text-foreground">
                <Lightbulb className="h-4 w-4 text-accent" />
                Suggesting a tool
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We like proposals that are useful to many developers and stay client-side — similar
                to tools on{" "}
                <a
                  href="https://bytekit.in/"
                  className="text-accent hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ByteKit
                </a>
                .
              </p>
            </section>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
