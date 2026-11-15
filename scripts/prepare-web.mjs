import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const output = resolve(root, 'www');
const entries = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'update-manifest.json',
  'apple-touch-icon.png',
  'assets',
  'icons'
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of entries) {
  await cp(resolve(root, entry), resolve(output, entry), {
    recursive: true,
    force: true
  });
}

await cp(resolve(root, 'node_modules/@capacitor/core/dist'), resolve(output, 'vendor/capacitor-core'), { recursive: true, force: true });

console.log('NEXUS PLAYER web assets prepared in ./www');
