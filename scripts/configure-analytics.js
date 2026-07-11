const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const skippedDirectories = new Set([".git", ".agents", ".codex", "dist", "node_modules"]);
const projectKey = (process.env.POSTHOG_PROJECT_API_KEY || "").trim();
const publicHost = (process.env.POSTHOG_PUBLIC_HOST || "https://events.zeroquarry.com").replace(/\/$/, "");
const ingestHost = (process.env.POSTHOG_HOST || "https://us.i.posthog.com").replace(/\/$/, "");
const uiHost = (process.env.POSTHOG_UI_HOST || ingestHost.replace(".i.posthog.com", ".posthog.com")).replace(/\/$/, "");

function escapeAttribute(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return skippedDirectories.has(entry.name) ? [] : htmlFiles(fullPath);
    return entry.isFile() && entry.name.endsWith(".html") ? [fullPath] : [];
  });
}

let configured = 0;
for (const filePath of htmlFiles(root)) {
  const original = fs.readFileSync(filePath, "utf8");
  const updated = original.replace(
    /<script\b([^>]*\bsrc=(["'])[^"']*cookie-consent\.js\2[^>]*)><\/script>/gi,
    (full, rawAttributes) => {
      const attributes = rawAttributes
        .replace(/\sdata-posthog-(?:key|host|ui-host)=(["'])[^"']*\1/gi, "");
      if (!projectKey) return `<script${attributes}></script>`;
      configured += 1;
      return `<script${attributes}`
        + ` data-posthog-key="${escapeAttribute(projectKey)}"`
        + ` data-posthog-host="${escapeAttribute(publicHost)}"`
        + ` data-posthog-ui-host="${escapeAttribute(uiHost)}"></script>`;
    },
  );
  if (updated !== original) fs.writeFileSync(filePath, updated);
}

if (projectKey) {
  console.log(`Configured consent-gated PostHog on ${configured} HTML pages.`);
} else {
  console.log("POSTHOG_PROJECT_API_KEY is unset; marketing PostHog remains disabled.");
}
