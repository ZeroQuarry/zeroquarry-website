const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const client = path.join(dist, "client");
const server = path.join(dist, "server");

const rootFiles = [
  "404.html",
  "about.html",
  "continuous-testing.html",
  "cookie-consent.css",
  "cookie-consent.js",
  "evidence-reports.html",
  "features.html",
  "index.css",
  "index.html",
  "index.js",
  "marketing.css",
  "platform.html",
  "pricing.html",
  "privacy.html",
  "robots.txt",
  "sitemap.xml",
  "styles.css",
  "terms.html",
];
const directories = ["assets", "platform", "request-scan", "research", "use-cases"];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(client, { recursive: true });
fs.mkdirSync(server, { recursive: true });

for (const file of rootFiles) fs.copyFileSync(path.join(root, file), path.join(client, file));
for (const directory of directories) {
  fs.cpSync(path.join(root, directory), path.join(client, directory), {
    recursive: true,
    filter: (source) => path.basename(source) !== ".DS_Store",
  });
}
fs.copyFileSync(path.join(__dirname, "sites-worker.js"), path.join(server, "index.js"));

console.log(`Built Sites package with ${rootFiles.length} root files and ${directories.length} route/asset directories.`);
