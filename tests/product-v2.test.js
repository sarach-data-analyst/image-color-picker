const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const readme = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');

function includes(pattern, label) {
  assert(
    html.includes(pattern),
    `Expected index.html to include ${label || pattern}`
  );
}

function matches(pattern, label) {
  assert(
    pattern.test(html),
    `Expected index.html to match ${label || pattern}`
  );
}

includes('id="savePalette"', 'palette save button');
includes('id="savedPalettes"', 'saved palette list');
includes('data-sexport="report"', 'accessibility report export');
includes('class="studio-hero"', 'modern Studio hero');
includes('class="studio-metric"', 'Studio metric chips');
includes('command-exports', 'Studio command actions');
includes('studio-command', 'premium command bar');
includes('palette-stage', 'palette-first stage');
includes('readiness-panel', 'export readiness panel');
includes('wheel-dock', 'supporting wheel dock');
includes('workspace-panel wheel-panel', 'modern wheel panel class');
includes('workspace-panel palette-panel', 'modern palette panel class');
includes('workspace-panel preview-panel', 'modern preview panel class');
includes('const STORAGE_KEY', 'localStorage key');
matches(/function serializeStudioState\(\)/, 'studio state serializer');
matches(/function applyStudioState\(state,\s*\{render\}=\{\}\)/, 'studio state applier');
matches(/function saveStudioPalette\(\)/, 'palette save function');
matches(/function renderSavedPalettes\(\)/, 'saved palette renderer');
matches(/function updateStudioHash\(\)/, 'URL hash writer');
matches(/function readStudioHash\(\)/, 'URL hash reader');
matches(/function colorDistance\(/, 'CVD color distance helper');
matches(/function conflictWarnings\(/, 'CVD conflict warnings');
matches(/function renderAccessibilityReport\(/, 'accessibility report panel renderer');
matches(/function sAccessibilityReport\(\)/, 'accessibility report exporter');
assert(
  !/\.readiness-panel\s*\{[^}]*position\s*:\s*sticky/.test(html),
  'Expected readiness panel not to be sticky because it shares a column with Tune harmony'
);
matches(/good:\s*sHexes\('cat'\)\[0\]/, 'BI good role in Theme JSON');
matches(/neutral:\s*sHexes\('div'\)\[Math\.floor/, 'BI neutral role in Theme JSON');
matches(/bad:\s*sHexes\('cat'\)\[2\]/, 'BI bad role in Theme JSON');
matches(/minimum:\s*sHexes\('seq'\)\[0\]/, 'BI minimum role in Theme JSON');
matches(/center:\s*sHexes\('div'\)\[Math\.floor/, 'BI center role in Theme JSON');
matches(/maximum:\s*sHexes\('seq'\)\[sHexes\('seq'\)\.length-1\]/, 'BI maximum role in Theme JSON');
assert(
  readme.includes('save palettes') &&
  readme.includes('share an exact Studio setup') &&
  readme.includes('Accessibility report'),
  'Expected README to document v2 workflow'
);
assert(
  sw.includes("const CACHE = 'color-picker-v8';"),
  'Expected service worker cache to be bumped for the v2 app shell'
);

console.log('product-v2 static checks passed');
