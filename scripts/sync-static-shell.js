const fs = require("fs");
const path = require("path");
const { siteFooter, siteNav } = require("./site-shell");

const root = path.resolve(__dirname, "..");
const pages = [
  ["about.html", ""],
  ["404.html", ""],
  ["privacy.html", ""],
  ["terms.html", ""],
];

function ensureMarketingStyles(html, relativePath) {
  const prefix = relativePath.includes("/") ? "../" : "";
  if (!html.includes(`${prefix}index.css`)) {
    html = html.replace(
      /(<link rel="stylesheet" href="[^"]*styles\.css" \/>)/,
      `$1\n<link rel="stylesheet" href="${prefix}index.css" />`,
    );
  }
  if (!html.includes(`${prefix}marketing.css`)) {
    html = html.replace(
      /(<link rel="stylesheet" href="[^"]*index\.css" \/>)/,
      `$1\n<link rel="stylesheet" href="${prefix}marketing.css" />`,
    );
  }
  return html;
}

for (const [relativePath, active] of pages) {
  const filePath = path.join(root, relativePath);
  let html = fs.readFileSync(filePath, "utf8");
  html = ensureMarketingStyles(html, relativePath);
  html = html.replace(/<header class="[^"]*(?:nav|site-header)[^"]*">[\s\S]*?<\/header>/, siteNav(active));
  html = html.replace(/<footer class="[^"]*site-footer[^"]*">[\s\S]*?<\/footer>/, siteFooter());
  fs.writeFileSync(filePath, html);
  console.log(`Synced shell for ${relativePath}`);
}
