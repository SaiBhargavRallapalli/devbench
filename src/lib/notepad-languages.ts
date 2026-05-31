// Copyright (c) 2026 DevBench contributors. MIT License.

export type NotepadLanguage = {
  id: string;
  label: string;
  ext: string;
};

/** Monaco language ids — mirrors Notepad++ language menu (browser-safe subset). */
export const NOTEPAD_LANGUAGES: NotepadLanguage[] = [
  { id: "plaintext", label: "Normal text", ext: "txt" },
  { id: "javascript", label: "JavaScript", ext: "js" },
  { id: "typescript", label: "TypeScript", ext: "ts" },
  { id: "json", label: "JSON", ext: "json" },
  { id: "html", label: "HTML", ext: "html" },
  { id: "css", label: "CSS", ext: "css" },
  { id: "scss", label: "SCSS", ext: "scss" },
  { id: "less", label: "LESS", ext: "less" },
  { id: "xml", label: "XML", ext: "xml" },
  { id: "yaml", label: "YAML", ext: "yaml" },
  { id: "markdown", label: "Markdown", ext: "md" },
  { id: "sql", label: "SQL", ext: "sql" },
  { id: "python", label: "Python", ext: "py" },
  { id: "java", label: "Java", ext: "java" },
  { id: "c", label: "C", ext: "c" },
  { id: "cpp", label: "C++", ext: "cpp" },
  { id: "csharp", label: "C#", ext: "cs" },
  { id: "go", label: "Go", ext: "go" },
  { id: "rust", label: "Rust", ext: "rs" },
  { id: "php", label: "PHP", ext: "php" },
  { id: "ruby", label: "Ruby", ext: "rb" },
  { id: "shell", label: "Shell / Bash", ext: "sh" },
  { id: "powershell", label: "PowerShell", ext: "ps1" },
  { id: "dockerfile", label: "Dockerfile", ext: "dockerfile" },
  { id: "ini", label: "INI / Config", ext: "ini" },
  { id: "lua", label: "Lua", ext: "lua" },
  { id: "kotlin", label: "Kotlin", ext: "kt" },
  { id: "swift", label: "Swift", ext: "swift" },
  { id: "r", label: "R", ext: "r" },
  { id: "perl", label: "Perl", ext: "pl" },
  { id: "vb", label: "Visual Basic", ext: "vb" },
  { id: "bat", label: "Batch", ext: "bat" },
  { id: "graphql", label: "GraphQL", ext: "graphql" },
  { id: "handlebars", label: "Handlebars", ext: "hbs" },
  { id: "redis", label: "Redis", ext: "redis" },
];

const EXT_TO_LANG = new Map<string, string>();
for (const lang of NOTEPAD_LANGUAGES) {
  EXT_TO_LANG.set(lang.ext.toLowerCase(), lang.id);
}
EXT_TO_LANG.set("yml", "yaml");
EXT_TO_LANG.set("jsx", "javascript");
EXT_TO_LANG.set("tsx", "typescript");
EXT_TO_LANG.set("htm", "html");
EXT_TO_LANG.set("mdx", "markdown");
EXT_TO_LANG.set("sh", "shell");
EXT_TO_LANG.set("bash", "shell");
EXT_TO_LANG.set("zsh", "shell");
EXT_TO_LANG.set("ps1", "powershell");
EXT_TO_LANG.set("cs", "csharp");
EXT_TO_LANG.set("h", "c");
EXT_TO_LANG.set("hpp", "cpp");
EXT_TO_LANG.set("cc", "cpp");

export function detectLanguageFromFilename(name: string): string {
  const base = name.split("/").pop() ?? name;
  const dot = base.lastIndexOf(".");
  if (dot <= 0) return "plaintext";
  const ext = base.slice(dot + 1).toLowerCase();
  return EXT_TO_LANG.get(ext) ?? "plaintext";
}

export function extensionForLanguage(languageId: string): string {
  return NOTEPAD_LANGUAGES.find((l) => l.id === languageId)?.ext ?? "txt";
}

export function labelForLanguage(languageId: string): string {
  return NOTEPAD_LANGUAGES.find((l) => l.id === languageId)?.label ?? "Normal text";
}
