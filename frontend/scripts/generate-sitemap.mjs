import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const siteUrl = process.env.VITE_SITE_URL || "https://gcetresources.com";

const subjects = JSON.parse(
  readFileSync(join(root, "src/data/subjects.json"), "utf8")
);

const years = ["1st", "2nd", "3rd", "4th"];
const mappingsDir = join(root, "src/data/pdfMappings");
mkdirSync(mappingsDir, { recursive: true });

let allMappings = [];

const legacyPath = join(root, "src/data/pdfMappings.json");
if (existsSync(legacyPath)) {
  try {
    allMappings = JSON.parse(readFileSync(legacyPath, "utf8"));
    years.forEach((y) => {
      const filtered = allMappings.filter((e) => e.year === y);
      writeFileSync(join(mappingsDir, `${y}.json`), JSON.stringify(filtered));
    });
  } catch {
    /* fall through to per-year files */
  }
}

if (allMappings.length === 0) {
  years.forEach((y) => {
    const yearPath = join(mappingsDir, `${y}.json`);
    if (!existsSync(yearPath)) return;
    try {
      const chunk = JSON.parse(readFileSync(yearPath, "utf8"));
      allMappings.push(...chunk);
    } catch {
      /* skip */
    }
  });
}

const availability = {};
allMappings.forEach((e) => {
  const key = `${e.year}/${e.subjectId}`;
  if (!availability[key]) availability[key] = {};
  availability[key][e.resourceType] =
    Array.isArray(e.chapters) && e.chapters.length > 0;
});
writeFileSync(
  join(mappingsDir, "availability.json"),
  JSON.stringify(availability)
);

const searchIndex = [];
allMappings.forEach((e) => {
  e.chapters?.forEach((c) => {
    if (c.title) {
      searchIndex.push({
        year: e.year,
        subjectId: e.subjectId,
        resourceType: e.resourceType,
        title: c.title,
        searchText: `${c.title} ${e.subjectId} ${e.resourceType}`.toLowerCase(),
      });
    }
  });
});
writeFileSync(
  join(root, "src/data/search-index.json"),
  JSON.stringify(searchIndex)
);

const staticRoutes = [
  "/",
  "/about",
  "/contact",
  "/support",
  "/year-selection",
  "/youtube-resources",
  "/youtube-resources/academic",
  "/youtube-resources/non-academic",
  "/coding-resources",
  "/coding-resources/dsa",
  "/coding-resources/projects",
  "/essentials",
  "/notice-board",
];

const urls = [...staticRoutes];
for (const year of Object.keys(subjects)) {
  urls.push(`/resources/${year}`);
  for (const subject of subjects[year]) {
    urls.push(`/resources/${year}/${subject.id}`);
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (path) =>
      `  <url><loc>${siteUrl}${path}</loc><changefreq>weekly</changefreq></url>`
  )
  .join("\n")}
</urlset>
`;

writeFileSync(join(root, "public/sitemap.xml"), xml);
writeFileSync(
  join(root, "public/robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
);

console.log(
  `Generated: sitemap (${urls.length} URLs), search index (${searchIndex.length} entries), availability (${Object.keys(availability).length} subjects)`
);
