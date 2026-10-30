// Generates the résumé variants (game dev, software, grad school) as .docx from the content below.
// Usage: npm run resume                      all three, without a phone number (the copies the site links)
//        node resume/build.cjs software      one variant: game, software, or grad
//        RESUME_PHONE="..." node resume/build.cjs all --phone
//                                            add a phone number, for copies you send directly. It's never kept in
//                                            this file: the repository is public.
// Markup inside strings: **bold**, [[placeholder]] (yellow shading, to confirm).

const fs = require("fs");
const path = require("path");
const {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  LevelFormat,
  Packer,
  Paragraph,
  ShadingType,
  TabStopType,
  TextRun,
} = require("docx");

// ---------- content ----------

const phone = process.env.RESUME_PHONE ? { text: process.env.RESUME_PHONE } : null;
const contact = [
  { text: "Los Angeles, CA" },
  { text: "ajshaham@gmail.com", link: "mailto:ajshaham@gmail.com" },
  { text: "portfolio.ajshaham.workers.dev", link: "https://portfolio.ajshaham.workers.dev" },
  { text: "github.com/Nuja1337", link: "https://github.com/Nuja1337" },
];

const runefall =
  "Runefall: classless arena-and-dungeon RPG for PC · Godot 4, C#, .NET 10, Steamworks · playable online";

const chuken = (bullets) => ({
  org: "Chuken Studios",
  roles: [{ title: "Independent Game Developer", dates: "Feb 2026 – Present", subtitle: runefall, bullets }],
});

const bigfix = (engineer, intern) => ({
  org: "HCL BigFix",
  roles: [
    { title: "Frontend Software Engineer (SaaS)", dates: "Aug 2023 – Feb 2025", bullets: engineer },
    { title: "Full-stack Software Engineering Intern (WebUI)", dates: "May 2023 – Aug 2023", bullets: intern },
  ],
});

const freelance = {
  org: "Freelance",
  roles: [
    {
      title: "Web Developer",
      dates: "2022 – 2023",
      bullets: ["Built an accessible, multilingual landing page for a healthcare clinic in React and JavaScript."],
    },
  ],
};

const kingNutronics = (bullets) => ({
  org: "King Nutronics Corporation",
  roles: [{ title: "QA Engineering Intern", dates: "Jun 2018 – Sep 2018", bullets }],
});

const bigfixCore = [
  "Built and maintained a React + MUI component library adopted by 100+ engineers in 7+ apps.",
  "Shipped 100+ versioned, documented components at 95%+ test coverage, plus a Storybook-style workbench where engineering, QA, and design reviewed components together.",
  "Mentored 4 engineers across teams on onboarding, design-system usage, and architectural standards.",
];
const bigfixInternCore = ["Integrated Tenable SC and IO into the security-data ingestion pipeline (Node.js, SQL, REST)."];
const kingAutomation =
  "Automated calibration test beds through CAD and microcontroller integration, cutting QA testing time by ~80%.";
const kingNavy =
  "Tested calibration hardware used by the U.S. Navy for MIL-STD compliance; found and corrected about 20 critical errors in documentation and logging.";

const projectList = {
  companion: {
    name: "Guild Golem",
    stack: "TypeScript, React Router, Hono, Cloudflare Workers, D1, R2",
    right: { text: "guildgolem.com", link: "https://guildgolem.com" },
    bullets: [
      "Guild management site for World of Warcraft: Forever, with a raid calendar and Discord sign-ups, raid planner, roster and attendance, loot by council, EPGP, or DKP, and a 13-command Discord bot.",
      "Rebuilt my earlier Logs and Sims apps inside it, with combat logs parsed in a Web Worker and a sim for 23 specs on game-client data. It has 1,000+ tests and a strict CSP, and bundle budgets are checked before every deploy.",
    ],
  },
  drafts: {
    name: "Drafts",
    stack: "TypeScript, React, Hono, Durable Objects, D1, KV, Workers AI",
    right: { text: "drafts.ajshaham.workers.dev", link: "https://drafts.ajshaham.workers.dev" },
    bullets: [
      "Real-time League and Dota 2 draft rooms that suggest picks and bans from matchups and synergies, with an AI draft coach.",
    ],
  },
  tally: {
    name: "Tally",
    stack: "JavaScript, IndexedDB, PWA, Cloudflare Workers, D1",
    right: { text: "tally.ajshaham.workers.dev", link: "https://tally.ajshaham.workers.dev" },
    bullets: [
      "Framework-free, local-first training and nutrition PWA that works offline and syncs across devices, merging conflicting edits.",
    ],
  },
};

