const fs = require("fs");
const path = require("path");

const SITE_URL = (process.env.SITE_URL || "https://zeroquarry.com").replace(/\/$/, "");
const ROOT_DIR = path.resolve(__dirname, "..");
const OUTPUT_FILE = path.join(ROOT_DIR, "sitemap.xml");
const SKIPPED_DIRS = new Set([".git", ".agents", ".codex", "assets", "dist", "node_modules"]);

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function findHtmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (SKIPPED_DIRS.has(entry.name)) {
        return [];
      }

      return findHtmlFiles(fullPath);
    }

    return entry.isFile() && entry.name.endsWith(".html") ? [fullPath] : [];
  });
}

function filePathToUrl(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath).split(path.sep).join("/");
  const cleanPath = relativePath
    .replace(/(^|\/)index\.html$/, "$1")
    .replace(/\.html$/, "");

  return cleanPath === "" ? "/" : `/${cleanPath.replace(/^\/+/, "")}`;
}

const urls = findHtmlFiles(ROOT_DIR)
  .filter((filePath) => !fs.readFileSync(filePath, "utf8").match(/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i))
  .map(filePathToUrl)
  .sort();
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${escapeXml(`${SITE_URL}${url}`)}</loc></url>`).join("\n")}
</urlset>
`;

fs.writeFileSync(OUTPUT_FILE, sitemap);
console.log(`Wrote sitemap.xml with ${urls.length} URLs`);
