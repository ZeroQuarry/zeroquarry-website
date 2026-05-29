const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contentDir = path.join(root, 'content', 'research');
const outputDir = path.join(root, 'research');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function parseFrontmatter(raw) {
  if (!raw.startsWith('---\n')) {
    throw new Error('Research posts must start with YAML-style frontmatter.');
  }
  const end = raw.indexOf('\n---\n', 4);
  if (end === -1) {
    throw new Error('Could not find closing frontmatter marker.');
  }

  const frontmatter = raw.slice(4, end);
  const body = raw.slice(end + 5).trim();
  const data = {};
  let currentKey = null;

  for (const line of frontmatter.split('\n')) {
    if (!line.trim()) continue;
    const listMatch = line.match(/^\s+-\s+(.+)$/);
    if (listMatch && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(unquote(listMatch[1].trim()));
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    currentKey = match[1];
    const value = match[2].trim();
    data[currentKey] = value === '' ? [] : unquote(value);
  }

  return { data, body };
}

function unquote(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

function formatDate(value) {
  if (!value) return '';
  const parts = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = parts
    ? new Date(Date.UTC(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3])))
    : new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function renderInline(text) {
  let html = escapeHtml(text);
  const tokens = [];
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    const token = `@@TOKEN${tokens.length}@@`;
    tokens.push(`<code>${code}</code>`);
    return token;
  });
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const safeHref = escapeAttr(href);
    return `<a href="${safeHref}">${label}</a>`;
  });
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  tokens.forEach((tokenHtml, index) => {
    html = html.replace(`@@TOKEN${index}@@`, tokenHtml);
  });
  return html;
}

function flushParagraph(paragraph, html) {
  if (!paragraph.length) return;
  html.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
  paragraph.length = 0;
}