const ucsc = {
  school: "University of California, Santa Cruz",
  degree: "B.S. Computer Science: Computer Game Design",
  dates: "Sep 2017 – Jun 2022",
};

const variants = {
  game: {
    file: "AlexanderShahamResume-GameDev.docx",
    title: "Game Dev",
    experience: [
      chuken([
        "Designed the **Rune Forge**, the core system that replaces classes by letting players build their own ten-ability kits.",
        "Built the core combat, including the ability state machine, casts, channels, projectiles, zones, interrupts, and six crowd-control categories with diminishing returns and a hostage guard.",
        "Built an engine-free, server-authoritative 60 Hz simulation with deterministic replays and vision-filtered snapshots, played online over Steam Datagram Relay with lag compensation and reconnect.",
        "Built bot AI that uses the same commands as players and sees only its own team's vision. Bots fill short queues, take the role a dungeon party lacks, and run the boss's phases.",
        "Set the readability rules, including colorblind-safe colors, lightness before hue, and one telegraph style for players and bosses.",
        "Backed it with 5,000+ xUnit tests, including golden replays verified by state hash and zero-allocation checks on hot paths.",
        "Prototyped in Unreal Engine 5 (C++, GAS), then moved to Godot 4 and C#. Planned through a GDD and 450+ YouTrack tickets.",
      ]),
      bigfix(bigfixCore, bigfixInternCore),
      freelance,
    ],
    projects: [projectList.companion, projectList.drafts, projectList.tally],
    shipped: [
      "Programmer: **Keepie Uppies** (Unity, Android; team of 5), **RetrOsu** (crisp-game-lib; duo), **Wordle Cube** (Unity; solo)",
      "Programmer and producer: **Queen of the Hill** (JavaScript; team of 6), **Puffed Up** and **BarF** (Phaser 3; teams of 3), **Beast Within** (Ludum Dare 49)",
    ],
    education: {
      ...ucsc,
      lines: [
        "**Coursework:** Game Design I–III, Game Design Experience, Game Development Experience, Game Technologies, Game Systems",
      ],
    },
    skills: [
      ["Engines", "Godot 4 (.NET), Unreal Engine 5 (C++, GAS), Unity, Phaser"],
      ["Gameplay", "Combat and ability systems, crowd control, bot AI, encounter design, deterministic simulation, netcode"],
      ["Languages", "C#, C++, TypeScript, JavaScript, Python, SQL, GDScript, Java"],
      ["Web", "React, Node.js, Hono, PostgreSQL, Cloudflare Workers, D1"],
      ["Tools", "Git, Diversion, YouTrack, Jira, xUnit, Vitest, GitHub Actions, Steamworks, Blender, Figma"],
      ["Spoken", "English (native), Spanish (proficient)"],
    ],
  },

  software: {
    file: "AlexanderShahamResume-Software.docx",
    title: "Software",
    experience: [
      chuken([
        "Built an engine-free, server-authoritative 60 Hz simulation with deterministic replays. Snapshots are filtered by team vision, so hidden entities never leave the server.",
        "Took it online over Steam Datagram Relay with a dedicated server, delta snapshots (each client's worst second cut from 198 to 80 kbps), lag compensation, reconnect, and an ASP.NET Core matchmaker with hidden ratings. One core holds 41 matches.",
        "Built the combat runtime (ability state machine, projectiles, zones, interrupts, crowd control with diminishing returns), bot AI, and an in-game dev console.",
        "Backed it with 5,000+ xUnit tests, including golden replays verified by state hash and zero-allocation checks.",
        "Prototyped in Unreal Engine 5 (C++), then migrated to Godot 4 and C# (.NET 10). Tracked in a design doc, a ten-milestone roadmap, and 450+ YouTrack tickets.",
      ]),
      bigfix(
        [
          "Built a React + MUI component library adopted by 100+ engineers in 7+ apps, cutting duplicated UI code by ~32%.",
          "Shipped 100+ versioned, documented components at 95%+ test coverage, plus a Storybook-style workbench where engineering, QA, and design reviewed components together.",
          "Moved global state to Zustand, simplifying shared state logic and reducing component re-renders by ~60%.",
          "Delivered major features through CI/CD (GitHub Actions, Jenkins) into alpha, beta, and stable releases with <5% regression, on a plugin-based architecture that let teams ship independently.",
          "Mentored 4 engineers across teams on onboarding, design-system usage, and architectural standards.",
        ],
        [
          "Integrated Tenable SC and IO into the ingestion pipeline (Node.js, SQL, REST), expanding security-platform coverage by 66%.",
          "Redesigned the Insights datasource setup flow with UX and backend teams, reducing configuration errors by ~13%.",
        ]
      ),
      freelance,
    ],
    projects: [projectList.companion, projectList.drafts, projectList.tally],
    skills: [
      ["Languages", "TypeScript, JavaScript, C#, C++, Python, SQL, Java"],
      ["Frontend", "React, React Router, Next.js, Remix, Zustand, Material UI"],
      ["Backend", "Node.js, Hono, Express, ASP.NET Core, PostgreSQL, SQLite, Cloudflare Workers, D1, R2, Durable Objects"],
      ["Testing & CI", "Vitest, Jest, xUnit, Playwright, GitHub Actions, Jenkins"],
      ["Game Dev", "Godot 4 (.NET), Unreal Engine 5 (C++), Unity; Steamworks; deterministic simulation, netcode"],
      ["AI", "AI-assisted development (Claude Code, MCP), Workers AI"],
      ["Spoken", "English (native), Spanish (proficient)"],
    ],
  },

  grad: {
    file: "AlexanderShahamResume-GradSchool.docx",
    title: "Grad School",
    educationFirst: true,
    education: {
      ...ucsc,
      lines: [
        "**GPA:** 3.35 overall; 3.59 over the final two years (2020–2022) · Dean's Honors",
        "**Computer engineering and robotics:** Robot Automation, Computer Systems and Assembly Language, Applied Discrete Mathematics, Introduction to Networking",
        "**Computer science:** Data Structures and Algorithms, Advanced Programming, Web Applications, Game Technologies, Game Systems",
        "**Math and physics:** Calculus I–II, Vector Calculus, Mathematical Methods for Engineers I–II, Statistics, Physics I and III",
      ],
    },
    experience: [
      chuken([
        "Built an engine-free, server-authoritative 60 Hz simulation with deterministic replays. Snapshots are filtered by each team's line of sight, so hidden entities never leave the server, and matches run online over Steam Datagram Relay.",
        "Built the combat runtime (ability state machine, projectiles, interrupts, crowd control with diminishing returns) and bot AI that sees only its own team's vision.",
        "Backed it with 5,000+ xUnit tests, including golden replays verified by state hash and zero-allocation checks.",
        "Prototyped in Unreal Engine 5 (C++), then migrated to Godot 4 and C# (.NET 10). Manage a ten-milestone roadmap and 450+ tracked tickets.",
      ]),
      bigfix(bigfixCore, bigfixInternCore),
      freelance,
      kingNutronics([kingAutomation, kingNavy]),
    ],
    projects: [projectList.companion, projectList.drafts],
    skills: [
      ["Languages", "C#, C++, TypeScript, JavaScript, Python, SQL, Java"],
      ["Systems", "Deterministic simulation, real-time networking, state machines, bot AI"],
      ["Engines", "Godot 4 (.NET), Unreal Engine 5 (C++), Unity"],
      ["Web & Tools", "React, Node.js, PostgreSQL, Cloudflare Workers, Git, GitHub Actions"],
      ["Spoken", "English (native), Spanish (proficient)"],
    ],
  },
};

