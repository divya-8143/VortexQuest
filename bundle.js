const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log('[Bundle] Combining TypeScript modules into browser bundle...');

// Strip TS annotations and imports for clean browser execution
function processTSFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Remove import/export statements
  content = content.replace(/^import\s+[\s\S]*?;/gm, '');
  content = content.replace(/^export\s+/gm, '');
  // Strip TypeScript type annotations
  content = content.replace(/:\s*[A-Za-z0-9_<>\[\]|&]+/g, '');
  content = content.replace(/as\s+[A-Za-z0-9_<>]+/g, '');
  content = content.replace(/public\s+/g, '');
  content = content.replace(/private\s+/g, '');
  content = content.replace(/protected\s+/g, '');
  content = content.replace(/readonly\s+/g, '');
  return content;
}

const fileOrder = [
  'types/GameTypes.ts',
  'utils/SaveSystem.ts',
  'engine/InputManager.ts',
  'engine/Camera2D.ts',
  'gameplay/Player.ts',
  'gameplay/Enemy.ts',
  'gameplay/QuestLog.ts',
  'world/WorldManager.ts',
  'engine/GameStateManager.ts',
  'engine/Canvas2DRenderer.ts',
  'main.ts'
];

let bundleCode = '(function() {\n';
fileOrder.forEach(fileRel => {
  const fullPath = path.join(srcDir, fileRel);
  if (fs.existsSync(fullPath)) {
    bundleCode += `\n// --- ${fileRel} ---\n`;
    bundleCode += processTSFile(fullPath);
  }
});
bundleCode += '\n})();\n';

fs.writeFileSync(path.join(distDir, 'bundle.js'), bundleCode, 'utf8');
console.log('[Bundle] Created dist/bundle.js successfully!');