function renderMarkdown(markdown) {
  const lines = markdown.split('\n');
  const html = [];
  const headings = [];
  const paragraph = [];
  let list = null;
  let blockquote = [];
  let code = null;

  function closeList() {
    if (!list) return;
    html.push(`</${list}>`);
    list = null;
  }

  function closeBlockquote() {
    if (!blockquote.length) return;
    html.push(`<blockquote>${renderInline(blockquote.join(' '))}</blockquote>`);
    blockquote = [];
  }

  for (const line of lines) {
    const fence = line.match(/^```(.*)$/);
    if (fence) {
      flushParagraph(paragraph, html);
      closeList();
      closeBlockquote();
      if (code) {
        html.push(`<pre><code class="language-${escapeAttr(code.lang)}">${escapeHtml(code.lines.join('\n'))}</code></pre>`);
        code = null;
      } else {
        code = { lang: fence[1].trim() || 'text', lines: [] };
      }
      continue;
    }

    if (code) {
      code.lines.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph(paragraph, html);
      closeList();
      closeBlockquote();
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      flushParagraph(paragraph, html);
      closeList();
      closeBlockquote();
      const level = heading[1].length;
      const text = heading[2].trim();
      const id = slugify(text);
      if (level === 2) headings.push({ id, text });
      html.push(`<h${level} id="${id}">${renderInline(text)}</h${level}>`);
      continue;
    }

    const quote = line.match(/^>\s*(.*)$/);
    if (quote) {
      flushParagraph(paragraph, html);
      closeList();
      blockquote.push(quote[1]);
      continue;
    }

    const unordered = line.match(/^-\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph(paragraph, html);
      closeBlockquote();
      const type = unordered ? 'ul' : 'ol';
      if (list && list !== type) closeList();
      if (!list) {
        list = type;
        html.push(`<${type}>`);
      }
      html.push(`<li>${renderInline((unordered || ordered)[1])}</li>`);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph(paragraph, html);
  closeList();
  closeBlockquote();
  if (code) {
    html.push(`<pre><code class="language-${escapeAttr(code.lang)}">${escapeHtml(code.lines.join('\n'))}</code></pre>`);
  }

  return { html: html.join('\n'), headings };
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function layout({ title, description, canonical, ogTitle, ogDescription, relativePrefix, body, active = 'Research' }) {
  const socialImage = arguments[0].image;
  const imageUrl = socialImage
    ? socialImage.startsWith('http')
      ? socialImage
      : `https://zeroquarry.com${socialImage}`
    : '';
  const imageMeta = imageUrl
    ? `<meta property="og:image" content="${escapeAttr(imageUrl)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${escapeAttr(imageUrl)}" />`
    : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeAttr(description)}" />
<link rel="canonical" href="${escapeAttr(canonical)}" />
<meta property="og:title" content="${escapeAttr(ogTitle || title)}" />
<meta property="og:description" content="${escapeAttr(ogDescription || description)}" />
<meta property="og:type" content="${active === 'Research' ? 'article' : 'website'}" />
<meta property="og:url" content="${escapeAttr(canonical)}" />
${imageMeta}
<link rel="icon" type="image/png" href="${relativePrefix}assets/favicon.png" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${relativePrefix}index.css" />
<link rel="stylesheet" href="${relativePrefix}cookie-consent.css" />
<script src="${relativePrefix}cookie-consent.js" data-analytics-id="G-ZRT44MWJT1" defer></script>
</head>
<body>

<div class="bg-flair" aria-hidden="true">
  <div class="bg-grid"></div>
  <div class="bg-glow-red"></div>
</div>

${nav(relativePrefix, active)}

${body}

${footer(relativePrefix)}

</body>
</html>
`;
}

function nav(prefix) {
  return `<header class="nav">
  <div class="nav-inner">
    <a href="${prefix}index.html" class="brand" aria-label="ZeroQuarry home">
      <img class="wordmark" src="${prefix}assets/wordmark.png" alt="ZeroQuarry">
    </a>
    <nav class="nav-links" aria-label="Primary">
      <a href="${prefix}index.html#surfaces">Platform</a>
      <a href="${prefix}index.html#debate">How it works</a>
      <a href="${prefix}index.html#report">Reports</a>
      <a href="${prefix}features.html">Features</a>
      <a href="${prefix}research/" aria-current="page">Research</a>
      <a href="${prefix}pricing.html">Pricing</a>
    </nav>
    <div class="nav-cta">
      <a class="btn btn-ghost" href="https://console.zeroquarry.com">Sign in</a>
      <a class="btn btn-primary" href="${prefix}request-scan/">Request scan <span class="arr">-&gt;</span></a>
    </div>
  </div>
</header>`;
}

function footer(prefix) {
  return `<footer class="site-footer">
  <div class="container">
    <div class="foot-grid">
      <div class="foot-col">
        <a href="${prefix}index.html" class="brand" aria-label="ZeroQuarry home">
          <img class="wordmark" src="${prefix}assets/wordmark.png" alt="ZeroQuarry">
        </a>
        <p>Adversarial AI for offensive security. Mine your 0-days before someone else does.</p>
      </div>
      <div class="foot-col legal">
        <h5>Legal</h5>
        <a href="${prefix}privacy.html">Privacy Policy</a>
        <a href="${prefix}terms.html">Terms of Use</a>
      </div>
      <div class="foot-col legal">
        <h5>Resources</h5>
        <a href="${prefix}about.html">About</a>
        <a href="${prefix}features.html">Features</a>
        <a href="${prefix}research/">Research</a>
        <a href="${prefix}pricing.html">Pricing</a>
        <a href="https://docs.zeroquarry.com">Docs</a>
        <a href="https://status.zeroquarry.com">Status Page</a>
      </div>
      <div class="foot-col legal">
        <h5>Social</h5>
        <a href="https://www.linkedin.com/company/zeroquarry/">LinkedIn</a>
        <a href="https://discord.gg/PygTTeuU">Discord</a>
        <a href="https://github.com/ZeroQuarry/">GitHub</a>
      </div>
    </div>
    <div class="foot-bottom">
      <div>&copy; 2026 ZeroQuarry. All rights reserved.</div>
      <div class="right">
        <span>LAT 37.8409 S - LON 144.9464 E</span>
        <span class="ok">ALL SYSTEMS OPERATIONAL</span>
      </div>
    </div>
  </div>
</footer>`;
}

function renderPost(post) {
  const rendered = renderMarkdown(post.body);
  const dateLabel = formatDate(post.data.date);
  const tags = Array.isArray(post.data.tags) ? post.data.tags : [];
  const toc = rendered.headings
    .map((heading) => `<a href="#${heading.id}">${escapeHtml(heading.text)}</a>`)
    .join('\n');
  const pills = [post.data.author, dateLabel, ...tags.slice(0, 2)]
    .filter(Boolean)
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join('\n');

  const body = `<main>
  <article class="research-article">
    <header class="article-header">
      <div class="container article-header-grid">
        <div>
          <a class="article-back" href="../">Research</a>
          <div class="article-meta">
            ${pills}
          </div>
          <h1>${escapeHtml(post.data.title)}</h1>
          <p class="article-dek">${escapeHtml(post.data.description)}</p>
          <div class="article-actions">
            <a class="btn btn-primary" href="../../request-scan/">Request a private scan <span class="arr">-&gt;</span></a>
            <a class="btn btn-ghost" href="#what-we-are-not-disclosing">What we are withholding</a>
          </div>
        </div>

        <aside class="disclosure-panel" aria-label="Disclosure status">
          <div class="disclosure-label">Disclosure status</div>
          <div class="disclosure-state">${escapeHtml(post.data.status || 'Research note')}</div>
          <p>${escapeHtml(post.data.disclosureDetail || '')}</p>
          <dl>
            <div>
              <dt>Class</dt>
              <dd>${escapeHtml(post.data.disclosureClass || 'Remote code execution')}</dd>
            </div>
            <div>
              <dt>Surface</dt>
              <dd>${escapeHtml(post.data.disclosureSurface || 'Obsidian community plugin')}</dd>
            </div>
            <div>
              <dt>Posture</dt>
              <dd>${escapeHtml(post.data.disclosurePosture || 'Disclosure-safe')}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </header>

    <div class="container article-layout">
      <aside class="article-toc" aria-label="Article sections">
        ${toc}
      </aside>

      <div class="article-body">
${rendered.html}
      </div>
    </div>
  </article>
</main>`;

  return layout({
    title: `${post.data.title} | ZeroQuarry Research`,
    description: post.data.description,
    canonical: `https://zeroquarry.com/research/${post.data.slug}`,
    ogTitle: post.data.ogTitle,
    ogDescription: post.data.ogDescription,
    image: post.data.image,
    relativePrefix: '../../',
    body,
  });
}