// ---------- layout ----------

const FONT = "Calibri";
const ACCENT = "1F3A5F";
const MUTED = "555555";
const SIZE = 20; // half-points (10pt)
const MARGIN_X = 792; // 0.55"
const MARGIN_Y = 648; // 0.45"
const TEXT_WIDTH = 12240 - 2 * MARGIN_X;
const TODO_SHADING = { type: ShadingType.CLEAR, fill: "FFF176", color: "auto" };
const RIGHT_TAB = [{ type: TabStopType.RIGHT, position: TEXT_WIDTH }];

// Split "**bold** and [[todo]]" into styled runs.
function runs(text, base = {}) {
  return text
    .split(/(\*\*[^*]+\*\*|\[\[[^\]]+\]\])/)
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith("**")) return new TextRun({ ...base, text: part.slice(2, -2), bold: true });
      if (part.startsWith("[[")) return new TextRun({ ...base, text: part.slice(2, -2), shading: TODO_SHADING });
      return new TextRun({ ...base, text: part });
    });
}

function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 140, after: 60 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 1 } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, color: ACCENT, size: 22, characterSpacing: 20 })],
  });
}

// Bold left text, optional muted suffix, right-aligned right text (plain, or { text, link }).
function entryLine({ left, note, suffix, right, before = 60 }) {
  const r = typeof right === "string" ? { text: right } : right;
  const rightRuns = r.link
    ? [new ExternalHyperlink({ link: r.link, children: [new TextRun({ text: r.text, color: MUTED })] })]
    : runs(r.text, { color: MUTED });
  return new Paragraph({
    tabStops: RIGHT_TAB,
    keepNext: true,
    spacing: { before, after: 20 },
    children: [
      ...runs(left, { bold: true }),
      ...(note ? [new TextRun({ text: note, italics: true, color: MUTED, size: SIZE - 2 })] : []),
      ...(suffix ? runs(suffix, { color: "333333" }) : []),
      new TextRun({ text: "\t" }),
      ...rightRuns,
    ],
  });
}

