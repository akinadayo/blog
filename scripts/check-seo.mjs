import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.resolve(projectRoot, process.argv[2] || 'dist');
const site = new URL('https://neu-dev.net');
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function read(relativePath) {
  const filePath = path.join(outputRoot, relativePath);
  check(fs.existsSync(filePath), `missing: ${relativePath}`);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function count(html, pattern) {
  return (html.match(pattern) || []).length;
}

function attribute(html, pattern) {
  return html.match(pattern)?.[1] || '';
}

function routeFromHtmlFile(relativePath) {
  if (relativePath === 'index.html') return '/';
  return `/${relativePath.replace(/\/index\.html$/, '')}/`;
}

function collectIndexFiles(directory = outputRoot) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectIndexFiles(absolute);
    if (entry.name !== 'index.html') return [];
    return [path.relative(outputRoot, absolute)];
  });
}

function localTargetExists(href) {
  const url = new URL(href, site);
  if (url.origin !== site.origin) return true;

  const pathname = decodeURIComponent(url.pathname);
  const candidates = pathname.endsWith('/')
    ? [path.join(outputRoot, pathname, 'index.html')]
    : [
        path.join(outputRoot, pathname),
        path.join(outputRoot, `${pathname}.html`),
        path.join(outputRoot, pathname, 'index.html'),
      ];
  return candidates.some((candidate) => fs.existsSync(candidate));
}

check(fs.existsSync(outputRoot), `build output not found: ${outputRoot}`);
if (!fs.existsSync(outputRoot)) {
  console.error(failures.join('\n'));
  process.exit(1);
}

const htmlFiles = collectIndexFiles().sort();
const pageRecords = [];
const redirectRecords = [];

for (const relativePath of htmlFiles) {
  const html = read(relativePath);
  const route = routeFromHtmlFile(relativePath);
  const redirectTarget = attribute(html, /<meta http-equiv="refresh" content="0;url=([^"]+)"/i);

  if (redirectTarget) {
    const canonical = attribute(html, /<link rel="canonical" href="([^"]*)"/);
    const robots = attribute(html, /<meta name="robots" content="([^"]*)"/);
    const absoluteTarget = new URL(redirectTarget, site).href;

    check(robots.includes('noindex'), `${route}: redirect page must be noindex`);
    check(canonical === absoluteTarget, `${route}: redirect canonical must match its target`);
    check(localTargetExists(redirectTarget), `${route}: redirect target is missing (${redirectTarget})`);
    check(
      html.includes(`href="${redirectTarget}"`),
      `${route}: redirect page must contain a crawlable target link`,
    );
    redirectRecords.push({ route, canonical: absoluteTarget });
    continue;
  }

  const expectedCanonical = new URL(route, site).href;
  const title = attribute(html, /<title>(.*?)<\/title>/s);
  const description = attribute(html, /<meta name="description" content="([^"]*)"/);
  const canonical = attribute(html, /<link rel="canonical" href="([^"]*)"/);
  const robots = attribute(html, /<meta name="robots" content="([^"]*)"/);
  const ogTitle = attribute(html, /<meta property="og:title" content="([^"]*)"/);
  const ogDescription = attribute(html, /<meta property="og:description" content="([^"]*)"/);
  const ogUrl = attribute(html, /<meta property="og:url" content="([^"]*)"/);
  const ogImage = attribute(html, /<meta property="og:image" content="([^"]*)"/);
  const twitterCard = attribute(html, /<meta name="twitter:card" content="([^"]*)"/);
  const twitterTitle = attribute(html, /<meta name="twitter:title" content="([^"]*)"/);
  const twitterDescription = attribute(html, /<meta name="twitter:description" content="([^"]*)"/);
  const twitterImage = attribute(html, /<meta name="twitter:image" content="([^"]*)"/);
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];

  check(count(html, /<title>/g) === 1, `${route}: title count must be 1`);
  check(title.length > 8, `${route}: title is too vague or empty`);
  check(count(html, /<meta name="description"/g) === 1, `${route}: description count must be 1`);
  check(description.length >= 40, `${route}: description is too short`);
  check(count(html, /<link rel="canonical"/g) === 1, `${route}: canonical count must be 1`);
  check(canonical === expectedCanonical, `${route}: canonical mismatch (${canonical})`);
  check(!robots.includes('noindex'), `${route}: indexable page contains noindex`);
  check(count(html, /<h1(?:\s|>)/g) === 1, `${route}: H1 count must be 1`);
  check(html.includes('<html lang="ja">'), `${route}: html lang must be ja`);
  check(ogTitle === title, `${route}: og:title must match title`);
  check(ogDescription === description, `${route}: og:description must match description`);
  check(ogUrl === canonical, `${route}: og:url must match canonical`);
  check(ogImage.startsWith(site.origin + '/'), `${route}: og:image must be an absolute apex URL`);
  check(localTargetExists(ogImage), `${route}: og:image is missing (${ogImage})`);
  check(twitterCard === 'summary_large_image', `${route}: twitter card must be summary_large_image`);
  check(twitterTitle === title, `${route}: twitter:title must match title`);
  check(twitterDescription === description, `${route}: twitter:description must match description`);
  check(twitterImage === ogImage, `${route}: twitter:image must match og:image`);
  check(jsonLd.length >= 1, `${route}: JSON-LD is missing`);

  for (const block of jsonLd) {
    try {
      JSON.parse(block[1]);
    } catch {
      failures.push(`${route}: JSON-LD is invalid JSON`);
    }
  }

  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const href = match[1];
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    check(localTargetExists(href), `${route}: broken internal link ${href}`);
  }

  for (const match of html.matchAll(/<img\b([^>]*)>/g)) {
    const attributes = match[1];
    const src = attributes.match(/\bsrc="([^"]+)"/)?.[1] || '';
    check(/\balt="[^"]*"/.test(attributes), `${route}: image is missing alt (${src})`);
    if (src.startsWith('/')) check(localTargetExists(src), `${route}: image is missing (${src})`);
  }

  pageRecords.push({ route, title, description, canonical });
}

