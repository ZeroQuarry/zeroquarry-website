const fs = require("fs");
const path = require("path");
const { assetVersion, siteFooter, siteNav } = require("./site-shell");

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
      `$1\n<link rel="stylesheet" href="${prefix}marketing.css?v=${assetVersion}" />`,
    );
  } else {
    html = html.replace(
      /href="([^\"]*marketing\.css)(?:\?[^\"]*)?"/,
      `href="$1?v=${assetVersion}"`,
    );
  }
  return html;
}

function ensureShellBehavior(html, relativePath) {
  const prefix = relativePath.includes("/") ? "../" : "";
  const script = `<script src="${prefix}index.js?v=${assetVersion}" defer></script>`;
  if (/src="[^\"]*index\.js(?:\?[^\"]*)?"/.test(html)) {
    return html.replace(
      /src="([^\"]*index\.js)(?:\?[^\"]*)?"/,
      `src="$1?v=${assetVersion}"`,
    );
  }
  return html.replace("</head>", `${script}\n</head>`);
}

function ensureThemeInit(html) {
  if (html.includes("__zqTheme")) return html;
  const script = `<script>function __zqTheme(){var t=null;try{var q=new URLSearchParams(location.search).get("theme");var s=localStorage.getItem("zq-theme");t=q==="light"||q==="dark"?q:(s==="light"||s==="dark"?s:null)}catch(e){}document.documentElement.dataset.theme=t||(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.classList.add("js")}__zqTheme()</` + `script>`;
  return html.replace(/<link rel="icon"[^>]*>/, (m) => `${m}\n${script}`);
}

for (const [relativePath, active] of pages) {
  const filePath = path.join(root, relativePath);
  let html = fs.readFileSync(filePath, "utf8");
  html = ensureThemeInit(html);
  html = ensureMarketingStyles(html, relativePath);
  html = ensureShellBehavior(html, relativePath);
  html = html.replace(/<header class="[^"]*(?:nav|site-header)[^"]*">[\s\S]*?<\/header>/, siteNav(active));
  html = html.replace(/<footer class="[^"]*site-footer[^"]*">[\s\S]*?<\/footer>/, siteFooter());
  fs.writeFileSync(filePath, html);
  console.log(`Synced shell for ${relativePath}`);
}
