// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * DevBench Roadmaps — interactive developer learning paths.
 *
 * Content is original to DevBench. roadmap.sh's license forbids republishing
 * its roadmap content, so each roadmap instead links out to the matching
 * community roadmap on roadmap.sh (link sharing is allowed) alongside
 * official documentation and DevBench's own free tools.
 */

export interface RoadmapResource {
  label: string;
  url: string;
}

export interface RoadmapPlaygroundSnippet {
  lang: "javascript" | "typescript" | "python";
  code: string;
}

export interface RoadmapNode {
  /** Unique within the roadmap */
  id: string;
  title: string;
  /** One or two plain sentences, original to DevBench */
  summary: string;
  resources: RoadmapResource[];
  /** DevBench tool-registry slugs that help practice this topic */
  tools?: string[];
  /** Internal DevBench routes worth opening for this topic */
  internalLinks?: { label: string; href: string }[];
  /** "Try it" snippet that opens in the DevBench Playground */
  playground?: RoadmapPlaygroundSnippet;
}

export interface RoadmapSection {
  id: string;
  title: string;
  intro: string;
  nodes: RoadmapNode[];
}

export interface Roadmap {
  slug: string;
  title: string;
  kind: "role" | "skill";
  tagline: string;
  description: string;
  /** Rough effort estimate shown on cards */
  estimate: string;
  /** Matching community roadmap on roadmap.sh (link, not copied content) */
  communityUrl: string;
  sections: RoadmapSection[];
}