check(new Set(pageRecords.map((page) => page.title)).size === pageRecords.length, 'page titles must be unique');
check(new Set(pageRecords.map((page) => page.description)).size === pageRecords.length, 'page descriptions must be unique');

const robotsText = read('robots.txt');
check(
  robotsText === 'User-agent: *\nAllow: /\n\nSitemap: https://neu-dev.net/sitemap.xml\n',
  'robots.txt content is unexpected',
);

const sitemap = read('sitemap.xml');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const canonicalUrls = pageRecords.map((page) => page.canonical);
for (const redirect of redirectRecords) {
  check(canonicalUrls.includes(redirect.canonical), `${redirect.route}: redirect target is not an indexable canonical page`);
}
check(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'sitemap XML declaration is missing');
check(sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), 'sitemap root is invalid');
check(new Set(sitemapUrls).size === sitemapUrls.length, 'sitemap contains duplicate URLs');
check(
  sitemapUrls.length === canonicalUrls.length && canonicalUrls.every((url) => sitemapUrls.includes(url)),
  'sitemap URL set does not match indexable pages',
);
for (const match of sitemap.matchAll(/<lastmod>(.*?)<\/lastmod>/g)) {
  check(!Number.isNaN(Date.parse(match[1])), `sitemap has invalid lastmod: ${match[1]}`);
}

const rss = read('rss.xml');
const rssLinks = [...rss.matchAll(/<item>.*?<link>(.*?)<\/link>/gs)].map((match) => match[1]);
const articleUrls = canonicalUrls.filter((url) => /\/(tech|diary)\/.+\/$/.test(new URL(url).pathname));
check(rss.includes('<rss version="2.0"'), 'RSS root is invalid');
check(rssLinks.length === articleUrls.length, 'RSS item count does not match article count');
check(rssLinks.every((url) => articleUrls.includes(url)), 'RSS contains a non-canonical article URL');
for (const redirect of redirectRecords) {
  const sourceUrl = new URL(redirect.route, site).href;
  check(!sitemapUrls.includes(sourceUrl), `${redirect.route}: redirect source must not be in sitemap`);
  check(!rssLinks.includes(sourceUrl), `${redirect.route}: redirect source must not be in RSS`);
}

const notFound = read('404.html');
check(/<meta name="robots" content="noindex, nofollow"/.test(notFound), '404 page must be noindex');
check(count(notFound, /<h1(?:\s|>)/g) === 1, '404 page H1 count must be 1');

if (failures.length) {
  console.error(`SEO check failed (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`SEO check passed: ${pageRecords.length} pages, ${articleUrls.length} articles, ${rssLinks.length} RSS items, ${redirectRecords.length} redirect`);
