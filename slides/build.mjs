#!/usr/bin/env node
// Build static site and strip mermaid references from generated HTML.
// Usage:
//   node build.mjs           — generates _site/
//   node build.mjs --single  — also produces presentation.html (single file)
//   node build.mjs --pdf     — also produces presentation.pdf at slide dimensions
//   node build.mjs --deploy  — builds and pushes _site/ to the gh-pages branch

import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const single = process.argv.includes('--single');
const pdf    = process.argv.includes('--pdf');
const deploy = process.argv.includes('--deploy');

execSync('npx reveal-md slides.md --static _site --static-dirs assets', {
  stdio: 'inherit',
});

const htmlPath = '_site/index.html';
let html = readFileSync(htmlPath, 'utf8');

// Remove the mermaid script tag
html = html.replace(/\n\s*<script src="\.\/mermaid\/dist\/mermaid\.min\.js"><\/script>\n/, '\n');

// Remove the mermaid initialisation block
html = html.replace(
  /\n\s*<script>\n\s*const mermaidOptions[\s\S]*?<\/script>/,
  ''
);

// Fix the highlight selector — no longer needs to exclude .mermaid
html = html.replace(
  `querySelectorAll('pre code:not(.mermaid)')`,
  `querySelectorAll('pre code')`
);

writeFileSync(htmlPath, html);
console.log('Stripped mermaid references from', htmlPath);

if (single) {
  execSync('npx inliner _site/index.html > presentation.html', {
    stdio: 'inherit',
    shell: true,
  });
  console.log('Single-file presentation written to presentation.html');
}

if (pdf) {
  // Serve _site/ locally, then use puppeteer with exact slide dimensions.
  const server = spawn('npx', ['serve', '_site', '-p', '7654'], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1500)); // wait for server to start

  const puppeteer = (await import('./node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js')).default;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:7654/?print-pdf', { waitUntil: 'networkidle0' });
  await page.pdf({
    path: 'presentation.pdf',
    width: '1280px',
    height: '800px',
    printBackground: true,
  });
  await browser.close();
  server.kill();
  console.log('PDF written to presentation.pdf');
}

if (deploy) {
  const ghpages = (await import('./node_modules/gh-pages/lib/index.js')).default;
  await ghpages.publish('_site', { dotfiles: true });
  console.log('Published to gh-pages branch.');
}
