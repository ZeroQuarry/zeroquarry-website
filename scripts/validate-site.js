const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const skippedDirectories = new Set([".git", ".agents", ".codex", "dist", "node_modules"]);
const errors = [];
const titles = new Map();

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return skippedDirectories.has(entry.name) ? [] : walk(fullPath);
    return entry.isFile() && entry.name.endsWith(".html") ? [fullPath] : [];
  });
}

function localTargetExists(fromFile, rawUrl) {
  const cleanUrl = rawUrl.split("#")[0].split("?")[0];
  if (!cleanUrl) return true;
  const base = cleanUrl.startsWith("/") ? root : path.dirname(fromFile);
  const target = path.resolve(base, cleanUrl.replace(/^\/+/, ""));
  const candidates = cleanUrl.endsWith("/")
    ? [path.join(target, "index.html")]
    : path.extname(target)
      ? [target]
      : [target, `${target}.html`, path.join(target, "index.html")];
  return candidates.some((candidate) => candidate.startsWith(root) && fs.existsSync(candidate));
}

for (const filePath of walk(root)) {
  const relativePath = path.relative(root, filePath);
  const html = fs.readFileSync(filePath, "utf8");
  const noindex = /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim();
  const h1Count = (html.match(/<h1\b/gi) || []).length;

  if (!title) errors.push(`${relativePath}: missing title`);
  if (!noindex) {
    if (!/<meta\s+name=["']description["']/i.test(html)) errors.push(`${relativePath}: missing meta description`);
    if (!/<link\s+rel=["']canonical["']/i.test(html)) errors.push(`${relativePath}: missing canonical URL`);
    if (h1Count !== 1) errors.push(`${relativePath}: expected exactly one h1, found ${h1Count}`);
    if (title) {
      if (titles.has(title)) errors.push(`${relativePath}: duplicate title also used by ${titles.get(title)}`);
      else titles.set(title, relativePath);
    }
  }

  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) {
    const url = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:|#|\/\/)/i.test(url)) continue;
    if (!localTargetExists(filePath, url)) errors.push(`${relativePath}: unresolved local reference ${url}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${walk(root).length} HTML files: metadata, H1s, unique titles, and local references are consistent.`);
