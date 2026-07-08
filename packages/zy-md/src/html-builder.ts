import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { StyleConfig, HtmlDocumentMeta } from "./types.js";
import { DEFAULT_STYLE } from "./constants.js";

function resolveCommonJsDir(): string | undefined {
  try {
    const value = eval(
      "typeof module === 'object' && module && module.exports && typeof __dirname === 'string' ? __dirname : undefined",
    );
    return typeof value === "string" ? value : undefined;
  } catch {
    return undefined;
  }
}

function resolveModuleDir(metaUrl?: string): string {
  const commonJsDir = resolveCommonJsDir();
  if (commonJsDir) return commonJsDir;
  if (!metaUrl) {
    throw new Error("Unable to resolve module directory.");
  }
  return path.dirname(fileURLToPath(metaUrl));
}

const SCRIPT_DIR = resolveModuleDir(import.meta.url);
const CODE_THEMES_DIR = path.resolve(SCRIPT_DIR, "code-themes");

export function buildCss(baseCss: string, themeCss: string, style: StyleConfig = DEFAULT_STYLE): string {
  const variables = `
:root {
  --md-primary-color: ${style.primaryColor};
  --md-font-family: ${style.fontFamily};
  --md-font-size: ${style.fontSize};
  --foreground: ${style.foreground};
  --blockquote-background: ${style.blockquoteBackground};
  --md-accent-color: ${style.accentColor};
  --md-container-bg: ${style.containerBg};
}

body {
  margin: 0;
  padding: 24px;
  background: #ffffff;
}

#output {
  max-width: 1400px;
  margin: 0 auto;
}
`.trim();

  return [variables, baseCss, themeCss].join("\n\n");
}

export function loadCodeThemeCss(themeName: string): string {
  const filePath = path.join(CODE_THEMES_DIR, `${themeName}.min.css`);
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    console.error(`Code theme CSS not found: ${filePath}`);
    return "";
  }
}

export function buildHtmlDocument(meta: HtmlDocumentMeta, css: string, html: string, codeThemeCss?: string, withSidebar: boolean = false): string {
  const escapeHtmlAttribute = (value: string) => value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const sidebarStyle = `
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      width: 260px;
      height: 100vh;
      background: #f7f7f7;
      border-right: 1px solid #e0e0e0;
      overflow-y: auto;
      padding: 20px 16px;
      box-sizing: border-box;
      z-index: 1000;
      font-family: -apple-system-font, BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB, Microsoft YaHei UI, Microsoft YaHei, Arial, sans-serif;
      font-size: 14px;
    }
    .sidebar-toggle {
      position: fixed;
      left: 10px;
      top: 10px;
      width: 36px;
      height: 36px;
      background: var(--md-primary-color, #0F4C81);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 18px;
      z-index: 1001;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .sidebar-toggle:hover { opacity: 0.9; }
    .sidebar-title {
      font-weight: bold;
      font-size: 15px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--md-primary-color, #0F4C81);
      color: #333;
    }
    .sidebar-nav { list-style: none; padding: 0; margin: 0; }
    .sidebar-nav li { margin: 4px 0; }
    .sidebar-nav a {
      display: block;
      padding: 6px 8px;
      color: #555;
      text-decoration: none;
      border-radius: 4px;
      transition: background 0.2s, color 0.2s;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .sidebar-nav a:hover { background: #e8e8e8; color: #333; }
    .sidebar-nav a.active { background: var(--md-primary-color, #0F4C81); color: white; }
    .sidebar-nav .nav-h2 { padding-left: 8px; font-size: 13px; }
    .sidebar-nav .nav-h3 { padding-left: 20px; font-size: 12px; color: #777; }
    .sidebar-nav .nav-h4 { padding-left: 32px; font-size: 11px; color: #999; }
    .main-content { margin-left: 0; transition: margin-left 0.3s; }
    .main-content.sidebar-open { margin-left: 260px; }
    @media (max-width: 768px) {
      .sidebar { transform: translateX(-100%); transition: transform 0.3s; }
      .sidebar.open { transform: translateX(0); }
      .main-content.sidebar-open { margin-left: 0; }
    }
  `;

  const sidebarScript = `
    <script>
    (function() {
      var btn = document.querySelector('.sidebar-toggle');
      var sidebar = document.querySelector('.sidebar');
      if (btn && sidebar) {
        btn.addEventListener('click', function() {
          sidebar.classList.toggle('open');
          document.querySelector('.main-content').classList.toggle('sidebar-open');
        });
      }
      // Auto-generate TOC from headings
      var headings = document.querySelectorAll('h1, h2, h3, h4');
      var nav = document.querySelector('.sidebar-nav');
      if (headings.length && nav) {
        headings.forEach(function(h, i) {
          if (!h.id) h.id = 'heading-' + i;
          var li = document.createElement('li');
          li.className = 'nav-' + h.tagName.toLowerCase();
          var a = document.createElement('a');
          a.href = '#' + h.id;
          a.textContent = h.textContent || '';
          li.appendChild(a);
          nav.appendChild(li);
        });
      }
      // Highlight active heading on scroll
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          var id = entry.target.id;
          var link = document.querySelector('.sidebar-nav a[href="#' + id + '"]');
          if (link) {
            if (entry.isIntersecting) {
              document.querySelectorAll('.sidebar-nav a').forEach(function(a) { a.classList.remove('active'); });
              link.classList.add('active');
            }
          }
        });
      }, { threshold: 0.1, rootMargin: '-80px 0px -70% 0px' });
      headings.forEach(function(h) { if (h.id) observer.observe(h); });
      // Smooth scroll
      document.addEventListener('click', function(e) {
        if (e.target.matches('.sidebar-nav a')) {
          e.preventDefault();
          var id = e.target.getAttribute('href').slice(1);
          var el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    })();
    </script>
  `;

  const lines = [
    "<!doctype html>",
    "<html>",
    "<head>",
    '  <meta charset="utf-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
    `  <title>${escapeHtmlAttribute(meta.title)}</title>`,
  ];
  if (meta.author) {
    lines.push(`  <meta name="author" content="${escapeHtmlAttribute(meta.author)}" />`);
  }
  if (meta.description) {
    lines.push(`  <meta name="description" content="${escapeHtmlAttribute(meta.description)}" />`);
  }
  lines.push(`  <style>${css}</style>`);
  lines.push(`  <style>${sidebarStyle}</style>`);
  if (codeThemeCss) {
    lines.push(`  <style>${codeThemeCss}</style>`);
  }
  lines.push(
    "</head>",
    "<body>"
  );
  if (withSidebar) {
    lines.push(
      '  <button class="sidebar-toggle" title="目录">☰</button>',
      '  <nav class="sidebar">',
      '    <div class="sidebar-title">目录</div>',
      '    <ul class="sidebar-nav"></ul>',
      '  </nav>',
      '  <div class="main-content">',
      `    <div id="output">`,
      html,
      '    </div>',
      '  </div>',
      sidebarScript,
      "</body>",
      "</html>"
    );
  } else {
    lines.push(
      '  <div id="output">',
      html,
      '  </div>',
      "</body>",
      "</html>"
    );
  }
  return lines.join("\n");
}