function subtitle(text) {
  return new Paragraph({
    keepNext: true,
    spacing: { after: 30 },
    children: runs(text, { italics: true, color: "333333" }),
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 10 },
    children: runs(text),
  });
}

function plainLine(text) {
  return new Paragraph({ spacing: { after: 20 }, children: runs(text) });
}

function build(v, { withPhone }) {
  const body = [];

  // Header
  body.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: "Alexander Shaham", bold: true, size: 40, color: ACCENT })],
    })
  );
  const contactRuns = [];
  const items = withPhone ? [contact[0], phone, ...contact.slice(1)] : contact;
  items.forEach((c, i) => {
    if (i > 0) contactRuns.push(new TextRun({ text: " • ", color: "999999", size: 18 }));
    if (c.link) {
      contactRuns.push(new ExternalHyperlink({ link: c.link, children: [new TextRun({ text: c.text, color: MUTED, size: 18 })] }));
    } else {
      contactRuns.push(...runs(c.text, { color: MUTED, size: 18 }));
    }
  });
  body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: contactRuns }));

  const education = () => {
    const e = v.education || ucsc;
    body.push(sectionHeading("Education"));
    body.push(entryLine({ left: e.school, suffix: `  — ${e.degree}`, right: e.dates, before: 20 }));
    (e.lines || []).forEach((l) => body.push(plainLine(l)));
  };

  if (v.educationFirst) education();

  // Experience
  body.push(sectionHeading("Experience"));
  v.experience.forEach((job, j) => {
    job.roles.forEach((role, r) => {
      const first = r === 0;
      body.push(
        entryLine({
          left: first ? job.org : "",
          note: first ? job.orgNote : "",
          suffix: first ? `  — ${role.title}` : role.title,
          right: role.dates,
          before: first ? (j === 0 ? 20 : 100) : 40,
        })
      );
      if (role.subtitle) body.push(subtitle(role.subtitle));
      role.bullets.forEach((b) => body.push(bullet(b)));
    });
  });

  // Projects
  body.push(sectionHeading("Projects"));
  v.projects.forEach((p, i) => {
    body.push(
      entryLine({
        left: p.name,
        note: p.since ? `  ${p.since}` : "",
        suffix: `  | ${p.stack}`,
        right: p.right,
        before: i === 0 ? 20 : 60,
      })
    );
    p.bullets.forEach((b) => body.push(bullet(b)));
  });

  if (v.shipped) {
    body.push(sectionHeading("Shipped Games"));
    v.shipped.forEach((line) => body.push(bullet(line)));
  }

  // Skills
  body.push(sectionHeading("Technical Skills"));
  v.skills.forEach(([label, list]) => {
    body.push(
      new Paragraph({
        spacing: { after: 20 },
        indent: { left: 1260, hanging: 1260 },
        tabStops: [{ type: TabStopType.LEFT, position: 1260 }],
        children: [new TextRun({ text: label, bold: true }), new TextRun({ text: "\t" }), ...runs(list)],
      })
    );
  });

  if (!v.educationFirst) education();

  return new Document({
    creator: "Alexander Shaham",
    title: `Alexander Shaham – Resume (${v.title})`,
    styles: {
      default: { document: { run: { font: FONT, size: SIZE }, paragraph: { spacing: { line: 250 } } } },
    },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 300, hanging: 200 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: MARGIN_Y, bottom: MARGIN_Y, left: MARGIN_X, right: MARGIN_X },
          },
        },
        children: body,
      },
    ],
  });
}

const args = process.argv.slice(2);
const withPhone = args.includes("--phone");
if (withPhone && !phone) throw new Error("--phone needs the number in RESUME_PHONE: it is never kept in this file.");
const which = args.find((a) => !a.startsWith("--")) || "all";
const names = which === "all" ? Object.keys(variants) : [which];
for (const name of names) {
  const v = variants[name];
  if (!v) throw new Error(`Unknown variant "${name}". Use game, software, grad, or all.`);
  const out = path.join(__dirname, v.file);
  Packer.toBuffer(build(v, { withPhone })).then((buf) => {
    fs.writeFileSync(out, buf);
    console.log(`wrote ${out}`);
  });
}