export const ROADMAPS: Roadmap[] = [
  {
    slug: "frontend",
    title: "Frontend Developer",
    kind: "role",
    tagline: "From how the web works to shipping a production UI",
    description:
      "A step-by-step path to becoming a frontend developer: web fundamentals, semantic HTML, modern CSS, JavaScript, and the tooling that ships real interfaces.",
    estimate: "4-6 months part-time",
    communityUrl: "https://roadmap.sh/frontend",
    sections: [
      {
        id: "web-basics",
        title: "How the web works",
        intro: "The mental model every other step builds on.",
        nodes: [
          {
            id: "how-the-web-works",
            title: "Clients, servers and requests",
            summary:
              "A browser asks a server for resources over HTTP and renders what comes back. Knowing this request/response loop explains everything from URLs to caching.",
            resources: [
              { label: "MDN: How the web works", url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works" },
              { label: "freeCodeCamp: HTTP crash course", url: "https://www.freecodecamp.org/news/http-and-everything-you-need-to-know-about-it/" },
            ],
          },
          {
            id: "dns-and-hosting",
            title: "DNS, domains and hosting",
            summary:
              "DNS turns a domain name into the IP address of a server. Hosting is where your files actually live — static hosts, CDNs and servers each fit different needs.",
            resources: [
              { label: "MDN: What is a domain name", url: "https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/What_is_a_domain_name" },
              { label: "Cloudflare Learning: What is DNS", url: "https://www.cloudflare.com/learning/dns/what-is-dns/" },
            ],
          },
          {
            id: "http-fundamentals",
            title: "HTTP methods, status codes and headers",
            summary:
              "GET, POST, PUT and DELETE describe intent; status codes describe outcomes; headers carry metadata like content type and caching rules. You will debug these daily.",
            resources: [
              { label: "MDN: HTTP overview", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview" },
              { label: "MDN: HTTP status codes", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status" },
            ],
            internalLinks: [{ label: "Open the API Tester", href: "/api-tester" }],
          },
          {
            id: "browsers-and-rendering",
            title: "How browsers render a page",
            summary:
              "Browsers parse HTML into the DOM, CSS into the CSSOM, then run layout and paint. Blocking scripts and heavy CSS directly delay what users see.",
            resources: [
              { label: "web.dev: How browsers work", url: "https://web.dev/articles/howbrowserswork" },
              { label: "MDN: Render-tree construction", url: "https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work" },
            ],
          },
        ],
      },
      {
        id: "html",
        title: "HTML",
        intro: "Structure first — frameworks change, markup fundamentals don't.",
        nodes: [
          {
            id: "semantic-html",
            title: "Semantic elements and document structure",
            summary:
              "Elements like header, nav, main, article and footer describe meaning, not just layout. Semantic markup improves accessibility and SEO for free.",
            resources: [
              { label: "MDN: HTML elements reference", url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element" },
              { label: "web.dev: Learn HTML", url: "https://web.dev/learn/html" },
            ],
          },
          {
            id: "forms-and-validation",
            title: "Forms and validation",
            summary:
              "Inputs, labels, fieldsets and built-in validation attributes cover most form needs before any JavaScript. Good labels and types also drive mobile keyboards.",
            resources: [
              { label: "MDN: HTML forms guide", url: "https://developer.mozilla.org/en-US/docs/Learn/Forms" },
              { label: "MDN: Client-side form validation", url: "https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation" },
            ],
          },
          {
            id: "accessibility-basics",
            title: "Accessibility basics",
            summary:
              "Alt text, keyboard navigation, focus order and ARIA where semantics fall short. Accessible pages work better for everyone and rank better too.",
            resources: [
              { label: "web.dev: Learn accessibility", url: "https://web.dev/learn/accessibility" },
              { label: "MDN: Accessibility", url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility" },
            ],
          },
          {
            id: "html-seo-basics",
            title: "SEO fundamentals in markup",
            summary:
              "Titles, meta descriptions, canonical URLs and structured data tell search engines what a page is. Most of it is plain HTML you control from day one.",
            resources: [
              { label: "Google: SEO starter guide", url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide" },
              { label: "MDN: head metadata", url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/The_head_metadata_in_HTML" },
            ],
            tools: ["json-formatter"],
          },
        ],
      },
      {
        id: "css",
        title: "CSS",
        intro: "Layout is the skill that separates tutorials from production work.",
        nodes: [
          {
            id: "css-fundamentals",
            title: "Selectors, specificity and the cascade",
            summary:
              "The cascade decides which rule wins when several target the same element. Understanding specificity and inheritance prevents most 'why is my style ignored' bugs.",
            resources: [
              { label: "MDN: Cascade and inheritance", url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Cascade_and_inheritance" },
              { label: "web.dev: Learn CSS", url: "https://web.dev/learn/css" },
            ],
          },
          {
            id: "box-model",
            title: "Box model and display types",
            summary:
              "Every element is a box: content, padding, border, margin. box-sizing: border-box makes sizing predictable and is the industry default reset.",
            resources: [
              { label: "MDN: The box model", url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model" },
              { label: "Josh Comeau: Margin collapse", url: "https://www.joshwcomeau.com/css/rules-of-margin-collapse/" },
            ],
          },
          {
            id: "flexbox-grid",
            title: "Flexbox and Grid layout",
            summary:
              "Flexbox lays out items along one axis; Grid handles two-dimensional layouts. Together they replaced float hacks for every practical layout.",
            resources: [
              { label: "CSS-Tricks: A complete guide to Flexbox", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" },
              { label: "CSS-Tricks: A complete guide to Grid", url: "https://css-tricks.com/snippets/css/complete-guide-grid/" },
            ],
          },
          {
            id: "responsive-design",
            title: "Responsive design and media queries",
            summary:
              "Design mobile-first, then add breakpoints where the layout needs them — not at device widths. Relative units and fluid type scale naturally.",
            resources: [
              { label: "web.dev: Responsive design", url: "https://web.dev/learn/design" },
              { label: "MDN: Media queries", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries" },
            ],
          },
        ],
      },
      {
        id: "javascript",
        title: "JavaScript",
        intro: "The language of the browser — learn it before any framework.",
        nodes: [
          {
            id: "js-fundamentals",
            title: "Variables, types and functions",
            summary:
              "let/const, primitives vs objects, function declarations vs expressions and closures. These are the atoms every framework pattern is built from.",
            resources: [
              { label: "javascript.info: The modern JavaScript tutorial", url: "https://javascript.info/" },
              { label: "MDN: JavaScript first steps", url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps" },
            ],
            playground: {
              lang: "javascript",
              code: '// Variables, types and functions\nconst name = "DevBench";\nlet count = 3;\n\nfunction greet(who, times) {\n  return Array.from({ length: times }, (_, i) => `${i + 1}. Hello, ${who}!`);\n}\n\nconsole.log(greet(name, count).join("\\n"));\nconsole.log(typeof 42, typeof "42", typeof true);\n',
            },
          },
          {
            id: "dom-manipulation",
            title: "DOM selection and events",
            summary:
              "querySelector finds elements; addEventListener wires interaction; event delegation handles dynamic lists. Vanilla DOM skill pays off even inside frameworks.",
            resources: [
              { label: "MDN: Introduction to events", url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events" },
              { label: "javascript.info: Document", url: "https://javascript.info/document" },
            ],
          },
          {
            id: "async-javascript",
            title: "Promises, async/await and fetch",
            summary:
              "JavaScript handles long-running work asynchronously. Promises chain results, async/await flattens them, and fetch talks to APIs over HTTP.",
            resources: [
              { label: "MDN: Asynchronous JavaScript", url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous" },
              { label: "javascript.info: Promises, async/await", url: "https://javascript.info/async" },
            ],
            playground: {
              lang: "javascript",
              code: '// Promises and async/await\nconst wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));\n\nasync function main() {\n  console.log("start");\n  await wait(300);\n  console.log("300ms later");\n  const values = await Promise.all([wait(50).then(() => "a"), wait(80).then(() => "b")]);\n  console.log("parallel results:", values.join(", "));\n}\n\nmain().then(() => console.log("done"));\n',
            },
          },
          {
            id: "es-modules-and-tooling",
            title: "ES modules and npm packages",
            summary:
              "import/export split code across files; npm installs shared packages; package.json records what a project needs. Every modern build assumes this.",
            resources: [
              { label: "MDN: JavaScript modules", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules" },
              { label: "npm docs: About npm", url: "https://docs.npmjs.com/about-npm" },
            ],
          },
        ],
      },
      {
        id: "frameworks",
        title: "Frameworks and TypeScript",
        intro: "Pick one framework and go deep before sampling others.",
        nodes: [
          {
            id: "react-fundamentals",
            title: "A component framework (React recommended)",
            summary:
              "Components compose UI from state and props. Learn rendering, state and effects in one framework before comparing alternatives.",
            resources: [
              { label: "React docs (react.dev)", url: "https://react.dev/learn" },
              { label: "DevBench React roadmap", url: "/roadmaps/react" },
            ],
            internalLinks: [{ label: "Follow the React roadmap", href: "/roadmaps/react" }],
          },
          {
            id: "typescript",
            title: "TypeScript",
            summary:
              "TypeScript adds static types to JavaScript, catching whole classes of bugs at compile time. Most professional frontend codebases now expect it.",
            resources: [
              { label: "TypeScript handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
              { label: "Execute Program: TypeScript courses", url: "https://www.executeprogram.com/courses/typescript" },
            ],
          },
          {
            id: "build-tools",
            title: "Build tools (Vite and friends)",
            summary:
              "Bundlers turn modules and assets into optimized files for the browser. Vite is the common modern choice; understand dev servers vs production builds.",
            resources: [
              { label: "Vite: Why Vite", url: "https://vite.dev/guide/why.html" },
              { label: "web.dev: Publishing modern JavaScript", url: "https://web.dev/articles/publish-modern-javascript" },
            ],
          },
        ],
      },
      {
        id: "ship",
        title: "Ship and maintain",
        intro: "A frontend that never ships teaches you nothing.",
        nodes: [
          {
            id: "git-github",
            title: "Git and GitHub",
            summary:
              "Commit early, branch for features, review diffs before merging. Version control is also your undo button and collaboration channel.",
            resources: [
              { label: "Git book (free)", url: "https://git-scm.com/book/en/v2" },
              { label: "GitHub Skills", url: "https://skills.github.com/" },
            ],
            internalLinks: [{ label: "Compare changes with the Diff Checker", href: "/diff-checker" }],
          },
          {
            id: "web-performance",
            title: "Performance budgets and Core Web Vitals",
            summary:
              "LCP, INP and CLS measure real user experience. Smaller bundles, optimized images and less blocking JavaScript move all three.",
            resources: [
              { label: "web.dev: Core Web Vitals", url: "https://web.dev/articles/vitals" },
              { label: "MDN: Web performance", url: "https://developer.mozilla.org/en-US/docs/Web/Performance" },
            ],
          },
          {
            id: "frontend-testing",
            title: "Testing the UI",
            summary:
              "Unit tests cover logic, component tests cover rendering, and end-to-end tests cover critical flows. Start with the flow that would hurt most if it broke.",
            resources: [
              { label: "Testing Library: Guiding principles", url: "https://testing-library.com/docs/guiding-principles" },
              { label: "Playwright docs", url: "https://playwright.dev/docs/intro" },
            ],
          },
          {
            id: "deployment",
            title: "Deploying to the edge",
            summary:
              "Static-first platforms (Vercel, Netlify, Cloudflare Pages) build from Git and serve from a CDN. Learn custom domains, env vars and previews.",
            resources: [
              { label: "Vercel docs: Deployments", url: "https://vercel.com/docs/deployments" },
              { label: "Netlify docs: Get started", url: "https://docs.netlify.com/get-started/" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "backend",
    title: "Backend Developer",
    kind: "role",
    tagline: "APIs, databases and the systems behind the UI",
    description:
      "A path through server-side development: one language done well, HTTP and REST APIs, databases and caching, then the reliability work that keeps services up.",
    estimate: "5-7 months part-time",
    communityUrl: "https://roadmap.sh/backend",
    sections: [
      {
        id: "language",
        title: "One language, done well",
        intro: "Depth in one server language beats surface knowledge of five.",
        nodes: [
          {
            id: "pick-a-language",
            title: "Choose a primary language",
            summary:
              "Node.js, Python, Go and Java all power large backends. Pick the one closest to your goal and stay with it for the whole roadmap.",
            resources: [
              { label: "Node.js: Learn", url: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs" },
              { label: "Python: Beginner's guide", url: "https://wiki.python.org/moin/BeginnersGuide" },
            ],
            playground: {
              lang: "python",
              code: '# A tiny taste of server-side logic in Python\ndef discount(price, tier):\n    tiers = {"gold": 0.2, "silver": 0.1}\n    return round(price * (1 - tiers.get(tier, 0)), 2)\n\nfor tier in ["gold", "silver", "guest"]:\n    print(tier, "->", discount(999, tier))\n',
            },
          },
          {
            id: "runtime-and-process-model",
            title: "Runtime and process model",
            summary:
              "Know how your runtime executes code: the Node event loop, Python's GIL, Go's goroutines. Concurrency models decide how your service behaves under load.",
            resources: [
              { label: "Node.js: Event loop guide", url: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick" },
              { label: "Go: A tour of Go", url: "https://go.dev/tour/welcome/1" },
            ],
          },
          {
            id: "package-management",
            title: "Packages and dependency hygiene",
            summary:
              "Lockfiles make builds reproducible; audits catch vulnerable dependencies. Review what you add — every dependency is code you ship.",
            resources: [
              { label: "npm docs: package-lock.json", url: "https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json" },
              { label: "OpenSSF: Concise guide for dependencies", url: "https://best.openssf.org/Concise-Guide-for-Developing-More-Secure-Software" },
            ],
          },
          {
            id: "environment-config",
            title: "Configuration and secrets",
            summary:
              "Twelve-factor apps keep config in environment variables and secrets out of code. Leaked credentials in Git history are a top real-world breach cause.",
            resources: [
              { label: "The Twelve-Factor App", url: "https://12factor.net/" },
              { label: "OWASP: Secrets management cheat sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html" },
            ],
          },
        ],
      },
      {
        id: "apis",
        title: "HTTP and APIs",
        intro: "APIs are the contract between your server and everything else.",
        nodes: [
          {
            id: "rest-apis",
            title: "Designing REST APIs",
            summary:
              "Resources, nouns not verbs, correct status codes, pagination and versioning. A boring, predictable API is a good API.",
            resources: [
              { label: "REST API tutorial", url: "https://restfulapi.net/" },
              { label: "Microsoft: Web API design best practices", url: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design" },
            ],
            tools: ["json-formatter"],
            internalLinks: [{ label: "Test endpoints with the API Tester", href: "/api-tester" }],
          },
          {
            id: "authentication",
            title: "Auth: sessions, tokens and JWTs",
            summary:
              "Sessions store state server-side; bearer tokens (often JWTs) carry signed claims. Know expiry, refresh flows and where tokens can leak.",
            resources: [
              { label: "JWT introduction", url: "https://jwt.io/introduction" },
              { label: "OWASP: Authentication cheat sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html" },
            ],
            tools: ["jwt-debugger", "base64-encode"],
          },
          {
            id: "webhooks-and-events",
            title: "Webhooks and signed payloads",
            summary:
              "Webhooks push events to your server instead of polling. Always verify HMAC signatures so attackers can't forge events from providers.",
            resources: [
              { label: "Webhook.site: test webhooks", url: "https://webhook.site/" },
              { label: "Stripe: Webhook signatures", url: "https://docs.stripe.com/webhooks/signature" },
            ],
            tools: ["webhook-simulator", "hash-generator"],
          },
        ],
      },
      {
        id: "data",
        title: "Databases and caching",
        intro: "Most backend bugs are data bugs.",
        nodes: [
          {
            id: "relational-databases",
            title: "Relational databases and SQL",
            summary:
              "PostgreSQL and MySQL model data as tables with relationships. SQL remains the highest-leverage query language you can learn.",
            resources: [
              { label: "PostgreSQL tutorial", url: "https://www.postgresql.org/docs/current/tutorial.html" },
              { label: "SQLBolt interactive lessons", url: "https://sqlbolt.com/" },
            ],
            internalLinks: [{ label: "Follow the SQL roadmap", href: "/roadmaps/sql" }],
          },
          {
            id: "nosql",
            title: "NoSQL and when to use it",
            summary:
              "Document stores, key-value stores and wide-column databases trade joins and transactions for scale or flexibility. Choose per workload, not hype.",
            resources: [
              { label: "MongoDB: What is NoSQL", url: "https://www.mongodb.com/nosql-explained" },
              { label: "AWS: What is a NoSQL database", url: "https://aws.amazon.com/nosql/" },
            ],
          },
          {
            id: "caching",
            title: "Caching with Redis and friends",
            summary:
              "Cache expensive reads, invalidate deliberately, and set TTLs. A cache with no expiry policy is a future incident.",
            resources: [
              { label: "Redis: Caching patterns", url: "https://redis.io/learn/howtos/solutions/caching-architecture" },
              { label: "AWS: Caching overview", url: "https://aws.amazon.com/caching/" },
            ],
          },
          {
            id: "indexes-and-queries",
            title: "Indexes and slow queries",
            summary:
              "Indexes make lookups fast and writes slightly slower; EXPLAIN shows what the database actually does. Learn to read a query plan before reaching for more hardware.",
            resources: [
              { label: "Use The Index, Luke (free)", url: "https://use-the-index-luke.com/" },
              { label: "PostgreSQL: EXPLAIN", url: "https://www.postgresql.org/docs/current/using-explain.html" },
            ],
          },
        ],
      },
      {
        id: "reliability",
        title: "Reliability and scale",
        intro: "What separates a project from a service.",
        nodes: [
          {
            id: "linux-for-backend",
            title: "Linux and the command line",
            summary:
              "Your servers run Linux. Reading logs, checking processes and editing files over SSH are daily survival skills.",
            resources: [
              { label: "linuxjourney.com (free)", url: "https://linuxjourney.com/" },
              { label: "DevBench Linux cheat sheet", url: "/linux-cheatsheet" },
            ],
            tools: ["linux-cheatsheet"],
            internalLinks: [{ label: "Open the Linux cheat sheet", href: "/linux-cheatsheet" }],
          },
          {
            id: "testing-backend",
            title: "Testing services",
            summary:
              "Unit tests for logic, integration tests for the database and API layer, contract tests between services. Test behavior, not implementation.",
            resources: [
              { label: "Martin Fowler: The practical test pyramid", url: "https://martinfowler.com/articles/practical-test-pyramid.html" },
              { label: "Playwright API testing", url: "https://playwright.dev/docs/api-testing" },
            ],
          },
          {
            id: "observability",
            title: "Logs, metrics and tracing",
            summary:
              "Structured logs tell you what happened, metrics tell you how much, traces tell you where time went. You can't fix what you can't see.",
            resources: [
              { label: "OpenTelemetry: Observability primer", url: "https://opentelemetry.io/docs/concepts/observability-primer/" },
              { label: "Grafana: Observability basics", url: "https://grafana.com/docs/grafana/latest/fundamentals/observability-basics/" },
            ],
          },
          {
            id: "security-hardening",
            title: "Security basics for APIs",
            summary:
              "Validate input, parameterize queries, rate-limit public endpoints and keep dependencies patched. OWASP's API Top 10 lists the attacks that actually happen.",
            resources: [
              { label: "OWASP: API Security Top 10", url: "https://owasp.org/API-Security/editions/2023/en/0x11-t10/" },
              { label: "OWASP: Cheat Sheet Series", url: "https://cheatsheetseries.owasp.org/" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "devops",
    title: "DevOps Engineer",
    kind: "role",
    tagline: "Automate the path from commit to production",
    description:
      "From Linux and scripting fundamentals through CI/CD, containers, infrastructure as code and the observability practices that keep deployments boring.",
    estimate: "6-8 months part-time",
    communityUrl: "https://roadmap.sh/devops",
    sections: [
      {
        id: "foundations",
        title: "Foundations",
        intro: "DevOps without Linux and networking basics is guesswork.",
        nodes: [
          {
            id: "linux-administration",
            title: "Linux administration",
            summary:
              "Users and permissions, systemd services, log files and package managers. You will operate what you automate, so operate it manually first.",
            resources: [
              { label: "linuxjourney.com (free)", url: "https://linuxjourney.com/" },
              { label: "Debian: Administrator's handbook", url: "https://debian-handbook.info/browse/stable/" },
            ],
            tools: ["linux-cheatsheet"],
          },
          {
            id: "networking-fundamentals",
            title: "Networking: DNS, TCP/IP, TLS",
            summary:
              "Ports, subnets, DNS records and TLS certificates explain most 'can't connect' failures. Learn curl and dig until they feel like second nature.",
            resources: [
              { label: "Cloudflare Learning Center", url: "https://www.cloudflare.com/learning/" },
              { label: "Julia Evans: Networking zines", url: "https://jvns.ca/#networking" },
            ],
          },
          {
            id: "scripting",
            title: "Scripting with Bash and Python",
            summary:
              "Automate repetitive shell work with Bash; reach for Python when the script needs structure, parsing or error handling.",
            resources: [
              { label: "Bash guide (Google)", url: "https://google.github.io/styleguide/shellguide.html" },
              { label: "Automate the Boring Stuff with Python", url: "https://automatetheboringstuff.com/" },
            ],
            playground: {
              lang: "python",
              code: '# Parse a log line like you would in a real script\nline = \'2026-11-18 12:01 ERROR db connection failed (retry 3)\'\n\ndate, time, level, *rest = line.split(" ")\nprint({"date": date, "time": time, "level": level, "message": " ".join(rest)})\n',
            },
          },
          {
            id: "git-workflows",
            title: "Git workflows and code review",
            summary:
              "Trunk-based development with short-lived branches and pull requests is the industry default. Small diffs review faster and break less.",
            resources: [
              { label: "GitHub flow guide", url: "https://docs.github.com/en/get-started/using-github/github-flow" },
              { label: "Trunk Based Development", url: "https://trunkbaseddevelopment.com/" },
            ],
            internalLinks: [{ label: "Compare changes with the Diff Checker", href: "/diff-checker" }],
          },
        ],
      },
      {
        id: "cicd",
        title: "CI/CD",
        intro: "Every commit gets built, tested and packaged — automatically.",
        nodes: [
          {
            id: "ci-concepts",
            title: "Continuous integration habits",
            summary:
              "Merge small and often, keep the build green, and fail fast with lint, type checks and tests on every push. CI is a habit before it is a tool.",
            resources: [
              { label: "Martin Fowler: Continuous Integration", url: "https://martinfowler.com/articles/continuousIntegration.html" },
              { label: "Atlassian: CI/CD overview", url: "https://www.atlassian.com/continuous-delivery" },
            ],
          },
          {
            id: "github-actions",
            title: "GitHub Actions pipelines",
            summary:
              "Workflows are YAML files triggered by pushes, pulls and schedules. Cache dependencies and split jobs so feedback stays fast.",
            resources: [
              { label: "GitHub Actions docs", url: "https://docs.github.com/en/actions" },
              { label: "GitHub Actions quickstart", url: "https://docs.github.com/en/actions/get-started/quickstart" },
            ],
            tools: ["yaml-formatter"],
          },
          {
            id: "artifacts-and-versioning",
            title: "Artifacts and semantic versioning",
            summary:
              "Build once, deploy the same artifact everywhere. Semantic versions communicate breaking vs safe changes to everyone downstream.",
            resources: [
              { label: "Semantic Versioning 2.0.0", url: "https://semver.org/" },
              { label: "Keep a Changelog", url: "https://keepachangelog.com/" },
            ],
          },
        ],
      },
      {
        id: "containers",
        title: "Containers",
        intro: "Package once, run anywhere the same way.",
        nodes: [
          {
            id: "docker-fundamentals",
            title: "Docker images and containers",
            summary:
              "Dockerfiles describe images; layers make builds fast; small base images shrink attack surface. Learn build, run, exec and logs before orchestration.",
            resources: [
              { label: "Docker: Get started guide", url: "https://docs.docker.com/get-started/" },
              { label: "Dockerfile best practices", url: "https://docs.docker.com/build/building/best-practices/" },
            ],
          },
          {
            id: "kubernetes-basics",
            title: "Kubernetes basics",
            summary:
              "Pods, Deployments, Services and ConfigMaps run containers across a cluster. Learn it on a local kind cluster before touching production.",
            resources: [
              { label: "Kubernetes: Learn basics", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/" },
              { label: "kind: local Kubernetes", url: "https://kind.sigs.k8s.io/" },
            ],
          },
          {
            id: "container-security",
            title: "Container security",
            summary:
              "Run as non-root, scan images for known vulnerabilities, and pin digests. Most container compromises come from misconfiguration, not zero-days.",
            resources: [
              { label: "Docker: Security best practices", url: "https://docs.docker.com/engine/security/" },
              { label: "OWASP: Docker security cheat sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html" },
            ],
          },
        ],
      },
      {
        id: "infra",
        title: "Cloud and infrastructure as code",
        intro: "Servers you can rebuild from a Git repo.",
        nodes: [
          {
            id: "cloud-fundamentals",
            title: "Cloud provider fundamentals",
            summary:
              "Compute, storage, identity and networking are the four pillars on AWS, GCP or Azure. Pick one provider and learn it properly before multi-cloud talk.",
            resources: [
              { label: "AWS: Getting started", url: "https://aws.amazon.com/getting-started/" },
              { label: "Google Cloud: Fundamentals", url: "https://cloud.google.com/docs/get-started" },
            ],
          },
          {
            id: "terraform",
            title: "Terraform and IaC",
            summary:
              "Terraform declares infrastructure in HCL and plans changes before applying them. State files are the source of truth — protect them.",
            resources: [
              { label: "Terraform: Get started", url: "https://developer.hashicorp.com/terraform/tutorials/aws-get-started" },
              { label: "Terraform: Language docs", url: "https://developer.hashicorp.com/terraform/language" },
            ],
          },
          {
            id: "serverless",
            title: "Serverless functions",
            summary:
              "Functions like AWS Lambda run code per event with no server management. Great for glue work; know cold starts and per-invocation pricing.",
            resources: [
              { label: "AWS Lambda: Getting started", url: "https://docs.aws.amazon.com/lambda/latest/dg/getting-started.html" },
              { label: "DevBench Lambda Sandbox", url: "/lambda-sandbox" },
            ],
            tools: ["lambda-sandbox"],
          },
        ],
      },
      {
        id: "operations",
        title: "Operations",
        intro: "Running things well is the actual job.",
        nodes: [
          {
            id: "monitoring-and-logging",
            title: "Monitoring, logs and alerts",
            summary:
              "Collect metrics and logs centrally, alert on symptoms users feel (error rate, latency), not every blip. Alert fatigue hides real incidents.",
            resources: [
              { label: "Google SRE book: Monitoring distributed systems", url: "https://sre.google/sre-book/monitoring-distributed-systems/" },
              { label: "Prometheus: Overview", url: "https://prometheus.io/docs/introduction/overview/" },
            ],
          },
          {
            id: "incident-response",
            title: "Incident response and postmortems",
            summary:
              "Declare incidents early, communicate in one place, and write blameless postmortems that fix systems rather than blame people.",
            resources: [
              { label: "Google SRE book: Managing incidents", url: "https://sre.google/sre-book/managing-incidents/" },
              { label: "PagerDuty: Postmortems guide", url: "https://postmortems.pagerduty.com/" },
            ],
          },
          {
            id: "cost-and-capacity",
            title: "Cost and capacity awareness",
            summary:
              "Autoscaling, right-sizing and budget alerts keep bills sane. The cheapest architecture is the one you understand well enough to predict.",
            resources: [
              { label: "AWS: Cost optimization pillar", url: "https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html" },
              { label: "FinOps Foundation: What is FinOps", url: "https://www.finops.org/introduction/what-is-finops/" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "python",
    title: "Python",
    kind: "skill",
    tagline: "From first script to automation, APIs and data",
    description:
      "A practical Python path: core syntax and data structures, the standard library, packaging and testing, then the tracks (web, automation, data) Python is famous for.",
    estimate: "3-4 months part-time",
    communityUrl: "https://roadmap.sh/python",
    sections: [
      {
        id: "core",
        title: "Core language",
        intro: "Write small programs from day one.",
        nodes: [
          {
            id: "syntax-and-types",
            title: "Syntax, numbers and strings",
            summary:
              "Indentation defines blocks; strings and numbers cover most beginner programs. f-strings and slicing are everyday Python you'll never stop using.",
            resources: [
              { label: "Python tutorial (official)", url: "https://docs.python.org/3/tutorial/" },
              { label: "Real Python: Basics", url: "https://realpython.com/python-basics/" },
            ],
            playground: {
              lang: "python",
              code: '# Strings, numbers and f-strings\nname = "DevBench"\nprice = 499.9\nprint(f"{name} — price: {price:.2f}")\nprint(name.upper(), name[::-1])\nprint(7 / 2, 7 // 2, 2 ** 10)\n',
            },
          },
          {
            id: "control-flow",
            title: "Conditions and loops",
            summary:
              "if/elif/else, for loops over iterables, and while with a clear exit. Python's for loop iterates items directly — no index juggling needed.",
            resources: [
              { label: "Python docs: Control flow", url: "https://docs.python.org/3/tutorial/controlflow.html" },
              { label: "W3Schools: Python loops", url: "https://www.w3schools.com/python/python_for_loops.asp" },
            ],
            playground: {
              lang: "python",
              code: '# FizzBuzz — the classic loop exercise\nfor n in range(1, 21):\n    if n % 15 == 0:\n        print("FizzBuzz")\n    elif n % 3 == 0:\n        print("Fizz")\n    elif n % 5 == 0:\n        print("Buzz")\n    else:\n        print(n)\n',
            },
          },
          {
            id: "functions-and-modules",
            title: "Functions and modules",
            summary:
              "def, default and keyword arguments, and organizing code into modules with import. Small pure functions are the unit of testable Python.",
            resources: [
              { label: "Python docs: Defining functions", url: "https://docs.python.org/3/tutorial/controlflow.html#defining-functions" },
              { label: "Python docs: Modules", url: "https://docs.python.org/3/tutorial/modules.html" },
            ],
          },
          {
            id: "errors-and-exceptions",
            title: "Errors and exceptions",
            summary:
              "try/except handles expected failures; raise signals your own. Catch specific exceptions, not bare 'except:', or you'll hide real bugs.",
            resources: [
              { label: "Python docs: Errors and exceptions", url: "https://docs.python.org/3/tutorial/errors.html" },
              { label: "Real Python: try/except", url: "https://realpython.com/python-exceptions/" },
            ],
          },
        ],
      },
      {
        id: "data-structures",
        title: "Data structures and the standard library",
        intro: "Lists, dicts and comprehensions are 80% of daily Python.",
        nodes: [
          {
            id: "lists-dicts-sets",
            title: "Lists, dicts, sets and tuples",
            summary:
              "Lists are ordered and mutable, dicts map keys to values, sets deduplicate, tuples are fixed records. Choosing the right one simplifies everything downstream.",
            resources: [
              { label: "Python docs: Data structures", url: "https://docs.python.org/3/tutorial/datastructures.html" },
              { label: "Real Python: Dictionaries", url: "https://realpython.com/python-dicts/" },
            ],
          },
          {
            id: "comprehensions",
            title: "Comprehensions and generators",
            summary:
              "List and dict comprehensions build collections in one readable line; generators produce values lazily for big or endless sequences.",
            resources: [
              { label: "Real Python: List comprehensions", url: "https://realpython.com/list-comprehension-python/" },
              { label: "Python docs: Generators", url: "https://docs.python.org/3/tutorial/classes.html#generators" },
            ],
            playground: {
              lang: "python",
              code: '# Comprehensions vs loops\nsquares = [n * n for n in range(10)]\nevens = {n for n in range(20) if n % 2 == 0}\nlookup = {c: ord(c) for c in "bench"}\nprint(squares)\nprint(sorted(evens))\nprint(lookup)\n',
            },
          },
          {
            id: "files-and-json",
            title: "Files, JSON and CSV",
            summary:
              "'with open(...)' handles closing for you; the json and csv modules parse the two formats every API and spreadsheet speaks.",
            resources: [
              { label: "Python docs: Reading and writing files", url: "https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files" },
              { label: "Python docs: json module", url: "https://docs.python.org/3/library/json.html" },
            ],
            tools: ["json-formatter", "csv-to-json"],
          },
          {
            id: "datetime-and-time",
            title: "Dates, times and timezones",
            summary:
              "datetime handles calendar math; prefer timezone-aware objects and ISO strings. Timestamp bugs are the classic international-app failure.",
            resources: [
              { label: "Python docs: datetime", url: "https://docs.python.org/3/library/datetime.html" },
              { label: "Real Python: datetime", url: "https://realpython.com/python-datetime/" },
            ],
            tools: ["epoch"],
          },
        ],
      },
      {
        id: "ecosystem",
        title: "Tooling and ecosystem",
        intro: "Professional habits: environments, packages, tests.",
        nodes: [
          {
            id: "pip-and-venvs",
            title: "pip, virtual environments and uv",
            summary:
              "Virtual environments isolate each project's dependencies; pip installs them; uv does the same jobs much faster. Never install into system Python.",
            resources: [
              { label: "Python packaging user guide", url: "https://packaging.python.org/en/latest/tutorials/installing-packages/" },
              { label: "uv: Python package manager", url: "https://docs.astral.sh/uv/" },
            ],
          },
          {
            id: "testing-pytest",
            title: "Testing with pytest",
            summary:
              "Functions starting with test_ run as tests; assert checks behavior; fixtures set up state. A small test suite turns refactors from scary to routine.",
            resources: [
              { label: "pytest: Getting started", url: "https://docs.pytest.org/en/stable/getting-started.html" },
              { label: "Real Python: pytest", url: "https://realpython.com/pytest-python-testing/" },
            ],
          },
          {
            id: "typing-and-lint",
            title: "Type hints, ruff and formatting",
            summary:
              "Type hints document intent and let checkers catch mistakes; ruff lints and formats in one fast pass. Run them in CI like any other test.",
            resources: [
              { label: "Python docs: typing", url: "https://docs.python.org/3/library/typing.html" },
              { label: "ruff: Linter and formatter", url: "https://docs.astral.sh/ruff/" },
            ],
          },
        ],
      },
      {
        id: "tracks",
        title: "Pick a track",
        intro: "Python is a means — choose what you want to build with it.",
        nodes: [
          {
            id: "web-apis",
            title: "Web APIs with FastAPI or Django",
            summary:
              "FastAPI builds typed JSON APIs quickly; Django ships a full-stack framework with auth and an admin. Both are production-proven.",
            resources: [
              { label: "FastAPI: Tutorial", url: "https://fastapi.tiangolo.com/tutorial/" },
              { label: "Django: Getting started", url: "https://docs.djangoproject.com/en/stable/intro/tutorial01/" },
            ],
            internalLinks: [{ label: "Follow the Backend roadmap", href: "/roadmaps/backend" }],
          },
          {
            id: "automation",
            title: "Automation and scripting",
            summary:
              "Rename files, scrape pages, fill spreadsheets, send reports. Automation scripts give the fastest visible return on learning Python.",
            resources: [
              { label: "Automate the Boring Stuff (free book)", url: "https://automatetheboringstuff.com/" },
              { label: "requests: HTTP for humans", url: "https://requests.readthedocs.io/" },
            ],
            playground: {
              lang: "python",
              code: '# Automation-flavored exercise: normalize a messy CSV column\nrows = ["Sai , Developer", " puneet,TESTER", "alex , designer"]\n\nparsed = [tuple(part.strip().title() for part in row.split(",")) for row in rows]\nfor name, role in parsed:\n    print(f"{name:<10} -> {role}")\n',
            },
          },
          {
            id: "data-analysis",
            title: "Data analysis with pandas",
            summary:
              "pandas DataFrames load CSVs and APIs into tables you can filter, join and aggregate. Add matplotlib when you need pictures of the numbers.",
            resources: [
              { label: "pandas: 10 minutes to pandas", url: "https://pandas.pydata.org/docs/user_guide/10min.html" },
              { label: "Kaggle: Free data courses", url: "https://www.kaggle.com/learn" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "react",
    title: "React",
    kind: "skill",
    tagline: "Components, hooks and the ecosystem around them",
    description:
      "A React path from JSX and components through hooks and state to routing, data fetching, performance and production frameworks like Next.js.",
    estimate: "2-3 months part-time (after JavaScript)",
    communityUrl: "https://roadmap.sh/react",
    sections: [
      {
        id: "fundamentals",
        title: "Fundamentals",
        intro: "React is JavaScript first — these prerequisites pay off.",
        nodes: [
          {
            id: "modern-javascript",
            title: "Modern JavaScript for React",
            summary:
              "Arrow functions, destructuring, spread, array map/filter and template literals appear in every React file. Be fluent here first.",
            resources: [
              { label: "javascript.info: The modern tutorial", url: "https://javascript.info/" },
              { label: "MDN: JavaScript reference", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference" },
            ],
            playground: {
              lang: "javascript",
              code: '// The array methods React uses constantly\nconst users = [\n  { id: 1, name: "Sai", active: true },\n  { id: 2, name: "Puneet", active: false },\n  { id: 3, name: "Alex", active: true },\n];\n\nconsole.log(users.map((u) => u.name));           // list rendering\nconsole.log(users.filter((u) => u.active));       // conditional lists\nconst { name, ...rest } = users[0];               // destructuring + spread\nconsole.log(name, rest);\n',
            },
          },
          {
            id: "jsx",
            title: "JSX and rendering",
            summary:
              "JSX is JavaScript that looks like HTML: expressions in braces, one parent per return, className not class. React re-renders when state changes.",
            resources: [
              { label: "React docs: Writing markup with JSX", url: "https://react.dev/learn/writing-markup-with-jsx" },
              { label: "React docs: Rendering lists", url: "https://react.dev/learn/rendering-lists" },
            ],
          },
          {
            id: "components-and-props",
            title: "Components and props",
            summary:
              "Components are functions that return UI; props are their inputs. Small, well-named components with clear props are the whole design skill.",
            resources: [
              { label: "React docs: Your first component", url: "https://react.dev/learn/your-first-component" },
              { label: "React docs: Passing props", url: "https://react.dev/learn/passing-props-to-a-component" },
            ],
          },
        ],
      },
      {
        id: "state-hooks",
        title: "State and hooks",
        intro: "Hooks are how function components remember and react.",
        nodes: [
          {
            id: "usestate",
            title: "useState and controlled inputs",
            summary:
              "useState gives a component memory; updating state re-renders. Controlled inputs bind form fields to state and are the standard form pattern.",
            resources: [
              { label: "React docs: State — a component's memory", url: "https://react.dev/learn/state-a-components-memory" },
              { label: "React docs: Sharing state between components", url: "https://react.dev/learn/sharing-state-between-components" },
            ],
          },
          {
            id: "useeffect",
            title: "useEffect and the dependency array",
            summary:
              "Effects synchronize with external systems: fetching, subscriptions, timers. Most useEffect bugs come from missing or wrong dependencies.",
            resources: [
              { label: "React docs: Synchronizing with effects", url: "https://react.dev/learn/synchronizing-with-effects" },
              { label: "React docs: You might not need an effect", url: "https://react.dev/learn/you-might-not-need-an-effect" },
            ],
          },
          {
            id: "custom-hooks",
            title: "Custom hooks and reuse",
            summary:
              "Any logic shared between components can move into a useSomething function. Custom hooks share behavior without wrapper components.",
            resources: [
              { label: "React docs: Reusing logic with custom hooks", url: "https://react.dev/learn/reusing-logic-with-custom-hooks" },
              { label: "usehooks.com: Common hooks", url: "https://usehooks.com/" },
            ],
          },
          {
            id: "state-management",
            title: "Lifting state vs context vs stores",
            summary:
              "Lift state to the closest common parent first; context avoids prop drilling for stable values; external stores fit complex client state. Reach for Redux last, not first.",
            resources: [
              { label: "React docs: Managing state", url: "https://react.dev/learn/managing-state" },
              { label: "React docs: Passing data deeply with context", url: "https://react.dev/learn/passing-data-deeply-with-context" },
            ],
          },
        ],
      },
      {
        id: "ecosystem",
        title: "Ecosystem",
        intro: "Routing, data and styling are the three choices every app makes.",
        nodes: [
          {
            id: "routing",
            title: "Client-side routing",
            summary:
              "React Router maps URLs to components with nested layouts; in Next.js, the filesystem is the router. Learn params, links and redirects either way.",
            resources: [
              { label: "React Router: Getting started", url: "https://reactrouter.com/start/library/installation" },
              { label: "Next.js: Routing fundamentals", url: "https://nextjs.org/docs/app/getting-started/linking-and-navigating" },
            ],
          },
          {
            id: "data-fetching",
            title: "Data fetching and caching",
            summary:
              "TanStack Query (React Query) handles loading, error, caching and refetching so you don't hand-roll it in effects. Server state is not client state.",
            resources: [
              { label: "TanStack Query: Overview", url: "https://tanstack.com/query/latest/docs/framework/react/overview" },
              { label: "React docs: Fetching data (frameworks)", url: "https://react.dev/reference/react/use#fetching-data" },
            ],
          },
          {
            id: "styling",
            title: "Styling approaches",
            summary:
              "Tailwind, CSS modules and plain CSS all work; consistency matters more than the choice. Learn enough CSS to debug your framework's output.",
            resources: [
              { label: "Tailwind CSS docs", url: "https://tailwindcss.com/docs" },
              { label: "MDN: CSS", url: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
            ],
          },
        ],
      },
      {
        id: "production",
        title: "Production React",
        intro: "What interviewers and users actually notice.",
        nodes: [
          {
            id: "performance",
            title: "Performance: memoization and code splitting",
            summary:
              "Measure first. React.memo, useMemo and useCallback help only with real re-render costs; dynamic import() shrinks the first load.",
            resources: [
              { label: "React docs: Render and commit", url: "https://react.dev/learn/render-and-commit" },
              { label: "web.dev: Code splitting with React.lazy", url: "https://web.dev/articles/code-splitting-suspense" },
            ],
          },
          {
            id: "testing-react",
            title: "Testing components",
            summary:
              "React Testing Library tests components the way users interact with them: find by role and text, fire events, assert on the DOM.",
            resources: [
              { label: "Testing Library: React", url: "https://testing-library.com/docs/react-testing-library/intro/" },
              { label: "Vitest docs", url: "https://vitest.dev/guide/" },
            ],
          },
          {
            id: "nextjs",
            title: "Next.js and server components",
            summary:
              "Next.js adds routing, server-side rendering and server components to React. DevBench itself is a Next.js app — reading its source is fair game.",
            resources: [
              { label: "Next.js docs", url: "https://nextjs.org/docs" },
              { label: "React docs: Server components", url: "https://react.dev/reference/rsc/server-components" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "sql",
    title: "SQL and Databases",
    kind: "skill",
    tagline: "Query, model and tune relational data",
    description:
      "SQL from first SELECT through joins, aggregation, schema design, indexes, transactions and query tuning — the skill behind almost every backend job.",
    estimate: "1-2 months part-time",
    communityUrl: "https://roadmap.sh/sql",
    sections: [
      {
        id: "fundamentals",
        title: "Query fundamentals",
        intro: "Read data confidently before changing any.",
        nodes: [
          {
            id: "relational-model",
            title: "Tables, rows and relationships",
            summary:
              "Relational databases store rows in tables linked by keys. Normalization removes duplication so each fact lives in exactly one place.",
            resources: [
              { label: "SQLBolt: Introduction", url: "https://sqlbolt.com/lesson/introduction" },
              { label: "PostgreSQL tutorial: Concepts", url: "https://www.postgresql.org/docs/current/tutorial-concepts.html" },
            ],
          },
          {
            id: "select-filtering",
            title: "SELECT, WHERE and filtering",
            summary:
              "SELECT picks columns, WHERE picks rows, and operators like IN, BETWEEN and LIKE handle patterns. This is the query shape you'll use hourly.",
            resources: [
              { label: "SQLBolt: SELECT queries", url: "https://sqlbolt.com/lesson/select_queries_introduction" },
              { label: "Mode SQL tutorial", url: "https://mode.com/sql-tutorial/" },
            ],
          },
          {
            id: "sorting-and-limiting",
            title: "ORDER BY, LIMIT and pagination",
            summary:
              "Sorting without an index scans the whole table; LIMIT caps results; keyset pagination scales better than OFFSET on big tables.",
            resources: [
              { label: "Use The Index, Luke: Paging results", url: "https://use-the-index-luke.com/no-offset" },
              { label: "PostgreSQL: LIMIT and OFFSET", url: "https://www.postgresql.org/docs/current/queries-limit.html" },
            ],
          },
        ],
      },
      {
        id: "joins-aggregation",
        title: "Joins and aggregation",
        intro: "Real answers live across tables.",
        nodes: [
          {
            id: "joins",
            title: "INNER, LEFT and FULL joins",
            summary:
              "Joins combine tables on keys. Knowing when a LEFT join preserves unmatched rows — and when a join multiplies rows — prevents the classic wrong-count bug.",
            resources: [
              { label: "SQLBolt: Queries with constraints (joins)", url: "https://sqlbolt.com/lesson/select_queries_with_joins" },
              { label: "PostgreSQL: Joins", url: "https://www.postgresql.org/docs/current/tutorial-join.html" },
            ],
          },
          {
            id: "group-by",
            title: "GROUP BY and aggregate functions",
            summary:
              "COUNT, SUM, AVG, MIN and MAX collapse rows into summaries; HAVING filters after grouping. Remember: WHERE filters rows, HAVING filters groups.",
            resources: [
              { label: "SQLBolt: Aggregates", url: "https://sqlbolt.com/lesson/aggregate_functions" },
              { label: "PostgreSQL: Aggregate functions", url: "https://www.postgresql.org/docs/current/functions-aggregate.html" },
            ],
          },
          {
            id: "subqueries-ctes",
            title: "Subqueries and CTEs",
            summary:
              "Common table expressions (WITH ... AS) name intermediate results so complex logic reads top-to-bottom. Prefer them over deeply nested subqueries.",
            resources: [
              { label: "PostgreSQL: WITH queries", url: "https://www.postgresql.org/docs/current/queries-with.html" },
              { label: "Mode: Subqueries", url: "https://mode.com/sql-tutorial/sql-sub-queries/" },
            ],
          },
        ],
      },
      {
        id: "modeling",
        title: "Modeling and integrity",
        intro: "Good schemas make bad states impossible.",
        nodes: [
          {
            id: "schema-design",
            title: "Designing tables and keys",
            summary:
              "Pick stable primary keys, choose types that fit the data, and use foreign keys to enforce relationships. Changing types later is the expensive version.",
            resources: [
              { label: "PostgreSQL: Data definition", url: "https://www.postgresql.org/docs/current/ddl.html" },
              { label: "Use The Index, Luke: Data types", url: "https://use-the-index-luke.com/sql/anatomy" },
            ],
          },
          {
            id: "constraints",
            title: "Constraints: NOT NULL, UNIQUE, CHECK",
            summary:
              "Constraints make the database enforce your rules even when application code has bugs. NULL semantics trip everyone — learn them early.",
            resources: [
              { label: "PostgreSQL: Constraints", url: "https://www.postgresql.org/docs/current/ddl-constraints.html" },
              { label: "SQLBolt: Altering tables", url: "https://sqlbolt.com/lesson/altering_tables" },
            ],
          },
          {
            id: "indexes",
            title: "Indexes and how lookups work",
            summary:
              "A B-tree index turns table scans into direct lookups at a small write cost. Index the columns you filter and join on, then verify with EXPLAIN.",
            resources: [
              { label: "Use The Index, Luke (free book)", url: "https://use-the-index-luke.com/" },
              { label: "PostgreSQL: Indexes", url: "https://www.postgresql.org/docs/current/indexes.html" },
            ],
          },
        ],
      },
      {
        id: "advanced",
        title: "Advanced SQL",
        intro: "The features that separate analysts from copy-pasters.",
        nodes: [
          {
            id: "window-functions",
            title: "Window functions",
            summary:
              "OVER(), PARTITION BY and ROW_NUMBER compute rankings and running totals without collapsing rows. They answer 'per group, keep detail' questions elegantly.",
            resources: [
              { label: "PostgreSQL: Window functions", url: "https://www.postgresql.org/docs/current/tutorial-window.html" },
              { label: "Mode: SQL window functions", url: "https://mode.com/sql-tutorial/sql-window-functions/" },
            ],
          },
          {
            id: "transactions",
            title: "Transactions and isolation",
            summary:
              "BEGIN/COMMIT/ROLLBACK bundle changes into all-or-nothing units; isolation levels trade consistency for concurrency. Money-moving code lives here.",
            resources: [
              { label: "PostgreSQL: Transactions", url: "https://www.postgresql.org/docs/current/tutorial-transactions.html" },
              { label: "Martin Kleppmann: Hermitage (isolation levels)", url: "https://github.com/ept/hermitage" },
            ],
          },
          {
            id: "query-optimization",
            title: "Reading query plans",
            summary:
              "EXPLAIN ANALYZE shows the real plan: scans, joins, row estimates, timing. Fix the biggest node first; most wins come from one index or a rewritten join.",
            resources: [
              { label: "PostgreSQL: Using EXPLAIN", url: "https://www.postgresql.org/docs/current/using-explain.html" },
              { label: "explain.depesz.com: Plan visualizer", url: "https://explain.depesz.com/" },
            ],
          },
        ],
      },
    ],
  },
];

export function getRoadmap(slug: string): Roadmap | undefined {
  return ROADMAPS.find((r) => r.slug === slug);
}

export function countRoadmapNodes(roadmap: Roadmap): number {
  return roadmap.sections.reduce((sum, s) => sum + s.nodes.length, 0);
}

export function roadmapProgressPercent(doneCount: number, totalCount: number): number {
  if (totalCount <= 0) return 0;
  return Math.round((doneCount / totalCount) * 100);
}

/** All node ids across every roadmap — used to validate stored progress. */
export function allNodeIds(roadmap: Roadmap): string[] {
  return roadmap.sections.flatMap((s) => s.nodes.map((n) => n.id));
}
