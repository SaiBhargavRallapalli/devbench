"use client";

import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import ToolPageHero from "@/components/tools/ToolPageHero";
import type { Tool } from "@/lib/tools-registry";

interface Template {
  id: string;
  label: string;
  content: string;
}

interface TemplateGroup {
  heading: string;
  templates: Template[];
}

const TEMPLATE_GROUPS: TemplateGroup[] = [
  {
    heading: "Languages / Runtimes",
    templates: [
      {
        id: "nodejs",
        label: "Node.js",
        content: `node_modules/
.env
.env.local
.env.*.local
dist/
build/
.next/
out/
coverage/
*.tsbuildinfo
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
.yarn/cache
.yarn/unplugged
.pnp.*`,
      },
      {
        id: "python",
        label: "Python",
        content: `__pycache__/
*.py[cod]
*$py.class
.venv/
venv/
env/
*.egg-info/
dist/
build/
.eggs/
*.egg
pip-log.txt
pip-delete-this-directory.txt
.tox/
.mypy_cache/
.pytest_cache/
.hypothesis/`,
      },
      {
        id: "java",
        label: "Java",
        content: `*.class
*.jar
*.war
*.ear
target/
.gradle/
build/
out/
.idea/
*.iml
*.iws
hs_err_pid*`,
      },
      {
        id: "go",
        label: "Go",
        content: `*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out
vendor/
go.sum`,
      },
      {
        id: "rust",
        label: "Rust",
        content: `/target/
Cargo.lock`,
      },
      {
        id: "ruby",
        label: "Ruby",
        content: `.bundle/
vendor/bundle/
log/
tmp/
db/*.sqlite3
.env`,
      },
      {
        id: "php",
        label: "PHP",
        content: `vendor/
.env
.phpunit.result.cache
storage/logs/
storage/framework/cache/`,
      },
      {
        id: "c-cpp",
        label: "C/C++",
        content: `*.o
*.obj
*.exe
*.dll
*.so
*.a
*.lib
build/
CMakeFiles/
cmake_install.cmake
CMakeCache.txt
Makefile`,
      },
      {
        id: "swift",
        label: "Swift",
        content: `.build/
*.xcodeproj/xcuserdata/
*.xcworkspace/xcuserdata/
DerivedData/`,
      },
      {
        id: "kotlin",
        label: "Kotlin",
        content: `.gradle/
build/
out/
.idea/
*.iml`,
      },
    ],
  },
  {
    heading: "Frameworks",
    templates: [
      {
        id: "react",
        label: "React",
        content: `node_modules/
.env.local
.env.development.local
.env.test.local
.env.production.local
build/`,
      },
      {
        id: "nextjs",
        label: "Next.js",
        content: `.next/
out/
node_modules/
.env*.local
*.tsbuildinfo`,
      },
      {
        id: "vue",
        label: "Vue",
        content: `node_modules/
dist/
.env.local
.env.*.local`,
      },
      {
        id: "angular",
        label: "Angular",
        content: `node_modules/
dist/
.angular/
.env`,
      },
      {
        id: "django",
        label: "Django",
        content: `*.pyc
__pycache__/
db.sqlite3
.env
staticfiles/
media/
*.log`,
      },
      {
        id: "laravel",
        label: "Laravel",
        content: `vendor/
.env
storage/logs/
bootstrap/cache/`,
      },
      {
        id: "spring",
        label: "Spring",
        content: `target/
.mvn/
*.jar
.gradle/
build/`,
      },
    ],
  },
  {
    heading: "Editors / IDEs",
    templates: [
      {
        id: "vscode",
        label: "VS Code",
        content: `.vscode/
*.code-workspace
!.vscode/settings.json
!.vscode/extensions.json`,
      },
      {
        id: "jetbrains",
        label: "JetBrains",
        content: `.idea/
*.iml
*.iws
out/`,
      },
      {
        id: "vim",
        label: "Vim/Neovim",
        content: `*.swp
*.swo
*~
.netrwhist
Session.vim`,
      },
      {
        id: "eclipse",
        label: "Eclipse",
        content: `.classpath
.project
.settings/
bin/`,
      },
    ],
  },
  {
    heading: "OS",
    templates: [
      {
        id: "macos",
        label: "macOS",
        content: `.DS_Store
.AppleDouble
.LSOverride
._*
.Spotlight-V100
.Trashes
.fseventsd`,
      },
      {
        id: "windows",
        label: "Windows",
        content: `Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
Desktop.ini
$RECYCLE.BIN/
*.cab
*.msi`,
      },
      {
        id: "linux",
        label: "Linux",
        content: `*~
.fuse_hidden*
.directory
.Trash-*
.nfs*`,
      },
    ],
  },
  {
    heading: "Tools",
    templates: [
      {
        id: "terraform",
        label: "Terraform",
        content: `.terraform/
*.tfvars
!*.tfvars.example
.terraform.lock.hcl
terraform.tfstate
terraform.tfstate.backup
*.tfplan`,
      },
      {
        id: "docker",
        label: "Docker",
        content: `.dockerignore`,
      },
      {
        id: "vagrant",
        label: "Vagrant",
        content: `.vagrant/`,
      },
    ],
  },
];

const ALL_TEMPLATES = TEMPLATE_GROUPS.flatMap((g) => g.templates);

function generateGitignore(selectedIds: Set<string>): string {
  const sections: string[] = [];
  for (const t of ALL_TEMPLATES) {
    if (selectedIds.has(t.id)) {
      sections.push(`# === ${t.label} ===\n${t.content}`);
    }
  }
  return sections.join("\n\n");
}

export default function GitignoreGeneratorTool({ tool }: { tool: Tool }) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(["nodejs", "macos"]),
  );
  const [output, setOutput] = useState<string>(() =>
    generateGitignore(new Set(["nodejs", "macos"])),
  );
  const [copied, setCopied] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleGenerate() {
    setOutput(generateGitignore(selected));
  }

  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".gitignore";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: template selector */}
          <div className="space-y-5">
            {TEMPLATE_GROUPS.map((group) => (
              <div key={group.heading}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.heading}
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {group.templates.map((t) => (
                    <label
                      key={t.id}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selected.has(t.id)}
                        onChange={() => toggle(t.id)}
                      />
                      <span className="text-sm font-medium">{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={handleGenerate}
              className="mt-2 w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 active:opacity-75"
            >
              Generate .gitignore
            </button>
          </div>

          {/* Right: output */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Output</span>
              {output && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download as .gitignore
                  </button>
                </div>
              )}
            </div>
            <textarea
              readOnly
              value={output}
              placeholder="Select templates above and click Generate."
              className="w-full resize-none rounded-xl border border-border bg-muted/50 p-4 font-mono text-sm min-h-[300px] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
