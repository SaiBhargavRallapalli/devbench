import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import NotepadApp from "@/components/notepad/NotepadApp";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/social-metadata";
import { socialMetadata } from "@/lib/social-metadata";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";

const TITLE = "Notepad++ — Multi-tab Code Editor";
const DESC =
  "Browser-based Notepad++ style editor: multi-tab documents, syntax highlighting, find/replace, split view, bookmarks, macros, encoding options, and local session restore.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: [
    "notepad++ online",
    "code editor browser",
    "text editor",
    "syntax highlighting",
    "multi tab editor",
    "markdown editor",
  ],
  alternates: { canonical: `${SITE_URL}/notepad` },
  ...socialMetadata({
    title: TITLE,
    description: DESC,
    canonicalPath: "/notepad",
  }),
};

export default function NotepadWorkspacePage() {
  return (
    <>
      <Header />
      <JsonLd data={breadcrumbSchema([{ name: "Notepad++", path: "/notepad" }])} />
      <main className="flex-1">
        <Suspense
          fallback={
            <div
              className="flex h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted-foreground"
              aria-busy
            >
              Loading editor…
            </div>
          }
        >
          <NotepadApp mode="workspace" />
        </Suspense>
      </main>
    </>
  );
}
