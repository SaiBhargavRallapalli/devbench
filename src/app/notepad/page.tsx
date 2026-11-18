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
        {/* Title block + editor share one viewport-height column: the page
            owns the height (100dvh minus site header), the editor stretches
            to fill what's left. The <h1> sits outside <Suspense> so it is
            always in the first server-HTML flush Google crawls. */}
        <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
          <div className="px-4 pt-4 pb-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Notepad++ — Multi-tab Code Editor
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Browser-based Notepad++ style editor: multi-tab documents,
              syntax highlighting, find/replace, split view, bookmarks, macros,
              encoding options, and local session restore. Files stay on your
              device — free, no account.
            </p>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <Suspense
              fallback={
                <div
                  className="flex h-full items-center justify-center text-sm text-muted-foreground"
                  aria-busy
                >
                  Loading editor…
                </div>
              }
            >
              <NotepadApp mode="workspace" />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  );
}