export async function inlineCss(html: string): Promise<string> {
  try {
    const { default: juice } = await import("juice");
    return juice(html, {
      inlinePseudoElements: true,
      preserveImportant: true,
      resolveCSSVariables: false,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Missing dependency "juice" for CSS inlining. Install it first (e.g. "bun add juice" or "npm add juice"). Original error: ${detail}`
    );
  }
}

export function normalizeCssText(cssText: string, style: StyleConfig = DEFAULT_STYLE): string {
  return cssText
    .replace(/var\(--md-primary-color\)/g, style.primaryColor)
    .replace(/var\(--md-font-family\)/g, style.fontFamily)
    .replace(/var\(--md-font-size\)/g, style.fontSize)
    .replace(/var\(--blockquote-background\)/g, style.blockquoteBackground)
    .replace(/var\(--md-accent-color\)/g, style.accentColor)
    .replace(/var\(--md-container-bg\)/g, style.containerBg)
    .replace(/hsl\(var\(--foreground\)\)/g, "#3f3f3f")
    .replace(/--md-primary-color:\s*[^;]+;?/g, "")
    .replace(/--md-font-family:\s*[^;]+;?/g, "")
    .replace(/--md-font-size:\s*[^;]+;?/g, "")
    .replace(/--blockquote-background:\s*[^;]+;?/g, "")
    .replace(/--md-accent-color:\s*[^;]+;?/g, "")
    .replace(/--md-container-bg:\s*[^;]+;?/g, "")
    .replace(/--foreground:\s*[^;]+;?/g, "");
}

export function normalizeInlineCss(html: string, style: StyleConfig = DEFAULT_STYLE): string {
  let output = html;
  output = output.replace(
    /<style([^>]*)>([\s\S]*?)<\/style>/gi,
    (_match, attrs: string, cssText: string) =>
      `<style${attrs}>${normalizeCssText(cssText, style)}</style>`
  );
  output = output.replace(
    /style="([^"]*)"/gi,
    (_match, cssText: string) => `style="${normalizeCssText(cssText, style)}"`
  );
  output = output.replace(
    /style='([^']*)'/gi,
    (_match, cssText: string) => `style='${normalizeCssText(cssText, style)}'`
  );
  return output;
}

export function modifyHtmlStructure(htmlString: string): string {
  let output = htmlString;
  const pattern =
    /<li([^>]*)>([\s\S]*?)(<ul[\s\S]*?<\/ul>|<ol[\s\S]*?<\/ol>)<\/li>/i;
  while (pattern.test(output)) {
    output = output.replace(pattern, "<li$1>$2</li>$3");
  }
  return output;
}

export function removeFirstHeading(html: string): string {
  return html.replace(/<h[12][^>]*>[\s\S]*?<\/h[12]>/, "");
}