function renderIndex(posts) {
  const cards = posts
    .map((post) => {
      const dateLabel = formatDate(post.data.date);
      return `<article class="research-card">
        <a class="research-card-link" href="${escapeAttr(post.data.slug)}/">
          <div class="research-card-meta">
            <span>${escapeHtml(post.data.author || 'ZeroQuarry Research')}</span>
            <span>${escapeHtml(dateLabel)}</span>
            <span class="status-pill">${escapeHtml(post.data.status || 'Research')}</span>
          </div>
          <h2>${escapeHtml(post.data.title)}</h2>
          <p>${escapeHtml(post.data.featuredSummary || post.data.description)}</p>
          <div class="research-card-footer">
            <span>Read the research</span>
            <span>-&gt;</span>
          </div>
        </a>
      </article>`;
    })
    .join('\n');

  const body = `<main>
  <section class="research-hero">
    <div class="container research-hero-grid">
      <div>
        <span class="eyebrow">
          <span class="tag">RESEARCH</span>
          <span>Security findings and disclosure notes</span>
        </span>
        <h1 class="headline research-headline">
          <span class="block">ZeroQuarry</span>
          <span class="block thin"><em>Research.</em></span>
        </h1>
        <p class="lede">
          Security findings, disclosure notes, and product-security analysis from the ZeroQuarry team.
        </p>
      </div>

      <div class="research-terminal" aria-label="Research feed summary">
        <div class="console-head">
          <span class="traffic"><span class="r"></span><span class="y"></span><span class="g"></span></span>
          <span class="console-title"><span class="tbl">feed://</span>research</span>
          <span class="console-meta"><span class="live">LIVE</span></span>
        </div>
        <div class="research-terminal-body">
          <div><span class="muted">$</span> publish --mode responsible-disclosure</div>
          <div><span class="ok">ok</span> exploit details limited while users update</div>
          <div><span class="muted">$</span> focus --surface plugin-ecosystems</div>
          <div><span class="ok">ok</span> markdown, local files, extensions, trust boundaries</div>
          <div><span class="muted">$</span> cta --single "request private scan"</div>
          <div><span class="ok">ok</span> useful first, conversion second</div>
        </div>
      </div>
    </div>
  </section>

  <section class="research-list-section">
    <div class="container research-list">
      ${cards}
    </div>
  </section>
</main>`;

  return layout({
    title: 'ZeroQuarry Research',
    description: 'Security findings, disclosure notes, and product-security analysis from the ZeroQuarry team.',
    canonical: 'https://zeroquarry.com/research/',
    ogTitle: 'ZeroQuarry Research',
    ogDescription: 'Security findings, disclosure notes, and product-security analysis from the ZeroQuarry team.',
    image: posts.find((post) => post.data.featured && post.data.image)?.data.image,
    relativePrefix: '../',
    body,
    active: 'Research Index',
  });
}

function loadPosts() {
  return fs.readdirSync(contentDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(contentDir, file), 'utf8');
      return parseFrontmatter(raw);
    })
    .sort((a, b) => String(b.data.date).localeCompare(String(a.data.date)));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(file, contents) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, contents);
  console.log(`wrote ${path.relative(root, file)}`);
}

const posts = loadPosts();
writeFile(path.join(outputDir, 'index.html'), renderIndex(posts));
for (const post of posts) {
  if (!post.data.slug || !post.data.title) {
    throw new Error('Research posts require title and slug frontmatter.');
  }
  writeFile(path.join(outputDir, post.data.slug, 'index.html'), renderPost(post));
}
